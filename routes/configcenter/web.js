var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/demo', require('./web/web_level2demo'));
router.use('/equipmentUpdate', require('./web/equipmentUpdate'));
router.use('/equipmentUpdateMession', require('./web/equipmentUpdateMession'));
router.use('/dataBackupStrategy', require('./web/dataBackupStrategy'));

module.exports = router;
