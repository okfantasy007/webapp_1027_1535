var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');
var common = require('../security/rest/common.js');

router.get('/', function(req, res, next) {

	if(typeof(req.query.log_parm) != 'undefined' &&req.query.log_parm != ''){
		var session_id = req.query.log_parm.split('*')[0];
		var username = req.query.log_parm.split('*')[1];
		var ip = req.query.log_parm.split('*')[2];
		var type = req.query.log_parm.split('*')[3];
	}
	var log_type = req.query.log_type;
	var log_task = {
		sessionID:req.sessionID,//用户sessionID
		account:req.session.user,//登录用户名称
		level:0,//日志上报级别
		operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
		result:0,//结果0:成功;1:失败		
	}

	//正常退出
	if(log_type == 1){
		log_task.type = 1;//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
		log_task.operateContent = T.__("Exit system (normal exit)"),//日志内容
		common.logSecurity_waterfall(amqp,'logs_login_queue',log_task);//记录安全日志
	}
	//异常退出
	if(log_type == 4){
		log_task.type = 4;//登录类型 0 登录 1 正常退出2 超时退出3 强制退出4 异常退出
		log_task.operateContent = T.__("Exit the system (abnormal exit)"),//日志内容
		common.logSecurity_waterfall(amqp,'logs_login_queue',log_task);//记录安全日志
	}  
	//强制退出
    if(type == 3){
		var task = {
			sessionID:session_id,//用户sessionID
			account:username,//登录用户名称
			type:3,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
			level:0,//日志上报级别
			operateTerminal:ip,//操作用户所在客户端的对外IP
			result:0,//结果0:成功;1:失败
			operateContent:T.__("Exit the system (forced by the administrator off the assembly line)"),//日志内容
		}
		common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志
	}  

	if(req.session!=null||typeof(req.session)!='undefined'){
		var user = req.session.user;
    	// if(APP.securityManagerCenter[user]!='undefined'){
    	// 	delete APP.securityManagerCenter[user];
    	// 	// console.log('********',APP.securityManagerCenter);
    	// }

    }
    req.session.destroy(function(){
     	 res.redirect('login');
    });
});


module.exports = router;