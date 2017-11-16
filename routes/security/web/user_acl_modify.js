var express = require('express');
var router = express.Router();
var async = require('async');
var http = require('http');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {
	console.log(req.body);
	var userId = req.body.sec_user_id;
	var aclMode = req.body.use_all_acl;
	var selectControlListId = req.body.selectControlListId;
	var userName = req.body.name;
	var conn = null;
	async function modifyAclInfo(){
		try{
			var sql = 'update sec_user set ip_limit_mode = '+aclMode +' where sec_user_id = '+userId;
			console.log(sql);
			conn = await APP.dbpool_promise.getConnection();
			await conn.beginTransaction();
			await conn.query(sql);
			if(aclMode==2){
			    //删除用户数据
			    sql = 'delete from sec_user_iplimit where sec_user_id = '+userId;
			    await conn.query(sql);
		    	var acl = selectControlListId.split(','); 
			 	for(var i in acl){
				 	sql = "insert into  sec_user_iplimit (sec_user_id,limit_id) values ("+userId+","+acl[i]+")";
				 	await conn.query(sql);
			 	}				
			}
			await conn.commit();

			console.log('##########修改用户acl信息成功##########');
			var querySql = "select user_name from sec_user where sec_user_id = "+userId;
			rows = await conn.query(querySql);
			var name = rows[0].user_name;
			var log_parm = await onlineUserKickoff(name);
			console.log('$$$$$$$log_parm',log_parm);
			var data = {  
		        log_parm: log_parm,
		        message:'User permissions changed, please log in again! After a minute will be forced off the assembly line',  
		    };  
		    data = require('querystring').stringify(data);  
		    console.log('ee3eeeeeeee',data); 

    		var request = http.request( 
		        {  
		            host: 'localhost',  
		            port: req.app.get('port'),  
		            method: "POST",                 
		            path: '/kickoffuser',
		            headers: {  
		                "Content-Type": 'application/x-www-form-urlencoded',  
		                "Content-Length": data.length  
		            }                  
		        },
	        	function(request) {
	        		
	            	if(request.statusCode=='200'){
	                 var body = ""; 
	                 var resultBody; 
	                    request.on('data', function (data) { body += data;})  
	                           .on('end', function () { 
	                            resultBody = JSON.parse(body);
	                            if(resultBody.success== true){   
	                                res.json(200, {success: true, msg: 'modify user acl information successfully'}); 
	                            } else{ 
	                                  
	                                res.json(200, {success: false, 'msg': resultBody.msg});  
	                            }                 
	                       })          
		            }else{
		                res.json(200, {success: true, msg: 'failed to modify user acl information' });  
		            }
	        	} 

    		);  
		    request.write(data);  
		    request.end();

		    var task = {
				account:req.session.user,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
				result:0,//结果0:成功;1:失败
				operateContent:T.__('Modify')+userName+T.__('User access control information is successful'),//日志内容
			}
			await common.logSecurity(amqp,'logs_safe_queue',task);//记录安全日志

			await APP.dbpool_promise.releaseConnection(conn);
			
			// res.json(200, {success: true, msg: 'modify user acl information successfully'}); 
		}catch(err){
        	await conn.rollback();
        	APP.dbpool_promise.releaseConnection(conn);
        	if(selectControlListId==''&&aclMode==2){
        		console.log('##########修改用户acl信息失败##########',err);
        		res.json(200, {success: true, msg: 'modify the user acl information failed, ip list can not be empty' });
        	}else{
        		console.log('##########修改用户acl信息失败##########',err);
        		var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Modify')+userName+T.__('User access control message failed'),//日志内容
				}
				await common.logSecurity(amqp,'logs_safe_queue',task);//记录安全日志
        		res.json(200, {success: true, msg: 'failed to modify user acl information' });  
        	}
	        	
		}	
	};
	modifyAclInfo();
});


function onlineUserKickoff(name){ 
	return new Promise(function (resolve, reject) {
		try{	
			APP.sessionStore.all(function(error, sessions){
				var sessions = JSON.stringify(sessions); 
				var rows = JSON.parse(sessions);
				// var rows = eval(sessions);
				var log_parm = '';
				for(var i in rows){
					var data = JSON.parse(JSON.stringify(rows[i]));
					if(data.user==name){
						//log_parm = sessionId*username*ip*type 日志参数
						log_parm+= data.id+"*"+data.user+"*"+data.ip_address+"*"+3+','
					}						
				}
				log_parm = (log_parm == ''?'':log_parm.substring(0,log_parm.length-1));
				resolve(log_parm);
			});			
		}catch(err){
	        reject(err);
		}
	});
}


module.exports = router;
