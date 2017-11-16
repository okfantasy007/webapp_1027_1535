
var sprintf = require("sprintf-js").sprintf;
var async = require('async');
var amqp = require('amqplib');

var filterfunc = require('../web/filter_func');
var utilcomm = require('../util');
var cachecomm = require('../cache');
var nesync = require('./ne_sync');

var isInited = false;
var connRestDiscovery;

function prepare() {
	if(isInited) { return; }
	let amqp_url = sprintf("amqp://%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
	amqp.connect(amqp_url)
	.then(function(conn) {
		return conn.createChannel()
		.then(function(ch) {
			isInited = true;
			return ch.assertQueue('discovery_result', {durable: false})
			.then(function() { ch.prefetch(1); })
			.then(function() { ch.consume('discovery_result', doWork, {noAck: false}); });

			function doWork(message) {
				msg = JSON.parse(message.content);
				log.debug('discovery result come in', msg.hostname);

				if(!cachecomm.isDiscoveryTaskRunning(msg.task_id)) {
					ch.ack(message);
					return;
				}

				APP.dbpool_promise.getConnection()
				.then(function(conn) {
					connRestDiscovery = conn;
					return disposeDiscoverResult(msg);
				})
				.catch(function(err) {
					log.error('dispose discovery result error:', err);
				})
				.then(function() {
					try {
						APP.dbpool_promise.releaseConnection(connRestDiscovery);
					} catch(err) {
						log.error('dispose discovery result, release mysql connection error:', err);
					};
				})
				.then(function() {
					ch.ack(message);
				});
			};
		});
	})
	.catch(function(err) {
		log.error('discovery cb error:', err);
	});
}

async function disposeDiscoverResult(msg) {
	let p = {netype: {id: 1, name: 'general_icmp'}};
	if(msg.node_abilities.icmpPing) {
		p.resadd = msg.node_abilities.icmpPing.ping_ok ? 'ping_ok' : 'ping_fail';
	}

	if(msg.node_abilities.snmpMib2System) {
		if (msg.node_abilities.snmpMib2System.success) {
			p.resadd = 'snmp_ok';
			p.netype = {id: 584, name: 'SNMP Device'}
		} else {
			p.resadd = 'snmp_fail';
		}
	}

	if(p.resadd == 'snmp_ok') {
		await disposeDiscoverResultSNMPOK(msg, p)
		.catch(function(err) {
			log.error('error disposeDiscoverResultSNMPOK', err);
		});
	}

	// 更新发现任务报告
	let exesql = sprintf("INSERT INTO res_discovery_report (discovery_task, ip_address, discovery_template,\
			protocol, device_model, status) VALUES (%d, '%s', %d, '%s', '%d', '%s')",
		msg.task_id, msg.hostname, msg.node_abilities.snmpMib2System.template.id,
		msg.node_abilities.snmpMib2System.template.type, p.netype.id, p.resadd);
	log.debug(exesql);
	await connRestDiscovery.query(exesql);

	// 统计
	let sql1 = sprintf("SELECT ip_numbers FROM res_discovery_task WHERE id=%d", msg.task_id);
	let sql2 = sprintf("SELECT COUNT(*) AS count FROM res_discovery_report WHERE discovery_task=%d", msg.task_id);
	let rows = await connRestDiscovery.query(sql1 + ';' + sql2);
	let ip_numbers = rows[0][0].ip_numbers;
	let finish_ip_numbers = rows[1][0].count;
	p.task_finish = ip_numbers==finish_ip_numbers;

	let percent = parseFloat(finish_ip_numbers)/parseFloat(ip_numbers) * 100.0;
	p.progress = sprintf("%d/%d %1.0f%%", finish_ip_numbers, ip_numbers, percent);
	log.debug('discovery task ' + msg.task_id + ' finish_ip_numbers:' + finish_ip_numbers
		+ ' total_ip_numbers:' + ip_numbers + ' progress:' + percent);
	
	// 更新发现任务进度和状态
	let sqls = [sprintf("UPDATE res_discovery_task SET progress = '%s', duration_time = sec_to_time(now() - `start_time`) WHERE id=%d",
		p.progress, msg.task_id)];
	if (p.task_finish) {
		cachecomm.discoveryTaskStopRunning(msg.task_id);
		sqls.push(sprintf("UPDATE res_discovery_task SET task_status = 'scaned' WHERE id=%d", msg.task_id));
	}
	await connRestDiscovery.query(sqls.join(';'));
		
	let discovery_update = {
		"task_id": 		msg.task_id,
		"status": 		p.resadd,
		"ip_address":   msg.hostname,
		"protocol": 	msg.node_abilities.snmpMib2System.template.type,
		"startTime":    msg.startTime,
		"finishTime":   msg.finishTime,
		"durationTime": msg.durationTime,
		"is_ping_ok":   msg.node_abilities.icmpPing.ping_ok,
		"ne_type_name": p.netype.userlabel,
		"ne_type_id":   p.netype.id,
	};
	log.debug('broadcast mqtt(discovery result), ip:', msg.hostname);
	APP.mqtt_client.publish('discovery_update', JSON.stringify(discovery_update), function(err) {
		if(err) {
			log.error('discovery_update msg publish failed, ', err);
		}
	});
}

function isRuled(netypename) {
	let filterRules = filterfunc.getCachedAllRules();
	if(filterRules.length == 0)
		return false;

	for(var i in filterRules) {
		if(filterRules[i].NETYPE_NAME == netypename) {
			return true;
		}
	}
	return false;
}

async function disposeDiscoverResultSNMPOK(msg, p) {
	var oidGot = msg.node_abilities.snmpMib2System.VarBinds[1].Variable.Value;
	if(oidGot.indexOf('.')!=0){
		oidGot = '.' + oidGot;
	}

	var sql = sprintf(
		"SELECT netypeid as id, netypename as name, type_oid as sysoid, userlabel \
		 FROM res_ne_type WHERE type_oid like '%%%s%%'",
		oidGot
	);
	var rows = await connRestDiscovery.query(sql);
	if(rows.length == 1) {
		p.netype = rows[0];
	} else {
		for(var i = 0; i<rows.length; i++){
    		var oids = rows[i].sysoid.split(';');
    		if(oids.indexOf(oidGot)!=-1){
    			p.netype = rows[i];
    		}
		}
	}

	var needCreateNewNe = true;
	// 判断此设备是否匹配过滤条件
	var ruled = isRuled(p.netype.name);
	let filterType = filterfunc.getCachedFilterType();
	if(filterType == 'discard') {
		if(ruled) {
			p.resadd = 'filtered';
			needCreateNewNe = false;
		}
	} else {
		if(!ruled) {
			p.resadd = 'filtered';
			needCreateNewNe = false;
		}
	}
	if(!needCreateNewNe) {
		return;
	}

	// 判断此设备是否已存在于网管中（相同IP和PORT），如果已存在，则p.resadd = 'exist'
	var snmpTemplate = msg.node_abilities.snmpMib2System.template;
	sql = sprintf("select count(*) as ct from res_ne where ipaddress='%s' and port='%d'",
		msg.hostname,
		snmpTemplate.config.port);
	rows = await connRestDiscovery.query(sql);
	if(rows[0].ct > 0) {
		p.resadd = 'exist';
		needCreateNewNe = false;
		return;
	}

	//TODO 判断此设备是否匹配License

	if(needCreateNewNe) {
		await disposeDiscoverResultNodeCreate(msg, p, snmpTemplate);
	}
}

async function disposeDiscoverResultNodeCreate(msg, p, snmpTemplate) {
	var sqlCheckDestSubnet = 
	sprintf("select map_hierarchy from topo_symbol where symbol_id=%d", msg.dest_subnet_id);
	var rowsCheckDestSubnet = await connRestDiscovery.query(sqlCheckDestSubnet);
	var hiDestSubnet = rowsCheckDestSubnet[0].map_hierarchy;

	// 入资源（网元）表，发添加资源消息
	var south_protocol = 0;
	switch(snmpTemplate.type) {
		case 'SNMP':
			south_protocol = 1;
			break;
		case 'TR069':
			south_protocol = 2;
			break;
		case 'NETCONF':
			south_protocol = 3;
			break;
		case 'OPENFLOW':
			south_protocol = 4;
			break;
	}
	
	p.resadd = 'skip';
	sql = sprintf(
		"INSERT INTO res_ne (uuid, netypeid, ipaddress, port, hostname, userlabel, discoveredname, \
			poll_enabled, poll_interval, poll_protocol, south_protocol, proto_param, create_time)\
		VALUES ('%s', '%d', '%s', '%d', '%s', '%s', '%s', '1', '300', '%d', '%d', '%s', CURRENT_TIMESTAMP)",
		utilcomm.uuid(),
		p.netype.id,
		msg.hostname,
		snmpTemplate.config.port,
		msg.hostname,
		msg.hostname,
		msg.hostname,
		south_protocol,
		south_protocol,
		JSON.stringify(snmpTemplate.config)
	);
	log.debug("SQL:", sql);
	var rows = await connRestDiscovery.query(sql);

	log.info('insert ne ok, neid: ' + rows.insertId);
	p.neid = rows.insertId;
	p.resadd = 'success'
	// 发添加资源消息
	var neAddedMsg = {
		operation: 'add',
		source: 'res',
		type: 'ne',
		datas: [p.neid]
	};
	// log.debug('broadcast resource msg: ', JSON.stringify(neAddedMsg));
	APP.mqtt_client.publish('resource', JSON.stringify(neAddedMsg));

	// 入符号表，发添加符号消息
	var symbol = {
		main_view_id: 1,
		symbol_name1: msg.hostname,
		symbol_name2: msg.hostname,
		symbol_name3: msg.hostname,
		real_res_type_name: 'NE',
		real_res_id: p.neid,
		res_type_name: 'NE',
		res_id: p.neid,
		ne_id: p.neid,
		symbol_style: 1,
		layout: 2,
		expandable: 1,
		lockable: 1,
		topo_type_id: '11_'+p.netype.name,
		tree_parent_id: msg.dest_subnet_id,
		map_parent_id: msg.dest_subnet_id,
		neparent_id: 0,
		x: Math.floor(Math.random()*400 + 100),
		y: Math.floor(Math.random()*400 + 100)
	};
	log.debug("prepared json: ", JSON.stringify(symbol));
	
	sql = sprintf("insert into topo_symbol(main_view_id, \
		symbol_name1, symbol_name2, symbol_name3, \
		real_res_type_name, real_res_id, res_type_name, res_id, \
		ne_id, symbol_style, topo_type_id, \
		TREE_PARENT_ID, MAP_PARENT_ID, NE_PARENT_ID, \
		layout, expandable, lockable, \
		x, y) values('%d', \
		'%s', '%s', '%s', \
		'%s', '%s', '%s', '%s', \
		'%d', '%d', '%s', \
		'%d', '%d', '%d', \
		'%d', '%d', '%d', \
		'%d', '%d')",
		symbol.main_view_id,
		symbol.symbol_name1, symbol.symbol_name2, symbol.symbol_name3, 
		symbol.real_res_type_name, symbol.real_res_id, symbol.res_type_name, symbol.res_id, 
		symbol.ne_id, symbol.symbol_style, symbol.topo_type_id, 
		symbol.tree_parent_id, symbol.map_parent_id, symbol.neparent_id, 
		symbol.layout, symbol.expandable, symbol.lockable,
		symbol.x, symbol.y
		);
	log.debug("SQL:", sql);
	rows = await connRestDiscovery.query(sql);
	var symbolid = rows.insertId;
	var hierarchy = hiDestSubnet + symbolid + ',';
	sql = sprintf("update topo_symbol set map_hierarchy='%s' \
		where symbol_id=%d", hierarchy, symbolid);
	log.debug("SQL:", sql);
	rows = await connRestDiscovery.query(sql);

	log.info('insert topo symbol ok, symbolid: ' + symbolid);
	// 发添加符号消息
	var neSymbolAddedMsg = {
		operation: 'add',
		source: 'res',
		type: 'node',
		datas: [symbolid]
	};
	// log.debug('broadcast topo msg: ', JSON.stringify(neSymbolAddedMsg));
	APP.mqtt_client.publish('topo', JSON.stringify(neSymbolAddedMsg));

	nesync.startNESyncTask(p.neid)
	.then(function() {
		log.trace(sprintf('disposeDiscoverResultNodeCreate, post res sync ne %d ok', p.neid));
	})
	.catch(function(err) {
		log.error(sprintf('disposeDiscoverResultNodeCreate, post res sync ne %d failed, %s', p.neid, err));
	});
}

exports.prepare = prepare;