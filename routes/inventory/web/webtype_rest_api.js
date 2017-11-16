var express = require('express');
var nodeExcel = require('excel-export');
var router = express.Router();
var json2csv = require('json2csv');
var iconv = require('iconv-lite');

// 该数据是元数据，部署时生成插入
// 机架ne_type表 API
router.get('/ne_type/select/page', function(req, res, next) {
	log.debug('GET /ne_type/all_data_with_page');
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	   	console.log("####",req.query);
	   	var sql_search_condation = " where 1=1 ";
		if(req.query.netypename !=  undefined && req.query.netypename !="" ){
			sql_search_condation += sprintf(" and netypename like '%%%s%%' ", req.query.netypename )
		}
		if(req.query.type_oid !=  undefined && req.query.type_oid != ""){
			sql_search_condation += sprintf(" and type_oid like '%%%s%%' " , req.query.type_oid )
		}
		if(req.query.fieldname !=  undefined && req.query.fieldname != ""){
			sql_search_condation += sprintf(" and fieldname like '%%%s%%' ", req.query.fieldname )
		}
		var count_sql = "SELECT COUNT(*) AS count FROM res_ne_type " + sql_search_condation;
		// 第一次查询 获取记录总数
	    conn.query(count_sql, function(err, rows, fields) {
	    	var totalCount = rows[0].count;
		    var sql = 'SELECT * FROM res_ne_type ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
				// 释放数据库连接
		        conn.release();
		        // 返回结果
		  		res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		});  
		    });

		});
	});
});
router.get('/ne_type/export/data', function(req, res, next) {
	log.debug('GET /ne_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var neType_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(neType_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += neType_ids.join("','");
		}
		sql_search_condation += sprintf(" and netypeid in ('%s') ", ids_values);
	}
	else{
		if(req.query.netypename !=  undefined && req.query.netypename !="" ){
			sql_search_condation += sprintf(" and netypename like '%%%s%%' ", req.query.netypename )
		}
		if(req.query.type_oid !=  undefined && req.query.type_oid != ""){
			sql_search_condation += sprintf(" and type_oid like '%%%s%%' " , req.query.type_oid )
		}
		if(req.query.fieldname !=  undefined && req.query.fieldname != ""){
			sql_search_condation += sprintf(" and fieldname like '%%%s%%' ", req.query.fieldname )
		}
	}
    var conf = {};
    conf.stylesXmlFile = "routes/inventory/web/styles.xml";
    conf.cols = [
    	{caption: '网元类型',type: 'string',width:50.7109375},
        {caption: '产品系列名称',type: 'string',width:60},
        {caption: '系统OID',type: 'string',width:88.7109375}
    ];
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT netypename,fieldname,type_oid FROM res_ne_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	        var m_data = [];
	        conf.rows = [];
		    for (var i in rows) {
		    	var temp_arry = [rows[i].netypename, rows[i].fieldname, rows[i].type_oid];
		    	m_data[i] = temp_arry;
		    	// console.log(i, rows[i]); 
			}
			conf.rows = m_data;
			console.log("##rows##", m_data);
			// 释放数据库连接
	        conn.release();
	  		conf = JSON.parse(JSON.stringify(conf));   //clone
		    conf.name = 'data';
		    // conf.name = iconv.encode('测试表导出数据','gbk').toString('binary');
		    var result = nodeExcel.execute(conf);
		    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		    res.setHeader("Content-Disposition", "attachment; filename=" + "Ne_Type_Report.xlsx");
		    res.end(result, 'binary');
	    });	
	});      
});
router.get('/ne_type/export/datacsv', function(req, res, next) {
	log.debug('GET /ne_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var neType_ids = req.query.selection_condition.split(',');
		var ids_values = "";
		if(neType_ids.length == 1){
			ids_values += req.query.selection_condition;
		}
		else{
			ids_values += neType_ids.join("','");
		}
		sql_search_condation += sprintf(" and netypeid in ('%s') ", ids_values);
	}
	else{
		if(req.query.netypename !=  undefined && req.query.netypename !="" ){
			sql_search_condation += sprintf(" and netypename like '%%%s%%' ", req.query.netypename )
		}
		if(req.query.type_oid !=  undefined && req.query.type_oid != ""){
			sql_search_condation += sprintf(" and type_oid like '%%%s%%' " , req.query.type_oid )
		}
		if(req.query.fieldname !=  undefined && req.query.fieldname != ""){
			sql_search_condation += sprintf(" and fieldname like '%%%s%%' ", req.query.fieldname )
		}
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT netypename,fieldname,type_oid FROM res_ne_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['netypename', 'fieldname','type_oid'];
			var fieldNames = ['网元类型', '产品系列名称','系统OID'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    });	
	});      
});

// 机箱res_chassis_type表 API
router.get('/chassis_type/select/page', function(req, res, next) {
	log.debug('GET /res_chassis_type/all_data_with_page');
    var sql_search_condation = "  WHERE res_ne_type.netypeid = res_chassis_type.netypeid  ";
	if(req.query.chassis_type_name !=  undefined && req.query.chassis_type_name !="" ){
		sql_search_condation += sprintf(" and res_chassis_type.chassis_type_name like '%%%s%%' ", req.query.chassis_type_name )
	}
	if(req.query.slot_num !=  undefined && req.query.slot_num != ""){
		sql_search_condation += sprintf(" and res_chassis_type.slot_num like '%%%s%%' ", req.query.slot_num )
	}
	if(req.query.netypename !=  undefined && req.query.netypename != ""){
		sql_search_condation += sprintf(" and res_ne_type.netypename like '%%%s%%' ", req.query.netypename )
	}         
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	   	console.log("####",req.query);
		var count_sql = "SELECT COUNT(*) AS count FROM res_chassis_type,res_ne_type " + sql_search_condation;
		// 第一次查询 获取记录总数
	    conn.query(count_sql, function(err, rows, fields) {
	    	var totalCount = rows[0].count;
		    var sql = 'SELECT res_chassis_type.*,res_ne_type.netypename FROM res_chassis_type,res_ne_type ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
				// 释放数据库连接
		        conn.release();
		        // 返回结果
		  		res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		});  
		    });

		});

	});
});
router.get('/chassis_type/export/data', function(req, res, next) {
	log.debug('GET /res_chassis_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		sql_search_condation += sprintf(" and chassis_type_id in (%s) ", req.query.selection_condition);
	}
	else{
		if(req.query.chassis_type_name !=  undefined && req.query.chassis_type_name !="" ){
			sql_search_condation += sprintf(" and chassis_type_name like '%%%s%%' ", req.query.chassis_type_name )
		}

		if(req.query.slot_num !=  undefined && req.query.slot_num != ""){
			sql_search_condation += sprintf(" and slot_num like '%%%s%%' ", req.query.slot_num )
		}
	}
    var conf = {};
    conf.stylesXmlFile = "routes/inventory/web/styles.xml";
    conf.cols = [
    	{caption: '类型',type: 'string',width:50.7109375},
        {caption: '网元类型',type: 'string',width:60},
        {caption: '槽位数',type: 'number',width:88.7109375}
    ];
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT chassis_type_name,slot_num FROM res_chassis_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	        var m_data = [];
	        conf.rows = [];
		    for (var i in rows) {
		    	var temp_arry = [rows[i].chassis_type_name, rows[i].chassis_type_name, rows[i].slot_num];
		    	m_data[i] = temp_arry;
		    	// console.log(i, rows[i]); 
			}
			conf.rows = m_data;
			console.log("##rows##", m_data);
			// 释放数据库连接
	        conn.release();
	  		conf = JSON.parse(JSON.stringify(conf));   //clone
		    conf.name = 'data';
		    // conf.name = iconv.encode('测试表导出数据','gbk').toString('binary');
		    var result = nodeExcel.execute(conf);
		    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		    res.setHeader("Content-Disposition", "attachment; filename=" + "Chassis_Type_Report.xlsx");
		    res.end(result, 'binary');
	    });	
	});      
});
router.get('/chassis_type/export/datacsv', function(req, res, next) {
	log.debug('GET /res_chassis_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		sql_search_condation += sprintf(" and chassis_type_id in (%s) ", req.query.selection_condition);
	}
	else{
		if(req.query.chassis_type_name !=  undefined && req.query.chassis_type_name !="" ){
			sql_search_condation += sprintf(" and chassis_type_name like '%%%s%%' ", req.query.chassis_type_name )
		}

		if(req.query.slot_num !=  undefined && req.query.slot_num != ""){
			sql_search_condation += sprintf(" and slot_num like '%%%s%%' ", req.query.slot_num )
		}
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT chassis_type_name,slot_num FROM res_chassis_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['chassis_type_name', 'slot_num'];
			var fieldNames = ['类型', '槽位数'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    });	
	});      
});

// 端口res_port_type表 API
router.get('/porttype/select/page', function(req, res, next) {
	log.debug('GET /res_port_type/all_data_with_page');
	var sql_search_condation = " where 1=1 ";
	if(req.query.port_type_name !=  undefined && req.query.port_type_name !="" ){
		sql_search_condation += sprintf(" and port_type_name like '%%%s%%' ", req.query.port_type_name )
	}
	if(req.query.mib_values !=  undefined && req.query.mib_values != ""){
		sql_search_condation += sprintf(" and mib_values like '%%%s%%' ", req.query.mib_values )
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	   	console.log("####",req.query);
		var count_sql = "SELECT COUNT(*) AS count FROM res_port_type " + sql_search_condation;
		// 第一次查询 获取记录总数
	    conn.query(count_sql, function(err, rows, fields) {
	    	var totalCount = rows[0].count;
		    var sql = 'SELECT * FROM res_port_type ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
				// 释放数据库连接
		        conn.release();
		        // 返回结果
		  		res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		});  
		    });

		});

	});
});
router.get('/porttype/export/data', function(req, res, next) {
	log.debug('GET /res_port_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		sql_search_condation += sprintf(" and port_type_id in (%s) ", req.query.selection_condition);
	}
	else{
		if(req.query.port_type_name !=  undefined && req.query.port_type_name !="" ){
			sql_search_condation += sprintf(" and port_type_name like '%%%s%%' ", req.query.port_type_name )
		}
		if(req.query.mib_values !=  undefined && req.query.mib_values != ""){
			sql_search_condation += sprintf(" and mib_values like '%%%s%%' ", req.query.mib_values )
		}
	}
    var conf = {};
    conf.stylesXmlFile = "routes/inventory/web/styles.xml";
    conf.cols = [
    	{caption: '名称',type: 'string',width:50.7109375},
        {caption: 'MIB值',type: 'string',width:60},
        {caption: '描述',type: 'number',width:88.7109375}
    ];
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT port_type_name,port_type_desc,mib_values FROM res_port_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	        var m_data = [];
	        conf.rows = [];
		    for (var i in rows) {
		    	var temp_arry = [rows[i].port_type_name, rows[i].port_type_desc, rows[i].mib_values];
		    	m_data[i] = temp_arry;
		    	// console.log(i, rows[i]); 
			}
			conf.rows = m_data;
			console.log("##rows##", m_data);
			// 释放数据库连接
	        conn.release();
	  		conf = JSON.parse(JSON.stringify(conf));   //clone
		    conf.name = 'data';
		    // conf.name = iconv.encode('测试表导出数据','gbk').toString('binary');    
		    var result = nodeExcel.execute(conf);
		    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		    res.setHeader("Content-Disposition", "attachment; filename=" + "Port_Type_Report.xlsx");
		    res.end(result, 'binary');
	    });	
	});      
});
router.get('/porttype/export/datacsv', function(req, res, next) {
	log.debug('GET /res_port_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		sql_search_condation += sprintf(" and port_type_id in (%s) ", req.query.selection_condition);
	}
	else{
		if(req.query.port_type_name !=  undefined && req.query.port_type_name !="" ){
			sql_search_condation += sprintf(" and port_type_name like '%%%s%%' ", req.query.port_type_name )
		}
		if(req.query.mib_values !=  undefined && req.query.mib_values != ""){
			sql_search_condation += sprintf(" and mib_values like '%%%s%%' ", req.query.mib_values )
		}
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT port_type_name,port_type_desc,mib_values FROM res_port_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['port_type_name', 'port_type_desc','mib_values'];
			var fieldNames = ['名称','描述', 'MIB值'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    });	
	});      
});

// 板卡res_card_type表 API
router.get('/card_type/select/page', function(req, res, next) {
	log.debug('GET /res_card_type/all_data_with_page');
	var sql_search_condation = " WHERE res_ne_type.netypeid = res_card_type.netypeid ";
	if(req.query.card_type_name !=  undefined && req.query.card_type_name !="" ){
		sql_search_condation += sprintf(" and res_card_type.card_type_name like '%%%s%%' ", req.query.card_type_name )
	}
	if(req.query.type_oid !=  undefined && req.query.type_oid != ""){
		sql_search_condation += sprintf(" and res_card_type.type_oid like '%%%s%%' ", req.query.type_oid )
	}
	if(req.query.netypename !=  undefined && req.query.netypename != ""){
		sql_search_condation += sprintf(" and res_ne_type.netypename like '%%%s%%' ", req.query.netypename )
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	   	console.log("####",req.query);
		var count_sql = "SELECT COUNT(*) AS count FROM res_card_type,res_ne_type " + sql_search_condation;
		// 第一次查询 获取记录总数
		console.info(count_sql);
	    conn.query(count_sql, function(err, rows, fields) {
	    	var totalCount = rows[0].count;
		    var sql = 'SELECT res_card_type.*,res_ne_type.netypename FROM res_card_type,res_ne_type ' + sql_search_condation;
			if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		    }
	    	console.log("##SQL##", sql);
			// 第二次查询 获取记录数组
		    conn.query(sql, function(err, rows, fields) {
				// 释放数据库连接
		        conn.release();
		        // 返回结果
		  		res.json(200, {
		  			success: true,
		  			total: totalCount,
		  			data: rows,
		  		});  
		    });

		});

	});
});
router.get('/card_type/export/data', function(req, res, next) {
	log.debug('GET /res_card_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " where 1=1 ";
	if(req.query.range == "part" ){
		var netypeids = req.query.netypeids;
		var cart_type_ids = req.query.selection_condition;
		for(var item in netypeids){
			if(item == 0 || netypeids.length==1){
				sql_search_condation += sprintf("  and card_type_id =%d  and netypeid = '%s' ",cart_type_ids[item], netypeids[item]); 
			}
			else{
				sql_search_condation += sprintf("  or card_type_id =%d and netypeid = '%s' ",cart_type_ids[item], netypeids[item]); 
			}
          	console.log(netypeids[item]);  
        }
	}
	else{
		if(req.query.card_type_name !=  undefined && req.query.card_type_name !="" ){
			sql_search_condation += sprintf(" and card_type_name like '%%%s%%' ", req.query.card_type_name )
		}
		if(req.query.type_oid !=  undefined && req.query.type_oid != ""){
			sql_search_condation += sprintf(" and type_oid like '%%%s%%' ", req.query.type_oid )
		}
	}
    var conf = {};
    conf.stylesXmlFile = "routes/inventory/web/styles.xml";
    conf.cols = [
    	{caption: '类型',type: 'string',width:50.7109375},
        {caption: 'MIB值',type: 'string',width:60},
        {caption: '网元类型',type: 'string',width:88.7109375}
    ];
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {	
	    var sql = 'SELECT card_type_name,type_oid,netypeid FROM res_card_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	        var m_data = [];
	        conf.rows = [];
		    for (var i in rows) {
		    	var temp_arry = [rows[i].card_type_name, rows[i].type_oid, rows[i].netypeid];
		    	m_data[i] = temp_arry;
		    	// console.log(i, rows[i]); 
			}
			conf.rows = m_data;
			console.log("##rows##", m_data);
			// 释放数据库连接
	        conn.release();
	  		conf = JSON.parse(JSON.stringify(conf));   //clone
		    conf.name = 'data';
		    // conf.name = iconv.encode('测试表导出数据','gbk').toString('binary');    
		    var result = nodeExcel.execute(conf);
		    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
		    res.setHeader("Content-Disposition", "attachment; filename=" + "Card_Type_Report.xlsx");
		    res.end(result, 'binary');
	    });	
	});      
});
router.get('/card_type/export/datacsv', function(req, res, next) {
	log.debug('GET /res_card_type/export_all_data_with_page');
	console.log("####",req.query);
	var sql_search_condation = " WHERE res_ne_type.netypeid = res_card_type.netypeid ";
	if(req.query.range == "part" ){
		var netypeids = req.query.netypeids;
		var cart_type_ids = req.query.selection_condition;
		for(var item in netypeids){
			if(item == 0 || netypeids.length==1){
				sql_search_condation += sprintf("  and res_card_type.card_type_id =%d  and netypeid = '%s' ",cart_type_ids[item], netypeids[item]); 
			}
			else{
				sql_search_condation += sprintf("  or res_card_type.card_type_id =%d and res_card_type.netypeid = '%s' ",cart_type_ids[item], netypeids[item]); 
			}
          	console.log(netypeids[item]);  
        }
	}
	else{
		if(req.query.card_type_name !=  undefined && req.query.card_type_name !="" ){
			sql_search_condation += sprintf(" and res_card_type.card_type_name like '%%%s%%' ", req.query.card_type_name )
		}
		if(req.query.type_oid !=  undefined && req.query.type_oid != ""){
			sql_search_condation += sprintf(" and res_card_type.type_oid like '%%%s%%' ", req.query.type_oid )
		}
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = 'SELECT res_card_type.card_type_name,res_card_type.type_oid,res_ne_type.netypename \
	    			FROM res_card_type,res_ne_type ' + sql_search_condation;
    	console.log("##SQL##", sql);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['card_type_name', 'type_oid','netypename'];
			var fieldNames = ['类型','MIB值', '网元类型'];
			var m_data = [];
		    for (var i in rows) {
		    	m_data.push(rows[i]);   
			}
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "Report.csv");
			res.status(200).send(newCsv);
	    });	
	});      
});


module.exports = router;
