var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('./common.js');

// -------------------------------- 拓扑树的呈现 -------------------------------------

// 加载整棵拓扑树
router.get('/whole_tree', function(req, res, next) {

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
		    var sql = "\
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
		               least(\
		                    if(`new_critical_alarm_count` > 0 or `ac_critical_alarm_count` > 0, 1, 7), \
		                    if(`new_major_alarm_count` > 0 or `ac_major_alarm_count` > 0, 2, 7),\
		                    if(`new_minor_alarm_count` > 0 or `ac_minor_alarm_count` > 0, 3, 7),\
		                    if(`new_warning_alarm_count` > 0 or `ac_warning_alarm_count` > 0, 4, 7),\
		                    if(`new_indeterminate_alarm_count` > 0 or `ac_indeterminate_alarm_count` > 0, 5, 7)\
                	   ) as minlevel,\
                	   if (`tree_parent_id` <> `map_parent_id` and `res_type_name` = 'remote_dev', insert(`map_hierarchy`,  instr(`map_hierarchy`,`map_parent_id`) + length(`map_parent_id`) , length(`tree_parent_id`) + length(`symbol_id`) + 3, concat( ',',`tree_parent_id`, ',', `symbol_id`, ',') ), `map_hierarchy`)\
               		   as map_hierarchy\
		          FROM topo_symbol\
		         WHERE topo_symbol.is_visible=1 and main_view_id=1;\
		        SELECT topo_type_id,tree_icon_path,display_name\
	          	  FROM topo_node_type";
	        
		    conn.query(sql, function(err, rows, fields) {
	    		// call final func
	    		console.log(err);
		        callback(null, conn, rows);
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();
    
		var nodes = {};
	    for (var i in rows[0]) {
	    	if (rows[0][i].minlevel == 7) {
	    		rows[0][i].minlevel = 0;
	    	}
	    	// console.log(i, rows[i].text);
	    	nodes[ rows[0][i].symbol_id ] = rows[0][i];
		}

	    var tree=[];

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
			
	    	comm.push_node_chan(tree, nodes, ids_chan)
		}

	    comm.get_device_tree_node_type(rows[1], nodes);
    	// comm.set_tree_status(tree);
    	// console.log(JSON.stringify(tree, null, 2));
        res.status(200).json({
            // text: 'root',
            success: true,
            expanded: true,
            children: tree,
        });  

	});
});

// 分层加载拓扑树
router.get('/tree', function(req, res, next) {
	var parentid = req.query.symbol_id;
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
	    		// console.log(err);
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
		    		console.log(err);
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
	    		console.log(err);
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

//通过symbol_id来拿map_hierarchy
router.get('/getMap_hierarchyBySymbol_id', function(req, res, next) {
	var symbol_id=req.query.symbol_id;
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
	    	var sql = sprintf("select map_hierarchy from topo_symbol where symbol_id=%d",symbol_id);
	    	conn.query(sql, function(err, rows, fields) {
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
        if(!err){
        	res.status(200).json({
	            success: true,
	            map_hierarchy: rows[0].map_hierarchy
	        });  
        }
        conn.release();
    });

});
module.exports = router;