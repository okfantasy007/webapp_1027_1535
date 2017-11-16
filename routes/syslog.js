var express = require('express');
var router = express.Router();
var request = require('request')

router.get('/security', function(req, res, next) {

	APP.dbpool.getConnection(function(err, conn) {
	    if (err) throw err;
	    conn.query('SELECT * FROM devices LIMIT 10', function(err, rows, fields) {
	        if (err) throw  err;
		    for (var i in rows) {
		    	console.log(i, rows[i].SerialNumber);
			}
		    for (var i in fields) {
		    	console.log(i, fields[i]);
			}
	        //回收pool
	        conn.release();
	        // process.exit();
	    });
	});

	res.send('syslog -- security page');
});

router.get('/restget', function(req, res, next) {
	request.get('http://172.16.75.95:7547/rest/cpes/e285b6b51551a4d34a41d0cd45218778',
		function (error, response, body) {
			// console.log(response.headers);
			// console.log('the decoded data is: ' + body);
			console.log(APP.config.app);
			res.send('the decoded data is: ' + body);
		}
	) 	
	// res.send('syslog -- restget page');
});

router.get('/json/a', function(req, res, next) {
	request.get('http://172.16.75.95:7547/rest/cpes/e285b6b51551a4d34a41d0cd45218778',
		function (error, response, body) {
			// console.log(response.headers);
			// console.log('the decoded data is: ' + body);
			res.send('ja' + body);
		}
	) 	
	// res.send('syslog -- restget page');
});

module.exports = router;
