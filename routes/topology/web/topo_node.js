var express = require('express');
var json2csv = require('json2csv');
var iconv = require('iconv-lite');
var router = express.Router();

// -------------------------------- 拓扑子网列表 -------------------------------------
router.get('/node_info_old', function(req, res, next) {
	var clause = '1=1';
	var strnode = req.__('Node').toLowerCase();
	if (req.query.param != '' && strnode.indexOf(req.query.param.toLowerCase() ) == -1) {
		clause = sprintf("(tms.symbol_id like '%%%s%%' or tms.symbol_name1 like '%%%s%%' or tms.remark like '%%%s%%' or vtt.display_name like '%%%s%%')", req.query.param, req.query.param, req.query.param, req.query.param);
	}
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
		var sql = sprintf("\
			SELECT COUNT(*) AS count \
			  FROM topo_symbol tms, topo_node_type vtt \
			 WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 and tms.topo_type_id = vtt.topo_type_id and %s;\
			SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
			  FROM topo_symbol tms, topo_node_type vtt \
			 WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 and tms.topo_type_id = vtt.topo_type_id and %s LIMIT %d, %d;\
			", clause, clause, req.query.start, req.query.limit);
		
	    conn.query(sql, function(err, rows, fields) {
	    	var totalCount = rows[0][0].count;
			// 释放数据库连接
	        conn.release();
	        // 返回结果
	  		res.status(200).json({
	  			success: true,
	  			data: rows[1],
	  			total: totalCount
	  		});  
	    });
	});
});

router.get('/node_info', function(req, res, next) {
    var clause = '1=1';
	var strnode = req.__('Node').toLowerCase();
	if (req.query.param != '' && strnode.indexOf(req.query.param.toLowerCase() ) == -1) {
		clause = sprintf("(tms.symbol_id like '%%%s%%' or tms.symbol_name1 like '%%%s%%' or tms.remark like '%%%s%%' or vtt.display_name like '%%%s%%')", req.query.param, req.query.param, req.query.param, req.query.param);
	}

    var conn = null;
    var rows = null;
    var is_superuser = true;
    var privilege_clause = '1=1';
    var user_name = '';
    if (req.session['user']) {
      user_name = req.session['user'];
    }
    
    async function node_info() {
        try{
            conn = await APP.dbpool_promise.getConnection();
            var sql = sprintf("\
                SELECT sec_user_belongto_usergroup.sec_usergroup_id\
                  FROM sec_user, sec_user_belongto_usergroup \
                 WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
                   AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
                   AND sec_user.user_name = '%s';\
                ", user_name);
            rows = await conn.query(sql);
            is_superuser = rows.length == 1;
            if (!is_superuser) {
                sql = sprintf("\
                  SELECT sec_user_symbol.symbol_id\
                    FROM sec_user, sec_user_symbol \
                   WHERE sec_user.sec_user_id = sec_user_symbol.sec_user_id\
                     AND sec_user_symbol.symbol_id >= 0\
                     AND sec_user.user_name = '%s';\
                  ", user_name);

                rows = await conn.query(sql);
                var ary = [];
                for (var i in rows) {
                    ary.push(rows[i].symbol_id);
                }
                ary.push(0);
                privilege_clause = sprintf("symbol_id in (%s)", ary.join(","));
            }

            sql = sprintf("\
			SELECT COUNT(*) AS count \
			  FROM topo_symbol tms, topo_node_type vtt \
			 WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 and tms.topo_type_id = vtt.topo_type_id and %s and %s;\
			SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
			  FROM topo_symbol tms, topo_node_type vtt \
			 WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 and tms.topo_type_id = vtt.topo_type_id and %s and %s LIMIT %d, %d;\
			", clause, privilege_clause, clause, privilege_clause, req.query.start, req.query.limit);
            rows = await conn.query(sql);
            var totalCount = rows[0][0].count;
			
	        await conn.commit();
            await APP.dbpool_promise.releaseConnection(conn);
	        // 返回结果
	  		res.status(200).json({
	  			success: true,
	  			data: rows[1],
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
    
    node_info();
});

//导出全部
router.get('/node_info/exportAll/datacsv', function(req, res, next) {
    var clause = '1=1';
    var strnode = req.__('Node').toLowerCase();
    if (req.query.param != '' && strnode.indexOf(req.query.param.toLowerCase() ) == -1) {
        clause = sprintf("(tms.symbol_id like '%%%s%%' or tms.symbol_name1 like '%%%s%%' or tms.remark like '%%%s%%' or vtt.display_name like '%%%s%%')", req.query.param, req.query.param, req.query.param, req.query.param);
    }
    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {
        var sql = sprintf("SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
                        FROM topo_symbol tms, topo_node_type vtt \
                        WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 \
                        and tms.topo_type_id = vtt.topo_type_id and %s;",clause);

        conn.query(sql, function(err, rows, fields) {
            var fields = ['symbol_id','symbol_name1','remark', 'symbol_type_name','topo_type_name'];
            var fieldNames = [req.__('Symbol ID'), req.__('Node Name'),req.__('Remark'),req.__('Symbol Category'),req.__('Topo Type')];
            var m_data = [];
            for (var i in rows) {
                rows[i].symbol_type_name=strnode;
                m_data.push(rows[i]);   
            }
            conn.release();//关闭连接
            var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
            var newCsv = iconv.encode(csv, 'GBK'); // 转编码
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader("Content-Disposition", "attachment; filename=" + "all_node_info.csv");
            res.status(200).send(newCsv);
        }); 
    });      

});

//导出当前页
router.get('/node_info/exportCurrentPage/datacsv', function(req, res, next) {
    var clause = '1=1';
    var strnode = req.__('Node').toLowerCase();
    if (req.query.param != '' && strnode.indexOf(req.query.param.toLowerCase() ) == -1) {
        clause = sprintf("(tms.symbol_id like '%%%s%%' or tms.symbol_name1 like '%%%s%%' or tms.remark like '%%%s%%' or vtt.display_name like '%%%s%%')", req.query.param, req.query.param, req.query.param, req.query.param);
    }
    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {
         var sql = sprintf("SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
                        FROM topo_symbol tms, topo_node_type vtt \
                        WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 \
                        and tms.topo_type_id = vtt.topo_type_id and %s LIMIT %d, %d;",clause,req.query.start2, req.query.limit2);

        conn.query(sql, function(err, rows, fields) {
            var fields = ['symbol_id','symbol_name1','remark', 'symbol_type_name','topo_type_name'];
            var fieldNames = [req.__('Symbol ID'), req.__('Node Name'),req.__('Remark'),req.__('Symbol Category'),req.__('Topo Type')];
            var m_data = [];
            for (var i in rows) {
                rows[i].symbol_type_name=strnode;
                m_data.push(rows[i]);   
            }
            conn.release();//关闭连接
            var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
            var newCsv = iconv.encode(csv, 'GBK'); // 转编码
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader("Content-Disposition", "attachment; filename=" + "currentPage_node_info.csv");
            res.status(200).send(newCsv);
        }); 
    });      
});

//导出选择项
router.get('/node_info/exportSelected/datacsv', function(req, res, next) {
    var ids=req.query.ids;
    APP.dbpool.getConnection(function(err, conn) {
        var sql = sprintf("SELECT tms.symbol_id, tms.symbol_name1, tms.remark, vtt.display_name as topo_type_name \
                        FROM topo_symbol tms, topo_node_type vtt \
                        WHERE tms.res_type_name != 'TOPO_SUBNET' and tms.is_visible = 1 \
                        and tms.topo_type_id = vtt.topo_type_id and tms.symbol_id in(%s);",ids);

        conn.query(sql, function(err, rows, fields) {
            var fields = ['symbol_id','symbol_name1','remark', 'symbol_type_name','topo_type_name'];
            var fieldNames = [req.__('Symbol ID'), req.__('Node Name'),req.__('Remark'),req.__('Symbol Category'),req.__('Topo Type')];
            var m_data = [];
            for (var i in rows) {
                rows[i].symbol_type_name=req.__('Node').toLowerCase();
                m_data.push(rows[i]);   
            }
            conn.release();//关闭连接
            var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
            var newCsv = iconv.encode(csv, 'GBK'); // 转编码
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader("Content-Disposition", "attachment; filename=" + "selected_node_info.csv");
            res.status(200).send(newCsv);
        }); 
    }); 
});

module.exports = router;