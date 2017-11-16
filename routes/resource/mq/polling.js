
var sprintf = require("sprintf-js").sprintf;
var async = require('async');
var amqp = require('amqplib');

var request = require('request');
const util = require('util');
var utilcomm = require('../util');

var alarmSysURL;
var isInited = false;
var connRestPolling;

function prepare() {
	if(isInited) { return; }
	let amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	amqp.connect(amqp_url)
	.then(function(conn) {
		return conn.createChannel()
		.then(function(ch) {
			isInited = true;
			return ch.assertQueue('nepoll_result', {durable: false})
			.then(function() { ch.prefetch(1); })
			.then(function() { ch.consume('nepoll_result', doWork, {noAck: false}); });

			function doWork(message) {
				msg = JSON.parse(message.content);
				log.debug('nepoll result come in', msg.hostname);

				APP.dbpool_promise.getConnection()
				.then(function(conn) {
					connRestPolling = conn;
					return disposeNEPollingResult(msg);
				})
				.catch(function(err) {
					log.error('dispose nepoll result error:', err);
				})
				.then(function() {
					try {
						APP.dbpool_promise.releaseConnection(connRestPolling);
					} catch(err) {
						log.error('dispose nepoll result, release mysql connection error:', err);
					};
				})
				.then(function() {
					ch.ack(message);
				});
			};
		});
	})
	.catch(function(err) {
		log.error('nepoll cb error:', err);
	});
}

async function disposeNEPollingResult(msg) {
	let isOnline = 0;
	let abs = msg.node_abilities;
	for(let ability in abs) {
		if(ability == 'icmpPing') {
			if(abs[ability].ping_ok == true) {
				isOnline = 1;
			}
			break;
		}

		if(ability == 'snmpPing') {
			if(abs[ability].success == true) {
				isOnline = 1;
			}
			break;
		}
		
		if(ability == 'netconfDiscovery') {
			if(abs[ability].success == true) {
				isOnline = 1;
			}
			break;
		}
	}

	let neid = msg.neid;
	let sql1 = sprintf("update res_ne set resourcestate = %d WHERE neid = %d and resourcestate != %d", 
		isOnline, neid, isOnline);
	let sql2 = sprintf("update res_ne set last_polling_time = '%s', \
		last_polling_duration = %1.4f, \
		last_polling_result = '%s' WHERE neid = %d", 
		msg.startTime,
		msg.durationTime,
		JSON.stringify(msg),
		neid);
	log.trace(sql1);
	let rowsUpdate = await connRestPolling.query(sql1 + ';' + sql2);

	let row1 = rowsUpdate[0];
	// console.log('update res_ne result:', row1);
	if(row1.changedRows > 0) {
		log.debug('disposePollResult, update res online status to', isOnline, 'neid=', neid);
		let msg1 = {
			operation: 'online_status_change',
			source: 'res',
			type: 'ne',
			datas: [neid]
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg1));
		APP.mqtt_client.publish('resource', JSON.stringify(msg1));

		// alarm_type_id为1的告警类型名为“设备脱网”
		// iStatus 1:恢复 2:新产生
		msg1 = {
			iRCAlarmID: 0,
			alarm_type_id: 1,
			iStatus: isOnline?1:2,
			strDesc: '',
			url: '/ne='+neid,
			strLocation: '',
			iRCNetNodeID: neid
		};
		await postAlarm(msg1);
	}

	let sql = sprintf("update topo_symbol set status_is_ping_ok=%d where ne_id=%d and status_is_ping_ok!=%d", 
		isOnline, neid, isOnline);
	log.trace(sql);
	let row2 = await connRestPolling.query(sql);

	// console.log('update topo_symbol result:', row2);
	if(row2.changedRows > 0) {
		log.debug('disposePollResult, update topo online status to', isOnline, 'neid=', neid);
		let msg2 = {
			operation: 'online_status_change',
			source: 'res',
			type: 'node',
			datas: [{neid: neid}]
		};
		// log.debug('broadcast topo msg: ', JSON.stringify(msg2));
		APP.mqtt_client.publish('topo', JSON.stringify(msg2));
	}
}

async function postAlarm(msg) {
	try {
		if(!alarmSysURL) {
			alarmSysURL = await getSubSysURL('alarm');
			log.debug('disposeNEPollingResult, update alarmSysURL', alarmSysURL);
		}
		
		var options = {
			url: alarmSysURL+'/alarm/addAlarm',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': JSON.stringify(msg).length
			},
			body: JSON.stringify(msg)
		};
		log.debug('disposeNEPollingResult, postAlarm message', options);
		request.post(options, function(err, response, data){
			if (!err && response.statusCode == 200) {
				var body = JSON.parse(data);
				log.trace('disposeNEPollingResult, postAlarm ok, returned msg:', body);
			} else {
				log.error('disposeNEPollingResult, postAlarm failed:', err);
			}
		});
	} catch(err) {
		log.error('disposeNEPollingResult, postAlarm failed:', err);
	};
}

function getSubSysURL(subsysname) {
	let url = 'http://127.0.0.1:60001/sysmng/process';
	try {
		url = 'http://'+ APP.config.processes.sysmng.host + ':' 
		+ APP.config.processes.sysmng.port + '/sysmng/process';
	} catch(err) {
		log.error('disposeNEPollingResult, getSubSysURL', err.message);
	}

	return util.promisify(request.get)({url: url})
		.then(function(response) {
			if (response.statusCode == 200) {
				var body = JSON.parse(response.body);
				var goalSysInfo;

				for(var i=0; i<body.process_instance.length; i++) {
					if(body.process_instance[i].subsys_name == subsysname) {
						goalSysInfo = body.process_instance[i];
						break;
					}
				}
				
				if(goalSysInfo) {
					return 'http://' + goalSysInfo.ip + ':' + goalSysInfo.port;
				}
			} else {
				Promise.reject('getProcess from SysMng failed, error code:' + response.statusCode);
			}
		});
}

exports.prepare = prepare;