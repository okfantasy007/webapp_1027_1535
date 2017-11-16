var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/demo', 			require('./web/web_level2demo'));
router.use('/', 				require('./web/web_repairexp'));
router.use('/alarm_sync',		require('./web/alarm_sync'));
router.use('/alarm_sync_topo_tree',		require('./web/alarm_sync_topo_tree'));


module.exports = router;
