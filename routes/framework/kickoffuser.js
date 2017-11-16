var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');
var common = require('../security/rest/common.js');


router.post('/', function(req, res, next) {

	var log_parm = req.body.log_parm;
	var log_parmArr = [];
	if(typeof(log_parm) != 'undefiend' && log_parm != ''){
		log_parmArr = log_parm.split(',');
	}
	var sessionsArray = [];
	var ipsArr = [];
	for(var i in log_parmArr){
		sessionsArray.push(log_parmArr[i].split('*')[0]);
		ipsArr.push(log_parmArr[i].split('*')[2]);
	}
	console.log('sessionsArraysessionsArray---------------------->',sessionsArray);
	console.log('ipsArripsArripsArripsArripsArr---------------------->',ipsArr);
	if(typeof(req.body.message) == 'undefined' || req.body.message == 'undefiend'){
		var msg = {
			'message':'You have been forced to go offline by the administrator and will exit the system after one minute',
			'log_parm':log_parm,//退出日志参数(强制退出)
		};
	}else{
		var msg = {
			'message': req.body.message,
			'log_parm':log_parm,//退出日志参数(强制退出)
		};
	}
	console.log('强制退出---------------msg-------------->',msg);
	APP.mqtt_client.publish('user_kickoff', JSON.stringify(msg,null,2));	
	function myfunc(req){
		for(var i in sessionsArray){
			(function(i){
				APP.sessionStore.get(sessionsArray[i],function(error, sessionss){
					if(typeof(sessionss)!='undefined'){
						console.log('&&&&&sessionss',sessionss);
						var name = JSON.parse(JSON.stringify(sessionss)).user;
						// if(APP.securityManagerCenter[name]!='undefined'){
					 //    	delete APP.securityManagerCenter[name];	  			    		
					 //    }
					    var task = {
					    	sessionID:sessionsArray[i],//用户sessionID
							account:name,//登录用户名称
							type:3,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
							level:0,//日志上报级别
							operateTerminal:ipsArr[i],//操作用户所在客户端的对外IP
							result:0,//结果0:成功;1:失败
							operateContent:T.__("Exit the system (forced by the administrator off the assembly line)"),//日志内容
						}
						common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志

						APP.sessionStore.destroy(sessionsArray[i],function(error){
							console.log('********',sessionsArray[i]);			
						});
					}
				});	
			})(i)		
		}
	}  
	setTimeout(myfunc,70*1000);
	res.json(200, {
		success: true,
		msg: 'oper success'
	});  
     	   
});


module.exports = router;