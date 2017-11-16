var express = require('express');
var router = express.Router();
var mysql = require('mysql');

router.get('/', function(req, res, next) {
	log.debug("请求数据库查询");
	log.debug('GET /demo/employees/page', req.query);

	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {

	   	var sqls=[];
	   	sqls.push("SELECT COUNT(*) AS count FROM template.template");

	    var sql ='SELECT * FROM template.template';
		sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
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

router.get('/symbol', function(req, res, next) {
	log.debug("请求数据库查询");
	log.debug('GET /demo/employees/page', req.query);

	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {

	   	var sqls=[];
	   	sqls.push("SELECT COUNT(*) AS count FROM template.template");

	    var sql ='SELECT * FROM template.template';
		sql += sprintf(' LIMIT %d, %d',	req.query.start, req.query.limit );
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

/* GET home page. */
router.get('/sdasds',function(req, res, next) {
	console.info("向后台请求数据");
    var connection = mysql.createConnection({
        host     : '192.168.202.108',
        user     : 'root',
        password : '123456',
        database : 'template'
    });

    connection.connect();
    
	var sqls=[];
   	sqls.push("SELECT COUNT(*) AS count FROM template");

    var sql ='SELECT * FROM template';
	sql += sprintf(' LIMIT %d, %d ;',	req.query.start, req.query.limit );
   	sqls.push(sql);

   	// 将两条sql语句合并
   	sql_all = sqls.join(';');

	log.debug("##SQL##", sql_all);

    connection.query(sql_all, function (error, rows_ary, fields) {
        if (error) throw error;
        console.log(results);
        var rows_count  = rows_ary[0];
    	var totalCount = rows_count[0].count;

		// 获取记录数组
		var rows = rows_ary[1];

		// 释放数据库连接
        conn.release();

        // 返回结果
  		res.json(200, {
  			success: true,
  			total: totalCount,
  			data: rows,
  		});
        console.info("已经查询完毕数据库");
        
    });


    connection.end();
});

router.get('/editInfo',function(req, res, next) {

    var connection = mysql.createConnection({
        host     : '192.168.202.108',
        user     : 'root',
        password : '123456',
        database : 'ExtJSTest'
    });

    connection.connect();

    var data='';

    connection.query('SELECT * from peopleInfo ', function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        console.info("已经查询完毕数据库");
        //callback();
        res.send( results);
    });


    connection.end();
});

module.exports = router;
