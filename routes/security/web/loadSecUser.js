var express = require('express');
var router = express.Router();
var async = require('async');


router.get('/', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'select sec_user_id as sec_user_id,user_name as user_name ,user_type as user_type,full_name as full_name,lock_status as lock_status,create_time as create_time,user_desc as user_desc from sec_user';
	    conn.query(sql, function(err, rows, fields) {
	       conn.release();
	  		res.json(200, {success: true, data: rows });  
	    });
	});
});

module.exports = router;