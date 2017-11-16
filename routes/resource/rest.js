var express = require('express');
var router = express.Router();

router.use('/ne_sync', require('./rest/ne_sync'));
router.use('/polling', require('./rest/polling'));
router.use('/discovery_onadd', require('./rest/discovery_onadd'));

module.exports = router;
