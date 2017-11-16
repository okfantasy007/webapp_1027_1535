var express = require('express');
var router = express.Router();
var async = require('async');
var sd = require('silly-datetime');
var md5 = require('md5');
var http = require('http'); 
var request = require('request');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {
	var name = req.body.userName.trim();
	var password = md5(req.body.password);
	var ips = req.body.clientIp;
	var date; 

	async.waterfall(
	[ 
	    // 建立连接
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		if(err){
		   			log.error('connection err:'+err);
		   			callback({result:false, errmsg: 'get connection failed'}, conn);
		   		}else{
		   			callback(null, conn);
		   		}
		        
	    	})
	    },
	    // 校验用户名是否存在
	    function(conn, callback) {
		   var count_sql = "select COUNT(*) AS count from v_sec_user_and_strategy where user_name ='"+name+"'";
		   conn.query(count_sql, function(err, rows, fields) {
		   		if(err){
		   			log.error('sql err:'+err);
		   			callback({result:false, errmsg: err}, conn);
		   		}else{
		   			if(rows[0].count<=0){
		   				log.info('user name is no exist');
		    			callback({result:false, errmsg: 'user name no exist'}, conn);
		    		}else{
		    			log.info('go to next :verifyUserEnabled');
		    			callback(null, conn);
		    		}		

		   		}
		   		
		    });
	    },
      // 校验用户是否可用
	    function(conn, callback) {
		   var sql = "SELECT *  FROM v_sec_user_and_strategy where user_name ='"+name+"'";
		    conn.query(sql, function(err, rows, fields) {
		    	if(err){
		    		log.error('verifyUserEnabled err:'+err);
		   			callback({result:false, errmsg: err}, conn);
		    	}else{
		    		try{
		    			if(rows[0].closed_temporarily==1){
		    				log.info('user is closed_temporarily');
		    				callback({result:false, errmsg: 'the user you entered has been disabled temporarily'}, conn);
		    			}else{
		    				log.info('go to next : verifyUserLoginMode');
		        			callback(null, conn,rows);
		    			}
		    		}catch(err){
		    			log.error('verifyUserEnabled err:'+err);
		   				callback({result:false, errmsg: err}, conn);
		    		}		    	
		    		
		    	}
		    	
		    });
	    },

	     //校验所有在线数目
        function(conn,rows, callback){
       		APP.sessionStore.all(function(error, sessions){
       			if (!sessions) {
       				sessions = {}
       			}
       			var num = rows[0].max_online_num;
				var sessions = JSON.stringify(sessions); 
				var row = JSON.parse(sessions);
				var count = 0;
				var flag = 0;
				for(var i in row){
					var data = JSON.parse(JSON.stringify(row[i]));
					if(data.user==name){
						count++;
					}	
				}
				if(count>0){
					if(data.user=='administrator'){
						flag = 1;
					}
				}
				if(num<=count && num!=0){
					callback({errno: 40000,result:false, errmsg: 'exceed the user online num'}, conn);
				}else{
					callback(null, conn,rows,flag);
				}
			});		
       	},

        // 校验用户登录模式
	    function(conn,rows,flag,callback) {
		   var sql = "select * from sec_sys_properties  where property_name = 'sec_LoginMode'";
		    conn.query(sql, function(err, rows1, fields) {
		    	if(err){
		    		log.error('verifyUserLoginMode err:'+err);
		   			callback({result:false, errmsg: err}, conn);
		    	}else{
		    		try{
		    			if(rows1[0].value!=0){
		    				if(name=='administrator'){
		    					if(flag==1){//当前当前超级用户已经有一个在线
		    						log.info('目前系统登录模式为单用户登录模式，只允许一个超级用户登录系统，已经有一个超级用户登录');
		    						callback({result:false, errmsg: 'the login mode is single,  administrator is already online'}, conn);
		    					}else{
		    						log.info('go to next : verifyMaxOnlineCount');
		    						callback(null, conn,rows);
		    					}

		    			 	}else{
		    			 		log.info('目前系统登录模式为单用户登录模式，只允许超级用户登录系统！');
		    					callback({result:false, errmsg: 'the login mode is single, only administrator is allowed'}, conn);
		    		 	  	}
		    		
		    			}else{
		    				log.info('go to next : verifyMaxOnlineCount');
		        			callback(null, conn,rows);
		    			}
		    		}catch(err){
		    			log.error('verifyUserLoginMode err:'+err);
		   				callback({errno: 40000, result:false,errmsg: err}, conn);
		    		}
		    	}
		    });
	    },

      
		//校验用户是否被锁定
		function(conn,rows, callback) {
			var sql = "select auto_unlock_time from sec_account_strategy where sec_account_strategy_id = 1";
			conn.query(sql, function(err, rows1, fields) {
				if(err){
					log.error('erifyUserIsLock err:'+err);
		   			callback({errno: 40000,result:false, errmsg: err}, conn);
				}else{
					callback(null,conn,rows, rows1);
				}		
			});
		},

        
	    function(conn,rows,rows1 ,callback) {
	    	try{
	    		var lock_status = rows[0].lock_status;
				if(lock_status==0){
					log.info('go to next:verifyPassword');
					callback(null, conn,rows);
		     	}else if(lock_status==1){
		    		//有限时间锁定
					var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
					var lockData=sd.format(new Date(rows[0].lock_date), 'YYYY-MM-DD HH:mm:ss');
					log.info('time:'+time);
					log.info('lockData:'+lockData);
					var lockTime =new Date(lockData).getTime();
					var currentTime = new Date(time).getTime();;
					log.info('lockTime:'+lockTime);
					log.info('currentTime:'+currentTime);
					var timeDifference = (currentTime - lockTime)/1000/60;
            		var unlockTime = rows1[0].auto_unlock_time;
         			log.info("unlockTime"+unlockTime);
         			log.info("timeDifference"+timeDifference);
					if (timeDifference >= unlockTime) {
						//修改用户属性
						sql = sprintf(
				 		" update sec_user  set  lock_status = %d,lock_date = '%s', login_fail_count = %d where  sec_user_id = %d ",
				 	 	0,'',0,rows[0].sec_user_id);
						log.info(sql);
						conn.query(sql, function(err, result) {
							if(err){
								log.error('verifyUserIsLock is err:'+err);
								callback({errno: 40000,result:false, errmsg: err}, conn);
							}else{
								log.info('go to next:verifyPassword');
    							callback(null, conn,rows);
							}     				

	        			});

					}else{
						log.info('该用户被锁定，未到解锁时间');
						callback({errno: 40011,result:false, errmsg: 'the user is locked, not to unlock time'}, conn);
					}

		  		}else if(lock_status==2){
		      		// 永久锁定，返回结果错误码
		      		log.info('该用户已经被永久锁定');
		      		callback({errno: 40015, result:false,errmsg: 'the user has been locked permanently'}, conn);
		  		}	
	    	}catch(err){
	    		log.error('verifyUserIsLock is err:'+err);
		   		callback({errno: 40000, result:false,errmsg: err}, conn);
	    	}		  
	    },

        //校验密码是否正确
        function(conn,rows,callback) {
        	try{
        		log.info('password:'+password);
        		log.info('rows[0].userPassword:'+rows[0].user_password);
        		if(password==(rows[0].user_password)){
					var sql = sprintf(
						"update  sec_user SET login_fail_count = %d  WHERE  sec_user_id = %d",
						0,rows[0].sec_user_id						
	 				);
	 				conn.query(sql, function(err, result){
	 			　		if(err){
	 						log.error('verifyPassword is err:'+err);
	 						callback({errno: 40000, result:false,errmsg: err}, conn);
	 			　		}else{
	 						log.info('go to next:verifyAccessLimit');
	        	　  		callback(null, conn,rows);
	 			  		}
			   		});			

				}else{
					var sql = "select * from sec_account_strategy where sec_account_strategy_id = 1";
		    		conn.query(sql, function(err, rows1, fields) {
		    			if(err){
		    				log.error('verifyPassword is err:'+err);
		   					callback({errno: 40000,result:false, errmsg: err}, conn);
		    			}else{
		    				if((name=='administrator')&&(rows1[0].admin_no_lock==1)){
		    					log.info('您输入的密码错误，请重新输入'+err);
		    					callback({errno: 40018,result:false, errmsg: 'password is wrong,please re-enter'}, conn);
		    				}else{
		    					var login_fail_count = rows[0].login_fail_count;
		    					login_fail_count++;
		    					sql = sprintf(
					   			 	"update  sec_user set  login_fail_count = %d  where  sec_user_id = %d",
									login_fail_count,rows[0].sec_user_id						
		 						);
		 						conn.query(sql, function(err, result) {
		 							if(err){
		 								log.error('verifyPassword is err:'+err);
		   								callback({errno: 40000, result:false,errmsg: err}, conn);
		 							}else{
				     					var error_pwd_num_lock = rows1[0].error_pwd_num_lock;
				     					var forever_lock = rows1[0].forever_lock;
				     					if(error_pwd_num_lock-login_fail_count==1){
				     						if((forever_lock==1)&&(name!='administrator')){
				     							log.info('您还可以输入一次密码。如果输入密码错误，您的帐号将被永久锁定。');
				     							callback({errno: 40019,result:false, errmsg: 'you only have one chance. If you enter a error password , your account will be permanently locked'}, conn);
				     						}else{
				     							log.info('您还可以输入一次密码。如果输入密码错误，您的帐号将被锁定！');
				     							callback({errno: 40020,result:false, errmsg: 'you only have one chance. If you enter a error password , your account will be locked'}, conn);
				     						}
				     					}
				     					else if(login_fail_count>=error_pwd_num_lock){
				     						if((forever_lock==1)&&(name!='administrator')){
				     							var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
				     							sql = sprintf(
													"update  sec_user SET  lock_status = %d,lock_date = '%s',login_fail_count = %d  where sec_user_id = %d",
													2,time,0,rows[0].sec_user_id						
		 										);
		 										
		 										conn.query(sql, function(err, result) {
		 											if(err){
		 												log.error('verifyPassword is err:'+err);
		 												callback({errno: 40000,result:false, errmsg: err}, conn);
		 											}else{
		 												log.info('您的帐号已被永久锁定！');
		 												//发送告警？？？？？？？》？
		 												var task = {
															account:req.session.user,//登录用户名称
															level:1,//日志上报级别
															operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
															result:0,//结果0:成功;1:失败
															operateConent:req.session.user+new Date().toLocaleString() +T.__("The user has been locked"),//日志内容
														}
														common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

		        										callback({errno: 40021,result:false, errmsg: 'your account has been locked permanently'}, conn);
		 											}		        					
				        						});
				     						}else{
				     							var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
				     							sql = sprintf(
													"update  sec_user set  lock_status = %d,lock_date = '%s',login_fail_count = %d  where  sec_user_id = %d",
													1,time,0,rows[0].sec_user_id						
		 										);
		 					
		 										conn.query(sql, function(err, result) {
		 											if(err){
		 												log.error('verifyPassword is err:'+err);
		 												callback({errno: 40000, result:false,errmsg: err}, conn);
		 											}else{
		 												//发送告警？？？？？？？》？
		 												log.info('您输入的密码错误，该用户已被锁定！');
		        										callback({errno: 40021, result:false,errmsg: 'the password is error,the user has been locked!'}, conn);
		 											}	        							

				        						});

				     						}

				     					}else{
				     						log.info('您输入的密码错误，请重新输入!');
				     						callback({errno: 40018,result:false, errmsg: 'password is wrong,please re-enter'}, conn);
				     					}
		 							}				     				     	   
				   				});
		    				}
		    			
		    			}
		    			
					});		        			        	
				}
        	}
        	catch(err){
        		log.error('verifyPassword is err:'+err);
		   		callback({errno: 40000,result:false, errmsg: err}, conn);
        	}      		
	    },
	   
	    // 校验IP访问控制
		function(conn,rows, callback) {
				try{
					var ip_limit_mode = rows[0].ip_limit_mode;
			  		
			  		var sql = '';
			  		if(ip_limit_mode==1){
			  			sql = "select * from sec_ip_limit";
			  		}else if(ip_limit_mode==2){
						sql = "select * from v_sec_user_iplimit  where sec_user_id = '"+rows[0].sec_user_id+"'";
			  		}
			  		conn.query(sql, function(err, rows1, fields) {
			  			if(err){
			   				callback({errno: 40000, result:false,errmsg: err}, conn);
			  			}else{
			  				for (var i in rows1) {
			    				var IPRange = rows1[i].ip_range;
			    				var limitType = rows1[i].ip_limit_type;
			    				var ipRanges = new Array();
			    				if(limitType===0){
			    					ipRanges = IPRange.split("~");
			    					var leftIP = stringIPToLongIP(ipRanges[0]);
			    					var rightIP = stringIPToLongIP(ipRanges[1]);
			    					var currentIP = stringIPToLongIP(ips);
			    					var result = currentIP >= leftIP && currentIP <= rightIP;
			    				}else if(limitType==1){
			    					if(ips==''||typeof(ips)=='undefined'){
			    						ips = '127.0.0.1';
			    					}
			    					if(IPRange.indexOf('/')>=0){
			    						ipRanges = IPRange.split("/");
			    						var ip= ipRanges[0].split(".");

										var currentIP= ips.split(".");
										var ipSubnet= ipRanges[1].split(".");
										var ip_1 = parseInt(ip[0]);
										var ip_2 = parseInt(ip[1]);
										var ip_3 = parseInt(ip[2]);
										var ip_4 = parseInt(ip[3]);
										var currentIP_1 = parseInt(currentIP[0]);
										var currentIP_2 = parseInt(currentIP[1]);
										var currentIP_3 = parseInt(currentIP[2]);
										var currentIP_4 = parseInt(currentIP[3]);
										var ipSubnet_1 = parseInt(ipSubnet[0]);
										var ipSubnet_2 = parseInt(ipSubnet[1]);
										var ipSubnet_3 = parseInt(ipSubnet[2]);
										var ipSubnet_4 = parseInt(ipSubnet[3]);
										var networkSegment = (ip_1&ipSubnet_1).toString+"."+(ip_2&ipSubnet_2).toString+"."+(ip_3&ipSubnet_3).toString+"."+(ip_4&ipSubnet_4).toString;
			    						var networkSegment2 = (currentIP_1&ipSubnet_1).toString+"."+(currentIP_2&ipSubnet_2).toString+"."+(currentIP_3&ipSubnet_3).toString+"."+(currentIP_4&ipSubnet_4).toString;
			    						result = networkSegment==networkSegment2;
				    				}else{
				    					result = (ips==IPRange);
				    				}		    		
			    				}
			    				if(result){
									log.info('go to next:verifyLoginTimePeriod');
			    					callback(null, conn,rows);
			    					break;
								}
							}
							if(!result){
								log.info('IP地址不在访问控制范围内！');
			    				callback({errno: 40016,result:false, errmsg: 'IP address is not within the access control scope'}, conn);
							}
			  			}
			  		});
				}catch(err){
			  		log.error('verifyAccessLimit is err:'+err);
				   	callback({errno: 40000,result:false, errmsg: err}, conn);
				}	 
		},


  	    // 校验登录时间段是否合法
		function (conn,rows, callback) {
			var isOpenTimePeriod = rows[0].time_period_flag;
			if(isOpenTimePeriod==1){
				try{
					var strBeginDate=new Date(sd.format(new Date(rows[0].begin_date), 'YYYY-MM-DD')).getTime();
					var strCurrentDate =new Date(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')).getTime();
					if(strBeginDate>strCurrentDate){
						log.info('strBeginDate>strCurrentDate登录时段非法');
						callback({errno: 40012, result:false,errmsg: 'illegal login period'}, conn);
					}
					var strEndDate=new Date(sd.format(new Date(rows[0].end_date), 'YYYY-MM-DD')).getTime();
					if(strEndDate<strCurrentDate){
						log.info('strEndDate'+strEndDate);
						log.info('strCurrentDate'+strCurrentDate);
						log.info('strEndDate<strCurrentDate登录时段非法');
						callback({errno: 40012, result:false,errmsg: 'illegal login period'}, conn);
						return;
					}

					var strBeginTime = new Date(sd.format(new Date(rows[0].begin_time_per_day), 'HH:mm:ss')).getTime();
					var strCurrentTime = new Date(sd.format(new Date(), 'HH:mm:ss')).getTime();
					if(strBeginTime>strCurrentTime){
						log.info('strBeginTime>strCurrentTime登录时段非法');
						callback({errno: 40012,result:false, errmsg: 'illegal login period'}, conn);
						return;
					}
					var strEndTime = new Date(sd.format(new Date(rows[0].end_time_per_day), 'HH:mm:ss')).getTime();
					if(strEndTime<strCurrentTime){
						log.info('strEndTime<strCurrentTime登录时段非法');
						callback({errno: 40012, result:false,errmsg: 'illegal login period'}, conn);
						return;
					}
					var currentWeek = sd.format(new Date(), 'E');
					var  isWeek = true;
					if(currentWeek=='星期一'){
						isWeek = (rows[0].MONDAY==1);
					}else if(currentWeek=='星期二'){
						isWeek = (rows[0].TUESDAY==1);
					}else if(currentWeek=='星期三'){
						isWeek = (rows[0].WEDNESDAY==1);
					}else if(currentWeek=='星期四'){
						isWeek = (rows[0].THURSDAY==1);
					}else if(currentWeek=='星期五'){
						isWeek = (rows[0].FRIDAY==1);
					}else if(currentWeek=='星期六'){
						isWeek = (rows[0].SATURDAY==1);
					}else if(currentWeek=='星期日'){
						isWeek = (rows[0].SUNDAY==1);
					}
					if(isWeek){
						log.info('go to next:verifyMaxOnlineCount');
						callback(null, conn,rows);
					}else{
						log.info('!isWeek登录时段非法');
						callback({errno: 40012,result:false, errmsg: 'illegal login period'}, conn);
					}

				}catch(err){
					log.error('verifyLoginTimePeriod is err:'+err);
					callback({errno: 40000,result:false, errmsg: err}, conn);
				}

			}else{
				log.info('go to next:verifyMaxOnlineCount');
				callback(null, conn,rows);
			}
		},

	    // 校验是否超出在线数目()
		function (conn,rows, callback) {
			APP.sessionStore.ids(function(error, keys){
				var onlineNum = 8888;//从liscence读取
				log.info('onlineNum:',onlineNum);
				var count = keys.length;
				log.info('count:',count); 
				if(onlineNum<count){
					callback({errno: 40000,result:false, errmsg: 'exceed the systems online num'}, conn);
				}else{
					callback(null, conn,rows);
				}
				
			});
		},

		 //初始化登录用户内存
		function (conn,rows, callback) {
			var data = {  
	        	userName: req.body.userName
		    };  
		    data = require('querystring').stringify(data);  

		    var request = http.request( 
		        {  
		            host: 'localhost',  
		            port: req.app.get('port'),  
		            method: "POST",                 
		            path: '/init_user_buffer',
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
		                               	date = resultBody.buffer;
										callback(null, conn,rows);
		                            } else{ 
		                                callback({errno: 40006,result:false, errmsg: resultBody.msg}, conn); 
		                            }                 
		                       })          
		            }else{
		                callback({errno: 40000, errmsg: 'unkown err'}, conn); 
		            }
		        } 
		    );  
		    request.write(data);  
		    request.end();  
		},

	    // 校验密码是否快到期
		function (conn,rows, callback) {
		   	try{
		   		if(rows[0].change_password_next_login==1){
					log.info('系统要求您必须修改密码，否则系统将会退出。');
					callback({errno:40004,result:false, errmsg: 'please change your password or the system will exit',id:rows[0].sec_user_id}, conn);
				}else{
					var passwordExpire = rows[0].pw_expired_date;
					log.info('passwordExpire:'+passwordExpire);
					if(passwordExpire==''||passwordExpire==null||typeof(passwordExpire)=='undefined'){
						callback(null, conn,rows);
					}else{
						var passwordExpireDate = sd.format(new Date(passwordExpire), 'YYYY-MM-DD HH:mm:ss');
						var currentDate=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
						var days = 0;
						if(passwordExpireDate!=null && currentDate !=null){
							var one_day = 24 * 60 * 60 * 1000;
							var stime = new Date(currentDate).getTime();
							var etime = new Date(passwordExpireDate).getTime();
							var sdays = stime / one_day;
							var edays = etime / one_day;
							if (stime < 0) {
								sdays--;
							}
							// 若 end < 1970-1-1,则日期差了一天,需要修正
							if (etime < 0) {
								edays--;
							}
							days = edays - sdays;	
						}

						var sql = 'select pwd_expire_clew_days from sec_account_strategy where sec_account_strategy_id = 1';
						conn.query(sql, function(err, rows1, fields) {
							if(err){
								log.error('verifyPasswordExpireDays is err:'+err);
								callback({errno: 40000,result:false, errmsg: 'unkown err'}, conn);
							}else{
								var pwdExpireDays = rows1[0].pwd_expire_clew_days;
	
								if (days > 0 && days <= pwdExpireDays) {//密码快过期提示
									log.info('您密码将到期，请及时修改密码！');
									callback({errno: 40017, result:true,errmsg: 'the password will expire, please change the password in time'}, conn);
								}else if(days < 0){
									log.info('您登录的用户密码已过期，请修改密码！');
									callback({errno: 40004,result:false, errmsg: 'the password has expired, please change the password',id:rows[0].sec_user_id}, conn);
								}
								else{
									log.info('game over');
									callback(null, conn,rows);
								}	
							}

						});
						
					}

				}
		   		
		   	}catch(err){
		   		log.error('verifyPasswordExpireDays is err:'+err);
				callback({errno: 40000, errmsg: 'unkown err'}, conn);
		   	}	
		}

	], 
	
	function (err, conn, rows) {
        conn.release();
		if (err) {
			log.error('err.result:'+ err.id);
	  		res.json(200, {
	  			success: err.result,
	  			errno: err.errno,
	  			msg: err.errmsg,
	  			id: err.id,
	  			data:date
	  		});  
		} else {
		    log.info('game over');
	  		res.json(200, {
	  			success: true,
	  			msg: 'login success',
	  			data:date
	  		});  
  		}
	}
)	
});


function stringIPToLongIP(IPAddress){
	var IPAddressses = new Array();
	IPAddressses = IPAddress.split(".");
	var speilIP='';
	for (var i in IPAddressses) 
	{
		var ip = IPAddressses[i];		
		if(ip.length == 1){
			ip="00"+ip;
		}else if(ip.length == 2){
			ip="0"+ip;
		}
		speilIP += ip;

	}
	log.info('speilIP:'+speilIP);
	return parseFloat(speilIP);
}

 function sendAlarm() {
   		var data = {
   			iRCAlarmID:'5602',
   			alarm_type_id: '5602',
   			iStatus:'2', 
   			strDesc:'',
   			url:"/ne=" +'',
   			strLocation:'',
   			iRCNetNodeID:''
        };  
        data = require('querystring').stringify(data);  

        var request = http.request( 
            {  
                host: 'localhost',  
                port: req.app.get('port'),  
                method: "POST",                 
                path: '/alarm/addAlarm',
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
                                   	log.info('发送告警通知成功');
									callback(null, conn,rows);
                                } else{ 
                                    callback({errno: 40006,result:false, errmsg: resultBody.cause}, conn); 
                                }                 
                           })          
                }else{
                    callback({errno: 40000, errmsg: 'unkown err'}, conn); 
                }
            } 

        );  
        request.write(data);  
        request.end();  
 }

module.exports = router;
