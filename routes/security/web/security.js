var express = require('express');
var router = express.Router();
var async = require('async');

//获取安全策略信息
router.get("/strategy", function (req, res, next) {
    console.log('222222222222222222222')
});

//更新安全策略信息路由
router.post("/strategy/update", function (req, res, next) {
    //获取请求参数
    console.log('111111111111111111111111');
    var params = req.body;
    console.log(params);
});

router.get("/controlList", function (req, res, next) {
    console.log('333333333333');
    res.json(200, {
        'root': [{
            'ip_range': '0.0.0.0~255.255.255.255',
            'limit_desc': 'aaaaaaa',
            'ip_limit_type': 2,
            'ip_range_from': '0.0.0.0',
            'ip_range_to': '255.255.255.255',
            'id': 1
        },
        {
            'ip_range': '0.0.0.0/255.255.255.255',
            'limit_desc': 'aaaaaaa',
            'ip_limit_type': 1,
            'ip_range_from': '0.0.0.0',
            'ip_range_to': '255.255.255.255',
            'id': 2
        }]
    })
});
router.post("/strategy/controlList", function (req, res, next) {
    //获取请求参数
    console.log('4444444444444444444');
    var params = req.body;
    console.log(params);
});

router.get("/usergrid", function (req, res, next) {
    console.log('55555555555555555');
    res.json(200, {
        'root': [{
            'sec_user_id': '1',
            'user_name': 'aaaaaaa',
            'user_type': 1,
            'full_name': '0.0.0.0',
            'lock_status': '255.255.255.255',
            'create_time': '',
            'user_desc': 'aaaaaaa'
        },
        {
            'sec_user_id': '2',
            'user_name': 'bbbbbbbb',
            'user_type': 2,
            'full_name': '0.0.0.0',
            'lock_status_str': '255.255.255.255',
            'create_time': '',
            'user_desc': 'aaaaaaa'
        }]
    })
});

router.get("/controlListGrid", function (req, res, next) {
    console.log('6666666666666666');
    res.json(200, {
        'root': [{
            'sec_user_id': 1,
            'ip_range': '0.0.0.0~255.255.255.255',
            'limit_desc': 'aaaaaa',
            'checked': 1
        },
        {
            'sec_user_id': 2,
            'ip_range': '1.0.0.0~255.255.255.255',
            'limit_desc': 'bbbbbbbb',
            'checked': 1
        },
        {
            'sec_user_id': 3,
            'ip_range': '1.0.0.0~255.255.255.255',
            'limit_desc': 'bbbbbbbb',
            'checked': 1
        }]
    })
});

router.post("/usergroup", function (req, res, next) {
    //获取请求参数
    console.log('7777777777777777');
    var params = req.body;
    console.log(params);
});
router.post("/usertab", function (req, res, next) {
    //获取请求参数
    console.log('88888888888888');
    var param = req.body;
    var ll = req.params;
    console.log(param);
    res.json(200, { failure: true, msg: '2222' });
});

router.get("/southGrid", function (req, res, next) {
    console.log('000000000000000000');
    console.log(req.query.user_type);
    if (req.query.user_type == 1) {
        res.json(200, {
            'root': [{
                'sec_usergroup_id': '1',
                'sec_usergroup_name': 'aaaaaaa',
                'sec_usergroup_type_str': 1,
                'sec_usergroup_fullname': '0.0.0.0',
                'enable_status_str': '255.255.255.255',
                'create_time': 1,
                'sec_usergroup_desc': 'aaaaaaa'
            },
            {
                'sec_usergroup_id': '2',
                'sec_usergroup_name': 'bbbbbbbb',
                'sec_usergroup_type_str': 2,
                'sec_usergroup_fullname': '0.0.0.0',
                'enable_status_str': '255.255.255.255',
                'create_time': 1,
                'sec_usergroup_desc': 'aaaaaaa'
            }]
        })
    } else {
        res.json(200, {
            'root': [{
                'sec_usergroup_id': '1',
                'sec_usergroup_name': 'xxxxxxxxx',
                'sec_usergroup_type_str': 1,
                'sec_usergroup_fullname': '0.0.0.0',
                'enable_status_str': '255.255.255.255',
                'create_time': 1,
                'sec_usergroup_desc': 'xxxxxxxxxxxxx'
            },
            {
                'sec_usergroup_id': '2',
                'sec_usergroup_name': 'vvvvvvvv',
                'sec_usergroup_type_str': 2,
                'sec_usergroup_fullname': '0.0.0.0',
                'enable_status_str': '255.255.255.255',
                'create_time': 1,
                'sec_usergroup_desc': 'aaaavvvvvvvaaa'
            }]
        })
    }
});
router.get("/centerGrid", function (req, res, next) {
    console.log('centerGrid');
    console.log(req.query.selectedId);
    if (req.query.selectedId == 1) {
        res.json(200, {
            'root': [{
                'sec_usergroup_id': '1',
                'sec_usergroup_name': 'xxxxxxxxx',
                'sec_usergroup_type_str': 1,
                'sec_usergroup_fullname': '0.0.0.0',
                'enable_status_str': '255.255.255.255',
                'create_time': 1,
                'sec_usergroup_desc': 'xxxxxxxxxxxxx'
            }]
        })
    } else {
        res.json(200, {
        })
    }
});
router.get('/tree', function (req, res, next) {
    console.log('1111122222222223333333333');
    res.json(200, {
        "children": [
            {
                "itemId": "security_menu_root",
                "text": "安全管理对象",
                "expanded": true,
                "children": [
                    {
                        "itemId": "security_user_view",
                        "text": "用户",
                        "expanded": true,
                        "children": [
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "administrator",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": null,
                                "create_time": "2011-12-26 18:58:07",
                                "last_login_date": "2016-06-03 13:49:22",
                                "id": "security_user_form,1",
                                "lock_date": null,
                                "end_time_per_day": null,
                                "user_type_str": "超级用户",
                                "fax": "",
                                "tel": "",
                                "end_date": null,
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "fff",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "administrator",
                                "time_period_flag": 0,
                                "ip_limit_mode": 1,
                                "sec_usergroup_id": 1,
                                "max_online_num": 0,
                                "begin_date": null,
                                "sec_user_id": 1,
                                "password_modify_time": "2011-12-26 18:58:07",
                                "e_mail": "",
                                "user_type": 0,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "administrator user",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_sec_user_id": 1,
                                "create_sec_user_id": 1,
                                "hierarchy": ",1,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "super_user_icon",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "test111",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 1,
                                "begin_time_per_day": "00:00:00",
                                "create_time": "2015-12-11 16:26:15",
                                "last_login_date": "2016-03-04 14:55:55",
                                "id": "security_user_form,2",
                                "lock_date": null,
                                "end_time_per_day": "23:59:59",
                                "user_type_str": "普通用户",
                                "fax": "456444444",
                                "tel": "123sssss",
                                "end_date": "2017-06-02",
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 0,
                                "dept": "2",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "12345633",
                                "user_name": "test111",
                                "time_period_flag": 1,
                                "ip_limit_mode": 1,
                                "sec_usergroup_id": 1874,
                                "max_online_num": 0,
                                "begin_date": "2016-05-19",
                                "sec_user_id": 2,
                                "password_modify_time": "2015-12-11 16:26:15",
                                "e_mail": "222222x@123.com",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 1,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "2",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "eeee",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_sec_user_id": 1873,
                                "create_sec_user_id": 1,
                                "hierarchy": ",1,1873,",
                                "offline_user_action": 1,
                                "sunday": 0,
                                "pw_expired_date": "2016-10-16 16:16:27",
                                "address": "xbm333333",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 10,
                                "text": "root123",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": "00:00:00",
                                "create_time": "2015-12-11 17:08:44",
                                "last_login_date": "2015-12-11 17:09:44",
                                "id": "security_user_form,1877",
                                "lock_date": null,
                                "end_time_per_day": "23:59:59",
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "",
                                "end_date": "2020-12-31",
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "ssssssss",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "root123",
                                "time_period_flag": 1,
                                "ip_limit_mode": 1,
                                "sec_usergroup_id": 1878,
                                "max_online_num": 30,
                                "begin_date": "2016-04-19",
                                "sec_sec_user_id": 1877,
                                "password_modify_time": "2015-12-11 17:08:44",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": false,
                                "full_name": "2",
                                "max_online_num_nolimit": false,
                                "password_valid_days": 0,
                                "user_desc": "",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_sec_user_id": 1877,
                                "create_sec_user_id": 1,
                                "hierarchy": ",1,1877,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "system123",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": "00:00:00",
                                "create_time": "2015-12-17 14:00:20",
                                "last_login_date": null,
                                "id": "security_user_form,1879",
                                "lock_date": null,
                                "end_time_per_day": "23:59:59",
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "",
                                "end_date": "2018-06-20",
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "system123",
                                "time_period_flag": 1,
                                "ip_limit_mode": 1,
                                "sec_usergroup_id": 1880,
                                "max_online_num": 0,
                                "begin_date": "2017-06-28",
                                "sec_sec_user_id": 1879,
                                "password_modify_time": "2015-12-17 14:00:19",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_sec_user_id": 1879,
                                "create_sec_user_id": 1877,
                                "hierarchy": ",1,1877,1879,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "epon123",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": "00:00:00",
                                "create_time": "2015-12-17 16:23:31",
                                "last_login_date": "2016-05-16 10:05:09",
                                "id": "security_user_form,1883",
                                "lock_date": null,
                                "end_time_per_day": "23:59:59",
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "dddd",
                                "end_date": "2017-06-01",
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 0,
                                "dept": "fff",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "epon123",
                                "time_period_flag": 1,
                                "ip_limit_mode": 2,
                                "sec_usergroup_id": 1884,
                                "max_online_num": 0,
                                "begin_date": "2016-05-19",
                                "sec_sec_user_id": 1883,
                                "password_modify_time": "2015-12-17 16:23:31",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "sssssss",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "ddd",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_sec_user_id": 1883,
                                "create_sec_user_id": 1,
                                "hierarchy": ",1,1877,1883,",
                                "offline_user_action": 1,
                                "sunday": 0,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "alarm111",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": null,
                                "create_time": "2016-02-22 10:17:14",
                                "last_login_date": null,
                                "id": "security_user_form,1885",
                                "lock_date": null,
                                "end_time_per_day": null,
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "",
                                "end_date": null,
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "alarm111",
                                "time_period_flag": 0,
                                "ip_limit_mode": 2,
                                "sec_usergroup_id": 1886,
                                "max_online_num": 0,
                                "begin_date": null,
                                "sec_sec_user_id": 1885,
                                "password_modify_time": "2016-02-22 10:17:14",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "ddd",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_sec_user_id": 1885,
                                "create_sec_user_id": 1,
                                "hierarchy": ",1,1885,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "guest111",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": null,
                                "create_time": "2016-02-22 10:19:03",
                                "last_login_date": null,
                                "id": "security_user_form,1887",
                                "lock_date": null,
                                "end_time_per_day": null,
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "",
                                "end_date": null,
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "guest111",
                                "time_period_flag": 0,
                                "ip_limit_mode": 1,
                                "sec_usergroup_id": 1888,
                                "max_online_num": 0,
                                "begin_date": null,
                                "sec_user_id": 1887,
                                "password_modify_time": "2016-02-22 10:19:03",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "sss",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_user_id": 1887,
                                "create_user_id": 1,
                                "hierarchy": ",1,1887,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "abcdefg1",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": null,
                                "create_time": "2016-06-01 15:17:35",
                                "last_login_date": null,
                                "id": "security_user_form,1971",
                                "lock_date": null,
                                "end_time_per_day": null,
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "",
                                "end_date": null,
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "abcdefg1",
                                "time_period_flag": 0,
                                "ip_limit_mode": 1,
                                "sec_usergroup_id": 1972,
                                "max_online_num": 0,
                                "begin_date": null,
                                "sec_user_id": 1971,
                                "password_modify_time": "2016-06-01 15:17:35",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_user_id": 1971,
                                "create_user_id": 1,
                                "hierarchy": ",1,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            },
                            {
                                "offline_user_strategy_flag": 0,
                                "monday": 1,
                                "auto_exit_wait_time": 0,
                                "text": "dddfff",
                                "friday": 1,
                                "change_password_next_login": 0,
                                "cannot_change_password": 0,
                                "begin_time_per_day": null,
                                "create_time": "2016-06-03 09:22:05",
                                "last_login_date": null,
                                "id": "security_user_form,1976",
                                "lock_date": null,
                                "end_time_per_day": null,
                                "user_type_str": "普通用户",
                                "fax": "",
                                "tel": "",
                                "end_date": null,
                                "tuesday": 1,
                                "thursday": 1,
                                "saturday": 1,
                                "dept": "",
                                "isnewpwd": 1,
                                "lock_status": 0,
                                "expired_date": null,
                                "mailcode": "",
                                "user_name": "dddfff",
                                "time_period_flag": 0,
                                "ip_limit_mode": 2,
                                "sec_usergroup_id": 1977,
                                "max_online_num": 0,
                                "begin_date": null,
                                "sec_user_id": 1976,
                                "password_modify_time": "2016-06-03 09:22:05",
                                "e_mail": "",
                                "user_type": 1,
                                "login_fail_count": 0,
                                "wednesday": 1,
                                "password_valid_days_nolimit": true,
                                "closed_temporarily": 0,
                                "auto_exit_wait_time_nolimit": true,
                                "full_name": "",
                                "max_online_num_nolimit": true,
                                "password_valid_days": 0,
                                "user_desc": "",
                                "offline_user_days": 60,
                                "itemId": "security_user_form",
                                "sec_user_strategy.sec_user_id": 1976,
                                "create_user_id": 1,
                                "hierarchy": ",1,",
                                "offline_user_action": 1,
                                "sunday": 1,
                                "pw_expired_date": "2038-01-08 03:00:00",
                                "address": "",
                                "iconCls": "other_user_login_menu",
                                "leaf": true
                            }
                        ],
                        "iconCls": "security_usersfolder_treeicon",
                        "id": "security_user_view"
                    },
                    {
                        "itemId": "security_group_view",
                        "text": "用户组",
                        "expanded": true,
                        "children": [
                            {
                                "sec_usergroup_id": 1,
                                "sec_usergroup_name": "administrators",
                                "sec_usergroup_desc": "administrators1",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "administrators",
                                "sec_usergroup_fullname": "administrators",
                                "sec_usergroup_type": 4,
                                "create_time": "2011-12-26 18:58:07",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_super_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 2,
                                "sec_usergroup_name": "public",
                                "sec_usergroup_desc": "public desc",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "public",
                                "sec_usergroup_fullname": "public full nmae",
                                "sec_usergroup_type": 1,
                                "create_time": "2015-12-11 16:35:36",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,2",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1889,
                                "sec_usergroup_name": "pub2",
                                "sec_usergroup_desc": "sfsfsfsfss",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "pub2",
                                "sec_usergroup_fullname": "publib 2ddddd",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-03-21 12:26:37",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1889",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1890,
                                "sec_usergroup_name": "pub3111",
                                "sec_usergroup_desc": "sssssdddddd",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "pub3111",
                                "sec_usergroup_fullname": "dddddddddd22",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-04-26 14:49:34",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1890",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1891,
                                "sec_usergroup_name": "pub41",
                                "sec_usergroup_desc": "ssssddddddd",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "pub41",
                                "sec_usergroup_fullname": "",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-04-26 15:19:28",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1891",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1916,
                                "sec_usergroup_name": "ss",
                                "sec_usergroup_desc": "",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "ss",
                                "sec_usergroup_fullname": "sshbhb",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-05-05 16:17:09",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1916",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1917,
                                "sec_usergroup_name": "s2",
                                "sec_usergroup_desc": "uuuuuuuuu",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "s2",
                                "sec_usergroup_fullname": "",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-05-05 16:20:09",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1917",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1922,
                                "sec_usergroup_name": "s3",
                                "sec_usergroup_desc": "dfddd",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "s3",
                                "sec_usergroup_fullname": "rrrr",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-05-18 14:46:44",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 1,
                                "id": "security_group_form,1922",
                                "leaf": true
                            },
                            {
                                "sec_usergroup_id": 1924,
                                "sec_usergroup_name": "ssss",
                                "sec_usergroup_desc": "",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "ssss",
                                "sec_usergroup_fullname": "",
                                "sec_usergroup_type": 1,
                                "create_time": "2016-05-23 11:05:57",
                                "itemId": "security_group_form",
                                "is_user_private": 0,
                                "iconCls": "system_users_menu",
                                "enable_status": 2,
                                "id": "security_group_form,1924",
                                "leaf": true
                            }
                        ],
                        "iconCls": "security_usersgroupfolder_treeicon",
                        "id": "security_group_view"
                    },
                    {
                        "itemId": "security_operset_view",
                        "text": "操作集",
                        "expanded": true,
                        "children": [
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "设备监视员操作集",
                                "sec_operator_set_type": 2,
                                "private_flag": 0,
                                "is_default": 1,
                                "create_time": "2011-12-26 18:58:07",
                                "sec_operator_set_id": -7,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_deviceview",
                                "sec_operator_set_desc": "设备监视员操作集desc1",
                                "id": "security_operset_form,-7",
                                "sec_operator_set_name": "设备监视员操作集"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "设备操作全集",
                                "sec_operator_set_type": 2,
                                "private_flag": 1,
                                "is_default": 1,
                                "create_time": "2011-12-26 18:58:07",
                                "sec_operator_set_id": -2,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_deviceview",
                                "sec_operator_set_desc": "设备操作全集1",
                                "id": "security_operset_form,-2",
                                "sec_operator_set_name": "设备操作全集"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "oper1",
                                "sec_operator_set_type": 2,
                                "private_flag": 0,
                                "is_default": 0,
                                "create_time": "2016-04-29 09:16:41",
                                "sec_operator_set_id": 1895,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_deviceview",
                                "sec_operator_set_desc": null,
                                "id": "security_operset_form,1895",
                                "sec_operator_set_name": "oper1"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "dev1",
                                "sec_operator_set_type": 2,
                                "private_flag": 0,
                                "is_default": 0,
                                "create_time": "2016-04-29 10:03:59",
                                "sec_operator_set_id": 1896,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_deviceview",
                                "sec_operator_set_desc": "desc for dev1sss",
                                "id": "security_operset_form,1896",
                                "sec_operator_set_name": "dev1"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "平台监视员操作集",
                                "sec_operator_set_type": 1,
                                "private_flag": 0,
                                "is_default": 1,
                                "create_time": "2011-12-26 18:58:07",
                                "sec_operator_set_id": -5,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_alarmtypemgt",
                                "sec_operator_set_desc": "平台监视员操作集1",
                                "id": "security_operset_form,-5",
                                "sec_operator_set_name": "平台监视员操作集"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "网管应用操作全集",
                                "sec_operator_set_type": 1,
                                "private_flag": 1,
                                "is_default": 1,
                                "create_time": "2011-12-26 18:58:07",
                                "sec_operator_set_id": -1,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_alarmtypemgt",
                                "sec_operator_set_desc": "网管应用操作全集",
                                "id": "security_operset_form,-1",
                                "sec_operator_set_name": "网管应用操作全集"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "alarm_oper",
                                "sec_operator_set_type": 1,
                                "private_flag": 0,
                                "is_default": 0,
                                "create_time": "2015-12-11 16:29:31",
                                "sec_operator_set_id": 1875,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_alarmtypemgt",
                                "sec_operator_set_desc": "1111",
                                "id": "security_operset_form,1875",
                                "sec_operator_set_name": "alarm_oper"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1877,
                                "create_user_hierarchy": ",1,1877,",
                                "text": "system_oper",
                                "sec_operator_set_type": 1,
                                "private_flag": 0,
                                "is_default": 0,
                                "create_time": "2015-12-17 14:01:31",
                                "sec_operator_set_id": 1881,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_alarmtypemgt",
                                "sec_operator_set_desc": null,
                                "id": "security_operset_form,1881",
                                "sec_operator_set_name": "system_oper"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1877,
                                "create_user_hierarchy": ",1,1877,",
                                "text": "pon",
                                "sec_operator_set_type": 1,
                                "private_flag": 0,
                                "is_default": 0,
                                "create_time": "2015-12-17 16:04:31",
                                "sec_operator_set_id": 1882,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_alarmtypemgt",
                                "sec_operator_set_desc": "sssss",
                                "id": "security_operset_form,1882",
                                "sec_operator_set_name": "pon"
                            },
                            {
                                "itemId": "security_operset_form",
                                "create_user_id": 1,
                                "create_user_hierarchy": ",1,",
                                "text": "nm1",
                                "sec_operator_set_type": 1,
                                "private_flag": 0,
                                "is_default": 0,
                                "create_time": "2016-05-03 13:08:53",
                                "sec_operator_set_id": 1905,
                                "leaf": true,
                                "iconCls": "resource_icon_16x16_alarmtypemgt",
                                "sec_operator_set_desc": "sss",
                                "id": "security_operset_form,1905",
                                "sec_operator_set_name": "nm1"
                            }
                        ],
                        "iconCls": "security_folder_wrench_treeicon",
                        "id": "security_operset_view"
                    },
                    {
                        "itemId": "security_online_user_view",
                        "text": "在线用户",
                        "iconCls": "login_user_icon",
                        "leaf": true,
                        "id": "security_online_user_view"
                    }
                ],
                "iconCls": "security_management_treeicon",
                "id": "security_menu_root"
            }
        ]
    })
});
router.get("/twotrees", function (req, res, next) {
    console.log('000000000111111111111111');
    console.log(req.query);
    if (req.query.NEG == '1') {
        res.json(200, [{
            "text": "fuck",
            "cls": "folder",
            "checked": false,
            "expanded": true,
            "SYMBOL_ID": "fuck",
            "id": "fuck",
            "children": [{
                "text": "To Do",
                "cls": "folder",
                "checked": false,
                //"id": "do",
                "SYMBOL_ID": "do",
                "expanded": false,
                "children": [
                    //     {
                    //     "text": "Go jogging",
                    //     "leaf": true,
                    //     "id": "jogging",
                    //     "SYMBOL_ID": "do",
                    //     "checked": false
                    // }, {
                    //     "text": "Take a nap",
                    //     "leaf": true,
                    //     "id": "nap",
                    //     "SYMBOL_ID": "do",
                    //     "checked": false
                    // }, {
                    //     "text": "Climb Everest",
                    //     "leaf": true,
                    //     "id": "everest",
                    //     "SYMBOL_ID": "do",
                    //     "checked": false
                    // }
                ]
            }, {
                "text": "Grocery List",
                "cls": "folder",
                //"id": "list",
                "SYMBOL_ID": "list",
                "checked": false,
                "children": [{
                    "text": "Bananas",
                    "leaf": true,
                    "id": "bananas",
                    "SYMBOL_ID": "bananas",
                    "checked": false
                }, {
                    "text": "Milk",
                    "leaf": true,
                    "id": "milk",
                    "SYMBOL_ID": "milk",
                    "checked": false
                }, {
                    "text": "Cereal",
                    "leaf": true,
                    "id": "cereal",
                    "SYMBOL_ID": "cereal",
                    "checked": false
                }, {
                    "text": "Energy foods",
                    "cls": "folder",
                    "id": "foods",
                    "SYMBOL_ID": "foods",
                    "checked": false,
                    "children": [{
                        "text": "Coffee",
                        "leaf": true,
                        "id": "coffee",
                        "SYMBOL_ID": "coffee",
                        "checked": false
                    }, {
                        "text": "Red Bull",
                        "leaf": true,
                        "id": "bull",
                        "SYMBOL_ID": "bull",
                        "checked": false
                    }]
                }]
            }, {
                "text": "Remodel Project",
                "cls": "folder",
                "id": "project",
                "SYMBOL_ID": "project",
                "checked": false,
                "children": [{
                    "text": "Finish the budget",
                    "leaf": true,
                    "id": "budget",
                    "SYMBOL_ID": "budget",
                    "checked": false
                }, {
                    "text": "Call contractors",
                    "leaf": true,
                    "id": "contractors",
                    "SYMBOL_ID": "contractors",
                    "checked": false
                }, {
                    "text": "Choose design",
                    "leaf": true,
                    "id": "design",
                    "SYMBOL_ID": "design",
                    "checked": false
                }]

            }]
        }]);
    } else {
        res.json(200, [{
            "text": "fuck",
            "cls": "folder",
            "id": "fuck",
            "checked": false,
            "expanded": true,
            "children": []
        }]);
    }
});
router.get("/twotrees2", function (req, res, next) {
    console.log('000000000111111111111111');
    res.json(200, [{
        "text": "fuck",
        "cls": "folder",
        "id": "fuck",
        "checked": false,
        "expanded": true,
        "children": []
    }]);
});
router.post("/usergroupmember", function (req, res, next) {
    console.log('0909');
    var params = req.body;
    console.log(params);

});
router.post("/gg", function (req, res, next) {
    console.log('++++++++++++++++++++++');
    var params = req.body;
    console.log(params);
    res.json(200, { success: true, selectedId: [] });

});
router.get("/type", function (req, res, next) {
    console.log('---------------type----------------');
    var array = [[1, "\u7f51\u7ba1\u5e94\u7528"], [2, "\u7f51\u7edc\u8bbe\u5907"]];
    res.json(200, array);

});

router.get("/operation", function (req, res, next) {
    console.log('-----------operation-----------');
    console.log('----type----', req.query);
    if (req.query.use_token == 1) {
        console.log(req.query.ids);
        res.json(200, [{
            "text": "fuck",
            "cls": "folder",
            "id": "fuck",
            "isLeaf": 0,
            "expanded": true,
            "children": [{
                "text": "Bananas",
                "leaf": true,
                "id": 1,
                "isLeaf": 0,
                "SYMBOL_ID": "bananas"
            }, {
                "text": "Milk",
                "leaf": true,
                "id": 2,
                "isLeaf": 0,
                "SYMBOL_ID": "milk"
            }, {
                "text": "Cereal",
                "leaf": true,
                "id": 3,
                "isLeaf": 0,
                "SYMBOL_ID": "cereal"
            }]
        }]);
    } else {
        res.json(200, []);
    }
});

router.get("/oper", function (req, res, next) {
    console.log('-----------operation-----------');
    console.log('----type----', req.query);
    if (req.query.use_token == 1) {
        console.log(req.query.ids);
        res.json(200, {
            "children": [
                {
                    "text": "fuck",
                    "cls": "folder",
                    "id": "fuck",
                    "isLeaf": 0,
                    "expanded": true,
                    "children": [{
                        "text": "Bananas",
                        "leaf": true,
                        "id": 1,
                        "isLeaf": 0,
                        "SYMBOL_ID": "bananas"
                    }, {
                        "text": "Milk",
                        "leaf": true,
                        "id": 2,
                        "isLeaf": 0,
                        "SYMBOL_ID": "milk"
                    }, {
                        "text": "Cereal",
                        "leaf": true,
                        "id": 3,
                        "isLeaf": 0,
                        "SYMBOL_ID": "cereal"
                    }]
                },
                {
                    "text": "aaa",
                    "cls": "folder",
                    "id": "aaa",
                    "leaf": true
                }
            ]
        });
    } else {
        res.json(200, []);
    }
});

router.post('/load_form', function (req, res, next) {
    console.log(req.body);
    res.json(200, { success: true, ids_selected: [], ids_noselected: [0, 1, 2, 3] })
});
module.exports = router;