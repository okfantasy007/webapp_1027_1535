var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/demo', 			require('./web/web_level2demo'));
router.use('/process', 			require('./web/process'));
router.use('/upload', 			require('./web/upload'));
router.use('/chartTest', 		require('./web/chartTest'));

module.exports = router;
