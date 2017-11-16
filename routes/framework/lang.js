var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	// log.debug('switching lang to', req.body.lang);
	req.app.locals.lang = req.body.lang;

    // 全局使用i18n
    // console.log(T.getLocale());
    // T.setLocale(req.app.locals.lang);
    // console.log(T.getLocale());
    // console.log(T.__('Hello'));

    // 模块内使用i18n
    // console.log("-------------------------------->>",req.getLocale());
    // req.setLocale(req.app.locals.lang);
    // console.log(req.getLocale());
    // console.log(req.__('Hello'));

	res.json(200, {success: true});  
});

router.get('/get_i18n_dict', function(req, res, next) {
	// req.setLocale(req.query.lang);
	res.json(200, {
		success: true,
		lang: req.app.locals.lang,
		dict: req.getCatalog()
	});  
});

module.exports = router;