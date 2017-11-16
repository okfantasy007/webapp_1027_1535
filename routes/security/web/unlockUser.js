
var async = require('async');
var express = require('express');
var router = express.Router();
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');


router.post('/', function(req, res, next) {
	async function unlockuser(){
		var ids = req.body.ids;
		var userName = req.body.name;
		console.log();
		if(ids!=''){
			console.log('##########ids##########',ids);
			var conn = null;
			var idsArray = ids.split(',');
			try{
				conn = await APP.dbpool_promise.getConnection();
				conn.beginTransaction();
				for(var i in idsArray){	
					var sql ='update sec_user set lock_status = 0 where sec_user_id = '+idsArray[i];
					console.log(sql);
					await conn.query(sql);
				}
				await conn.commit();
				APP.dbpool_promise.releaseConnection(conn);
				console.log('##########解除锁定成功##########');
				res.json(200, {success: true, msg: 'unlocked successfully' });  
				
			}catch(err){
				console.log("=======",err);
		        APP.dbpool_promise.releaseConnection(conn);
		        if (err) {
		        	await conn.rollback();
		        	var task_true = {
						account:req.session.user,//登录用户名称
						level:0,//日志上报级别
						operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
						result:1,//结果0:成功;1:失败
						operateContent:T.__('To lift')+userName+T.__('User lock failed'),//日志内容
					}
					await common.logSecurity(amqp,'logs_safe_queue',task_true);//记录安全日志

		        	res.json(200, {success: true, msg: 'unlock failed' });  
		    	} else {
		    		var task_true = {
						account:req.session.user,//登录用户名称
						level:0,//日志上报级别
						operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
						result:0,//结果0:成功;1:失败
						operateContent:T.__('To lift')+userName+T.__('User locked successfully'),//日志内容
					}
					await common.logSecurity(amqp,'logs_safe_queue',task_true);//记录安全日志
			        res.json(200, {success: true, msg: 'unlocked successfully' });  
		    	}
			}
		}else{
			console.log('##########无选中解锁对象##########');
			res.json(200, {success: true, msg: 'uncheck Unlock object' }); 
		}
	}

	unlockuser();
});


module.exports = router;