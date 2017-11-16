var express = require('express');
var http = require('http'); 
var request = require('request');
var router = express.Router();
var sd = require('silly-datetime');
var md5 = require('md5');
var amqp = require('amqplib/callback_api');
var common = require('../security/rest/common.js');

router.post('/', function(req, res, next) {
    
    req.app.locals.user = req.body.user;
    req.app.locals.password = req.body.password;

       
    var data = {  
        userName: req.body.user,  
        password: req.body.password,
        clientIp: req.ip.split(':').reverse()[0]
        
    };  
    data = require('querystring').stringify(data);  
    console.log(data); 

    var request = http.request( 
        {  
            host: 'localhost',  
            port: req.app.get('port'),  
            method: "POST",                 
            path: '/login_verify',
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
                                req.session.user = req.body.user;
                                // req.session.success = 'Authenticated as ' + req.body.user;
                                // req.session.ip_address=req.headers['x-forwarded-for'] ||
                                //                         req.ip ||
                                //                         req.connection.remoteAddress ||
                                //                         req.socket.remoteAddress ||
                                //                         req.connection.socket.remoteAddress || '';
                                req.session.ip_address=req.ip.split(':').reverse()[0];
                                req.session.login_time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                                req.session.host_name=req.hostname;
                                req.session.user_desc='login success';
                                req.session.screen_locked=false;
                                req.session.security_buffer = resultBody.data;

                                var task = {
                                    sessionID:req.sessionID,//用户sessionID
                                    account:req.body.user,//登录用户名称
                                    type:0,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
                                    level:0,//日志上报级别
                                    operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
                                    result:0,//结果0:成功;1:失败
                                    operateContent:T.__("Landing system success"),//日志内容
                                }
                                common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志

                                res.json(200, {success: true, 'url': req.app.locals.area });    
                            } else{

                                var task = {
                                    sessionID:req.sessionID,//用户sessionID
                                    account:req.body.user,//登录用户名称
                                    type:0,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
                                    level:0,//日志上报级别
                                    operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
                                    result:1,//结果0:成功;1:失败
                                    operateContent:T.__("Landing system failure")+':'+T.__(resultBody.msg),//日志内容
                                }
                                common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志

                                res.json(200, {success: false, 'msg': resultBody.msg,'errno':resultBody.errno,'id':resultBody.id});  
                            }                 
                       })          
            }else{
                var task = {
                    sessionID:req.sessionID,//用户sessionID
                    account:req.body.user,//登录用户名称
                    type:0,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
                    level:0,//日志上报级别
                    operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
                    result:1,//结果0:成功;1:失败
                    operateContent:T.__("Landing system failure")+':'+T.__(unknow),//日志内容
                }
                common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志
                res.json(request.statusCode, {success: false, 'msg': 'unknow'});  
            }
        } 

    );  
    request.write(data);  
    request.end();  
});

router.post('/lockscreen', function(req, res, next) {
    console.log(req.body);
    req.session.screen_locked = true;
    res.json(200, {
        success: true, 
        msg: 'lock screen success'
    });
});

router.post('/unlockscreen', function(req, res, next) {
    // console.log(req.body);
    async function modifyUseOfUsergroup(user,pwd){
        var conn = null;
        try{
            
            if(!req.session.user){
                console.log('jjjjjjjjjjjjjjjjjj');
                req.app.locals.user = req.body.user;
                req.app.locals.password = req.body.password;
  
                var data = {  
                    userName: req.body.user,  
                    password: req.body.password,
                    clientIp: req.ip.split(':').reverse()[0]
                    
                };  
                data = require('querystring').stringify(data);  
                console.log(data); 

                var request = http.request( 
                    {  
                        host: 'localhost',  
                        port: req.app.get('port'),  
                        method: "POST",                 
                        path: '/login_verify',
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
                                            req.session.user = req.body.user;
                                            // req.session.success = 'Authenticated as ' + req.body.user;
                                            // req.session.ip_address=req.headers['x-forwarded-for'] ||
                                            //                         req.ip ||
                                            //                         req.connection.remoteAddress ||
                                            //                         req.socket.remoteAddress ||
                                            //                         req.connection.socket.remoteAddress || '';
                                            req.session.ip_address=req.ip.split(':').reverse()[0];
                                            req.session.login_time=sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                                            req.session.host_name=req.hostname;
                                            req.session.user_desc='login success';
                                            req.session.screen_locked=false;
                                            req.session.security_buffer = resultBody.data;

                                            var task = {
                                                sessionID:req.sessionID,//用户sessionID
                                                account:req.body.user,//登录用户名称
                                                type:0,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
                                                level:0,//日志上报级别
                                                operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
                                                result:0,//结果0:成功;1:失败
                                                operateContent:T.__("Landing system success"),//日志内容
                                            }
                                            common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志

                                            res.json(200, {success: true, 'url': req.app.locals.area });    
                                        } else{

                                            var task = {
                                                sessionID:req.sessionID,//用户sessionID
                                                account:req.body.user,//登录用户名称
                                                type:0,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
                                                level:0,//日志上报级别
                                                operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
                                                result:1,//结果0:成功;1:失败
                                                operateContent:T.__("Landing system failure")+':'+T.__(resultBody.msg),//日志内容
                                            }
                                            common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志

                                            res.json(200, {success: false, 'msg': resultBody.msg,'errno':resultBody.errno});  
                                        }                 
                                   })          
                        }else{
                            var task = {
                                sessionID:req.sessionID,//用户sessionID
                                account:req.body.user,//登录用户名称
                                type:0,//登录类型 0 登录 1 正常退出2 超时退出3 强制退出
                                level:0,//日志上报级别
                                operateTerminal:req.ip.split(':').reverse()[0],//操作用户所在客户端的对外IP
                                result:1,//结果0:成功;1:失败
                                operateContent:T.__("Landing system failure")+':'+T.__(unknow),//日志内容
                            }
                            common.logSecurity_waterfall(amqp,'logs_login_queue',task);//记录安全日志
                            res.json(request.statusCode, {success: false, 'msg': 'unknow'});  
                        }
                    } 

                );  
                request.write(data);  
                request.end(); 
            }else{
                var sql = "select count(*) as count from sec_user where user_name = '"+user+"' and user_password = '"+md5(pwd)+"'";
                // console.log(sql);
                var conn = await APP.dbpool_promise.getConnection();
                var rows = await conn.query(sql);
                await APP.dbpool_promise.releaseConnection(conn);
                if(rows[0].count>0){
                    req.session.screen_locked = false;
                    res.json(200, {
                        success: true, 
                        msg: 'Unlock Success'
                    });
                }else{
                    res.json(200, {
                        success: false, 
                        msg: 'Unlock Failure'
                    }); 
                }

            }
            
        }catch(err){
           
            return false;
        }
    }

    modifyUseOfUsergroup(req.body.user,req.body.password);
});



module.exports = router;