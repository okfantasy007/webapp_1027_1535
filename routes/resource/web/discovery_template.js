var express = require('express');
var router = express.Router();

var utilcomm = require('../util');

const protocol2viewtype = {
	"SNMP": "snmpFormView",
	"ICMP": "icmpFormView",
	"NETCONF": "netconfFormView",
};

router.get('/select/page', function(req, res, next) {
	utilcomm.getAuthorizedNEinCondition(req)
	.then(function(secCondition) {
		let sql1 = 'select count(*) as count from res_discovery_template where 1=1' + secCondition;
		let sql2 = 'SELECT * FROM res_discovery_template where 1=1' + secCondition 
		+ sprintf(' LIMIT %d, %d', req.query.start, req.query.limit );
		return utilcomm.promiseSimpleQuery(sql1 + ';' + sql2);
	})
	.then(function(rows) {
		for (var i in rows[1]) {
	 	   	rows[1][i].viewtype = protocol2viewtype[ rows[1][i].type ];
	 	   	var hash = JSON.parse(rows[1][i].config); 
	 	   	var configDisplay = [];
	 	   	for (var k in hash) {
	 	   		rows[1][i][k] = hash[k];
	 	   		if(rows[1][i].type == 'SNMP' && hash.version != 3) {
	 	   			if(k.indexOf('v3') == 0) {
	 	   				continue;
	 	   			}
	 	   		}
	 	   		if(/^\d+$/.test(hash[k])) {
	 	   			configDisplay.push(k+"="+hash[k]);
	 	   		} else {
	 	   			configDisplay.push(k+ '="' +hash[k] + '"');
	 	   		}
	 	   	}
	 	   	delete rows[1][i].config;
	 	   	configDisplay.sort(function(a, b){
	 	   		return b - a;
	 	   	});
	 	   	rows[1][i].config = configDisplay.join(', ');
		}

  		res.status(200).json({success: true, total: rows[0][0].count, data: rows[1]});
	})
	.catch(function(err) {
		log.error('discovery template refresh error', err);
		res.status(200).json({success: false});
	});
});

router.post('/post', function(req, res, next) {
	let template_id = req.body.id;
	let template_type = req.body.type;
	let template_name = req.body.name;
	delete req.body.id;
	delete req.body.type;
	delete req.body.name;
	
	if(req.body.port) {
		req.body.port = Number(req.body.port);
	}
	if(req.body.version) {
		req.body.version = Number(req.body.version);
	}
	req.body.retries = Number(req.body.retries);
	req.body.timeout = Number(req.body.timeout);

	let add_mode = !template_id;
	let sql = add_mode ? 
	sprintf("INSERT INTO res_discovery_template (name, type, config) VALUES ('%s', '%s', '%s')",
		template_name, template_type, JSON.stringify(req.body))
	:
	sprintf("UPDATE res_discovery_template SET name = '%s', config = '%s' WHERE res_discovery_template.id = %s",
		template_name, JSON.stringify(req.body), template_id);

	utilcomm.promiseSimpleQuery(sql)
	.then(function() {
		res.status(200).json({success: true, msg: T.__('Successful operation')});
		utilcomm.logSysOp(req.session, true, T.__(add_mode ? 'Add' : 'Modify'), T.__('discovery templates'), template_name);
	})
	.catch(function(err) {
		log.error('discovery template post error', err);
		let emsg = err.errno == 1062 ? T.__('Duplicated template name') : T.__('operation failed');
		res.status(200).json({success: false, msg: emsg});
		utilcomm.logSysOp(req.session, false, T.__(add_mode ? 'Add' : 'Modify'), T.__('discovery templates'), template_name);
	});
});

router.post('/delete', function(req, res, next) {
	let ids = req.body.ids.split(',');
	let info;
	let ids_del = [];

	for (var i in ids) {
		if(parseInt(ids[i]) < 0){
			info = 'Default templet cannot be deleted';
		}else{
			ids_del.push(ids[i]);
		}
	}

	if (ids_del.length == 0) {
		res.status(200).json({success: false, msg: T.__(info)}); 
		return;
	}

	let sql = sprintf("DELETE FROM res_discovery_template WHERE id IN (%s)", ids_del.join(","));
	utilcomm.promiseSimpleQuery(sql)
	.then(function() {
		res.status(200).json({success: true, msg: T.__(info ? info : 'Successful operation')}); 
		utilcomm.logSysOp(req.session, true, T.__('Delete'), T.__('discovery templates'), req.body.names);
	})
	.catch(function(err) {
		log.error('discovery template delete error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')}); 
		utilcomm.logSysOp(req.session, false, T.__('Delete'), T.__('discovery templates'), req.body.names);
	});
});

//for discoveryTaskForm use
router.get('/array', function(req, res, next) {
	let sql = "SELECT id, name, type FROM res_discovery_template where type = 'SNMP'";
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		let ary = rows.map(function(item) {
			return [item.id, item.name + ' (' + item.type + ')'];
		});
		res.status(200).json(ary);
	})
	.catch(function(err) {
		log.error('get discovery template error', err);
		res.status(500).end();
	});
});

module.exports = router;
