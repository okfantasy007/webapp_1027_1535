var express = require('express');
var router = express.Router();

// 使用多层路由
router.use('/layout', 						require('./web/layout'));
router.use('/background', 					require('./web/background'));
router.use('/topo_nodeorlink_info', 		require('./web/topo_nodeorlink_info'));

router.use('/topo_tree', 					require('./web/topo_tree'));
router.use('/topo_map', 					require('./web/topo_map'));

router.use('/topo_subnet', 					require('./web/topo_subnet'));
router.use('/topo_node', 					require('./web/topo_node'));
router.use('/topo_link', 					require('./web/topo_link'));

router.use('/device_view', 					require('./web/device_view'));

router.use('/topo_view', 					require('./web/topo_view'));
router.use('/band',                         require('./web/topo_band'));
module.exports = router;
