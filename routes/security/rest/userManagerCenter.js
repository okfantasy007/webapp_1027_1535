var express = require('express');
var router = express.Router();
var async = require('async');


// ======================= 实现一个rest CRUD操作 =======================

router.route('/user_name')
    .get(function(req, res, next) {
        console.log('&&&&&&&',req.session.user);
    	console.log('&&&&&&&',req.sessionID);
  		res.json(200, {success: true, 'user_name': req.session.user });  
    })
    .post(function(req, res, next) {
    	console.log('&&&&&&&',req.session.user);
    	console.log('&&&&&&&',req.sessionID);
  		res.json(200, {success: true, 'user_name': req.session.user });  
    });

router.route('/id')
    .get(function(req, res, next) {
        async function getUserId(){
            // var user_buffer = APP.securityManagerCenter[req.query.user];
            var user_buffer = await getSecurityBufferByUser(req.query.user); 
            if(typeof(user_buffer)!='undefined'){
                var sec_user_id = user_buffer.sec_user_id;
                if(typeof(sec_user_id)!='undefined'){
                    console.log('jjjjjjjj',sec_user_id);
                    res.json(200, {success: true,  'id': sec_user_id }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'id': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1016, cause:'unkonw err'});
            }
        }

        getUserId();

    
    })
    .post(function(req, res, next) {

        async function getUserId(){
            // var user_buffer = APP.securityManagerCenter[req.query.user];
            var user_buffer = await getSecurityBufferByUser(req.body.user); 
            if(typeof(user_buffer)!='undefined'){
                var sec_user_id = user_buffer.sec_user_id;
                if(typeof(sec_user_id)!='undefined'){
                    console.log('jjjjjjjj',sec_user_id);
                    res.json(200, {success: true,  'id': sec_user_id }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'id': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1016, cause:'unkonw err'});
            }
        }

        getUserId();
    });
    
router.route('/is_admin')
    .get(function(req, res, next) {
         async function getUserIsAdmin(){
             // var user_buffer = APP.securityManagerCenter[req.body.user];
            var user_buffer = await getSecurityBufferByUser(req.query.user); 
            if(typeof(user_buffer)!='undefined'){
                var is_admin = user_buffer.is_admin;
                if(typeof(is_admin)!='undefined'){
                    console.log('jjjjjjjj',is_admin);
                    res.json(200, {success: true,  'is_admin': is_admin }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'msg': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1017, cause:'unkonw err'});
            }

        }
       
        getUserIsAdmin();
    })
    .post(function(req, res, next) {
        async function getUserIsAdmin(){
             // var user_buffer = APP.securityManagerCenter[req.body.user];
            var user_buffer = await getSecurityBufferByUser(req.body.user); 
            if(typeof(user_buffer)!='undefined'){
                var is_admin = user_buffer.is_admin;
                if(typeof(is_admin)!='undefined'){
                    console.log('jjjjjjjj',is_admin);
                    res.json(200, {success: true,  'is_admin': is_admin }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'msg': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1017, cause:'unkonw err'});
            }

        }
       
        getUserIsAdmin();		 
    });

router.route('/get_user_info')
    .get(function(req, res, next) {
      async function getUserInfo(){
            // var user_buffer = APP.securityManagerCenter[req.body.user];
            var user_buffer = await getSecurityBufferByUser(req.query.user); 
            if(typeof(user_buffer)!='undefined'){
                var user_info = user_buffer.info;
                if(typeof(user_info)!='undefined'){
                    console.log('jjjjjjjj',user_info);
                    res.json(200, {success: true,  'user_info': user_info }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'user_info': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1018, cause:'unkonw err'});
            }

        }
        getUserInfo();
           
    })
    .post(function(req, res, next) {
        async function getUserInfo(){
            // var user_buffer = APP.securityManagerCenter[req.body.user];
            var user_buffer = await getSecurityBufferByUser(req.body.user); 
            if(typeof(user_buffer)!='undefined'){
                var user_info = user_buffer.info;
                if(typeof(user_info)!='undefined'){
                    console.log('jjjjjjjj',user_info);
                    res.json(200, {success: true,  'user_info': user_info }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'user_info': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1018, cause:'unkonw err'});
            }

        }
        getUserInfo();
        
    });

router.route('/is_admin_usergroup')
    .get(function(req, res, next) {
        async function getUserIsAdminGroup(){
             // var user_buffer = APP.securityManagerCenter[req.body.user];
            var user_buffer = await getSecurityBufferByUser(req.query.user); 
            if(typeof(user_buffer)!='undefined'){
                var is_admin_usergroup = user_buffer.is_admin_usergroup;
                if(typeof(is_admin_usergroup)!='undefined'){
                    console.log('jjjjjjjj',is_admin_usergroup);
                    res.json(200, {success: true,  'is_admin_usergroup': is_admin_usergroup }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'is_admin_usergroup': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1019, cause:'unkonw err'});
            }

        }
       getUserIsAdminGroup();
    })
    .post(function(req, res, next) {
        async function getUserIsAdminGroup(){
             // var user_buffer = APP.securityManagerCenter[req.body.user];
            var user_buffer = await getSecurityBufferByUser(req.body.user); 
            if(typeof(user_buffer)!='undefined'){
                var is_admin_usergroup = user_buffer.is_admin_usergroup;
                if(typeof(is_admin_usergroup)!='undefined'){
                    console.log('jjjjjjjj',is_admin_usergroup);
                    res.json(200, {success: true,  'is_admin_usergroup': is_admin_usergroup }); 
                }      

            }else{
                console.log('dddddd');
                // res.json(200, {success: false,  'is_admin_usergroup': 'unkonw err' }); 
                res.json(500, {success: false, causeid:1019, cause:'unkonw err'});
            }

        }
       getUserIsAdminGroup();
        
    });

router.route('/get_loginmode')
    .get(function(req, res, next) {
        async function getUserloginmode(){
            try{
                var user = req.query.user;
                var conn = await APP.dbpool_promise.getConnection();
                var sql = "select * from res_sys_properties where property_name = 'sec_loginmode'";
                var result = await conn.query(sql);
                if(!typeof(result[0])!='undefined'){
                    res.json(200, {success: true,  'loginmode': result[0].value }); 
                }else{
                    res.json(200, {success: true,  'loginmode': null }); 
                }
            }catch(err){
                console.log('########err########',err);
                APP.dbpool_promise.releaseConnection(conn);  

            }
        }
       getUserloginmode();   
    })
    .post(function(req, res, next) {
        async function getUserloginmode(){
            try{
                var user = req.body.user;
                var conn = await APP.dbpool_promise.getConnection();
                var sql = "select * from res_sys_properties where property_name = 'sec_loginmode'";
                var result = await conn.query(sql);
                if(!typeof(result[0])!='undefined'){
                    res.json(200, {success: true,  'loginmode': result[0].value }); 
                }else{
                    res.json(200, {success: true,  'loginmode': null }); 
                }
            }catch(err){
                console.log('########err########',err);
                APP.dbpool_promise.releaseConnection(conn);  

            }
        }
       getUserloginmode();      
    });


function getSecurityBufferByUser( user){
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
