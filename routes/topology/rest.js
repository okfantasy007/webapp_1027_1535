var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/demo', require('./rest/rest_level2demo'));
router.use('/addDevice', require('./rest/rest_addDevice'));
router.use('/topo_tree_status', require('./rest/topo_tree_status'));
router.use('/', require('./rest/rest_topo'));

module.exports = router;
