var express = require('express');
var json2csv = require('json2csv');
var iconv = require('iconv-lite');
var router = express.Router();

// -------------------------------- 拓扑子网列表 -------------------------------------
router.get('/link_info_old', function(req, res, next) {
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {

		var sql = sprintf("SELECT COUNT(*) AS count FROM topo_link_symbol;\
			SELECT topo_link_symbol.link_symbol_id, \
					topo_link_symbol.link_name1, \
					topo_link_symbol.remark, \
					topo_link_symbol.direction, \
					topo_link_symbol.src_symbol_id, \
					topo_link_symbol.dest_symbol_id, \
					topo_node_type.display_name as topo_type_name \
			FROM topo_link_symbol, topo_node_type \
			WHERE topo_link_symbol.topo_type_id = topo_node_type.topo_type_id \
			LIMIT %d, %d;\
			SELECT symbol_id, symbol_name1 FROM topo_symbol;\
			", req.query.start, req.query.limit);
		
	    conn.query(sql, function(err, rows, fields) {
	    	var totalCount = rows[0][0].count;
	    	
	    	for (var i in rows[1]) {
	    		var afind = false;
	    		var zfind = false;
	    		for (var j in rows[2]) {
	    			if (!afind && rows[1][i].src_symbol_id == rows[2][j].symbol_id) {
	    				afind = true;
	    				rows[1][i].anode_name = rows[2][j].symbol_name1;
	    			}
	    			if (!zfind && rows[1][i].dest_symbol_id == rows[2][j].symbol_id) {
	    				zfind = true;
	    				rows[1][i].znode_name = rows[2][j].symbol_name1;
	    			}
	    			if (afind && zfind) {
	    				break;
	    			}
	    		}
	    	}
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

//查询条件
var SearcherInfo=function(req,clause){
	if(req.query.param != ''){
		var strquery="select symbol_id from topo_symbol where  topo_symbol.symbol_name1 like '%"+req.query.param+"%'";
		var Unidirection=req.__('Unidirection').toLowerCase();
		var Bidirection=req.__('Bidirection').toLowerCase();
		if(Unidirection.indexOf(req.query.param.toLowerCase() )>=0 && Bidirection.indexOf(req.query.param.toLowerCase() ) == -1){
			clause = sprintf("(topo_link_symbol.link_symbol_id like '%%%s%%' or topo_link_symbol.link_name1 like '%%%s%%' or topo_link_symbol.remark like '%%%s%%' or topo_node_type.display_name like '%%%s%%' or topo_link_symbol.src_symbol_id in(%s) or topo_link_symbol.dest_symbol_id in(%s) or topo_link_symbol.direction = %d )", 
			req.query.param, req.query.param, req.query.param,req.query.param,strquery,strquery,1);
		}else if(Bidirection.indexOf(req.query.param.toLowerCase() )>=0 && Unidirection.indexOf(req.query.param.toLowerCase() ) == -1){
			clause = sprintf("(topo_link_symbol.link_symbol_id like '%%%s%%' or topo_link_symbol.link_name1 like '%%%s%%' or topo_link_symbol.remark like '%%%s%%' or topo_node_type.display_name like '%%%s%%' or topo_link_symbol.src_symbol_id in(%s) or topo_link_symbol.dest_symbol_id in(%s) or topo_link_symbol.direction = %d )", 
			req.query.param, req.query.param, req.query.param,req.query.param,strquery,strquery,2);
		}else if(Bidirection.indexOf(req.query.param.toLowerCase() )>=0 && Unidirection.indexOf(req.query.param.toLowerCase() ) >=0){
			clause = sprintf("(topo_link_symbol.link_symbol_id like '%%%s%%' or topo_link_symbol.link_name1 like '%%%s%%' or topo_link_symbol.remark like '%%%s%%' or topo_node_type.display_name like '%%%s%%' or topo_link_symbol.src_symbol_id in(%s) or topo_link_symbol.dest_symbol_id in(%s) or topo_link_symbol.direction = %d or topo_link_symbol.direction = %d)", 
			req.query.param, req.query.param, req.query.param,req.query.param,strquery,strquery,1,2);
		}else{
			clause = sprintf("(topo_link_symbol.link_symbol_id like '%%%s%%' or topo_link_symbol.link_name1 like '%%%s%%' or topo_link_symbol.remark like '%%%s%%'  or topo_node_type.display_name like '%%%s%%' or topo_link_symbol.src_symbol_id in(%s) or topo_link_symbol.dest_symbol_id in(%s))", 
			req.query.param, req.query.param, req.query.param, req.query.param,strquery,strquery);
		}
	}
	return clause;
}

router.get('/link_info', function(req, res, next) {
	var clause = '1=1';
	clause=SearcherInfo(req,clause);

    var conn = null;
    var rows = null;
    var is_superuser = true;
    var privilege_clause = '1=1';
    var privilege_clause2 = '1=1';
    var user_name = '';
    if (req.session['user']) {
      user_name = req.session['user'];
    }
    
    async function link_info() {
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
                privilege_clause = sprintf("topo_link_symbol.src_symbol_id in (%s) and topo_link_symbol.dest_symbol_id in (%s)", ary.join(","), ary.join(","));
            	privilege_clause2 = sprintf("symbol_id in (%s)", ary.join(","));
            	
            }

            sql = sprintf("SELECT COUNT(*) AS count FROM topo_link_symbol, topo_node_type WHERE topo_link_symbol.topo_type_id = topo_node_type.topo_type_id and %s;\
			SELECT topo_link_symbol.link_symbol_id, \
					topo_link_symbol.link_name1, \
					topo_link_symbol.remark, \
					topo_link_symbol.direction, \
					topo_link_symbol.src_symbol_id, \
					topo_link_symbol.dest_symbol_id, \
					topo_node_type.display_name as topo_type_name \
			FROM topo_link_symbol, topo_node_type \
			WHERE topo_link_symbol.topo_type_id = topo_node_type.topo_type_id and %s and %s\
			LIMIT %d, %d;\
			SELECT symbol_id, symbol_name1 FROM topo_symbol WHERE %s;\
			", clause,clause,privilege_clause, req.query.start, req.query.limit, privilege_clause2);
            rows = await conn.query(sql);
            var totalCount = rows[0][0].count;
	    	
	    	for (var i in rows[1]) {
	    		var afind = false;
	    		var zfind = false;
	    		for (var j in rows[2]) {
	    			if (!afind && rows[1][i].src_symbol_id == rows[2][j].symbol_id) {
	    				afind = true;
	    				rows[1][i].anode_name = rows[2][j].symbol_name1;
	    			}
	    			if (!zfind && rows[1][i].dest_symbol_id == rows[2][j].symbol_id) {
	    				zfind = true;
	    				rows[1][i].znode_name = rows[2][j].symbol_name1;
	    			}
	    			if (afind && zfind) {
	    				break;
	    			}
	    		}
	    	}
			
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
                res.json(200, {success: false, msg: 'get link info failed'});  
            } else {
                res.json(200, {success: true, msg: 'get link info success'});  
            }
        }   
    };
    
    link_info();
});

//导出全部
router.get('/link_info/exportAll/datacsv', function(req, res, next) {
	var clause = '1=1';
	clause=SearcherInfo(req,clause)
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = sprintf("SELECT topo_link_symbol.link_symbol_id, \
					topo_link_symbol.link_name1, \
					topo_link_symbol.remark, \
					topo_link_symbol.direction, \
					topo_link_symbol.src_symbol_id, \
					topo_link_symbol.dest_symbol_id, \
					topo_node_type.display_name as topo_type_name \
					FROM topo_link_symbol, topo_node_type \
					WHERE topo_link_symbol.topo_type_id = topo_node_type.topo_type_id and %s;\
					SELECT symbol_id, symbol_name1 FROM topo_symbol;",clause);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['link_symbol_id','anode_name','znode_name', 'link_name1','remark','direction','topo_type_name'];
			var fieldNames = [req.__('Link Symbol ID'), req.__('A Node'),req.__('Z Node'),req.__('Link Name'),
			                  req.__('Remark'),req.__('Link Direction'),req.__('Link Type')];
			var m_data = [];
		    for (var i in rows[0]) {
		    	if(rows[0][i].direction==1){
		    		rows[0][i].direction=req.__('Unidirection').toLowerCase();
		    	}else if(rows[0][i].direction==2){
		    		rows[0][i].direction=req.__('Bidirection').toLowerCase();
		    	}
		    	var afind = false;
	    		var zfind = false;
	    		for (var j in rows[1]) {
	    			if (!afind && rows[0][i].src_symbol_id == rows[1][j].symbol_id) {
	    				afind = true;
	    				rows[0][i].anode_name = rows[1][j].symbol_name1;
	    			}
	    			if (!zfind && rows[0][i].dest_symbol_id == rows[1][j].symbol_id) {
	    				zfind = true;
	    				rows[0][i].znode_name = rows[1][j].symbol_name1;
	    			}
	    			if (afind && zfind) {
	    				break;
	    			}
	    		}	    	
		    	m_data.push(rows[0][i]);   
			}
			conn.release();//关闭连接
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "all_link_info.csv");
			res.status(200).send(newCsv);
	    });	
	});      

});

//导出当前页
router.get('/link_info/exportCurrentPage/datacsv', function(req, res, next) {
	var clause = '1=1';
	clause=SearcherInfo(req,clause)
	// 从数据库连接池获取连接
	APP.dbpool.getConnection(function(err, conn) {
	    var sql = sprintf("SELECT topo_link_symbol.link_symbol_id, \
					topo_link_symbol.link_name1, \
					topo_link_symbol.remark, \
					topo_link_symbol.direction, \
					topo_link_symbol.src_symbol_id, \
					topo_link_symbol.dest_symbol_id, \
					topo_node_type.display_name as topo_type_name \
					FROM topo_link_symbol, topo_node_type \
					WHERE topo_link_symbol.topo_type_id = topo_node_type.topo_type_id and %s LIMIT %d, %d;\
					SELECT symbol_id, symbol_name1 FROM topo_symbol;",clause,req.query.start2, req.query.limit2);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['link_symbol_id','anode_name','znode_name', 'link_name1','remark','direction','topo_type_name'];
			var fieldNames = [req.__('Link Symbol ID'), req.__('A Node'),req.__('Z Node'),req.__('Link Name'),
			                  req.__('Remark'),req.__('Link Direction'),req.__('Link Type')];
			var m_data = [];
		    for (var i in rows[0]) {
		    	if(rows[0][i].direction==1){
		    		rows[0][i].direction=req.__('Unidirection').toLowerCase();
		    	}else if(rows[0][i].direction==2){
		    		rows[0][i].direction=req.__('Bidirection').toLowerCase();
		    	}
		    	var afind = false;
	    		var zfind = false;
	    		for (var j in rows[1]) {
	    			if (!afind && rows[0][i].src_symbol_id == rows[1][j].symbol_id) {
	    				afind = true;
	    				rows[0][i].anode_name = rows[1][j].symbol_name1;
	    			}
	    			if (!zfind && rows[0][i].dest_symbol_id == rows[1][j].symbol_id) {
	    				zfind = true;
	    				rows[0][i].znode_name = rows[1][j].symbol_name1;
	    			}
	    			if (afind && zfind) {
	    				break;
	    			}
	    		}	    	
		    	m_data.push(rows[0][i]);   
			}
			conn.release();//关闭连接
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "currentPage_link_info.csv");
			res.status(200).send(newCsv);
	    });	
	});      
});

//导出选择项
router.get('/link_info/exportSelected/datacsv', function(req, res, next) {
	var ids=req.query.ids;
		APP.dbpool.getConnection(function(err, conn) {
	    var sql = sprintf("SELECT topo_link_symbol.link_symbol_id, \
					topo_link_symbol.link_name1, \
					topo_link_symbol.remark, \
					topo_link_symbol.direction, \
					topo_link_symbol.src_symbol_id, \
					topo_link_symbol.dest_symbol_id, \
					topo_node_type.display_name as topo_type_name \
					FROM topo_link_symbol, topo_node_type \
					WHERE topo_link_symbol.topo_type_id = topo_node_type.topo_type_id and topo_link_symbol.link_symbol_id in (%s);\
					SELECT symbol_id, symbol_name1 FROM topo_symbol;",ids);
	    conn.query(sql, function(err, rows, fields) {
	    	var fields = ['link_symbol_id','anode_name','znode_name', 'link_name1','remark','direction','topo_type_name'];
			var fieldNames = [req.__('Link Symbol ID'), req.__('A Node'),req.__('Z Node'),req.__('Link Name'),
			                  req.__('Remark'),req.__('Link Direction'),req.__('Link Type')];
			var m_data = [];
		    for (var i in rows[0]) {
		    	if(rows[0][i].direction==1){
		    		rows[0][i].direction=req.__('Unidirection').toLowerCase();
		    	}else if(rows[0][i].direction==2){
		    		rows[0][i].direction=req.__('Bidirection').toLowerCase();
		    	}
		    	var afind = false;
	    		var zfind = false;
	    		for (var j in rows[1]) {
	    			if (!afind && rows[0][i].src_symbol_id == rows[1][j].symbol_id) {
	    				afind = true;
	    				rows[0][i].anode_name = rows[1][j].symbol_name1;
	    			}
	    			if (!zfind && rows[0][i].dest_symbol_id == rows[1][j].symbol_id) {
	    				zfind = true;
	    				rows[0][i].znode_name = rows[1][j].symbol_name1;
	    			}
	    			if (afind && zfind) {
	    				break;
	    			}
	    		}	    	
		    	m_data.push(rows[0][i]);   
			}
			conn.release();//关闭连接
			var csv = json2csv({ data: m_data, fields: fields, fieldNames: fieldNames });
			var newCsv = iconv.encode(csv, 'GBK'); // 转编码
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader("Content-Disposition", "attachment; filename=" + "selected_link_info.csv");
			res.status(200).send(newCsv);
	    });	
	}); 
});
module.exports = router;