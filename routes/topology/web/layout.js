var express = require('express');
var router = express.Router();
var async = require('async');
var viz = require('viz.js');
var comm = require('./common.js');

// -------------------------------- 拓扑图的布局 -------------------------------------

// 使用异步模式保存拓扑坐标
router.post('/save_layout', function(req, res, next) {
	var nodes = JSON.parse(req.body.nodes);
	// console.log(nodes);

	APP.dbpool.getConnection(function(err, conn) {

		// 使用async.each处理
		async.each(nodes, function(node, callback) {
		    // console.log('Processing node ', node);
		    var sql = sprintf("UPDATE topo_symbol SET x = %d, y = %d WHERE symbol_id = %d ",
		    	node.x, node.y, node.symbol_id
		    );
			// console.log("##SQL##", sql);
		    conn.query(sql, function(err, result) {
				// console.log("##Result##", result);
				if (err) {
					console.log(err);
					callback(err);
				} else {
					callback();
				}
		    })

		}, 

		// final function 
		function(err) {
			conn.release();
			var msg;
		    if( err ) {
		      	// One of the iterations produced an error.
		      	// All processing will now stop.
		      	msg = err;
		    } else {
		      	msg = 'All files have been processed successfully'
		    };

		    console.log(msg);
			res.json(200, {
				success: !err,
				msg: msg,
			});  

		}); // async

	}); // getConnection

});


// 使用批量模式保存拓扑坐标
router.post('/save_layout/batch', function(req, res, next) {
	var nodes = JSON.parse(req.body.nodes);
	// console.log(nodes);

	APP.dbpool.getConnection(function(err, conn) {

		var sql_ary=[], sql;
		for (var i in nodes) {
		    sql_ary.push (
		    	sprintf("UPDATE topo_symbol SET x=%d, y=%d WHERE symbol_id=%d",
		    		nodes[i].x, nodes[i].y, nodes[i].symbol_id
		    	)
		    );
		};
		sql = sql_ary.join(";");
		sql += sprintf(";UPDATE topo_symbol SET background_params='%s' WHERE symbol_id=%d;",
		    		req.body.background_params, parseInt(req.body.subnetid)
		    	);
		
	    conn.query(sql, function(err, result) {
			// console.log("##Result##", result.length);
			var result;
			if (err) {
				result = 0;
				console.log(err);
			}else{
				result = 1;
			}
			conn.release();
			//后续需要做国际化
        	var task = {
                account:req.session.user,//登录用户名称
                level:0,//日志上报级别
                operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
                result:result,//结果0:成功;1:失败
                operateContent:T.__('Save topo coordinates'),//日志内容
                operateName:T.__('Save'),
                operateObject:T.__('Topology'),
            }
            comm.logTopology(task);//记录安全日志
			res.json(200, {
				success: !err,
				msg: 'success',
			});  
	    })
	}); // getConnection

});

// 拓扑布局
router.post('/new_layout', function(req, res, next) {
	// console.log(req.body);
    var padding = 64;
	var nodes = JSON.parse(req.body.nodes);
	var links = JSON.parse(req.body.links);
	var engine = req.body.type;

	// 生成dot格式输入
    var ary = [];
    ary.push("graph G {");	// 无向图
    // ary.push("digraph G {"); // 有向图
    ary.push(
    	sprintf('\tsize="%d,%d"; margin=%d; ratio=fill;',
    		parseInt(req.body.width) - padding*2,
    	 	parseInt(req.body.height)- padding*2,
    		padding)
    );
    for (var i in nodes) {
        ary.push(sprintf("\t%d;",nodes[i]))
    };
    for (var i in links) {
        // ary.push(sprintf("\t%d -> %d;", links[i].source, links[i].target))  // 有向图
        ary.push(sprintf("\t%d -- %d;", links[i].source, links[i].target))  // 无向图
    };
    ary.push("}");
    var dot = ary.join("\n");
    // console.log(dot);

    // 调用viz.js, 输出为文本，按行分割
    // 参考 https://github.com/mdaines/viz.js
    var result = viz(dot, {
	 	engine: engine,
	 	format: "plain",
	 	// format: "json"
	});
    var lines = result.split("\n");

    // 组织结果格式
	var r = {};
	r.nodes = {};
    for (var i in lines) {
    	var a = lines[i].split(' ');
		if (a[0].toLowerCase()=='graph') {
			r.scale = parseFloat(a[1]);
			r.width = parseFloat(a[2]) + padding*2;
			r.height = parseFloat(a[3]) + padding*2;
		}
		if (a[0].toLowerCase()=='node') {
			var n = {};
			n.x = parseFloat(a[2]) + padding;
			n.y = parseFloat(a[3]) + padding;
			r.nodes[ a[1] ] = n;
		}
    };

    // 针对树形布局，y坐标反转
    if (engine=='dot') {
    	for (var k in r.nodes) {
    		r.nodes[k].y = parseFloat(req.body.height) - r.nodes[k].y;
    	}
    };

    r.wscale = parseFloat(req.body.height)/r.height;
    r.hscale = parseFloat(req.body.width)/r.width;
 
    // 返回计算结果
    r.success = r.wscale<=1 &&  r.hscale<=1;
    // console.log(r);
	res.json(200, r);  
});

module.exports = router;
