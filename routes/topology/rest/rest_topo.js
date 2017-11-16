var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('../web/common.js');
// -------------------------------- 拓扑模块提供给各个子系统模块的REST接口 -------------------------------------

// 添加拓扑符号信息(包括：设备、符号、子网)
router.post('/add_symbol', function(req, res, next) {
	var symbols = req.body.symbols;
	var conn = null;
	var rows = null;
	
	async function add_symbol() {
		try{
			conn = await APP.dbpool_promise.getConnection();
			for(var i in symbols) {
				var sql = "select max(symbol_id)+1 as id from topo_symbol";
			    rows = await conn.query(sql);
			    var nextid = rows[0].id;

				if(typeof(symbols[i].userlabel) == 'undefined'){
					symbols[i].userlabel = '';
				}
				if(typeof(symbols[i].ipaddress) == 'undefined'){
					symbols[i].symbol_name3 = symbols[i].userlabel;
				} else {
					symbols[i].symbol_name3 = symbols[i].ipaddress;
				}

				if(typeof(symbols[i].ne_id) == 'undefined'){
					symbols[i].ne_id = 0;
				}
				if(typeof(symbols[i].symbol_style) == 'undefined'){
					symbols[i].symbol_style = 1;
				}
				if(typeof(symbols[i].res_id) == 'undefined'){
					symbols[i].res_id = nextid;
				}
				if(typeof(symbols[i].res_type_name) == 'undefined'){
					symbols[i].res_type_name = '';
				}
				if(typeof(symbols[i].view_id) == 'undefined'){
					symbols[i].view_id = 1;
				}
				if(typeof(symbols[i].map_parent_id) == 'undefined'){
					symbols[i].map_parent_id = 0;
				}
				if(typeof(symbols[i].tree_parent_id) == 'undefined'){
					symbols[i].tree_parent_id = 0;
				}
				if(typeof(symbols[i].map_hierarchy) == 'undefined'){
					symbols[i].map_hierarchy = ',0,1,';
				}
				if(typeof(symbols[i].topo_type_id) == 'undefined'){
					symbols[i].topo_type_id = '';
				} else {
					sql = sprintf("SELECT topo_type_id FROM topo_node_type WHERE display_name = '%s'", symbols[i].topo_type_id);
					rows = await conn.query(sql);
					symbols[i].topo_type_id = rows[0].topo_type_id;
					
					if (symbols[i].topo_type_id == '7_Spliter') {
		                symbols[i].tree_parent_id =-1;
		            }
				}
				if(typeof(symbols[i].x) == 'undefined'){
					// 获取[100, 1500)之间的随机整数
		    		var diff = 1400;
					var num = Math.random() * 1400 + 100;
					num = parseInt(num, 10);
					symbols[i].x = num;
				}
				if(typeof(symbols[i].y) == 'undefined'){
					// 获取[100, 1500)之间的随机整数
		    		var diff = 1400;
					var num = Math.random() * 1400 + 100;
					num = parseInt(num, 10);
					symbols[i].y = num;
				}
				if(typeof(symbols[i].is_visible) == 'undefined'){
					symbols[i].is_visible = 1;
				}

	            var array = symbols[i].map_hierarchy.split(',').slice(0, -2);
	            var map_hierarchy = array.join(',') + ',' + nextid + ',';
	            sql = sprintf("INSERT INTO `topo_symbol`\
	                    (`symbol_id`, `main_view_id`, `ne_id`, `symbol_style`, `create_user`, `map_hierarchy`, `res_type_name`,`map_parent_id`,`tree_parent_id`,\
	                     `symbol_name1`, `symbol_name2`, `symbol_name3`, `remark`, `x`, `y`,\
	                     `status_is_ping_ok`, `is_visible`, `res_id`, `topo_type_id`, `real_res_type_name`, `real_res_id`)\
	                    VALUES(%d, %d, %d, %d, '%s', '%s', '%s', %d, %d, '%s', '%s', '%s', '%s', %d, %d, %d, %d, '%s', '%s', '%s', '%s')",
	                    parseInt(nextid),
	                    symbols[i].view_id,
	                    symbols[i].ne_id,
	                    symbols[i].symbol_style,
	                    req.session['user'],
	                    map_hierarchy,
	                    symbols[i].res_type_name,
	                    symbols[i].map_parent_id,
	                    symbols[i].tree_parent_id,
	                    symbols[i].userlabel,
	                    symbols[i].userlabel,
	                    symbols[i].symbol_name3,
	                    '',
	                    symbols[i].x,
	                    symbols[i].y,
	                    1,
	                    symbols[i].is_visible,
	                    symbols[i].res_id,
	                    symbols[i].topo_type_id,
	                    symbols[i].res_type_name,
	                    symbols[i].res_id
	                );
	            await conn.query(sql);
			}

			await APP.dbpool_promise.releaseConnection(conn);
			res.json(200, {success: true, msg: 'add symbol success'}); 
		} catch (err) {
			console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	res.json(200, {success: false, msg: 'add symbol failed'});  
	    	} else {
		        res.json(200, {success: true, msg: 'add symbol success'});  
	    	}
		}	
	};
	
	add_symbol();
});

// 添加链路
router.post('/add_link', function(req, res, next) {
	// var links = JSON.parse(req.body.links);
	var links = req.body.links;
	console.log('### add link ###', links);
	var conn = null;
	var rows = null;
	var linkids = [];
	
	async function add_link() {
		try{
			conn = await APP.dbpool_promise.getConnection();
			for(var i in links) {
				var sql = "select max(link_symbol_id)+1 as id from topo_link_symbol;";
			    rows = await conn.query(sql);
			    var link_symbol_id = 1;
			    if (rows[0].id) {
			    	link_symbol_id = rows[0].id;
			    }
			    sql = sprintf("select symbol_id AS src_symbol_id from topo_symbol where res_id = %d and map_parent_id != -1;\
			    	select symbol_id AS dest_symbol_id from topo_symbol where res_id = %d and map_parent_id != -1;\
		    	", links[i].src_ne_id, links[i].dest_ne_id);
		    	console.log("sql1------------"+sql);
		    	rows = await conn.query(sql);
			    if (rows[0].length <=0 || rows[1].length <=0) {
			    	APP.dbpool_promise.releaseConnection(conn);
	        		res.json(500, {success: false, msg: 'add link failed'});
	        		return;
			    }

	        	var src_symbol_id = rows[0][0].src_symbol_id;
			    var dest_symbol_id = rows[1][0].dest_symbol_id;

				if(typeof(links[i].linkname) == 'undefined'){
					links[i].linkname = '';
				}
				if(typeof(links[i].dest_port_id) == 'undefined'){
					links[i].dest_port_id = '';
				}
				if(typeof(links[i].src_port_id) == 'undefined'){
					links[i].src_port_id = '';
				}
				if(typeof(links[i].src_ne_id) == 'undefined'){
					links[i].src_ne_id = '';
				}
				if(typeof(links[i].dest_ne_id) == 'undefined'){
					links[i].dest_ne_id = '';
				}
				if(typeof(links[i].topo_type_id) == 'undefined'){
					links[i].topo_type_id = '17';
				}
				if(typeof(links[i].restypename) == 'undefined'){
					links[i].restypename = 'TOPO_MAINVIEW_LINK_SYMBOL';
				}
				if(typeof(links[i].isphylink) != 'undefined'){
					links[i].topo_type_id = '16';
					links[i].restypename = 'LINK';
				}
				if(typeof(links[i].islink_auto_discover) == 'undefined'){
					links[i].islink_auto_discover = 2;
				}
				if(typeof(links[i].direction) == 'undefined'){
					links[i].direction = 2;
				}
				if(typeof(links[i].color) == 'undefined'){
					links[i].color = 0;
				}
				if(typeof(links[i].width) == 'undefined'){
					links[i].width = 2;
				}
				if(typeof(links[i].style) == 'undefined'){
					links[i].style = 0;
				}
				if(typeof(links[i].shape) == 'undefined'){
					links[i].shape = 0;
				} 
				sql = sprintf("INSERT INTO `topo_link`\
					(`link_name`, `friendly_name`, `src_port_id`, `src_port_type`, `des_port_id`, `des_port_type`, `src_res_type`, `src_id`, `des_res_type`, `des_id`, `link_direction`, `islink_auto_discover`, `shape`, `style`, `link_state`)\
					VALUES('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', %d, %d, %d, %d, %d)\
					", links[i].linkname, links[i].linkname, links[i].src_port_id, 'PORT', links[i].dest_port_id, 'PORT', 'NE', links[i].src_ne_id, 'NE', links[i].dest_ne_id, links[i].direction, links[i].islink_auto_discover, links[i].shape, links[i].style, links[i].link_state);
				console.log('### insert topo link ###', sql);
				var addlink = await conn.query(sql);
				var linkid = addlink.insertId;
				linkids.push(linkid);

			    sql = sprintf("\
			         INSERT INTO `topo_link_symbol`\
	            	(`link_symbol_id`, `main_view_id`, `res_id`, `res_type_name`, `src_symbol_id`, `dest_symbol_id`, \
	                	`link_name1`, `remark`, `direction`, `color`, `width`, `style`, `shape`, `topo_type_id`,\
	               		`real_res_type_name`, `real_res_id`, `src_map_hierarchy`, `des_map_hierarchy`)\
	   				 VALUES\
	        			(%d, %d, '%s', '%s', %d, %d, '%s', '%s', %d, %d, %d, %d, %d, '%s', '%s', '%s', '%s', '%s');\
	    			", parseInt(link_symbol_id),
			                1,
			                linkid.toString(),
			                links[i].restypename,
			                src_symbol_id,
			                dest_symbol_id,
			                links[i].linkname,
			                '',
			                links[i].direction,
			                links[i].color,
			                links[i].width,
			                links[i].style,
			                links[i].shape,
			                links[i].topo_type_id,
			                links[i].restypename,
			                linkid.toString(),
			                ',0,' + src_symbol_id + ',',
			                ',0,' + dest_symbol_id + ','
			            );
			    console.log('### insert topo link symbol ###', sql);
	            await conn.query(sql);
			}

			var sql = sprintf("select link_id, link_name, src_port_id, des_port_id as dest_port_id, src_id as src_ne_id, des_id as dest_ne_id, link_direction from topo_link where link_id in (%s)",linkids.join(','));
			rows = await conn.query(sql);
			console.log('### add link rows ###', rows);
			await APP.dbpool_promise.releaseConnection(conn);
			res.json(200, {success: true, msg: 'add link success', data: rows}); 
		} catch (err) {
			console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	res.json(500, {success: false, msg: 'add link failed', data: err});  
	    	} else {
		        res.json(200, {success: true, msg: 'add link success', data: rows});  
	    	}
		}	
	};
	
	add_link();
});

// 修改链路
router.post('/edit_link', function(req, res, next) {
	var links = req.body.links;
	console.log('### edit link ###', links);
	var conn = null;
	var linkids = [];
	var rows = null;
	async function edit_link() {
		try{
			conn = await APP.dbpool_promise.getConnection();
			for(var i in links) {
				var linkid = links[i].link_id;
				var dest_ne_id = links[i].dest_ne_id;
				var dest_port_id = links[i].dest_port_id;
				var link_state = links[i].link_state;
				var sql = sprintf("UPDATE `topo_link`\
		              SET `des_id` = '%s', `des_port_id` = '%s', `link_state` = %d\
		              WHERE `link_id` = %d;\
		          ", dest_ne_id, dest_port_id, link_state, linkid);
				console.log("---------------------------------"+sql);
		    	await conn.query(sql);
		    	linkids.push(linkid);
			}

			var sql = sprintf("select link_id, link_name, src_port_id, des_port_id as dest_port_id, src_id as src_ne_id, des_id as dest_ne_id, link_direction from topo_link where link_id in (%s)", linkids.join(','));
			rows = await conn.query(sql);

			await APP.dbpool_promise.releaseConnection(conn);
			res.json(200, {success: true, msg: 'edit link success', data: rows}); 
		} catch (err) {
			console.log("=======",err);
	        APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	res.json(500, {success: false, msg: 'edit link failed', data: err});  
	    	} else {
		        res.json(200, {success: true, msg: 'edit link success', data: rows});  
	    	}
		}	
	};
	
	edit_link();
});

// 删除链路
router.post('/delete_link', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {
		sql = sprintf("DELETE FROM `topo_link_symbol`\
              WHERE `res_id` = '%s';\
              DELETE FROM `topo_link`\
              WHERE `link_id` = %d;\
          ", req.body.link_id, req.body.link_id);
    
	    conn.query(sql, function(err, result) {
			if(err){
				console.log(err);
			} 
			else{
				res.json(200, {
				success:true,
				msg:"delete link success",
				});  
			}
	    });
	}); 
});

router.post('/tree', function(req, res, next) {
	var parentid = req.body.symbol_id;
	var is_superuser = true;
    var privilege_clause = '1=1';
    var user_name = '';
    if (req.session['user']) {
    	user_name = req.session['user'];
    }
    
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
		    var sql = sprintf("\
		        SELECT sec_user_belongto_usergroup.sec_usergroup_id\
		          FROM sec_user, sec_user_belongto_usergroup \
		         WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
		           AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
		           AND sec_user.user_name = '%s';\
		    	", user_name);
        	
		    conn.query(sql, function(err, rows, fields) {
	    		 console.log("==============="+err);
	    		if (err) {
	    			callback(err, conn, rows);
	    		} else {
		    		is_superuser = rows.length == 1;

			        // call step3 func
			        callback(null, conn);
	    		}
		        
		    });
	    },

	    function (conn, callback) {
	    	if (!is_superuser) {
	    		var sql = sprintf("\
		          SELECT sec_user_symbol.symbol_id\
		            FROM sec_user, sec_user_symbol \
		           WHERE sec_user.sec_user_id = sec_user_symbol.sec_user_id\
		             AND sec_user_symbol.symbol_id >= 0\
		             AND sec_user.user_name = '%s';\
		          ", user_name);

	    		conn.query(sql, function(err, rows, fields) {
		    	 console.log("==============="+err);
		    		var ary = [];
		    		for (var i in rows) {
		    			ary.push(rows[i].symbol_id);
					}
					ary.push(0);
					privilege_clause = sprintf("symbol_id in (%s)", ary.join(","));
					
			        // call step3 func
			        callback(null, conn);
			    });
	    	} else {
	    		callback(null, conn);
	    	}
	    },
	    // step 2 func
	    function(conn, callback) {
	    	
		    var sql = sprintf("\
		        SELECT topo_symbol.symbol_id,\
		        	   topo_symbol.symbol_id as id,\
		               topo_symbol.symbol_name1 as text,\
		               topo_symbol.symbol_name1,\
		               topo_symbol.remark,\
		               topo_symbol.res_id,\
		               topo_symbol.ne_id,\
		               topo_symbol.tree_parent_id,\
		               topo_symbol.map_parent_id,\
		               topo_symbol.real_res_type_name,\
		               topo_symbol.topo_type_id,\
		               topo_symbol.status_is_ping_ok,\
		               topo_symbol.display_topo_type_id,\
		               topo_symbol.res_type_name,\
		               topo_symbol.layout,\
		               topo_symbol.level,\
		               topo_symbol.create_user,\
                	   if (`tree_parent_id` <> `map_parent_id` and `res_type_name` = 'REMOTE_DEV', insert(`map_hierarchy`,  instr(`map_hierarchy`,`map_parent_id`) + length(`map_parent_id`) , length(`tree_parent_id`) + length(`symbol_id`) + 3, concat( ',',`tree_parent_id`, ',', `symbol_id`, ',') ), `map_hierarchy`)\
               		   as map_hierarchy\
		          FROM topo_symbol\
		         WHERE topo_symbol.is_visible=1 and map_hierarchy like '%%,%s,%%' and %s;\
		        SELECT topo_type_id,tree_icon_path,display_name,svg_icon \
	          	  FROM topo_node_type", parentid, privilege_clause);
		 
		    conn.query(sql, function(err, rows, fields) {
	    		// call final func
	    		 console.log("==============="+err);
	    		if (err) {
	    			callback(err, conn, rows);
	    		} else {
	    			callback(null, conn, rows);
	    		}
		        
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();
        if (err) {
        	res.status(200).json({
	            success: true,
	            expanded: true,
	            children: []
	        }); 
	        return;
        }
		var nodes = {};
	    for (var i in rows[0]) {
	    	nodes[ rows[0][i].symbol_id ] = rows[0][i];
		}

	    var tree=[];
	    var treet = [];
	    for (var i in rows[0]) {
	    	var rec = rows[0][i];
	        if (rec['tree_parent_id'] == -1 && rec['symbol_id'] != 0) {
	            continue
	        }
	        var ids_chan = rec['map_hierarchy']
	        	.split(',')
	        	.filter(function (s) {
	        		return s != ''
	        	});

    		if (rec['tree_parent_id'] == -1 && rec['symbol_id'] == 0 && parentid == 0) {
	    		rec.expanded = true;
	    		rec.leaf = false;
                rec.children=treet;
	    		tree.push(rec);
	    	} else if (ids_chan[ids_chan.length - 2] == parentid) {
	    		var k = 0;
	    		var find = false;
	    		for (var j in rows[0]) {
	    			if (rows[0][j].tree_parent_id == -1) {
	    				continue;
	    			}
	    			var chan = rows[0][j]['map_hierarchy']
			        	.split(',')
			        	.filter(function (s) {
			        		return s != ''
			        	});
			        if (chan.indexOf(ids_chan[ids_chan.length - 1]) != -1) {
			        	k++;
			        }
			        if (k >= 2) {
			        	find = true;
			        	break;
			        }
	    		}
	    		if (find) {
	    			rec.expanded = false;
	    			rec.children = [];
	                var loading = new Object();
					loading.symbol_id = "loading";
					loading.text = "";
					rec.children.push(loading);
	    		} else {
	    			rec.leaf = true;
	    		}
	    		
	    		if (parentid == 0) {
	    			treet.push(rec);
	    		} else {
	    			tree.push(rec);
	    		}
	    	}
    	} 

	    comm.get_device_tree_node_type(rows[1], nodes);
   
        res.status(200).json({
            success: true,
            expanded: true,
            children: tree,
        });  

	});
});

module.exports = router;