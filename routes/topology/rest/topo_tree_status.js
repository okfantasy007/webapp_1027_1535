var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('./../web/common.js');

// ======================= 实现拓扑树节点颜色状态的rest操作 =======================

// 计算拓扑树的状态
router.route('/').get(function(req, res, next) {

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
		        SELECT topo_mainview_symbol.symbol_id,\
		        	   topo_mainview_symbol.symbol_id as id,\
		               topo_mainview_symbol.tree_parent_id,\
		               topo_mainview_symbol.map_parent_id,\
		               topo_mainview_symbol.status_is_ping_ok,\
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
		         WHERE topo_symbol.is_visible=1;\
		         ";

		    conn.query(sql, function(err, rows, fields) {
	    		console.log(err);
	    		var nodes = {};
			    for (var i in rows) {
			    	if (rows[i].minlevel == 7) {
			    		rows[i].minlevel = 0;
			    	}
			    	// console.log(i, rows[i].text);
			    	nodes[ rows[i].symbol_id ] = rows[i];
				}

			    var tree=[];

			    for (var i in rows) {
			    	var rec = rows[i];
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

			    // comm.get_device_tree_node_type(rows[1], nodes);
		    	comm.set_tree_status(tree);
		    	var sql = set_tree_node_level(tree);
		    	
		    	// call step 3 func
		        callback(null, conn, sql);
		    });
	    },
	    // step 3 func
	    function(conn, sql, callback) {
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

        res.status(200).json({
            success: true
        });
	});
});

set_tree_node_level = function(tree) {
	var sql = '';
    for (var i in tree) {
    	var icon = tree[i]['iconCls'].split('_');
        sql += sprintf("update topo_symbol set level = %s WHERE symbol_id = %s;", icon[icon.length - 1], tree[i]['symbol_id']);
        if (!("leaf" in tree[i])) {
            sql += set_tree_node_level(tree[i]['children']);
        }
    }
    return sql;
};

module.exports = router;