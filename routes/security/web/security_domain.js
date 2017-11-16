var common = require('../rest/common.js');
var comm = require('./security_domain.js');

/*
获取构造树数据
parentid:请求懒加载的symbol_id
groupid:用户组id
conds:数据过滤条件
neg:1-标识待选设备侧数据
*/
exports.get_tree_data = function(parentid,groupid,conds,neg){
	var str1 = "";
	var str2 = "";
	if(conds.length > 0){
		str2 = "("+conds.join(' or ')+")";//sql条件
	}else{
		str2 = "("+0+")";//sql占位
	}
	if(neg == 1){
		str1 = "NOT";
	}

	var sql = sprintf("\
	        SELECT topo_symbol.symbol_id,\
	        	   topo_symbol.symbol_id as id,\
	               topo_symbol.symbol_name1 as text,\
	               topo_symbol.symbol_name1,\
	               topo_symbol.remark,\
	               topo_symbol.tree_parent_id,\
	               topo_symbol.map_parent_id,\
	               topo_symbol.real_res_type_name,\
	               topo_symbol.topo_type_id,\
	               topo_symbol.status_is_ping_ok,\
	               topo_symbol.display_topo_type_id,\
	               topo_symbol.res_type_name,\
	               topo_symbol.layout,\
	               topo_symbol.level,\
	               sec_usergroup_res_access.category,\
            	   if (topo_symbol.`tree_parent_id` <> topo_symbol.`map_parent_id` and topo_symbol.`res_type_name` = 'REMOTE_DEV', insert(topo_symbol.`map_hierarchy`,  instr(topo_symbol.`map_hierarchy`,topo_symbol.`map_parent_id`) + length(topo_symbol.`map_parent_id`) , length(topo_symbol.`tree_parent_id`) + length(topo_symbol.`symbol_id`) + 3, concat( ',',topo_symbol.`tree_parent_id`, ',', topo_symbol.`symbol_id`, ',') ), topo_symbol.`map_hierarchy`)\
           		   as map_hierarchy\
	        FROM topo_symbol left join sec_usergroup_res_access on(sec_usergroup_res_access.symbol_id = topo_symbol.symbol_id and sec_usergroup_res_access.sec_usergroup_id= %s)\
	        WHERE topo_symbol.is_visible=1 and map_hierarchy like '%%,%s,%%' and %s %s or topo_symbol.symbol_id in (0,-4,-7);\
	        SELECT topo_type_id,tree_icon_path,display_name \
          	  	FROM topo_node_type;",
          	groupid,  	
          	parentid,
          	str1,
          	str2    		
      	);
	return sql;
};

/*
构造管理域or操作权限树
parentid:请求懒加载的symbol_id
rows:构数数据
operation:操作集标识
operation_ids:操作集数据(sec_usergroup_res_fun_access)
flag:管理域初始界面(非编辑界面)
*/
exports.get_domain_tree = function(parentid,rows,operation,operation_ids,flag){
	
	var nodes = {};
    for (var i in rows[0]) {
    	rows[0][i]['tree_sort'] = parseInt(rows[0][i]['symbol_id']);
    	//增加isown
    	if(rows[0][i]['category'] != '' && rows[0][i]['category'] != null){
    		rows[0][i]['isown'] = 1;
    	}
    	nodes[ rows[0][i].symbol_id ] = rows[0][i];
    }

    var tree=[];
    var treet=[];
    for (var i in rows[0]) {
    	var rec = rows[0][i];
        if (typeof(parentid) == 'undefined' || rec['tree_parent_id'] == -1 && rec['symbol_id'] != 0) {
            continue
        }

        if(rec.symbol_id == 0){
    		rec['text'] = nodes[-4].text;
    		rec['category'] = nodes[-4].category;
			rec['res_type_name'] = nodes[-4].res_type_name;
			rec['real_res_type_name'] = nodes[-4].real_res_type_name;
			rec['iconCls'] = "resource_newtopo_icon_16x16_deviceview";//设备

			if(rec['category'] == 1){
				rec['leftorright'] = 2;//右侧树显示
			}else if(rec['category'] == 2){
				rec['leftorright'] = 4;//两侧树都显示
			}else{
				rec['leftorright'] = 1;//左侧树显示
			}
    	}
	
    	if(rec['isown'] == 1 && rec['res_type_name'] == 'NE'){
    		rec['leftorright'] = 2;//右侧树显示
    	}else if(rec['isown'] == 1 && rec['res_type_name'] == 'TOPO_SUBNET' && rec['category'] == 1){
    		rec['leftorright'] = 2;//右侧树显示
    	}else if(rec['isown'] == 1 && rec['res_type_name'] == 'TOPO_SUBNET' && rec['category'] == 2){
    		rec['leftorright'] = 4;//两侧树都显示
    	}
        //操作集无叶子属性避免二次请求
        if(operation){
        	rec.expanded = false;
			rec.children=[];
			if(rec['symbol_id'] != -7){
		        var loading=new Object();
				loading.symbol_id="loading";
				loading.text="";
				rec.children.push(loading);
			}
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
            if(operation){
            	//网管应用子树
            	nodes[-7]['category'] = 2;
				tree.push(nodes[-7]);
				rec.expanded = false;
            }else{
            	if(flag != 1 && flag != 2){
            		rec.checked = false;
            	}
            }
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
    			if(!operation && flag != 1 && flag != 2){
    				rec.checked = false;
    			}
    			rec.children=[];
                var loading=new Object();
				loading.symbol_id="loading";
				loading.text="";
				rec.children.push(loading);
    		} else {   			
    			if(!operation && flag != 1 && flag != 2){
    				rec.checked = false;
    			} 
    			rec.leaf = true; 			
    		}
    		
    		if (parentid == 0) {
    			treet.push(rec);
    		} else {
    			tree.push(rec);
    		}
    	}
    	//添加操作权限节点
    	if(operation){
    		for(var j in operation_ids){
    			if(operation_ids[j].symbol_id == -4){
    				operation_ids[j].symbol_id = 0;
    			}
    			if(rec.symbol_id == operation_ids[j].symbol_id){
        			var r = {};
        			rec.children = [];
        			if(rec.leaf == true){
        				delete rec.leaf;
        			}
        			if(rec.symbol_id == -7){
        				r['category'] = 2;
        			}else{
        				r['category'] = rec.category;
        			}       			
        			r['id'] = operation_ids[j].symbol_id+"_"+operation_ids[j]['sec_operator_set_id']+"_"+r['category'];
        			r['text'] = T.__(operation_ids[j]['sec_operator_set_name']);
        			r['iconCls'] = 'resource_icon_16x16_deviceview';
        			r['res_type_name'] = 'operset';
        			r['leaf'] = true;
        			rec.children.push(r);
    			}
    		}        		
    	}
	}
	//替换根节点
	nodes[0] = nodes[-4];
	get_device_tree_node_type(rows[1], nodes);
	nodes[-7]['iconCls'] = "resource_icon_16x16_alarmtypemgt_0";//网管应用图标
	return tree;

};

// 树节点图标
var get_device_tree_node_type = function(rows, nodes) {
	var types={};
	    for (var i in rows) {
	        types[rows[i]['topo_type_id']] = rows[i];
	    }
	    
	    for(var i in nodes) {
	    	var v = nodes[i];
	        if (v['display_topo_type_id'] != null && (v['display_topo_type_id'] in types) || v['topo_type_id'] != null && (v['topo_type_id'] in types)) {
	            var h = types[v['topo_type_id']];
	            if (v['display_topo_type_id'] != null) {
	                h = types[v['display_topo_type_id']];
	            }
	        
	            if (h['tree_icon_path'] != null) {
	                nodes[i]['iconCls'] = h['tree_icon_path'].split('.')[0].replace(/\//g, '_') + '_' + v['level'];
	            } else {
	                nodes[i]['iconCls'] = "device_clt" + '_' + v['level'];
	            }

	            nodes[i]['display_name'] = h['display_name'];
	        } else {
	            nodes[i]['iconCls'] = "device_clt" + '_' + v['level'];
	        }
	    }
};

//添加操作权限配置
exports.addOperator = function(groupid,operator_ids){
	var sql_operator = [];
	if(typeof(operator_ids) !='undefined' && operator_ids != ''){
		var ids = operator_ids.split(',');
		//添加纪录
		for(var i in ids){
			var symbol_id = ids[i].split('_')[0];
			ids.push(symbol_id);
			if(symbol_id == 0){
				symbol_id = -4;
			}
			var operset_id = ids[i].split('_')[1];
			var category = ids[i].split('_')[2];

			var sql_del = sprintf("delete from sec_usergroup_res_fun_access\
				    			where sec_usergroup_id = %s\
								and symbol_id = %s\
								and category = %s",
								groupid,
								symbol_id,
								category
							);
			sql_operator.push(sql_del);

			var sql = sprintf("insert into sec_usergroup_res_fun_access(\
							sec_usergroup_id,res_type_name,res_id,\
							real_res_type_name,real_res_id,\
							sec_operator_set_id,category,symbol_id)\
						select\
							'%s' as sec_usergroup_id,\
							topo_symbol.res_type_name,\
							topo_symbol.res_id,\
							topo_symbol.real_res_type_name,\
							topo_symbol.real_res_id,\
							'%s' as sec_operator_set_id,\
							'%s' as category,\
							topo_symbol.symbol_id\
						from topo_symbol\
						where topo_symbol.symbol_id = '%s'",
						groupid,
	                	operset_id,
	                	category,
	                	symbol_id
					);
			sql_operator.push(sql);
		}
	}
	return sql_operator;
}

/*
修改操作权限
groupid:用户组id
addIds:新增操作集数据集合
delIds:删除操作集数据集合
*/
exports.updateOperator = function(groupid,addIds,delIds){
	var addIdstr = [];
	var delIdstr = [];
	if(typeof(addIds) !='undefined' && addIds != ''){
		addIdstr = addIds.split(',');
	}
	if(typeof(delIds) !='undefined' && delIds != ''){
		delIdstr = delIds.split(',');
	}
	//删除重复元素
	for(var i = 0; i < addIdstr.length; i++){
		for(var j = 0; j < delIdstr.length; j++){
			if(addIdstr[i] == delIdstr[j]){
				addIdstr.splice(i,1);
				delIdstr.splice(j,1);
			}
		}
	}
	var updateSql =[];
	for(var i in delIdstr){
		var symbol_id = delIdstr[i].split('_')[0];
		var operset_id = delIdstr[i].split('_')[1];
		if(symbol_id == 0){
			symbol_id = -4;
		}
		var sql = sprintf("delete from sec_usergroup_res_fun_access\
						where sec_usergroup_id = %s\
						and sec_operator_set_id = %s\
						and symbol_id = %s",
						groupid,
						operset_id,
						symbol_id
				);
		updateSql.push(sql);
	}
	var sql_add = comm.addOperator(groupid,addIdstr.join(','));
	updateSql = sql_add.concat(updateSql);

	return updateSql;
}

var get_access_result = function(dataSet,type){
	var result = [];
	if(typeof(dataSet) != 'undefined' && dataSet != ''){
		var sub_str = dataSet.split('-');		
		for(var i in sub_str){
			var str = new Object();
			if(sub_str[i].split("*")[0] == 'loading' ||
				typeof(sub_str[i].split("*")[0]) == 'undefined'){
		    	continue;
		    }
			str['symbol_id'] = sub_str[i].split("*")[0];
			str['category'] = type;
			str['res_type_name'] = sub_str[i].split("*")[1];
			str['real_res_type_name'] = sub_str[i].split("*")[2];
			result.push(str);
		}
	}
	return result;
}

//
exports.delOldDomain = function(groupid,delSubnetSet,delSymbolSet){
	delSymbolSet = common.caculate(delSubnetSet, delSymbolSet, true);
	delSubnetSet = common.caculate(delSubnetSet, delSubnetSet, false);
	var sql = "";
	var del_sql = [];
	delSubnetSet = get_access_result(delSubnetSet,1);
	var symbolids = get_symbols(delSubnetSet, 1);
	if(typeof(symbolids) != 'undefined' && symbolids != ''){
		sql = "delete from sec_usergroup_res_access where sec_usergroup_id = " + groupid + " and symbol_id in (select symbol_id from topo_symbol where " + symbolids.join(' or ') + ");";
		sql += "delete from sec_usergroup_res_fun_access where sec_usergroup_id = " + groupid + " and symbol_id in (select symbol_id from topo_symbol where " + symbolids.join(' or ') + ")";
		del_sql.push(sql);
	}
	delSymbolSet = get_access_result(delSymbolSet,2);
	symbolids = get_symbols(delSymbolSet, 2);
	if(typeof(symbolids) != 'undefined' && symbolids != ''){
		sql = "delete from sec_usergroup_res_access where sec_usergroup_id = " + groupid + " and " + symbolids.join(' or ') + ";";
		sql += "delete from sec_usergroup_res_fun_access where sec_usergroup_id = " + groupid + " and " + symbolids.join(' or ');
		del_sql.push(sql);
	}
	return del_sql;
};

//
exports.insertNewDomain = function(groupid,subnetDevSet,subnetSet,symbolSet){
	subnetSet = common.caculate(subnetDevSet, subnetSet, true);
	symbolSet = common.caculate(subnetDevSet, symbolSet, true);
	subnetDevSet = common.caculate(subnetDevSet, subnetDevSet, false);
	var sql = "";
	var insert_sql = [];
	subnetDevSet = get_access_result(subnetDevSet,1);
	var symbolids = get_symbols(subnetDevSet, 2);
	if(typeof(symbolids) != 'undefined' && symbolids != ''){
		sql = "delete from sec_usergroup_res_access where sec_usergroup_id = " + groupid + " and " + symbolids.join(' or ');
		insert_sql.push(sql);
		sql = "insert ignore into sec_usergroup_res_access (sec_usergroup_id, symbol_id, res_id, res_type_name, real_res_id, real_res_type_name, category) select " + groupid + " as sec_usergroup_id, symbol_id, res_id, res_type_name, real_res_id, real_res_type_name, 1 as category from topo_symbol where " + symbolids.join(' or ');
		insert_sql.push(sql);
	}
	
	subnetSet = get_access_result(subnetSet,1);
	symbolids = get_symbols(subnetSet, 2);
	if(typeof(symbolids) != 'undefined' && symbolids != ''){
		sql = "insert ignore into  sec_usergroup_res_access (sec_usergroup_id, symbol_id, res_id, res_type_name, real_res_id, real_res_type_name, category) select " + groupid + " as sec_usergroup_id, symbol_id, res_id, res_type_name, real_res_id, real_res_type_name, 2 as category from topo_symbol where " + symbolids.join(' or ');
		insert_sql.push(sql);
	}

	symbolSet = get_access_result(symbolSet,1);
	symbolids = get_symbols(symbolSet, 2);
	if(typeof(symbolids) != 'undefined' && symbolids != ''){
		sql = "insert ignore into  sec_usergroup_res_access (sec_usergroup_id, symbol_id, res_id, res_type_name, real_res_id, real_res_type_name, category) select " + groupid + " as sec_usergroup_id, symbol_id, res_id, res_type_name, real_res_id, real_res_type_name, 2 as category from topo_symbol where " + symbolids.join(' or ');
		insert_sql.push(sql);
	}
	return insert_sql;
};


var get_symbols = function(result,type){
	var ids=[];
    var symbols=[];
	for(var i in result){
		if(type == 1){
			if(result[i]['symbol_id'] == 0){
				symbols.push("symbol_id = -4");
			}
			symbols.push('map_hierarchy LIKE "%,' + result[i]['symbol_id'] +',%"');				
		}else if(type == 2){
			if(result[i]['symbol_id'] == 0){
				result[i]['symbol_id'] = -4;
			}
			ids.push(result[i]['symbol_id']);
		}
	}		
	if(ids.length > 0){
		symbols.push("symbol_id IN (" + ids.join(',') +")");
	}
	return symbols;
};

//根据用户id获取其私有用户组id
exports.getPrivateUserGroupid = function(conn, userid){
	var sql_privateGroupid = sprintf("select t1.sec_usergroup_id,t1.sec_usergroup_name,t2.sec_user_id\
					from sec_usergroup t1, sec_user_belongto_usergroup t2\
					where t1.sec_usergroup_id = t2.sec_usergroup_id\
					and t1.is_user_private = 1\
					and t2.sec_user_id = %s",
					userid
				);
	return sql_privateGroupid;
}
