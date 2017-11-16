var express = require('express');
var router = express.Router();
var async = require('async');

// -------------------------------- 拓扑视图的增删改查 -------------------------------------
// 查询拓扑视图
router.get('/', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {

		var sql = "SELECT * FROM topo_view";
	    conn.query(sql, function(err, rows, fields) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	  		res.status(200).json({
	  			success: true,
	  			data: rows[0]
	  		});  
	    });
	});
});

// 创建拓扑视图
router.post('/create', function(req, res, next) {
	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		// call step 2 func
		        callback(null, conn);
	    	})
	    },
	    // step 2 func
	    function(conn, callback) {
		    var sql = "select max(view_root_id) as root_id from topo_view";
		    conn.query(sql, function(err, rows, fields) {
		    	var id=rows[0].root_id%10000;
		    	var root_id = (id + 1) * 10000;
		        callback(null, conn, root_id);
		    });
	    },

	    // step 3 func
		function(conn, root_id, callback) {		    
			sql = sprintf("INSERT INTO `topo_view`\
			        (`id`, `name`, `view_type_id`, `is_locked`, `view_root_id`)\
			        VALUES(NULL, '%s', %d, %d, %d)",
			        req.body.text,
	                1,
	                0,
	                root_id
			    );
	    		
			conn.query(sql, function(err, rows, fields) {
		        callback(null, conn, rows);
		    });
	    }
	], 

	// final func
	function (err, conn, rows) {
        conn.release();
        res.status(200).json({
            success: true
        });  
	});
});

// 删除拓扑视图
router.post('/delete', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {

		var sql = sprintf("\
			DELETE FROM topo_view WHERE id = %d;\
			", parseInt(req.body.id));
		
	    conn.query(sql, function(err, rows, fields) {
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	  		res.status(200).json({
	  			success: true
	  		});  
	    });
	});
});

module.exports = router;