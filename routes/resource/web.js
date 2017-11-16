var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/discovery_template', 		require('./web/discovery_template'));
router.use('/discovery_task', 			require('./web/discovery_task'));
router.use('/filter', 					require('./web/filter'));
router.use('/polling_task', 			require('./web/polling_task'));
router.use('/syn_group_task', 			require('./web/syn_group_task'));
router.use('/syn_task',					require('./web/syn_task'));
router.use('/sync_state',				require('./web/sync_state'));

module.exports = router;
