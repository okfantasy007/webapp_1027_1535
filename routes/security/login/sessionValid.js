var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.json(200, {
		success: true,
		session_valid: req.session.user != undefined
	}); 
});

module.exports = router;
