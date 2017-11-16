var express = require('express');
var router = express.Router();
var async = require('async');

// -------------------------------- 设备视图信息呈现 -------------------------------------

// 获取子网下的节点信息
router.get('/get_node_info_old', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {
		var sql = sprintf("\
         		SELECT symbol_name1 \
		        FROM topo_symbol\
		        WHERE symbol_id = %s;\
		        SELECT COUNT(*) AS count \
         		FROM topo_symbol \
         		WHERE is_visible = 1 and map_parent_id = %s;\
				SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
				FROM topo_symbol tms, topo_node_type vtt \
				WHERE tms.is_visible = 1 and tms.map_parent_id = %s and tms.topo_type_id = vtt.topo_type_id \
				LIMIT %d, %d;\
			", req.query.parent_symbol_id, req.query.parent_symbol_id, req.query.parent_symbol_id, req.query.start, req.query.limit);
			
	        conn.query(sql, function(err, rows, fields) {
	    		var nodes = [];
	    		var totalCount = rows[1][0].count;

	    		if (rows[2].length > 0) {
		            for (var i in rows[2]) {
		                rows[2][i].subnet_name = rows[0][0].symbol_name1;
		                nodes.push(rows[2][i]);
		            }
		        }
		        
	            // 释放数据库连接
				conn.release();
				// 返回结果
		        res.status(200).json({
		        	success: true,
		            data: nodes,
		            total: totalCount
		        });
		    });
	});
});

router.get('/get_node_info', function(req, res, next) {
    var conn = null;
    var rows = null;
    var is_superuser = true;
    var privilege_clause = '1=1';
    var privilege_clause2 = '1=1';

    async function get_node_info() {
        try{
            conn = await APP.dbpool_promise.getConnection();
            var sql = sprintf("\
                SELECT sec_user_belongto_usergroup.sec_usergroup_id\
                  FROM sec_user, sec_user_belongto_usergroup \
                 WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
                   AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
                   AND sec_user.user_name = '%s';\
                ", req.session['user']);
            rows = await conn.query(sql);
            is_superuser = rows.length == 1;
            if (!is_superuser) {
                sql = sprintf("\
                  SELECT sec_user_symbol.symbol_id\
                    FROM sec_user, sec_user_symbol \
                   WHERE sec_user.sec_user_id = sec_user_symbol.sec_user_id\
                     AND sec_user_symbol.symbol_id >= 0\
                     AND sec_user.user_name = '%s';\
                  ", req.session['user']);

                rows = await conn.query(sql);
                var ary = [];
                for (var i in rows) {
                    ary.push(rows[i].symbol_id);
                }
                ary.push(0);
                privilege_clause = sprintf("symbol_id in (%s)", ary.join(","));
                privilege_clause2 = sprintf("tms.symbol_id in (%s)", ary.join(","));
            }

            sql = sprintf("\
         		SELECT symbol_name1 \
		        FROM topo_symbol\
		        WHERE symbol_id = %s;\
		        SELECT COUNT(*) AS count \
         		FROM topo_symbol \
         		WHERE is_visible = 1 and map_parent_id = %s and %s;\
				SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
				FROM topo_symbol tms, topo_node_type vtt \
				WHERE tms.is_visible = 1 and tms.map_parent_id = %s and tms.topo_type_id = vtt.topo_type_id and %s\
				LIMIT %d, %d;\
			", req.query.parent_symbol_id, req.query.parent_symbol_id, privilege_clause, req.query.parent_symbol_id, privilege_clause2, req.query.start, req.query.limit);
            rows = await conn.query(sql);
            var nodes = [];
    		var totalCount = rows[1][0].count;

    		if (rows[2].length > 0) {
	            for (var i in rows[2]) {
	                rows[2][i].subnet_name = rows[0][0].symbol_name1;
	                nodes.push(rows[2][i]);
	            }
	        }
	        
            await conn.commit();
            await APP.dbpool_promise.releaseConnection(conn);
			// 返回结果
	        res.status(200).json({
	        	success: true,
	            data: nodes,
	            total: totalCount
	        });
        } catch (err) {
            console.log("=======",err);
            APP.dbpool_promise.releaseConnection(conn);
            if (err) {
                await conn.rollback();
                res.json(200, {success: false, msg: 'get node info failed'});  
            } else {
                res.json(200, {success: true, msg: 'get node info success'});  
            }
        }   
    };
    
    get_node_info();
});

module.exports = router;