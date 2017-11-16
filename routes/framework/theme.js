var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	log.debug('switching theme to', req.body.theme);
	req.app.locals.theme = req.body.theme;
	res.json(200, {success: true});  
});

module.exports = router;