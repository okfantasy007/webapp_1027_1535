var async = require('async');
var express = require('express');
var router = express.Router();
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {
	async function del_user(){
		var conn = null;
		var rows;
		var result;
		var userName = req.body.name.split(',');
		console.log('-----req.body.namereq.body.name-----',req.body.name);
		try{
			conn = await APP.dbpool_promise.getConnection();
			await conn.beginTransaction();
			console.log(req.body.ids);
			var delIds = req.body.ids;
			if(delIds!=''&&typeof(delIds)!='undefined'){
				var ids = delIds.split(',');
				console.log(ids);
				var k = 0;
				for(var i in ids){
					var querySql = "select user_name from sec_user where sec_user_id = "+ids[i];
					rows = await conn.query(querySql);
					var name = rows[0].user_name;

					//是否有用户在线
					var a = await isOnline(name,conn);
					console.log('$$$$$$$$$$$',a);
					if(a=='true'){
						console.log('#########该用户在线无法删除该用户##########');
						for(var i = 0; i < userName.length; i++){
							if(userName.indexOf(name) != -1){
								userName.splice(i,1);
							}
						}
						res.json(200, {success: true, msg: 'the user is online, cannot delete!' });
						break;
					}else{
						k++;
					}
				}
				if(k==ids.length){
					for(var i in ids){
						var querySql = "select user_name from sec_user where sec_user_id = "+ids[i];
						rows = await conn.query(querySql);
						var name = rows[0].user_name;
						// if(APP.securityManagerCenter[name]!='undefined'){
						// 	console.log('********',APP.securityManagerCenter);
				  //   		delete APP.securityManagerCenter[name];
				    		
				  //   	}
						var sql = "delete from sec_user_password_history where user_name = '"+name+"'";
						await conn.query(sql);
						var delSql = "delete from sec_usergroup_res_fun_access where sec_usergroup_id in (select sec_usergroup_id from sec_user_belongto_usergroup where  sec_user_id = " + ids[i] + ");";
						await conn.query(delSql);
						delSql = "delete from sec_usergroup_res_access where sec_usergroup_id in (select sec_usergroup_id from sec_user_belongto_usergroup where  sec_user_id = " + ids[i] + ");";
						await conn.query(delSql);
						delSql = "delete from sec_usergroup where is_user_private = 1 and sec_usergroup_id in (select sec_usergroup_id from sec_user_belongto_usergroup where sec_user_id = " + ids[i] + ");";
						await conn.query(delSql);
						delSql = "delete from sec_user_belongto_usergroup where sec_user_id = " + ids[i] + ";";
						await conn.query(delSql);
						delSql = "delete from sec_user_iplimit where sec_user_id = " + ids[i] + ";";
						await conn.query(delSql);
						delSql = "delete from sec_user_strategy where sec_user_id = " + ids[i] + ";";
						await conn.query(delSql);
						delSql = "delete from sec_user where sec_user_id = " + ids[i];
						await conn.query(delSql);			
					}

					console.log('^^^^^^^^^^^^^^^^^^^^^^^');
					if(userName.length > 0){
						var task_true = {
							account:req.session.user,//登录用户名称
							level:0,//日志上报级别
							operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
							result:0,//结果0:成功;1:失败
							operateContent:T.__('Delete')+userName.join(',')+T.__("User operation is successful"),//日志内容
						}
						await common.logSecurity(amqp,'logs_safe_queue',task_true);//记录安全日志

					}

					await conn.commit();
					await APP.dbpool_promise.releaseConnection(conn);
					console.log('##########删除用户成功##########');
					res.json(200, {success: true, msg: 'delete user success' }); 
				}				
			}else{
				console.log('##########无选中删除对象##########');
				res.json(200, {success: true, msg: 'unselected delete user' }); 
			}
		}catch(err){
			console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	await conn.rollback();
	        	var task_false = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Delete')+userName.join(',')+T.__("User operation failed"),//日志内容
				}
				common.logSecurity(amqp,'logs_safe_queue',task_false);//记录安全日志

	        	res.json(200, {success: true, msg: 'delete user fails' });  
	    	} else {
		        res.json(200, {success: true, msg: 'delete user success' });  
	    	}
		}

	};

	del_user();

});


function isOnline(name){
	return new Promise(function (resolve, reject) {
		try{	
			APP.sessionStore.all(function(error, sessions){
				var sessions = JSON.stringify(sessions); 
				sessions = JSON.parse(sessions);
				var rows = eval(sessions); 
				for(var i in rows){
					var data = JSON.parse(JSON.stringify(rows[i]));
					if(data.user==name){
						console.log('%%%%%%%%%%%',name);
						resolve('true');
					}						
				}
				resolve('false');
			});			
		}catch(err){
			console.log("=======",err);
	        reject(err);
		}
	});
}


module.exports = router;