var express = require('express');
var router = express.Router();
var async = require('async');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

//初始化操作集数据
router.get("/load", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var sql = "select sec_operator_set_id as id,\
						sec_operator_set_id,\
						sec_operator_set_name,\
						sec_operator_set_desc,\
						sec_operator_set_type,\
						is_default,\
						private_flag,\
						create_user_id,\
						create_time\
					from sec_operator_set\
					where private_flag < 2";
		conn.query(sql, function(err, result){
			if(err){
				conn.release();
				res.json(200, {success: false, msg: err});
			}else{
				for(var i in result){
					if(result[i].sec_operator_set_id == -1){
						result[i].sec_operator_set_name = T.__('Network management application operations complete set');//网管应用操作全集
						result[i].sec_operator_set_desc = T.__('Network management application operations complete set');//网管应用操作全集
					}
					if(result[i].sec_operator_set_id == -2){
						result[i].sec_operator_set_name = T.__('Equipment Operation Complete Works');//设备操作全集
						result[i].sec_operator_set_desc = T.__('Equipment Operation Complete Works');//设备操作全集
					}
					if(result[i].sec_operator_set_id == -5){
						result[i].sec_operator_set_name = T.__('Platform Monitor Operations Set');//平台监视员操作集
						result[i].sec_operator_set_desc = T.__('Platform Monitor Operations Set');//平台监视员操作集
					}
					if(result[i].sec_operator_set_id == -7){
						result[i].sec_operator_set_name = T.__('Device Monitor Operations Set');//设备监视员操作集
						result[i].sec_operator_set_desc = T.__('Device Monitor Operations Set');//设备监视员操作集
					}
				}
				conn.release();
				res.json(200, {success: true, root: result});
			}
		});
	});
});

//判断操作集名称是否存在
var isExist_name = function(conn, res, operator_name, callback){
	var count_sql = "select count(*) AS count from sec_operator_set where private_flag < 2 and sec_operator_set_name = ?";
	conn.query(count_sql, [operator_name], function(err, result){
		if(err){
			callback(err);
		}else{
			if(result[0].count > 0){
				conn.release();
				//操作集已存在，请重新输入操作集名称
				res.json(200, {success: false, msg: 'the operation set already exists. Please re-enter the operation set name' });
			}else{
				callback(err);
			}	
		}
	});
}

//添加操作集
router.post("/add", function(req, res, next){
	//操作集名称
	var sec_operator_set_name = req.body.sec_operator_set_name;
	//已选成员id集合
	if(req.body.fun_ids != '' && req.body.fun_ids != 'undefined'){
		var fun_ids = req.body.fun_ids.split(',');
	}
	APP.dbpool.getConnection(function(err, conn){
		//开启事务
		var task_start = function(callback) {
			console.log("###task_start@@@");
			conn.beginTransaction(function(err) {
			callback(err);
			});
		}

		//判断操作及名称是否存在
		var task_isExist_name = function(callback){
			console.log("###task_isExist_name@@@");
			//调用isExist_name
			isExist_name(conn, res, sec_operator_set_name, callback);
		}

		//添加常规信息
		var task_basic = function(callback){
			console.log("###task_basic@@@");
			var sql = sprintf(
				"insert ignore into sec_operator_set(\
					sec_operator_set_id,\
					sec_operator_set_name,\
					sec_operator_set_desc,\
					sec_operator_set_type,\
					is_default,\
					private_flag,\
					create_user_id,\
					create_time)\
				values(NULL, '%s', '%s', %d, %d, %d, %d, now())",	
				req.body.sec_operator_set_name,
				req.body.sec_operator_set_desc,
				req.body.sec_operator_set_type,
				0,
				0,
				0//session.user_id
				);
			conn.query(sql, function(err, result){
		 	 	//将插入id传入下一个函数
		 	 	callback(err, result.insertId);
			});
		}

		//添加操作集成员
		var task_addOperate = function(insertId, callback){
			console.log("###task_addOperate@@@");
			var sql_addOperate;
			var sqls = [];
			for(var i in fun_ids){
				sql_addOperate = "insert ignore into sec_operator_set_to_fun(sec_operator_set_id,fun_id) values ("+ insertId +","+'"'+ fun_ids[i] +'"'+")";
				sqls.push(sql_addOperate);
			}
			if(sqls.length > 0){
				conn.query(sqls.join(';'), function(err, result){
					callback(err);
				});
			}else{
				callback(null);
			}
		}

		//提交任务
		var task_end = function(callback) {
				console.log("###task_end@@@");
				conn.commit(function(err) {
				callback(err);
			});
		}

		async.waterfall([task_start, task_isExist_name, 
			task_basic, task_addOperate, task_end], function(err, results){
			if(err) {
				conn.rollback(); // 发生错误事务回滚
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Add')+sec_operator_set_name+T.__('Operation set operation failed'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {
				conn.commit();
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('Add')+sec_operator_set_name+T.__('Operation set operation is successful'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
				res.json(200, {success: true, msg: 'Operation Success!' }); 
			}		
		});
	});
});

//修改操作集常规信息
router.post("/update_basic", function(req, res, next){
	var operator_id = req.body.sec_operator_set_id;
	//名称
	var operator_name = req.body.sec_operator_set_name;
	//描述
	var operator_desc = req.body.sec_operator_set_desc;
	APP.dbpool.getConnection(function(err, conn){
		//操作集名称不能重复
		var task_isExist_name = function(callback){
			var sql_id = "select sec_operator_set_name from sec_operator_set where sec_operator_set_id = ?";
			conn.query(sql_id, [operator_id], function(err, result){
				if(result[0].sec_operator_set_name != operator_name){
					//调用isExist_name
					isExist_name(conn, res, operator_name, callback);
				}else{
					callback(err);
				}
			});
		}

		//修改操作集常规信息
		var task_update = function(callback){
			var sql = 'update sec_operator_set\
					    set sec_operator_set_name = ?,\
					        sec_operator_set_desc = ?\
			 		  	where sec_operator_set_id = ?\
			 		  ';
			var items = [operator_name, operator_desc, operator_id];	
		    conn.query(sql, items, function(err, rows, fields) {
		    	callback(err);
		    });
		}

		async.waterfall([task_isExist_name, task_update],function(err, results) {
			if(err) {
				conn.rollback();
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:1,//结果0:成功;1:失败
					operateContent:T.__('Modify')+operator_name+T.__('Operation Set General Information Operation failed'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			} else {
				conn.commit();
				conn.release();//释放链接
				var task = {
					account:req.session.user,//登录用户名称
					level:0,//日志上报级别
					operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
					result:0,//结果0:成功;1:失败
					operateContent:T.__('Modify')+operator_name+T.__('Operation Set General Information Operation Successful'),//日志内容
				}
				common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
				res.json(200, {success: true, msg: 'Operation Success!' }); 
			}				
		});
	});
});


//修改操作集成员信息
router.post("/update_Operate", function(req, res, next){
	console.log("修改操作集成员信息req.body-------------->",req.body);
	//操作集id
	var sec_operator_set_id = req.body.sec_operator_set_id;
	var name = req.body.name;
	//选择成员id集合
	var new_ids = [];
	if(typeof(req.body.selectedIds) != 'undefined' &&　req.body.selectedIds != ''){
		new_ids = req.body.selectedIds.split(',');
	}
	//操作集原有成员id集合
	var old_ids = [];
	APP.dbpool.getConnection(function(err, conn){
		var sql_operator = "select * from sec_operator_set_to_fun where sec_operator_set_id = ?";   
        conn.query(sql_operator, [sec_operator_set_id], function(err, rows, fields){
        	if(err){
        		conn.release();
        		res.json(200, {success: false, msg: err});
        	}else{
        		for(var i in rows){
        			old_ids.push(rows[i].fun_id);
        			
        		}
        		console.log("操作集原有成员id集合",old_ids);
        		console.log("操作集new_ids集合",new_ids);
        		var sqls ="";
				//原有操作集成员不再new_ids(已选成员)中，删除数据
				var sql_delete = "delete from sec_operator_set_to_fun where sec_operator_set_id = "+ sec_operator_set_id +" and fun_id in "
				var delete_items = [];
				for(var i in old_ids){
					if(new_ids.indexOf(old_ids[i]) == -1){
	 					delete_items.push(old_ids[i]);
					}
				}
				sql_delete = sql_delete + "(" + delete_items.join(',') + ");";

				if(delete_items.length > 0){
					sqls = sqls + sql_delete;
				}

				//已选操作集成员不再old_ids(原有成员)中，添加数据
				var sql_insert = "insert ignore into sec_operator_set_to_fun (fun_id,sec_operator_set_id) values ";
		        var insert_items =[];//添加的数据
		        if(new_ids != ''){
			 		for(var i in new_ids){
						if(old_ids.indexOf(new_ids[i]) == -1){
			            	var items = "("+"'"+new_ids[i]+"'"+","+sec_operator_set_id+")";
		            		insert_items.push(items);	
						}
					}
				}
				sql_insert = sql_insert + insert_items.join(',') +";";

				if(insert_items.length > 0){
					sqls= sqls + sql_insert;
				}
				//强制下线用户数据
				var sql_force = sprintf("select t2.user_name from sec_user_belongto_usergroup t1,sec_user t2,\
											sec_operator_set t3,sec_usergroup_res_fun_access t4\
										where t3.sec_operator_set_id = t4.sec_operator_set_id\
										AND t4.sec_usergroup_id = t1.sec_usergroup_id\
										AND t1.sec_user_id = t2.sec_user_id\
										AND t3.sec_operator_set_id = %s",
										sec_operator_set_id
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
					console.log("-----强制下线用户数据----caozuoji---names---",names);
					if(sqls.length > 0){
						conn.query(sqls,function(err,result){
							if(err) {
								conn.rollback();
								conn.release();
								var task = {
									account:req.session.user,//登录用户名称
									level:0,//日志上报级别
									operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
									result:1,//结果0:成功;1:失败
									operateContent:T.__('Modify')+name+T.__('Operation set member information operation failed'),//日志内容
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
									operateContent:T.__('Modify')+name+T.__('Operation Set member information operation is successful'),//日志内容
								}
								common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
							}
						});	
					}else{
						conn.release();
						res.json(200, {success: true, msg: 'Operation Success!' }); 
					}		
				});		
        	}	
        });
	});
});

//删除操作集
router.post("/delete", function(req, res, next){
	//操作集id集合
	var ids = req.body.ids.split(',');
	var operaterName = req.body.name;
	var sqls = [];
	APP.dbpool.getConnection(function(err, conn){
		//开启事务
		conn.beginTransaction();

		//sec_operator_set表
		var sql_operator_set = sprintf("DELETE from `sec_operator_set`\
			where `sec_operator_set_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_operator_set);

		//sec_operator_set_to_fun表
		var sql_operator_set_to_fun = sprintf("DELETE from `sec_operator_set_to_fun`\
		 	where `sec_operator_set_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_operator_set_to_fun);

		//sec_usergroup_res_fun_access表
		var sql_usergroup_res_fun_access = sprintf("DELETE from `sec_usergroup_res_fun_access`\
			where `sec_operator_set_id` IN (%s)",
			ids.join(","));

		sqls.push(sql_usergroup_res_fun_access);

    	//强制下线用户数据
		var sql_force = sprintf("select t2.user_name from sec_user_belongto_usergroup t1,sec_user t2,\
									sec_operator_set t3,sec_usergroup_res_fun_access t4\
								where t3.sec_operator_set_id = t4.sec_operator_set_id\
								AND t4.sec_usergroup_id = t1.sec_usergroup_id\
								AND t1.sec_user_id = t2.sec_user_id\
								AND t3.sec_operator_set_id IN (%s)",
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
					conn.rollback();
					conn.release();
					var task = {
						account:req.session.user,//登录用户名称
						level:0,//日志上报级别
						operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
						result:1,//结果0:成功;1:失败
						operateContent:T.__('Delete')+operaterName+T.__('Operation set operation failed'),//日志内容
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
						operateContent:T.__('Delete')+operaterName+T.__('Operation set operation is successful'),//日志内容
					}
					common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
				}
			});			
		});		
	});
});

//递归遍历树节点
var get_operset_func_tree_children = function(parent,funcs,ids,use_token,ids_move){
	//处理移动的ids
	var moveids = [];
	for(var i in ids_move){
		for(var j in ids_move[i].split('*')){
			if(moveids.indexOf(ids_move[i].split('*')[j]) == -1){
				moveids.push(ids_move[i].split('*')[j]);
			}
		}
	}
	var pfuncs = [];
	var ff = [];
	for(var f in funcs){
		if(funcs[f]['p_fun_id'] == parent){
			funcs[f]['fun_name'] = T.__(funcs[f]['fun_name']);
			pfuncs.push(funcs[f]);
		}
	}

	//处理多级目录，将有子节点的节点移动到数组的最后处理
	for(var i = 0; i < funcs.length; i++){
		for(var j = 0; j < pfuncs.length; j++){
	 		if(funcs[i]['p_fun_id'] == pfuncs[j]['fun_id']){
	 			var temp = pfuncs[j];
	 			pfuncs.splice(j,1);
	 			pfuncs.push(temp);
	 		}
	 	}
	}
 	var tree=[];
 	if(pfuncs != []){
		for(var i in pfuncs){
			pfuncs[i]['text'] = pfuncs[i]['fun_name'];
		    pfuncs[i]['selected'] = false;
		    for(var f in funcs){
		    	if(funcs[f]['p_fun_id'] == pfuncs[i]['fun_id']){
		    		ff.push(funcs[f]);
		    	}
		    }
		    if(ff.length > 0){
		    	pfuncs[i]['iconCls'] = 'security_folder_wrench_treeicon';
		        pfuncs[i]['children'] = get_operset_func_tree_children(pfuncs[i]['fun_id'], funcs, ids, use_token,ids_move);
		        pfuncs[i]['expanded'] = false;
	        	//移动过程中保持树节点的展开状态
	        	if(moveids.length > 0){
	        		for(var j in moveids){
		        		if(pfuncs[i]['fun_id'] == moveids[j]){
		        			pfuncs[i]['expanded'] = true;
		        		}
			        }
	        	}
		        if(use_token==1){
		        	var a_selected = [];
		        	for(var a in pfuncs[i]['children']){
		        		if(pfuncs[i]['children'][a]['selected']){
		        			a_selected.push(pfuncs[i]['children'][a]);
		        		}
		        	}
		        	if(a_selected.length == pfuncs[i]['children'].length){
		        	 	pfuncs[i]['iconCls'] = 'security_folder_selected';
		                pfuncs[i]['selected'] = true;
			        }
			    }
		        if(pfuncs[i].children.length > 0){
		           tree.push(pfuncs[i]);
		        }      
		    }else{
		    	pfuncs[i]['iconCls'] = 'security_gear';
		    	pfuncs[i]['leaf'] = true;
		    	if(use_token==0){
					if(ids.indexOf(pfuncs[i]['fun_id']) != -1){
		    			tree.push(pfuncs[i]);
		    		}
		    	}else{
		    		if(ids.indexOf(pfuncs[i]['fun_id']) != -1){
		    			pfuncs[i]['iconCls'] = 'security_gear';
		    		}else{
		    			pfuncs[i]['iconCls'] = 'security_gear_selected';
		            	pfuncs[i]['selected'] = true;
		    		}
		    		tree.push(pfuncs[i]);
		    	}
			}
		}
	}    
	return tree;
}

//获取成员数据
router.post("/getoperator", function(req, res, next){
	var operserid = req.body.sec_operator_set_id;
	var operset_type = req.body.sec_operator_set_type;
	var tree={};	
	APP.dbpool.getConnection(function(err, conn){
		console.log("###task_fun@@@");
		var task_fun = function(callback){
			var sql = "select *,fun_id AS fun_id,\
						p_fun_id AS p_fun_id,\
						fun_name AS fun_name\
						from sec_fun\
						where fun_type = ?\
						and isvisible=1;\
					";
			conn.query(sql, [operset_type], function(err, funs){
				callback(err, funs);
			});
		}

		var task_operator = function(funs, callback){
			console.log("###task_operator@@@");
			
			var sql = "select sec_operator_set_to_fun.fun_id, \
				              sec_operator_set.private_flag\
				        from sec_operator_set_to_fun,sec_operator_set\
				        where sec_operator_set_to_fun.sec_operator_set_id=?\
				        and sec_operator_set.sec_operator_set_type=?\
				        and sec_operator_set_to_fun.sec_operator_set_id=sec_operator_set.sec_operator_set_id\
					";
			conn.query(sql, [operserid, operset_type], function(err, rows){
				var is_selected ={};
				if(typeof(rows) != 'undefined' && rows.length > 0 ){
					if(rows[0]['private_flag']==1){
						is_selected['is_complete'] = 1;	
					}else{
						is_selected['is_complete'] = 0;
					}
				}else{
					is_selected['is_complete'] = 0;
				}
				
				var ids_selected = [];//已选集合
				var ids_noselected = [];//未选集合
				for(var i in rows){
					ids_selected.push(rows[i]['fun_id']);
				}

				for(var j in funs){
					if(ids_selected.indexOf(funs[j]['fun_id']) == -1){
						ids_noselected.push(funs[j]['fun_id']);
					}
				}

				is_selected['ids_selected'] = ids_selected;
				is_selected['ids_noselected'] = ids_noselected;

    			callback(err, is_selected);
			});
		}

		async.waterfall([task_fun, task_operator],function(err, results) {
			if(err){
				conn.release();//释放链接
				res.json(200, {success: false, msg: 'Operation Failure!' }); 
			}else{
				conn.release();//释放链接
				res.json(200, results); 
			}		
		});
	});
});

//初始化操作集成员
router.get("/load_operset", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var ids = [];
		if(typeof(req.query.ids) != 'undefined' && req.query.ids != ''){
			ids = req.query.ids.split(',');
		}
		var is_complete = req.query.is_complete;
		var operset_type = req.query.operset_type;
		var ids_move_add = req.query.ids_move_add;
		if(typeof(ids_move_add) != 'undefined' && ids_move_add != ''){
			var ids_move = ids_move_add.split(',');
		}
		if(typeof(operset_type) == 'undefined' || operset_type == ''){
			operset_type = 1;
		}
		var tree={};
		var use_token = req.query.use_token;

		var sql = "select *,fun_id AS fun_id,\
						p_fun_id AS p_fun_id,\
						fun_name AS fun_name\
						from sec_fun\
						where fun_type = ?\
						and isvisible=1;\
					";
		conn.query(sql, [operset_type], function(err, result){
			if(err){
				console.log(err);
				conn.release();//释放链接
				res.json(200, {success: false, msg: err }); 
			}else{
				if(is_complete == 1){
					if(use_token==0){
						tree['leaf'] = true;
						//(包含所有操作权限)
						tree['text'] = T.__('(Including all operating rights)');
						tree['iconCls'] = 'resource_icon_16x16_deviceview';
						}else{
							tree = [];
						}
				}else{
					tree = get_operset_func_tree_children('0', result, ids, use_token,ids_move);
				}
				var root = {};
				root['children'] = tree
				conn.release();//释放链接
				res.json(200, root); 
			}	
		});
	});
});

module.exports = router;