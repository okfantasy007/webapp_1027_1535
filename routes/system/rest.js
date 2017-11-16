var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/demo', require('./rest/rest_level2demo'));

module.exports = router;
