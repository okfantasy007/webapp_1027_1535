var express = require('express');
var router = express.Router();
var async = require('async');
var md5 = require('md5');
var sd = require('silly-datetime');
var comm = require('./security_domain.js');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {
	var userName = req.body.user_name.trim();
	var password = req.body.user_password;
	var confirmPwd = req.body.password_again;
	var userId = 0;
	var userGroupId = 0;
	var user_type = 1;

	async.waterfall(
	[
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
	    		if(err){
	    			console.log('**************'+err);
	    			callback({result:false, errmsg: 'database connection error'}, conn);
	    		}else{
	    			callback(null, conn);
	    		}		       
	    	})
	    },

	    function(conn,callback) {
			conn.beginTransaction(function(err) {
				if(err){
					callback({result:false, errmsg: 'begin transaction error'}, conn);
				}else{
					callback(null,conn);
				}
			
			});
		},
		
		function(conn,callback){
			if(userName==''||typeof(userName)=='undefined'){
				callback({result:false, errmsg: 'username can not be empty'}, conn);
			}else {
				var sql = "select count(*) as count from v_sec_user_and_strategy where user_name = '"+userName+"'";
				conn.query(sql, function(err, rows, fields) {
					if(err){
						console.log('*******select count(*) as count from v_sec_user_and_strategy*******'+err);
	    				callback({result:false, errmsg: err}, conn);
					}else{
						if(rows[0].count>0){
							console.log('##########该用户名已经存在##########');
							callback({result:false, errmsg: 'username already exists!'}, conn);
						}else{
							console.log('#########go to next 检测用户名长度');
							callback(null, conn);
						}
					}
				});
			}
		},

		function (conn,callback){
			var sql = 'select * from sec_account_strategy where sec_account_strategy_id =1';
			conn.query(sql, function(err, rows1, fields) {
				if(err){
					console.log('*******sec_account_strategy*******'+err);
					callback({result:false, errmsg: err}, conn);
				}else{
					var  miniLength = rows1[0].name_minilength;
					console.log('##########miniLength##########'+miniLength);
					if(userName.length<miniLength){
						console.log('##########用户名小于要求的最小长度##########');
						callback({result:false, errmsg: 'the length of user name is less than the required:',num:miniLength}, conn);
					}else{
						if(password!=confirmPwd){
							console.log('##########密码与确认密码不一致##########');
							callback({result:false, errmsg: 'the password is inconsistent with the confirmation password'}, conn);
						}else{
							console.log('##########go to next 检测密码有效性');
							callback(null,conn);
						}

					}

				}
				
			});
		},

		function (conn,callback){
			 var sql = 'select * from sec_pwd_strategy';
	   			 conn.query(sql, function(err, rows, fields) {
	   		 		if(err){
	   		 			console.log('##########getPasswordStrategyValue is err:##########'+err);
						callback({errno: 40000,result:false, errmsg: err}, conn);
	   		 		}else{
	   		 			//校验密码最小长度
	   		 			var size = password.length;
	   		 			if(userName=='administrator'){
	   		 				var min = rows[0].admin_pwd_minilength;
	   		 				if(size < min){
	   		 					console.log('##########超级密码长度小于规定的最小长度值:##########');
								callback({result:false, errmsg: 'the length of password is less than the specified minimum length'}, conn);
	   		 				}else{
	   		 					console.log('##########go to next 密码长度大于规定的最大长度值##########');
								callback(null,conn,rows);
	   		 				}

	   		 			}else {
	   		 				var min = rows[0].user_pwd_minilength;
	   		 				if(size < min){
	   		 					console.log('##########密码长度小于规定的最小长度值:##########');
								callback({result:false, errmsg: 'the length of password is less than the specified minimum length'}, conn);
	   		 				}else{
	   		 					console.log('##########go to next 密码长度大于规定的最大长度值##########');
								callback(null,conn,rows);
	   		 				}
	   		 			}		 			   		 			
	   		 			
	   		 		}
	    	 });
		},

		function(conn,rows,callback){
	    	var size = password.length;
	    	if(size>rows[0].pwd_maxlength){
 				console.log('##########密码长度大于规定的最大长度值##########');
				callback({result:false, errmsg: 'the length of password is greater than the specified max length'}, conn);

 			}else{
 				console.log('##########go to next 密码中字母的最少个数##########');
				callback(null,conn,rows);
 			}
	    },

	    function(conn,rows,callback){
			if((rows[0].pwd_letter_minimum_num!=null)&&(rows[0].pwd_letter_minimum_num>0)){		   		 
		   		var num = getCharNum(password);
 				console.log('##########'+num+'##########');
 				console.log('##########'+rows[0].pwd_letter_minimum_num+'##########');
 				if(num<rows[0].pwd_letter_minimum_num){
 					console.log('##########密码中字母的最少个数'+rows[0].pwd_letter_minimum_num+'##########');
					callback({result:false, errmsg: 'the minimum number of letters in the password should be:', num:rows[0].pwd_letter_minimum_num}, conn);
 				}else{
 					console.log('##########go to next 密码中大写字母的最少个数##########');
					callback(null,conn,rows);
 				}

		   	}else{
 					console.log('##########go to next 密码中大写字母的最少个数##########');
					callback(null,conn,rows);
 			}
	    },

	    function(conn,rows,callback){
	     	if((rows[0].pwd_uppercase_minimum_num!=null)&&(rows[0].pwd_uppercase_minimum_num>0)){
		   		var num = getCapCharNum(password);
 				console.log('##########'+num+'##########');
 				if(num<rows[0].pwd_uppercase_minimum_num){
 					console.log('##########密码中大写字母的最少个数'+rows[0].pwd_uppercase_minimum_num+'##########');
					callback({result:false, errmsg: 'the minimum number of capital letters in the password',num:rows[0].pwd_uppercase_minimum_num}, conn);
 				}else{
 					console.log('##########go to next 密码中小写字母的最少个数##########');
					callback(null,conn,rows);
 				}
			}else{
 					console.log('##########go to next 密码中小写字母的最少个数##########');
					callback(null,conn,rows);
 			}
	    },

	    function(conn,rows,callback){
			if((rows[0].pwd_lowercase_minimum_num!=null)&&(rows[0].pwd_lowercase_minimum_num>0)){
 				var num = getLowCharNum(password);
 				console.log('##########'+num+'##########');
 				if(num<rows[0].pwd_lowercase_minimum_num){
 					console.log('##########密码中小写字母的最少个数'+rows[0].pwd_lowercase_minimum_num+'##########');
					callback({result:false, errmsg: 'the minimum number of lowercase letters in the password', num:rows[0].pwd_lowercase_minimum_num}, conn);
 				}else{
 					console.log('##########go to next 密码中特殊字符的最少个数##########');
					callback(null,conn,rows);
 				}
		   	}else{
 					console.log('##########go to next 密码中特殊字符的最少个数##########');
					callback(null,conn,rows);
 			}
		},

		function(conn,rows,callback){
			if((rows[0].pwd_special_char_minimum_num!=null)&&(rows[0].pwd_special_char_minimum_num>0)){
 				var specialCount = getSpecilCharNum(password,rows[0].pwd_special_char_minimum_num);
 				console.log(' specialCountnum##########'+specialCount+'##########');
				if(specialCount<rows[0].pwd_special_char_minimum_num){
					console.log('##########密码中特殊字符的最少个数'+rows[0].pwd_special_char_minimum_num+'##########');
					callback({errno: 40045,result:false, errmsg: 'the minimum number of special letters in the password', num:rows[0].pwd_special_char_minimum_num}, conn);
 				}else{
 					console.log('##########go to next 密码中数字的最少个数##########');
					callback(null,conn,rows);
 				}
		   	}else{
 				console.log('##########go to next 密码中数字的最少个数##########');
				callback(null,conn,rows);
	 		}
		},

		function(conn,rows,callback){
			if((rows[0].pwd_number_minimum_num!=null)&&(rows[0].pwd_number_minimum_num>0)){
		   		var num = getNumNum(password);
 				console.log('num##########'+num+'##########');
 				if(num<rows[0].pwd_number_minimum_num){
 					console.log('##########密码中数字的最少个数'+rows[0].pwd_number_minimum_num+'##########');
					callback({result:false, errmsg: 'the minimum number of digits in the password', num:rows[0].pwd_number_minimum_num}, conn);
 				}else{
 					console.log('##########go to next 不能包含用户名中连接字符的个数##########');
					callback(null,conn,rows);
 				}
		   	}else{
 					console.log('##########go to next 不能包含用户名中连接字符的个数##########');
					callback(null,conn,rows);
 				}
		},

		function(conn,rows,callback){
			var thirdnum = rows[0].max_name_pwd_same_num;
			if(thirdnum==0){
				console.log('##########go to next 密码不能是用户名的倒序排列##########');
				callback(null,conn,rows);
			}else if(thirdnum==1){
				var t = password.indexOf(userName);
				if(t>-1){
					console.log('##########不能包含完整用户名##########');
					callback({result:false, errmsg: '不能包含完整用户名'}, conn);
				}else{
					console.log('$##########go to next 密码不能是用户名的倒序排列##########');
					callback(null,conn,rows);
				}
			}else if(thirdnum==2){
				var charnum = rows[0].no_name_char_num;
				if (charnum != null && !charnum=='') {
					var iscontinue = true;
					var isHave = true;
					var i = 0;
					while (iscontinue) {
						var child = userName.substring(i, (i + charnum));
						var n = password.indexOf(child);
						if (n > -1) {
							iscontinue = false;
							isHave = false;
						} else {
							i++;
							if (i >= (userName.length - charnum)) {
								iscontinue = false;
							}
						}
					}
					if(!isHave){
						console.log('##########不能包含用户名中连接字符的个数##########'+charnum);
						callback({result:false, errmsg: 'cannot contain the number of connection characters in the user name:', num:charnum}, conn);

					}else{
						console.log('##########go to next 密码不能是用户名的倒序排列##########');
						callback(null,conn,rows);
					}

				}else{
					console.log('##########go to next 密码不能是用户名的倒序排列##########');
					callback(null,conn,rows);
				}
			}
		},
		function(conn,rows,callback){
			var reverse = rows[0].pwd_no_name_reverse;
			if(reverse==1){
				if(userName.length!=password.length){
					console.log('##########go to next 密码中不能有4个或4个以上的重复字符##########');
					callback(null,conn,rows);

				}else{
					var name =userName.split('').reverse().join('');
					console.log('%%%%%%%%%%%%%%'+name);
					if(name==password){
						console.log('##########密码不能是用户名的倒序排列##########');
						callback({result:false, errmsg: 'the password cannot be a reverse order of the user name'}, conn);
					}else{
						console.log('##########go to next 密码中不能有4个或4个以上的重复字符##########');
						callback(null,conn,rows);
					}
				}

			}else{
				console.log('##########go to next 密码中不能有4个或4个以上的重复字符##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var noFourSeries =  rows[0].pwd_no_four_series;
			if(noFourSeries==1){
				var iscontinue = true;
				var isHave = false;
				var i = 0;
				while (iscontinue) {
					var child = password.substring(i, (i + 4));
					if (child.length < 4) {// 说明没有连续重复字符
						iscontinue = false;
					} else {//
						var b = child.split('');
						if (b[0] == b[1] && b[0] == b[2] && b[0] == b[3]) {
							iscontinue = false;
							isHave = true;// 有四个以上连续重复字符
						} else {
							i++;
							if (i > password.length-4) {
								iscontinue = false;
							}
						}

					}
				}
				if(isHave){
					console.log('##########密码中不能有4个或4个以上的重复字符##########');
					callback({result:false, errmsg: 'can not contain four or more duplicates in the password'}, conn);
				}else{
					console.log('##########go to next 密码不能是数字或字母的递增递减序列##########');
					callback(null,conn,rows);
				}

			}else{
				console.log('##########go to next 密码不能是数字或字母的递增递减序列##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var increaseDegressive = rows[0].pwd_no_increase_degressive;
			if(increaseDegressive==1){
				var record=password.split('');
				var isRaising=true;
				var isDecrecing=true;
				for(var i=1;i<record.length;i++){
					if(record[i]-record[i-1]==1){
						continue;
					}else{
						isRaising=false;
					}
				}
				for(var k=record.length-1;k>0;k--){
					if(record[k-1]-record[k]==1){
						continue;
					}else{
						isDecrecing=false;
					}
				}
				if (!(isRaising||isDecrecing)){
					console.log('##########go to next 密码不能包含完整的密码字典中的词汇##########');
					callback(null,conn,rows);
				}else{
					console.log('##########密码不能是数字或字母的递增递减序列##########');
					callback({result:false, errmsg: 'the password cannot be a sequence of increments of Numbers or letters'}, conn);
				}
			}else{
				console.log('##########go to next 密码不能包含完整的密码字典中的词汇##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var  noWorkBook = rows[0].pwd_no_workbook;
			if(noWorkBook==1){
				if(verifyPasswordDictionary(password)==false){
					console.log('##########密码不能包含完整的密码字典中的词汇##########');
					callback({result:false, errmsg: 'the password cannot contain a full password dictionary word'}, conn);

				}else{
					console.log('##########go to 与前三次密码不能相同##########');
					callback(null,conn,rows);
				}

			}else{
				console.log('##########go to 与前三次密码不能相同##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var differTime = rows[0].new_old_pwd_diffethree_time;
			if(differTime==1){
				var sql = "select user_password from sec_user_password_history where user_name = '"+userName+"' order by id desc limit 3";
				var all = new Array();
				conn.query(sql, function(err, rows1, fields) {
					if(err){
		   		 		console.log('##########getHistoryPassword is err:##########'+err);
						callback({result:false, errmsg: err}, conn);
					}else{
						for(var i in rows1){
							all[i]=rows1[i].user_password;
						}
						if(containsStr(all,password)==true){
							console.log('##########密码与前三次相同##########');
							callback({result:false, errmsg: 'the password is the same as the previous three times, please re-enter'}, conn);
						}else{
							var sql1 = "insert into sec_user_password_history (user_name,user_password) values ('"+userName+"','"+password+"')";
							conn.query(sql1, function(err, result){
								if(err){
									console.log('##########插入sec_user_password_history数据库出错##########');
									callback({result:false, errmsg: 'error inserting the sec_user_password_history database'}, conn);
								}else{
									console.log(result);
									console.log('########## go to 密码最短天数大于最长天数##########');
									callback(null,conn,rows);
								}
							});
						}
					}

				});
			}else{
				console.log('##########go to 密码最短天数大于最长天数##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var pwdShortDays = rows[0].pwd_short_save_days;
			var pwdValidDays = req.body.password_valid_days;
			console.log('##########pwdShortDays'+pwdShortDays);
			pwdValidDays = parseInt(pwdValidDays);
			console.log('##########pwdValidDays'+pwdValidDays);
			if(pwdShortDays > pwdValidDays && pwdValidDays != 0){
				console.log('##########密码最短天数大于最长天数');
				callback({result:false, errmsg: 'The shortest password duration is greater than the maximum  duration'}, conn);
			}else{
				console.log('##########go to 校验详细信息页面##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var email = req.body.e_mail;
			if(email != null && email!='' && getEmailNum(email)==0){
				console.log('##########用户email格式不正确');
				callback({result:false, errmsg: 'email format is not correc'}, conn);
			}else{
				console.log('##########go to 保存usergroup');
				callback(null,conn,rows);
			}
		},
	
		//校验完毕，入表sec_user
		function(conn,rows,callback){
			var maps={};
			maps['user_name']="'"+userName+"'";
			maps['user_password']="'"+md5(password)+"'";
			maps['full_name']="'"+req.body.full_name+"'";
			user_type = req.body.user_type;
			maps['user_type']=user_type;
			maps['create_time']="'"+sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')+"'";
			maps['dept']="'"+req.body.dept+"'";
			maps['tel']="'"+req.body.tel+"'";
			maps['fax']="'"+req.body.fax+"'";
			maps['e_mail']="'"+req.body.e_mail+"'";
			maps['mailcode']="'"+req.body.mailcode+"'";
  			maps['address']="'"+req.body.address+"'";
  			var pwdValidDaysNolimit= req.body.password_valid_days_nolimit;
			var pwdValidDays = 0;
			if(pwdValidDaysNolimit==0){
				pwdValidDays = parseInt(req.body.password_valid_days);
			}
			var pwdExpiredDate = '';
			if(pwdValidDays==0){
				pwdExpiredDate = '2038-01-08 03:00:00';
			}else{
				pwdExpiredDate = getPasswordValidData(pwdValidDays);
			}
			maps['pw_expired_date']="'"+pwdExpiredDate+"'";
			maps['user_desc']="'"+req.body.user_desc+"'";
			maps['ip_limit_mode']=req.body.use_all_acl;
			maps['password_modify_time']="'"+sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')+"'";
			var sql_user = fromMapToInsertSql(maps,'sec_user');
			 conn.query(sql_user,function(err,result){
			    	if(err){
			    		console.log('#########入库sec_user出错');
						callback({result:false, errmsg: err}, conn);
			    	}else{
			    		userId = result.insertId;
			    		console.log('#########go to sec_user_strategy##########');
			    		callback(null,conn,pwdValidDaysNolimit,pwdValidDays);
			    	}
			});  	
		},	
		
		function(conn,pwdValidDaysNolimit,pwdValidDays,callback){
			var map = {};
			map['sec_user_id']=userId;
			map['change_password_next_login']=req.body.change_password_next_login;
			map['cannot_change_password']=req.body.cannot_change_password;
			map['closed_temporarily']=req.body.closed_temporarily;
			map['password_valid_days_flag']=pwdValidDaysNolimit;
			map['password_valid_days']=pwdValidDays;
	    	var maxOnlineNum = 0;
			var maxOnlineNoLimit= req.body.max_online_num_nolimit;
			if(maxOnlineNoLimit==0){
				maxOnlineNum = req.body.max_online_num;
			}
			map['max_online_num_flag']=maxOnlineNoLimit;
			map['max_online_num']=maxOnlineNum;
			var autoExitWaitTime = 0;
			// var autoExitWaitTimeNolimit= req.body.auto_exit_wait_time_nolimit;
			// if(autoExitWaitTimeNolimit==0){
			// 	autoExitWaitTime = req.body.auto_exit_wait_time;
			// }
			// map['auto_exit_wait_time_flag']=autoExitWaitTimeNolimit;
			// map['auto_exit_wait_time']=autoExitWaitTime;
			var timePeriodFlag = req.body.time_period_flag;
			map['time_period_flag']=timePeriodFlag;		
			if(timePeriodFlag==1){
				var b1= req.body.begin_date==''||req.body.begin_date==null;
				var b2 = req.body.end_date==''||req.body.end_date==null;
				var b3 = req.body.begin_time_per_day==''||req.body.begin_time_per_day==null;
				var b4 = req.body.end_time_per_day==''||req.body.end_time_per_day==null;
				var b5 = b1 && b2 && b3 && b4;

				var a1= req.body.begin_date!=''&&req.body.begin_date!=null;
				var a2 = req.body.end_date!=''&&req.body.end_date!=null;
				var a3 = req.body.begin_time_per_day!=''&&req.body.begin_time_per_day!=null;
				var a4 = req.body.end_time_per_day!=''&&req.body.end_time_per_day!=null;
				var a5 = a1 && a2 && a3 && a4;

				if(!(b5||a5)){
					console.log('##########可登录时间不能为空##########');		
			  		callback({errno: 40101,result:false, errmsg: 'The login time cannot be empty'}, conn);   
				}else if(a5){
					console.log(endTime);
					var beginDay = req.body.begin_date;
					var endDay = req.body.end_date;
					var beginTime = req.body.begin_time_per_day;
					var endTime = req.body.end_time_per_day;
					if((beginDay>endDay)||(beginTime>endTime)){
						console.log('##########开始日期或时间不能大于结束时间##########');		
						callback({result:false, errmsg: 'the start date or time cannot be greater than the end time'}, conn); 
					}
				}else{
					map['begin_date']="'"+req.body.begin_date+"'";
					map['end_date']="'"+req.body.end_date+"'";
					map['begin_time_per_day']="'"+req.body.begin_time_per_day+"'";
					map['end_time_per_day']="'"+req.body.end_time_per_day+"'";
					map['monday']=req.body.monday;
					map['tuesday']=req.body.tuesday;
					map['wednesday']=req.body.wednesday;
					map['thursday']=req.body.thursday;
					map['friday']=req.body.friday;
					map['saturday']=req.body.saturday;
					map['sunday']=req.body.sunday;	
				}						
			}
		    var sql_user_strategy = fromMapToInsertSql(map,'sec_user_strategy');
		    conn.query(sql_user_strategy,function(err,result){
		    	if(err){
					console.log('#########入库sec_user_strategy出错');
					callback({result:false, errmsg: err}, conn);
				}else{
					console.log('#########go to 保存私有用户组信息##########');
					callback(null,conn);
				}

		    });
		},	 

		function(conn,callback){
			var map = {};
			var name = "UserID = " +userId +" Private"; 
			var time  = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
			map['sec_usergroup_name']= "'"+name+"'"; 			
			map['sec_usergroup_fullname']= "'"+name+"'"; 	
			map['sec_usergroup_desc']= "'"+name+"'"; 	
			map['enable_status']=1;
			map['create_time']="'"+time+"'";
			map['is_user_private']=1;
			map['sec_usergroup_type']=user_type;
			var privateUsergroupInsertSql = fromMapToInsertSql(map,'sec_usergroup');
			console.log('##########privateUsergroupInsertSql:'+privateUsergroupInsertSql);
			conn.query(privateUsergroupInsertSql,function(err,result){
				if(err){
					console.log('#########入库私有用户组sec_usergroup出错');
					callback({result:false, errmsg: 'error inserting the sec_usergroup database'}, conn);
				}else{
					userGroupId = result.insertId;
					console.log('#########go to sec_user_password_history##############');
					callback(null,conn);

				}
			});	
		},

		function(conn,callback){
			var sql1 = "insert into sec_user_password_history (user_name,user_password) values ('"+userName+"','"+md5(password)+"')";
			conn.query(sql1, function(err, result){
				if(err){
					console.log('##########插入sec_user_password_history数据库出错##########');
					callback({result:false, errmsg: err}, conn);
				}else{
					console.log('##########go to 插入sec_user_belongto_usergroup##########');
					callback(null,conn);
				}
			});
		},

		function(conn,callback){
			var map = {};
			map['sec_user_id'] = userId;
			map['sec_usergroup_id'] = userGroupId;
			var insertUseToUsergroup = fromMapToInsertSql(map,'sec_user_belongto_usergroup');
			conn.query(insertUseToUsergroup,function(err,result){
				if(err){
					console.log('##########插入sec_user_belongto_usergroup数据库出错##########');
					callback({result:false, errmsg: err}, conn);
				}else{
					console.log('##########go to 插入sec_usergroup_res_access##########');
					callback(null,conn);
				}
			});	
		},

		function(conn,callback){
			console.log("---用户添加管理域---",req.body);
			var subnetDevSet = req.body.subnetDevArr;
			var subnetSet = req.body.subnetArr;
			var symbolSet = req.body.symbolArr;
			var delSubnetSet = req.body.delSubnetArr;
			var delSymbolSet = req.body.delSymbolArr;
			var insertId = userGroupId;
			console.log("---用户添加管理域---userGroupIduserGroupId",insertId);
			var sql_del = comm.delOldDomain(insertId,delSubnetSet,delSymbolSet);
			var sql_in = comm.insertNewDomain(insertId,subnetDevSet,subnetSet,symbolSet);
			var sqls = sql_del.concat(sql_in);
			console.log("sqlssqls###task_managerment@@@sqlssqls",sqls);
			if(sqls.length > 0){
				conn.query(sqls.join(';'), function(err, result){
					if(err) {
						console.log('##########插入sec_usergroup_res_access数据库出错##########');
						callback({result:false, errmsg: err}, conn);
					} else {
						console.log('##########go to 插入sec_usergroup_res_fun_access##########');
						callback(null,conn);
					}
				});
			}else{
				callback(null,conn);
			}
		},

		function(conn,callback){
			console.log("---用户添加操作权限---",req.body);
			var operator_ids = req.body.opSelectedIds;
			var insertId = userGroupId;
			console.log("---用户添加操作权限-userGroupIduserGroupId--",insertId);
			var sqls = comm.addOperator(insertId,operator_ids);
			console.log("sqls.join(';')sqls.join(';')",sqls.join(';'))
			if(sqls.length > 0){
				conn.query(sqls.join(';'), function(err, result){
					if(err){
						console.log('##########插入sec_usergroup_res_fun_access数据库出错##########');
						callback({result:false, errmsg: err}, conn);
					}else{
						console.log('##########go to 插入sec_user_iplimit##########');
						callback(null,conn);
					}
				});
			}else{
				callback(null,conn);
			}
		},

		function(conn,callback){
			if(req.body.use_all_acl==2){
				var ids = req.body.selectControlListId;
				var idArray = ids.split(',');
				var errs = false;
				var flag =0;
				for(var i in idArray){
					var map ={};
					map['limit_id']=idArray[i];
					map['sec_user_id']=userId;
					var sql = fromMapToInsertSql(map,'sec_user_iplimit');
					conn.query(sql,function(err,result){
						if(err){
							errs = errs||err;
							console.log('##########插入sec_user_iplimit数据库出错##########');
							callback({result:false, errmsg: err}, conn);
						}else{
							flag++;
						}
						console.log('########flag'+flag);
						console.log('########idArray'+idArray.length);
						if(flag==idArray.length){
							console.log('##########go to user_belong_usergroup##########');
							callback(null,conn);
						}	
					});
					if(errs){
						flag = 0;
						break;
					}
				}
			}else{
				console.log('##########go to user_belong_usergroup##########');
				callback(null,conn);
			}
		},

		function(conn,callback){
			var groupId = req.body.selectedId;
			console.log('#########groupId:########'+groupId);
			if(groupId!=''){
				var delSql  = "delete from sec_user_belongto_usergroup where sec_user_id = "+ userId+ " and sec_usergroup_id not in ("+userGroupId+")";			
				console.log('##########delSql##########'+delSql);
				conn.query(delSql,function(err,result){
					if(err){
						console.log('##########删除数据库sec_user_belongto_usergroup出错##########');
						callback({result:false, errmsg: err}, conn);
					}else{
						console.log('##########groupId##########'+groupId);
						var errs = false;
						var flag = 0;
						for(var i in groupId){
							var map = {};
							map['sec_user_id'] = userId;
							map['sec_usergroup_id'] = groupId[i];
							var insertUseToUsergroup = fromMapToInsertSql(map,'sec_user_belongto_usergroup');
							conn.query(insertUseToUsergroup,function(err,result){
								if(err){
									errs = errs||err;
									console.log('##########插入sec_user_belongto_usergroup数据库出错##########');
									callback({result:false, errmsg: err}, conn);		
								}else{
									flag++;
								}
								if(flag ==groupId.length){
									console.log('##########go to Domain##########');
									callback(null,conn);
								}

							});	
							if(errs){
								break;
							}
						}
					}					
				});
			}else{
				console.log('##########go to Domain##########');
				callback(null,conn);
			}		
		},

		
		function(conn,callback) {
			conn.commit(function(err) {
				if(err){
					conn.rollback();
					conn.release();
					callback(err,conn);
				}else{
					conn.release();
					callback(null,conn);
				}
				
			});
		},

	],

	
	function (err, conn) {       
		if (err) {
			// err.errno
			console.log('##err.result##:'+err.result);
			var task = {
				account:req.session.user,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
				result:1,//结果0:成功;1:失败
				operateContent:T.__("Add")+userName+T.__("User operation failed"),//日志内容
			}
			common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

	  		res.json(200, {
	  			failure: true,	
	  			msg: err.errmsg,
	  			num: err.num
	  			
	  		});  
		} else {
	    	var task = {
				account:req.session.user,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.session.ip_address,//操作用户所在客户端的对外IP
				result:0,//结果0:成功;1:失败
				operateContent:T.__("Add")+userName+T.__("User operation is successful"),//日志内容
			}
			common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志

	  		res.json(200, {
	  			success: true,
	  			msg: '用户保存成功'
	  		});  
  		}
	})	
});

function getCharNum(str){
    if(/[a-z]/i.test(str)){
        return str.match(/[a-z]/ig).length;
    }
    return 0;
}
function getEmailNum(str){
    if(/@/i.test(str)){
        return str.match(/@/ig).length;
    }
    return 0;
}
function getCapCharNum(str){
    if(/[A-Z]/.test(str)){
        return str.match(/[A-Z]/g).length;
    }
    return 0;
}
function getLowCharNum(str){
    if(/[a-z]/.test(str)){
        return str.match(/[a-z]/g).length;
    }
    return 0;
}
function getNumNum(str){
    if(/[0-9]/.test(str)){
        return str.match(/[0-9]/g).length;
    }
    return 0;
}
function getSpecilCharNum(password,count){
	if(count==0){
		return 0;
	}
	var specialCount = 0;
	for(var i = 0; i < password.length; i++){
		if ((password.indexOf("@") != -1) 
				|| (password.indexOf("#") != -1)
				|| (password.indexOf("%") != -1)
				|| (password.indexOf("*") != -1)
				|| (password.indexOf("&") != -1)
				|| (password.indexOf("+") != -1)
				|| (password.indexOf("-") != -1)
				|| (password.indexOf(" ") != -1)) {
			specialCount++;
		}
	}
   
    return specialCount;
}

function verifyPasswordDictionary(password){
	return true;
}

function containsStr(ary,str){
	for (var i in ary) {
    	if (ary[i] == str) 
    		return true;
 	 }
}

function getPasswordValidData(pwdValidDays){
	if(pwdValidDays < 1){
		return "2038-01-08 03:00:00";
	}
	var date=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
	var dateTime = new Date(date).getTime();
	var time = dateTime+24*60*60*1000*pwdValidDays;
	return(sd.format(new Date(time), 'YYYY-MM-DD HH:mm:ss'));	
}

function compareDateTime(date1,date2){
	var dateTime1 = new Date(date1).getTime();
	var dateTime2 = new Date(date2).getTime();
	return (dateTime2-dateTime1);
}

function fromMapToInsertSql(map,tableName){
	var sql = 'insert into '+ tableName +'(#2) values (#3)';
	var keys = '';
	var values = '';
	for(var key in map){
		keys = keys+key+",";
		values = values+map[key]+",";
		// console.log('$$$$$$$$$$$$keys:values'+key+":"+map[key]);
	}
	keys = keys.substring(0,keys.length-1);
	values = values.substring(0,values.length-1);
	sql = sql.replace(/#2/,keys);
	sql = sql.replace(/#3/,values);
	console.log('#########return sql:'+sql);
	return sql;
}

//用户类型
router.get("/user_type", function(req, res, next){
	APP.dbpool.getConnection(function(err, conn){
		var sql = "select * from sec_user_type";
		conn.query(sql,function(err, result){
			var array =[];
			for(var i in result){
				var id = result[i].id
				var type = result[i].type
				var temp = [];
				temp.push(type);
				temp.push(id);	
				array.push(temp);
			}
			if(err){
	    		conn.release();
	    		res.json(200, {success: false, msg: 'unkown err'});	
	    	}else{
	    		conn.release();
	    		res.json(200, array);
	    	}
		});
	});
});


module.exports = router;