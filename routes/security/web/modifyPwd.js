var express = require('express');
var router = express.Router();
var async = require('async');
var sd = require('silly-datetime');
var md5 = require('md5');
var common = require('../rest/common.js');
var amqp = require('amqplib/callback_api');

router.post('/', function(req, res, next) {

	var userId;
	var userName = req.body.userName;
	var txtOldPwd = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var affirmPassword = req.body.confirmPassword;
	
	async.waterfall(
	[
	    function(callback) {
	    	APP.dbpool.getConnection(function(err, conn) {
		        callback(null, conn);
	    	})
	    },

	    function(conn,callback) {
	    	var sql ="select * from sec_user where user_name = '"+userName+"'";
	    	conn.query(sql, function(err, rows, fields) {
	    		if(err){
	    			console.log('##########查询用户名 is err:##########'+err);
					callback({errno: 40000,result:false, errmsg: err}, conn);
	    		}else{
	    			userId = rows[0].sec_user_id;
	    			callback(null, conn,rows);
	    		}

	    	});
	    },

	    function(conn,rows,callback) {
	    	var oldPwd = rows[0].user_password; 
	    	if(md5(txtOldPwd)!=oldPwd){
	    		console.log('##########原密码错误:##########');
				callback({errno: 40000,result:false, errmsg: 'password is wrong,please re-enter'}, conn);
	    	}else{
	    		var sql = 'select pwd_short_save_days from sec_pwd_strategy';
	    		conn.query(sql, function(err, shortDaysRows, fields) {
		    		if(err){
		    			console.log('##########查询用户名 is err:##########'+err);
						callback({errno: 40000,result:false, errmsg: err}, conn);
		    		}else{
		    			var shortDays = shortDaysRows[0].pwd_short_save_days;
		    			if(shortDays==0){
		    				callback(null, conn);
		    			}else{
		    				var passwordModifyDay=sd.format(new Date(rows[0].password_modify_time), 'YYYY-MM-DD HH:mm:ss');
		    				var time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
		    				var usedDays = (time.getTime() - passwordModifyDay.getTime())/1000/60/60/24;
		    				if(usedDays < shortDays){
		    					callback({errno: 40000,result:false, errmsg: 'You change the password time interval in less than password strategy shortest days.'}, conn);
		    				}else{
		    					callback(null, conn);
		    				}

		    			}
			
		    		}
	    		});
	    	}    	
	    },

	    function(conn, callback) {
	    	try{
	    		if(newPassword!=affirmPassword){
		    		console.log('###########您输入的确认密码不符，请重新输入！#########');
					callback({errno: 40032,result:false, errmsg: 'the password you entered is not consistent with the confirmation password, please re-enter'}, conn);
	    		}else{
	    			 var sql = 'select * from sec_pwd_strategy';
		   			 conn.query(sql, function(err, rows, fields) {
		   		 		if(err){
		   		 			console.log('##########getPasswordStrategyValue is err:##########'+err);
							callback({errno: 40000,result:false, errmsg: err}, conn);
		   		 		}else{
		   		 			//校验密码最小长度
		   		 			var size = newPassword.length;
		   		 			if(userName=='administrator'){
		   		 				var min = rows[0].admin_pwd_minilength;
		   		 				if(size < min){
		   		 					console.log('##########超级密码长度小于规定的最小长度值:##########');
									callback({errno: 40038,result:false, errmsg: 'the length of password is less than the specified minimum length'}, conn);
		   		 				}else{
		   		 					console.log('##########go to next 密码长度大于规定的最大长度值##########');
									callback(null,conn,rows);
		   		 				}

		   		 			}else {
		   		 				var min = rows[0].user_pwd_minilength;
		   		 				if(size < min){
		   		 					console.log('##########密码长度小于规定的最小长度值:##########');
									callback({errno: 40038,result:false, errmsg: 'the length of password is less than the specified minimum length'}, conn);
		   		 				}else{
		   		 					console.log('##########go to next 密码长度大于规定的最大长度值##########');
									callback(null,conn,rows);
		   		 				}
		   		 			}		 			   		 			
		   		 			
		   		 		}
		    	 });
	    	}	
	    	}catch(err){
	    		console.log('##########getPasswordStrategyValue is err:##########'+err);
				callback({errno: 40000,result:false, errmsg: err}, conn);
	    	}    		   
	    },

	    function(conn,rows,callback){
	    	var size = newPassword.length;
	    	if(size>rows[0].pwd_maxlength){
 				console.log('##########密码长度大于规定的最大长度值##########');
				callback({errno: 40039,result:false, errmsg: 'the length of password is greater than the specified max length'}, conn);

 			}else{
 				console.log('##########go to next 密码中字母的最少个数##########');
				callback(null,conn,rows);
 			}
	    },

	    function(conn,rows,callback){
			if((rows[0].pwd_letter_minimum_num!=null)&&(rows[0].pwd_letter_minimum_num>0)){		   		 
		   		var num = getCharNum(newPassword);
 				console.log('##########'+num+'##########');
 				if(num<rows[0].pwd_letter_minimum_num){
 					console.log('##########密码中字母的最少个数'+num<rows[0].pwd_letter_minimum_num+'##########');
					callback({errno: 40041,result:false, errmsg: 'the minimum number of letters in the password should be:', num:rows[0].pwd_letter_minimum_num}, conn);
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
		   		var num = getCapCharNum(newPassword);
 				console.log('##########'+num+'##########');
 				if(num<rows[0].pwd_uppercase_minimum_num){
 					console.log('##########密码中大写字母的最少个数'+rows[0].pwd_uppercase_minimum_num+'##########');
					callback({errno: 40042,result:false, errmsg: 'the minimum number of capital letters in the password', num:rows[0].pwd_uppercase_minimum_num}, conn);
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
 				var num = getLowCharNum(newPassword);
 				console.log('##########'+num+'##########');
 				if(num<rows[0].pwd_lowercase_minimum_num){
 					console.log('##########密码中小写字母的最少个数'+rows[0].pwd_lowercase_minimum_num+'##########');
					callback({errno: 40043,result:false, errmsg: 'the minimum number of lowercase letters in the password', num:rows[0].pwd_lowercase_minimum_num}, conn);
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
 				var specialCount = getSpecilCharNum(newPassword,rows[0].pwd_special_char_minimum_num);
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
		   		var num = getNumNum(newPassword);
 				console.log('num##########'+num+'##########');
 				if(num<rows[0].pwd_number_minimum_num){
 					console.log('##########密码中数字的最少个数'+rows[0].pwd_number_minimum_num+'##########');
					callback({errno: 40044,result:false, errmsg: 'the minimum number of digits in the password', num:rows[0].pwd_number_minimum_num}, conn);
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
				var t = newPassword.indexOf(userName);
				if(t>-1){
					console.log('##########不能包含完整用户名##########');
					callback({errno: 40046,result:false, errmsg: 'cannot  include the full user name'}, conn);
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
						var n = newPassword.indexOf(child);
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
						callback({errno: 40047,result:false, errmsg: 'cannot contain the number of connection characters in the user name:', num:charnum}, conn);

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
				if(userName.length!=newPassword.length){
					console.log('##########go to next 密码中不能有4个或4个以上的重复字符##########');
					callback(null,conn,rows);

				}else{
					var name =userName.split('').reverse().join('');
					if(name==newPassword){
						console.log('##########密码不能是用户名的倒序排列##########');
						callback({errno: 40037,result:false, errmsg: 'the password cannot be a reverse order of the user name'}, conn);
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
					var child = newPassword.substring(i, (i + 4));
					if (child.length < 4) {// 说明没有连续重复字符
						iscontinue = false;
					} else {//
						var b = child.split('');
						if (b[0] == b[1] && b[0] == b[2] && b[0] == b[3]) {
							iscontinue = false;
							isHave = true;// 有四个以上连续重复字符
						} else {
							i++;
							if (i > newPassword.length-4) {
								iscontinue = false;
							}
						}

					}
				}
				if(isHave){
					console.log('##########密码中不能有4个或4个以上的重复字符##########');
					callback({errno: 40036,result:false, errmsg: 'can not contain four or more duplicates in the password'}, conn);
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
				var record=newPassword.split('');
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
					callback({errno: 40035,result:false, errmsg: 'the password cannot be a sequence of increments of Numbers or letters'}, conn);
					
				}
			}else{
				console.log('##########go to next 密码不能包含完整的密码字典中的词汇##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var  noWorkBook = rows[0].pwd_no_workbook;
			if(noWorkBook==1){
				if(verifyPasswordDictionary()==false){
					console.log('##########密码不能包含完整的密码字典中的词汇##########');
					callback({errno: 40034,result:false, errmsg: 'the password cannot contain a full password dictionary word'}, conn);

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
						callback({errno: 40000,result:false, errmsg: err}, conn);
					}else{
						for(var i in rows1){
							all[i]=rows1[i].user_password;
						}
						if(containsStr(all,md5(newPassword))==true){
							console.log('##########密码与前三次相同##########');
							callback({errno: 40100,result:false, errmsg: 'the password is the same as the previous three times, please re-enter'}, conn);
						}else{
							var sql1 = "insert into sec_user_password_history (user_name,user_password) values ('"+userName+"','"+md5(newPassword)+"')";
							conn.query(sql1, function(err, result){
								if(err){
									console.log('##########插入sec_user_password_history数据库出错##########');
									callback({errno: 40101,result:false, errmsg: 'error inserting the sec_user_password_history database'}, conn);
								}else{
									console.log(result);
									console.log('########## go to 修改的密码入库##########');
									callback(null,conn,rows);
								}
							});
						}
					}

				});
			}else{
				console.log('##########修改的密码入库##########');
				callback(null,conn,rows);
			}
		},

		function(conn,rows,callback){
			var sql = "update sec_user set user_password = '"+md5(newPassword)+"' where sec_user_id = "+userId;
			conn.query(sql, function(err, rows1, fields) {
				if(err){
					console.log('##########更新密码字段出错##########'+err);
					callback({errno: 40000,result:false, errmsg: err}, conn);
				}else{
					console.log('##########go to  the next：更新pw_expired_date##########');
					callback(null,conn,rows);
				}
			});	

		},

		function(conn,rows,callback){			
			var sql1 = "select password_valid_days  from v_sec_user_and_strategy where sec_user_id ="+userId;
			console.log('sql1**********'+sql1);
			conn.query(sql1, function(err, rows1, fields) {
				if(err){
					console.log('##########查询sec_uer is err:##########'+err);
					callback({errno: 40000,result:false, errmsg: err}, conn);
				}else{
					var dataTime = getPasswordValidData(rows1[0].password_valid_days);
					var sql2 = "update sec_user set pw_expired_date = '"+ dataTime+"'where sec_user_id ="+userId;
					console.log('###########sql:'+sql2);
					conn.query(sql2, function(err, result) {
						if(err){
							console.log('##########更新pw_expired_date入库出错##########');
							callback({errno: 40101,result:false, errmsg: err}, conn);
						}else{
							console.log('##########go to  the next： change_password_next_login##########');
							callback(null,conn,rows);
						}
					});
				}

			});
		},
	], 
	
	function (err, conn, rows) {
        conn.release();
		if (err) {
			console.log('##err.result##:'+err.result);
			var task = {
				account:userName,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
				result:1,//结果0:成功;1:失败
				operateContent:T.__('Reset')+userName+T.__('User password operation failed, reason:')+T.__(err.errmsg),//日志内容
			}
			common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
	  		res.json(200, {
	  			success: false,
	  			errno: err.errno,
	  			msg: err.errmsg,
	  			num: err.num
	  		});  
		} else {
		    console.log('##########game over##########');
		    var task = {
				account:userName,//登录用户名称
				level:0,//日志上报级别
				operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
				result:0,//结果0:成功;1:失败
				operateContent:T.__('Reset')+userName+T.__('User password operation is successful'),//日志内容
			}
			common.logSecurity_waterfall(amqp,'logs_safe_queue',task);//记录安全日志
	  		res.json(200, {
	  			success: true,
	  			msg: 'Reset password successfully'
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
module.exports = router;
