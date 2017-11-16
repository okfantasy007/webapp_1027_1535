var express = require('express');
var router = express.Router();
var async = require('async');
var sd = require('silly-datetime');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {
	async function modifyGenericUserInfo(){
		var conn = null;
		var userName = req.body.user_name;
		try{
			conn = await APP.dbpool_promise.getConnection();
			var userMap={};
			var strategyMap={};
			var filter = "sec_user_id ="+req.body.sec_user_id;
			strategyMap['change_password_next_login']=req.body.change_password_next_login;
			userMap['user_desc']="'"+req.body.user_desc+"'";
			if(req.body.sec_user_id != 1){
				userMap['full_name']="'"+req.body.full_name+"'";
			}
			strategyMap['cannot_change_password']=req.body.cannot_change_password;
			strategyMap['closed_temporarily']=req.body.closed_temporarily;
			strategyMap['password_valid_days_flag']=req.body.password_valid_days_nolimit;
			var pwdValidDays = 0;
			if(req.body.password_valid_days_nolimit==0){
				pwdValidDays = parseInt(req.body.password_valid_days);
				strategyMap['password_valid_days'] = pwdValidDays;
			}

			var pwdExpiredDate = '';
			if(pwdValidDays==0){
				pwdExpiredDate = '2038-01-08 03:00:00';
			}else{
				pwdExpiredDate = getPasswordValidData(pwdValidDays);
			}
			userMap['pw_expired_date']="'"+pwdExpiredDate+"'";
			strategyMap['max_online_num_flag']=req.body.max_online_num_nolimit;
			if(req.body.max_online_num_nolimit==0){
				strategyMap['max_online_num'] = req.body.max_online_num;
			}
			strategyMap['time_period_flag']=req.body.time_period_flag;
			if(req.body.time_period_flag==1){
				var b1= req.body.begin_date==''||req.body.begin_date==null;
				var b2 = req.body.end_date==''||req.body.end_date==null;
				var b3 = req.body.begin_time_per_day==''||req.body.begin_time_per_day==null;
				var b4 = req.body.end_time_per_day==''||req.body.end_time_per_day==null;
				var b5 = b1 && b2 && b3 && b4;

				var a1= req.body.begin_date!=''&&req.body.begin_date!=null;
				var a2 = req.body.end_date!=''&&req.body.end_date!=null;
				var a3 = req.body.begin_time_per_day!=''&&req.body.begin_time_per_day!=null;
				var a4 = req.body.end_time_per_day!=''&&req.body.end_time_per_day!=null;
				var a5 = a1 && a2 && a3 && a4;

				if(!(b5||a5)){
					//##########可登录时间不能为空##########	
			  		res.json(200, {
			  			failure: true,	
			  			msg: 'the logon time can not be empty'			
			  		});  
				}else if(a5){
					console.log(endTime);
					var beginDay = req.body.begin_date;
					var endDay = req.body.end_date;
					var beginTime = req.body.begin_time_per_day;
					var endTime = req.body.end_time_per_day;
					if((beginDay>endDay)||(beginTime>endTime)){
						console.log('##########开始日期或时间不能大于结束时间##########');		
				  		res.json(200, {
				  			failure: true,	
				  			msg: 'the start date or time cannot be greater than the end time'			
				  		});  
					}else{
						strategyMap['begin_date'] = "'"+req.body.begin_date+"'";
						strategyMap['end_date'] =  "'"+req.body.end_date+"'";
						strategyMap['begin_time_per_day'] =  "'"+req.body.begin_time_per_day+"'";
						strategyMap['end_time_per_day'] =  "'"+req.body.end_time_per_day+"'";
						strategyMap['monday'] =  "'"+req.body.monday+"'";
						strategyMap['tuesday'] =  "'"+req.body.tuesday+"'";
						strategyMap['thursday'] =  "'"+req.body.thursday+"'";
						strategyMap['friday'] =  "'"+req.body.friday+"'";
						strategyMap['wednesday'] =  "'"+req.body.wednesday+"'";
						strategyMap['saturday'] =  "'"+req.body.saturday+"'";
						strategyMap['sunday'] =  "'"+req.body.sunday+"'";
					}	
				}
			}
			
			await conn.beginTransaction();
			var sql = fromMapToUpSql(userMap,'sec_user',filter);
			await conn.query(sql);
			sql = fromMapToUpSql(strategyMap,'sec_user_strategy',filter);
			await conn.query(sql);
			await conn.commit();
			var task={
				account:req.session.user,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
				result:0,//结果0:成功;1:失败
				operateContent:T.__('Modify')+userName+T.__('User general information is successful'),//日志内容
			};
			await common.logSecurity(amqp,'logs_safe_queue',task);//记录安全日志

			await APP.dbpool_promise.releaseConnection(conn);
			console.log('##########修改用户信息成功##########');
			res.json(200, {success: true, msg: 'modify user information successfully' }); 			
		}catch(err){
	        if (err) {
	        	console.log('##########',err);
	        	await conn.rollback();
	        	APP.dbpool_promise.releaseConnection(conn);
	        	res.json(200, {success: true, msg: 'failed to modify user information' });  
	    	} else {
	    		APP.dbpool_promise.releaseConnection(conn);
		        res.json(200, {success: true, msg: 'failed to modify user information' });  
	    	}
	    	var task = {
				account:req.session.user,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
				result:1,//结果0:成功;1:失败
				operateContent:T.__('Modify')+userName+T.__('User general information failed'),//日志内容
			}
			await common.logSecurity(amqp,'logs_safe_queue',task);//记录安全日志
		}
	}
	modifyGenericUserInfo();

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

function getPasswordValidData(pwdValidDays){
	if(pwdValidDays < 1){
		return "2038-01-08 03:00:00";
	}
	var date=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
	var dateTime = new Date(date).getTime();
	var time = dateTime+24*60*60*1000*pwdValidDays;
	return(sd.format(new Date(time), 'YYYY-MM-DD HH:mm:ss'));	
}


module.exports = router;