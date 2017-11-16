var express = require('express');
var router = express.Router();
var request = require('request');
var sprintf = require("sprintf-js").sprintf;

router.get('/add', function(req, res, next) {
	var url = sprintf("http://%s/rest/users", req.headers.host)
	request.get( url,
		function (error, response, body) {
			// console.log(response.headers);
			// console.log('the decoded data is: ' + body);
			console.log(APP.config.app);
			res.send('the decoded data is: ' + body);
		}
	) 	
	// res.send('syslog -- restget page');
});

module.exports = router;
