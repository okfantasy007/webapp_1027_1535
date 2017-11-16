var async = require('async');
var express = require('express');
var router = express.Router();
var express = require('express');
var http = require('http');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {

	var userId = req.body.sec_user_id;
	var selectedId = req.body.selectedId;
	var userName = req.body.name;
	console.log('---+++++----req.body.name----+++++++--',req.body.name);
	var conn = null;
	console.log('###############',selectedId);
	async function modifyUseOfUsergroup(){
		try{
			var sql ="select t1.sec_usergroup_id from sec_user_belongto_usergroup t1 ,sec_usergroup t2 where t2.is_user_private = 1 and t1.sec_usergroup_id=t2.sec_usergroup_id and sec_user_id ="+userId;
			conn = await APP.dbpool_promise.getConnection();
			await conn.beginTransaction();
			var rows = await conn.query(sql);
			var usergroupId = rows[0].sec_usergroup_id;
			
			sql = "delete from sec_user_belongto_usergroup where sec_usergroup_id not in ("+usergroupId+") and sec_user_id = "+userId;
			await conn.query(sql);
			var selectedIdArray=[];
			if(selectedId!=null&&selectedId!=''&&selectedId!='undefined'){
				selectedIdArray = selectedId.split(',');
			}
			

			for(var i in selectedIdArray){
				sql = "insert into sec_user_belongto_usergroup (sec_user_id,sec_usergroup_id) values ("+userId+","+selectedIdArray[i]+")";
				console.log(sql);
				await conn.query(sql);
			}
			console.log('##########修改用户所属用户组信息成功##########');
			var querySql = "select user_name from sec_user where sec_user_id = "+userId;
			rows = await conn.query(querySql);
			var name = rows[0].user_name;
			await conn.commit();

			var names = [];
			names.push(name);
			var log_parm = await onlineUserKickoff(names);
		  	if(log_parm==''||log_parm=='undefined' || typeof(log_parm) == 'undefined'){
		    	await APP.dbpool_promise.releaseConnection(conn);
		    	res.json(200, {success: true, msg: 'modify the user group information belongs to the user successfully'}); 
		    	return;
		    } 
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
	        		console.log(request.body);
	            	if(request.statusCode=='200'){
	                 var body = ""; 
	                 var resultBody; 
	                    request.on('data', function (data) { body += data;})  
	                           .on('end', function () { 
	                            resultBody = JSON.parse(body);
	                            if(resultBody.success== true){   
	                                res.json(200, {success: true, msg: 'modify the user group information belongs to the user successfully'}); 
	                            } else{ 
	                                  
	                                res.json(200, {success: false, 'msg': resultBody.msg});  
	                            }                 
	                       })          
		            }else{
		                res.json(200, {success: true, msg: 'failed to modify user group user information' });  
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
				operateContent:T.__('Modify')+userName+T.__('User group user information is successful'),//日志内容
			}
			await common.logSecurity(amqp,'logs_safe_queue',task);//记录安全日志 
			
		    await APP.dbpool_promise.releaseConnection(conn);
			// res.json(200, {success: true, msg: 'modify the user group information belongs to the user successfully'}); 
		}catch(err){
        	await conn.rollback();
        	APP.dbpool_promise.releaseConnection(conn);
        	console.log('##########修改用户所属用户组信息失败##########',err);
        	var task = {
				account:req.session.user,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
				result:1,//结果0:成功;1:失败
				operateContent:T.__('Modify')+userName+T.__('User group user information failed'),//日志内容
			}
			await common.logSecurity(amqp,'logs_safe_queue',task);//记录安全日志

        	res.json(200, {success: true, msg: 'failed to modify user group user information' });  
	    	 
		}
		
	}
	modifyUseOfUsergroup();

});

function onlineUserKickoff(name){ 
	return new Promise(function (resolve, reject) {
		try{	
			APP.sessionStore.all(function(error, sessions){
				var sessions = JSON.stringify(sessions); 
				var rows  = JSON.parse(sessions);
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