
var express = require('express');
var router = express.Router();
var ip = require('ip');

var filterfunc = require('./filter_func');
var utilcomm = require('../util');
var cachecomm = require('../cache');
var discoverycb = require('../mq/discovery');

var subnet2iplist = function(ip_subnet, ip_netmask) {
	var ip_list=[];
	var subnet;
	if (ip.isV4Format(ip_netmask)) {
		subnet = ip.subnet(ip_subnet, ip_netmask);
	} else {
		subnet = ip.cidrSubnet(sprintf("%s/%s",ip_subnet, ip_netmask));
	}
	var ip_start = ip.toLong(subnet.firstAddress);
	var ip_end = ip.toLong(subnet.lastAddress);
	for (var i = ip_start; i<=ip_end; i++) {
		if (ip_list.length>=APP.config.app.max_scan_block_size) {
			break;
		}
		ip_list.push( ip.fromLong(i) );
	}
	return ip_list;
}

var iprange2iplist = function(start, end) {
	var ip_list=[];
	var ip_start = ip.toLong(start);
	var ip_end = ip.toLong(end);
	for (var i = ip_start; i<=ip_end; i++) {
		// if (ip_list.length>=APP.config.app.max_scan_block_size) {
		// 	break;
		// }
		ip_list.push( ip.fromLong(i) );
	}
	return ip_list;
}

var convert_ip_params = function(r) {
	switch (r.scan_type) {
		case 'ipSubnet':
			r.display = sprintf("%s / %s",r.ip_subnet, r.ip_netmask);
			r.ip_array = subnet2iplist(r.ip_subnet, r.ip_netmask);
			break;
		case 'ipRange':
			r.display = sprintf("%s - %s",r.ip_range_start, r.ip_range_end);
			r.ip_array = iprange2iplist(r.ip_range_start, r.ip_range_end);
			break;
		case 'ipList':
			r.display = r.ip_list;
	   		r.ip_array = r.ip_list.split(',');
	}
	r.ip_numbers = r.ip_array.length;
}

var check_ip_params = function(r) {
	switch (r.scan_type) {
		case 'ipSubnet':
			if(!ipIsValid(r.ip_subnet)) {return T.__('ip subnet address') + ' ' + T.__('Error');}
			if(!maskIsValid(r.ip_netmask)) {return T.__('subnet mask') + ' ' + T.__('Error');}
			if(!r.ip_netmask.startsWith('255.255')) {return T.__('subnet mask') + ' ' + T.__('Error');}
			break;
		case 'ipRange':
			if(!ipIsValid(r.ip_range_start)) {return T.__('start address') + ' ' + T.__('Error');}
			if(!ipIsValid(r.ip_range_end)) {return T.__('stop address') + ' ' + T.__('Error');}

			let ip_start = ip.toLong(r.ip_range_start);
			let ip_end = ip.toLong(r.ip_range_end);
			if(ip_start >= ip_end) {return T.__('ip range reversed');}
			if((ip_end - ip_start + 1) > 65535) {return T.__('ip range exceed 65535');}
			break;
		case 'ipList':
			let ips = r.ip_list.split(',');
			for(let oneIP of ips) {
				if(!ipIsValid(oneIP)) {return T.__('ipList') + ' ' + T.__('Error');}
			}
			break;
	}
}

function ipIsValid(ipaddr) {
	let reg1 = /([1-9]|\d{2}|[01]\d\d|2[0-4]\d|25[0-4])\.(\d|\d{2}|[01]\d\d|2[0-4]\d|25[0-4])\.(\d|\d{2}|[01]\d\d|2[0-4]\d|25[0-4])\.([1-9]|\d{2}|[01]\d\d|2[0-4]\d|25[0-4])/;
	let isValid1 = reg1.test(ipaddr);

	if(isValid1) {
		if(ipaddr.split('.')[3] == '255') {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}

function maskIsValid(mask) {
	let regmask = /([1-9]|\d{2}|[01]\d\d|2[0-4]\d|25[0-5])\.0\.0\.0|255\.([1-9]|\d{2}|[01]\d\d|2[0-4]\d|25[0-5])\.0\.0|255\.255\.([1-9]|\d{2}|[01]\d\d|2[0-4]\d|25[0-5])\.0|255\.255\.255\.([1-9]|\d{2}|[01]\d\d|2[0-4]\d|25[0-5])/;
	if(!regmask.test(mask)) {
		return false;
	}

	let segValids = ['128','192','224','240','248','252','254','255','0'];
	for(let seg of mask.split('.')) {
		if(segValids.indexOf(seg) == -1) {
			return false;
		}
	}

	return true;
}

var add_abilities = function(r, templates) {

	var task_temps = r.templates.split(',').map(function(t){
		return templates[t];
	});
	r.task_temps = task_temps;

	var protocols = {'ICMP':true};
	for (var i in task_temps) {
		protocols[ task_temps[i].type ] = true
	};

	r.abilities = [];
	for (var protocol in protocols) {
		var abilities;
		switch (protocol) {
		case 'ICMP':
			abilities = {
	            name: "icmpPing",
	            call_type: "static",
			};
			break;
		case 'SNMP':
			abilities = {
	            name: "snmpMib2System",
	            call_type: "static",
			};
			break;
		case 'NETCONF':
			abilities = {
	            name: "netconfDiscovery",
	            call_type: "static",
			};
		}
	    abilities.protocol = protocol,
		r.abilities.push(abilities)
	}
}

router.get('/', function(req, res, next) {
	let preSql = "update res_discovery_task set dest_subnet_id = 0 where dest_subnet_id not in (select symbol_id from topo_symbol)";
	utilcomm.promiseSimpleQuery(preSql)
	.then(function() {
		let sql1 = "select t.*, concat(date(t.start_time),' ',time(t.start_time)) as start_time_str, s.symbol_name1 as dest_subnet_name \
		from res_discovery_task t, topo_symbol s where t.dest_subnet_id=s.symbol_id";
		let sql2 = "SELECT id,name,type FROM res_discovery_template";
		return utilcomm.promiseSimpleQuery(sql1 + ';' + sql2);
	})
	.then(function(rows) {
		var tasks = rows[0],
			templates = rows[1],
			templates_hash={};

	 	for (var i in templates) {
			templates_hash[ templates[i].id ] =  templates[i];
	 	};

	 	for (var i in tasks) {
	 		var r = tasks[i];
	 		convert_ip_params(r);
	 	   	r.templates_names = r.templates.split(',').map(function(t){
	 	   		return sprintf("%s (%s)",templates_hash[t].name,templates_hash[t].type);
	 	   	}).join(', ');

	 	   	r.scan_type_display = T.__(r.scan_type);
		}
  		res.status(200).json({
  			success: true,
  			data: tasks
  		}); 
	})
	.catch(function(err) {
		res.status(200).json({
  			success: false,
			msg: err
  		}); 
	});
});

router.get('/update', function(req, res, next) {
	log.info('receive a discovery task status update req from ip', req.ip);
	sql = "SELECT id, duration_time, sec_to_time(now() - `start_time`) as duration_time_real,\
	concat(date(`start_time`),' ',time(`start_time`)) AS start_time_str, task_status, progress FROM res_discovery_task";

	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		var hash = {};
		for (var i in rows) {
			if (rows[i].task_status == 'scanning') {
				rows[i].duration_time = rows[i].duration_time_real;
			}
			hash[ rows[i].id ] = rows[i];
		}
  		res.status(200).json(hash);
	})
	.catch(function(err) {
		log.error('discovery_task /update,', err);
		res.status(500).end(); 
	});
});

router.post('/post', function(req, res, next) {
	let checkOutInvalid = check_ip_params(req.body);
	if(checkOutInvalid) {
		res.status(200).json({success: false, msg: checkOutInvalid});  
		return;
	}

	convert_ip_params(req.body);

	let display = '';
  	switch (req.body.scan_type) {
		case 'ipSubnet':
			display = sprintf("%s / %s", req.body.ip_subnet, req.body.ip_netmask);
			break;
		case 'ipRange':
			display = sprintf("%s - %s", req.body.ip_range_start, req.body.ip_range_end);
			break;
		case 'ipList':
			display = req.body.ip_list;
	}

	let add_mode = !req.body.id;
	let sql = add_mode ? 
	sprintf("INSERT INTO res_discovery_task (scan_type, ip_subnet, ip_netmask, ip_range_start,\
			ip_range_end,ip_numbers, ip_list, templates, dest_subnet_way, dest_subnet_id) \
			VALUES ('%s', '%s', '%s', '%s', '%s', %d, '%s', '%s', 'manualSet', %d)",
			req.body.scan_type,
			req.body.ip_subnet,
			req.body.ip_netmask,
			req.body.ip_range_start,
			req.body.ip_range_end,
			req.body.ip_numbers,
			req.body.ip_list,
			req.body.templates,
			req.body.dest_subnet_id)
	:
	sprintf("UPDATE res_discovery_task SET  scan_type = '%s', ip_subnet = '%s', ip_netmask = '%s',\
			ip_range_start = '%s', ip_range_end = '%s', ip_numbers = %d, ip_list = '%s', templates = '%s',\
			dest_subnet_way = 'manualSet', dest_subnet_id = %d WHERE  id = %s",
			req.body.scan_type,
			req.body.ip_subnet,
			req.body.ip_netmask,
			req.body.ip_range_start,
			req.body.ip_range_end,
			req.body.ip_numbers,
			req.body.ip_list,
			req.body.templates,
			req.body.dest_subnet_id,
			req.body.id);
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
  		res.status(200).json({success: true, msg: T.__('Successful operation')});
  		
		utilcomm.logSysOp(req.session, true, T.__(add_mode ? 'Add' : 'Modify'), T.__('discovery task'), display);
	})
	.catch(function(err) {
		log.error('discovery task post error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});  
		utilcomm.logSysOp(req.session, false, T.__(add_mode ? 'Add' : 'Modify'), T.__('discovery task'), display);
	});
});

router.post('/delete', function(req, res, next) {
	let sql1 = sprintf("DELETE FROM res_discovery_task WHERE id IN (%s)", req.body.ids);
	let sql2 = sprintf("DELETE FROM res_discovery_report WHERE discovery_task IN (%s)", req.body.ids);
	utilcomm.promiseSimpleQuery(sql1 + ';' + sql2)
	.then(function(rows) {
  		res.status(200).json({success: true, msg: T.__('Successful operation')});
  		utilcomm.logSysOp(req.session, true, T.__('Delete'), T.__('discovery task'), req.body.names);
	})
	.catch(function(err) {
		log.error('discovery task delete error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
		utilcomm.logSysOp(req.session, false, T.__('Delete'), T.__('discovery task'), req.body.names);
	});
});

router.post('/start', function(req, res, next) {
	var ids = req.body.ids.split(',');
	Promise.all([filterfunc.updateFilterType(), filterfunc.updateAllRules()])
	.then(function() {
		return Promise.all([
			utilcomm.promiseSimpleQuery('SELECT * FROM res_discovery_template'),
			utilcomm.promiseSimpleQuery(
				sprintf("SELECT res_discovery_task.*, concat(date(now()),' ',time(now())) AS cur_time\
					FROM res_discovery_task WHERE res_discovery_task.id IN (%s)", ids.join(","))
			),
			utilcomm.promiseSimpleQuery(
				sprintf("DELETE FROM res_discovery_report WHERE discovery_task IN (%s); \
					UPDATE res_discovery_task SET task_status='scanning', progress='', start_time=NOW(),\
					duration_time=sec_to_time(0) WHERE id IN (%s)", ids.join(","), ids.join(","))
			)
		]);
	})
	.then(function(results) {
		discoverycb.prepare();
		
		cachecomm.discoveryTaskStartRunning(req.body.ids);

		var templates = {};
		for (let oneTemplate of results[0]) {
	    	oneTemplate.config = JSON.parse(oneTemplate.config);
	    	templates[ oneTemplate.id ] = oneTemplate;
		}
		let taskMsgObjects = [];
		for(let oneTask of results[1]) {
			convert_ip_params(oneTask);
	 	   	add_abilities(oneTask, templates);

	 	   	for (let oneIP of oneTask.ip_array) {
		 	   	let msg = {
		 	   		poll_type: 'discovery',
		 	   		discovery_task_id: oneTask.id,
		 	   		hostname: oneIP,
				    node_abilities: oneTask.abilities,
				    polling_templates: oneTask.task_temps,
				    destnation_subnet: oneTask.dest_subnet_id,
				    queueName : 'discovery_result'
		 	   	};
	 	   		taskMsgObjects.push(msg);
	 	   	}
		}

 	   	if(taskMsgObjects.length > 0) {
 	   		Promise.resolve(utilcomm.sendToQueueBatch('polling_task', 
 	   			taskMsgObjects, 'discovery_task dispatch discovery task'));
 	   	} else {
 	   		Promise.reject('empty discovery task');
 	   	}
	})
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
  		utilcomm.logSysOp(req.session, true, T.__('start detect'), T.__('discovery task'), req.body.names);
	})
	.catch(function(err) {
		log.error('discovery task start error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
  		utilcomm.logSysOp(req.session, false, T.__('start detect'), T.__('discovery task'), req.body.names);
	});
});

router.post('/stop', function(req, res, next) {
	var sql = sprintf("update res_discovery_task set task_status='noscan' where id IN (%s)", req.body.ids);
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
  		cachecomm.discoveryTaskStopRunning(req.body.ids);
  		res.status(200).json({success: true, msg: T.__('Successful operation')});
  		utilcomm.logSysOp(req.session, true, T.__('stop detect'), T.__('discovery task'), req.body.names);
	})
	.catch(function(err) {
		log.error('update task status failed: ' + err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
  		utilcomm.logSysOp(req.session, false, T.__('stop detect'), T.__('discovery task'), req.body.names);
	});
});

module.exports = router;
