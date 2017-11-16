var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('./security_domain.js');
var common = require('../rest/common.js');
var http = require('http');
var amqp = require('amqplib/callback_api');

//用户组信息
router.get("/load", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var sql = 
			'select sec_usergroup_id,\
	    	 	    sec_usergroup_name,\
	    	  		sec_usergroup_fullname,\
	    	  		sec_usergroup_desc,\
	    	  		enable_status AS enable_status,\
	    	  		DATE_FORMAT(create_time,"%Y-%m-%d %h:%i:%s") AS create_time,\
	    	  		is_user_private,\
	    	  		sec_usergroup_type AS sec_usergroup_type\
	    	 	from sec_usergroup\
	    	 	where is_user_private = 0;\
	    	 ';

	    conn.query(sql,function(err, rows, fields){
	    	if(err){
	    		conn.release();
	    		//未知错误
	    		res.json(200, {success: false, msg: 'unkown err'});	
	    	}else{
	    		conn.release();
	    		console.log(rows);
	    		res.json(200, {success: true, root: rows });
	    	}
	    });
	});
});

//用户组类型
router.get("/usergroup_type", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var sql = "select * from sec_usergroup_type";
		conn.query(sql,function(err, result){
			var array =[];
			for(var i in result){
				var id = result[i].id
				var type = result[i].usergroup_type
				var temp = [];
				temp.push(type);
				temp.push(id);	
				array.push(temp);
			}
			if(err){
	    		conn.release();
	    		res.json(200, {success: false, msg: 'unkown err'});	
	    	}else{
	    		conn.release();
	    		res.json(200, array);
	    	}
		});
	});
});

//判断用户组名是否存在
var isExist_name = function(conn, res, group_name, callback){
	var count_sql = "select count(*) AS count from sec_usergroup where is_user_private = 0 and sec_usergroup_name = ?";
	conn.query(count_sql, [group_name], function(err, result){
		if(err){
			callback(err);
		}else{
			if(result[0].count > 0){
				conn.release();
				//该用户名已存在,请重新输入
				res.json(200, {success: false, msg: 'the user name already exists, Please re-enter it' });
			}else{
				callback(err);
			}	
		}
	});
}

//添加用户组路由
router.post("/add", function(req, res, next){
	console.log("@@req.body##",req.body);
	//用户组名
	var usergroup_name = req.body.sec_usergroup_name;
	//已选用户id
	var ids_selected = req.body.selectedId;
	var subnetDevSet = req.body.subnetDevArr;
	var subnetSet = req.body.subnetArr;
	var symbolSet = req.body.symbolArr;
	var delSubnetSet = req.body.delSubnetArr;
	var delSymbolSet = req.body.delSymbolArr;
	try{
		APP.dbpool.getConnection(function(err, conn){
			//开启事务
			var task_start = function(callback) {
				console.log("###task_start@@@");
				conn.beginTransaction(function(err) {
				callback(err);
				});
			}
			//判断用户组名是否存在
			var task_isExist_name = function(callback){
				console.log("###task_isExist_name@@@");
				//调用isExist_name
				isExist_name(conn, res, usergroup_name, callback);
			}
			//添加常规信息
			var task_basic = function(callback){
				console.log("###task_basic@@@");
				var sql = sprintf(
					"insert ignore into  `sec_usergroup`(\
						`sec_usergroup_id`,\
						`sec_usergroup_name`,\
						`sec_usergroup_fullname`,\
						`sec_usergroup_desc`,\
						`enable_status`,\
						`create_time`,\
						`is_user_private`,\
						`sec_usergroup_type`)\
					values (NULL,  '%s',  '%s',  '%s',  %d,  now(),  %d,   %d)",
					req.body.sec_usergroup_name,
					req.body.sec_usergroup_fullname,
					req.body.sec_usergroup_desc,
					1,//enable_status_str
					0,//is_user_private
					req.body.sec_usergroup_type							
					);
				conn.query(sql, function(err, result){
					if(err){
						callback(err,'');
					}else{
						//将插入id传入下一个函数
			 	 		callback(err, result.insertId);
			 		 }
				 });
			}

			//添加用户组成员信息
			var task_users = function(insertId, callback){
				console.log("###task_users@@@");
				var sql = "insert ignore into sec_user_belongto_usergroup (\
			               		sec_user_id,\
			                	sec_usergroup_id)\
			            		values\
			            	";
			    if(ids_selected == '' || typeof(ids_selected) == 'undefined'){
					callback(null,insertId);
			    }else{
			    	var insert_items = [];
			    	var ids = ids_selected.split('-');
			    	for(var i in ids){
			            var items = "("+ids[i]+","+insertId+")";
		            	insert_items.push(items);	
					}
					sql = sql + insert_items.join(',') + ';';
			    	conn.query(sql, function(err, result){
	        			callback(err,insertId);							
	        		});			
			    }		
			}
			   

			//添加管理域信息
			var task_managerment = function(insertId,callback){
				console.log("###task_managerment@@@");
				console.log("###insertIdinsertIdinsertIdinsertId@@@",insertId);
				var sql_del = comm.delOldDomain(insertId,delSubnetSet,delSymbolSet);
				var sql_in = comm.insertNewDomain(insertId,subnetDevSet,subnetSet,symbolSet);
				var sqls = [];
				sqls = sql_del.concat(sql_in);
				console.log("sqlssqls###task_managerment@@@sqlssqls",sqls);
				if(sqls.length > 0){
					conn.query(sqls.join(';'), function(err, result){
						callback(err,insertId);
					});
				}else{
					callback(null,insertId);
				}
			}

			//添加操作权限信息
			var task_access_operator = function(insertId,callback){
				console.log("###task_access_operator@@@");
				console.log("----task_access_operatorinsertId----",insertId);
				var operator_ids = req.body.opSelectedIds;
				var sqls = [];
				sqls = comm.addOperator(insertId,operator_ids)
				if(sqls.length > 0){
					conn.query(sqls.join(';'), function(err, result){
						callback(err);
					});
				}else{
					callback(null);
				}
			}

			//async.waterfall执行添加用户组操作上
			async.waterfall([task_start, task_isExist_name, task_basic, 
				task_users, task_managerment, task_access_operator],function(err, results) {
				if(err) {
					conn.rollback(); //发生错误事务回滚
					conn.release();//释放链接
					var task = {
						account:req.session.user,//登录用户名称
						level:0,//日志上报级别
						operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
						result:1,//结果0:成功;1:失败
						operateContent:T.__('Add')+usergroup_name+T.__('User group operation failed'),//日志内容
					}
					common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
					res.json(200, {success: false, msg: 'Operation Failure!' }); 
				} else {
					//强制下线数据
					if(typeof(ids_selected) == 'undefined' || ids_selected == ''){
						ids_selected = '-999999';
					}
					var sql_force = sprintf("select user_name from sec_user\
									where sec_user_id in (%s)",
									ids_selected
								);
					conn.query(sql_force,function(err,result){
						if(err){
							conn.rollback(); //发生错误事务回滚
							conn.release();//释放链接
							res.json(200, {success: false, msg: 'Operation Failure!' });
						}else{
							var names = [];
							for(var i in result){
								names.push(result[i].user_name);
							}
							//强制下线
							common.forceOffLine(conn,req,res,names);

							var task = {
								account:req.session.user,//登录用户名称
								level:0,//日志上报级别
								operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
								result:0,//结果0:成功;1:失败
								operateContent:T.__('Add')+usergroup_name+T.__('User group operation is successful'),//日志内容
							}
							common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
						}
					});
				}		
			});
		});
	}catch(err){
		conn.rollback(); //发生错误事务回滚
		conn.release();//释放链接
		var task = {
			account:req.session.user,//登录用户名称
			level:0,//日志上报级别
			operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
			result:1,//结果0:成功;1:失败
			operateContent:T.__('Add')+usergroup_name+T.__('User group operation failed'),//日志内容
		}
		common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
		res.json(200, {success: false, msg: 'Operation Failure!' }); 
	}
});

//修改常规信息
router.post("/update_basic", function(req, res, next){
	//用户组名称
	var sec_usergroup_name = req.body.sec_usergroup_name
	//用户组id
	var sec_usergroup_id = req.body.sec_usergroup_id
	if(sec_usergroup_id == 1 && typeof(sec_usergroup_name) == 'undefined'){
		sec_usergroup_name = 'administrators';//id=1 超级用户组
	}
	APP.dbpool.getConnection(function(err, conn){
		//用户组名称不能重复
		var task_isname = function(callback){
			var sql_id = "select sec_usergroup_name from sec_usergroup where is_user_private = 0 and sec_usergroup_id = ?";
			conn.query(sql_id, [sec_usergroup_id], function(err, result){
				if(result[0].sec_usergroup_name != sec_usergroup_name){
					//调用isExist_name
					isExist_name(conn, res, sec_usergroup_name, callback);
				}else{
					callback(err);
				}
			});
		}

		//修改操作
		var task_update = function(callback){
			if(req.body.sec_usergroup_id == 1){
				var sql = 'update sec_usergroup\
						      set sec_usergroup_desc = ?\
				 		  	where sec_usergroup_id = ?\
				 		  	and is_user_private = 0\
				 		  ';
				var items = [req.body.sec_usergroup_desc,req.body.sec_usergroup_id];	
			}else{
				var sql = 'update sec_usergroup\
					    set sec_usergroup_name = ?,\
					        sec_usergroup_fullname = ?,\
					        sec_usergroup_desc = ?\
			 		  	where sec_usergroup_id = ?\
			 		  	and is_user_private = 0\
			 		  ';
				var items = [req.body.sec_usergroup_name, req.body.sec_usergroup_fullname,
						req.body.sec_usergroup_desc,req.body.sec_usergroup_id];	
			}
		    conn.query(sql, items, function(err, rows, fields) {
		    	callback(err);
		    });
		}

		async.waterfall([task_isname, task_update],function(err, results) {
			if(err) {
				console.log(err);
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Modify')+sec_usergroup_name+T.__('User group general information operation failed'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {
				//返回结果
				console.log("操作成功");
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('Modify')+sec_usergroup_name+T.__('User group general information is successful'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: true, msg: 'Operation Success!' }); 
			}				
		});
	});
});

//修改用户组成员数据
router.post("/update_users", function(req, res, next){
	console.log(req.body);
	//获取前台请求参数-已选用户id
	var ids_selected = [];
	for(var i in req.body.selectedId.split(',')){
		if(req.body.selectedId.split(',')[i] != ''){
			ids_selected.push(parseInt(req.body.selectedId.split(',')[i]));
		}	
	}
	//用户组原有成员id
	var old_ids = [];
	//强制下线用户
	var force_ids = [];
	//用户组id
	var sec_usergroup_id = req.body.sec_usergroup_id;
	var usergroup_name = req.body.name;

	APP.dbpool.getConnection(function(err, conn) {
		//开启事务
		conn.beginTransaction();
		var sql = 
			'select sec_user_belongto_usergroup.sec_user_id \
             	from sec_user_belongto_usergroup, sec_usergroup\
             where sec_usergroup.sec_usergroup_id=sec_user_belongto_usergroup.sec_usergroup_id\
             	and sec_user_belongto_usergroup.sec_usergroup_id = ?\
                and sec_usergroup.is_user_private = 0\
            '; 
        conn.query(sql, [sec_usergroup_id], function(err, rows, fields){
        	if(err){
        		conn.release();
        		res.json(200, {success: false, msg: err});
        	}else{
        		for(var i in rows){
        			old_ids.push(rows[i].sec_user_id);
        		}
        		var sqls = [];    	
				//原有成员不再ids_selected(已选成员)中，删除数据
				for(var i in old_ids){
					if(ids_selected.indexOf(old_ids[i]) == -1){
						force_ids.push(old_ids[i]);
		              	var sql_delete = "delete from sec_user_belongto_usergroup where sec_usergroup_id = "+ sec_usergroup_id +" and sec_user_id = "+old_ids[i];
	 					sqls.push(sql_delete);
					}
				}

				//已选成员不再old_ids(原有成员)中，添加数据		        			
		 		for(var i in ids_selected){
					if(old_ids.indexOf(ids_selected[i]) == -1){
						force_ids.push(ids_selected[i]);
		            	var sql_insert = "insert ignore into sec_user_belongto_usergroup (sec_user_id,sec_usergroup_id) values ("+ ids_selected[i] +","+ sec_usergroup_id +")";
	            		sqls.push(sql_insert);	
					}
				}

				console.log("delete and insert全部sql",sqls);
				//强制下线用户数据
				var sql_force = sprintf("select user_name from sec_user\
								where sec_user_id in (%s)",
								force_ids.join(',')
							);
				conn.query(sql_force,function(err,result){
					var names = [];
					for(var i in result){
						names.push(result[i].user_name);
					}
					conn.query(sqls.join(';'),function(err,result){
						if(err) {
							conn.rollback();
							conn.release();
							var task = {
								account:req.session.user,//登录用户名称
								level:0,//日志上报级别
								operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
								result:1,//结果0:成功;1:失败
								operateContent:T.__('Modify')+usergroup_name+T.__('User group member information operation failed'),//日志内容
							}
							common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

							res.json(200, {success: false, msg: 'Operation Failure!' });
						} else {
							//强制下线
							common.forceOffLine(conn,req,res,names);
							var task = {
								account:req.session.user,//登录用户名称
								level:0,//日志上报级别
								operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
								result:0,//结果0:成功;1:失败
								operateContent:T.__('Modify')+usergroup_name+T.__('User group member information is successful'),//日志内容
							}
							common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

						}
					});			
				});		
        	}	
        });

	});
});

//修改管理域配置
router.post("/update_domain", function(req, res, next){
	console.log("-------#####################修改管理域配置_________",req.body);
	var subnetDevSet = req.body.subnetDevArr;
	var subnetSet = req.body.subnetArr;
	var symbolSet = req.body.symbolArr;
	var delSubnetSet = req.body.delSubnetArr;
	var delSymbolSet = req.body.delSymbolArr;
	var groupid = req.body.sec_usergroup_id;
	var type = req.body.type;
	var name = req.body.name;
	//var groupid = 22;
	APP.dbpool.getConnection(function(err, conn){

		var task_getgroupid = function(callback){
			var sql_User = comm.getPrivateUserGroupid(conn,groupid);
			var privateGroupid="";
			conn.query(sql_User, function(err, result){
				if(!err && result.length > 0){
					privateGroupid = result[0].sec_usergroup_id;	
				}
				callback(null,privateGroupid);	
			});
		}

		var task_domain = function(privateGroupid,callback){
			if(type == 'user' && privateGroupid !=''){
				groupid = privateGroupid;
			}
			var sql_del = comm.delOldDomain(groupid,delSubnetSet,delSymbolSet);
			var sql_in = comm.insertNewDomain(groupid,subnetDevSet,subnetSet,symbolSet);
			var sqls = sql_del.concat(sql_in);
			console.log("修改管理域配置sqlssqlssqlssqlssqlssqlssqlssqlssqlssqlssqlssqlssqls",sqls);
			if(sqls.length > 0){
				conn.query(sqls.join(';'), function(err, result){
					callback(err);
				});
			}else{
				callback(null);
			}
		}

		async.waterfall([task_getgroupid, task_domain],function(err, results) {
			if(err) {
				console.log(err);
				conn.rollback();
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Modify')+name+T.__('User group management domain configuration operation failed'),//日志内容
				}
				if(type == 'user'){
					task['operateContent'] = T.__('Modify')+name+T.__('The user management domain configuration operation failed');//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志	

				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {

				//强制下线用户数据
				var sql_force = sprintf("select t1.user_name from sec_user t1,sec_user_belongto_usergroup t2\
									where t1.sec_user_id = t2.sec_user_id and t2.sec_usergroup_id = %s",
									groupid
								);
				conn.query(sql_force,function(err,result){
					if(err){
						conn.rollback();
						conn.release();//释放链接
						res.json(200, {success: false, msg: 'Operation Failure!' }); 
					}else{
						var names = [];
						for(var i in result){
							names.push(result[i].user_name);
						}
						//强制下线
						common.forceOffLine(conn,req,res,names);

						var task = {
							account:req.session.user,//登录用户名称
							level:0,//日志上报级别
							operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
							result:0,//结果0:成功;1:失败
							operateContent:T.__('Modify')+name+T.__('User group management domain configuration operation is successful'),//日志内容
						}
						if(type == 'user'){
							task['operateContent'] = T.__('Modify')+name+T.__('User management domain configuration operation is successful');//日志内容
						}
						common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志	
					}
				});		
			}				
		});
	});
});

//修改操作权限配置
router.post("/update_operstor", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		console.log("修改操作权限配置修改操作权限配置",req.body);
		var groupid = req.body.sec_usergroup_id;
		var addIds = req.body.addIdsArr;
		var delIds = req.body.delIdsArr;
		var type = req.body.type;
		var name = req.body.name;
		var task_getgroupid = function(callback){
	    	var sql_User = comm.getPrivateUserGroupid(conn,groupid);
			var privateGroupid="";
			conn.query(sql_User, function(err, result){
				if(!err && result.length > 0){
					privateGroupid = result[0].sec_usergroup_id;	
				}
				callback(null,privateGroupid);	
			});
		}

		var task_operator = function(privateGroupid,callback){
			if(type == 'user' && privateGroupid !=''){
				groupid = privateGroupid;
			}
			var sqls = comm.updateOperator(groupid,addIds,delIds);
			console.log("修改操作权限配置",sqls.join(';'))
			if(sqls.length > 0){
				conn.query(sqls.join(';'), function(err, result){
					callback(err);
				});
			}else{
				callback(null);
			}
		}

		async.waterfall([task_getgroupid, task_operator],function(err, results) {
			if(err) {
				console.log(err);
				conn.rollback();
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Modify')+name+T.__('User group operation permission configuration operation failed'),//日志内容
				}
				if(type == 'user'){
					task['operateContent'] = T.__('Modify')+name+T.__('User operation permission configuration failed');//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {
				//强制下线用户数据
				var sql_force = sprintf("select t1.user_name from sec_user t1,sec_user_belongto_usergroup t2\
									where t1.sec_user_id = t2.sec_user_id and t2.sec_usergroup_id = %s",
									groupid
								);
				conn.query(sql_force,function(err,result){
					if(err){
						conn.rollback();
						conn.release();//释放链接
						res.json(200, {success: false, msg: 'Operation Failure!' });
					}else{
						var names = [];
						for(var i in result){
							names.push(result[i].user_name);
						}
						//强制下线
						common.forceOffLine(conn,req,res,names);

						var task = {
							account:req.session.user,//登录用户名称
							level:0,//日志上报级别
							operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
							result:0,//结果0:成功;1:失败
							operateContent:T.__('Modify')+name+T.__('User group operation permission configuration operation is successful'),//日志内容
						}
						if(type == 'user'){
							task['operateContent'] = T.__('Modify')+name+T.__('User operation permission configuration operation is successful');//日志内容
						}
						common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志	
					}	
				});	
			}				
		});
	});
});

//初始化成员界面数据路由
router.get("/getuesrs", function(req, res, next){
	//用户类型
	var user_type = req.query.usergroup_type;
	console.log("------初始化成员------type",user_type);
	APP.dbpool.getConnection(function(err, conn){
		//添加成员
		var sql_user ="select sec_user_id as user_id,\
							user_name,\
							full_name,\
							user_type as user_type_str,\
							create_time,\
							lock_status as lock_status_str,\
							user_desc\
						from sec_user";
		if(user_type != 0 && user_type != ''){
			sql_user += ' where user_type ='+user_type;
		}
		console.log("初始化成员界面数据初始化成员界面数据sql_user",sql_user);
		conn.query(sql_user, function(err, rows, fields){
			if(err){
				conn.release();
				res.json(200, {success: false, msg: err});	
			}else{
				conn.release();
				res.json(200, {success: true, root: rows});
			}
		});
	});
});

//获取用户组已选用户数据
router.post("/user_selected", function(req, res, next){
	console.log(req.body);
	//用户组id
	var sec_usergroup_id = req.body.sec_usergroup_id;
	//已选成员id集合
	var old_ids =[];
	APP.dbpool.getConnection(function(err, conn){
		if(sec_usergroup_id != '' && typeof(sec_usergroup_id) != 'undefined'){			
			var sql_ids = 
				'select sec_user_belongto_usergroup.sec_user_id \
     				from sec_user_belongto_usergroup, sec_usergroup\
     				where sec_usergroup.sec_usergroup_id=sec_user_belongto_usergroup.sec_usergroup_id\
     				and sec_user_belongto_usergroup.sec_usergroup_id = ?\
        			and sec_usergroup.is_user_private = 0\
    			';
			conn.query(sql_ids, [sec_usergroup_id], function(err, rows, fields){
				if(err){
					conn.release();
					res.json(200, {success: false, msg: err});
				}else{
					console.info(rows);
					for(var i in rows){
						old_ids.push(rows[i].sec_user_id);
					}
					conn.release();
					res.json(200, {success: true, selectedId: old_ids });
				}
			});
        }else{
        	conn.release();
        	res.json(200, {success: true, selectedId: old_ids});
        }			
	});
});

//删除用户组
router.post("/delete", function(req, res, next){
	//删除用户组id集合
	var ids = req.body.ids.split(',');
	var userGroupNames = req.body.name;
	var sqls = [];
	APP.dbpool.getConnection(function(err, conn){
		//开启事务
		conn.beginTransaction();

		//sec_usergroup表
		var sql_sec_usergroup = sprintf("DELETE FROM `sec_usergroup` WHERE `sec_usergroup_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_sec_usergroup);

		//sec_user_belongto_usergroup表
		var sql_user_belongto_usergroup = sprintf("DELETE FROM `sec_user_belongto_usergroup`\
			WHERE `sec_usergroup_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_user_belongto_usergroup);

		//sec_usergroup_res_access表
		var sql_usergroup_res_access = sprintf("DELETE FROM `sec_usergroup_res_access`\
		 	WHERE `sec_usergroup_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_usergroup_res_access);

		//sec_usergroup_res_fun_access表
		var sql_usergroup_res_fun_access = sprintf("DELETE FROM `sec_usergroup_res_fun_access`\
			WHERE `sec_usergroup_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_usergroup_res_fun_access);

		//强制下线用户数据
		var sql_force = sprintf("select t1.user_name from sec_user t1,sec_user_belongto_usergroup t2\
							where t1.sec_user_id = t2.sec_user_id and t2.sec_usergroup_id in (%s)",
							ids.join(",")
						);
		conn.query(sql_force,function(err,result){
			var name_set = new Set();
			for(var i in result){
				name_set.add(result[i].user_name);
			}
			var names = [];
			name_set.forEach(function(item,index){
				names.push(item);
			});
			conn.query(sqls.join(';'),function(err,result){
				if(err) {
					console.log(err);
					conn.rollback();
					conn.release();
					var task = {
						account:req.session.user,//登录用户名称
						level:0,//日志上报级别
						operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
						result:1,//结果0:成功;1:失败
						operateContent:T.__('Delete')+userGroupNames+T.__('User group operation failed'),//日志内容
					}
					common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

					res.json(200, {success: false, msg: 'Operation Failure!' });
				} else {
					//强制下线
					common.forceOffLine(conn,req,res,names);

					var task = {
						account:req.session.user,//登录用户名称
						level:0,//日志上报级别
						operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
						result:0,//结果0:成功;1:失败
						operateContent:T.__('Delete')+userGroupNames+T.__('User group operation is successful'),//日志内容
					}
					common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
				}
			});			
		});		
	});
});


// 分层加载树
router.get('/tree', function(req, res, next) {
	console.log("@@@------分层加载树分层加载树-----------@@@@req.query",req.query);
	var parentid = req.query.symbol_id;
	if(typeof(parentid) == 'undefined'){
		parentid = '-9999';
	}
	var groupid = req.query.sec_usergroup_id;
	if(typeof(groupid) == 'undefined'){
		groupid = '-9999';
	}
	var type = req.query.type;
	var neg = req.query.NEG;//待选设备标识
	var flag = req.query.flag;//初始化显示标识
	var subnetDevSet = req.query.subnetDevArr;
	var subnetSet = req.query.subnetArr;
	var symbolSet = req.query.symbolArr;
	var delSubnetSet = req.query.delSubnetArr;
	var delSymbolSet = req.query.delSymbolArr;
	//flag =1 标识修改时管理域界面数据，flag=2标识添加时管理域界面数据
	if(groupid == -1 && typeof(flag) != 'undefined'){
		flag = 2;
	}

	//数据处理
	delSymbolSet = common.caculate(delSubnetSet, delSymbolSet, true);
	delSubnetSet = common.caculate(delSubnetSet, delSubnetSet, false);
	subnetSet = common.caculate(subnetDevSet, subnetSet, true);
	symbolSet = common.caculate(subnetDevSet, symbolSet, true);
	subnetDevSet = common.caculate(subnetDevSet, subnetDevSet, false);
	
	async.waterfall(
	[
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        callback(null, conn);
	    	})
	    },
	    //
	    function(conn, callback){
	    	var sql_User = comm.getPrivateUserGroupid(conn,groupid);
			var privateGroupid="";
			conn.query(sql_User, function(err, result){
				if(!err && result.length > 0){
					privateGroupid = result[0].sec_usergroup_id;	
				}
				if(type == 'user' && privateGroupid !=''){
		    		groupid = privateGroupid;
		    	}
    			callback(null,conn);	
			});
	    },
	    //
	    function(conn, callback){

	    	var sql ="select symbol_id,category,real_res_type_name,res_type_name\
          				from sec_usergroup_res_access\
         				where sec_usergroup_id=?";

         	conn.query(sql, [groupid], function(err, result){
    			callback(null, conn, result);    					
    		});
         },
        //处理前台左右移动数据
	    function(conn, result, callback) {
    		var del_ids = [];//需remove的symbol_id
	    	//处理delSubnetSet
	    	if(typeof(delSubnetSet) != 'undefined' && delSubnetSet != ''){
	    		var delSubnetSet_str = delSubnetSet.split("-");
	    		var strids = [];//获取symbol_id条件	    		
	    		for(var i in delSubnetSet_str){
	    			if(delSubnetSet_str[i].split("*")[0] == 'loading' || 
	    				typeof(delSubnetSet_str[i].split("*")[0]) == 'undefined'){
	    				continue;
	    			}
	    			if(delSubnetSet_str[i].split("*")[0] == -4 || delSubnetSet_str[i].split("*")[0] == 0){
	    				strids.push("symbol_id = -4");
	    			}else{
	    				strids.push("map_hierarchy LIKE '%" + delSubnetSet_str[i].split("*")[0] +"%'")
	    			}
	    			
	    		}

	    		var sql = sprintf("select symbol_id from topo_symbol where %s",strids.join(' or '));
	    		conn.query(sql, function(err, rows){
	    			for(var i in rows){
	    				del_ids.push(rows[i].symbol_id);
	    			}
	    			callback(null,conn,del_ids,result);
	    		});
		    }else{
		    	callback(null,conn,del_ids,result);
		    }
		},
		 function(conn, del_ids, result, callback) {

		 	if(flag == 1 || (delSubnetSet == '' && delSymbolSet == ''
	    		&& subnetDevSet == '' && subnetSet == '' && symbolSet == '')){
    			//获取用户组相关设备id
    			var conds = common.get_group_device_symbols(result,false,neg);
    			callback(null,conn,conds);
    		}else{
    			//处理delSubnetSet
		    	if(typeof(delSymbolSet) != 'undefined' && delSymbolSet != ''){
		    		var delSymbolSet_str = delSymbolSet.split('-');
		    		for(var i in delSymbolSet_str){
		    			if(delSymbolSet_str[i].split("*")[0] == 'loading' ||
		    				typeof(delSymbolSet_str[i].split("*")[0]) == 'undefined'){
		    				continue;
		    			}
		    			del_ids.push(parseInt(delSymbolSet_str[i].split("*")[0]));
		    		}
		    	}
		    	//处理subnetDevSet(remove)
		    	if(typeof(subnetDevSet) != 'undefined' && subnetDevSet != ''){
		    		var subnetDevSet_str = subnetDevSet.split('-');
		    		for(var i in subnetDevSet_str){
		    			if(subnetDevSet_str[i].split("*")[0] == 'loading' ||
		    				typeof(subnetDevSet_str[i].split("*")[0]) == 'undefined'){
		    				continue;
		    			}
		    			del_ids.push(parseInt(subnetDevSet_str[i].split("*")[0]));
		    		}
		    	}
		    	//处理已选结果集(remove)
		    	for(var i in result){
		    		if(del_ids.indexOf(result[i].symbol_id) != -1){
		    			//delete result[i];
		    			result.splice(i,1);
		    		}
		    	}
		    	//处理subnetDevSet(add)
		    	get_access_data(subnetDevSet,1,result);
		    	//处理subnetSet
		    	get_access_data(subnetSet,2,result);
		    	//处理symbolSet
		    	get_access_data(symbolSet,2,result);

		    	var conds = common.get_group_device_symbols(result,false,neg);

    			callback(null,conn,conds);
    		}
		    	
		 },  
	    //
	    function(conn, conds, callback) {
	    	var sql = comm.get_tree_data(parentid,groupid,conds,neg);
	    	console.log("-----sqlsqlsqlsqlsql-----",sql);			    
		    conn.query(sql, function(err, rows, fields) {
		        callback(null, conn, rows);
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();
        var tree = [];
        //管理员
        if(groupid == 1){
        	var root ={};
        	root['leaf'] = true;
        	//(包含所有操作权限)
        	root['text'] = T.__('(Including all operating rights)');
        	root['iconCls'] = 'resource_security_icon_16x16_all';
        	tree.push(root);
        }else{
        	tree = comm.get_domain_tree(parentid,rows,false,false,flag);    
        }
        res.status(200).json({
            success: true,
            expanded: true,
            children: tree,
        });   
	});
});

var get_access_data = function(dataSet,type,result){
	if(typeof(dataSet) != 'undefined' && dataSet != ''){
		var sub_str = dataSet.split('-');
		for(var i in sub_str){
			var str = new Object();
			if(sub_str[i].split("*")[0] == 'loading' ||
				typeof(sub_str[i].split("*")[0]) == 'undefined'){
		    	continue;
		    }
			str['symbol_id'] = sub_str[i].split("*")[0];
			str['category'] = type;
			str['res_type_name'] = sub_str[i].split("*")[1];
			str['real_res_type_name'] = sub_str[i].split("*")[2];
			result.push(str);
		}
	}
}

//操作权限(授权对象)
router.get("/getFunAccess",function(req, res, next){
	console.log("----@@@操作权限(授权对象)操作权限(授权对象)@@@---",req.query);
	var parentid = req.query.symbol_id;
	if(typeof(parentid) == 'undefined'){
		parentid = '-9999';
	}
	var groupid = req.query.sec_usergroup_id;
	if(typeof(groupid) == 'undefined'){
		groupid = '-9999';
	}
	var type = req.query.type;

	async.waterfall(
	[
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        callback(null, conn);
	    	})
	    },
	    //
	    function(conn, callback){
	    	var sql_User = comm.getPrivateUserGroupid(conn,groupid);
			var privateGroupid="";
			conn.query(sql_User, function(err, result){
				if(!err && result.length > 0){
					privateGroupid = result[0].sec_usergroup_id;	
				}
				if(type == 'user' && privateGroupid !=''){
		    		groupid = privateGroupid;
		    	}
		    	callback(null, conn);	
			});
	    },
	    //获取用户组相关设备id
	    function(conn, callback){
	    	var sql ="select symbol_id,category,real_res_type_name,res_type_name\
          				from sec_usergroup_res_access\
         				where sec_usergroup_id=?"

         	conn.query(sql, [groupid], function(err, result){
    			conds = common.get_group_device_symbols(result,true,false);
	    		callback(null,conn,conds);  			
    		});
         },
	    //获取构造树数据
	    function(conn, conds, callback) {
	    	var sql = comm.get_tree_data(parentid,groupid,conds,false);		    
		    conn.query(sql, function(err, rows, fields) {
		        callback(null, conn, rows);
		    });
	    },
	    //获取已授权相关设备id
	    function(conn, rows, callback){
	    	var sql ="select sec_usergroup_res_fun_access.symbol_id,\
						sec_operator_set.sec_operator_set_name,\
						sec_operator_set.sec_operator_set_id\
					  from sec_usergroup,sec_usergroup_res_fun_access,sec_operator_set\
					  where sec_usergroup.sec_usergroup_id=?\
					  and sec_usergroup_res_fun_access.sec_usergroup_id=sec_usergroup.sec_usergroup_id\
					  and sec_operator_set.sec_operator_set_id = sec_usergroup_res_fun_access.sec_operator_set_id";
			conn.query(sql, [groupid], function(err, operation_ids, fields){
				callback(null, conn, rows, operation_ids);
			});
	    }
	], 
	// final func
	function (err, conn, rows, operation_ids) {
        conn.release();
        var tree = [];
        //管理员
        if(groupid == 1){
        	var root ={};
        	root['leaf'] = true;
        	//(包含所有操作权限)
        	root['text'] = T.__('(Including all operating rights)');
        	root['iconCls'] = 'resource_security_icon_16x16_all';
        	tree.push(root);
        }else{
        	tree = comm.get_domain_tree(parentid,rows,true,operation_ids,false);        
        }
     	res.status(200).json({
            success: true,
            expanded: true,
            children: tree,
        }); 
	});
});

//可选操作集
router.get("/getOperatorSet", function(req, res, next){
	var set_type = req.query.type;
	if(typeof(set_type) == 'undefined' || set_type == 'undefined'){
		set_type = '-999999';
	}
	//var set_type = 1;
	APP.dbpool.getConnection(function(err, conn) {
	   var sql = "SELECT *,sec_operator_set_id,\
	   				sec_operator_set_id as id,\
	   				sec_operator_set_name as text\
	   			  FROM sec_operator_set\
	   			  where private_flag < 2 and sec_operator_set_type =?";
	   	conn.query(sql, [set_type], function(err, rows, fields){
	   		var tree = {};
	   		for(var i in rows){
	   			if(rows[i].sec_operator_set_id == -1){
					rows[i].text = T.__('Network management application operations complete set');//网管应用操作全集
				}
				if(rows[i].sec_operator_set_id == -2){
					rows[i].text = T.__('Equipment Operation Complete Works');//设备操作全集
				}
				if(rows[i].sec_operator_set_id == -5){
					rows[i].text = T.__('Platform Monitor Operations Set');//平台监视员操作集
				}
				if(rows[i].sec_operator_set_id == -7){
					rows[i].text = T.__('Device Monitor Operations Set');//设备监视员操作集
				}
	   			rows[i]['leaf'] = true;
	   			rows[i]['res_type_name'] = 'operset';
	   			rows[i]['iconCls'] = 'resource_icon_16x16_deviceview';
	   		}
	   		tree['children'] = rows;

	   		if(err){
	   			conn.release();
	   			res.json(200,{success: true, msg: 'err'});
	   		}else{
	   			conn.release();
	   			res.json(200,tree);
	   		}
	   	}); 	
	});
});

module.exports = router;