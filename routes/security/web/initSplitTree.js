
var async = require('async');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	async function initTree(){
		// var res = {};
		var conn = null;
		var rows;
		var result;
		try{
			conn = await APP.dbpool_promise.getConnection();
			var sql = 'select itemId,text,expanded,iconCls,id from sec_splitpane_tree_cfg where p_node_id = -1';
			rows = await conn.query(sql);
			rows[0].text = T.__('security_menu_root');
			rows[0]['expanded'] = true;
			sql = 'select itemId,text,expanded,iconCls,id from sec_splitpane_tree_cfg where p_node_id = 1 ';
			rows1 = await conn.query(sql);
			var child = {'children':rows1};
			for(var i in rows1){
				rows1[i].text = T.__(rows1[i].text);
			}
			rows[0]['children']=rows1;
			
			sql = "select *, 'security_user_form' as id ,'security_user_form' as itemId ,'other_user_login_menu' as  iconCls ,true as leaf, user_name as text,max_online_num_flag as max_online_num_nolimit ,  password_valid_days_flag as  password_valid_days_nolimit from v_sec_user_and_strategy";
			var rows2 = await conn.query(sql);
			for(var i in rows2){
				var id = rows2[i].sec_user_id ;
				let sql_bt = 'select sec_user_id,sec_usergroup_id from sec_user_belongto_usergroup where sec_user_id ='+id;
				let result_bt = await conn.query(sql_bt);
				for(let m in result_bt){
					if(result_bt[m].sec_user_id != 1 && result_bt[m].sec_usergroup_id == 1){
						rows2[i]['is_belongto_admin'] = true;
					}
				}
				if(id==1){
					rows2[i].iconCls = 'super_user_icon';
				}
				rows2[i].id = 'security_user_form,'+id;
				rows2[i].leaf = true;
			}
			rows1[0]['children']=rows2;
			rows1[0]['expanded'] = true;

			sql="select *, 'security_group_form' as id, 'security_group_form' as itemId,'system_users_menu' as  iconCls ,true as leaf, sec_usergroup_name as text from sec_usergroup where is_user_private = 0";
			rows2 = await conn.query(sql);
			for(var i in rows2){
				var id = rows2[i].sec_usergroup_id;
				if(id==1){
					rows2[i].iconCls = 'system_super_users_menu';
				}
				rows2[i].id = 'security_group_form,'+id;
				rows2[i].leaf = true;
			}
			rows1[1]['children']=rows2;
			rows1[1]['expanded'] = true;	
			
			sql="select *, 'security_operset_form' as id, 'security_operset_form' as itemId,'resource_icon_16x16_alarmtypemgt' as  iconCls ,true as leaf, sec_operator_set_name as text from sec_operator_set where private_flag in (0,1)";
			rows2 = await conn.query(sql);
			for(var i in rows2){
				var id = rows2[i].sec_operator_set_type;
				if(rows2[i].sec_operator_set_id == -1){
					rows2[i].text = T.__('Network management application operations complete set');//网管应用操作全集
					rows2[i].sec_operator_set_name = T.__('Network management application operations complete set');
					rows2[i].sec_operator_set_desc = T.__('Network management application operations complete set');
				}
				if(rows2[i].sec_operator_set_id == -2){
					rows2[i].text = T.__('Equipment Operation Complete Works');//设备操作全集
					rows2[i].sec_operator_set_name = T.__('Equipment Operation Complete Works');
					rows2[i].sec_operator_set_desc = T.__('Equipment Operation Complete Works');
				}
				if(rows2[i].sec_operator_set_id == -5){
					rows2[i].text = T.__('Platform Monitor Operations Set');//平台监视员操作集
					rows2[i].sec_operator_set_name = T.__('Platform Monitor Operations Set');
					rows2[i].sec_operator_set_desc = T.__('Platform Monitor Operations Set');
				}
				if(rows2[i].sec_operator_set_id == -7){
					rows2[i].text = T.__('Device Monitor Operations Set');//设备监视员操作集
					rows2[i].sec_operator_set_name = T.__('Device Monitor Operations Set');
					rows2[i].sec_operator_set_desc = T.__('Device Monitor Operations Set');
				}
				if(id==2){
					rows2[i].iconCls = 'resource_icon_16x16_deviceview';
				}else if(id==1){
					rows2[i].iconCls = 'resource_icon_16x16_alarmtypemgt';
				}
				rows2[i].id = 'security_operset_form,'+rows2[i].sec_operator_set_id;
				rows2[i].leaf = true;
			}
			rows1[2]['children']=rows2;
			rows1[2]['expanded'] = true;

			rows1[3]['leaf'] = true;
			rows1[3]['expanded'] = false;
			//rows1[3]为在线用户，功能待定。
			
			// console.log( rows );
			var ress = {'children': [rows[0]]};
			res.json(200, ress); 
			await APP.dbpool_promise.releaseConnection(conn);
		}catch(err){
			console.log("=======",err);
	        await APP.dbpool_promise.releaseConnection(conn);
	        if (err) {
	        	await conn.rollback();
	        	res.json(200, {success: true, msg: err });  
	    	} else {
		        res.json(200, {success: true, msg: 'failed to load the security tree' });  
	    	}

		}
	}
	initTree();
});

// function filterByID(obj) {
//   if ('id' in obj && typeof(obj.id) === 'number' && !isNaN(obj.id)) {
//     return true;
//   } else {
//     return false;
//   }
// }
module.exports = router;