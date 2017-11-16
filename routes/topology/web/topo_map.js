var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('./common.js');
// -------------------------------- 拓扑图的整体呈现 -------------------------------------

// 节点小图标
var get_symbols = function(rec) {
    var symbols = [];

    if (parseInt(rec['status_is_ping_ok']) == 0) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/offline.gif",
	    	svgicon: 'icon-xmen',
        	color: '#d9534f'
        });
    }

    if (rec['status_unaccredit'] == 2) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/unaccredit.png",
	    	svgicon: 'icon-shield-off',
        	color: '#ff851b'
    	});
    }

    if (rec['status_pre_config'] == 1) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/preconfig.gif",
	    	svgicon: 'icon-if_gear_383132',
        	color: '#31b0d5'
    	});
    }

    if ('status_sync' in rec) {
    	if (rec['status_sync'] == -1) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/sync_failed.gif",
		    	svgicon: 'icon-sync_fail',
		    	color: '#d9534f'
	    	});
    	} else if (rec['status_sync'] == 0) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/sync.gif",
		    	svgicon: 'icon-if_Inout_984747',
	        	color: '#00CD00'
	    	});
    	}
    } 

    if ('status_config_sync' in rec) {
    	if (rec['status_config_sync'] == -1) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/sync_config_failed.gif",
		    	svgicon: 'icon-sync_config',
	        	color: '#d9534f'
	    	});
    	} else if (rec['status_config_sync'] == 0) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/sync_config.gif",
		    	svgicon: 'icon-sync_config',
	        	color: '#00CD00'
	    	});
    	}
    }

    if (rec['status_performance'] == 1) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/pm_collect.png",
	    	svgicon: 'icon-stockup',
        	color: '#00CD00'
    	});
    }

    if (rec['status_alarm_filter'] == 1) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/filter.png",
	    	svgicon: 'icon-filter',
        	color: '#31b0d5'
    	});
    }

    if (rec['status_con_customer'] == 1) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/customer.png",
	    	svgicon: 'icon-address-book',
        	color: '#31b0d5'
    	});
    }

    if ('status_cluster_figure' in rec) {
        if (rec['status_cluster_figure'] == 1) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/commander.gif",
		    	svgicon: 'icon-uniF5C3',
	        	color: '#31b0d5'
	    	});
        } else if (rec['status_cluster_figure'] == 2) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/member.gif",
		    	svgicon: 'icon-uniF501',
	        	color: '#31b0d5'
	    	});
        } else if (rec['status_cluster_figure'] == 3) {
	        symbols.push({
	        	img: "stylesheets/icons/nnm/attachment/candidate.gif",
		    	svgicon: 'icon-checkbox-checked',
	        	color: '#31b0d5'
	    	});
        }
    }

    if (rec['is_locked'] == 1) {
        symbols.push({
        	img: "stylesheets/icons/nnm/attachment/lock.gif",
	    	svgicon: 'icon-lock',
        	color: '#ff851b'
    	});
    }

    if (rec.unack &&  rec.unack == 1) {
        symbols.push({
	    	svgicon: 'icon-alert',
        	color: '#ff851b'
    	});
    }

    if (rec.unknown &&  rec.unknown == 1) {
        symbols.push({
	    	svgicon: 'icon-if_164_QuestionMark_183285',
        	color: '#31b0d5'
    	});
    }

    if (rec.diff &&  rec.diff == 1) {
        symbols.push({
	    	svgicon: 'icon-if_diff-renamed_298765',
        	color: '#31b0d5'
    	});
    }

    if ('link_status' in rec) {
        if (rec.link_status == 1) {
	        symbols.push({
		    	svgicon: 'icon-link-a',
	        	color: '#00CD00'
	    	});
        } else if (rec.link_status == 2) {
	        symbols.push({
		    	svgicon: 'icon-link-a',
	        	color: '#ff851b'
	    	});
        } else if (rec.link_status == 3) {
	        symbols.push({
		    	svgicon: 'icon-broken-link-a',
	        	color: '#d9534f'
	    	});
        } else if (rec.link_status == 0) {
	        symbols.push({
		    	svgicon: 'icon-broken-link-a',
	        	color: '#696969'
	    	});
        }
    }

    return symbols;
};

// 拓扑图 
router.get('/map', function(req, res, next) {
	var nodes = [];
    var links = [];
    var parentnode = [];
    var maxx = 500;
    var maxy = 5000;
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
    			SELECT * FROM topo_node_type;\
    			SELECT map_parent_id FROM topo_symbol where symbol_id = %d;\
		        SELECT sec_user_belongto_usergroup.sec_usergroup_id\
		          FROM sec_user, sec_user_belongto_usergroup \
		         WHERE sec_user.sec_user_id = sec_user_belongto_usergroup.sec_user_id\
		           AND sec_user_belongto_usergroup.sec_usergroup_id = 1\
		           AND sec_user.user_name = '%s';\
		    	", parseInt(req.query.symbol_id), user_name);
        
		    conn.query(sql, function(err, rows, fields) {
	    		console.log(err);
	    		if (err) {
	    			callback(err, conn);
	    		} else {
		    		var types = {};
		    		for (var i in rows[0]) {
			            types[rows[0][i].topo_type_id] = rows[0][i];
					}

					var parentid = '';
			        if ('parent_symbol_id' in req.query) {
			            parentid = req.query.parent_symbol_id;
			        } else if (req.query.symbol_id == '0') {
			            parentid = req.query.symbol_id;
			        } else {
			        	if (rows[1].length > 0) {
			        		parentid = rows[1][0].map_parent_id;
			        	}
			        }
			        
			        is_superuser = rows[2].length == 1;

			        // call step3 func
			        callback(null, conn, types, parentid);
	    		}
		    });
	    },

	    function (conn, types, parentid, callback) {
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
		    		if (err) {
		    			callback(err, conn);
		    		} else {
			    		var ary = [];
			    		for (var i in rows) {
			    			ary.push(rows[i].symbol_id);
						}
						ary.push(0);
						privilege_clause = sprintf("symbol_id in (%s)", ary.join(","));
						
				        // call step3 func
				        callback(null, conn, types, parentid);
		    		}	
			    });
	    	} else {
	    		callback(null, conn, types, parentid);
	    	}
	    },
	    // step 3 func
	    function (conn, types, parentid, callback) {
				var sql = sprintf("\
		    		SELECT symbol_id, symbol_name1, res_id, ne_id, symbol_name3, x, y, \
			               topo_type_id, display_topo_type_id, real_res_type_name,\
			               res_type_name, status_is_ping_ok,\
			               map_parent_id,\
			               tree_parent_id,\
			               map_hierarchy,\
			               remark,\
			               least(\
			                   if(`new_critical_alarm_count` > 0 or `ac_critical_alarm_count` > 0, 1, 7), \
			                   if(`new_major_alarm_count` > 0 or `ac_major_alarm_count` > 0, 2, 7),\
			                   if(`new_minor_alarm_count` > 0 or `ac_minor_alarm_count` > 0, 3, 7),\
			                   if(`new_warning_alarm_count` > 0 or `ac_warning_alarm_count` > 0, 4, 7),\
			                   if(`new_indeterminate_alarm_count` > 0 or `ac_indeterminate_alarm_count` > 0, 5, 7)\
			               ) as minlevel,\
			               status_unaccredit,\
			               status_pre_config,\
			               status_sync,\
			               status_config_sync,\
			               status_performance,\
			               status_alarm_filter,\
			               status_con_customer,\
			               status_cluster_figure,\
			               is_locked,\
			               layout,\
				           ne_parent_id,\
				           create_user,\
				           symbol_style\
			          FROM topo_symbol\
			         WHERE is_visible = 1 AND map_parent_id = %s AND %s;\
			        SELECT symbol_id, \
				           map_parent_id,\
				           tree_parent_id,\
				           map_hierarchy,\
				           background_params\
				      FROM topo_symbol\
				     WHERE is_visible = 1 and symbol_id = %s;\
				    SELECT MAX(x) AS maxx, MAX(y) as maxy FROM topo_symbol\
             		 WHERE is_visible = 1 AND map_parent_id = %s AND %s;\
			        ", parentid.toString(), privilege_clause, parentid.toString(), parentid.toString(), privilege_clause);
	        conn.query(sql, function(err, rows, fields) {
	    		console.log(err);
	    		parentnode = rows[1];
	    		if (rows[2].length == 1) {
            		maxx = rows[2][0]['maxx'];
            		maxy = rows[2][0]['maxy'];
	    		}
	    		var dict_nodes = {};
	    		var conds=["0<>0"];
	    		var location = -1;
	    		if (rows[0].length > 0) {
		            location = rows[0][0].map_hierarchy.split(',').indexOf(rows[0][0].symbol_id.toString()) + 1;
		            for (var i in rows[0]) {
		                if (rows[0][i].res_type_name == 'TOPO_SUBNET'){
		                    conds.push( sprintf("map_hierarchy LIKE '%%,%s,%%'", rows[0][i].symbol_id ));
		                }
		            } 
		        }

		        // call step 4 func
		        callback(null, conn, types, location, conds, rows[0]);
		    });
	    },
	    // step 4 func
	    function (conn, types, location, conds, results, callback) {

	    	var sql = sprintf("\
	            SELECT symbol_id,\
			           least(\
			               if(`new_critical_alarm_count` > 0 or `ac_critical_alarm_count` > 0, 1, 7), \
			               if(`new_major_alarm_count` > 0 or `ac_major_alarm_count` > 0, 2, 7),\
			               if(`new_minor_alarm_count` > 0 or `ac_minor_alarm_count` > 0, 3, 7),\
			               if(`new_warning_alarm_count` > 0 or `ac_warning_alarm_count` > 0, 4, 7),\
			               if(`new_indeterminate_alarm_count` > 0 or `ac_indeterminate_alarm_count` > 0, 5, 7)\
			           ) as minlevel,\
			           substring_index(`map_hierarchy`,',', %d) as parentid, \
			           map_hierarchy\
	              FROM topo_symbol\
	             WHERE (%s) AND %s\
	            ", parseInt(location), conds.join(" OR "), privilege_clause); 

	        conn.query(sql, function(err, rows, fields) {
	    		console.log(err);

	            var nodes_temp = {};
	            var dict_nodes = {};
	            var idx=0;
	            for (var r in rows) {
	            	var arr = rows[r].parentid.split(',');
	            	var pid = parseInt(arr[arr.length-1]);

	                if (!(pid in nodes_temp)) {
	                    nodes_temp[pid]=[];
	                }
	                nodes_temp[pid].push(rows[r]);
	            }

	            for (var rec in results) {
	                results[rec].subnodes = {};
	                results[rec]['subnodes'][results[rec].symbol_id] = idx;
	                
	                var minlevel = results[rec].minlevel;
	                if (results[rec].res_type_name == 'TOPO_SUBNET') {
	                	var nt = nodes_temp[results[rec].symbol_id];
	                    for (sid in nt) {
	                        results[rec]['subnodes'][nt[sid].symbol_id] = idx;

	                        if (nt[sid].minlevel < minlevel) {
	                            results[rec].minlevel = nt[sid].minlevel;
	                        }
	                    }
	                }
	               
	                if (results[rec].minlevel == 7) {
	                    results[rec].minlevel = 0;
	                }

	                results[rec].fixed = 1;
	                results[rec].name = results[rec]['symbol_name1'];
	                results[rec].x = results[rec].x;
	                results[rec].y = results[rec].y;

	                comm.get_image_path(results[rec], types);

	                // // 小图标测试
	                // var r = results[rec];
	                // r.status_is_ping_ok = 0;
	                // r.status_unaccredit = 2;
	                // r.status_pre_config = 1;
	                // r.status_sync = -1;
	                // r.status_sync = 0;
	                // r.status_config_sync = -1;
	                // r.status_config_sync = 0;
	                // r.status_performance = 1;
	                // r.status_alarm_filter = 1;
	                // r.status_con_customer = 1;
	                // r.status_cluster_figure = 1;
	                // r.status_cluster_figure = 2;
	                // r.status_cluster_figure = 3;
	                // r.is_locked = 1;
	                // r.unack = 1;
	                // r.unknown = 1;
	                // r.link_status = 0;
	                // r.link_status = 1;
	                // r.link_status = 2;
	                // r.link_status = 3;
	                // r.diff = 1;

	                // 生成小图标
	                results[rec].symbols = get_symbols(results[rec]);

	                nodes.push(results[rec]);
	                idx += 1;

	                dict_nodes = Object.assign(dict_nodes, results[rec].subnodes);
	            }

	            // if (nodes.length > 0) {
	            	// call step 5 func
	            	callback(null, conn, dict_nodes);
	            // }
		    });
	    },
	    // step 5 func
	     function (conn, dict_nodes, callback) {
	     	if (nodes.length > 0) {
		     	var sql = sprintf("\
	                SELECT link_symbol_id, remark, src_symbol_id, dest_symbol_id, direction, color, color_rgb, width, style, shape, link_name1, real_res_type_name, avail_bandwidth\
	                  FROM topo_link_symbol \
	                 WHERE src_map_hierarchy like '%%%s%%' and des_map_hierarchy like '%%%s%%'\
	                ", ',' + nodes[0]['map_parent_id'].toString() + ',', ',' + nodes[0]['map_parent_id'].toString() + ',')
	            
	            conn.query(sql, function(err, rows, fields) {
		    		if (rows.length > 0) {
		                for (var lnk in rows) {
		                	var srcid = rows[lnk]['src_symbol_id'];
		                    var destid = rows[lnk]['dest_symbol_id'];
		                    // SDN设备根据带宽利用率来决定链路的颜色
		                    // if (rows[lnk]['avail_bandwidth'] < 0.6) {
		                    // 	rows[lnk]['color'] = 0;
		                    // } else if (rows[lnk]['avail_bandwidth'] >= 0.6 && rows[lnk]['avail_bandwidth'] < 0.8) {
		                    // 	rows[lnk]['color'] = 3;
		                    // } else {
		                    // 	rows[lnk]['color'] = 1;
		                    // }

		                    if (srcid in dict_nodes) {
		                        rows[lnk]['source'] = dict_nodes[srcid];
		                    }

		                    if (destid in dict_nodes) {
		                        rows[lnk]['target'] = dict_nodes[destid];
		                    }

		                    if ('source' in rows[lnk] && 'target' in rows[lnk] && rows[lnk]['source'] != rows[lnk]['target']) {
		                        rows[lnk]['linkid'] = sprintf("%s-%s:%s", nodes[rows[lnk]['source']].symbol_id, nodes[rows[lnk]['target']].symbol_id, rows[lnk].link_symbol_id);
		                        links.push(rows[lnk]);
		                    }
		                }  
		    		}
		    		// call final func
					callback(null, conn);
			    });
	     	} else {
	     		// call final func
				callback(null, conn);
	     	}
	    }
	], 
	// final func
	function (err, conn) {
		conn.release();
		
        res.status(200).json({
        	success: true,
            nodes: nodes,
            links: links,
            parentnode: parentnode,
            maxx: maxx,
            maxy: maxy
        });  

	});
});

// 拓扑查找
router.get('/search_condition_topo_info', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {
		var whereclause = '';
	    var condition = '';

	    if (req.query.search_content == '') {
	        whereclause += '1<>1';
	    } else {
	    	if (parseInt(req.query.condition) == 1) {
	            condition = sprintf("= '%s'", req.query.search_content);
	    	} else if (parseInt(req.query.condition) == 2) {
	            condition = sprintf("like '%%%s%%'", req.query.search_content);
	    	}

	        if (parseInt(req.query.search_category) == 0) {
	            whereclause += sprintf("a.`symbol_name1` %s", condition);
	        }
	        else if (parseInt(req.query.search_category) == 1) {
	            whereclause += sprintf("a.`symbol_name2` %s", condition);
	        }
	        else if (parseInt(req.query.search_category) == 2) {
	            whereclause += sprintf("a.`symbol_name3` %s", condition);
	        }
	        else if (parseInt(req.query.search_category) == 3) {
	            whereclause += sprintf("c.`macaddress` %s", condition);
	        }
	        // else if (parseInt(req.query.search_category) == 4) {
	        //     whereclause += sprintf("c.`serial` %s", condition);
	        // }
	        // else if (parseInt(req.query.search_category) == 5) {
	        //     whereclause += sprintf("e.`cus_name` %s", condition);
	        // }
	    }
	    
	    var sql = '';
	    // if (parseInt(req.query.search_category) == 5) {
	    //     sql = sprintf("\
	    //     	SELECT `a`.`symbol_id` as `symbol_id`,\
	    //     			`a`.`res_type_name` as `res_type_name`,\
	    //     			`a`.`symbol_name1` as `symbol_name1`,\
	    //     			`a`.`symbol_name2` as `symbol_name2`,\
	    //     			`a`.`symbol_name3` as `symbol_name3`,\
	    //     			`a`.`topo_type_id` as `topo_type_id`,\
	    //     			`a`.`status_cluster_figure` as `status_cluster_figure`,\
	    //     			`b`.`symbol_name1` as `map_parent_name`,\
	    //     			`c`.`macaddress` as `macaddress`,\
	    //     			`c`.`serial` as `serial`, \
	    //     			`e`.`cus_name` as `cus_name`\
	    //     	  FROM ((((`topo_symbol` `a` join `topo_symbol` `b` on(((`b`.`symbol_id` = `a`.`map_parent_id`) and (`a`.`res_type_name` = 'ne')))) join `rcnetnode` `c` on((`c`.`ircnetnodeid` = `a`.`ne_id`))) join `rs_mgt` `d` on(((`d`.`rs_type` = 3) and (`d`.`rs_netnodeid` = `c`.`ircnetnodeid`)))) join `rs_customer` `e` on((`e`.`cus_id` = `d`.`cus_id`)))\
	    //          WHERE %s", whereclause);
	    // } else {
	    	sql = sprintf("\
	    		SELECT `a`.`symbol_id` as `symbol_id`,\
	    				`a`.`symbol_id` as `id`,\
	    				`a`.`map_hierarchy`,\
	        			`a`.`res_type_name` as `res_type_name`,\
	        			`a`.`symbol_name1` as `symbol_name1`,\
	        			`a`.`symbol_name2` as `symbol_name2`,\
	        			`a`.`symbol_name3` as `symbol_name3`,\
	        			`a`.`topo_type_id` as `topo_type_id`,\
	        			`a`.`status_cluster_figure` as `status_cluster_figure`,\
	        			`b`.`symbol_name1` as `map_parent_name`,\
	        			`c`.`macaddress` as `macaddress`\
	        	  FROM ((`topo_symbol` `a` join `topo_symbol` `b`) left join `res_ne` `c` on((`a`.`ne_id` = `c`.`neid`))) \
	        	 WHERE (`b`.`symbol_id` = `a`.`map_parent_id` and %s)\
	        	 LIMIT %d, %d;\
	        	SELECT count(*) as count\
	        	  FROM ((`topo_symbol` `a` join `topo_symbol` `b`) left join `res_ne` `c` on((`a`.`ne_id` = `c`.`neid`))) \
	        	 WHERE (`b`.`symbol_id` = `a`.`map_parent_id` and %s)\
	              ", whereclause, req.query.start, req.query.limit, whereclause);
	    // }
	    
	    conn.query(sql, function(err, rows) {
	    	var ary = [];
	    	if (rows[0].length > 0) {
		    	for (rec in rows[0]) {
			        ary.push(rows[0][rec]);
			    }
	    	}
		    
		    // 释放数据库连接
	        conn.release();
	        // 返回结果    
			res.status(200).json({
				success:true,
				data: ary,
				total: rows[1][0].count
			});
		});  
    });
});


module.exports = router;