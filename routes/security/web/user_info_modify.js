
var express = require('express');
var router = express.Router();
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {
	var map={};
	var userName = req.body.name;
	var filter = "sec_user_id ="+req.body.sec_user_id;
	map['dept']="'"+req.body.dept+"'";
	map['tel']="'"+req.body.tel+"'";
	map['fax']="'"+req.body.fax+"'";
	map['e_mail']="'"+req.body.e_mail+"'";
	map['mailcode']="'"+req.body.mailcode+"'";
	map['address']="'"+req.body.address+"'";
	var sql = fromMapToUpSql(map,'sec_user',filter);
	APP.dbpool.getConnection(function(err, conn) {
		conn.query(sql, function(err,result) {
			conn.release();
			if (err) {
				console.log('##########修改用户信息失败##########',err);
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Modify')+userName+T.__('User details operation failed'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

		  		res.json(200, {
		  			failure: true,	
		  			msg: 'failed to modify user information'			
		  		});  
			} else {
			    console.log('##########修改用户信息成功##########');
			    var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('Modify')+userName+T.__('User details are successful'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

		  		res.json(200, {
		  			success: true,
		  			msg: 'modify user information successfully'
		  		});  
  			}
		});

	});


});


function fromMapToUpSql(map,tableName,filter){
	var sql = "update "+tableName+" set #2 where " +filter;
	var values = '';
	for(var key in map){
		values = values+key+"="+map[key]+",";
	}
	values = values.substring(0,values.length-1);
	sql = sql.replace(/#2/,values);
	console.log('#########return sql:'+sql);
	return sql;
}


module.exports = router;