var async = require('async');
var express = require('express');
var router = express.Router();

// 直接使用callback嵌套方式（不使用任何异步处理机制）
router.get('/callback', function(req, res, next) {
	// 无错误检查
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = "show global status"
	    conn.query(sql, function(err, rows, fields) {
		    for (var i in rows) {
		    	console.log(i, rows[i]);
			}
	        conn.release();
	        res.json(200, {success: true, data: rows });  
	    });
	});
});

// 使用promise + async/await 方式处理异步，需要使用nodejs8
router.get('/await', function(req, res, next) {
	async function get_db_status() {
	    var conn=null;
	    var rows;
	    try {
	        conn = await APP.dbpool_promise.getConnection();
	        var sql = "show global status";
	        rows = await conn.query(sql)
	        for (var i in rows) {
	            console.log(i, rows[i]);
	        }
	        throw null;
	    } catch (err) {
	        // do something
	        console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	res.json(500, {success: false, data: err });  
	    	} else {
		        res.json(200, {success: true, data: rows });  
	    	}
	    }    
	};	
	get_db_status();
});

// 使用async.js库处理异步
router.get('/async', function(req, res, next) {

	// 使用async.js瀑布模型处理异步
	async.waterfall(
	[
	    // 获取数据库连接
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		var p = {conn: conn};
		        callback(null, p);
	    	})
	    },
	    // 获取数据
	    function(p, callback) {
			var sql = "show global status"
			// log.debug(sql);
		    p.conn.query(sql, function(err, rows, fields) {
		    	p.rows = rows;
		    	// log.debug(err,rows);
		        callback(null, p);
		    });
	    }
	],
	// final function
	function (err, p) {
		if (p.conn) {
        	p.conn.release();
    	};
		if (err) {
			log.debug(err)
	        // 返回结果
	  		res.json(500, {
	  			success: false,
	  		});  
		} else {
	        // 返回结果
	  		res.json(200, {
	  			success: true,
	  			data: p.rows
	  		});  
  		}
	});
});

// 使用promise方式处理异步
router.get('/promise', function(req, res, next) {
	var conn;
	APP.dbpool_promise.getConnection()
	.then(function(connection) {
	    conn = connection;   
	    var sql = "show global status";
	    return conn.query(sql)
	})
	.then(function(rows) {
        for (var i in rows) {
            console.log(i, rows[i]);
        }
        // 返回结果
  		res.json(200, {
  			success: true,
  			data: rows
  		});  
	    APP.dbpool_promise.releaseConnection(conn);
	})
	.catch(function(err) {
	    APP.dbpool_promise.releaseConnection(conn);
		log.debug(err)
        // 返回结果
  		res.json(500, {
  			success: false,
  		});  
	});

});

module.exports = router;