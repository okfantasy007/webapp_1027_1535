var express = require('express');
var router = express.Router();

// 使用多层路由
// router.use('/demo', 			require('./web/web_level2demo'));
router.use('/', 			require('./web/webtype_rest_api'));
router.use('/', 			require('./web/web_operation'));
router.use('/devicepanel', 	require('./web/web_sdn_inventory'));
router.use('/menu', 	    require('./web/web_ne_config'));

module.exports = router;
