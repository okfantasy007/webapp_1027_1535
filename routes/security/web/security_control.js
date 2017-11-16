var express = require('express');
var router = express.Router();
var async = require('async');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

//初始化访问控制列表数据
router.get("/load", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var sql = "SELECT limit_id as id,\
						ip_limit_type as ip_limit_type,\
						ip_range as ip_range,\
						limit_desc as limit_desc\
		 			FROM sec_ip_limit";
		conn.query(sql, function(err, result){
			//起始ip
			var ip_range_from;
			//结束ip
			var ip_range_to;
			var ip_from_to = {};
			for(var i in result){
				ip_range_from = result[i].ip_range.split('~')[0];
				ip_range_to = result[i].ip_range.split('~')[1];
				ip_from_to['ip_range_from'] = ip_range_from;
				ip_from_to['ip_range_to'] = ip_range_to;

				if(result[i].ip_limit_type == 0){
					result[i] = Object.assign(result[i], ip_from_to);
					console.log("##result[i]##",result[i]);
				}
			}
			if(err){
				conn.release();
				res.json(200, {success: true, msg: err});
			}else{
				conn.release();
				res.json(200, {success: true, root: result});
			}
		});
	});
});

//判断ip访问控制是否已存在
var ip_isExist = function(conn, res, ip_range, callback){
	var sql_ip = "select count(*) as count from sec_ip_limit where ip_range = ?"
	conn.query(sql_ip, [ip_range], function(err, result){
		if(err){
			callback(err);
		}else{
			if(result[0].count > 0){
				conn.release();
				//您创建的IP访问控制已存在
				res.json(200, {success: false, msg: 'the IP access control that you created already exists'});
			}else{
				callback(err);
			}
		}
	});
}

//check ipv4
function isValidIP(ip) {
    var reg = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/
    return reg.test(ip);
} 

//check 子网掩码(通用格式，形如:255.255.255.0)
function isValidSubnet(ip) {
	var reg = new RegExp("(254|252|248|240|224|192|128|0)\\.0\\.0\\.0|255\\.(254|252|248|240|224|192|128|0)\\.0\\.0|255\\.255\\.(254|252|248|240|224|192|128|0)\\.0|255\\.255\\.255\\.(254|252|248|240|224|192|128|0)");
    return reg.test(ip);
} 

//check ip或网段
function check(input){
	if(input.indexOf('/') == -1){
		console.log("input"+input);
		if(isValidIP(input)){
			console.log("true"+input);
			return true;
		}else{
			console.log("falis"+input);
			return false;
		}
		
	}else{
		var ips = input.split('/');
		if(ips.length == 2 && isValidIP(ips[0]) && isValidSubnet(ips[1])){
			console.log("true"+ips[0]+"/"+ips[1]);
			return true;
		}else{
			console.log("falis"+ips[0]+"/"+ips[1]);
			return false;
		}
	}
}

//check 起始ip不大于结束ip
 function compareIP(ipBegin, ipEnd){  
    var begin = ipBegin.split(".");  
    var end = ipEnd.split(".");  	
    for (var i = 0; i < 4; i++){  
        if (begin[i]>end[i]){  
			console.log("起始ip~结束ip"+begin[i]+"~~~"+end[i]);	
            return false;  
        }
    }  
    return true;     
}  

//添加或修改访问控制列表
router.post("/add_upadte", function(req, res, next){
	//访问控制ip的id
	var id = req.body.id;
	//ip
	var ip_range = req.body.ip_range;
	//type=1 ip地址或网段
	if(req.body.ip_limit_type == 1){
		if(!check(ip_range)){
			//请输入合法的ip地址或网段,若输入网段，格式为(ip地址/掩码)
			res.json(200, {success: false, msg: 'please enter a valid ip address or network segment, if the input network segment, the format is (ip address / mask)'});
			return;
		}
	}
	//typr=0 起始ip~结束ip
	if(req.body.ip_limit_type == 0){
		if(isValidIP(req.body.ip_range_from) && isValidIP(req.body.ip_range_to)){
			if(compareIP(req.body.ip_range_from, req.body.ip_range_to)){
				ip_range = req.body.ip_range_from+"~"+req.body.ip_range_to;
			}else{
				//起始ip地址应不大于结束ip地址
				res.json(200, {success: false, msg: 'the starting ip address should not be greater than the end ip address'});
				return;
			}
		}else{
			///请输入合法的ip地址
			res.json(200, {success: false, msg: 'please enter a valid ip address'});
			return;
		}
		
	}
	APP.dbpool.getConnection(function(err, conn){

		var task_isExist_ip = function(callback){
			console.log("@@task_isExist_ip@@");
			//req.body.limit_id是否存在，区分添加和修改
			if(id == '' || typeof(id) == 'undefined'){
				//调用ip_isExist方法
				ip_isExist(conn, res, ip_range, callback);
			}else{
				var sql_id = "select ip_range from sec_ip_limit where limit_id = ?"
				conn.query(sql_id, [id], function(err, result){
					if(err){
						conn.release();
						res.json(200, {success: false, msg: err});
					}else{
						if(result[0].ip_range != ip_range){
							//调用ip_isExist方法
							ip_isExist(conn, res, ip_range, callback);
						}else{
							callback(err);
						}		
					}
				});
			}
		}

		var task_limit = function(callback){
			console.log("@@task_limit@@");
			//req.body.limit_id不存在,添加操作
			if(id == '' || typeof(id) == 'undefined'){
				var sql = "insert ignore into sec_ip_limit\
           					(limit_id,ip_limit_type,ip_range,limit_desc)\
            				values (null,?,?,?)";
				var items = [req.body.ip_limit_type, 
			 				ip_range, 
			 				req.body.limit_desc];
				//执行插入
				conn.query(sql, items, function(err, result){
					console.log("@@sql_insert@@"+sql);
					callback(err);
				});
			//id存在,修改操作
			}else{
				var sql = "update sec_ip_limit\
           					set ip_limit_type = ?,\
           						ip_range = ?,\
           						limit_desc = ?\
           					where limit_id = ?\
            				";
				var items = [req.body.ip_limit_type, 
			 				ip_range, 
			 				req.body.limit_desc,
			 				id];
				//执行插入
				conn.query(sql, items, function(err, result){
					callback(err);
				});
			}		
			
		}

		async.waterfall([task_isExist_ip, task_limit],function(err, results) {
			if(err) {
				console.log(err);
				conn.rollback(); // 发生错误事务回滚
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Adding an access control list operation failed')+','+T.__('ip address or network segment')+':'+ip_range,//日志内容
				}
				if(req.body.id != '' && typeof(req.body.id) != 'undefined'){
					task['operateContent'] = T.__('Modify access control list operation failed')+','+T.__('ip address or network segment')+':'+ip_range;//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日

				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {
				conn.release();
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('Adding an access control list operation succeeded')+','+T.__('ip address or network segment')+':'+ip_range,//日志内容
				}
				if(req.body.id != '' && typeof(req.body.id) != 'undefined'){
					task['operateContent'] = T.__('Modify the access control list operation successfully')+','+T.__('ip address or network segment')+':'+ip_range;//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: true, msg: 'Operation Success!' }); 
			}		
		});

	});
});

//删除访问控制
router.post("/delete", function(req, res, next){
	//删除id集合
	var ids = req.body.ids.split(',');
	var ip_range = req.body.ip_range;
	var sqls = [];
	APP.dbpool.getConnection(function(err, conn){
		//开启事务
		conn.beginTransaction();

		//sec_ip_limit表
		var sql_ip_limit = sprintf("DELETE FROM `sec_ip_limit` WHERE `limit_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_ip_limit);

		//sec_user_iplimit表
		var sql_user_iplimit = sprintf("DELETE FROM `sec_user_iplimit` WHERE `limit_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_user_iplimit);

		conn.query(sqls.join(';'),function(err,result){
			if(err) {
				conn.rollback();
				conn.release();
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Deleting access control list operation failed')+','+T.__('ip address or network segment')+':'+ip_range,//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: false, msg: 'Operation Failure!' });
			} else {
				conn.commit();
				conn.release();
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('Delete the access control list operation successfully')+','+T.__('ip address or network segment')+':'+ip_range,//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: true, msg: 'Operation Success!' }); 
			}
		});
	});
});

module.exports = router;