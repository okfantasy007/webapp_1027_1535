var express = require('express');
var http = require('http'); 
var nodeExcel = require('excel-export');
var router = express.Router();
var async = require('async');
var request = require('request');
var json2csv = require('json2csv');
var iconv = require('iconv-lite');

router.get('/res_ne/export/datacsv', function(req, res, next) {
	log.debug('GET /res_ne/export_all_data_with_page');
	console.log("##data_test##",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		sql_search_condation += sprintf(' and neid in (%s) ', req.query.selection_condition);
	}
	else{
		if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
			sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
		}
		if(req.query.macaddress !=  undefined && req.query.macaddress != ""){
			sql_search_condation += sprintf(" and macaddress like '%%%s%%' ", req.query.macaddress )
		}
		if(req.query.resourcestate !=  undefined){
			sql_search_condation += sprintf(" and resourcestate like '%%%s%%' ", req.query.resourcestate )
		}  
		if(req.query.neid !=  undefined && req.query.neid != ""){
			sql_search_condation += sprintf(" and neid like '%%%s%%' ", req.query.neid )
		}
		if(req.query.tenant !=  undefined && req.query.tenant != ""){
			sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
		}
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
					callback(err, conn, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
		    var sql = 'SELECT neid,userlabel,macaddress FROM v_ne ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, []);
		        }
		        else{
					callback(null, err, conn, rows);
		        }
		    });
	    },
	    function(err, conn, rows) {
			var fields = ['neid', 'userlabel','macaddress'];
			var fieldNames = ['网元ID', '网元名称','MAC地址'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    }
	]);    
});
router.get('/res_chassis/export/datacsv', function(req, res, next) {
	log.debug('GET /res_chassis/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var chassis_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(chassis_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += chassis_ids.join("','");
		}
		sql_search_condation += sprintf(" and chassis_id in ('%s') ", ids_values);
	}
	else{
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
					callback(err, conn, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
		    var sql = 'SELECT chassis_id,userlabel,chassis_desc,chassis_index,temperature,serial,desc_info FROM v_chassis ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, []);
		        }
		        else{
					callback(null, err, conn, rows);
		        }
		    });
	    },
	    function(err, conn, rows) {
			var fields = ['chassis_id', 'userlabel','chassis_desc', 'chassis_index','temperature', 'serial', 'desc_info'];
			var fieldNames = ['机箱ID', '机箱名称','机箱描述', '机箱索引','机箱温度', '机箱资产编号','描述信息'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    }
	]);   
});
router.get('/res_slot/export/datacsv', function(req, res, next) {
	log.debug('GET /res_slot/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";

	if(req.query.range == "part" ){
		var chassis_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(chassis_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += chassis_ids.join("','");
		}
		sql_search_condation += sprintf(" and slot_id in ('%s') ", ids_values);
	}
	else{
		if(req.query.slot_index !=  undefined && req.query.slot_index !="" ){
			sql_search_condation += sprintf(" and slot_index like '%%%s%%' ", req.query.slot_index )
		}
		if(req.query.slot_name !=  undefined && req.query.slot_name !="" ){
			sql_search_condation += sprintf(" and slot_name like '%%%s%%' ", req.query.slot_name )
		}
		if(req.query.userlabel !=  undefined && req.query.userlabel != ""){
			sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
		}
		if(req.query.tenant !=  undefined && req.query.userlabel != ""){
			sql_search_condation += sprintf(" and tenant like '%%%s%%' ", req.query.tenant )
		}
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
					callback(err, conn, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
		    var sql = 'SELECT slot_index,slot_name,userlabel,tenant,update_time FROM v_slot ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, []);
		        }
		        else{
					callback(null, err, conn, rows);
		        }
		    });
	    },
	    function(err, conn, rows) {
			var fields = ['slot_index', 'slot_name','userlabel', 'tenant','update_time'];
			var fieldNames = ['槽位编号', '槽位名称','板卡名称', '租户','更新时间'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    }
	]);  
});
router.get('/res_rack/export/datacsv', function(req, res, next) {
	log.debug('GET /res_rack/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		sql_search_condation += sprintf(" and rackid in (%s) ", req.query.selection_condition);
	}
	else{
		if(req.query.userlabel !=  undefined && req.query.userlabel !="" ){
			sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.userlabel )
		}
		if(req.query.tenant !=  undefined && req.query.tenant != ""){
			sql_search_condation += sprintf(" and tenant like '%%%s%%' " , req.query.tenant )
		}
		if(req.query.vendor_name !=  undefined && req.query.vendor_name != ""){
			sql_search_condation += sprintf(" and vendor_name like '%%%s%%' ", req.query.vendor_name )
		}
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT rackid,userlabel,row,col,area,vendor_name,remark,floor,tenant,update_time FROM res_rack ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['rackid', 'userlabel','row', 'col','area', 'vendor_name','remark', 'floor','tenant', 'update_time'];
			var fieldNames = ['机架ID', '机架名称','机架行位置', '机架列位置','区域', '厂家名称','备注', '层','租户', '更新时间'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    });	
	});      
});
router.get('/res_card/export/datacsv', function(req, res, next) {
	log.debug('GET /res_card/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var card_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(card_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += card_ids.join("','");
		}
		sql_search_condation += sprintf(" and card_id in ('%s') ", ids_values);
	}
	else{
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
					callback(err, conn, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
		    var sql = 'SELECT card_id,card_fix_name,userlabel,card_desc,card_display_name,\
	    macaddress,tenant,update_time,last_sync_time FROM v_card ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, []);
		        }
		        else{
					callback(null, err, conn, rows);
		        }
		    });
	    },
	    function(err, conn, rows) {
			var fields = ['card_id', 'card_fix_name', 'userlabel','card_desc', 'card_display_name',
	    	'macaddress', 'tenant','update_time', 'last_sync_time'
	    	];
			var fieldNames = ['板卡编号', '固定名称','板卡名称','板卡描述', '板卡类型名称',
			'MAC地址', '租户','更新时间', '同步时间'
			];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    }
	]);       
});
router.get('/res_remoteDev/export/datacsv', function(req, res, next) {
	log.debug('GET /res_remoteDev/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var card_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(card_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += card_ids.join("','");
		}
		sql_search_condation += sprintf(" and card_id in ('%s') ", ids_values);
	}
	else{
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
					callback(err, conn, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
		    var sql = 'SELECT card_id,card_fix_name,userlabel,card_desc,card_display_name,\
	    macaddress,tenant,update_time,last_sync_time FROM v_RemoteDev ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, []);
		        }
		        else{
					callback(null, err, conn, rows);
		        }
		    });
	    },
	    function(err, conn, rows) {
			var fields = ['card_id', 'card_fix_name', 'userlabel','card_desc', 'card_display_name',
	    	'macaddress', 'tenant','update_time', 'last_sync_time'
	    	];
			var fieldNames = ['设备编号', '固定名称','设备名称','设备描述', '设备类型名称',
			'MAC地址', '租户','更新时间', '同步时间'
			];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    }
	]);       
});
router.get('/res_port/export/datacsv', function(req, res, next) {
	log.debug('GET /res_port/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var port_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(port_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += port_ids.join("','");
		}
		sql_search_condation += sprintf(" and port_id in ('%s') ", ids_values);
	}
	else{
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
					callback(err, conn, []);
	   			}else{
		        	callback(null, conn, sql_search_condation);
	   			}
	    	})
	    },
	    function(conn, sql_search_condation, callback) {
		    var sql = 'SELECT port_index,userlabel,port_fix_name,port_desc FROM v_port ' + sql_search_condation;
		    if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
		    conn.query(sql, function(err, rows, fields) {
		    	console.log("##SQL##",err, sql);
		        if(err){
		        	callback(err, conn, []);
		        }
		        else{
					callback(null, err, conn, rows);
		        }
		    });
	    },
	    function(err, conn, rows) {
			var fields = ['port_index', 'userlabel','port_fix_name', 'port_identifier'];
			var fieldNames = ['端口序号', '端口名称','端口固定名称', '端口描述'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			// 释放数据库连接
	        conn.release();
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    }
	]);
});

router.get('/res_ne/select/tenant', function(req, res, next) {
	log.debug('GET res_ne/select/tenant');
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	   	console.log("####",req.query);
		// var sql = "SELECT sec_user_id as sec_user_id,user_name as tenant FROM sec_user where user_type = 2 ";
		var sql = "SELECT user_name as tenant FROM sec_user where user_type = 2 ";
		console.log("sql####",sql);
		// 第一次查询 获取记录总数
	    conn.query(sql, function(err, rows, fields) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	        if(err){
		  		res.json(400, {
		  			success: true,
		  			data: [],
		  		});
			}
			else{
				for (var i in rows) {
	 	   			rows[i]['sec_user_id'] = rows[i].tenant;
				}
				res.json(200, {
		  			success: true,
		  			data: rows,
		  		}); 
			}
		});
	});
});



module.exports = router;
