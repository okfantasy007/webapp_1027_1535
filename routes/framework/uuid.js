var express = require('express');
var router = express.Router();
const uuid = require('uuid/v1');

router.get('/rest', function(req, res, next) {
    res.json(200, {success: true, 'uuid': uuid()});  
})

router.get('/all', function(req, res, next) {

	APP.sessionStore.all(function(error, sessions){
		console.log(error, sessions);
	})

	res.json(200, {
		success: true,
		msg: 'oper success'
	});  
    
});

module.exports = router;