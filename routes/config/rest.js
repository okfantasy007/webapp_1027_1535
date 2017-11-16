var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/sdn/elinetopo', require('./sdn/elineTopo'));

module.exports = router;