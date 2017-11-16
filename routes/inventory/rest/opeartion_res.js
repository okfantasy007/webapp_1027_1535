var express = require('express');
var http = require('http'); 
var async = require('async');
var router = express.Router();
const uuid = require('uuid/v1');
var request = require('request');

// 网元res_ne表URL API
router.get('/res_ne/select/page', function(req, res, next) {
	log.debug('GET /res_ne/all_data_with_page');
	console.info("req.query:",req.query,"req.session.user:",req.session.user);
	var sql_search_condation = " WHERE 1=1 ";
	if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.macaddress !=  undefined && req.query.macaddress != ""){
		sql_search_condation += sprintf(" and macaddress like '%%%s%%' ", req.query.macaddress )
	}
	if(req.query.resourcestate !=  undefined){
		sql_search_condation += sprintf(" and resourcestate like '%%%s%%' ", req.query.resourcestate )
	}  
	if(req.query.neid !=  undefined && req.query.neid != ""){
		sql_search_condation += sprintf(" and neid = %d ", req.query.neid )
	}
	if(req.query.south_protocol !=  undefined){
		sql_search_condation += sprintf(" and south_protocol=%d ", req.query.south_protocol )
	}
	async.waterfall(
	[   // 建立连接
	    function(callback) {
	    	if(req.session.user !=  undefined && req.session.user != ""){
	    		var data = {  
			        user: req.session.user
			    }; 
			    data = require('querystring').stringify(data);
				var request = http.request( 
			        {  
			            host: 'localhost',  
			            port: req.app.get('port'),
			            method: "POST",                 
			            path: '/rest/security/securityManagerCenter/getDomainAllNEIDString',
			            headers: { 
			            	"Content-Type": 'application/x-www-form-urlencoded',  
			            	'Content-Length' : data.length
			            }                              
			        },
			        function(response) {
			            if(response.statusCode=='200'){
			                var body = ""; 
			                var resultBody; 
		                    response.on('data', function (data) { body += data;})  
	                            .on('end', function () { 
		                            resultBody = JSON.parse(body);
		                            if(resultBody.success== true){
		                                console.log("resIds:",resultBody.resIds,'###resultBody:',resultBody);
		                                if(resultBody.resIds=='all'){
		                                	sql_search_condation += '';
		                                	callback(null, sql_search_condation);
		                                }
		                                else if(resultBody.resIds =='none'){
		                                	sql_search_condation += " and neid in ('') ";
		                                	callback(null, sql_search_condation);
		                                }
		                                else{
		                                	sql_search_condation+= " and neid in (" + resultBody.resIds + ")";
		                                	callback(null, sql_search_condation);
		                                } 
		                            } 
		                            else{
		                            	callback({result:false, errmsg: 'user name no exist'});
		                            }                 
		                       })          
			            }else {
			            	callback({result:false, errmsg: 'http user name error'});
			            }
			        } 
			    );	
			    request.write(data);  
		        request.end();
	    	}
	    	else{
	    		callback(null, sql_search_condation);
	    	}
	    },
	    function(sql_search_condation,callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        if(err){
					callback(err, conn, 0, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
	    	console.log("####",req.query);
			var count_sql = "SELECT COUNT(*) AS count FROM v_ne " + sql_search_condation;
			// 第一次查询 获取记录总数
		    conn.query(count_sql, function(err, rows, fields) {
		    	console.info("count_sql:",count_sql,rows);
		    	if(err){
					callback(err, conn, 0, []);
	   			}else{
		    		var totalCount = rows[0].count;
		    		console.info("totalCount:",totalCount);
	   				callback(null, conn, sql_search_condation, totalCount);
	   			}
			});
	    },
	    function(conn, sql_search_condation, totalCount, callback) {
		    var sql = 'SELECT * FROM v_ne ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, totalCount, rows);
		        }
		        else{
		        	for (var i in rows) {
			 	   		if(rows[i].uplink_port_desc != "" && rows[i].uplink_port_desc != undefined){
			 	   			rows[i]['uplink_port_nename'] = rows[i].uplink_port_desc.split(',')[0];
			 	   			rows[i]['uplink_port_name'] = rows[i].uplink_port_desc.split(',')[1];
			 	   		}
				    	// 解析ne协议
				 	   	var hash = JSON.parse(rows[i].proto_param); 
				 	   	for (var k in hash) {
				 	   		if(k == "port"){
				 	   			rows[i][ "snmp_port"] = hash[k];
				 	   		}
				 	   		else{
				 	   			rows[i][k] = hash[k];
				 	   		}
				 	   	}
					}
					callback(null, err, conn, totalCount, rows);
		        }
		    });
	    },
	    function(err, conn, totalCount, rows) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			total: 0,
		  			data: [],
		  		});
			}
			else{
				res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		}); 
			} 
	    }
	])	
});
router.post('/res_ne/edit', function(req, res, next) {
	console.log("res_ne/edit:",req.body);
	if(req.body.neid != undefined && req.body.neid != ""){
		if(req.body.userlabel != undefined && req.body.userlabel != ""){
			var update_value = " userlabel = '" + req.body.userlabel + "'";
	   		var update_topo_symbol = " symbol_name1= '" + req.body.userlabel + "'";
	   		if(req.body.protocolController != undefined && req.body.protocolController !="off"){
				var pack = JSON.parse(JSON.stringify(req.body));
				delete pack.neid;
				delete pack.userlabel;
				delete pack.tenant;
				delete pack.uplink_port_nename;
				delete pack.uplink_port_name;
				delete pack.uplink_port;
				delete pack.longitude;
				delete pack.latitude;
				delete pack.ssh_port;
				delete pack.telnet_port;
				delete pack.protocolController;
				delete pack.poll_enabled;
				delete pack.poll_protocol;
				delete pack.poll_interval;

				pack.port = Number(pack.port);
				pack.version = Number(pack.version);
				pack.retries = Number(pack.retries);
				pack.timeout = Number(pack.timeout);
				var config = JSON.stringify(pack);
				update_value += ",proto_param='" + config + "'";
			}
			if(req.body.uplink_port != undefined && req.body.uplink_port != ""){
				var uplink_port = req.body.uplink_port;
				var uplink_port_desc = req.body.uplink_port_nename + "," + req.body.uplink_port_name;
				update_value += ",uplink_port='" + uplink_port + "',uplink_port_desc='" + uplink_port_desc + "'" 
			}
			if(req.body.poll_enabled != undefined && req.body.poll_enabled != ""){
				if(req.body.poll_enabled == 0){
					update_value += ",poll_enabled= 0 ";
				}
				else{
					var poll_protocol = req.body.poll_protocol;
					var poll_interval = req.body.poll_interval;
					update_value += ",poll_enabled= 1 ,poll_protocol= " + poll_protocol + ",poll_interval= " + poll_interval;
				}
			}	
			var longitude = parseFloat(req.body.longitude);
			var latitude = parseFloat(req.body.latitude);
			if (!isNaN(longitude)) {
				longitude = longitude + '';
				if(longitude.indexOf(".") != -1){
					longitude = longitude.substring(0,longitude.indexOf(".") + 3);
				}
				else{
					longitude += ".000";
				}
				update_value += ",longitude=" + longitude;
				update_topo_symbol += ",geo_lng=" + longitude;
			}
			if (!isNaN(latitude)) {
				latitude = latitude + '';
				if(latitude.indexOf(".") != -1){
					latitude = latitude.substring(0,latitude.indexOf(".") + 3);
				}
				else{
					latitude += ".000";
				}
				// latitude = parseFloat(latitude);
				update_value += ",latitude=" + latitude;
				update_topo_symbol += ",geo_lat=" + latitude;
			}
		   	if(req.body.tenant != undefined){
		   		update_value += ",tenant='" + req.body.tenant + "'";
		   	}
		   	if(req.body.ssh_port != undefined){
		   		update_value += ",ssh_port=" + req.body.ssh_port;
		   	}
		   	if(req.body.telnet_port != undefined){
		   		update_value += ",telnet_port=" + req.body.telnet_port;
		   	}
		   	if(req.body.resourcestate != undefined){
		   		update_value += ",resourcestate=" + req.body.resourcestate;
		   	}
			// 从数据库连接池获取连接
			APP.dbpool.getConnection(function(err, conn) {
				var checked_sql = sprintf("select COUNT(*) AS count from res_ne where \
				 	neid != %d and userlabel='%s'",
					req.body.neid,req.body.userlabel);
				console.log("##checked_sql##",checked_sql);
				// 第一次查询 获取记录总数
			    conn.query(checked_sql, function(err, rows, fields) {
			    	if (err) {
						conn.release();
						res.json(200, {success: false, 'msg': '网元名称校验异常!' });  
					} 
					else {
				    	if( rows[0].count != 0 ){
				    		conn.release();
							res.json(200, {success: false, 'msg': '当前修改网元名称已存在不能修改!' });
				    	}
				    	else{
				    		var sql = sprintf("UPDATE  res_ne SET %s WHERE `res_ne`.`neid` = %d;\
				    			UPDATE  topo_symbol SET %s WHERE `topo_symbol`.`ne_id` = %d and `topo_symbol`.`res_type_name`='NE';",
				    			update_value,req.body.neid,update_topo_symbol,req.body.neid);
						 	console.log("##update_sql##",sql);
						 	var datas = []
			 				datas.push({neid:req.body.neid});
						    conn.query(sql, function(err, result) {
								console.log("##Result##", result);
								conn.release();
								if(err){
									res.json(400, {success: false, 'msg': '操作失败!' });  
								}
								else{
									var mqmsg = {
										"topic": 'resource',
										"operation": 'modify',
										"source": 'res',
										"type": 'ne',
										"datas":datas 
									};
									APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
									res.json(200, {success: true, 'msg': '操作成功!' });  
								}
						    })				    
				    	}
					}
				});
			})			
		}
		else{
			var update_value = " neid=" + req.body.neid;
	   		var update_topo_symbol = " ne_id=" + req.body.neid;
	   		if(req.body.protocolController != undefined && req.body.protocolController !="off"){
				var pack = JSON.parse(JSON.stringify(req.body));
				delete pack.neid;
				delete pack.tenant;
				delete pack.uplink_port_nename;
				delete pack.uplink_port_name;
				delete pack.uplink_port;
				delete pack.longitude;
				delete pack.latitude;
				delete pack.ssh_port;
				delete pack.telnet_port;
				delete pack.protocolController;
				delete pack.poll_enabled;
				delete pack.poll_protocol;
				delete pack.poll_interval;

				pack.port = Number(pack.port);
				pack.version = Number(pack.version);
				pack.retries = Number(pack.retries);
				pack.timeout = Number(pack.timeout);
				var config = JSON.stringify(pack);
				update_value += ",proto_param='" + config + "'";
			}
			if(req.body.uplink_port != undefined && req.body.uplink_port != ""){
				var uplink_port = req.body.uplink_port;
				var uplink_port_desc = req.body.uplink_port_nename + "," + req.body.uplink_port_name;
				update_value += ",uplink_port='" + uplink_port + "',uplink_port_desc='" + uplink_port_desc + "'" 
			}
			if(req.body.poll_enabled != undefined && req.body.poll_enabled != ""){
				if(req.body.poll_enabled == 0){
					update_value += ",poll_enabled= 0 ";
				}
				else{
					var poll_protocol = req.body.poll_protocol;
					var poll_interval = req.body.poll_interval;
					update_value += ",poll_enabled= 1 ,poll_protocol= " + poll_protocol + ",poll_interval= " + poll_interval;
				}
			}
			var longitude = parseFloat(req.body.longitude);
			var latitude = parseFloat(req.body.latitude);
			if (!isNaN(longitude)) {
				longitude = longitude + '';
				if(longitude.indexOf(".") != -1){
					longitude = longitude.substring(0,longitude.indexOf(".") + 3);
				}
				else{
					longitude += ".000";
				}
				update_value += ",longitude=" + longitude;
				update_topo_symbol += ",geo_lng=" + longitude;
			}
			if (!isNaN(latitude)) {
				latitude = latitude + '';
				if(latitude.indexOf(".") != -1){
					latitude = latitude.substring(0,latitude.indexOf(".") + 3);
				}
				else{
					latitude += ".000";
				}
				// latitude = parseFloat(latitude);
				update_value += ",latitude=" + latitude;
				update_topo_symbol += ",geo_lat=" + latitude;
			}
		   	if(req.body.tenant != undefined){
		   		update_value += ",tenant='" + req.body.tenant + "'";
		   	}
		   	if(req.body.ssh_port != undefined){
		   		update_value += ",ssh_port=" + req.body.ssh_port;
		   	}
		   	if(req.body.telnet_port != undefined){
		   		update_value += ",telnet_port=" + req.body.telnet_port;
		   	}
		   	if(req.body.resourcestate != undefined){
		   		update_value += ",resourcestate=" + req.body.resourcestate;
		   	}
			// 从数据库连接池获取连接
			APP.dbpool.getConnection(function(err, conn) {
				var sql = sprintf("UPDATE  res_ne SET %s WHERE `res_ne`.`neid` = %d;\
	    			UPDATE  topo_symbol SET %s WHERE `topo_symbol`.`ne_id` = %d and `topo_symbol`.`res_type_name`='NE';",
	    			update_value,req.body.neid,update_topo_symbol,req.body.neid);
			 	console.log("##update_sql##",sql);
			 	var datas = []
 				datas.push({neid:req.body.neid});
			    conn.query(sql, function(err, result) {
					console.log("##Result##", result);
					conn.release();
					if(err){
						res.json(400, {success: false, 'msg': '操作失败!' });  
					}
					else{
						var mqmsg = {
							"topic": 'resource',
							"operation": 'modify',
							"source": 'res',
							"type": 'ne',
							"datas":datas 
						};
						APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
						res.json(200, {success: true, 'msg': '操作成功!' });  
					}
			    });	
			})	
		}
   	}
   	else{
   		res.json(200, {success: false, 'msg': '传递参数有误!' });  
   	}
});
router.post('/res_ne/delete', function(req, res, next) {
	log.debug('post /res_ne/delete');
	var ne_ids = req.body.ne_ids;
	var infos = [];
	var with_err = false;
	var ne_ids_del = [];
	var datas = [];
	var insert_temp_del_sql_temp = [];
	var uuid_value = uuid();
	for (var i in ne_ids) {
		insert_temp_del_sql_temp.push("('" + uuid_value + "','neid','" + ne_ids[i].neid + "')");
		infos.push( T.__("Ne ID") + ': ' + ne_ids[i].neid + T.__(' was deleted!'));
		ne_ids_del.push("'"+ne_ids[i].neid+"'");
		datas.push({neid:ne_ids[i].neid});
	}
	if (ne_ids_del.length>0) {
		var insert_temp_del_sql = sprintf('insert into tmp_res_del(uuid,res_type,res_id) values%s',insert_temp_del_sql_temp.join(","));
		var sql = sprintf('call prc_del_res_cascade("res_ne","%s")',uuid_value);
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
			conn.query(insert_temp_del_sql, function(err, rows, fields) {
		    	if (err) {
					conn.release();
					res.json(200, {success: true,with_err: with_err, msg: '操作异常!' });  
				} 
				else {
			    	conn.query(sql, function(err, result) {
				        conn.release();
				        if(err){
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: '删除操作失败</br>'
							}); 
						}
						else{
							var mqmsg = {
								"topic": 'resource',
								"operation": 'delete',
								"source": 'res',
								"type": 'ne',
								"datas":datas 
							};
							APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
				        	with_err = true;
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: infos.join('</br>')
							});
						}
				    });
				}
			});		    
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: '未收到删除数据条件</br>'
		});  
	}
});

// 机箱res_chassis表URL API
router.get('/res_chassis/select/page', function(req, res, next) {
	log.debug('GET /res_chassis/all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.type == "web_router"){
		sql_search_condation += sprintf(' and %s', req.query.search_id )
	}
	if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.chassis_index !=  undefined && req.query.chassis_index != ""){
		sql_search_condation += sprintf(" and chassis_index like '%%%s%%' ", req.query.chassis_index )
	}
	if(req.query.isexisting !=  undefined){
		sql_search_condation += sprintf(" and isexisting like '%%%s%%' ", req.query.isexisting )
	}
	async.waterfall(
	[   // 建立连接
	    function(callback) {
	    	if(req.session.user !=  undefined && req.session.user != ""){
	    		var data = {  
			        user: req.session.user
			    }; 
			    data = require('querystring').stringify(data);
				var request = http.request( 
			        {  
			            host: 'localhost',  
			            port: req.app.get('port'),
			            method: "POST",                 
			            path: '/rest/security/securityManagerCenter/getDomainAllChassisIDString',
			            headers: { 
			            	"Content-Type": 'application/x-www-form-urlencoded',  
			            	'Content-Length' : data.length
			            }                              
			        },
			        function(response) {
			            if(response.statusCode=='200'){
			                var body = ""; 
			                var resultBody; 
		                    response.on('data', function (data) { body += data;})  
	                            .on('end', function () { 
		                            resultBody = JSON.parse(body);
		                            if(resultBody.success== true){
		                                console.log("chassisIds:",resultBody.chassisIds,'###resultBody:',resultBody);
		                                if(resultBody.chassisIds=='all'){
		                                	sql_search_condation += '';
		                                	callback(null, sql_search_condation);
		                                }
		                                else if(resultBody.chassisIds =='none'){
		                                	sql_search_condation += " and chassis_id in ('') ";
		                                	callback(null, sql_search_condation);
		                                }
		                                else{
		                                	sql_search_condation+= " and chassis_id in (" + resultBody.chassisIds + ")";
		                                	callback(null, sql_search_condation);
		                                } 
		                            } 
		                            else{
		                            	callback({result:false, errmsg: 'user name no exist'});
		                            }                 
		                       })          
			            }else {
			            	callback({result:false, errmsg: 'http user name error'});
			            }
			        } 
			    );	
			    request.write(data);  
		        request.end();
	    	}
	    	else{
	    		callback(null, sql_search_condation);
	    	}
	    },
	    function(sql_search_condation,callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        if(err){
					callback(err, conn, 0, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
			var count_sql = "SELECT COUNT(*) AS count FROM v_chassis " + sql_search_condation;
			// 第一次查询 获取记录总数
		    conn.query(count_sql, function(err, rows, fields) {
		    	console.info("count_sql:",count_sql,rows);
		    	if(err){
					callback(err, conn, 0, []);
	   			}else{
		    		var totalCount = rows[0].count;
		    		console.info("totalCount:",totalCount);
	   				callback(null, conn, sql_search_condation, totalCount);
	   			}
			});
	    },
	    function(conn, sql_search_condation, totalCount, callback) {
		    var sql = 'SELECT * FROM v_chassis ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##sql##",err, sql);
		        if(err){
		        	callback(err, conn, totalCount, rows);
		        }
		        else{
					callback(null, err, conn, totalCount, rows);
		        }
		    });
	    },
	    function(err, conn, totalCount, rows) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			total: 0,
		  			data: [],
		  		});
			}
			else{
				res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		}); 
			} 
	    }
	])
});
router.post('/res_chassis/edit', function(req, res, next) {
	console.log('/res_chassis/edit：', req.body);
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
		var sql = sprintf(
			"UPDATE  res_chassis\
			    SET  `userlabel` = '%s',\
			         `chassis_desc` = '%s',\
			         `tenant` = '%s'\
			WHERE  `res_chassis`.`chassis_id` = '%s'",
			req.body.userlabel,
			req.body.chassis_desc,
			req.body.tenant,
			req.body.chassis_id
	 	);
		if (err) {
			conn.release();
			res.json(200, {success: false, msg: '数据库连接异常!' });  
		} 
		else {
			var datas = [];
	 		datas.push({chassis_id:req.body.chassis_id})
			console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				conn.release();
				if(err){
					res.json(400, {success: false, msg: '修改操作失败!' });  
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'modify',
						"source": 'res',
						"type": 'chassis',
						"datas":datas 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {success: true, msg: '修改操作成功!' });  
				}
		    })
		}   
	})
});
router.post('/res_chassis/delete', function(req, res, next) {
	log.debug('post /res_chassis/delete');
	var chassis_ids = req.body.chassis_ids;
	var infos = [];
	var with_err = false;
	var chassis_ids_del = [];
	var datas = [];
	var insert_temp_del_sql_temp = [];
	var uuid_value = uuid();
	for (var i in chassis_ids) {
		insert_temp_del_sql_temp.push("('" + uuid_value + "','chassis_id','" + chassis_ids[i].chassis_id + "')");
		infos.push( T.__("Chassis") + ': ' + chassis_ids[i].userlabel + T.__(' was deleted!'));
		chassis_ids_del.push("'"+chassis_ids[i].chassis_id+"'");
		datas.push({chassis_id:chassis_ids[i].chassis_id})
	}
	if (chassis_ids_del.length>0) {
		var insert_temp_del_sql = sprintf('insert into tmp_res_del(uuid,res_type,res_id) values%s',insert_temp_del_sql_temp.join(","));
		var sql = sprintf('call prc_del_res_cascade("res_chassis","%s")',uuid_value);
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
			conn.query(insert_temp_del_sql, function(err, rows, fields) {
		    	if (err) {
					conn.release();
					res.json(200, {success: true,with_err: with_err, msg: '操作异常!' });  
				} 
				else {
			    	conn.query(sql, function(err, result) {
				        conn.release();
				        if(err){
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: '删除操作失败</br>'
							}); 
						}
						else{
							var mqmsg = {
								"topic": 'resource',
								"operation": 'delete',
								"source": 'res',
								"type": 'chassis',
								"datas":datas 
							};
							APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
				        	with_err = true;
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: infos.join('</br>')
							});
						}
				    });
				}
			});	
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: '未收到删除数据条件</br>'
		});  
	}
});

// 机槽res_slot表URL API
router.get('/res_slot/select/page', function(req, res, next) {
	log.debug('GET /res_slot/all_data_with_page');
	var sql_search_condation = " where 1=1 ";
	if(req.query.slot_index !=  undefined && req.query.slot_index !="" ){
		sql_search_condation += sprintf(" and slot_index like '%%%s%%' ", req.query.slot_index )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.slot_name !=  undefined && req.query.slot_name != ""){
		sql_search_condation += sprintf(" and slot_name like '%%%s%%' ", req.query.slot_name )
	}
	if(req.query.userlabel !=  undefined && req.query.userlabel != ""){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	async.waterfall(
	[   // 建立连接
	    function(callback) {
	    	if(req.session.user !=  undefined && req.session.user != ""){
	    		var data = {  
			        user: req.session.user
			    }; 
			    data = require('querystring').stringify(data);
				var request = http.request( 
			        {  
			            host: 'localhost',  
			            port: req.app.get('port'), 
			            method: "POST",                 
			            path: '/rest/security/securityManagerCenter/getDomainAllNEIDString',
			            headers: { 
			            	"Content-Type": 'application/x-www-form-urlencoded',  
			            	'Content-Length' : data.length
			            }                              
			        },
			        function(response) {
			            if(response.statusCode=='200'){
			                var body = ""; 
			                var resultBody; 
		                    response.on('data', function (data) { body += data;})  
	                            .on('end', function () { 
		                            resultBody = JSON.parse(body);
		                            if(resultBody.success== true){
		                                console.log("resIds:",resultBody.resIds,'###resultBody:',resultBody);
		                                if(resultBody.resIds=='all'){
		                                	sql_search_condation += '';
		                                	callback(null, sql_search_condation);
		                                }
		                                else if(resultBody.resIds =='none'){
		                                	sql_search_condation += " and neid in ('') ";
		                                	callback(null, sql_search_condation);
		                                }
		                                else{
		                                	sql_search_condation+= " and neid in (" + resultBody.resIds + ")";
		                                	callback(null, sql_search_condation);
		                                } 
		                            } 
		                            else{
		                            	callback({result:false, errmsg: 'user name no exist'});
		                            }                 
		                       })          
			            }else {
			            	callback({result:false, errmsg: 'http user name error'});
			            }
			        } 
			    );	
			    request.write(data);  
		        request.end();
	    	}
	    	else{
	    		callback(null, sql_search_condation);
	    	}
	    },
	    function(sql_search_condation,callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        if(err){
					callback(err, conn, 0, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
	    	console.log("####",req.query);
			var count_sql = "SELECT COUNT(*) AS count FROM v_slot " + sql_search_condation;
			// 第一次查询 获取记录总数
		    conn.query(count_sql, function(err, rows, fields) {
		    	console.info("count_sql:",count_sql);
		    	if(err){
					callback(err, conn, 0, []);
	   			}else{
		    		var totalCount = rows[0].count;
	   				callback(null, conn, sql_search_condation, totalCount);
	   			}
			});
	    },
	    function(conn, sql_search_condation, totalCount, callback) {
		    var sql = 'SELECT * FROM v_slot ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("####",err, sql);
		        if(err){
		        	callback(err, conn, totalCount, rows);
		        }
		        else{
					callback(null, err, conn, totalCount, rows);
		        }
		    });
	    },
	    function(err, conn, totalCount, rows) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			total: 0,
		  			data: [],
		  		});
			}
			else{
				res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		}); 
			} 
	    }
	])
});
router.post('/res_slot/edit', function(req, res, next) {
	console.log("res_slot/edit:",req.body);
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
		var sql = sprintf(
			"UPDATE  res_slot\
			    SET  `slot_name` = '%s',\
			    	 `tenant` = '%s'\
	 		  WHERE  `res_slot`.`slot_id` = '%s'",
			req.body.slot_name,
			req.body.tenant,
			req.body.slot_id
	 	);
		if (err) {
			conn.release();
			res.json(200, {success: false, msg: '数据库连接失败!' });  
		} 
		else {
			var datas = [];
	 		datas.push({slot_id:req.body.slot_id});
			console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				console.log("##Result##",err, result);
				conn.release();
				if(err){
					res.json(400, {success: false, "msg": '操作失败!' });  
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'modify',
						"source": 'res',
						"type": 'slot',
						"datas":datas 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {success: true, "msg": '操作成功!' });  
				}  
		    })
		}
	})
});
router.post('/res_slot/delete', function(req, res, next) {
	log.debug('post /res_slot/delete');
	var slot_ids = req.body.slot_ids;
	var infos = [];
	var with_err = false;
	var slot_ids_del = [];
	var datas = [];
	var insert_temp_del_sql_temp = [];
	var uuid_value = uuid();
	for (var i in slot_ids) {
		insert_temp_del_sql_temp.push("('" + uuid_value + "','slot_id','" + slot_ids[i].slot_id + "')");
		infos.push( 'Record ID: ' + slot_ids[i].slot_id + ' was deleted!');
		slot_ids_del.push("'"+slot_ids[i].slot_id+"'");
		datas.push({slot_id:slot_ids[i].slot_id});
	}
	if (slot_ids_del.length>0) {
		var insert_temp_del_sql = sprintf('insert into tmp_res_del(uuid,res_type,res_id) values%s',insert_temp_del_sql_temp.join(","));
		var sql = sprintf('call prc_del_res_cascade("res_slot","%s")',uuid_value);
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
			conn.query(insert_temp_del_sql, function(err, rows, fields) {
		    	if (err) {
					conn.release();
					res.json(200, {success: true,with_err: with_err, msg: '操作异常!' });  
				} 
				else {
			    	conn.query(sql, function(err, result) {
				        conn.release();
				        if(err){
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: '删除操作失败</br>'
							}); 
						}
						else{
							var mqmsg = {
								"topic": 'resource',
								"operation": 'delete',
								"source": 'res',
								"type": 'slot',
								"datas":datas 
							};
							APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
				        	with_err = true;
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: infos.join('</br>')
							});
						}
				    });
				}
			});
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: '未收到删除数据条件</br>'
		});  
	}
});

// 机架res_rack表URL API
router.get('/res_rack/select/page', function(req, res, next) {
	log.debug('GET /res_rack/all_data_with_page');
	console.log("##req.query##",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.vendor_name !=  undefined && req.query.vendor_name != ""){
		sql_search_condation += sprintf(" and vendor_name like '%%%s%%' ", req.query.vendor_name )
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
		var count_sql = "SELECT COUNT(*) AS count FROM res_rack " + sql_search_condation;
		console.log("##count_sql##",count_sql);
		// 第一次查询 获取记录总数
	    conn.query(count_sql, function(err, rows, fields) {
	    	var totalCount = rows[0].count;
		    var sql = 'SELECT * FROM res_rack ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
				// 释放数据库连接
		        conn.release();
		        // 返回结果
		        if(err){
			  		res.json(400, {
			  			success: true,
			  			total: 0,
			  			data: [],
			  		});
				}
				else{
					res.json(200, {
			  			success: true,
			  			total: totalCount,
			  			data: rows,
			  		}); 
				}
		    });
		});
	});
});
router.post('/res_rack/edit', function(req, res, next) {
	console.log("##req.body##",req.body);
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {	
		var sql = sprintf(
			"UPDATE  `res_rack`\
			    SET  `userlabel` = '%s',\
			    	 `tenant` = '%s'\
	 		  WHERE  `res_rack`.`rackid` = %d",
			req.body.userlabel,
			req.body.tenant,
			req.body.rackid
	 	);	
		if (err) {
			conn.release();
			res.json(200, {success: false, msg: '数据库连接失败!'  });  
		} 
		else {
			var datas = [];
	 		datas.push({rackid:req.body.rackid});
			console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				console.log("##Result##", result);
				conn.release();
				if(err){
					res.json(400, {success: false, msg: '操作失败!' });  
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'modify',
						"source": 'res',
						"type": 'rack',
						"datas":datas 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {success: true, msg: '操作成功!' });  
				} 
		    })
		}

	})
});
router.post('/res_rack/delete', function(req, res, next) {
	console.log("##req.body##",req.body);
	var ids = req.body.ids.split(',');
	var names = req.body.names.split(',');
	var infos = [];
	var with_err = false;
	var ids_del = [];
	var datas = [];
	for (var i in ids) {
		infos.push( T.__('Rack') + ":" + names[i] + T.__(' was deleted!'));
		ids_del.push(ids[i]);
		datas.push({rackid:ids[i]});
	}
	if (ids_del.length>0) {
		var sql = sprintf("DELETE FROM `res_rack` WHERE `res_rack`.`rackid` IN (%s)",ids_del.join(","));
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
		    conn.query(sql, function(err, result) {
		        conn.release();
		        if(err){
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: '删除操作失败</br>'
					}); 
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'delete',
						"source": 'res',
						"type": 'rack',
						"datas":datas
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: infos.join('</br>')
					});
				}
		    });
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: '未收到删除数据条件</br>'
		});  
	}
});

// 板卡res_card表URL API
router.get('/res_card/select/page', function(req, res, next) {
	log.debug('GET /res_card/all_data_with_page');
	var search_type = req.query.type;
	console.log("##req.query##", req.query);
	var sql_search_condation = " where 1=1 ";
	if(search_type == "web_router"){
		sql_search_condation += sprintf(' and %s ', req.query.search_id )
	}
	if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.macaddress !=  undefined && req.query.macaddress != ""){
		sql_search_condation += sprintf(" and macaddress like '%%%s%%' ", req.query.macaddress )
	}
	if(req.query.isexisting !=  undefined){
		sql_search_condation += sprintf(" and isexisting like '%%%s%%' ", req.query.isexisting )
	}
	async.waterfall(
	[   // 建立连接
	    function(callback) {
	    	if(req.session.user !=  undefined && req.session.user != ""){
	    		var data = {  
			        user: req.session.user
			    }; 
			    data = require('querystring').stringify(data);
				var request = http.request( 
			        {  
			            host: 'localhost',  
			            port: req.app.get('port'), 
			            method: "POST",                 
			            path: '/rest/security/securityManagerCenter/getDomainAllNEIDString',
			            headers: { 
			            	"Content-Type": 'application/x-www-form-urlencoded',  
			            	'Content-Length' : data.length
			            }                              
			        },
			        function(response) {
			            if(response.statusCode=='200'){
			                var body = ""; 
			                var resultBody; 
		                    response.on('data', function (data) { body += data;})  
	                            .on('end', function () { 
		                            resultBody = JSON.parse(body);
		                            if(resultBody.success== true){
		                                console.log("resIds:",resultBody.resIds,'###resultBody:',resultBody);
		                                if(resultBody.resIds=='all'){
		                                	sql_search_condation += '';
		                                	callback(null, sql_search_condation);
		                                }
		                                else if(resultBody.resIds =='none'){
		                                	sql_search_condation += " and neid in ('') ";
		                                	callback(null, sql_search_condation);
		                                }
		                                else{
		                                	sql_search_condation+= " and neid in (" + resultBody.resIds + ")";
		                                	callback(null, sql_search_condation);
		                                } 
		                            } 
		                            else{
		                            	callback({result:false, errmsg: 'user name no exist'});
		                            }                 
		                       })          
			            }else {
			            	callback({result:false, errmsg: 'http user name error'});
			            }
			        } 
			    );	
			    request.write(data);  
		        request.end();
	    	}
	    	else{
	    		callback(null, sql_search_condation);
	    	}
	    },
	    function(sql_search_condation,callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        if(err){
					callback(err, conn, 0, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
	    	console.log("####",req.query);
			var count_sql = "SELECT COUNT(*) AS count FROM v_card " + sql_search_condation;
			// 第一次查询 获取记录总数
		    conn.query(count_sql, function(err, rows, fields) {
		    	console.info("count_sql:",count_sql);
		    	if(err){
					callback(err, conn, 0, []);
	   			}else{
		    		var totalCount = rows[0].count;
	   				callback(null, conn, sql_search_condation, totalCount);
	   			}
			});
	    },
	    function(conn, sql_search_condation, totalCount, callback) {
		    var sql = 'SELECT * FROM v_card ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("####",err, sql);
		        if(err){
		        	callback(err, conn, totalCount, rows);
		        }
		        else{
					callback(null, err, conn, totalCount, rows);
		        }
		    });
	    },
	    function(err, conn, totalCount, rows) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			total: 0,
		  			data: [],
		  		});
			}
			else{
				res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		}); 
			} 
	    }
	]) 
});
router.post('/res_card/edit', function(req, res, next) {
	console.log("res_card/edit:", req.body);
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {		
		var sql = sprintf(
			"UPDATE  `res_card`\
			    SET  `userlabel` = '%s',\
			         `tenant` = '%s'\
	 		  WHERE  `res_card`.`card_id` = '%s'",
			req.body.userlabel,
			req.body.tenant,
			req.body.card_id
	 	);		
		if (err) {
			conn.release();
			res.json(200, {success: false, msg: '数据库连接失败!'  });  
		} 
		else {
			var datas = [];
	 		datas.push({card_id:req.body.card_id});
			console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				console.log("##Result##",err, result);
				conn.release();
				if(err){
					res.json(400, {success: false, msg: '操作失败!' });  
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'modify',
						"source": 'res',
						"type": 'card',
						"datas":datas 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {success: true, msg: '操作成功!' });  
				}
		    })
		}
	})
});
router.post('/res_card/delete', function(req, res, next) {
	log.debug('post /res_card/delete');
	var card_ids = req.body.card_ids;
	var userlabels = req.body.userlabel;
	var infos = [];
	var with_err = false;
	var card_ids_del = [];
	var datas = [];
	var insert_temp_del_sql_temp = [];
	var uuid_value = uuid();
	for (var i in card_ids) {
		insert_temp_del_sql_temp.push("('" + uuid_value + "','card_id','" + card_ids[i].card_id + "')");
		infos.push( T.__('Card') + ":" +  userlabels[i].userlabel + T.__(' was deleted!'));
		card_ids_del.push("'"+card_ids[i].card_id+"'");
		datas.push({card_id:card_ids[i].card_id});
	}
	if (card_ids_del.length>0) {
		var insert_temp_del_sql = sprintf('insert into tmp_res_del(uuid,res_type,res_id) values%s',insert_temp_del_sql_temp.join(","));
		var sql = sprintf('call prc_del_res_cascade("res_card","%s")',uuid_value);
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
			conn.query(insert_temp_del_sql, function(err, rows, fields) {
		    	if (err) {
					conn.release();
					res.json(200, {success: true,with_err: with_err, msg: '操作异常!' });  
				} 
				else {
			    	conn.query(sql, function(err, result) {
				        conn.release();
				        if(err){
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: '删除操作失败</br>'
							}); 
						}
						else{
							var mqmsg = {
								"topic": 'resource',
								"operation": 'delete',
								"source": 'res',
								"type": 'card',
								"datas":datas 
							};
							APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
				        	with_err = true;
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: infos.join('</br>')
							});
						}
				    });
				}
			});
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: '未收到删除数据条件</br>'
		});  
	}
});
router.get('/res_remoteDev/select/page', function(req, res, next) {
	log.debug('GET /res_remoteDev/all_data_with_page');
	var search_type = req.query.type;
	console.log("##search_type##", search_type);
	var sql_search_condation = " where 1=1 ";
	if(search_type == "web_router"){
		sql_search_condation += sprintf(' and %s ', req.query.search_id )
	}
	if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.macaddress !=  undefined && req.query.macaddress != ""){
		sql_search_condation += sprintf(" and macaddress like '%%%s%%' ", req.query.macaddress )
	}
	if(req.query.isexisting !=  undefined){
		sql_search_condation += sprintf(" and isexisting like '%%%s%%' ", req.query.isexisting )
	}  
	async.waterfall(
	[   // 建立连接
	    function(callback) {
	    	if(req.session.user !=  undefined && req.session.user != ""){
	    		var data = {  
			        user: req.session.user
			    }; 
			    data = require('querystring').stringify(data);
				var request = http.request( 
			        {  
			            host: 'localhost',  
			            port: req.app.get('port'), 
			            method: "POST",                 
			            path: '/rest/security/securityManagerCenter/getDomainAllRemoteDevIDString',
			            headers: { 
			            	"Content-Type": 'application/x-www-form-urlencoded',  
			            	'Content-Length' : data.length
			            }                              
			        },
			        function(response) {
			            if(response.statusCode=='200'){
			                var body = ""; 
			                var resultBody; 
		                    response.on('data', function (data) { body += data;})  
	                            .on('end', function () { 
		                            resultBody = JSON.parse(body);
		                            if(resultBody.success== true){
		                                console.log(resultBody.remoteDevIds =='none',"remoteDevIds:",resultBody.remoteDevIds,'###resultBody:',resultBody);
		                                if(resultBody.remoteDevIds =='all'){
		                                	sql_search_condation += '';
		                                	callback(null, sql_search_condation);
		                                }
		                                else if(resultBody.remoteDevIds =='none'){
		                                	sql_search_condation += " and neid in ('') ";
		                                	callback(null, sql_search_condation);
		                                }
		                                else{
		                                	sql_search_condation+= " and neid in (" + resultBody.remoteDevIds + ") ";
		                                	callback(null, sql_search_condation);
		                                } 
		                            } 
		                            else{
		                            	callback({result:false, errmsg: 'user name no exist'});
		                            }                 
		                       })          
			            }else {
			            	callback({result:false, errmsg: 'http user name error'});
			            }
			        } 
			    );	
			    request.write(data);  
		        request.end();
	    	}
	    	else{
	    		callback(null, sql_search_condation);
	    	}
	    },
	    function(sql_search_condation,callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        if(err){
					callback(err, conn, 0, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
	    	console.log("####",req.query);
			var count_sql = "SELECT COUNT(*) AS count FROM v_RemoteDev " + sql_search_condation;
			// 第一次查询 获取记录总数
		    conn.query(count_sql, function(err, rows, fields) {
		    	console.info("count_sql:",count_sql,rows);
		    	if(err){
					callback(err, conn, 0, []);
	   			}else{
		    		var totalCount = rows[0].count;
		    		console.info("totalCount:",totalCount);
	   				callback(null, conn, sql_search_condation, totalCount);
	   			}
			});
	    },
	    function(conn, sql_search_condation, totalCount, callback) {
		    var sql = 'SELECT * FROM v_RemoteDev ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("####",err, sql);
		        if(err){
		        	callback(err, conn, totalCount, rows);
		        }
		        else{
					callback(null, err, conn, totalCount, rows);
		        }
		    });
	    },
	    function(err, conn, totalCount, rows) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			total: 0,
		  			data: [],
		  		});
			}
			else{
				res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		}); 
			} 
	    }
	])
});

// 端口res_port表URL API
router.get('/res_port/select/page', function(req, res, next) {
	log.debug('GET /res_port/all_data_with_page');
	var sql_search_condation = " where 1=1 ";
	if(req.query.type == "web_router"){
		sql_search_condation += sprintf(' and %s', req.query.search_id )
	}
	if(req.query.port_index !=  undefined && req.query.port_index !="" ){
		sql_search_condation += sprintf(" and port_index like '%%%s%%' ", req.query.port_index )
	}
	if(req.query.tenant !=  undefined && req.query.tenant != ""){
		sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
	}
	if(req.query.userlabel !=  undefined && req.query.userlabel != ""){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
	}
	if(req.query.neid !=  undefined && req.query.neid != ""){
		sql_search_condation += sprintf(" and neid = %d ", req.query.neid )
	}
	if(req.query.operstatus !=  undefined){
		sql_search_condation += sprintf(" and operstatus like '%%%s%%' ", req.query.operstatus )
	}
	async.waterfall(
	[   // 建立连接
	    function(callback) {
	    	if(req.session.user !=  undefined && req.session.user != ""){
	    		var data = {  
			        user: req.session.user
			    }; 
			    data = require('querystring').stringify(data);
				var request = http.request( 
			        {  
			            host: 'localhost',  
			            port: req.app.get('port'), 
			            method: "POST",   
			            path: '/rest/security/securityManagerCenter/getDomainAllPortIDString',
			            headers: { 
			            	"Content-Type": 'application/x-www-form-urlencoded',  
			            	'Content-Length' : data.length
			            }                              
			        },
			        function(response) {
			            if(response.statusCode=='200'){
			                var body = ""; 
			                var resultBody; 
		                    response.on('data', function (data) { body += data;})  
	                            .on('end', function () { 
		                            resultBody = JSON.parse(body);
		                            if(resultBody.success== true){
		                                console.log("resIds:",resultBody.resIds,'###resultBody:',resultBody);
		                                if(resultBody.resIds=='all'){
		                                	sql_search_condation += '';
		                                	callback(null, sql_search_condation);
		                                }
		                                else if(resultBody.resIds =='none'){
		                                	if(resultBody.portIds =='none'){
			                                	sql_search_condation += " and neid in ('') or port_id in ('') ";
			                                	callback(null, sql_search_condation);
			                                }
			                                else{
			                                	sql_search_condation += " and neid in ('') or port_id in (" + resultBody.portIds + ") )";
			                                	callback(null, sql_search_condation);
			                                }
		                                }
		                                else{
		                                	if(resultBody.portIds =='none'){
			                                	sql_search_condation += " and neid in (" + resultBody.resIds + ") or port_id in ('') ";
			                                	callback(null, sql_search_condation);
			                                }
			                                else{
			                                	sql_search_condation += " and neid in (" + resultBody.resIds + ") or port_id in (" + resultBody.portIds + ") )";
			                                	callback(null, sql_search_condation);
			                                }
		                                } 
		                            } 
		                            else{
		                            	callback({result:false, errmsg: 'user name no exist'});
		                            }                 
		                       })          
			            }else {
			            	callback({result:false, errmsg: 'http user name error'});
			            }
			        } 
			    );	
			    request.write(data);  
		        request.end();
	    	}
	    	else{
	    		callback(null, sql_search_condation);
	    	}
	    },
	    function(sql_search_condation,callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        if(err){
					callback(err, conn, 0, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
	    	console.log("##req.query##",req.query);
			var count_sql = "SELECT COUNT(*) AS count FROM v_port " + sql_search_condation;
			// 第一次查询 获取记录总数
		    conn.query(count_sql, function(err, rows, fields) {
		    	console.info("count_sql:",count_sql);
		    	if(err){
					callback(err, conn, 0, []);
	   			}else{
		    		var totalCount = rows[0].count;
		    		console.info("totalCount:",totalCount);
	   				callback(null, conn, sql_search_condation, totalCount);
	   			}
			});
	    },
	    function(conn, sql_search_condation, totalCount, callback) {
		    var sql = 'SELECT * FROM v_port ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
		        if(err){
		        	callback(err, conn, totalCount, rows);
		        }
		        else{
					callback(null, err, conn, totalCount, rows);
		        }
		    });
	    },
	    function(err, conn, totalCount, rows) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			total: 0,
		  			data: [],
		  		});
			}
			else{
				res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		}); 
			} 
	    }
	])
});
router.post('/res_port/edit', function(req, res, next) {
	console.log("res_port/edit:",req.body);
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {	
		var sql = sprintf(
			"UPDATE  `res_port`\
			    SET  `userlabel` = '%s',\
			    	 `tenant` = '%s',\
			         `port_desc` = '%s'\
	 		  WHERE  `res_port`.`port_id` = '%s'",
			req.body.userlabel,
			req.body.tenant,
			req.body.port_desc,
			req.body.port_id
	 	);
		if (err) {
			conn.release();
			res.json(200, {success: false, msg: '数据库连接失败!' });  
		} 
		else {
			var datas = [];
	 		datas.push({port_id:req.body.port_id});
			console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				console.log("##Result##",err, result);
				conn.release();
				if(err){
					res.json(400, {success: false, msg: '操作失败!' });  
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'modify',
						"source": 'res',
						"type": 'port',
						"datas":datas 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {success: true, msg: '操作成功!' });  
				}
		    })
		}
	})
});
router.post('/res_port/delete', function(req, res, next) {
	log.debug('post /res_port/delete');
	var port_ids = req.body.port_ids;
	var infos = [];
	var with_err = false;
	var port_ids_del = [];
	var datas = [];
	var insert_temp_del_sql_temp = [];
	var uuid_value = uuid();
	for (var i in port_ids) {
		insert_temp_del_sql_temp.push("('" + uuid_value + "','port_id','" + port_ids[i].port_id + "')");
		infos.push( 'Record ID: ' + port_ids[i].port_id + ' was deleted!');
		port_ids_del.push("'"+port_ids[i].port_id+"'");
		datas.push({port_id:port_ids[i].port_id});
	}
	if (port_ids_del.length>0) {
		var insert_temp_del_sql = sprintf('insert into tmp_res_del(uuid,res_type,res_id) values%s',insert_temp_del_sql_temp.join(","));
		var sql = sprintf('call prc_del_res_cascade("res_port","%s")',uuid_value);
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
			conn.query(insert_temp_del_sql, function(err, rows, fields) {
		    	if (err) {
					conn.release();
					res.json(200, {success: true,with_err: with_err, msg: '操作异常!' });  
				} 
				else {
			    	conn.query(sql, function(err, result) {
				        conn.release();
				        if(err){
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: '删除操作失败</br>'
							}); 
						}
						else{
							var mqmsg = {
								"topic": 'resource',
								"operation": 'delete',
								"source": 'res',
								"type": 'port',
								"datas":datas
							};
							APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
				        	with_err = true;
							res.json(200, {
								success: true,
								with_err: with_err,
								msg: infos.join('</br>')
							});
						}
				    });
				}
			});
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: '未收到删除数据条件</br>'
		});  
	}
});

// sdn修改mac地址接口
router.post('/res_ne/editsdnmac', function(req, res, next) {
	console.log("res_ne/editsdnmac:",req.body);
	if(req.body.neid != undefined && req.body.neid != ""){
	   	if(req.body.macaddress != undefined && req.body.macaddress != ""){
	   		var update_value = "macaddress='" + req.body.macaddress + "'";
	   		// 从数据库连接池获取连接
			APP.dbpool.getConnection(function(err, conn) {
				var sql = sprintf("UPDATE  res_ne SET %s WHERE `res_ne`.`neid` = %d;",
	    			update_value,req.body.neid);
			 	console.log("##update_sql##",sql);
			    conn.query(sql, function(err, result) {
					console.log("##Result##", result);
					conn.release();
					if(err){
						res.json(400, {success: false, 'msg': '操作失败!' });  
					}
					else{
						res.json(200, {success: true, 'msg': '操作成功!' });  
					}
			    });	
			})
	   	}
		else{
	   		res.json(200, {success: false, 'msg': '传递参数有误!' });  
	   	}	
   	}
   	else{
   		res.json(200, {success: false, 'msg': '传递参数有误!' });  
   	}
});


router.post('/res_ne/delete_prc', function(req, res, next) {
	console.log(req.body);
	var ids = req.body.ids.split(',');
	var infos = [];
	var with_err = false;
	var ids_del = [];
	for (var i in ids) {
		console.log(ids[i]);
		if ( parseInt(ids[i])<500000 ) {
			with_err = true;
			infos.push( '[Error] Record ID: ' + ids[i] + ' is protected!');
		} else {
			infos.push( 'Record ID: ' + ids[i] + ' was deleted!');
			ids_del.push(ids[i]);
		}
	}
	if (ids_del.length>0) {
		var sql = sprintf("DELETE FROM `res_ne` WHERE `res_ne`.`neid` IN (%s)", ids_del.join(","));
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
		    conn.query(sql, function(err, result) {
		        conn.release();
		        if(err){
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: '删除操作失败</br>'
					}); 
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'delete',
						"source": 'res',
						"type": 'ne',
						"datas":ids_del.join(",") 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: infos.join('</br>')
					});
				}
		    });
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: infos.join('</br>')
		});  
	}
});
router.post('/res_chassis/delete_prc', function(req, res, next) {
	console.log("res_chassis/delete_prc:",req.body);
	var ids = req.body.ids.split(',');
	var infos = [];
	var with_err = false;
	var ids_del = [];
	for (var i in ids) {
		console.log(ids[i]);
		if ( parseInt(ids[i])<500000 ) {
			with_err = true;
			infos.push( '[Error] Record ID: ' + ids[i] + ' is protected!');
		} 
		else {
			infos.push( 'Record ID: ' + ids[i] + ' was deleted!');
			ids_del.push(ids[i]);
		}
	}
	if (ids_del.length>0) {
		var sql = sprintf("DELETE FROM `res_chassis` WHERE `res_chassis`.`chassis_id` IN (%s)",ids_del.join(","));
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
		    conn.query(sql, function(err, result) {
		        conn.release();
		        // 返回结果
		        if(err){
			  		res.json(200, {
			  			success: true,
						with_err: with_err,
						msg: '删除失败</br>'
			  		});
				}
				else{
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: infos.join('</br>')
					});
				}
		    });
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: infos.join('</br>')
		});  
	}
});
router.post('/res_slot/delete_prc', function(req, res, next) {
	console.log(req.body);
	var ids = req.body.ids.split(',');
	var infos = [];
	var with_err = false;
	var ids_del = [];
	for (var i in ids) {
		console.log(ids[i]);
		if ( parseInt(ids[i])<500000 ) {
			with_err = true;
			infos.push( '[Error] Record ID: ' + ids[i] + ' is protected!');
		} else {
			infos.push( 'Record ID: ' + ids[i] + ' was deleted!');
			ids_del.push(ids[i]);
		}
	}
	if (ids_del.length>0) {
		var sql = sprintf("DELETE FROM `res_slot` WHERE `res_slot`.`slot_id` IN (%s)",ids_del.join(","));
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
		    conn.query(sql, function(err, result) {
		        conn.release();
		        if(err){
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: '删除操作失败</br>'
					}); 
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'delete',
						"source": 'slot',
						"type": 'slot',
						"datas":ids_del.join(",") 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: infos.join('</br>')
					});
				}
		    });
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: infos.join('</br>')
		});  
	}
});
router.post('/res_card/delete_prc', function(req, res, next) {
	console.log("res_card/delete_prc:", req.body);
	var ids = req.body.ids.split(',');
	var infos = [];
	var with_err = false;
	var ids_del = [];
	for (var i in ids) {
		console.log(ids[i]);
		if ( parseInt(ids[i])<500000 ) {
			with_err = true;
			infos.push( '[Error] Record ID: ' + ids[i] + ' is protected!');
		} else {
			infos.push( 'Record ID: ' + ids[i] + ' was deleted!');
			ids_del.push(ids[i]);
		}
	}
	if (ids_del.length>0) {
		var sql = sprintf("DELETE FROM `res_card` WHERE `res_card`.`card_id` IN (%s)",
			ids_del.join(","));
		console.log("##SQL##",sql);
		APP.dbpool.getConnection(function(err, conn) {
		    conn.query(sql, function(err, result) {
		        conn.release();
		        if(err){
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: '删除操作失败</br>'
					}); 
				}
				else{
					var mqmsg = {
						"topic": 'resource',
						"operation": 'delete',
						"source": 'res_card',
						"type": 'res_card',
						"datas":ids_del.join(",") 
					};
					APP.mqtt_client.publish('resource', JSON.stringify(mqmsg,null,2));
					res.json(200, {
						success: true,
						with_err: with_err,
						msg: infos.join('</br>')
					});
				}
		    });
		});
	} 
	else {
		res.json(200, {
			success: true,
			with_err: with_err,
			msg: infos.join('</br>')
		});  
	}
});



module.exports = router;

