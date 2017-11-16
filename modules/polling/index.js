var async = require('async');
var schedule = require("node-schedule");　　
var amqp = require('amqplib/callback_api');
var sprintf = require('sprintf-js').sprintf;
var mqtt = require('mqtt');

var utilcomm = require('../../routes/resource/util');
var pollingcb = require('../../routes/resource/mq/polling');

var	job,
	is_running=false,
	nodes=[],
	amqp_conn,
	amqp_chanel;

var init = function() {
	getPollingNEs()
	.then(function(rows){
		nodes = rows;
		return initStart();
	})
	.then(function() {
		log.debug("polling job started");
		return true;
	})
	.catch(function(err){
		log.error('polling job start failed: ', err);
		return false;
	})
	.then(function(pollintStarted) {
		if(pollintStarted) {
			return registerListener();
		}
	})
	.catch(function(err){
		log.error('polling registerListener failed: ', err);
	});
}

function getPollingNEs(neids) {
	var sql = "select 'polling' as poll_type, neid, ipaddress as hostname, poll_enabled, poll_interval, 0 as poll_div, \
		poll_protocol, south_protocol, proto_param from res_ne where south_protocol in (1, 3)"; 
	if(neids) {
		sql = sql + " and neid in (" + neids.join(',') + ")";
	}
	return utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		for(var i in rows) {
			let type = 'SNMP';
			switch(rows[i].poll_protocol) {
				case 0:
					type = 'ICMP';
					break;
				case 1:
					type = 'SNMP';
					break;
				case 3:
					type = 'NETCONF';
					break;
			}
			
			if(rows[i].south_protocol == rows[i].poll_protocol) {
				let templateParsed = JSON.parse(rows[i].proto_param);
				rows[i].polling_templates = [{type: type, config: templateParsed}];
			} else {
				let defaultTemplate;
				if(type == 'ICMP') {
					defaultTemplate = {
						type: type, 
						config: {timeout: 5, retries: 1}
					};
				} else if(type == 'NETCONF') {
					defaultTemplate = {
						type: type, 
						config: {timeout: 5, retries: 1, user: 'admin', password: 'admin', port: 83}
					};
				} else {
					defaultTemplate = {
						type: type, 
						config: {timeout: 5, retries: 1, community_read: 'public', community_write: 'private',
							version: 2, port: 161}
					};
				}
				rows[i].polling_templates = [defaultTemplate];
			}

			delete rows[i].poll_protocol;
			delete rows[i].south_protocol;
			delete rows[i].proto_param;

			var ability = {
				protocol: type,
				call_type: "static"
			};
			switch(type) {
				case 'ICMP':
					ability.name = 'icmpPing';
		            break;
				case 'SNMP':
					ability.name = 'snmpPing';
					break;
				case 'NETCONF':
					ability.name = 'netconfDiscovery';
					break;
			}
			rows[i].node_abilities = [ability];
		}

		return rows;
	})
}

async function initStart() {
   	log.debug("try to start polling job:");
   	for (let node of nodes) {
	   	log.debug('neid:', node.neid , 'hostname:', node.hostname, 
	   		'poll_enabled:', node.poll_enabled, 'poll_interval:', node.poll_interval,
	   		'poll_protocol:', node.node_abilities[0].protocol);
   	}

	var amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	amqp_conn = await amqp_connect_promise(amqp_url);
	amqp_chanel = await amqp_createChannel_promise(amqp_conn);
   	
	job = schedule.scheduleJob({rule: '0 * * * * *' }, function() {
		log.debug('polling timespot here');
		var secs = parseInt(Date.now() / 1000) + 10;
	    for (let node of nodes) {
	    	if(node.poll_enabled == 0) {
	    		log.trace('timespot jumpover, poll_enabled=0, neid:', node.neid , 'hostname:', node.hostname);
	    		continue;
	    	}

	    	if(node.poll_interval == 0) {
	    		log.trace('timespot jumpover, poll_interval=0, neid:', node.neid , 'hostname:', node.hostname);
	    		continue;
	    	}
			var div = parseInt( secs / node.poll_interval );
			// if(node.poll_div == 0) {
			// 	log.trace('timespot jumpover, first timespot, neid:', node.neid , 'hostname:', node.hostname);
			// 	node.poll_div = div;
			// 	continue;
			// }
			if(div > node.poll_div) {
				node.timestamp = secs;
				node.queueName = 'nepoll_result';

				var jstr = JSON.stringify(node);
		    	amqp_send("polling_task", jstr);
				log.debug('polling neid:', node.neid , 'hostname:', node.hostname, 'poll_interval:', node.poll_interval, 
					'poll_div:', node.poll_div, 'spot_div:', div, ', commit polling task:', jstr);

				node.poll_div = div;
			} else {
				log.trace('timespot jumpover, not my timespot, neid:', node.neid , 'hostname:', node.hostname, 
					'poll_interval:', node.poll_interval, 'both poll_div and spot_div:', div);
			}
		}
	});

	pollingcb.prepare();

	if(job) {
		log.debug('polling successfully scheduled');
		is_running = true;
	} else {
		log.error('polling scheduled failed');
	}
}

function registerListener() {
	APP.mqtt_client.subscribe('resource');
	log.debug('polling registerListener ok');

	APP.mqtt_client.on('message', function(topic, message) {
		if(topic != 'resource') { return; }

		var msg = JSON.parse(message.toString());
		if(msg.type != 'ne') { return; }

		if(msg.operation == 'add' || msg.operation == 'modify' || msg.operation == 'delete') {
			log.debug('polling recevied a msg', msg);
		} else {
			return;
		}

		if(msg.operation == 'add') {
			getPollingNEs(msg.datas)
			.then(function(rows){
				let nesAdd = rows;
				nodes = nodes.concat(nesAdd);
				for(let oneNEAdded of nesAdd) {
					log.debug(JSON.stringify(oneNEAdded), 'polling auto scheduled');
				}
			})
			.catch(function(err){
				log.error('polling on add: ', err);		
			});
			return;
		}

		if(msg.operation == 'modify') {
			let modifiedNeIDs = msg.datas.map(function(neInfo) {
				return neInfo.neid;
			});

			getPollingNEs(modifiedNeIDs)
			.then(function(nesModified){
				modifyMore(nesModified);
			})
			.catch(function(err){
				log.error('polling on modify: ', err);		
			});
			return;
		}

		if(msg.operation == 'delete') {
			let deletedNeIDs = msg.datas.map(function(neInfo) {
				return neInfo.neid;
			});

			modify(deletedNeIDs.join(','), 0);
			log.debug('polling deleted ne ids:', deletedNeIDs);
			return;
		}
	});
}

function amqp_send(topic, payload) {
    var queueName = topic;
    amqp_chanel.assertQueue(queueName, {durable: false});
    amqp_chanel.sendToQueue(queueName, new Buffer(payload));
}

function amqp_createChannel_promise(amqp_conn) {
	return new Promise(function(resolve, reject) {
		amqp_conn.createChannel(function(err, mq_ch) {
			if(err) {
				reject(err);
			}
			resolve(mq_ch);
		});
	});
}

function amqp_connect_promise(amqp_url) {
	return new Promise(function(resolve, reject) {
		amqp.connect(amqp_url, function(err, mq_conn) {
			if(err) {
				reject(err);
			}
	        resolve(mq_conn);
		});
	});
}

var start = function(app1) {
   	if (is_running) {
   		log.debug("polling job is already running!");
   	} else {
   		init(app1);
	}
}

var modify = function(neids, poll_interval) {
	let indicesUpdated = [];
	let indicesDisabled = [];

	var arrNeids = neids.split(',');
	for(var j in arrNeids) {
		for(var i in nodes) {
			if(nodes[i].neid == arrNeids[j]) {
				if(poll_interval == 0) {
					nodes[i].poll_enabled = 0;
					indicesDisabled.push(i);
				} else {
					nodes[i].poll_enabled = 1;
					nodes[i].poll_interval = poll_interval;
					indicesUpdated.push(i);
				}
				break;
			}
		}
	}

	for(let index of indicesUpdated) {
		log.debug('polling enabled and period modified', JSON.stringify(nodes[index]));
	}

	for(let index of indicesDisabled) {
		log.debug('polling disabled', JSON.stringify(nodes[index]));
	}
}

function modifyMore(nesModified) {
	// console.log('nesModified', nesModified);
	// console.log('nodes', nodes);

	let indicesUpdated = [];
	for(let oneNEModified of nesModified) {
		for(var i in nodes) {
			if(nodes[i].neid == oneNEModified.neid) {
				nodes[i].hostname = oneNEModified.hostname;
				nodes[i].poll_enabled = oneNEModified.poll_enabled;
				nodes[i].poll_interval = oneNEModified.poll_interval;
				nodes[i].node_abilities = oneNEModified.node_abilities;
				nodes[i].polling_templates = oneNEModified.polling_templates;

				indicesUpdated.push(i);
				break;
			}
		}
	}
	for(let index of indicesUpdated) {
		log.debug('polling period modified', JSON.stringify(nodes[index]));
	}
}

var stop = function() {
   	if (is_running) {
	   	log.debug("stop polling job");
	   	job.cancel();
   		is_running = false;
	} else {
	   	log.debug("polling job is already not running!");
	}

	try {
		if(amqp_chanel) {
			amqp_chanel.close(function() {
				amqp_conn.close(function() {
				})
			})
		}
	} catch(err) {
		log.error(err);
	}
}

var status = function() {
   log.debug("job running status:", is_running );
   return is_running;
}

exports.init = init;
exports.start = start;
exports.stop = stop;
exports.status = status;
exports.modify = modify;
