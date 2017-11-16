var http = require('http');
var async = require('async');
var amqp = require('amqplib/callback_api');

//处理管理域左右移动数据
exports.caculate = function(pData,cData,isCompareSelf){
	var pDataArr = [];
	if(typeof(pData) != 'undefined' && pData != ''){
		var pData_str = pData.split('-');
		for(var i in pData_str){
			
			if(pData_str[i].split("*")[0] == 'loading' || 
	    		typeof(pData_str[i].split("*")[0]) == 'undefined'){
	    		continue;
	    	}
			pDataArr.push(parseInt(pData_str[i].split("*")[0]));			
		}
	}

	if(typeof(cData) != 'undefined' && cData != ''){
		var cData_str = cData.split('-');
		var cDataArr = [];
		for(var i in cData_str){
			
			if(cData_str[i].split("*")[0] == 'loading' || 
	    		typeof(cData_str[i].split("*")[0]) == 'undefined'){
	    		continue;
	    	}

			var symbol_id = cData_str[i].split("*")[0];
			var map_hierarchy = cData_str[i].split("*")[3];
			map_hierarchy = map_hierarchy
								.split(',')
		        				.filter(function (s) {
		        					return s != ''
		        				});
		    if(!isCompareSelf){
		    	var index = map_hierarchy.indexOf(symbol_id) -1;
		    	symbol_id = map_hierarchy[index];//取父symbol_id
		    }
		    if(isParentContain(symbol_id,map_hierarchy,pDataArr)){
		    	//cData_str.splice(i,1);
				delete cData_str[i];
		    }
		}
		cData_str = cData_str
		        		.filter(function (s) {
		        			return s != ''
		        		});

		cData = cData_str.join('-');
	}
	return cData;	
};

//
var isParentContain = function(symbol_id,map_hierarchy,pDataArr){
	if(typeof(symbol_id) != 'undefined' && symbol_id != '' && pDataArr.length > 0){
		if(pDataArr.indexOf(parseInt(symbol_id)) != -1){
			return true;
		}else{
			var index = map_hierarchy.indexOf(symbol_id) -1;
			return isParentContain(map_hierarchy[index],map_hierarchy,pDataArr);		
		}
	}else{
		return false;
	}
};

//获取用户组相关设备id
exports.get_group_device_symbols = function(result,operation,neg){
	var ids=[];
    var conds=[];
	for(var i in result){
		if(result[i]['category'] == 1){
			if(operation){
				ids.push(result[i]['symbol_id']);
			}else{
				if(result[i]['symbol_id'] == -4){
					result[i]['symbol_id'] = 0;					
				}
				conds.push("topo_symbol.map_hierarchy LIKE '%," + result[i]['symbol_id'] +",%'");			
			}
			
		}else if(result[i]['category'] == 2){
			if(neg == 1){
				if(result[i]['res_type_name'] != 'TOPO_SUBNET' ){
					ids.push(result[i]['symbol_id']);
				}
			}else{
				ids.push(result[i]['symbol_id']);
			}
		}
	}
		
	if(ids.length > 0){
		conds.push("topo_symbol.symbol_id IN (" + ids.join(',') +")");
	}
	return conds;
};


//强制下线
exports.forceOffLine = function(conn,req,res,names){
	if(names.length > 0){
		APP.sessionStore.all(function(error, sessions){
			var sessions = JSON.stringify(sessions); 
			var rows = JSON.parse(sessions);
			// var rows = eval(sessions);
			var log_parm = '';
			for(var i in rows){
				var data = JSON.parse(JSON.stringify(rows[i]));
				for(var j in names){
					if(data.user==names[j]){
						//log_parm = sessionId*username*ip*type 日志参数
						log_parm+= data.id+"*"+names[j]+"*"+data.ip_address+"*"+3+','
					}	
				}								
			}
			log_parm = (log_parm == ''?'':log_parm.substring(0,log_parm.length-1));
			var data = {  
		        log_parm:log_parm,
		        message:'User permissions changed, please log in again! After a minute will be forced off the assembly line',  
		    };

		    console.log('强制下线------datadatadatadata-------->',data);  
		    data = require('querystring').stringify(data);  
			var request = http.request( 
		        {  
		            host: 'localhost',  
		            port: req.app.get('port'),  
		            method: "POST",                 
		            path: '/kickoffuser',
		            headers: {  
		                "Content-Type": 'application/x-www-form-urlencoded',  
		                "Content-Length": data.length  
		            }                  
		        },
	        	function(request) {
	        		
	            	if(request.statusCode=='200'){
	                 var body = ""; 
	                 var resultBody; 
	                    request.on('data', function (data) { body += data;})  
	                           .on('end', function () { 
	                            resultBody = JSON.parse(body);
	                            if(resultBody.success== true){  
	                            	conn.commit();
									conn.release();
	                                res.json(200, {success: true, msg: 'Operation Success!'}); 
	                            } else{
	                            	conn.rollback(); 
	                                conn.release();
	                                console.log('修改操作集成员信息失败第二种中情况--err---> resultBody.success ！= true');
	                                res.json(200, {success: false, 'msg': resultBody.msg});  
	                            }                 
	                       })          
		            }else{
		            	conn.rollback(); 
	                    conn.release();
	                    console.log('修改操作集成员信息失败第三种中情况--err---> request.statusCode != 200');
		                res.json(200, {success: true, msg: 'Operation Failure!' });  
		            }
	        	} 
			);  
		    request.write(data);  
		    request.end();
		});
	}else{
		conn.commit();
		conn.release();
	    res.json(200, {success: true, msg: 'Operation Success!'}); 
	}

}

//记录安全日志(promise-await形式)
exports.logSecurity = async function(amqp,LogChannel,task){
	var amqp_conn;
	var	amqp_chanel;
	try{
		var amqp_url = sprintf("amqp://admin:admin@%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
		console.log('-----------amqp_url------------',amqp_url);
		//var amqp_url = sprintf("amqp://admin:admin@%s:%d", "172.16.75.93",5672);
		amqp_conn = await amqp_connect_promise(amqp,amqp_url);
		amqp_chanel = await amqp_createChannel_promise(amqp_conn);

		amqp_send(amqp_chanel, LogChannel, JSON.stringify(task));
		console.log('-----安全日志promise-await形式-----amqp_send-----true---',task);
	}catch(err){
		log.error(err);
	}

	if(amqp_chanel) {
		amqp_chanel.close(function() {
			amqp_conn.close(function() {
			})
		})
	}
}

//记录安全日志(async.waterfall形式)
exports.logSecurity_waterfall = function(amqp,LogChannel,task){
	var amqp_conn;
	var	amqp_chanel;
	try{
		var amqp_url = sprintf("amqp://admin:admin@%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
		console.log('-----------amqp_url------------',amqp_url);
		//var amqp_url = sprintf("amqp://admin:admin@%s:%d", "172.16.75.93",5672);
		amqp.connect(amqp_url, function(err, mq_conn) {
			if(err) {
				log.error(err);
				 console.log("---记录安全日志errerrerr---",err);
			}else{
				amqp_conn = mq_conn;
		        amqp_conn.createChannel(function(err, mq_ch) {
					if(err) {
						log.error(err);
					}else{
						amqp_chanel = mq_ch;
						amqp_send(amqp_chanel, LogChannel, JSON.stringify(task));
					}
					console.log('-----记录安全日志-----amqp_send-----true---',task);
				});
			}
		});
	}catch(err){
		log.error(err);
	}

	if(amqp_chanel) {
		amqp_chanel.close(function() {
			amqp_conn.close(function() {
			})
		})
	}
}

function amqp_createChannel_promise(amqp_conn) {
	return new Promise(function(resolve, reject) {
		amqp_conn.createChannel(function(err, mq_ch) {
			if(err) {
				reject(err);
			}else{
				resolve(mq_ch);
			}
		});
	});
}

function amqp_connect_promise(amqp,amqp_url) {
	return new Promise(function(resolve, reject) {
		amqp.connect(amqp_url, function(err, mq_conn) {
			if(err) {
				reject(err);
			}else{
			    resolve(mq_conn);
			}
		});
	});
}

var amqp_send = function(amqp_chanel, topic, payload) {
    var queueName = topic;
    amqp_chanel.assertQueue(queueName, {durable: false});
    amqp_chanel.sendToQueue(queueName, new Buffer(payload));
}
