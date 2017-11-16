var express = require('express');
var router = express.Router();
var async = require('async');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

//获取安全策略信息
router.get("/load",function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		//同时查询密码策略和账户策略信息
		async.series({
			pwa: function(callback) {
				var sql = 
				'select sec_pwd_strategy_id,\
				 	user_pwd_minilength,\
					admin_pwd_minilength,\
					pwd_maxlength,\
					new_old_pwd_diffethree_time,\
					pwd_short_save_days,\
					pwd_letter_minimum_num,\
					pwd_uppercase_minimum_num,\
					pwd_lowercase_minimum_num,\
					pwd_number_minimum_num,\
					pwd_special_char_minimum_num,\
					max_name_pwd_same_num,\
					no_name_char_num,\
					pwd_no_name_reverse,\
					pwd_no_four_series,\
					pwd_no_increase_degressive\
				from sec_pwd_strategy\
				where sec_pwd_strategy_id = 1;\
				';
				conn.query(sql, function(err, result) {
					callback(err, result); // 将结果传入callback
				});
			},
			account: function(callback) {
				var sql = 
				' select sec_account_strategy_id,\
					name_minilength,\
					error_pwd_num_lock,\
					forever_lock,\
					auto_unlock_time,\
					admin_no_lock,\
					pwd_expire_clew_days\
				from sec_account_strategy\
				where sec_account_strategy_id = 1;\
				';
				conn.query(sql, function(err, result) {
					callback(err, result);
				});
			}
			},function(err, results) {
				if(err) {
					console.log(err);
					conn.release();//释放链接
					res.json(200, {success: false, msg: err }); 
				} else {
					conn.release();//释放链接
					//合并查询到的两个结果集
					var result = Object.assign(results.pwa[0],results.account[0]);
					res.json(200, {success: true, data: result }); 
				}					
			}
		);

	});
});

//更新安全策略信息路由
router.post("/update",function(req, res, next){
	//获取请求参数
	var params = req.body;
	console.log(params);
	if(JSON.stringify(params) == "{}" || typeof(params) == "undefined"){
		res.json(200, {succsee: false, msg: 'Operation Failure!'});
	}
	APP.dbpool.getConnection(function(err, conn){
		//更新任务
		var tasks = [function(callback) {
				//开启事务
				conn.beginTransaction(function(err) {
				callback(err);
				});
			},
			//密码策略
			function(callback) {
				//最少字母个数（Number-字符串转数字)
				var letter = Number(params.pwd_letter_minimum_num);
				//最少大写加小写字母个数
				var up_low_num = Number(params.pwd_uppercase_minimum_num) + Number(params.pwd_lowercase_minimum_num);
				//最少字符数
				var pwd_letter_minimum_num = letter > up_low_num?letter:up_low_num;
			
				var sql = 
					'update sec_pwd_strategy \
						set user_pwd_minilength = ?,\
							admin_pwd_minilength = ?,\
							pwd_maxlength = ?,\
							pwd_short_save_days = ?,\
							pwd_letter_minimum_num = ?,\
							pwd_uppercase_minimum_num = ?,\
							pwd_lowercase_minimum_num = ?,\
							pwd_number_minimum_num = ?,\
							pwd_special_char_minimum_num = ?,\
							max_name_pwd_same_num = ?,\
							pwd_no_name_reverse = ?,\
							pwd_no_four_series = ?,\
							pwd_no_increase_degressive = ?,\
							new_old_pwd_diffethree_time = ?\
						';
				if(typeof(params.no_name_char_num) != 'undefined'){
					sql += ', no_name_char_num = ?';
				}	
					sql += 'where sec_pwd_strategy_id = 1;';
					
				var items = [params.user_pwd_minilength,
						params.admin_pwd_minilength,
						params.pwd_maxlength,
						params.pwd_short_save_days,	
						params.pwd_letter_minimum_num,
						params.pwd_uppercase_minimum_num,
						params.pwd_lowercase_minimum_num,
						params.pwd_number_minimum_num,
						params.pwd_special_char_minimum_num,
						params.max_name_pwd_same_num,
						params.pwd_no_name_reverse,
						params.pwd_no_four_series,
						params.pwd_no_increase_degressive,
						params.new_old_pwd_diffethree_time
				];
				if(typeof(params.no_name_char_num) != 'undefined'){
					items.push(params.no_name_char_num);
				}

				//密码策略校验
				if(Number(params.user_pwd_minilength) > Number(params.pwd_maxlength)){
					conn.release();//释放链接
					//普通用户密码最小长度值不能大于密码长度最大值
					res.json(200, {succsee: false, 'msg': 'the minimum length of the normal user password can not be greater than the maximum password length'});
				}else if(Number(params.admin_pwd_minilength) > Number(params.pwd_maxlength)){
					conn.release();
					//超级用户密码最小长度值不能大于密码长度最大值
					res.json(200, {succsee: false, 'msg': 'the minimum length of the super user password can not be greater than the maximum password length'});
				}else if(pwd_letter_minimum_num + Number(params.pwd_number_minimum_num) + Number(params.pwd_special_char_minimum_num) > Number(params.pwd_maxlength)){
					conn.release();
					//要求的最少字符数之和不能大于密码长度最大值
					res.json(200, {succsee: false, 'msg': 'the minimum number of characters required can not be greater than the maximum password length'});
				}else{
					conn.query(sql, items, function(err, result){
						callback(err);
					});
				 }
			}, 
			//账户策略
			function(callback) {
				var sql_account = 
					'update sec_account_strategy \
						set name_minilength = ?,\
						error_pwd_num_lock = ?,\
						admin_no_lock = ?,\
						pwd_expire_clew_days = ?,\
						forever_lock = ?\
					';
				if(typeof(params.auto_unlock_time) != 'undefined'){
					sql_account += ', auto_unlock_time = ?';
				}	
				sql_account += 'where sec_account_strategy_id = 1;';

				var items = [params.name_minilength,params.error_pwd_num_lock,params.admin_no_lock,
							params.pwd_expire_clew_days,params.forever_lock];

				if(typeof(params.auto_unlock_time) != 'undefined'){
					items.push(params.auto_unlock_time);
				}

				conn.query(sql_account, items, function(err, result){
					callback(err);
				});
			}, function(callback) {
					conn.commit(function(err) {
					callback(err);
				});
			}];

		//同时更新密码策略和账户策略信息
		async.waterfall(tasks,function(err, results) {
			if(err) {
				console.log(err);
				conn.rollback(); // 发生错误事务回滚
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Update security policy operation failed'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {
				//返回结果
				console.log("操作成功");
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('The update security policy was successful'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: true, msg: 'Operation Success!' }); 
			}
				conn.release();//释放链接
		});
	});
});
module.exports = router;