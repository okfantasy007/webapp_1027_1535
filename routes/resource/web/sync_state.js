var express = require('express');
var router = express.Router();



router.get('/', function(req, res, next) {
	console.log(req.query);

	var sql_search_condation = " where 1=1 ";
	
	if(req.query.hostname !=  undefined && req.query.hostname !="" ){
		sql_search_condation += sprintf(" and userlabel like '%%%s%%' ", req.query.hostname )
	}
	if(req.query.last_sync_status !=  undefined && req.query.last_sync_status !="" ){
		sql_search_condation += sprintf(" and last_sync_status = '%s' ", req.query.last_sync_status )
	}
	if(req.query.last_res_sync_consistency !=  undefined && req.query.last_res_sync_consistency !="" ){
		sql_search_condation += sprintf(" and last_res_sync_consistency = '%s' ", req.query.last_res_sync_consistency )
	}
	if(req.query.startDate !=  undefined && req.query.startDate !="" ){
		sql_search_condation += sprintf(" and last_res_sync_begin_time > '%s' ", req.query.startDate )
	}
	if(req.query.endDate !=  undefined && req.query.endDate !="" ){
		sql_search_condation += sprintf(" and last_res_sync_end_time < '%s' ", req.query.endDate )
	}
	
	
	console.log("+++++++++++++++++"+sql_search_condation);

	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {

	   	var sqls=[];
	   	sqls.push("SELECT COUNT(*) AS count FROM res_ne" + sql_search_condation);
     	var sql = 'SELECT * FROM res_ne'+sql_search_condation;
     	console.log("_______________________"+sql);
     	if(req.query.start !=  undefined && req.query.limit != undefined){
		    	sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
		}
	    
	   	sqls.push(sql);

	   	// 将两条sql语句合并
	   	sql_all = sqls.join(';');

    	log.debug("##SQL##", sql_all);

	    conn.query(sql_all, function(err, rows_ary, fields) {

			// 获取记录总数
			var rows_count  = rows_ary[0];
	    	var totalCount = rows_count[0].count;

			// 获取记录数组
			var rows = rows_ary[1];

            log.debug(rows_count,totalCount);
           // console.log("+++++++++++++++++++++++++"+rows);
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
module.exports = router;