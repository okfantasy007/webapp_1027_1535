var express = require('express');
var router = express.Router();

// 使用多层路由
// router.use('/demo', require('./web/web_level2demo'));
// router.use('/test', require('./web/security'));
router.use('/add_user', require('./web/addUser'));
router.use('/sec_usergrid', require('./web/loadSecUser'));
router.use('/reset_pwd', require('./web/resetPwd'));
// router.use('/nms_login', require('./web/nmsLogin'));
router.use('/controlList', require('./web/AclControl'));
router.use('/usergroup', require('./web/UsergroupControl'));
router.use('/del_user', require('./web/delUser'));
router.use('/unlock_user', require('./web/unlockUser'));
router.use('/init_split_tree', require('./web/initSplitTree'));
router.use('/userOfusergroupLoad', require('./web/userOfusergroupLoad'));
router.use('/user_info_modify', require('./web/user_info_modify'));
router.use('/user_genericinfo_modify', require('./web/user_genericinfo_modify'));
router.use('/user_acl_modify', require('./web/user_acl_modify'));
router.use('/userOfusergroup_modify', require('./web/userOfusergroupModify'));
// router.use('/init_user_buffer', require('./web/initSecurityBuffer'));
router.use('/load_online_user', require('./web/loadOnlineUser'));


router.use('/security_strategy', require('./web/security_strategy'));
router.use('/security_group', require('./web/security_group'));
router.use('/security_operset', require('./web/security_operset'));
router.use('/security_control', require('./web/security_control'));

router.use('/usergroup', require('./web/UsergroupControl'));
router.use('/del_user', require('./web/delUser'));
router.use('/unlock_user', require('./web/unlockUser'));
router.use('/init_split_tree', require('./web/initSplitTree'));
router.use('/modify_password', require('./web/modifyPwd'));

router.use('/test', require('./web/security'));
module.exports = router;
