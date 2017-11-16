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

router.get('/list', function(req, res, next) {
    console.log(T.__('Hello'));

	APP.dbpool.getConnection(function(err, conn) {
	    if (err) throw err;
	    conn.query('SELECT * FROM sec_user LIMIT 100', function(err, rows, fields) {
	    	console.log("####",err);
	        // if (err) throw  err;
		    for (var i in rows) {
		    	console.log(i, rows[i].USER_NAME);
			}
	        conn.release();
	  		res.json(200, {success: true, 'data': rows });  
	    });
	});
});

module.exports = router;
