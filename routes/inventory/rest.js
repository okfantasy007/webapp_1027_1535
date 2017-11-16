var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/demo', require('./rest/rest_level2demo'));
router.use('/', require('./rest/opeartion_res_add'));
router.use('/', require('./rest/opeartion_res'));

module.exports = router;
