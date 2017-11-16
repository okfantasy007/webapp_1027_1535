var express = require('express');
var router = express.Router();
var async = require('async');
var sd = require('silly-datetime');

router.get('/', function(req, res, next) {
	async function load_online_user(){
		var conn;
		try{
			APP.sessionStore.all(function(error, sessions){
				var sessions = JSON.stringify(sessions); 
				var rows = JSON.parse(sessions);
				// var rows = eval(sessions); 
				// console.log("HHHHHHHHHHH", rows);
				var result=[];
				for(var i in rows){
					console.log("HHHHHHHHHHH", rows[i]);
		    		var row={};
					var data = JSON.parse(JSON.stringify(rows[i]));
					row.sessionID= data.id;
					
					row.user_name=data.user;
					if(typeof(data.user)=='undefined'||data.user==''||data.user==null){
						continue;
					}
					
					row.ip_address=data.ip_address;
					
					row.login_time=data.login_time;
					
					row.host_name=data.host_name;
					
					row.user_desc=data.user_desc;
					// row.lock_state = data.lock_state;
					// sql = "select user_type from sec_user where user_name = '"+data.user+"'";
					// var rows1 = await conn.query(sql);
					// row.user_type=rows1[0].user_type;
					result.push(row);
					
				}
				console.log(result);
				// await APP.dbpool_promise.releaseConnection(conn);
				res.json(200, {data: result }); 

				})
			 
		}catch(err){
			console.log("=======",err);
	        // await APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	res.json(200, {success: false, data: null });  
	    	} else {
		        res.json(200, {success: true, data: result });  
	    	}
		}	
	}
	load_online_user();
	
});

module.exports = router;

