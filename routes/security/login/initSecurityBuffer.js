var express = require('express');
var router = express.Router();
var async = require('async');

var userOfUsergroupids;
var user_buffer;
var nnmAppMap;
var elementMapSymbolId;
var isObjectSetAll;
var isDeviceSetAll;
var isDeviceSetZero;
var isNMSAppSetAll;
var temValue = false;
var sec_user_id;
var funMap;
var funRelationMap;
var elementMapUrl;
var operationIdSet;
var securityManagerCenter;


router.post('/', function(req, res, next) {
	isObjectSetAll = false;
	isDeviceSetAll = false;
	isDeviceSetZero = false;
	isNMSAppSetAll = false;
	userOfUsergroupids = "";
	temValue = false;
	sec_user_id=0;
	funMap ={};
	funRelationMap={};
	nnmAppMap = {};
	elementMapSymbolId={};
	elementMapUrl={};
	operationIdSet={};

	async function init_user_buffer(){
		var userName = req.body.userName;	
			user_buffer = {};
			user_buffer.elementMapSymbolId = elementMapSymbolId;

			var conn = null;
			try{
				if(userName=='administrator'){
					user_buffer.is_admin=true;
				}else{
					user_buffer.is_admin=false;
				}

				conn = await APP.dbpool_promise.getConnection();
				var sql = "select * from v_sec_user_and_strategy where  user_name = '"+userName+"'";
				var rows1 = await conn.query(sql);
				sec_user_id = rows1[0].sec_user_id;
				user_buffer.sec_user_id=sec_user_id;
				sql ="select * from sec_user_belongto_usergroup where sec_user_id = "+sec_user_id;
				rows1 = await conn.query(sql);
				user_buffer['is_admin_usergroup']=false;		
				for(var i in rows1){
	   				userOfUsergroupids += rows1[i].sec_usergroup_id+',';
	   				if(rows1[i].sec_usergroup_id==1){
	   					temValue = true;
	   					user_buffer['is_admin_usergroup']=true;
	   					break;
	   				}
	   			}
	   			userOfUsergroupids = userOfUsergroupids.substring(0,userOfUsergroupids.length-1);
	   			sql ="select count(*) as count from sec_usergroup_res_access where SYMBOL_ID = -4 and CATEGORY = 1 and SEC_USERGROUP_ID in ("+userOfUsergroupids+"); select count(distinct fun_id) as count from sec_usergroup_res_fun_access as a, sec_operator_set_to_fun as b where SYMBOL_ID = -4 and CATEGORY = 1 and a.sec_operator_set_id = b.sec_operator_set_id and sec_usergroup_id in ("+userOfUsergroupids+") ; select count(*) as count from sec_usergroup_res_fun_access where symbol_id = - 4 and category = 1 and sec_operator_set_id = -2 and sec_usergroup_id in("+userOfUsergroupids+"); select count(*) as count from sec_usergroup_res_fun_access where symbol_id = '-7' and sec_operator_set_id = '-1' and sec_usergroup_id in ("+userOfUsergroupids+")";
	   			log.info('sql'+sql);
	   			var row = await conn.query(sql);
	   			
	   			if(row[0][0].count>0){
	   				isObjectSetAll = true;			
	   			}
	   			if(row[1][0].count==0){
	   				isDeviceSetZero = true;	
	   			}
	   			
	   			if(row[3][0].count>0){
	   				isNMSAppSetAll = true;			
	   			}
	   				
				if(row[2][0].count>0){
					isDeviceSetAll = true;
				}
				
				if(!isObjectSetAll){
					isObjectSetAll = temValue;
					isDeviceSetZero = temValue;
				}
				user_buffer['isObjectSetAll']=isObjectSetAll;
				user_buffer['isNMSAppSetAll']=isNMSAppSetAll;
				if(!isDeviceSetZero){//如果设备分有设备操作集
					if(isDeviceSetAll){
						await initFun(conn);
						var devMap = {};
						var subnetMap = {};
						await initOperationSet(devMap,subnetMap,conn);
					}else{
						var subNetMap = await getSubnetElements(conn);
						var root ={};
						root['symbolId'] = '0';
						root['category'] = 2;
						root['class_type'] = 'SubnetElement';
						var childArray =[];
						var funElement = new Set();
						root['child']=childArray;
						root['fun']=funElement;
						subNetMap[0] = root;
						var devMap = await getDeviceElements(conn);	
						var deviceNode = {};
						deviceNode['symbolId'] = '-4';
						subNetMap['-4'] = deviceNode;
						await initFun(conn);
						await initOperationSet(devMap,subNetMap,conn);
						await mapDomainToHashMap(root);
						if(isObjectSetAll) {
							deviceNode['category']=1;
							elementMapSymbolId[-4]=deviceNode;
						}
					}
					
				}else if(!temValue){
					await initFun(conn);
					var devMap = {};
					var subnetMap = {};
					await initOperationSet(devMap,subnetMap,conn);
				}
				APP.dbpool_promise.releaseConnection(conn);
				res.json(200, {success: true, msg: 'initialize memory success',buffer:user_buffer });  
			}catch(err){
				log.error("err",err);
		        APP.dbpool_promise.releaseConnection(conn);
		        if (err) {
		        	res.json(200, {success: false, msg: 'initialize memory failure' });  
		    	} else {
			        res.json(200, {success: true, msg: 'initialize memory success' });  
		    	}
			}
		
	}

	init_user_buffer();

});


var initFun = function(conn) {
    return new Promise(function (resolve, reject) {
    	try{	
    		sql ="select fun_id, fun_type, permission from sec_fun ";
			conn.query(sql,function(err, row, fields){	
				for(var i in row){
					var funElement ={};
					funElement['fun_id']=row[i].fun_id;
					funElement['fun_type']=row[i].fun_type;
					funElement['permission']=row[i].permission;
					funMap[(row[i].fun_id)]=funElement;
				}
				sql="select * from sec_fun_relation";
				conn.query(sql,function(err, row1, fields){
					var funId;
					for(var i in row1){
						funId = row1[i].fun_id;
						if(mapConstainKey(funId,funRelationMap)==true){
							funRelationMap[funId] = funRelationMap[funId]+","+row1[i].contained_id;
						}else{	
							funRelationMap[funId] = row1[i].contained_id;
						}				
					}
					resolve();

				});			
			});
			
    	}catch(err){
    		log.error("err"+err);
	        APP.dbpool_promise.releaseConnection(conn);
	        reject(err);
    	}    
    })
};

function initOperationSet(devMap,subnetMap,conn){
	return new Promise(function (resolve, reject) {
		try{			
			var sql = "select c.symbol_id, b.fun_id, a.sec_operator_set_type,d.view_type,d.menu_type from sec_operator_set a, sec_operator_set_to_fun b, sec_usergroup_res_fun_access c,sec_fun d where c.sec_usergroup_id in (" + userOfUsergroupids + ") and a.sec_operator_set_id = b.sec_operator_set_id and b.sec_operator_set_id = c.sec_operator_set_id and d.fun_id = b.fun_id";
			log.info('sql'+sql);
			conn.query(sql,function(err, rows, fields){
				for(var i in rows){
					var symbolId = rows[i].symbol_id;
					var funId = rows[i].fun_id;
					var type = rows[i].sec_operator_set_type;
					var view_type = rows[i].view_type;
					var e = subnetMap[symbolId];
					var fun = funMap[funId];	
					if(fun == null){
						continue;
					}
					nnmAppMap[funId]=fun;
					var containedId =[];
					if(mapConstainKey(funId,funRelationMap)==true){
						containedId = funRelationMap[funId].split(",");
						for(var i in containedId){
							nnmAppMap[containedId[i]]=funMap[containedId[i]];
						}	
					}
					if(rows[i].menu_type==0){
						operationIdSet[view_type]=funId;	
					}					
					
					if(type==1){
						continue;
					}
					if(e == null){
						e = devMap[symbolId];
					}
					if(e != null){
						var funElement = e.fun;
						funElement.add(fun);
						if(containedId.length>0) {
							for(var i=0; i<containedId.length; i++) {
								funElement.add(funMap.get(containedId[i]));	
							}	
						}
					}
				}
				operationIdSet['0302']='0302';
				operationIdSet['LoginLogView']='LoginLogView';
				operationIdSet['SafeLogView']='SafeLogView';
				operationIdSet['SysOpLogView']='SysOpLogView';
				operationIdSet['DevOpLogView']='DevOpLogView';
				operationIdSet['RunLogView']='RunLogView';	
				user_buffer['nnmAppMap']=nnmAppMap;
				user_buffer['operationIdSet']=operationIdSet;

				resolve();
			});
		}catch(err){
			log.error("err"+err);
	        APP.dbpool_promise.releaseConnection(conn);
	        reject(err);

		}

	});
}

function mapConstainKey(_key,elements) {
	try {
         for (var i in elements) {
            if (i == _key) {
                return true;
            }
        }
    }catch (err) {
         return false;
     }
    return false;
}

function getSubnetElements(conn){
	return new Promise(function (resolve, reject) {
		try{
			var result = {};
			var sql = "select a.symbol_id, map_parent_id, category, b.map_hierarchy from sec_usergroup_res_access a, topo_symbol b where a.sec_usergroup_id in (" + userOfUsergroupids + ") and a.symbol_id = b.symbol_id and a.res_type_name = 'topo_subnet'";
			conn.query(sql,function(err, rows, fields){
				for(var i in rows){
					var symbolId = rows[i].symbol_id;
					if(mapConstainKey(symbolId,result)==true){
						if(rows[i].category == 2){//等于2说明是选设备的时候，默认将其上层节点选择进来的，不属于子网设备集
							result[symbolId].category == 2;
						}
					}else{
						var subnetElement ={};
						var childArray =[];
						var funElement = new Set();
						subnetElement['class_type']='SubnetElement';
						subnetElement['symbolId']=symbolId;
						subnetElement['category']=rows[i].category;
						subnetElement['parentId']=rows[i].map_parent_id;
						subnetElement['hierarchy']=rows[i].map_hierarchy;
						subnetElement['child']=childArray;
						subnetElement['fun']=funElement;
						result[symbolId]=subnetElement;
					}
				}
				log.info('result'+result);
				resolve(result);
			});
		}catch(err){
			log.error("err"+err);
	        APP.dbpool_promise.releaseConnection(conn);
	        reject(err);
		}
	});
}


function getDeviceElements(conn){
	return new Promise(function (resolve, reject) {
		try{
			var result = {}; 
			var sql ="select a.symbol_id, map_parent_id, b.map_hierarchy, b.real_res_id, b.real_res_type_name from sec_usergroup_res_access a, topo_symbol b where a.sec_usergroup_id in (" +userOfUsergroupids + ") and a.symbol_id = b.symbol_id and a.res_type_name <> 'topo_subnet' and a.symbol_id > 0";
			console.log(sql);
			conn.query(sql,function(err, rows, fields){
				for(var i in rows){
					var symbolId = rows[i].symbol_id;
					if(mapConstainKey(symbolId,result)==false){
						var deviceElement ={};
						var funElement = new Set();
						deviceElement['class_type']='DeviceElement'; 
						deviceElement['symbolId']=symbolId; 
						deviceElement['parentId']=rows[i].map_parent_id;
						deviceElement['url']=rows[i].real_res_id;
						deviceElement['hierarchy']=rows[i].map_hierarchy;
						deviceElement['fun']=funElement;
						deviceElement['real_res_type_name']=rows[i].real_res_type_name;
						result[symbolId] = deviceElement; 
					}
				}
				
				resolve(result);
			});
		}catch(err){
			log.error("err"+err);
	        APP.dbpool_promise.releaseConnection(conn);
	        reject(err);

		}
	});
}



function mapDomainToHashMap(devMap,subnetMap){
	return new Promise(function (resolve, reject) {
		try{
			for(var i in devMap){
				elementMapSymbolId[i]=devMap[i];
				elementMapUrl[devMap[i].url] = devMap[i];

			}
			for(var i in subnetMap){
				elementMapSymbolId[i]=subnetMap[i];
			}
			log.info('elementMapSymbolId'+elementMapSymbolId);
			log.info('elementMapUrl'+elementMapUrl);		
			resolve();
		}catch(err){
			log.error("err"+err);
	        reject(err);
		}
	});
}

module.exports = router;