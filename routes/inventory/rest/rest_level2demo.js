var express = require('express');
var router = express.Router();

// ======================= 实现一个rest CRUD操作 =======================
var users = {
    "1": {
        user_name: "admin",
        user_type: 0
    },
    "2": {
        user_name: "guest",
        user_type: 1
    }
};

router.route('/')
    .get(function(req, res, next) {
        // res.send('list all users!');
        // console.log( req );
        console.log( req.headers );
  		res.json(200, {success: true, 'data': users });  
    })
    .post(function(req, res, next) {
   		var newid = Object.getOwnPropertyNames(users).length + 1;
        users[ newid.toString() ] = req.body;
  		res.json(200, {success: true, 'id': newid });  
    });

router.route('/:id')
    .get(function(req, res, next) {
        var id = req.params.id;
        console.log( users[id] );
        // res.send('get info from user ' + users[id].user_name);
  		res.json(200, {success: true, 'id': id, 'data': users[id] });  
    })
    .put(function(req, res, next) {
        var id = req.params.id;
        users[ id ] = req.body;
  		res.json(200, {success: true, 'id': id, 'data': users[id] });  
    })
    .delete(function(req, res, next) {
        var id = req.params.id;
        delete users[ id ];
  		res.json(200, {success: true, 'id': id });  
    });


var operation_log_api = function(username, type, operateName, operateContent) {
    log.info('modifyMore received param: ', neid, poll_enabled, poll_interval, poll_protocol);
    var data = {  
        username: username
    }; 
    data = require('querystring').stringify(data);
    var request = http.request( 
        {  
            host: 'localhost',  
            // port: req.app.get('port'),  
            port: '3000',  
            method: "POST",                 
            path: '/syslog/api/log/v1/oplog',
            headers: { 
                "Content-Type": 'application/x-www-form-urlencoded',  
                'Content-Length' : data.length
            }                              
        },
        function(response) {
            if(response.statusCode=='200'){
                var body = ""; 
                var resultBody; 
                response.on('data', function (data) { body += data;})  
                    .on('end', function () { 
                        resultBody = JSON.parse(body);
                        if(resultBody.success== true){
                            console.log("causeid:",resultBody.causeid);
                            res.json(200, {
                                success: true,
                                causeid: resultBody.causeid,
                                cause: resultBody.cause
                            });
                        } 
                        else{
                            res.json(400, {
                                success: false,
                                causeid: resultBody.causeid,
                                cause: resultBody.cause
                            });
                        }                 
                   })          
            }else {
                res.json(400, {
                    success: false,
                    causeid: 400,
                    cause: "日志记录无法建立连接"
                });
            }
        } 
    );  
    request.write(data);  
    request.end();
}




module.exports = router;
module.operation_log_api = operation_log_api;
