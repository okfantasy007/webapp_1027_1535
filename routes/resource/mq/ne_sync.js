var sprintf = require("sprintf-js").sprintf;
var async = require('async');
var amqp = require('amqplib');

var utilcomm = require('../util');
var abilityConfig = require('../abilities').config;
var abilityDisposer = require('../abilities/disposer');
var abilityParser = require('../abilities/parser');

const NE_UPDATE_COL = new Set(['software_ver', 'hardware_ver']);
const CARD_UPDATE_COL = new Set(['software_ver', 'hardware_ver', 'firmware_ver']);
const PORT_UPDATE_COL = new Set(['adminstatus', 'operstatus', 'max_speed', 'speed', 'duplex', 'jumboframe', 'mtu']);

const SYNC_STATUS_WORKING = 2, SYNC_STATUS_DONE = 3, SYNC_STATUS_FAILED = 4, SYNC_STATUS_DIFFING = 5;

var isInited = false;
var connRestNESync;

function assembleTask(neid) {
	let sql = sprintf("select 'ressync' as poll_type, n.neid, n.ipaddress as hostname, \
			n.south_protocol, n.proto_param, nt.abilities \
			from res_ne n, res_ne_type nt \
			where n.neid = %d and n.netypeid=nt.netypeid", neid); 
	return utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		if(rows.length == 0) {
			return Promise.reject('wrong ne id:' + neid);
		}
		let theRow = rows[0];

		let type;
		switch(theRow.south_protocol) {
			case 1:
				type = 'SNMP';
				break;
			// case 3: // 尚不支持对NETCONF设备的资源同步
			// 	type = 'NETCONF';
			// 	break;
		}
		if(!type) {
			return Promise.reject('wrong south_protocol:', theRow.south_protocol);
		}
		delete theRow.south_protocol;

		let templateConfig = JSON.parse(theRow.proto_param);
		if(!templateConfig) {
			return Promise.reject('proto_param is null for ne id:' + theRow.neid);
		}
		theRow.polling_templates = [];
		theRow.polling_templates.push({type: type, Config: templateConfig});
		delete theRow.proto_param;

		let abilities = JSON.parse(theRow.abilities);
		if(!abilities) {
			return Promise.reject('abilities is null for ne id:' + theRow.neid);
		}
		delete theRow.abilities;

		if(!abilities.res) {
			return Promise.reject("abilities format error for ne id:" + theRow.neid);
		}
		theRow.node_abilities = [];
		for(let abiliName of abilities.res) {
			let match = abilityConfig[abiliName];
			if(match) {
				match.name = abiliName;
				match.call_type = 'extend';
				match.protocol = type;
				theRow.node_abilities.push(match);
			}
		}

		theRow.queueName = 'ressync_result';
		theRow.timestamp = parseInt(Date.now() / 1000);

		return theRow;
	});
}

function startNESyncTask(neid) {
	return assembleTask(neid)
	.then(function(task) {
		prepare();
		return utilcomm.sendToQueue('polling_task', JSON.stringify(task), 'ne_sync dispatch sync task');
	})
	.then(function() {
		let sql = sprintf("update res_ne set last_res_sync_begin_time = CURRENT_TIMESTAMP, \
			last_sync_status = %d, last_res_sync_end_time = null where neid = %d", SYNC_STATUS_WORKING, neid);
		return utilcomm.promiseSimpleQuery(sql);
	})
	.then(function() {
		let msg = {
			operation: 'sync_start',
			source: 'res',
			type: 'ne',
			datas: [neid]
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));
	})	
}

function prepare() {
	if(isInited) { return; }
	let amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	amqp.connect(amqp_url)
	.then(function(conn) {
		return conn.createChannel()
		.then(function(ch) {
			isInited = true;
			return ch.assertQueue('ressync_result', {durable: false})
			.then(function() { ch.prefetch(1); })
			.then(function() { ch.consume('ressync_result', doWork, {noAck: false}); });

			function doWork(message) {
				msg = JSON.parse(message.content);
				log.debug('ressync result come in', msg.hostname);

				APP.dbpool_promise.getConnection()
				.then(function(conn) {
					connRestNESync = conn;
					return disposeNESyncResult(msg);
				})
				.catch(function(err) {
					log.error('dispose ressync result error:', err);
				})
				.then(function() {
					try {
						APP.dbpool_promise.releaseConnection(connRestNESync);
					} catch(err) {
						log.error('dispose ressync result, release mysql connection error:', err);
					};
				})
				.then(function() {
					ch.ack(message);
				});
			};
		});
	})
	.catch(function(err) {
		log.error('ressync cb error:', err);
	});
}

async function disposeNESyncResult(msg) {
	let flag = true;
	try {
		log.debug('ne sync result come in, neid', msg.neid);
		let abilityNameInOrder = await getAbilityInDefinedOrder(msg.neid);
		for(let abiliName of abilityNameInOrder) {
			let oneResultAbility = msg.node_abilities[abiliName];
			if(oneResultAbility.success) {
				let correspondingConfig = abilityConfig[abiliName];
				if(!correspondingConfig.dispose)
					continue;

				await parseResultAbility(oneResultAbility, correspondingConfig);

				let funcDispose = abilityDisposer.dispose[correspondingConfig.dispose];
				if(!funcDispose) {
					log.error("disposeNESyncResult, no dispose function found for", correspondingConfig.dispose);
					continue;
				}

				let disposed = await funcDispose(msg.neid, oneResultAbility.records);
				if(!disposed) {
					log.error("disposeNESyncResult, function" + correspondingConfig.dispose + "returned" + disposed);
					continue;
				}

				let funcProcess = processDisposed(disposed);
				if(!funcProcess) {
					log.error("disposeNESyncResult, no process function found for", disposed.class);
					continue;
				}
				await funcProcess(disposed.info);
			} else {
				flag = false;
				log.error(sprintf("disposeNESyncResult, ability %s read failed, reason: %s", 
					abiliName, oneResultAbility.errmsg));
			}
		}
	} catch (err) {
		flag = false;
		log.error('disposeNESyncResult error:', err);
	}

	let sql = sprintf("update res_ne set last_res_sync_end_time = CURRENT_TIMESTAMP, last_sync_status = %d where neid = %d", 
		flag ? SYNC_STATUS_DONE : SYNC_STATUS_FAILED, msg.neid);
	await connRestNESync.query(sql)
	.catch(function(err) {
		log.error('disposeNESyncResult, udpate res_ne error:', err);
	});

	// 发送资源同步结束消息
	var msg = {
		operation: 'sync_end',
		source: 'res',
		type: 'ne',
		datas: [{
			neid: msg.neid, 
			success: flag
		}]
	};
	// log.debug('broadcast resource msg: ', JSON.stringify(msg));
	APP.mqtt_client.publish('resource', JSON.stringify(msg), function(err) {
		if(err) {
			log.error('disposeNESyncResult, sync_end msg publish failed,', err);
		}
	});
}

async function getAbilityInDefinedOrder(neid) {
	let sql = sprintf("select nt.abilities from res_ne n, res_ne_type nt \
			where n.neid = %d and n.netypeid=nt.netypeid", neid); 
	let rows = await connRestNESync.query(sql);

	if(rows.length == 0) {
		await Promise.reject('wrong ne id: ' + neid);
	}

	let theRow = rows[0];
	return JSON.parse(theRow.abilities).res;
}

async function parseResultAbility(resultAbility, abilityConfig) {
	for(var instance in resultAbility.records) {
		var oneRecord = resultAbility.records[instance];

		for(var logicName in oneRecord) {
			var parse = abilityConfig.mibnodes[logicName].parse;
			if(!parse)
				continue;

			var funcParse = abilityParser.parse[parse];
			oneRecord[logicName] = await funcParse(oneRecord[logicName]);
		}
	}	
}

function processDisposed(result) {
	switch(result.class) {
		case 'ne':
			return processNEInfo;
		case 'chassis':
			return processChassisinfo;
		case 'card':
			return processCardinfo;
		case 'port':
			return processPortinfo;
		default:
			return undefined;
	}
}

//the content format of info:  {neid: xx, columnName1: yy, ...}
async function processNEInfo(info) {
	console.log('processNEInfo, neid:', info.neid);
	let toSet = "";
	for(let columnName in info) {
		if(NE_UPDATE_COL.has(columnName)) {
			toSet += sprintf(",%s='%s'", columnName, info[columnName]);
		}
	}
	if(toSet.length == 0) {
		//log
		return;
	}
	toSet = toSet.substring(1);

	let sql = sprintf("update res_ne set %s where neid=%d", toSet, info.neid);
	await connRestNESync.query(sql);
}

//the content format of info:  [{chassis_id: xx, columnName1: yy, ...}]
async function processChassisinfo(info) {
	console.log('processChassisinfo, neid:', info[0].neid);
	if(info.length == 0) {
		return;
	}

	let sql = sprintf("select * from res_chassis where neid=%d", info[0].neid);
	let rows = await connRestNESync.query(sql);

	let insertRows = [];
	let insertChassisIDs = [];
	let updateOnlineChassisIDs = [];
	for(let oneChassis of info) {
		let existed = false;
		let oneExistedChassis;
		for(oneExistedChassis of rows) {
			if(oneChassis.chassis_id == oneExistedChassis.chassis_id) {
				existed = true;
				break;
			}
		}
		if(existed) {
			if(oneExistedChassis.isexisting == 0) {
				updateOnlineChassisIDs.push(oneExistedChassis.chassis_id);
			}
		} else {
			let oneRow = sprintf("('%s', %d, %d, '%s', '%s', '%s', '%s', %d, 1, CURRENT_TIMESTAMP)", 
				oneChassis.chassis_id, oneChassis.neid, oneChassis.chassis_index, 
				oneChassis.chassis_name, oneChassis.chassis_name, oneChassis.chassis_fix_name, oneChassis.desc_info,
				oneChassis.chassis_type_id);
			insertRows.push(oneRow);
			insertChassisIDs.push(oneChassis.chassis_id);
		}
	}

	if(insertRows.length > 0) {
		sql = sprintf("insert into res_chassis(chassis_id, neid, chassis_index, chassis_name, userlabel, chassis_fix_name, \
			desc_info, chassis_type_id, isexisting, update_time) values %s", insertRows.join(','));
		// console.log(sql);
		let result = await connRestNESync.query(sql);
		// console.log(JSON.stringify(result));
		let msg = {
			operation: 'add',
			source: 'res',
			type: 'chassis',
			datas: insertChassisIDs
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));
	}

	if(updateOnlineChassisIDs.length > 0) {
		sql = sprintf("update res_chassis set isexisting = 1 and update_time= CURRENT_TIMESTAMP where chassis_id in ('%s')", 
			updateOnlineChassisIDs.join("','"));
		let result = await connRestNESync.query(sql);
		let msg = {
			operation: 'online_status_change',
			source: 'res',
			type: 'chassis',
			datas: updateOnlineChassisIDs
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));		
	}

	let updateOfflineChassisIDs = [];
	for(let oneExistedChassis of rows) {
		let alsoExistInDigResult = false;
		for(let oneChassis of info) {
			if(oneExistedChassis.chassis_id == oneChassis.chassis_id) {
				alsoExistInDigResult = true;
				break;
			}
		}

		if(!alsoExistInDigResult && oneExistedChassis.isexisting == 1) {
			updateOfflineChassisIDs.push(oneExistedChassis.chassis_id);
		}
	}

	if(updateOfflineChassisIDs.length > 0) {
		sql = sprintf("update res_chassis set isexisting = 0 where chassis_id in ('%s')", 
			updateOfflineChassisIDs.join("','"));
		let result = await connRestNESync.query(sql);
		let msg = {
			operation: 'online_status_change',
			source: 'res',
			type: 'chassis',
			datas: updateOfflineChassisIDs
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));		
	}
}

async function processCardinfo(info) {
	console.log('processCardinfo, neid:', info[0].neid);
	if(info.length == 0) {
		return;
	}
	
	let sql = sprintf("select * from res_card where neid=%d", info[0].neid);
	let rows = await connRestNESync.query(sql);

	let insertRows = [];
	let insertCardIDs = [];
	let updateOnlineCardIDs = [];
	let updateCards = [];
	for(let oneCard of info) {
		let existed = false;
		let oneExistedCard;
		for(oneExistedCard of rows) {
			if(oneCard.card_id == oneExistedCard.card_id) {
				existed = true;
				break;
			}
		}
		if(existed) {
			if(oneExistedCard.isexisting == 0) {
				updateOnlineCardIDs.push(oneExistedCard.card_id);
			}
			updateCards.push(oneCard);
		} else {
			// console.log(JSON.stringify(oneCard));
			let oneRow = sprintf("('%s', %d, '%s', '%s', \
				'%s', '%s', %d, '%s', \
				%d, '%s', '%s', '%s', \
				'%s', CURRENT_TIMESTAMP, %d)", 
				oneCard.card_id, oneCard.neid, oneCard.card_fix_name, oneCard.userlabel, 
				oneCard.chassis_id, oneCard.card_name, oneCard.card_type_id, oneCard.card_display_name, 
				oneCard.isexisting, oneCard.hardware_ver, oneCard.firmware_ver, oneCard.index_in_mib, 
				oneCard.type_oid, oneCard.is_local);
			insertRows.push(oneRow);
			insertCardIDs.push(oneCard.card_id);
		}
	}

	if(insertRows.length > 0) {
		sql = sprintf("insert into res_card(card_id, neid, card_fix_name, userlabel, \
			chassis_id, card_name, card_type_id, card_display_name, \
			isexisting, hardware_ver, firmware_ver, index_in_mib, \
			type_oid, last_sync_time, is_local) values %s", insertRows.join(','));
		// console.log(sql);
		let result = await connRestNESync.query(sql);
		// console.log(JSON.stringify(result));
		let msg = {
			operation: 'add',
			source: 'res',
			type: 'card',
			datas: insertCardIDs
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));
	}

	if(updateOnlineCardIDs.length > 0) {
		sql = sprintf("update res_card set isexisting = 1 and update_time= CURRENT_TIMESTAMP where card_id in ('%s')", 
			updateOnlineCardIDs.join("','"));
		let result = await connRestNESync.query(sql);
		let msg = {
			operation: 'online_status_change',
			source: 'res',
			type: 'card',
			datas: updateOnlineCardIDs
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));		
	}

	if(updateCards.length > 0) {
		for(let card of updateCards) {
			let toSet = "";
			for(let columnName in card) {
				if(CARD_UPDATE_COL.has(columnName)) {
					toSet += sprintf(",%s='%s'", columnName, card[columnName]);
				}
			}
			if(toSet.length == 0) {
				continue;
			}
			toSet = toSet.substring(1);

			let sql = sprintf("update res_card set %s, update_time= CURRENT_TIMESTAMP where card_id='%s'", 
				toSet, card.card_id);
			await connRestNESync.query(sql);
		}
	}

	let updateOfflineCardIDs = [];
	for(let oneExistedCard of rows) {
		let alsoExistInDigResult = false;
		for(let oneCard of info) {
			if(oneExistedCard.card_id == oneCard.card_id) {
				alsoExistInDigResult = true;
				break;
			}
		}

		if(!alsoExistInDigResult && oneExistedCard.isexisting == 1) {
			updateOfflineCardIDs.push(oneExistedCard.card_id);
		}
	}

	if(updateOfflineCardIDs.length > 0) {
		sql = sprintf("update res_card set isexisting = 0 where card_id in ('%s')", 
			updateOfflineCardIDs.join("','"));
		let result = await connRestNESync.query(sql);
		let msg = {
			operation: 'online_status_change',
			source: 'res',
			type: 'card',
			datas: updateOfflineCardIDs
		};
		// log.debug('broadcast resource msg: ', JSON.stringify(msg));
		APP.mqtt_client.publish('resource', JSON.stringify(msg));		
	}
}

async function processPortinfo(info) {
	console.log('processPortinfo, neid:', info[0].neid);
	if(info.length == 0) {
		return;
	}
	
	let sql = sprintf("select * from res_port where neid=%d", info[0].neid);
	let rows = await connRestNESync.query(sql);

	let insertRows = [];
	let updatePorts = [];
	for(let onePort of info) {
		let existed = false;
		for(let oneExistedPort of rows) {
			if(onePort.port_id == oneExistedPort.port_id) {
				existed = true;
				break;
			}
		}
		if(existed) {
			updatePorts.push(onePort);
		} else {
			// console.log(JSON.stringify(onePort));
			let oneRow = sprintf("('%s', '%s', '%s', '%s', \
				%d, %d, '%s', '%s', \
				%d, '%s', '%s', '%s')", 
				onePort.userlabel, onePort.port_id, onePort.port_fix_name, onePort.card_id, 
				onePort.port_type_id, onePort.port_index, onePort.port_name, onePort.index_in_mib, 
				onePort.neid, onePort.adminstatus, onePort.operstatus, onePort.max_speed);
			insertRows.push(oneRow);
		}
	}

	if(insertRows.length > 0) {
		sql = sprintf("insert into res_port(userlabel, port_id, port_fix_name, card_id, \
			port_type_id, port_index, port_name, index_in_mib, \
			neid, adminstatus, operstatus, max_speed) values %s", insertRows.join(','));
		// console.log(sql);
		let result = await connRestNESync.query(sql);
		// console.log(JSON.stringify(result));
	}

	if(updatePorts.length > 0) {
		for(let port of updatePorts) {
			let toSet = "";
			for(let columnName in port) {
				if(PORT_UPDATE_COL.has(columnName)) {
					toSet += sprintf(",%s='%s'", columnName, port[columnName]);
				}
			}

			if(toSet.length == 0) {
				continue;
			}
			toSet = toSet.substring(1);

			let sql = sprintf("update res_port set %s, update_time= CURRENT_TIMESTAMP where port_id='%s'", 
				toSet, port.port_id);
			await connRestNESync.query(sql);
		}
	}

	for(let oneExistedPort of rows) {
		let alsoExistInDigResult = false;
		for(let onePort of info) {
			if(oneExistedPort.port_id == onePort.port_id) {
				alsoExistInDigResult = true;
				break;
			}
		}

		if(!alsoExistInDigResult) {
			let sql = sprintf("delete from res_port where port_id='%s' and card_id in \
				(select c.card_id from c, p where c.card_id = p.card_id and p.port_id='%s' and c.isexisting=1)",
				oneExistedPort.port_id, oneExistedPort.port_id);
			await connRestNESync.query(sql);
		}
	}
}

exports.startNESyncTask = startNESyncTask;