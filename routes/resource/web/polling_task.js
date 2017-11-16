var express = require('express');
var router = express.Router();
var http = require('http'); 

var polling = require('../../../modules/polling');
var utilcomm = require('../util');

router.get('/device_poll', function(req, res, next) {
	utilcomm.getAuthorizedNEinCondition(req)
	.then(function(secCondition) {
		let poll_interval = req.query.time;

		let cv = '';
		if(poll_interval == 0) {
			cv = 'and (poll_enabled = 0 || (poll_enabled=1 and poll_interval = 0))';
		} else {
			cv = 'and (poll_enabled=1 && poll_interval = ' + poll_interval + ')';
		}

		let sql1 = sprintf("select n.neid, n.ipaddress, n.resourcestate, n.south_protocol, \
			n.last_polling_time, n.last_polling_duration, nt.userlabel, tp.symbol_id \
			from res_ne n, res_ne_type nt, topo_symbol tp \
			where n.south_protocol in (1, 3) %s and n.netypeid = nt.netypeid \
			and tp.real_res_type_name = 'NE' and n.neid = tp.ne_id %s LIMIT %d, %d",
			cv, secCondition, req.query.start, req.query.limit);
		let sql2 = sprintf("select count(*) as count from res_ne where south_protocol in (1, 3) %s %s",
			cv, secCondition);
		return utilcomm.promiseSimpleQuery(sql1 + ';' + sql2);
	})
	.then(function(rows) {
  		res.status(200).json({
  			success: true,
	  		data: rows[0] ,
	  		total: rows[1][0].count
  		});
	})
	.catch(function(err) {
		res.status(500).end();
		log.error(err);
	});
});

router.post('/period', function(req, res, next) {
	polling.modify(req.body.ids, req.body.time);

	let sql = (req.body.time == 0) ?
		sprintf("update res_ne set poll_enabled = 0 where neid in (%s)",  req.body.ids)
	:
		sprintf("update res_ne set poll_enabled = 1, poll_interval = %d where neid in (%s)",  
			req.body.time, req.body.ids);
	
	utilcomm.promiseSimpleQuery(sql)
	.then(function() {
  		res.status(200).json({success: true, msg: T.__('Successful operation')});
  		utilcomm.logSysOp(req.session, true, T.__('Modify'), T.__('Polling Interval'), 
  			T.__('Device ID') + ':' + req.body.ids + ', ' + T.__('Polling Time') + ':' + req.body.time + '(s)');
	})
	.catch(function(err) {
		log.error('polling modify period error', err);
		res.status(200).json({success: false, msg: T.__('operation failed')});
  		utilcomm.logSysOp(req.session, false, T.__('Modify'), T.__('Polling Interval'), 
  			T.__('Device ID') + ':' + req.body.ids + ', ' + T.__('Polling Time') + ':' + req.body.time + '(s)');
	});
});

router.post('/control',function(req, res, next) {
	let isStart = req.body.status=='start';
	if(isStart) {
		polling.start(req.app);
	} else {
		polling.stop();
	}
	res.status(200).json({success: true, msg: T.__('Successful operation')});
	utilcomm.logSysOp(req.session, 1, T.__(isStart ? 'Start' : 'Stop'), T.__('device polling'), '');
});

router.get('/control',function(req, res, next) {
	var status =  polling.status() ? 'start' : 'stop';
	res.status(200).json({status: status});
});

module.exports = router;