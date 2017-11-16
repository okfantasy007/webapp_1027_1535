var express = require('express');
var router = express.Router();

// ======================= 实现一个rest CRUD操作 =======================
var user ;

router.route('/getResAuthorizeOpertion')
    .get(function(req, res, next) {
        async function getResAuthorizeOpertion(){
        var jsonObject = req.query.jsonObject;
        var funids = req.query.funids;
        console.log('#############',jsonObject);
        console.log('#############',funids);     
        user = req.query.user;
        var result = {};
        for(var i in funids){
          var isvalid = await validateFunction(funids[i],jsonObject);
          result[funids[i]]=isvalid;
          console.log('&&&&&&&&&&&&&',result);
        }  
        console.log('############result',result);      
        res.json(200, {success: true, result: result });

      };
      getResAuthorizeOpertion(); 
    })
    .post(function(req, res, next) {
      async function getResAuthorizeOpertion(){
        var jsonObject = req.body.jsonObject;
        var funids = req.body.funids;
        user = req.body.user;
        console.log('#############',user);
        var result = {};
        var securityManagerCenter = await getSecurityBufferByUser(user);
        // if(typeof(securityManagerCenter)=='undefined'){
        if(!securityManagerCenter){
          for(var i in funids){
            result[funids[i]]=false;
          } 
          res.json(200, {success: true, result: result });
          return;
        }
        var  is_admin_usergroup =  securityManagerCenter.is_admin_usergroup;
        if(is_admin_usergroup==true){
          for(var i in funids){
            result[funids[i]]=true;
          } 
          res.json(200, {success: true, result: result });
          return;
        }
        
        var nnmAppMap = securityManagerCenter.nnmAppMap;
        var isNMSAppSetAll =securityManagerCenter.isNMSAppSetAll;
        var elementMapSymbolId = securityManagerCenter.elementMapSymbolId;
        for(var i in funids){
          var isvalid = await validateFunction(nnmAppMap,funids[i],jsonObject,isNMSAppSetAll,elementMapSymbolId);
          result[funids[i]]=isvalid;
        }  
        console.log('############result',result);      
        res.json(200, {success: true, result: result });
      };
      getResAuthorizeOpertion();
     	 
    });

async function validateFunction(nnmAppMap,funid,jsonObject,isNMSAppSetAll,elementMapSymbolId){
  try{
    // if(typeof(securityManagerCenter)=='undefined'){
    //     return false;
    // }
    
    // var  is_admin_usergroup =  securityManagerCenter.is_admin_usergroup;
    // if(is_admin_usergroup==true){
    //     return true;
    // }
    var securityManagerCenter = await getSecurityBufferByUser(user);
    if(funid=='' || funid=='undefined'||funid == null){
       return true;
    }     
    if("0"==funid){
        return true;
    }
 
    var fun;
    if(typeof(nnmAppMap)!='undefined'){
        fun = nnmAppMap[funid]; 
        if(fun==null||fun=='undefined'){
          return false;
        }
    }else{
      return false;
    }
    var funType = fun.fun_type;
    var permission  = fun.permission;
    if(funType==1){//permission 0:与资源无关，1：资源为null时返回fun是否分配 2：与资源有关，资源为null时返回false
      if(isNMSAppSetAll){
          return true;
      }
      if(permission == 0){
          return mapConstainKey(funid,nnmAppMap);
      }else if(permission == 1){
          if(jsonObject == null || jsonObject.res_type=='undefined' || jsonObject.res_id=='undefined'){
            return mapConstainKey(funid,nnmAppMap);
          }else{
            var conn = await APP.dbpool_promise.getConnection();
            return await validateNMSAPP(funid,jsonObject,conn,nnmAppMap,elementMapSymbolId); 
            APP.dbpool_promise.releaseConnection(conn);    
          }
      }else if(permission == 2){
          if(jsonObject == null || jsonObject.res_type=='undefined' || jsonObject.res_id=='undefined'){
              return false;
          }else{
            var conn = await APP.dbpool_promise.getConnection();
            return await validateNMSAPP(funid,jsonObject,conn,nnmAppMap,elementMapSymbolId);
            APP.dbpool_promise.releaseConnection(conn);
          }
      }
    }
    else if(funType == 2){
       if(funid == null || funid.equals("") || funid=='undefined'){
          return true;
       }
       else{
          if(securityManagerCenter.isDeviceSetAll==true){
            return true;
          }
          var resId =jsonObject.res_id;
          var resType = jsonObject.res_type;
          var de = securityManagerCenter.elementMapUrl.resId;
          if(de=='undefined'){
            var sql = "select map_hierarchy, symbol_id, real_res_id from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and real_res_id = '"+resID+"'" ;
            var conn = await APP.dbpool_promise.getConnection();
            var row = await conn.query(sql);
            var hierarchy = row[0].map_hierarchy;
            var hs = hierarchy.split(",");
            for(var i = hs.length - 1; i >= 0; i--){
              if(hs[i]==0)
              return false;
              var se = elementMapSymbolId.hs[i];
              if(se != null){
                if(se.category == 2){
                  return false;
                }else{
                  return isExistFun(se.fun, funid);
                  
                }
              }
            }

          }else{
            return isExistFun(de.fun,funid);
          }
       } 
    }
    return true;
  }catch(err){
    console.log("=======",err);
    APP.dbpool_promise.releaseConnection(conn);
    return false;
  }
}

function isExistFun( funList, funId){
  for(var i in funList){
    var ose = funList[i];
    if(ose.fun_id==funId){
      return true;
    }
  }
  return false;
}

function mapConstainKey(_key,elements) {
  try {
         for (var i in elements) {
            if (i == _key) {
                return true;
            }
        }
    }catch (e) {
         return false;
     }
    return false;
}

async function validateNMSAPP(funid,jsonObject,conn,nnmAppMap,elementMapSymbolId){ 
  var securityManagerCenter = await getSecurityBufferByUser(user);
  return new Promise(function (resolve, reject) {
      try{
          var isValidateFun = false;
          var resTypeName = jsonObject.res_type;
          var resID = jsonObject.res_id;
          
          // var nnmAppMap = securityManagerCenter.nnmAppMap;
          isValidateFun = securityManagerCenter.isNMSAppSetAll?true:(nnmAppMap.funid != 'undefined');
          //如果是网络拓扑节点或非子网资源节点直接返回
            if((resTypeName=='topo_subnet'||resTypeName=='TOPO_SUBNET')&& resID==0 || (resTypeName=='port'||resTypeName=='PORT')){
                resolve(isValidateFun);
            }
            if(isValidateFun==true){

              if(securityManagerCenter.isObjectSetAll==true||resID==0){
                  resolve(true);
              }  
              var sub = elementMapSymbolId.resID;
              if(sub != 'undefined' && sub.category != 2){
                resolve(true);
              }
              var sql = "select map_hierarchy, symbol_id, real_res_id from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and symbol_id = '"+resID+"'" ;
              conn.query(sql,function(err, rows, fields){
                var hierarchy = rows[0].map_hierarchy;
                if(hierarchy == 'undefined'){
                  resolve(false);
                }
                var idList = hierarchy.split(",");
                
                for(var i = idList.length - 1; i >= 0; i--){
                  if(idList[i]==0){
                    resolve(false);
                  }
                  sub = elementMapSymbolId.idList[i];
                  if(sub != null){
                    if(sub.getCategory() != 2)
                      resolve(true);
                    else
                      resolve(false);
                    }
                }

                resolve(false);
              });
            }
            resolve(isValidateFun);  
      }catch(err){
        console.log('######err######',err);
        conn.release();
        reject(err); 
      }    
  })
}

router.route('/validateSubnetManaged')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
    	//user = req.params.username;  
    	var subnetID = req.params.subnetID;
      
    	async function validateSubnetManaged(subnetID){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true || 0==subnetID){
	    			res.json(200, {success: true, isvalid: true });
	    			return;
	    		}
	    		var sub = securityManagerCenter.elementMapSymbolId.subnetID;
	    		if(typeof(sub) != 'undefined' && sub.category != 2){
					res.json(200, {success: true, isvalid: true });
	    			return;
				  }
  				var sql = "select map_hierarchy, symbol_id, real_res_id from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and  symbol_id = '"+subnetID+"'";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
  				var hierarchy = row[0].map_hierarchy;
				  APP.dbpool_promise.releaseConnection(conn);
				  var idList = hierarchy.split(",");
  				for(var i = idList.length - 1; i >= 0; i--){
  					if(idList[i]==0){
  						res.json(200, {success: true, isvalid: false });
  						return ;
  					}
  					sub = securityManagerCenter.elementMapSymbolId.idList[i];
  					if(typeof(sub) != 'undefined'){
  						if(sub.category != 2){
  							res.json(200, {success: true, isvalid: true });
  							return ;
  						}else{
                res.json(200, {success: true, isvalid: false });
                return ;
            }
  							
  					}
  					
  							
  				}
				res.json(200, {success: true, isvalid: false });

    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1000, cause:err}); 
    		}
    		
    	}
    	validateSubnetManaged(subnetID);
        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
    	//user = req.params.username;  
    	var subnetID = req.params.subnetID;
      
    	async function validateSubnetManaged(subnetID){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true || 0==subnetID){
	    			res.json(200, {success: true, isvalid: true });
	    			return;
	    		}
	    		var sub = securityManagerCenter.elementMapSymbolId.subnetID;
	    		if(typeof(sub) != 'undefined' && sub.category != 2){
					   res.json(200, {success: true, isvalid: true });
	    			 return;
				  }
  				var sql = "select map_hierarchy, symbol_id, real_res_id from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and  symbol_id = '"+subnetID+"'";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
  				var hierarchy = row[0].map_hierarchy;
  				APP.dbpool_promise.releaseConnection(conn);
				  var idList = hierarchy.split(",");
				  for(var i = idList.length - 1; i >= 0; i--){
  					if(idList[i]==0){
  						res.json(200, {success: true, isvalid: false });
  						return ;
  					}
          var sub = securityManagerCenter.elementMapSymbolId.subnetID;
  					sub = securityManagerCenter.elementMapSymbolId.idList[i];
  					if(typeof(sub) != 'undefined'){
  						if(sub.category != 2){
  							res.json(200, {success: true, isvalid: true });
  							return ;
  						}
              else{
                res.json(200, {success: true, isvalid: false });
                return ;
              }
  							
  					}					
				  }
				res.json(200, {success: true, isvalid: false });

    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1000, cause:err}); 
    		}
    		
    	}
    	validateSubnetManaged(subnetID);
     	
    });

router.route('/validateDomain')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
    	//user = req.params.username;  
    	var jsonObject = req.params.jsonObject;
      
    	async function validateDomain(jsonObject){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true || jsonObject.create_user==user){
					res.json(200, {success: true, isvalid: true }); 
					return;
			   	}
				  var resTypeName = jsonObject.res_type;
				  var resID = jsonObject.res_id;
				  var hierarchy = null;
  				if(resTypeName=='TOPO_MAINVIEW_SYMBOL'||resTypeName=='topo_mainview_symbol'){
  					var element = securityManagerCenter.elementMapSymbolId.resID;
  					if(typeof(element) != 'undefined'){
  						res.json(200, {success: true, isvalid: true }); 
  						return;	
  					}
  					hierarchy = jsonObject.map_hierarchy;
  				}else{
  					var element = securityManagerCenter.elementMapUrl.resID;
  					if(typeof(element) != 'undefined'){
  						res.json(200, {success: true, isvalid: true }); 
  						return;
  					}
					 hierarchy = jsonObject.map_hierarchy;
				  }
  				if(hierarchy != null){
  					var idList = hierarchy.split(",");
  					for(var i = idList.length - 1; i >= 0; i--){
  						var s = idList[i];
  						if(s==0){
  							res.json(200, {success: true, isvalid: false }); 
  							return;			
  						}
  						var sub = securityManagerCenter.elementMapSymbolId.s;
  						if(typeof(sub) != 'undefined' && sub.category() != 2){
  							res.json(200, {success: true, isvalid: true }); 
  							return;
  						}
  					}
  				}
				  res.json(200, {success: true, isvalid: false }); 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1001, cause:err }); 
    		}
    		
    	}
    	validateDomain(jsonObject);       
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
    	//user = req.params.username;  
    	var jsonObject = req.params.jsonObject;
      
    	async function validateDomain(jsonObject){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true || jsonObject.create_user==user){
  					res.json(200, {success: true, isvalid: true }); 
  					return;
				  }
  				var resTypeName = jsonObject.res_type;
  				var resID = jsonObject.res_id;
  				var hierarchy = null;
  				if(resTypeName=='TOPO_MAINVIEW_SYMBOL'||resTypeName=='topo_mainview_symbol'){
  					var element = securityManagerCenter.elementMapSymbolId.resID;
  					if(typeof(element) != 'undefined'){
  						res.json(200, {success: true, isvalid: true }); 
  						return;	
  					}
  					hierarchy = jsonObject.map_hierarchy;
  				}else{
  					var element = securityManagerCenter.elementMapUrl.resID;
  					if(typeof(element) != 'undefined'){
  						res.json(200, {success: true, isvalid: true }); 
  						return;
  					}
  					hierarchy = jsonObject.map_hierarchy;
  				}
  				if(hierarchy != null){
  					var idList = hierarchy.split(",");
  					for(var i = idList.length - 1; i >= 0; i--){
  						var s = idList[i];
  						if(s==0){
  							res.json(200, {success: true, isvalid: false }); 
  							return;
  							
  						}
  						var sub = securityManagerCenter.elementMapSymbolId.s;
  						if(typeof(sub) != 'undefined' && sub.category() != 2){
  							res.json(200, {success: true, isvalid: true }); 
  							return;
  						}
  					}
  				}
				  res.json(200, {success: true, isvalid: false }); 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1001, cause:err }); 
    		}
    		
    	}
    	validateDomain(jsonObject);   	
    });

router.route('/getDomainAllSymbolIDString')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllSymbolIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIds: 'all' }); 
					   return;
				  }
  				var sql = "select symbol_id from sec_user_symbol where sec_user_id = "+securityManagerCenter.sec_user_id+" and symbol_id >= 0";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var symbolIds='';
  				for(var i  in row){
  					var symbol_id = row[i].symbol_id;
  					if(typeof(symbol_id)=='undefined'||symbol_id==''||symbol_id==null){
  						continue;
  					}
  					symbolIds+=symbol_id+",";
  				}
  				
  				if(symbolIds==''||typeof(symbolIds)=='undefined'){
  					res.json(200, {success: true, symbolIds: 'none' }); 
  					return ;
  				}
  				symbolIds = symbolIds.substring(0,symbolIds.length-1);
  				res.json(200, {success: true, symbolIds: symbolIds }); 
  				return ;		

    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1002, cause:err }); 
    		} 		
    	}
    	getDomainAllSymbolIDString();       
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllSymbolIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIds: 'all' }); 
					  return;
				  }
  				var sql = "select symbol_id from sec_user_symbol where sec_user_id = "+securityManagerCenter.sec_user_id+" and symbol_id >= 0";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var symbolIds='';
  				for(var i  in row){
  					var symbol_id = row[i].symbol_id;
  					if(typeof(symbol_id)=='undefined'||symbol_id==''||symbol_id==null){
  						continue;
  					}
  					symbolIds+=symbol_id+",";
  				}
  				
  				if(symbolIds==''||typeof(symbolIds)=='undefined'){
  					res.json(200, {success: true, symbolIds: 'none' }); 
  					return ;
  				}
  				symbolIds = symbolIds.substring(0,symbolIds.length-1);
  				res.json(200, {success: true, symbolIds: symbolIds }); 
  				return ;		
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1002, cause:err });
    		}		
    	}
    	getDomainAllSymbolIDString();   	
    });

router.route('/getDomainSymbolIDStringExceptSubnet')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainSymbolIDStringExceptSubnet(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIds: 'all' }); 
					  return;
				  }	
  				var sql = "select a.symbol_id from sec_user_symbol a, topo_symbol b where sec_user_id = "+APP.
          securityManagerCenter.sec_user_id+" and b.symbol_style <> 2 and a.symbol_id = b.symbol_id";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var symbolIds='';
  				for(var i  in row){
  					var symbol_id = row[i].symbol_id;
  					if(typeof(symbol_id)=='undefined'||symbol_id==''||symbol_id==null){
  						continue;
  					}
  					symbolIds+=symbol_id+",";
  				}
  				
  				if(symbolIds==''||typeof(symbolIds)=='undefined'){
  					res.json(200, {success: true, symbolIds: 'none' }); 
  					return ;
  				}
  				symbolIds = symbolIds.substring(0,symbolIds.length-1);
  				res.json(200, {success: true, symbolIds: symbolIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1003, cause:err});
    		}		
    	}
    	getDomainSymbolIDStringExceptSubnet();       
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainSymbolIDStringExceptSubnet(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIds: 'all' }); 
					  return;
				  }	
  				var sql = "select a.symbol_id from sec_user_symbol a, topo_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and b.symbol_style <> 2 and a.symbol_id = b.symbol_id";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var symbolIds='';
  				for(var i  in row){
  					var symbol_id = row[i].symbol_id;
  					if(typeof(symbol_id)=='undefined'||symbol_id==''||symbol_id==null){
  						continue;
  					}
  					symbolIds+=symbol_id+",";
  				}
  				
  				if(symbolIds==''||typeof(symbolIds)=='undefined'){
  					res.json(200, {success: true, symbolIds: 'none' }); 
  					return ;
  				}
  				if(typeof(symbolIds)!='undefined'){
  					symbolIds = symbolIds.substring(0,symbolIds.length-1);
  				}
  				res.json(200, {success: true, symbolIds: symbolIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1003, cause:err}); 
    		}		
    	}
    	getDomainSymbolIDStringExceptSubnet();   	
    });

router.route('/getDomainAllNEIDString')
    .get(function(req, res, next) {
    	// user = req.body.user;
     
    	user = req.query.user;
      
      console.log('##user#getDomainAllNEIDString#',user);
      console.log('##req#getDomainAllNEIDString#',req.body);
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllNEIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, resIds: 'all' }); 
					  return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne'";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var resIds='';
  				for(var i  in row){
  					var res_id = row[i].res_id;
  					if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
  						continue;
  					}
  					resIds+=res_id+",";
  				}
  				
  				if(resIds==''||typeof(resIds)=='undefined'){
  					res.json(200, {success: true, resIds: 'none' }); 
  					return ;
  				}
  				if(typeof(resIds)!='undefined'){
  					resIds = resIds.substring(0,resIds.length-1);
  				}
  				res.json(200, {success: true, resIds: resIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1004, cause:err});
    		}		
    	}
    	getDomainAllNEIDString();      
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
      user = req.body.user;
      
      console.log('##user#user#',user);
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllNEIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, resIds: 'all' }); 
            console.log('ffffffffffffffffffffffffffff');
					  return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne'";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var resIds='';
  				for(var i  in row){
  					var res_id = row[i].res_id;
  					if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
  						continue;
  					}
  					resIds+=res_id+",";
  				}
  				
  				if(resIds==''||typeof(resIds)=='undefined'){
  					res.json(200, {success: true, resIds: 'none' }); 
  					return ;
  				}
  				if(typeof(resIds)!='undefined'){
  					resIds = resIds.substring(0,resIds.length-1);
  				}
  				res.json(200, {success: true, resIds: resIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1004, cause:err});
    		}		
    	}
    	getDomainAllNEIDString();   	
    });

router.route('/getDomainAllPortIDString')
    .get(function(req, res, next) {
       // user = req.session.user;
      user = req.query.user;
      
      console.log('##user#user#',user);
      //user = req.params.username;  
      // var jsonObject = req.params.jsonObject;
      async function getDomainAllPortIDString(){
        try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
          if(securityManagerCenter.isObjectSetAll==true){
            res.json(200, {success: true, resIds: 'all' }); 
            console.log('ffffffffffffffffffffffffffff');
            return;
          } 
          var sql = "select res_id from topo_symbol a, sec_user_symbol b ,res_ne c where b.sec_user_id = "+securityManagerCenter.sec_user_id+" and  a.res_id = c.neid  and a.symbol_id = b.symbol_id and a.res_type_name = 'ne' and c.netypeid not in (701,702)";
          var conn = await APP.dbpool_promise.getConnection();
          var row = await conn.query(sql);
          sql ="select c.res_id from res_port a,sec_user_symbol b , topo_symbol c where sec_user_id = " +securityManagerCenter.sec_user_id +" and b.symbol_id = c.symbol_id and c.res_id = a.port_id";
          console.log('****sql:',sql);
          var portRow = await conn.query(sql);
          var resIds='';
          for(var i  in row){
            var res_id = row[i].res_id;
            if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
              continue;
            }
            resIds+=res_id+",";
          }
          var portIds = '';
          for(var j in portRow){
            var port_id = portRow[j].res_id;
            if(typeof(port_id)=='undefined'||port_id==''||port_id==null){
              continue;
            }
            portIds+="'"+port_id+"',";
          }
          
          if(resIds==''||typeof(resIds)=='undefined'){
            resIds="none";  
          }else{
            resIds = resIds.substring(0,resIds.length-1);
          }
          if(portIds==''||typeof(portIds)=='undefined'){
            portIds="none";  
          }else{
            portIds = portIds.substring(0,portIds.length-1);
          }

          res.json(200, {success: true, resIds: resIds,portIds:portIds});
          APP.dbpool_promise.releaseConnection(conn); 
          return ; 
        }catch(err){
          console.log('######err######',err);
          APP.dbpool_promise.releaseConnection(conn);
          res.json(500, {success: false, causeid:1004, cause:err});
        }   
      }
      getDomainAllPortIDString();        
    })
    .post(function(req, res, next) {
      // user = req.session.user;
      user = req.body.user;
      
      console.log('##user#user#',user);
      //user = req.params.username;  
      // var jsonObject = req.params.jsonObject;
      async function getDomainAllPortIDString(){
        try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
          if(securityManagerCenter.isObjectSetAll==true){
            res.json(200, {success: true, resIds: 'all' }); 
            console.log('ffffffffffffffffffffffffffff');
            return;
          } 
          var sql = "select res_id from topo_symbol a, sec_user_symbol b ,res_ne c where b.sec_user_id = "+securityManagerCenter.sec_user_id+" and  a.res_id = c.neid  and a.symbol_id = b.symbol_id and a.res_type_name = 'ne' and c.netypeid not in (701,702)";
          var conn = await APP.dbpool_promise.getConnection();
          var row = await conn.query(sql);
          sql ="select c.res_id from res_port a,sec_user_symbol b , topo_symbol c where sec_user_id = " +securityManagerCenter.sec_user_id +" and b.symbol_id = c.symbol_id and c.res_id = a.port_id";
          console.log('****sql:',sql);
          var portRow = await conn.query(sql);
          var resIds='';
          for(var i  in row){
            var res_id = row[i].res_id;
            if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
              continue;
            }
            resIds+=res_id+",";
          }
          var portIds = '';
          for(var j in portRow){
            var port_id = portRow[j].res_id;
            if(typeof(port_id)=='undefined'||port_id==''||port_id==null){
              continue;
            }
            portIds+="'"+port_id+"',";
          }
          
          if(resIds==''||typeof(resIds)=='undefined'){
            resIds="none";  
          }else{
            resIds = resIds.substring(0,resIds.length-1);
          }
          if(portIds==''||typeof(portIds)=='undefined'){
            portIds="none";  
          }else{
            portIds = portIds.substring(0,portIds.length-1);
          }

          res.json(200, {success: true, resIds: resIds,portIds:portIds});
          APP.dbpool_promise.releaseConnection(conn); 
          return ; 
        }catch(err){
          console.log('######err######',err);
          APP.dbpool_promise.releaseConnection(conn);
          res.json(500, {success: false, causeid:1004, cause:err});
        }   
      }
      getDomainAllPortIDString();     
    });

router.route('/getDomainAllRemoteDevIDString')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllRemoteDevIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, remoteDevIds: 'all' }); 
					  return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id =  "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'remote_dev'";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var resIds='';
  				for(var i  in row){
  					var res_id = row[i].res_id;
  					if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
  						continue;
  					}
  					resIds+=res_id+",";
  				}
  				
  				if(resIds==''||typeof(resIds)=='undefined'){
  					res.json(200, {success: true, remoteDevIds: 'none' }); 
  					return ;
  				}
  				if(typeof(resIds)!='undefined'){
  					resIds = resIds.substring(0,resIds.length-1);
  				}
  				res.json(200, {success: true, remoteDevIds: resIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1005, cause:err});
    		}		
    	}
    	getDomainAllRemoteDevIDString();        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllRemoteDevIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, remoteDevIds: 'all' }); 
					  return;
				  }	
				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id =  "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'remote_dev'";
				var conn = await APP.dbpool_promise.getConnection();
				var row = await conn.query(sql);
        APP.dbpool_promise.releaseConnection(conn);
				var resIds='';
				for(var i  in row){
					var res_id = row[i].res_id;
					if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
						continue;
					}
					resIds+=res_id+",";
				}
				
				if(resIds==''||typeof(resIds)=='undefined'){
					res.json(200, {success: true, remoteDevIds: 'none' }); 
					return ;
				}
				if(typeof(resIds)!='undefined'){
					resIds = resIds.substring(0,resIds.length-1);
				}
				res.json(200, {success: true, remoteDevIds: resIds }); 
				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1005, cause:err});
    		}		
    	}
    	getDomainAllRemoteDevIDString();   	
    });

router.route('/getDomainAllChassisIDString')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllChassisIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, chassisIds: 'all' }); 
					  return;
				  }	
  				var sql = "select chassis_id from topo_symbol a, sec_user_symbol b, res_chassis c where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne' and a.real_res_id = c.neid";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var chassisIds='';
  				for(var i  in row){
  					var chassis_id = row[i].chassis_id;
  					if(typeof(chassis_id)=='undefined'||chassis_id==''||chassis_id==null){
  						continue;
  					}
  					chassisIds+="'"+chassis_id+"',";
  				}
  				
  				if(chassisIds.equals("")){
  					res.json(200, {success: true, chassisIds: 'none' }); 
  					return ;
  				}
  				if(typeof(chassisIds)!='undefined'){
  					chassisIds = chassisIds.substring(0,chassisIds.length-1);
  				}
  				res.json(200, {success: true, chassisIds: chassisIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1006, cause:err});
    		}		
    	}
    	getDomainAllChassisIDString();   	        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllChassisIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, chassisIds: 'all' }); 
					  return;
				  }	
  				var sql = "select chassis_id from topo_symbol a, sec_user_symbol b, res_chassis c where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne' and a.real_res_id = c.neid";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var chassisIds='';
  				for(var i  in row){
  					var chassis_id = row[i].chassis_id;
  					if(typeof(chassis_id)=='undefined'||chassis_id==''||chassis_id==null){
  						continue;
  					}
  					chassisIds+="'"+chassis_id+"',";
  				}

  				
  				if(chassisIds==''||typeof(chassisIds)=='undefined'){
  					res.json(200, {success: true, chassisIds: 'none' }); 
  					return ;
  				}
  				if(typeof(chassisIds)!='undefined'){
  					chassisIds = chassisIds.substring(0,chassisIds.length-1);
  				}
  				res.json(200, {success: true, chassisIds: chassisIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1006, cause:err});
    		}		
    	}
    	getDomainAllChassisIDString();   	
    });

router.route('/getDomainAllSubnetIDString')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllSubnetIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, resIds: 'all' }); 
					return;
				}	
				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'topo_subnet' union select 0 as symbol_id";
				var conn = await APP.dbpool_promise.getConnection();
				var row = await conn.query(sql);
				var resIds='';
				for(var i  in row){
					var res_id = row[i].res_id;
					if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
						continue;
					}
					resIds+=res_id+",";
				}
				if(typeof(resIds)!='undefined'){
					resIds = resIds.substring(0,resIds.length-1);
				}
				
				if(resIds==''||typeof(resIds)=='undefined'){
					res.json(200, {success: true, resIds: 'none' }); 
					return ;
				}
				res.json(200, {success: true, resIds: resIds }); 
				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1007, cause:err});
    		}		
    	}
    	getDomainAllSubnetIDString();	        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllSubnetIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, resIds: 'all' }); 
					return;
				}	
				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'topo_subnet' union select 0 as symbol_id";
				var conn = await APP.dbpool_promise.getConnection();
				var row = await conn.query(sql);
				var resIds='';
				for(var i  in row){
					var res_id = row[i].res_id;
					if(typeof(res_id)=='undefined'||res_id==''||res_id==null){
						continue;
					}
					resIds+=res_id+",";
				}
				if(typeof(resIds)!='undefined'){
					resIds = resIds.substring(0,resIds.length-1);
				}
				if(resIds==''||typeof(resIds)=='undefined'){
					res.json(200, {success: true, resIds: 'none' }); 
					return ;
				}
				res.json(200, {success: true, resIds: resIds }); 
				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1007, cause:err});
    		}		
    	}
    	getDomainAllSubnetIDString();
    });

router.route('/getDomainAllLinkIDString')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllLinkIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, linkSymbolIds: 'all' }); 
					  return;
				 }	
  				var sql = "select link_symbol_id from topo_link_symbol a, sec_user_symbol b, sec_user_symbol c where b.sec_user_id = "+securityManagerCenter.sec_user_id+" and b.sec_user_id = c.sec_user_id and a.src_symbol_id = b.symbol_id and a.dest_symbol_id = c.symbol_id";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var linkSymbolIds='';
  				for(var i  in row){
  					var linkSymbolId = row[i].link_symbol_id;
  					if(typeof(linkSymbolId)=='undefined'||linkSymbolId==''||linkSymbolId==null){
  						continue;
  					}
  					linkSymbolIds+=linkSymbolId+",";
  				}
  				
  				if(linkSymbolIds==''||typeof(linkSymbolIds)=='undefined'){
  					res.json(200, {success: true, linkSymbolIds: 'none' }); 
  					return ;
  				}

  				if(typeof(linkSymbolIds)!='undefined'){
  					linkSymbolIds = linkSymbolIds.substring(0,linkSymbolIds.length-1);
  				}
  				res.json(200, {success: true, linkSymbolIds: linkSymbolIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1008, cause:err});
    		}		
    	}
    	getDomainAllLinkIDString();       
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllLinkIDString(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, linkSymbolIds: 'all' }); 
					  return;
				  }	
  				var sql = "select link_symbol_id from topo_link_symbol a, sec_user_symbol b, sec_user_symbol c where b.sec_user_id = "+securityManagerCenter.sec_user_id+" and b.sec_user_id = c.sec_user_id and a.src_symbol_id = b.symbol_id and a.dest_symbol_id = c.symbol_id";
  				var conn = await APP.dbpool_promise.getConnection();
  				var row = await conn.query(sql);
          APP.dbpool_promise.releaseConnection(conn);
  				var linkSymbolIds='';
  				for(var i  in row){
  					var linkSymbolId = row[i].link_symbol_id;
  					if(typeof(linkSymbolId)=='undefined'||linkSymbolId==''||linkSymbolId==null){
  						continue;
  					}
  					linkSymbolIds+=linkSymbolId+",";
  				}
  				
  				if(linkSymbolIds==''||typeof(linkSymbolIds)=='undefined'){
  					res.json(200, {success: true, linkSymbolIds: 'none' }); 
  					return ;
  				}

  				if(typeof(linkSymbolIds)!='undefined'){
  					linkSymbolIds = linkSymbolIds.substring(0,linkSymbolIds.length-1);
  				}
  				res.json(200, {success: true, linkSymbolIds: linkSymbolIds }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			APP.dbpool_promise.releaseConnection(conn);
    			res.json(500, {success: false, causeid:1008, cause:err});
    		}		
    	}
    	getDomainAllLinkIDString();
    });

router.route('/getDomainAllSymbolIDSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	 async function getDomainAllSymbolIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIdsSql: 'all' }); 
					  return;
				  }
  				var sql = "select symbol_id from sec_user_symbol where sec_user_id = "+securityManagerCenter.sec_user_id+" and symbol_id >= 0";
  				res.json(200, {success: true, symbolIdsSql: sql }); 
  				return ;		

    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1009, cause:err});
    		}		
    	}
    	getDomainAllSymbolIDSql();        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	 async function getDomainAllSymbolIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIdsSql: 'all' }); 
					  return;
				  }
  				var sql = "select symbol_id from sec_user_symbol where sec_user_id = "+securityManagerCenter.sec_user_id+" and symbol_id >= 0";
  				res.json(200, {success: true, symbolIdsSql: sql }); 
  				return ;		

    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1009, cause:err});
    		}		
    	}
    	getDomainAllSymbolIDSql();   	
    });

router.route('/getDomainSymbolIDExceptSubnetSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainSymbolIDSqlExceptSubnet(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select a.symbol_id from sec_user_symbol a, topo_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and b.symbol_style <> 2 and a.symbol_id = b.symbol_id";
  				res.json(200, {success: true, symbolIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1010, cause:err});
    		}		
    	}
    	getDomainSymbolIDSqlExceptSubnet();       
    })
    .post(function(req, res, next) {
    	user = req.body.user;
      
    	// user = req.session.user;
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainSymbolIDSqlExceptSubnet(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, symbolIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select a.symbol_id from sec_user_symbol a, topo_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and b.symbol_style <> 2 and a.symbol_id = b.symbol_id";
  				res.json(200, {success: true, symbolIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1010, cause:err});
    		}		
    	}
    	getDomainSymbolIDSqlExceptSubnet();    	
    });

router.route('/getDomainAllNEIDSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllNEIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, resIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne'";
  				res.json(200, {success: true, resIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1011, cause:err});
    		}		
    	}
    	
    	getDomainAllNEIDSql();      
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
     
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllNEIDSql(){
    		try{
           var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, resIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne'";
  				res.json(200, {success: true, resIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1011, cause:err}); 
    		}		
    	}
    	getDomainAllNEIDSql();   	
    });

router.route('/getDomainAllRemoteDevIDSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllRemoteDevIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, remoteDevIdsSql: 'all' }); 
					 return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id =  "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'remote_dev'";
  				res.json(200, {success: true, remoteDevIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1012, cause:err});
    		}		
    	}
    	getDomainAllRemoteDevIDSql();       
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
     
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllRemoteDevIDSql(){
    		try{
           var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, remoteDevIdsSql: 'all' }); 
					  return;
				}	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id =  "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'remote_dev'";
  				res.json(200, {success: true, remoteDevIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1012, cause:err});
    		}		
    	}
    	getDomainAllRemoteDevIDSql();   	
    });

router.route('/getDomainAllChassisIDSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllChassisIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, chassisIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select chassis_id from topo_symbol a, sec_user_symbol b, res_chassis c where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne' and a.real_res_id = c.neid";
  				res.json(200, {success: true, chassisIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1013, cause:err});
    		}		
    	}
    	getDomainAllChassisIDSql();   	        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllChassisIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, chassisIdsSql: 'all' }); 
					  return;
				}	
  				var sql = "select chassis_id from topo_symbol a, sec_user_symbol b, res_chassis c where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'ne' and a.real_res_id = c.neid";
  				res.json(200, {success: true, chassisIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1013, cause:err});
    		}		
    	}
    	getDomainAllChassisIDSql();   	
    });

router.route('/getDomainAllSubnetIDSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllSubnetIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, subnetIdsSql: 'all' }); 
					  return;
				}	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'topo_subnet' union select 0 as symbol_id";
  				res.json(200, {success: true, subnetIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1014, cause:err});
    		}		
    	}
    	getDomainAllSubnetIDSql();	        
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllSubnetIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, subnetIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select res_id from topo_symbol a, sec_user_symbol b where sec_user_id = "+securityManagerCenter.sec_user_id+" and a.symbol_id = b.symbol_id and a.res_type_name = 'topo_subnet' union select 0 as symbol_id";
  				res.json(200, {success: true, subnetIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1014, cause:err});
    		}		
    	}
    	getDomainAllSubnetIDSql();
    });

router.route('/getDomainAllLinkIDSql')
    .get(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllLinkIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, linkSymbolIdsSql: 'all' }); 
					  return;
				}	
  				var sql = "select link_symbol_id from topo_link_symbol a, sec_user_symbol b, sec_user_symbol c where b.sec_user_id = "+securityManagerCenter.sec_user_id+" and b.sec_user_id = c.sec_user_id and a.src_symbol_id = b.symbol_id and a.dest_symbol_id = c.symbol_id";
  				res.json(200, {success: true, linkSymbolIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1015, cause:err});
    		}		
    	}
    	getDomainAllLinkIDSql();       
    })
    .post(function(req, res, next) {
    	// user = req.session.user;
    	user = req.body.user;
      
    	//user = req.params.username;  
    	// var jsonObject = req.params.jsonObject;
    	async function getDomainAllLinkIDSql(){
    		try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
    			if(securityManagerCenter.isObjectSetAll==true){
    				res.json(200, {success: true, linkSymbolIdsSql: 'all' }); 
					  return;
				  }	
  				var sql = "select link_symbol_id from topo_link_symbol a, sec_user_symbol b, sec_user_symbol c where b.sec_user_id = "+securityManagerCenter.sec_user_id+" and b.sec_user_id = c.sec_user_id and a.src_symbol_id = b.symbol_id and a.dest_symbol_id = c.symbol_id";
  				res.json(200, {success: true, linkSymbolIdsSql: sql }); 
  				return ; 
    		}catch(err){
    			console.log('######err######',err);
    			res.json(500, {success: false, causeid:1015, cause:err});
    		}		
    	}
    	getDomainAllLinkIDSql();  
    });

router.route('/getDomainHistoryAlarmIDStringBelongToSubnet')
 .get(function(req, res, next) {
      user = req.query.user;
      
      var subnetID = req.query.subnetID;
      async function getDomainHistoryAlarmIDStringBelongToSubnet(){
        try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
          if(securityManagerCenter.isObjectSetAll==true){
            res.json(200, {success: true, ircalarmlogid: 'all' }); 
            return;
          } 
          var sql = "select map_hierarchy from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and  symbol_id= '"+subnetID+"'";
          var conn = await APP.dbpool_promise.getConnection();
          var row = await conn.query(sql);
          var hierarchy = row[0].map_hierarchy;
          APP.dbpool_promise.releaseConnection(conn);
          if(hierarchy == null || hierarchy == ''){
            res.json(200, {success: true, ircalarmlogid: 'none' }); 
            return;
          }
          var sec_user_id = securityManagerCenter.sec_user_id;
          sql = "select ircalarmlogid from rcalarmhistory a, sec_user_symbol b where b.sec_user_id = " + sec_user_id + " and b.hierarchy like '" + hierarchy + "%' and  a.symbol_id = b.symbol_id";
          console.log('**sql**',sql);
          res.json(200, {success: true, ircalarmlogid: sql }); 
          return ; 
        }catch(err){
          console.log('######err######',err);
          res.json(500, {success: false, causeid:1015, cause:err});
        }   
      }
      getDomainHistoryAlarmIDStringBelongToSubnet();       
    })
    .post(function(req, res, next) {
      user = req.body.user;
      
      var subnetID = req.body.subnetID;
      async function getDomainHistoryAlarmIDStringBelongToSubnet(){
        try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
          if(securityManagerCenter.isObjectSetAll==true){
            res.json(200, {success: true, ircalarmlogid: 'all' }); 
            return;
          } 
          var sql = "select map_hierarchy from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and  symbol_id= '"+subnetID+"'";
          var conn = await APP.dbpool_promise.getConnection();
          var row = await conn.query(sql);
          var hierarchy = row[0].map_hierarchy;
          APP.dbpool_promise.releaseConnection(conn);
          if(hierarchy == null || hierarchy == ''){
            res.json(200, {success: true, ircalarmlogid: 'none' }); 
            return;
          }
          var sec_user_id = securityManagerCenter.sec_user_id;
          sql = "select ircalarmlogid from rcalarmhistory a, sec_user_symbol b where b.sec_user_id = " + sec_user_id + " and b.hierarchy like '" + hierarchy + "%' and  a.symbol_id = b.symbol_id";
          console.log('**sql**',sql);
          res.json(200, {success: true, ircalarmlogid: sql }); 
          return ; 
        }catch(err){
          console.log('######err######',err);
          res.json(500, {success: false, causeid:1015, cause:err});
        }   
      }
      getDomainHistoryAlarmIDStringBelongToSubnet();  
    });


router.route('/getDomainAlarmIDStringBelongToSubnet')
 .get(function(req, res, next) {
      user = req.query.user;
      
      var subnetID = req.query.subnetID;
      async function getDomainAlarmIDStringBelongToSubnet(){
        try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
          if(securityManagerCenter.isObjectSetAll==true){
            res.json(200, {success: true, ircalarmlogid: 'all' }); 
            return;
          } 
          var sql = "select map_hierarchy from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and  symbol_id= '"+subnetID+"'";
          var conn = await APP.dbpool_promise.getConnection();
          var row = await conn.query(sql);
          var hierarchy = row[0].map_hierarchy;
          APP.dbpool_promise.releaseConnection(conn);
          if(hierarchy == null || hierarchy == ''){
            res.json(200, {success: true, ircalarmlogid: 'none' }); 
            return;
          }
          var sec_user_id = securityManagerCenter.sec_user_id;
          sql = "select ircalarmlogid from rcalarmlog a, sec_user_symbol b where b.sec_user_id = " + sec_user_id + " and b.hierarchy like '" + hierarchy + "%' and  a.symbol_id = b.symbol_id";
          console.log('**sql**',sql);
          res.json(200, {success: true, ircalarmlogid: sql }); 
          return ; 
        }catch(err){
          console.log('######err######',err);
          res.json(500, {success: false, causeid:1015, cause:err});
        }   
      }
      getDomainAlarmIDStringBelongToSubnet();       
    })
    .post(function(req, res, next) {
      user = req.body.user;
      
      var subnetID = req.body.subnetID;
      async function getDomainAlarmIDStringBelongToSubnet(){
        try{
          var securityManagerCenter = await getSecurityBufferByUser(user);
          if(securityManagerCenter.isObjectSetAll==true){
            res.json(200, {success: true, ircalarmlogid: 'all' }); 
            return;
          } 
          var sql = "select map_hierarchy from topo_symbol where res_type_name in ('ne', 'chassis', 'topo_subnet', 'remote_dev') and  symbol_id= '"+subnetID+"'";
          var conn = await APP.dbpool_promise.getConnection();
          var row = await conn.query(sql);
          var hierarchy = row[0].map_hierarchy;
          APP.dbpool_promise.releaseConnection(conn);
          if(hierarchy == null || hierarchy == ''){
            res.json(200, {success: true, ircalarmlogid: 'none' }); 
            return;
          }
          var sec_user_id = securityManagerCenter.sec_user_id;
          sql = "select ircalarmlogid from rcalarmlog a, sec_user_symbol b where b.sec_user_id = " + sec_user_id + " and b.hierarchy like '" + hierarchy + "%' and  a.symbol_id = b.symbol_id";
          console.log('**sql**',sql);
          res.json(200, {success: true, ircalarmlogid: sql }); 
          return ; 
        }catch(err){
          console.log('######err######',err);
          res.json(500, {success: false, causeid:1015, cause:err});
        }   
      }
      getDomainAlarmIDStringBelongToSubnet();  
    });


function getSecurityBufferByUser(user){
    return new Promise(function (resolve, reject) {
      try{
        APP.sessionStore.all(function(error, sessions){
          var sessions = JSON.stringify(sessions); 
          var rows = JSON.parse(sessions);
          var flag = false;
          for(var i in rows){       
            var data = JSON.parse(JSON.stringify(rows[i]));
            if(user==data.user){
              if(!data.security_buffer){
                resolve(false);
                break;
              }else{
                resolve(data.security_buffer);
                flag = true;
                break;
              }
              
            }        
          }
          if(!flag){
             resolve(false);
          }
        
        })

      }catch(err){
        console.log('********',err);
        reject(err);
      }
    });
     
  }  

module.exports = router;
