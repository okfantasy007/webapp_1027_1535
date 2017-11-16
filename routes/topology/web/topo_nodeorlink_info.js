
var express = require('express');
var router = express.Router();
var async = require('async');
var comm = require('./common.js');
var moment = require('moment');
var request = require('request');
var http = require('http'); 
const uuid = require('uuid/v1');


// -------------------------------- 拓扑节点、连线的增删改查 -------------------------------------

// 递归构造 节点/连线 类型树
var get_type_tree_children = function (symbols, parent,type) {
    var tree = [];
    var rootnode;
    
    for (var v in symbols) {
        if(symbols[v].parent_id == '0'){
            rootnode=symbols[v];
            if (parseInt(symbols[v].is_leaf) == 0) {
                symbols[v].expanded = true;
            }else {
                delete symbols[v].children;
                symbols[v].leaf = true;
            }
            break;
        }
    }
    for (var i in symbols) {
        var v = symbols[i];
        if (v.parent_id != parent) {

            continue;
        }
        
        v.children = get_type_tree_children(symbols, v.topo_type_id,type);
        if (parseInt(v.is_leaf) != 0) {
            delete v.children;
            v.leaf = true;
        }
         else {
            if(type ==3){
                var k=0;
                for( j in symbols){
                    if(v.topo_type_id == symbols[j].parent_id){
                        k++;
                    }
                }
                if(k == 0){
                    continue;
                }
            }
            else{
                 v.expanded = true;
            }            
   // 
        }

        // if (parent == '0') {
        //     v.iconCls = 'resource_newtopo_icon_16x16_device';
        // } else if (v.tree_icon_path != null && v.tree_icon_path != "") {
        //     v.iconCls = sprintf("%s", v.tree_icon_path.split('/').join('_').split('.')[0]);
        // } else if (v.parent_id == rootnode.topo_type_id) {
        //     v.iconCls = 'resource_newtopo_icon_16x16_topo';
        // }  else {
        //     v.iconCls = 'resource_newtopo_icon_16x16_topo2';
        // }

        if (v.children) {
            // 非叶子节点
            v.text = v.display_name;
        } else {
            // 叶子节点默认图标
            if (v.svg_icon==null || v.svg_icon=='') {
                v.svg_icon = 'icon-rack-server-network';
            }
            v.iconCls = "x-tree-node-icon";
            v.ne_typename = v.display_name;
            v.text = sprintf(
                // '<i class="icomoon %s" style="color:%s;vertical-align:middle;font-size:20px"></i><span style="vertical-align:middle"> %s</span>',
                '<i class="icomoon %s topo-tree-glyph-icon"></i><span class="topo-tree-text">%s</span>',
                v.svg_icon,            // 自定义glyph图标
                v.display_name         // 树节点文本
            ) 
        }

        tree.push(v);
    }
    return tree;
};

// 递归设备树搜索功能
// var get_type_tree_children_serach = function (symbols, parent,key) {
//     var tree = [];
//     var rootnode;
//     for (var v in symbols) {
//         if(symbols[v].parent_id == '0'){
//             rootnode=symbols[v];
//             if (parseInt(symbols[v].is_leaf) == 0) {
//                 symbols[v].expanded = true;
//             }else {
//                 delete symbols[v].children;
//                 symbols[v].leaf = true;
//             }
//             break;
//         }
//     }
//     for (var i in symbols) {
//         var v = symbols[i];
//         if (v.parent_id != parent) {
//             continue;
//         }
        
//         v.children = get_type_tree_children(symbols, v.topo_type_id);
//         if (parseInt(v.is_leaf) != 0) {
//             delete v.children;
//             v.leaf = true;
//         } else {
//             var k=0;
//             for( j in symbols){
//                 if(v.topo_type_id == symbols[j].parent_id){
//                     k++;
//                 }
//             }
//             if(k == 0){
//                 continue;
//             }
//         }

//         if (parent == '0') {
//             v.iconCls = 'resource_newtopo_icon_16x16_device';
//         } else if (v.tree_icon_path != null && v.tree_icon_path != "") {
//             v.iconCls = sprintf("%s", v.tree_icon_path.split('/').join('_').split('.')[0]);
//         } else if (v.parent_id == rootnode.topo_type_id) {
//             v.iconCls = 'resource_newtopo_icon_16x16_topo';
//         }  else {
//             v.iconCls = 'resource_newtopo_icon_16x16_topo2';
//         }

//         v.text = v.display_name;
//         tree.push(v);
//     }
//     return tree;
// };

// 获取节点、链路类型树结构
router.get('/node_type_tree/:tree_type', function(req, res, next) {
	var tree_type = req.params.tree_type;
    var name = req.query.name;
    console.log("000000000000000000000000000000000000"+tree_type);
    var clause = '1=1';
    if (tree_type == 'link') {
        var is_logical_link = req.query.is_logical_link;
        if (is_logical_link == 'true') {
            clause = ' topo_type_id != 15';
        }
        if(name != "" && name != undefined){
            clause+=sprintf(" and (`display_name` LIKE '%%%s%%'or `is_leaf`=0) ", name );
        }
    }
    if(tree_type == 'ne' && name != "" && name != undefined){
        clause+=sprintf(" and (`display_name` LIKE '%%%s%%' or `parent_id` IN ('0', '1', '2')) ", name );

    }
    if(tree_type == 'symbol' && name != "" && name != undefined){
        clause+=sprintf(" and (`display_name` LIKE '%%%s%%' or `parent_id` IN ('0', '11')) ", name );

    }
    if(tree_type == 'subnet' && name != "" && name != undefined){
        clause+=sprintf(" and (`display_name` LIKE '%%%s%%' or `parent_id` IN ('0', '8')) ", name );

    }
	APP.dbpool.getConnection(function(err, conn) {
		var types = {
			"symbol":7,
			"subnet":1,
			"link":2,
            "ne":3
		};
	    var sql = sprintf("SELECT * FROM topo_node_type WHERE type_category = %d and is_valid = 1 and %s ", types[tree_type], clause);
	    console.log(sql);
        conn.query(sql, function(err, rows, fields) {
	        conn.release();
	        tree = get_type_tree_children(rows, '0',types[tree_type]);

	        // console.log(JSON.stringify(tree, null, 2));
	  		res.json(200, {success: true, children: tree, tree_type: tree_type});  
	    });

	});
});


router.get('/node_type_tree/serach', function(req, res, next) {
    var name = req.params.name;
    console.log(name);
    var clause = '1=1';
    if (tree_type == 'link') {
        var is_logical_link = req.query.is_logical_link;
        if (is_logical_link == 'true') {
            clause = 'topo_type_id != 15';
        }
    }
    //if(tree_type == )
    APP.dbpool.getConnection(function(err, conn) {
        var types = {
            "symbol":7,
            "subnet":1,
            "link":2,
            "ne":3
        };

        console.log(types[tree_type], clause);
        console.log(typeof(types[tree_type]));
        console.log(typeof(clause));
        var sql =sprintf("select * from `topo_node_type` where `type_category` = %d and `is_valid` = 1 \
            and (`display_name` LIKE '%%%s%%' or `parent_id` IN ('0', '1', '2'))",parseInt(types[tree_type]),name);

        console.log(sql);

        conn.query(sql, function(err, rows, fields) {
            conn.release();
            tree = get_type_tree_children(rows, '0');

            // console.log(JSON.stringify(tree, null, 2));
            res.json(200, {success: true, children: tree, tree_type: tree_type});  
        });

    });
});
router.get('/tree_async', function(req, res, next) {

	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool_res.getConnection(function(err, conn) {
	    		// call step 2 func
		        callback(null, conn);
	    	})
	    },
	    // step 2 func
	    function(conn, callback) {
		    var sql = 'SELECT res_node_tree.*\
		    	         FROM res_node_tree';
		    conn.query(sql, function(err, rows, fields) {
	    		// call final func
		        callback(null, conn, rows);
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();
	    for (var i in rows) {
	    	console.log(i, rows[i].name);
		}
  		res.json(200, {
  			success: true,
  			nodes: rows
  		});  
	});
});

// 解析节点位置
var getLocation = function(strlocation, locationdict) {
	if (strlocation.indexOf('<') == -1 && strlocation.indexOf('>') == -1) {
		if (strlocation.indexOf('WIN-TG') != -1) {
            return _('No.:WI No.:-TG');
		}
        return strlocation;
	}

    var p1 = /[^<>]+<[^<>]+>/;
    var p2 = /[^<>]+/;
    var p3 = /r'<.+>/;
    var newLocation = '';

    var temp1 = p1.exec(strlocation);
    for (var m1 in temp1) {
    	var strlocation1 = temp1[m1];
        var strlocation2 = '';
        var strlocation3 = '';

        var temp2 = p2.exec(strlocation1);
        for (var m2 in temp2) {
        	strlocation2 += temp2[m2];
            break;
        }
        
        var  temp3 = p3.exec(strlocation1); 
        for (var m3 in temp3) {
            strlocation3 += temp3[m3];
        }
        if (strlocation3 in locationdict) {
            newLocation += locationdict[strlocation3] + ':' + strlocation2 + ' ';
        }
    } 
        
    return newLocation.replace(/(\s*$)/g, ""); 
};

router.get('/get_nodeorlink_properties', function(req, res, next) {
    var locationdict = {};
    var tree=[];

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
            var sql = "SELECT * FROM rs_identifier";
        
            conn.query(sql, function(err, rows, fields) {
                console.log(err);
                if (err) {
                    callback(err,conn,rows);
                }
                for (var i in rows) {
                    locationdict['<' + rows[i].rs_id + '>'] = rows[i].rs_name;
                }

                // call step3 func
                callback(null, conn, locationdict);
            });
        },
        // step 3 func
        function (conn, locationdict, callback) {
            var sql = "";
            if ('link_symbol_id' in req.query) {
                sql = sprintf("\
                    SELECT tms.real_res_type_name, tms.link_symbol_id, tms.real_res_id\
                      FROM topo_link_symbol AS tms\
                     WHERE tms.link_symbol_id=%s\
                    ", req.query.link_symbol_id);
            } else {
                var whereclause = '';
                if ('parent_symbol_id' in req.query) {
                    whereclause = sprintf("\
                        SELECT map_parent_id FROM topo_symbol where symbol_id = %s"
                     , req.query.parent_symbol_id);
                } else {
                    whereclause = sprintf('%s', req.query.symbol_id);
                }

                sql = sprintf("\
                    select tms.real_res_type_name, tms.symbol_id, tms.ne_id, tms.real_res_id\
                      from topo_symbol as tms\
                     where tms.is_visible=1\
                       and tms.symbol_id in (%s)\
                    ", whereclause);
            }
            
            conn.query(sql, function(err, rows, fields) {
                console.log(err);
                if (rows.length == 1) {
                    var restypename = rows[0].real_res_type_name;
                    // if (rows[0].res_type_clone != null) {
                    //     restypename = rows[0].res_type_clone;
                    // }
                    if (restypename == "TOPO_MAINVIEW_LINK_SYMBOL") {
                        restypename = "TOPO_BASEVIEW_LINK_SYMBOL";
                    }
                    if (restypename == "TOPO_SUBNET") {
                        restypename = "TOPO_SUBNET_BASE";
                    }
                    if (restypename == "TOPO_MAINVIEW_SYMBOL") {
                        restypename = "TOPO_BASEVIEW_SYMBOL";
                    }
                    // call step 4 func
                    callback(null, conn, rows[0], restypename, locationdict);
                }
            });
        },
        // step 4 func
        function (conn, row, restypename, locationdict, callback) {

            var sql = sprintf("\
                SELECT rg.group_name_en, rp.res_property_name, rp.column_name, rp.res_group_id, rp.property_label, rp.property_label_en, rp.property_label_ch, rp.isnull, rp.display_relation_property\
                FROM res_property as rp, res_group as rg\
                WHERE rp.res_group_id = rg.res_group_id and res_type_name = '%s' and isvisible = 0 and isproperty = 0;\
                SELECT distinct rp.res_group_id, rg.group_name_en\
                FROM res_property rp, res_group rg\
                WHERE rp.res_group_id = rg.res_group_id and res_type_name = '%s' and isvisible = 0 and isproperty = 0 order by rp.res_group_id;\
            ", restypename, restypename)
            
            //属性显示设备类型不能用res_ne.netypeid而应该用res_ne_type.netypename（修改人：luoli）
            var sql2 = "";
            if (restypename == 'NE') {
                sql2 = sprintf("select `res_ne`.`neid` as `neid`,\
                    `res_ne`.`userlabel` as `userlabel`,\
                    `res_ne_type`.`userlabel` as `netypeid`,\
                    `res_ne`.`ipaddress` as `ipaddress`,\
                    `res_ne`.`macaddress` as `macaddress`,\
                    `res_ne`.`software_ver` as `software_ver`,\
                    `res_ne`.`hardware_ver` as `hardware_ver`,\
                    `res_ne`.`web_url` as `web_url`,\
                    DATE_FORMAT(`res_ne`.`create_time`, '%%Y-%%m-%%d %%T') as `create_time`,\
                    `res_ne`.`port` as `port`,\
                    `res_ne`.`poll_enabled` as `poll_enabled`,\
                    `res_ne`.`poll_interval` as `poll_interval`,\
                    `res_ne`.`telnet_port` as `telnet_port`,\
                    `res_ne`.`ssh_port` as `ssh_port`,\
                    `res_ne`.`uplink_port` as `uplink_port`,\
                    `res_ne`.`latitude` as `latitude`,\
                    `res_ne`.`longitude` as `longitude`,\
                    `res_ne`.`islocal` as `islocal`\
                    from `res_ne` ,`res_ne_type`\
                    where `res_ne`.`neid` = '%s' and `res_ne`.netypeid=`res_ne_type`.netypeid; \
                ", row.real_res_id);
            } else if (restypename == 'PORT') {
                sql2 = sprintf("\
                    SELECT `res_port`.`port_id`,\
                    `res_port`.`port_index`,\
                    `res_port`.`port_name`,\
                    `res_port`.`adminstatus`,\
                    `res_port`.`duplex`,\
                    `res_port`.`operstatus`,\
                    `res_port`.`port_desc`,\
                    `res_port`.`update_time`,\
                    `res_ne`.`ipaddress`,\
                    `res_ne`.`userlabel` as `ne_friendly_name`,\
                    `res_port_type`.`port_type_name`\
                    FROM `res_port`, `res_ne`, `res_port_type`\
                    WHERE `res_port`.`port_category` = 1 AND `res_port`.`port_id` = '%s' and `res_ne`.`neid` = `res_port`.`neid` \
                        and `res_port`.`port_type_id` = `res_port_type`.`port_type_id`; \
                ", row.real_res_id);
            } else if (restypename == 'CHASSIS') {
                sql2 = sprintf("\
                    select `res_chassis`.`chassis_id` as `chassis_id`,\
                    `res_chassis`.`chassis_fix_name` as `chassis_fix_name`,\
                    `res_chassis`.`chassis_name` as `chassis_name`,\
                    `res_chassis`.`chassis_type_id` as `chassis_type_id`,\
                    `res_chassis`.`chassis_index` as `chassis_index`,\
                    `res_ne`.`ipaddress`,\
                    `res_ne`.`netypeid`,\
                    `res_ne`.`userlabel` as `ne_friendly_name`,\
                    `res_chassis`.`temperature` as `temperature`,\
                    `res_chassis`.`serial` as `serial`,\
                    `res_chassis`.`update_time` as `update_time`,\
                    `res_chassis`.`chassis_desc` as `chassis_desc`\
                    FROM `res_chassis`,`res_ne`\
                    WHERE `res_ne`.`neid` = `res_chassis`.`neid` and `res_chassis`.`chassis_id`= '%s';\
                ", row.real_res_id);
            } else if (restypename == 'TOPO_BASEVIEW_LINK_SYMBOL') {
                sql2 = sprintf("\
                    SELECT `c`.`link_symbol_id` as `link_symbol_id`,\
                    `c`.`link_name1` as `link_name1`,`c`.`remark` as `remark`,\
                    `c`.`direction` as `direction`,\
                    `c`.`width` as `width`,`c`.`style` as `style`,`c`.`shape` as `shape`,\
                    `c`.`status_communication` as `status_communication`,`c`.`status_working` as `status_working`,\
                    `c`.`src_symbol_name` as `src_symbol_name`,\
                    `d`.`symbol_name1` as `dest_symbol_name`\
                    FROM ((select `a`.`link_symbol_id` as `link_symbol_id`,`a`.`src_symbol_id` as `src_symbol_id`,\
                    `a`.`dest_symbol_id` as `dest_symbol_id`,`a`.`link_name1`,`a`.`remark` as `remark`,\
                    `a`.`direction` as `direction`,`a`.`width` as `width`,`a`.`style` as `style`,`a`.`shape` as `shape`,\
                    `a`.`status_communication` as `status_communication`,`a`.`status_working` as `status_working`,\
                    `b`.`symbol_name1` as `src_symbol_name`\
                    FROM (`topo_link_symbol` `a` join `topo_symbol` `b` on((`a`.`src_symbol_id` = `b`.`symbol_id`)))) `c`\
                    join `topo_symbol` `d` on((`c`.`dest_symbol_id` = `d`.`symbol_id`)))\
                    WHERE link_symbol_id=%s;\
                ", row.link_symbol_id);
            } else if (restypename == 'LINK') {
                
                sql2 = sprintf("\
                    SELECT `topo_link`.`link_id` as `link_id`,\
                    `topo_link`.`active_state`,\
                    `topo_link`.`attenuation` as `attenuation`,\
                    `topo_link`.`friendly_name` as `friendly_name`,\
                    `topo_link`.`create_user` as `create_user`,`topo_link`.`create_time` as `create_time`,\
                    `topo_link`.`des_id` as `des_id`,`topo_link`.`des_res_type` as `des_res_type`,\
                    `topo_link`.`des_port_type` as `des_port_type`,\
                    `topo_link`.`is_protected` as `is_protected`,\
                    `topo_link`.`line_length` as `line_length`,\
                    `topo_link`.`link_direction` as `link_direction`,`topo_link`.`line_rate` as `line_rate`,\
                    `topo_link_type`.`link_type_name` as `link_type_name`,\
                    `topo_link`.`rate_times` as `rate_times`,\
                    `topo_link`.`remark` as `remark`,\
                    `topo_link`.`src_id` as `src_id`,\
                    `topo_link`.`src_port_id` as `src_port_id`,\
                    `topo_link`.`src_port_type` as `src_port_type`,\
                    `topo_link`.`shape` as `shape`,`topo_link`.`style` as `style`\
                    from ((`topo_link` join `topo_link_type` on((`topo_link`.`link_type_id` = `topo_link_type`.`link_type_id`))))\
                    WHERE link_id=%s;\
                ", row.real_res_id);
            } else if (restypename == 'TOPO_BASEVIEW_SYMBOL' || restypename == 'TOPO_SUBNET_BASE') {
                sql2 = sprintf("\
                    SELECT `a`.`symbol_id` as `symbol_id`,\
                    `a`.`symbol_name1` as `symbol_name1`,\
                    `a`.`remark` as `remark`,\
                    `a`.`symbol_style` as `symbol_style`,\
                    `b`.`display_name` as `topo_type_id`\
                    FROM `topo_symbol` `a`, `topo_node_type` `b` \
                    WHERE `a`.`symbol_id`=%s and `a`.`topo_type_id` = `b`.`topo_type_id`;\
                ", row.symbol_id);
            } else if (restypename == 'REMOTE_DEV') {
                sql2 = sprintf("\
                    SELECT `res_card`.`card_id` as `card_id`,\
                    `res_card`.`card_fix_name` as `card_name`,\
                    `res_card_type`.`card_type_display_name`,\
                    `res_card`.`firmware_ver` as `firmware_ver`,\
                    `res_card`.`card_name` as `friendly_name`,\
                    `res_card`.`hardware_ver` as `hardware_ver`,\
                    `res_card`.`identifier` as `identifier`,\
                    `res_ne`.`ipaddress` as `ipaddress`,\
                    `res_card`.`last_syn_time` as `last_syn_time`,\
                    `res_card`.`macaddress` as `macaddress`,\
                    `res_card`.`serial` as `serial`,\
                    `res_card`.`software_ver` as `software_ver`,\
                    `res_card`.`update_time` as `update_time`\
                    FROM (((`res_card` join `res_ne` on(`res_card`.`neid` = `res_ne`.`neid`))) \
                      join `res_card_type` on(`res_card`.`card_type_id` = `res_card_type`.`card_type_id`))\
                    WHERE `res_card`.`is_local` = 0 and `res_card`.card_id= '%s');\
                ", row.real_res_id);
            }
               
            sql += sql2;

            // var sql4 = "SELECT res_type,res_property,input_column_value,display_column_value FROM res_property_xtbm;";
            // sql += sql4;
            conn.query(sql, function(err, rows, fields) {
                console.log(err);
                
                for (var rec in rows[1]) {
                    rows[1][rec].name = req.__(rows[1][rec].group_name_en);
                    rows[1][rec].expanded = true;
                    rows[1][rec].iconCls = 'no-icon';
                
                    var ary = [];
                    for (var rec2 in rows[0]) {
                        if (rows[1][rec].res_group_id == rows[0][rec2].res_group_id) {
                            rows[0][rec2].leaf = true;
                            if (parseInt(rows[0][rec2].isnull) == 1) {
                                rows[0][rec2].name = '*' + req.__(rows[0][rec2].property_label_en);
                            } else {
                                rows[0][rec2].name = '&nbsp;&nbsp;' + req.__(rows[0][rec2].property_label_en);
                            }

                            if (rows[2] != null && rows[2].length > 0 && rows[0][rec2].res_property_name in rows[2][0]) {
                                
                                if (rows[0][rec2].res_property_name == 'poll_interval') {
                                    if (rows[2][0].poll_enabled == 0) {
                                        continue;
                                    }
                                }
                                if (rows[0][rec2].res_property_name == 'poll_enabled') {
                                    if (rows[2][0].poll_enabled == 1) {
                                        rows[0][rec2].value = "<input type='checkbox' name='' value='' checked='checked' onclick='return false;' readonly='readonly'>";
                                    } else {
                                        rows[0][rec2].value = "<input type='checkbox' name='' value='' onclick='return false;' readonly='readonly'>";
                                    }
                                } else {
                                    rows[0][rec2].value = rows[2][0][rows[0][rec2].res_property_name];
                                    //解决局远端显示数字而不是文字的问题（修改人:luoli）
                                    if(rows[0][rec2].property_label_en=="Local/Remote"){
                                        if(rows[0][rec2].value==1){
                                            rows[0][rec2].value=req.__("Local");
                                        }else if(rows[0][rec2].value==0){
                                            rows[0][rec2].value=req.__("Remote");
                                        }
                                    }
                                    //链路通讯解析；（0代表正常；1代表信号劣化；2代表信号中断）
                                    if(rows[0][rec2].property_label_en=="Communication"){
                                        if(rows[0][rec2].value==0){
                                            rows[0][rec2].value=req.__("Status Normal");
                                        }else if(rows[0][rec2].value==1){
                                            rows[0][rec2].value=req.__("Signal Degrade");
                                        }else if(rows[0][rec2].value==2){
                                            rows[0][rec2].value=req.__("Signal Degrade");
                                        }
                                    }
                                    //链路保护组解析：(0代表工作状态; 1代表等待状态)
                                    if(rows[0][rec2].property_label_en=="Link Protection Group"){
                                        if(rows[0][rec2].value==0){
                                            rows[0][rec2].value=req.__("WorkStatus");
                                        }else if(rows[0][rec2].value==1){
                                            rows[0][rec2].value=req.__("WaitStatus");
                                        }
                                    }
                                    //链路方向解析：(1代表单向；2代表双向)
                                    if(rows[0][rec2].property_label_en=="Direction"){
                                        if(rows[0][rec2].value==1){
                                            rows[0][rec2].value=req.__("Unidirection");
                                        }else if(rows[0][rec2].value==2){
                                            rows[0][rec2].value=req.__("Bidirection");
                                        }
                                    }
                                    //链路形状解析；(0代表平行)
                                    if(rows[0][rec2].property_label_en=="Shape"){
                                        if(rows[0][rec2].value==0){
                                            rows[0][rec2].value=req.__("Parallel");
                                        }
                                    }
                                    //链路式样解析：(0代表直线；1代表短破折线；2代表链条线；3代表点线；4代表波浪线；5代表长破折线)
                                    if(rows[0][rec2].property_label_en=="Style"){
                                        if(rows[0][rec2].value==0){
                                            rows[0][rec2].value=req.__("Straight Line");
                                        }else if(rows[0][rec2].value==1){
                                            rows[0][rec2].value=req.__("Short Break Line");
                                        }else if(rows[0][rec2].value==2){
                                            rows[0][rec2].value=req.__("Chain Line");
                                        }else if(rows[0][rec2].value==3){
                                            rows[0][rec2].value=req.__("Dotted Line");
                                        }else if(rows[0][rec2].value==4){
                                            rows[0][rec2].value=req.__("Wavy Line");
                                        }else if(rows[0][rec2].value==5){
                                            rows[0][rec2].value=req.__("Long Break Line");
                                        }
                                    }
                                }
                            } else {
                                rows[0][rec2].value = rows[0][rec2].res_property_name;
                            }
                            
                            rows[0][rec2].iconCls = 'no-icon';
                            ary.push(rows[0][rec2]);
                        }
                    }
                    rows[1][rec].children= ary;
                    tree.push(rows[1][rec]);
                }
                // call final func
                callback(null, conn, rows);    
            });
        }
    ], 

  
    // final func
    function (err, conn, rows) {
        console.log(err);
    
        conn.release();
        
        res.status(200).json({
            success: true,
            children: tree
        });  
    });
});

// 获取新增的节点
router.get('/get_lastest_topo_node', function(req, res, next) {
	var nodes = [];

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
    		var sqlpath = "\
    			   SELECT * FROM topo_node_type;\
    			   SELECT symbol_id, res_id, symbol_name1, symbol_name1 as text, ne_id, symbol_name3, x, y, \
			            topo_type_id, display_topo_type_id, real_res_type_name,\
			            res_type_name, status_is_ping_ok,\
			            map_parent_id,\
			            tree_parent_id,\
			            map_hierarchy,\
			            remark,\
			            layout,\
                        level,\
			            ne_parent_id,\
                        create_user,\
			            symbol_style\
			       FROM topo_symbol\
			       ORDER BY symbol_id DESC\
			       limit 1;\
			       SELECT topo_type_id,tree_icon_path,svg_icon,display_name\
          		   FROM topo_node_type";

		    conn.query(sqlpath, function(err, rows, fields) {
	    		console.log(err);

	    		var types = {};
	    		for (var i in rows[0]) {
		            types[rows[0][i].topo_type_id] = rows[0][i];
				}

				var children = {};
				if (rows[1].length > 0) {
					for (var rec in rows[1]) {
			            rows[1][rec].fixed = 1;
			            rows[1][rec].name = rows[1][rec].symbol_name1;
			            rows[1][rec].x = rows[1][rec].x;
			            rows[1][rec].y = rows[1][rec].y;
			            rows[1][rec].leaf = true;
			            rows[1][rec].expanded = true;
			            rows[1][rec].minlevel = 0;
			            comm.get_image_path(rows[1][rec], types);
			            nodes.push(rows[1][rec]);
			            children[rows[1][rec].symbol_id] = rows[1][rec];
			        }
				}

				comm.get_device_tree_node_type(rows[2], children);
    			 //comm.set_tree_status(nodes);
    			// call final func
		        callback(null, conn, rows);
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();

    	res.status(200).json({
            success: true,
            nodes: nodes
        });  

	});
});

// 获取新增的逻辑链路
router.get('/get_lastest_topo_link', function(req, res, next) {
	var nodes = [];
    var links = [];
    
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
		    		   SELECT map_parent_id  FROM topo_symbol where symbol_id = %d;", parseInt(req.query.symbol_id));
        
		    conn.query(sql, function(err, rows, fields) {
	    		console.log(err);

	    		var types = {};
	    		for (var i in rows[0]) {
		            types[rows[0][i].topo_type_id] = rows[0][i];
				}

				var parentid = '';
		        if (req.query.symbol_id == '0') {
		            parentid = req.query.symbol_id;
		        } else if ('parent_symbol_id' in req.query) {
		            parentid = req.query.parent_symbol_id;
		        } else {
		        	if (rows[1].length > 0) {
		        		parentid = rows[1][0].map_parent_id;
		        	}
		        }
		        // call step3 func
		        callback(null, conn, types, parentid);
		    });
	    },
	    // step 3 func
	    function (conn, types, parentid, callback) {
		       var sql = sprintf("\
		    		   SELECT symbol_id, symbol_name1, x, y, \
			                topo_type_id, display_topo_type_id, real_res_type_name,\
			                res_type_name, status_is_ping_ok,\
			                map_parent_id,\
			                tree_parent_id,\
			                map_hierarchy,\
			                remark\
			              FROM topo_symbol\
			             WHERE is_visible = 1 \
			               AND map_parent_id = %s", 
			               parentid.toString());
         	
	        conn.query(sql, function(err, rows, fields) {
	    		console.log(err);
	    		var dict_nodes = {};
	    		if (rows.length > 0) {
		            var conds=["0<>0"];
		            var location = rows[0].map_hierarchy.split(',').indexOf(rows[0].symbol_id.toString()) + 1;;
		            for (var i in rows) {
		                if (rows[i].res_type_name == 'TOPO_SUBNET'){
		                    conds.push( sprintf("map_hierarchy LIKE '%%,%s,%%'", rows[i].symbol_id ));
		                }
		            } 
		            // call step 4 func
		        	callback(null, conn, types, location, conds, rows);
		        }
		    });
	    },
	    // step 4 func
	    function (conn, types, location, conds, results, callback) {

	    	var sql = sprintf("\
	            SELECT symbol_id,\
	        	SUBSTRING_INDEX(`map_hierarchy`,',', %d) as parentid, \
	            map_hierarchy\
	            FROM topo_symbol\
	            WHERE %s\
	            ", parseInt(location), conds.join(" OR ")); 

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
	                    nodes_temp[pid].push(pid);
	                } else {
	                	nodes_temp[pid].push(rows[r].symbol_id);
	                }
	            }

	            for (var rec in results) {
	                results[rec].subnodes = {};
	                results[rec]['subnodes'][results[rec].symbol_id] = idx;
	                
	                if (results[rec].res_type_name == 'TOPO_SUBNET') {
	                	var nt = nodes_temp[results[rec].symbol_id];
	                    for (sid in nt) {
	                        results[rec]['subnodes'][nt[sid].symbol_id] = idx;
	                    }
	                }

	                results[rec].name = results[rec]['symbol_name1'];
	                nodes.push(results[rec]);
	                idx += 1;

	                dict_nodes = Object.assign(dict_nodes, results[rec].subnodes);
	            }

            	// call step 5 func
            	callback(null, conn, dict_nodes);
		    });
	    },
	    // step 5 func
	     function (conn, dict_nodes, callback) {
            var sql = sprintf("\
                SELECT link_symbol_id, remark, src_symbol_id, dest_symbol_id, direction, color, color_rgb, width, style, shape, link_name1, real_res_type_name\
                  FROM topo_link_symbol \
                 WHERE src_symbol_id = %d and dest_symbol_id = %d \
              ORDER BY link_symbol_id DESC limit 1 ;",
              parseInt(req.query.src_symbol_id), parseInt(req.query.dest_symbol_id));
            
            conn.query(sql, function(err, rows, fields) {
	    		if (rows.length > 0) {
	                for (var lnk in rows) {
	                	var srcid = rows[lnk]['src_symbol_id'];
	                    var destid = rows[lnk]['dest_symbol_id'];
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
	    }
	], 
	// final func
	function (err, conn) {
		conn.release();
		
        res.status(200).json({
        	success: true,
            links: links
        });  

	});
});

router.post('/check_devicename_for_edit', function(req,res,next){
    console.log(req.body);
    var ip = req.body.ip;
    var nodename = req.body.nodename;
    var neid = req.body.neid;
    async.waterfall(
    [
        // step 1 func
        function(callback) {
            APP.dbpool.getConnection(function(err, conn) {
                callback(null, conn);
            })
        },
        // step 2 func
        function(conn, callback) {
            var sql = sprintf("select count(neid) as count from res_ne where neid<>%d AND userlabel = '%s' ;",neid,nodename);
            console.log(sql);
            conn.query(sql, function(err, rows, fields) {
                if(err){
                    callback(err);
                }
                var count = parseInt(rows[0].count);
                console.log(count);
                if(count == 0)
                    callback(null, conn, false);
                else
                    callback(null, conn, true);

            });
        }
    ], 
    // final func
    function (err, conn, rows) {
        conn.release();
        if(!err){
            res.status(200).json({
                IsExist : rows
            });  
        }
    });
});

router.post('/check_devicename_for_add', function(req,res,next){
    console.log(req.body);
    var ip = req.body.ip;
    var nodename = req.body.nodename;
    async.waterfall(
    [
        // step 1 func
        function(callback) {
            APP.dbpool.getConnection(function(err, conn) {
                callback(null, conn);
            })
        },
        // step 2 func
        function(conn, callback) {
            var sql = sprintf("select count(neid) as count from res_ne where  userlabel = '%s' ;",nodename);
            console.log(sql);
            conn.query(sql, function(err, rows, fields) {
                if(err){
                    callback(err);
                }
                var count = parseInt(rows[0].count);
                console.log(count);
                if(count == 0)
                    callback(null, conn, false);
                else
                    callback(null, conn, true);

            });
        }
    ], 
    // final func
    function (err, conn, rows) {
        conn.release();
        if(!err){
            res.status(200).json({
                IsExist : rows
            });  
        }
    });
});


router.post('/check_deviceip_for_add', function(req,res,next){
    console.log(req.body);
    var ip = req.body.ip;
    async.waterfall(
    [
        // step 1 func
        function(callback) {
            APP.dbpool.getConnection(function(err, conn) {
                callback(null, conn);
            })
        },
        // step 2 func
        function(conn, callback) {
            var sql = sprintf("select count(neid) as count from res_ne where  ipaddress = '%s';",ip);
            console.log(sql);
            conn.query(sql, function(err, rows, fields) {
                if(err){
                    callback(err);
                }
                var count = parseInt(rows[0].count);
                console.log(count);
                if(count == 0)
                    callback(null, conn, false);
                else
                    callback(null, conn, true);

            });
        }
    ], 
    // final func
    function (err, conn, rows) {
        conn.release();
        if(!err){
            res.status(200).json({
                IsExist : rows
            });  
        }
    });
});

router.post('/check_deviceip_for_edit', function(req,res,next){
    console.log(req.body);
    var ip = req.body.ip;
    var neid = req.body.neid;
    async.waterfall(
    [
        // step 1 func
        function(callback) {
            APP.dbpool.getConnection(function(err, conn) {
                callback(null, conn);
            })
        },
        // step 2 func
        function(conn, callback) {
            var sql = sprintf("select count(neid) as count from res_ne where neid<>%d AND ipaddress = '%s';",neid, ip);
            console.log(sql);
            conn.query(sql, function(err, rows, fields) {
                if(err){
                    callback(err);
                }
                var count = parseInt(rows[0].count);
                console.log(count);
                if(count == 0)
                    callback(null, conn, false);
                else
                    callback(null, conn, true);

            });
        }
    ], 
    // final func
    function (err, conn, rows) {
        conn.release();
        if(!err){
            res.status(200).json({
                IsExist : rows
            });  
        }
    });
});


router.get('/device_info',function(req,res,next){
	var symbolid = parseInt(req.query.symbolid);
	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        callback(null, conn);
	    	})
	    },
	    // step 2 func
	    function(conn, callback) {
	    	var sql = sprintf("select ne_id, symbol_name1, remark from topo_symbol where symbol_id = %d;", symbolid);
	    	conn.query(sql, function(err, rows, fields) {
		    	if(err){

		    		callback(err,conn, rows);
		    	}
		        callback(null, conn,rows);
		    });
	    },
	    // step 3 func
	    function(conn, datas, callback) {
            var data = datas[0];
	    	var sql = sprintf("select * from res_ne where neid = %d;", data.ne_id);
		    conn.query(sql, function(err, rows, fields) {
		    	if(err){
		    		callback(err,conn, rows);
		    	}
                console.log(rows);
                if (rows.length>0) {
                   rows[0].symbol_name1 = data.symbol_name1;
                   rows[0].remark = data.remark;;
                   callback(null, conn, rows);
                }else{
                    console.log("data=="+datas)
                    callback(null, conn, datas);
                }
               
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();
        if(!err){
        	res.status(200).json({
	    	    success: true,
	            node: rows
		    });  
        }
    });
});


//编辑设备
router.post('/edit_device',function(req,res,next){
	var symbolid = parseInt(req.body.symbol_id);
	var nodename = req.body.nodename;
    var ssh_port = parseInt(req.body.ssh_port);
	var telnet_port = parseInt(req.body.telnet_port);
	var is_local = parseInt(req.body.islocal);
 	var port = 161;
 	var longitude;
 	if(req.body.longitude != ""){
 		longitude = parseFloat(req.body.longitude);
 	}else{
 		longitude = null;
 	}
 	var latitude;
 	if(req.body.latitude != ""){
 		latitude=parseFloat(req.body.latitude);
 	}else{
 		latitude=null;
 	}
    var tenant = req.body.tenant;
	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        callback(null, conn);
	    	})
	    },
	    // step 2 func
	    function(conn, callback) {
	    	var sql="update topo_symbol set symbol_name1 = '"+nodename+"'where symbol_id="+symbolid+";";
	    	console.log(sql+"111111111111111111111111111");
            conn.query(sql, function(err, rows, fields) {
		    	if(err){
		    		callback(err, conn, rows);
		    	}
		        callback(null, conn);
		    });
	    },
	    // step 3 func
	    function(conn, callback) {
	    	var sql="select ne_id from topo_symbol where symbol_id = "+symbolid+";";
	    	conn.query(sql, function(err, rows, fields) {
		    	if(err){
		    		callback(err, conn, rows);
		    	}
		    	var neid = parseInt(rows[0].ne_id);
		        callback(null, conn, neid);
		    });
	    },
        // step 4 func
        function(conn, neid, callback) {
            sql = sprintf("update `res_ne` set `userlabel`='%s'\
                    where neid = %d", nodename , neid);
            console.log(sql+"2222222222222222222222222222");

            conn.query(sql, function(err, rows, fields) {
                if(err){
                    callback(err, conn, rows);
                }
                callback(null, conn, neid);
            });
        },
	    // step 5 func
	    function(conn, neid, callback) {
	    	sql = sprintf("update `res_ne` set `telnet_port`=%d,\
 			       `islocal`=%d, `port`=%d, longitude=%s, latitude=%s, `ssh_port`=%d, `tenant`='%s'\
	     			where neid = %d;",
 				 	telnet_port, is_local,
                    port, longitude, latitude, ssh_port, tenant, neid
			    );
            console.log(sql);
		    conn.query(sql, function(err, rows, fields) {
		    	if(err){
		    		callback(err, conn, rows);
		    	}
		        callback(null, conn, rows);
		    });
	    }
	], 
	// final func
	function (err, conn, rows) {
        conn.release();
        var result;
        var flag;
        if (!err) {
            res.status(200).json({
               
                success: true,
            }); 
            flag=true;
            result=1;
        }else{
            flag=false;
            result=0
        }
        //后续需要做国际化
        var task = {
                    account:req.session.user,//登录用户名称
                    level:0,//日志上报级别
                    operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
                    result:result,//结果0:成功;1:失败
                    operateContent:T.__('Edit device'),//日志内容
                    operateName:T.__('Edit'),
                    operateObject:T.__('Topology'),
                }
                comm.logTopology(task);//记录安全日志
    });
});


// 添加设备
router.post('/add_device_old', function(req, res, next) {
    var longitude;
    if(req.body.longitude != ""){
        longitude = parseFloat(req.body.longitude);
    }else{
        longitude = null;
    }
    var latitude;
    if(req.body.latitude != ""){
        latitude = parseFloat(req.body.latitude);
    }else{
        latitude = null;
    }

	async.waterfall(
	[
	    // step 1 func
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		var sql = "select max(neid)+1 as id from res_ne";
	    		conn.query(sql, function(err, rows, fields) {
			    	var ne_id = rows[0].id;
			        callback(null, conn, ne_id);
			    });
	    	})
	    },
	    // step 2 func
	    function(conn, ne_id, callback) {
		    var sql = "select max(symbol_id)+1 as id from topo_symbol";
		    conn.query(sql, function(err, rows, fields) {
		    	var symbol_id = rows[0].id;
		        callback(null, conn, ne_id, symbol_id);
		    });
	    },
 
	    // step 3 func
        function(conn, ne_id, symbol_id, callback){
            var ircnetypeid = req.body.text;
            var sql="select netypeid from res_ne_type where netypename='"+ircnetypeid+"';";
            conn.query(sql, function(err, rows, fields) {
                if(err){
                    callback(err, conn, rows);
                }
                var netypeid = rows[0].netypeid;
                callback(null, conn, ne_id, symbol_id, netypeid);
            });
        },

        // step 4 func
	    function(conn, ne_id, symbol_id, netypeid, callback){
            var create_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var userlabel = req.body.nodename;
            var hostname = req.body.nodename;
            var ssh_port = parseInt(req.body.ssh_port);
            var telnet_port = parseInt(req.body.telnet_port);
            var ipaddress = req.body.ip;
            var islocal = parseInt(req.body.islocal);
            var port = 161;
            var tenant = req.body.tenant;

            sql = sprintf("INSERT INTO `res_ne`\
	     			(`uuid`,`create_time`,`neid`,`userlabel`,`hostname`,`telnet_port`,`ipaddress`,`netypeid`,\
	     			`islocal`,`port`,`longitude`,`latitude`, `ssh_port`, `tenant`)\
					VALUES('%s','%s',%d,'%s','%s',%d,'%s', %d,\
					        %d,%d,%s,%s,%d,'%s')",
 				 	uuid(), create_time, parseInt(ne_id), userlabel, hostname, telnet_port, ipaddress, netypeid,
 				 	islocal, port, longitude, latitude, ssh_port, tenant
			    );
            console.log('### sql ###', sql);
	     	conn.query(sql, function(err, rows, fields) {
	     		if(err) {
	     			callback(err, conn, rows);
	     		} else {
                    callback(null,conn, ne_id, symbol_id);
                }
		    });
	     },

	    // step 5 func
		function(conn, ne_id,symbol_id,callback) {
		    var parentid = parseInt(req.body.tree_parent_id);
		    var array = req.body.map_hierarchy.split(',').slice(0, -2);
			var maphierarchy = array.join(',') + ',' + symbol_id + ',';
			sql = sprintf("INSERT INTO `topo_symbol`\
			        (`symbol_id`, `main_view_id`, `ne_id`,`symbol_style`, `create_user`, `map_hierarchy`, `res_type_name`,`map_parent_id`,`tree_parent_id`,\
			         `symbol_name1`, `symbol_name2`, `symbol_name3`, `x`, `y`,\
			         `status_is_ping_ok`, `is_visible`, `res_id`, `topo_type_id`, `real_res_type_name`, `real_res_id`, `geo_lng`, `geo_lat`)\
			        VALUES(%d, %d, %d, %d, '%s', '%s', '%s', %d, %d, '%s', '%s', '%s', %d, %d, %d, %d, '%s', '%s', '%s', '%s', %s, %s)",
			        parseInt(symbol_id),
			        1,
			        parseInt(ne_id),
	                parseInt(req.body.symbol_style),
	                req.session['user'],
	                maphierarchy,
	                req.body.restypename,
	                parseInt(req.body.map_parent_id),
	                parentid,
	                req.body.nodename,
	                req.body.nodename,
	                req.body.nodename,
	                parseInt(req.body.x),
	                parseInt(req.body.y),
	                1,
	                1,
	                ne_id,
	                req.body.topo_type_id,
	                req.body.restypename,
	                ne_id,
                    longitude,
                    latitude
			    );
	    	console.log('### sql2 ###', sql);
			conn.query(sql, function(err, rows, fields) {
                console.log('### err2 ###', err);
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
        if(err){
        	res.status(200).json({
	            success: false,
                msg: err
	        });  
        } else {
            res.status(200).json({
                success: true
            }); 
        }
	});
});

router.post('/add_device', function(req, res, next) {
    var longitude;
    console.log("add_device-------------------------------"+req.body.macaddress);
    if(req.body.longitude != ""){
        longitude = parseFloat(req.body.longitude);
    }else{
        longitude = null;
    }
    var latitude;

    if(req.body.latitude != ""){
        latitude = parseFloat(req.body.latitude);
    }else{
        latitude = null;
    }

    if(req.body.macaddress==""){
        req.body.macaddress = null;
    }
    var conn = null;
    var sql = '';

    async function add_device(){
        var result;
        try{
        conn = await APP.dbpool_promise.getConnection();
        
        var create_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var userlabel = req.body.nodename;
        var hostname = req.body.nodename;
        var ssh_port = parseInt(req.body.ssh_port);
        var telnet_port = parseInt(req.body.telnet_port);
        var ipaddress = req.body.ip;
        var islocal = parseInt(req.body.islocal);
        var port = 161;
        var tenant = req.body.tenant;
        var nodetype = req.body.ne_typename;
        var poll_enabled = 1;
        var poll_interval = 1800;
        var macaddress = req.body.macaddress;
            
        sql = sprintf("select count(*) as ct  from res_ne where ipaddress='%s' and port='%d' and hostname = '%s' ",
                ipaddress, port, hostname);
        rows = await conn.query(sql);
        console.log(rows[0].ct);
        if(rows[0].ct == 0){
            sql = sprintf("select netypeid from res_ne_type where userlabel ='%s'", nodetype);
            console.log("netype---------------------"+sql);
            rows = await conn.query(sql);
            console.log("--------------------------"+rows[0]);
            sql = sprintf("INSERT INTO res_ne\
                (uuid, netypeid, ipaddress, port, hostname, userlabel, poll_enabled, poll_interval, \
                create_time, islocal, telnet_port, longitude,latitude, ssh_port, tenant,macaddress) \
                VALUES ('%s',%d, '%s', %d, '%s','%s', %d, %d,\
                        '%s', %d, %d, %s, %s, %d, '%s',%s)",
            uuid(), rows[0].netypeid, ipaddress, port, hostname, userlabel, poll_enabled, poll_interval, 
            create_time, islocal, telnet_port, longitude, latitude, ssh_port, tenant,macaddress);
            console.log(sql);
            var insertne = await conn.query(sql);
            var ne_id = insertne.insertId;

            var parentid = parseInt(req.body.tree_parent_id);
            
            sql = sprintf("INSERT INTO `topo_symbol`\
                    (`main_view_id`, `ne_id`,`symbol_style`, `create_user`, `res_type_name`,`map_parent_id`,`tree_parent_id`,\
                     `symbol_name1`, `symbol_name2`, `symbol_name3`, `x`, `y`,\
                     `status_is_ping_ok`, `is_visible`, `res_id`, `topo_type_id`, `real_res_type_name`, `real_res_id`, `geo_lng`, `geo_lat`)\
                    VALUES(%d, %d, %d, '%s', '%s', %d, %d, '%s', '%s', '%s', %d, %d, %d, %d, '%s', '%s', '%s', '%s', %s, %s)",
                    1,
                    ne_id,
                    parseInt(req.body.symbol_style),
                    req.session['user'],
                    req.body.restypename,
                    parseInt(req.body.map_parent_id),
                    parentid,
                    req.body.nodename,
                    req.body.nodename,
                    ipaddress,
                    parseInt(req.body.x),
                    parseInt(req.body.y),
                    1,
                    1,
                    ne_id,
                    req.body.topo_type_id,
                    req.body.restypename,
                    ne_id,
                    longitude,
                    latitude
                );
            
            var insert_symbol = await conn.query(sql);
            var symbol_id = insert_symbol.insertId;
            var array = req.body.map_hierarchy.split(',').slice(0, -2);
            var maphierarchy = array.join(',') + ',' + symbol_id + ',';
            sql = sprintf("UPDATE `topo_symbol`\
                    SET `map_hierarchy` = '%s' WHERE symbol_id = %d",
                    maphierarchy, symbol_id
                );
            await conn.query(sql);

            APP.dbpool_promise.releaseConnection(conn);
            res.json(200, {success: true}); 
            result = 1;
        }else{
            APP.dbpool_promise.releaseConnection(conn);
            result = 0;
            res.json(200, {success: false, msg: "this ne is exist!!" });
        } 
        } catch (err) {
            APP.dbpool_promise.releaseConnection(conn);
            if (err) {
                result = 0;
                res.json(500, {success: false, msg: 'add device failed'});  
            } else {
                result = 1;
                res.json(200, {success: true, msg: 'add device success'});  
            }
        }
        //后续需要做国际化
        var task = {
            account:req.session.user,//登录用户名称
            level:0,//日志上报级别
            operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
            result:result,//结果0:成功;1:失败
            operateContent:T.__('Add Device'),//日志内容
            operateName:T.__('Add'),
            operateObject:T.__('Topology'),
        }
        comm.logTopology(task);//记录安全日志   
    };
    
    add_device();
});

// 添加节点(符号、子网)
router.post('/add_node', function(req, res, next) {
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
		    var sql = "select max(symbol_id)+1 as id from topo_symbol";
		    conn.query(sql, function(err, rows, fields) {
		    	var id=rows[0].id;
		        callback(null, conn, id);
		    });
	    },

	    // step 3 func
		function(conn, nextid, callback) {
		    var parentid = parseInt(req.body.tree_parent_id);
		    if (req.body.topo_type_id == '7_Spliter') {
		        parentid =-1;
		    }
		    var array = req.body.map_hierarchy.split(',').slice(0, -2);
			var maphierarchy = array.join(',') + ',' + nextid + ',';
			sql = sprintf("INSERT INTO `topo_symbol`\
			        (`symbol_id`, `main_view_id`, `symbol_style`, `create_user`, `map_hierarchy`, `res_type_name`,`map_parent_id`,`tree_parent_id`,\
			         `symbol_name1`, `symbol_name2`, `symbol_name3`, `remark`, `x`, `y`,\
			         `status_is_ping_ok`, `is_visible`, `res_id`, `topo_type_id`, `real_res_type_name`, `real_res_id`,`level`)\
			        VALUES(%d, %d, %d, '%s', '%s', '%s', %d, %d, '%s', '%s', '%s', '%s', %d, %d, %d, %d, '%s', '%s', '%s', '%s',%d)",
			        parseInt(nextid),
			        1,
	                parseInt(req.body.symbol_style),
	                req.session['user'],
	                maphierarchy,
	                req.body.restypename,
	                parseInt(req.body.map_parent_id),
	                parentid,
	                req.body.nodename,
	                req.body.nodename,
	                req.body.nodename,
	                req.body.remark,
	                parseInt(req.body.x),
	                parseInt(req.body.y),
	                1,
	                1,
	                nextid,
	                req.body.topo_type_id,
	                req.body.restypename,
	                nextid,
	                0
			    );
	    		
			conn.query(sql, function(err, rows, fields) {
		        callback(null, conn, rows);
		    });
	    }
	], 

	// final func
	function (err, conn, rows) {
        conn.release();
        var result;
        var flag;
        if (!err) {
            flag=true;
            result=1;
        }else{
            flag=false;
            result=0
        }
        //后续需要做国际化
        var task = {
            account:req.session.user,//登录用户名称
            level:0,//日志上报级别
            operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
            result:result,//结果0:成功;1:失败
            operateContent:T.__('Add nodes'),//日志内容
            operateName:T.__('Add'),
            operateObject:T.__('Topology'),
        }
        comm.logTopology(task);//记录安全日志
        res.status(200).json({
            success: flag
        });

        
	});
});

// 添加连线
router.post('/add_link', function(req, res, next) {

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
	    	var sql = "select max(link_symbol_id)+1 as id from topo_link_symbol";
		    conn.query(sql, function(err, rows, fields) {
                var id = 1;
                if (rows[0].id) {
                    id = rows[0].id;
                }

		    	// call step 3 func
		        callback(null, conn, id);
		    });
	    },

	    // step 3 func
		function(conn, nextid, callback) {
		    var sql = sprintf("\
		         INSERT INTO `topo_link_symbol`\
            	(`link_symbol_id`, `main_view_id`, `res_id`, `res_type_name`, `src_symbol_id`, `dest_symbol_id`, \
                	`link_name1`, `remark`, `direction`, `color`, `width`, `style`, `shape`, `topo_type_id`,\
               		`real_res_type_name`, `real_res_id`, `src_map_hierarchy`, `des_map_hierarchy`)\
   				 VALUES\
        			(%d, %d, '%s', '%s', %d, %d, '%s', '%s', %d, %d, %d, %d, %d, '%s', '%s', '%s', '%s', '%s')\
    			", parseInt(nextid),
		                1,
		                nextid,
		                req.body.restypename,
		                parseInt(req.body.src_symbol_id),
		                parseInt(req.body.dest_symbol_id),
		                req.body.linkname,
		                req.body.remark,
		                parseInt(req.body.direction),
		                0,
		                parseInt(req.body.width),
		                parseInt(req.body.style),
		                parseInt(req.body.shape),
		                '17',
		                req.body.restypename,
		                nextid,
		                req.body.src_map_hierarchy,
		                req.body.des_map_hierarchy
		            );
    		
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

        var result;
        var flag;
        if (!err) {
            flag=true;
            result=1;
        }else{
            flag=false;
            result=0
        }
        //后续需要做国际化
        var task = {
            count:req.session.user,//登录用户名称
            level:0,//日志上报级别
            operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
            result:result,//结果0:成功;1:失败
            operateContent:T.__('Add logical link'),//日志内容
            operateName:T.__('Add'),
            operateObject:T.__('Topology'),
        }
        comm.logTopology(task);//记录安全日志
        res.status(200).json({
            success: flag
        });  
	});
});

// 添加连线
router.post('/add_phy_link', function(req, res, next) {

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
            var sql = "select max(link_symbol_id)+1 as id from topo_link_symbol";
            conn.query(sql, function(err, rows, fields) {
                var id = 1;
                if (rows[0].id) {
                    id = rows[0].id;
                }

                // call step 3 func
                callback(null, conn, id);
            });
        },

        // step 3 func
        function(conn, nextid, callback) {
            var sql = sprintf("\
                 INSERT INTO `topo_link_symbol`\
                (`link_symbol_id`, `main_view_id`, `res_id`, `res_type_name`, `src_symbol_id`, `dest_symbol_id`, \
                    `link_name1`, `remark`, `direction`, `color`, `width`, `style`, `shape`, `topo_type_id`,\
                    `real_res_type_name`, `real_res_id`, `src_map_hierarchy`, `des_map_hierarchy`)\
                 VALUES\
                    (%d, %d, '%s', '%s', %d, %d, '%s', '%s', %d, %d, %d, %d, %d, '%s', '%s', '%s', '%s', '%s')\
                ", parseInt(nextid),
                        1,
                        nextid,
                        req.body.restypename,
                        parseInt(req.body.src_symbol_id),
                        parseInt(req.body.dest_symbol_id),
                        req.body.linkname,
                        req.body.remark,
                        parseInt(req.body.direction),
                        0,
                        parseInt(req.body.width),
                        parseInt(req.body.style),
                        parseInt(req.body.shape),
                        '16',
                        req.body.restypename,
                        nextid,
                        req.body.src_map_hierarchy,
                        req.body.des_map_hierarchy
                    );
            
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

        var result;
        var flag;
        if (!err) {
            flag=true;
            result=1;
        }else{
            flag=false;
            result=0
        }
        //后续需要做国际化
        var task = {
            count:req.session.user,//登录用户名称
            level:0,//日志上报级别
            operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
            result:result,//结果0:成功;1:失败
            operateContent:T.__('Adding physical links'),//日志内容
            operateName:T.__('Add'),
            operateObject:T.__('Topology'),
        }
        comm.logTopology(task);//记录安全日志
        res.status(200).json({
            success: flag
        });  
    });
});

// 移动节点后，修改节点的MAP_HIERARCHY
var modify_map_hierarchy = function(all_recs_dict, subnodes_recs) {

}  
    
var get_hierarchy = function(all_recs_dict, id) {
	var ary = '';
    if (parseInt(id) == 0) {
        return '0,';
    }
    for (k in all_recs_dict) {
        if (parseInt(k) == parseInt(id)) {
        	ary += all_recs_dict[k].symbol_id.toString() + ',';
            ary1 = get_hierarchy(all_recs_dict, all_recs_dict[k].map_parent_id);
            ary = ary1 + ary;
            break
        }   
    }
    return ary;
};
    

var get_subnodes_recs = function(all_recs_dict, id) {
	var ary = {};
    for (k in all_recs_dict) {
		if (parseInt(k) == parseInt(id)) {
            ary[all_recs_dict[k].symbol_id] = all_recs_dict[k];
		}

        if (parseInt(all_recs_dict[k].map_parent_id) == parseInt(id)) {
        	var ary1 = get_subnodes_recs(all_recs_dict, all_recs_dict[k].symbol_id);
        	ary = Object.assign(ary, ary1);
        }   
    }
         
    return ary;
};
    
// 移动节点
router.post('/move_node', function(req, res, next) {
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
			var sql = sprintf("UPDATE topo_symbol SET map_parent_id = %s, tree_parent_id = %s\
	         where symbol_id in (%s);\
	        ", req.body.toNode, req.body.toNode, req.body.fromNode);
	        conn.query(sql, function(error, rows, fields)
			{
				// call step 3 func
				callback(null, conn, rows);
			});
			
		},
		// step 3 func
		function(conn, param,callback) {
			
			var sql = "SELECT symbol_id, map_parent_id FROM topo_symbol WHERE is_visible = 1";
			conn.query(sql, function(error, rows, fields)
			{
				var all_recs_dict = {};
			    for (var rec in rows) {
			        all_recs_dict[rows[rec].symbol_id] = rows[rec];
			    }
			    var array = req.body.fromNode.split(',');
			    // call step 4 func
			    callback(null, conn, all_recs_dict, array);		        
			});
		},
		// step 4 func
		function(conn, all_recs_dict, array, callback) {
		    var sql = '';
		    for (var i in array) {
		    	var subnodes_recs = get_subnodes_recs(all_recs_dict, array[i]);

			    for (var k in subnodes_recs) {
			    	var hierarchy = ',' + get_hierarchy(all_recs_dict, k);
			        sql += sprintf("\
			            UPDATE topo_symbol SET map_hierarchy = '%s' WHERE symbol_id = %s;\
			        ", hierarchy, k);
			    }
		    }
		    // console.log(sql);
			conn.query(sql, function(error, rows, fields)
			{
				// call final func
				callback(null, conn, rows);
			        
			});
		}
	],
	// final func
	function(err, conn, result) {
		// console.log(err);
	    conn.release();
		var msg;
        var result;
	    if(err) {
            result = 0;
	      	msg = '子网移动失败！';
	    } else {
            result = 1;
	      	msg = '子网移动成功！';
	    };
	    //后续需要做国际化
        var task = {
            account:req.session.user,//登录用户名称
            level:0,//日志上报级别
            operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
            result:result,//结果0:成功;1:失败
            operateContent:T.__('Move nodes'),//日志内容
            operateName:T.__('Move'),
            operateObject:T.__('Topology'),
        }
        comm.logTopology(task);//记录安全日志
		res.status(200).json({
			success: !err,
			msg: msg,
		});  
	});
});	

// 修改节点
router.post('/edit_node', function(req, res, next) {
	var symbolid = req.body.symbol_id;
	var nodename = req.body.nodename;
	var remark = req.body.remark;
	APP.dbpool.getConnection(function(err, conn) {
		var sql = sprintf("UPDATE `topo_symbol`\
              SET `symbol_name1` = '%s', `remark` = '%s'\
              WHERE `symbol_id` = %s;\
          ", nodename, remark, symbolid); 
		conn.query(sql, function(err, result) {
            conn.release();
            var result;
			if(err){
                result=0;
				console.log(err);
			} 
			else{
                result=1;
				res.json(200, {
				success:true,
				msg:"修改成功！",
				});  
			}
            //后续需要做国际化
            var task = {
                account:req.session.user,//登录用户名称
                level:0,//日志上报级别
                operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
                result:result,//结果0:成功;1:失败
                operateContent:T.__('Edit nodes'),//日志内容
                operateName:T.__('Edit'),
                operateObject:T.__('Topology'),
            }
            comm.logTopology(task);//记录安全日志
	    });
	}); 
});

// 修改连线
router.post('/edit_link', function(req, res, next) {
	var linkname = req.body.linkname;
	var remark = req.body.remark;
	var dir = req.body.direction;
	var width = req.body.width;
	var style = req.body.style;
	var shape = req.body.shape;
	var linksymbolid = req.body.link_symbol_id;

	APP.dbpool.getConnection(function(err, conn) {
		sql = sprintf("UPDATE `topo_link_symbol`\
              SET `link_name1` = '%s', `remark` = '%s', `direction` = %d, `width` = %d, `style` = %d, `shape` = %d\
              WHERE `link_symbol_id` = %d;\
          ", linkname, remark, dir, width, style, shape, linksymbolid);
    
	    conn.query(sql, function(err, result) {
            conn.release();
            var result;
			if(err){
                result = 0;
				console.log(err);
			} 
			else{
                result = 1;
				res.json(200, {
				success:true,
				msg:"修改成功！",
				});  
			}
            //后续需要做国际化
            var task = {
                account:req.session.user,//登录用户名称
                level:0,//日志上报级别
                operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
                result:result,//结果0:成功;1:失败
                operateContent:T.__('Edit link'),//日志内容
                operateName:T.__('Edit'),
                operateObject:T.__('Topology'),
            }
            comm.logTopology(task);//记录安全日志
	    });
	}); 
});


// 递归构造拓扑子网树
var get_subnet_tree = function(nodes, parent) {
	var tree=[];
	for (var k in nodes) {
		if (nodes[k].tree_parent_id != parent) {
            continue;
		}

        nodes[k].children = get_subnet_tree(nodes, nodes[k].symbol_id);
        //  v['text'] += "[%s]" % v['DISPLAY_NAME']
        if (nodes[k].children.length == 0) {
        	delete nodes[k].children;
            nodes[k].leaf = true;
        } else {
        	nodes[k].expanded = false;
            nodes[k].text += sprintf(" (%d)", nodes[k].children.length);
        }
            

        if (nodes[k].symbol_id == 0) {
            nodes[k].expanded = true;
        }

        tree.push(nodes[k]);
	}
	return tree;
};

// 获取拓扑子网树
router.get('/get_topo_subnet_old', function(req, res, next) {
	APP.dbpool.getConnection(function(err, conn) {
		var sql = sprintf("\
               select `topo_symbol`.`symbol_id`, `topo_symbol`.`tree_parent_id`,`topo_symbol`.`symbol_name1` as text,`topo_node_type`.`tree_icon_path` \
               from (`topo_symbol` join `topo_node_type`) where (`topo_symbol`.`topo_type_id` = `topo_node_type`.`topo_type_id` \
               and `topo_symbol`.`is_visible` = 1 and `topo_symbol`.`symbol_style` = 2 and `topo_symbol`.`main_view_id` = 1 \
              and symbol_id not in (%s))\
           order by symbol_id\
        ", req.query.ids);
        conn.query(sql, function(err, results) {
			if(err){
				console.log(err);
			} else {
				var nodes={};
			    for (var rec in results) {
			        if (results[rec].tree_icon_path != null) {
			            results[rec].iconCls = sprintf("%s", results[rec].tree_icon_path.split('.')[0].replace(/\//g, '_'));
			        }
			        
			        nodes[results[rec].symbol_id] = results[rec];
			    }
			    
				res.json(200, {
					success: true,
					children: get_subnet_tree(nodes, -1) 
				});  
			}
	    });
	}); 
});

router.get('/get_topo_subnet', function(req, res, next) {
    var conn = null;
    var rows = null;
    var is_superuser = true;
    var privilege_clause = '1=1';

    async function get_topo_subnet() {
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
            }

            var sql = sprintf("\
                   select `topo_symbol`.`symbol_id`, `topo_symbol`.`tree_parent_id`,`topo_symbol`.`symbol_name1` as text,`topo_node_type`.`tree_icon_path` \
                   from (`topo_symbol` join `topo_node_type`) where (`topo_symbol`.`topo_type_id` = `topo_node_type`.`topo_type_id` \
                   and `topo_symbol`.`is_visible` = 1 and `topo_symbol`.`symbol_style` = 2 and `topo_symbol`.`main_view_id` = 1 \
                   and symbol_id not in (%s) and %s)\
                   order by symbol_id\
            ", req.query.ids, privilege_clause);
            rows = await conn.query(sql);
            var nodes={};
            for (var rec in rows) {
                if (rows[rec].tree_icon_path != null) {
                    rows[rec].iconCls = sprintf("%s", rows[rec].tree_icon_path.split('.')[0].replace(/\//g, '_'));
                }
                
                nodes[rows[rec].symbol_id] = rows[rec];
            }
            
            await conn.commit();
            await APP.dbpool_promise.releaseConnection(conn);
            res.json(200, {
                success: true,
                msg: 'get topo subnet success',
                children: get_subnet_tree(nodes, -1) 
            });
        } catch (err) {
            console.log("=======",err);
            APP.dbpool_promise.releaseConnection(conn);
            if (err) {
                await conn.rollback();
                res.json(200, {success: false, msg: 'get topo subnet failed'});  
            } else {
                res.json(200, {success: true, msg: 'get topo subnet success'});  
            }
        }   
    };
    
    get_topo_subnet();
});

 // 获取要删除节点的子节点
var get_select_subnodes = function(all_recs_dict, ids) {
	var ary = [];
    for (var m in ids) {
    	ary.push(ids[m]);

        var ary1 = [];
        for (k in all_recs_dict) {
            if (parseInt(all_recs_dict[k]['map_parent_id']) == parseInt(ids[m])) {
                ary1.push(k);
            }
        }

        var ary2 = get_select_subnodes(all_recs_dict, ary1);
        for (n in ary2) {
            ary.push(ary2[n].toString);
        }
    }
        

    return ary;
}

// 删除选择的节点和连线
router.post('/delete_select_topoinfo', function(req, res, next) {
	var r={};
    r['msg']='';
    r['success']=false;
    r['error']=false;

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
	    function(conn,callback){
	    	if(req.body.deviceids!=''){
	    		var sql = '';
	    		sql+="delete from res_ne where neid in(select res_id from topo_symbol where symbol_id in("+req.body.deviceids+"));";
	    		sql+="delete from topo_symbol where symbol_id in("+req.body.deviceids+");";
	    		conn.query(sql, function(error, rows, fields)
				{
					if(error){
						callback(error);
					}else{
						callback(null, conn);
					}
				});
	    	}else{
	    		callback(null, conn);
	    	}
	    },

	    function(conn, callback) {
		    if (req.body.nodeids != '') {
		    	var sql = "SELECT symbol_id, map_parent_id, real_res_type_name, symbol_name1 FROM topo_symbol WHERE is_visible = 1";
		        conn.query(sql, function(error, rows, fields)
				{
			        var all_recs_dict = {};
			        for (var rec in rows) {
			            all_recs_dict[rows[rec].symbol_id] = rows[rec];
			        }
			        
			        var nodeids = req.body.nodeids.split(',');
			        var ary = [];
	        		ary = get_select_subnodes(all_recs_dict, nodeids);
	        		// call step 3 func
	        		callback(null, conn, ary); 		        
				});
		    }else{
		    	callback(null, conn, null); 
		    }			
		},
		// step 3 func
		function(conn, ary,callback) {
			var sql = '';
			if(ary!=null){
				sql += sprintf("\
		            DELETE FROM `topo_symbol`\
		            WHERE `topo_symbol`.`symbol_id` in (%s);\
		            ", ary.join(','));
		        sql += sprintf("\
		            DELETE FROM `topo_link_symbol`\
		            WHERE `src_symbol_id` in (%s) or `dest_symbol_id` in (%s);\
		        	", ary.join(','), ary.join(','));
			}
	        if (req.body.linkids != '') {
	        	sql += sprintf("\
		            DELETE FROM `topo_link_symbol`\
		            WHERE `link_symbol_id` in (%s);\
		        ", req.body.linkids);
	        }
		    
			conn.query(sql, function(error, rows, fields)
			{
				// call final func
				callback(null, conn, rows);	        
			});
		}
	],
	// final func
	function(err, conn, rows) {
		// console.log(err);
	    conn.release();
		var msg;
        var result;
	    if(err) {
            result = 0;
	      	msg = 'delete failed';
	    } else {
            result = 1;
	      	msg = 'delete success';
	    };
	    //后续需要做国际化
        var task = {
            account:req.session.user,//登录用户名称
            level:0,//日志上报级别
            operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
            result:result,//结果0:成功;1:失败
            operateContent:T.__('Delete nodes and conn'),//日志内容
            operateName:T.__('Delete'),
            operateObject:T.__('Topology'),
        }
        comm.logTopology(task);//记录安全日志
		res.status(200).json({
			success: !err,
			msg : msg
		});  
	});
});	

router.post('/edit_neip', function(req, res, next) {
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
            var sql = sprintf("select ne_id from topo_symbol WHERE symbol_id = %s", req.body.symbol_id);
            console.log('sql------',sql);
            conn.query(sql, function(err, rows, fields) {
                var neid=rows[0].ne_id;
                callback(null, conn, neid);
            });
        },

        // step 3 func
        function(conn, neid, callback) {
            sql = sprintf("UPDATE topo_symbol SET symbol_name3 = '%s' WHERE symbol_id = %d;\
                UPDATE res_ne SET ipaddress = '%s' WHERE neid = %d;",
                req.body.ip,
                parseInt(req.body.symbol_id),
                req.body.ip,
                parseInt(neid)
            );
                console.log('sql------',sql);
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

router.post('/device_type',function(req,res,next){
    console.log("ip===================="+req.body.ip);
    //console.log("req===================="+req.body);
    var data = {
        hostname:req.body.ip
    };
    data = require('querystring').stringify(data);
    console.log(data);
    var request = http.request( 
        {  
            host: 'localhost',  
            port: '3000',
            method: "POST",                 
            path: '/rest/resource/discovery_onadd/detect',
            headers: { 
                "Content-Type": 'application/x-www-form-urlencoded',  
                'Content-Length' : data.length
            }                              
        },
        function(response) {
            var body = ""; 
            var resultBody; 
            if(response.statusCode=='200'){   
                response.on('data', function (data) { body += data;})  
                    .on('end', function () { 
                        resultBody = JSON.parse(body);                       
                        if(resultBody.success== true){
                            console.log("seccess---------------");
                            var netype = resultBody.data.userlabel;
                            console.log(netype);
                            res.json(200, {
                                success: true,
                                netype: netype 
                            });                          
                        } 
                        else{
                            res.json(200, {
                                success: false,
                                msg: resultBody.msg 
                            }); 
                        }                 
                })          
            }
        } 
    );  
    request.write(data);  
    request.end();
    // res.json(200, {
    //     success: true,
    //     msg: 'get ne type success',
        
    // });
});


router.post('/get_map_hierarchy',function(req,res,next){
      APP.dbpool.getConnection(function(err, conn) {
        var sql =sprintf("select map_hierarchy from `topo_symbol` where symbol_id= %s", req.body.symbolid);
        console.log(sql);
        conn.query(sql, function(err, rows, fields) {
            conn.release();
            if (err) {
                res.json(200, {success: false, map_hierarchy:""}); 
            }else{
                var maphierarchy;
                if (rows.length>0) {
                    maphierarchy = rows[0].map_hierarchy;
                }               
                res.json(200, {success: true, map_hierarchy:maphierarchy}); 
            }             
        });

    });


});

router.post('/update_is_lock',function(req,res,next){
      APP.dbpool.getConnection(function(err, conn) {
        var sql =sprintf("update `topo_symbol` set is_locked=%d where symbol_id in ("+req.body.symbolids+")",req.body.is_locked);
        conn.query(sql, function(err, rows, fields) {
            console.log('sql------->',sql);

            conn.release();
            if (err) {
                res.json(200, {success: false});  
            }else{
                res.json(200, {success: true});  
            }
            
        });

    });


});


module.exports = router;
