var express = require('express');
var router = express.Router();
var sprintf = require("sprintf-js").sprintf;

var nesync = require('../mq/ne_sync');

router.route('/neid/:neid')
.post(function(req, res) {
	let neid = req.params.neid;
	nesync.startNESyncTask(neid)
	.then(function() {
		log.trace(sprintf('ne_sync rest, post res sync ne %d ok', neid));
		res.status(200).end();
	})
	.catch(function(err) {
		log.error(sprintf('ne_sync rest, post res sync ne %d failed, %s', neid, err));
		res.status(500).json(err);
	});
});

module.exports = router;