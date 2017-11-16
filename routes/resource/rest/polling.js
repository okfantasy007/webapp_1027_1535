var express = require('express');
var router = express.Router();
var sprintf = require("sprintf-js").sprintf;

var utilcomm = require('../util');

router.route('/period/:neid')
.get(function(req, res) {
	let sql = sprintf("select poll_interval from res_ne where neid=%d", req.params.neid);
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		res.status(200).json({neid: req.params.neid, period: rows[0].poll_interval});
	})
	.catch(function(err) {
		res.status(500).json(err);
		log.error(err);
	});
});

router.route('/online_status/:neid')
.get(function(req, res) {
	let sql = sprintf("select resourcestate from res_ne where neid=%d", req.params.neid);
	utilcomm.promiseSimpleQuery(sql)
	.then(function(rows) {
		let online_status = (rows[0].resourcestate == 1) ? true : false;
		res.status(200).json({neid: req.params.neid, online_status: online_status});
	})
	.catch(function(err) {
		res.status(500).json(err);
		log.error(err);
	});
});

module.exports = router;