var express = require('express');
var router = express.Router();

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

module.exports = router;