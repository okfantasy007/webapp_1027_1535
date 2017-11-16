var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('../../topology/web/common.js');

// 加载部分拓扑树 added by huangzl
router.post('/part_tree', function(req, res, next) {
	var is_superuser = true;
    var privilege_clause = '1=1';
	var ids = "'0',";
	var syn_task_id = req.body.syn_task_id;
	var areaTable = req.body.areaTable;
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
	    	if(syn_task_id==null||areaTable==null){
	    		var sql = sprintf("\
		        	SELECT sec_user_belongto_usergroup.sec_usergroup_id\
		          	FROM sec_user, sec_user_belongto_usergroup \
		         	WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
		           	AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
		           	AND sec_user.user_name = '%s';\
		    		", req.session['user']);
        
		    	conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
		        	is_superuser = rows.length == 1;

		        	// call step3 func
		        	callback(null, conn);
		    	});
	    	}else{
	    		callback(null, conn);
	    	}
		    
	    },

	    function (conn, callback) {
	    	if((syn_task_id==null||areaTable==null)&&(!is_superuser)){
	    		var sql = sprintf("\
		          SELECT sec_user_symbol.symbol_id\
		            FROM sec_user, sec_user_symbol \
		           WHERE sec_user.sec_user_id = sec_user_symbol.sec_user_id\
		             AND sec_user_symbol.symbol_id >= 0\
		             AND sec_user.user_name = '%s';\
		          ", req.session['user']);

	    		conn.query(sql, function(err, rows, fields) {
		    		console.log(err);
		    		var ary = [];
		    		for (var i in rows) {
		    			ary.push(rows[i].symbol_id);
					}
					ary.push(0);
					privilege_clause = sprintf("topo_symbol.symbol_id in (%s)", ary.join(","));
					
			        // call step3 func
			        callback(null, conn);
			    });
	    	} else {
	    		callback(null, conn);
	    	}
	    },

	    function (conn, callback) {
	    	if(syn_task_id==null||areaTable==null){
	    		ids = '1=1';
	    		callback(null, conn);
	    	}else{
	    		var sql = "SELECT symbol_id FROM " + areaTable + " WHERE syn_task_id = '" + syn_task_id + "'";
	    		conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
	    			for(var i in rows){
	    				ids += "'" + rows[i].symbol_id + "', ";
	    			}
	    			ids = ids.substring(0,ids.lastIndexOf(","));
	    			ids = "topo_symbol.symbol_id in (" + ids + ")";
	    			privilege_clause = '1=1';
		        	callback(null, conn);
		    	});
	    	}
	    },

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
		         WHERE topo_symbol.is_visible=1 and main_view_id=1 and " + ids + " and " + privilege_clause + ";\
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
			// console.log(JSON.stringify(rec, null, 2));
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

router.post('/edit_rightTree', function(req, res, next) {
	var parentid = req.query.symbol_id;
	var parentCategory = 0;
	// var is_superuser = true;
    // var privilege_clause = '1=1';
    var ids = "'0',";
	var syn_task_id = req.body.syn_task_id;
	var areaTable = req.body.areaTable;
	var isOtherUser = req.body.isOtherUser;
	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		// call step 2 func
		        callback(null, conn);
	    	})
	    },
	    // // step 2 func
	    // function(conn, callback) {
		   //  var sql = sprintf("\
		   //      SELECT sec_user_belongto_usergroup.sec_usergroup_id\
		   //        FROM sec_user, sec_user_belongto_usergroup \
		   //       WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
		   //         AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
		   //         AND sec_user.user_name = '%s';\
		   //  	", req.session['user']);
        
		   //  conn.query(sql, function(err, rows, fields) {
	    // 		console.log(err);
		   //      is_superuser = rows.length == 1;

		   //      // call step3 func
		   //      callback(null, conn);
		   //  });
	    // },

	    // function (conn, callback) {
	    // 	if (!is_superuser) {
	    // 		var sql = sprintf("\
		   //        SELECT sec_user_symbol.symbol_id\
		   //          FROM sec_user, sec_user_symbol \
		   //         WHERE sec_user.sec_user_id = sec_user_symbol.sec_user_id\
		   //           AND sec_user_symbol.symbol_id >= 0\
		   //           AND sec_user.user_name = '%s';\
		   //        ", req.session['user']);

	    // 		conn.query(sql, function(err, rows, fields) {
		   //  		console.log(err);
		   //  		var ary = [];
		   //  		for (var i in rows) {
		   //  			ary.push(rows[i].symbol_id);
					// }
					// ary.push(0);
					// privilege_clause = sprintf("symbol_id in (%s)", ary.join(","));
					
			  //       // call step3 func
			  //       callback(null, conn);
			  //   });
	    // 	} else {
	    // 		callback(null, conn);
	    // 	}
	    // },

	    function (conn, callback) {
	    	if(syn_task_id==null||areaTable==null){
	    		ids = '1=1';
	    		callback(null, conn);
	    	}else{
	    		var sql = "SELECT category FROM " + areaTable + " WHERE syn_task_id = '" + syn_task_id + "' AND symbol_id = '" + parentid + "'" ;
	    		conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
	    			console.log("*****************************************************************************");
	    			if(rows[0]){
	    				parentCategory = rows[0].category;
	    			}
	    			console.log("*****************************************************************************parentCategory:"+parentCategory);
		        	callback(null, conn);
		    	});
	    	}
	    },

	    function (conn, callback) {
	    	if(syn_task_id==null||areaTable==null||parentCategory==1){
	    		ids = '1=1';
	    		callback(null, conn);
	    	}else{
	    		var sql = "SELECT symbol_id FROM " + areaTable + " WHERE syn_task_id = '" + syn_task_id + "'";
	    		conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
	    			for(var i in rows){
	    				ids += "'" + rows[i].symbol_id + "', ";
	    			}
	    			ids = ids.substring(0,ids.lastIndexOf(","));
	    			ids = "topo_symbol.symbol_id in (" + ids + ")";
	    			// ids = '1=1';
	    			console.log("*****************************************************************************ids:"+ids);
		        	callback(null, conn);
		    	});
	    	}
	    },

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
                	   if (`tree_parent_id` <> `map_parent_id` and `res_type_name` = 'REMOTE_DEV', insert(`map_hierarchy`,  instr(`map_hierarchy`,`map_parent_id`) + length(`map_parent_id`) , length(`tree_parent_id`) + length(`symbol_id`) + 3, concat( ',',`tree_parent_id`, ',', `symbol_id`, ',') ), `map_hierarchy`)\
               		   as map_hierarchy\
		          FROM topo_symbol\
		         WHERE topo_symbol.is_visible=1 and map_hierarchy like '%%,%s,%%' and %s;\
		        SELECT topo_type_id,tree_icon_path,display_name \
	          	  FROM topo_node_type", parentid, ids);

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


router.post('/tree', function(req, res, next) {
	var parentid = req.query.symbol_id;
	// var is_superuser = true;
    var privilege_clause = '1=1';
    var ids = "'0',";
	var syn_task_id = req.body.syn_task_id;
	var areaTable = req.body.areaTable;
	var parentCategory = 0;
	var inarea = false;
	var keepRows;
	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		// call step 2 func
		        callback(null, conn);
	    	})
	    },


	    function (conn, callback) {
	    	if(syn_task_id==null||areaTable==null){
	    		ids = '1=1';
	    		callback(null, conn);
	    	}else{
	    		var sql = "SELECT category FROM " + areaTable + " WHERE syn_task_id = '" + syn_task_id + "' AND symbol_id = '" + parentid + "'" ;
	    		conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
	    			console.log("*****************************************************************************parentid:"+parentid);
	    			if(rows[0]){
	    				parentCategory = rows[0].category;
	    				if(!parentCategory){
	    					parentCategory = 0;
	    				}
	    			}
	    			console.log("*****************************************************************************parentCategory:"+parentCategory);
		        	callback(null, conn);
		    	});
	    	}
	    },

	    function(conn, callback) {
   			var sql;
   			if(syn_task_id==null||areaTable==null||parentCategory==1){
	    		sql = sprintf("\
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
                	   if (`tree_parent_id` <> `map_parent_id` and `res_type_name` = 'REMOTE_DEV', insert(`map_hierarchy`,  instr(`map_hierarchy`,`map_parent_id`) + length(`map_parent_id`) , length(`tree_parent_id`) + length(`symbol_id`) + 3, concat( ',',`tree_parent_id`, ',', `symbol_id`, ',') ), `map_hierarchy`)\
               		   as map_hierarchy\
		          FROM topo_symbol\
		         WHERE topo_symbol.is_visible=1 and map_hierarchy like '%%,%s,%%' ORDER BY symbol_id;\
		        SELECT topo_type_id,tree_icon_path,display_name \
	          	  FROM topo_node_type", parentid);
	    	}else{
		    	sql = sprintf("\
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
		               %s.category,\
                	   if (`tree_parent_id` <> `map_parent_id` and topo_symbol.res_type_name = 'REMOTE_DEV', insert(`map_hierarchy`,  instr(`map_hierarchy`,`map_parent_id`) + length(`map_parent_id`) , length(`tree_parent_id`) + length(topo_symbol.symbol_id) + 3, concat( ',',`tree_parent_id`, ',', topo_symbol.symbol_id, ',') ), `map_hierarchy`)\
               		   as map_hierarchy\
		          FROM topo_symbol, %s\
		         WHERE topo_symbol.is_visible=1 and map_hierarchy like '%%,%s,%%'\
		         and %s.symbol_id = topo_symbol.symbol_id\
		         and %s.syn_task_id = '%s'  ORDER BY symbol_id;\
		        SELECT topo_type_id,tree_icon_path,display_name \
	          	  FROM topo_node_type", areaTable,areaTable,parentid,areaTable,areaTable,syn_task_id);
		    }

		    conn.query(sql, function(err, rows, fields) {
	    		// call final func
	    		if(rows[0].length>0){
	    			inarea = true;
	    			console.log("*****************************************************************************inarea:"+ inarea);
	    		}else{
	    			inarea = false;
	    		}
	    		keepRows = rows;
	    		callback(null, conn);
		    });
	    },

	    function (conn, callback) {
	    	if(inarea&&parentCategory==2){
	    		console.log("*****************************************************************************inarea");
	    		callback(null, conn, keepRows);
	    	}else{
	    		console.log("*****************************************************************************not inarea");
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
		         WHERE topo_symbol.is_visible=1 and map_hierarchy like '%%,%s,%%';\
		        SELECT topo_type_id,tree_icon_path,display_name \
	          	  FROM topo_node_type", parentid);

		    	conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
		        	callback(null, conn, rows);
		    	});
	    	}
	    }

	], 
	// final func
	function (err, conn, rows) {
        conn.release();

		var nodes = {};
	    for (var i in rows[0]) {
	    	nodes[ rows[0][i].symbol_id ] = rows[0][i];
		}
		console.log("*****************************************************************************1");
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
	    		if (find||rec['category']) {
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
    	console.log("*****************************************************************************5");
	    comm.get_device_tree_node_type(rows[1], nodes);
    	
        res.status(200).json({
            success: true,
            expanded: true,
            children: tree,
        });  

	});
});


router.post('/all_area_tree', function(req, res, next) {
	var is_superuser = true;
    var privilege_clause = '1=1';
	var ids = "'0',";
	var syn_task_id = req.body.syn_task_id;
	var areaTable = req.body.areaTable;
	var create_user = req.body.create_user;
	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		console.log("*****************************************************************************1");
	    		// call step 2 func
		        callback(null, conn);
	    	})
	    },
	    // step 2 func
	    function(conn, callback) {
	    	if(!(syn_task_id==null||areaTable==null)){
	    		var sql = sprintf("\
		        	SELECT sec_user_belongto_usergroup.sec_usergroup_id\
		          	FROM sec_user, sec_user_belongto_usergroup \
		         	WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
		           	AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
		           	AND sec_user.user_name = '%s';\
		    		", req.session['user']);
        
		    	conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
		        	is_superuser = rows.length == 1;
		console.log("*****************************************************************************2");
		        	// call step3 func
		        	callback(null, conn);
		    	});
	    	}else{
	    		callback(null, conn);
	    	}
		    
	    },

	    function (conn, callback) {
	    	if((syn_task_id==null||areaTable==null)&&(!is_superuser)){
	    		var sql = sprintf("\
		          SELECT sec_user_symbol.symbol_id\
		            FROM sec_user, sec_user_symbol \
		           WHERE sec_user.sec_user_id = sec_user_symbol.sec_user_id\
		             AND sec_user_symbol.symbol_id >= 0\
		             AND sec_user.user_name = '%s';\
		          ", req.session['user']);

	    		conn.query(sql, function(err, rows, fields) {
		    		console.log(err);
		    		var ary = [];
		    		for (var i in rows) {
		    			ary.push(rows[i].symbol_id);
					}
					ary.push(0);
					privilege_clause = sprintf("topo_symbol.symbol_id in (%s)", ary.join(","));
					
			        // call step3 func
			        callback(null, conn);
			    });
	    	} else {
	    		console.log("*****************************************************************************3");
	    		callback(null, conn);
	    	}
	    },
/*
	    function (conn, callback) {
	    	if(syn_task_id==null||areaTable==null){
	    		ids = '1=1';
	    		callback(null, conn);
	    	}else{
	    		var sql = "SELECT symbol_id FROM " + areaTable + " WHERE syn_task_id = '" + syn_task_id + "'";
	    		conn.query(sql, function(err, rows, fields) {
	    			console.log(err);
	    			for(var i in rows){
	    				ids += "'" + rows[i].symbol_id + "', ";
	    			}
	    			ids = ids.substring(0,ids.lastIndexOf(","));
	    			ids = "topo_symbol.symbol_id in (" + ids + ")";
	    			privilege_clause = '1=1';
		        	callback(null, conn);
		    	});
	    	}
	    },
*/
	    function(conn, callback) {
	    	console.log("*****************************************************************************4");
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
		               "+ areaTable +".category,\
		               least(\
		                    if(`new_critical_alarm_count` > 0 or `ac_critical_alarm_count` > 0, 1, 7), \
		                    if(`new_major_alarm_count` > 0 or `ac_major_alarm_count` > 0, 2, 7),\
		                    if(`new_minor_alarm_count` > 0 or `ac_minor_alarm_count` > 0, 3, 7),\
		                    if(`new_warning_alarm_count` > 0 or `ac_warning_alarm_count` > 0, 4, 7),\
		                    if(`new_indeterminate_alarm_count` > 0 or `ac_indeterminate_alarm_count` > 0, 5, 7)\
                	   ) as minlevel,\
                	   if (`tree_parent_id` <> `map_parent_id` and topo_symbol.res_type_name = 'remote_dev', insert(`map_hierarchy`,  instr(`map_hierarchy`,`map_parent_id`) + length(`map_parent_id`) , length(`tree_parent_id`) + length(topo_symbol.symbol_id) + 3, concat( ',',`tree_parent_id`, ',', topo_symbol.symbol_id, ',') ), `map_hierarchy`)\
               		   as map_hierarchy\
		          FROM topo_symbol, "+ areaTable+"\
		         WHERE topo_symbol.is_visible=1 and main_view_id=1 and " + areaTable + ".symbol_id = topo_symbol.symbol_id and " + areaTable + ".syn_task_id = '"+ syn_task_id +"' and " + privilege_clause + ";\
		        SELECT topo_type_id,tree_icon_path,display_name\
	          	  FROM topo_node_type";
		    conn.query(sql, function(err, rows, fields) {
	    		// call final func
	    		console.log(sql);
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
	    var fullSet = [];

	    for (var i in rows[0]) {
	    	var rec = rows[0][i];
	    	if (rec['symbol_id'] != 0&&rec['category']==1) {
	    		fullSet.push(rec['symbol_id']);
	    	}
	        if (rec['tree_parent_id'] == -1 && rec['symbol_id'] != 0) {
	            continue
	        }
	        var ids_chan = rec['map_hierarchy']
	        	.split(',')
	        	.filter(function (s) {
	        		return s != ''
	        	});
			// console.log(JSON.stringify(rec, null, 2));
	    	comm.push_node_chan(tree, nodes, ids_chan)
		}
		for (var i in fullSet) {
			var set = nodes[fullSet[i]];
			if (!set.children) {
	    		set.expanded = false;
	    		set.children = [];
	            var loading = new Object();
				loading.symbol_id = "loading";
				loading.text = "";
				set.children.push(loading);
				set.leaf = false;
	    	} else {
	    		set.leaf = true;
	    	}
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


module.exports = router;