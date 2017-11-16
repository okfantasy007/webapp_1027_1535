var express = require('express');
var router = express.Router();

var sprintf = require("sprintf-js").sprintf;
const newsn = require('uuid/v1');
var client = APP.redis_client;
// var redis = require('redis');
// var client = redis.createClient({
//     host: '127.0.0.1',
//     port: 6379,
// });

router.get('/mainForm/grid', function (req, res, next) {
    console.log(123323332);
    console.log(12);
    console.log(req.query.neType);
    client.hgetall("equipmentUpdateMainForm", function (err, obj) {
        // console.dir(obj);

        // 从redis获取数据
        var ary = [];
        for (var k in obj) {
            var record = JSON.parse(obj[k]);
            record['id'] = k;
            ary.push(record)
        }

        // 获取分页数据
        var pageAry = ary.filter(function (item, idx) {
            var start = parseInt(req.query.start);
            var end = start + parseInt(req.query.limit);
            return idx >= start && idx < end;
        });
        // 返回结果
        res.json(200, {
            success: true,
            totalCount11111111: ary.length,
            data: pageAry,
        });

    });
});
;
router.post('/', function (req, res, next) {
    var k = req.body.id == '' ? newsn() : req.body.id;
    var v = {
        neType: req.body.neType,
        fileType: req.body.fileType,
        version: req.body.version,
        fileName: req.body.fileName,
        fileSize: req.body.fileSize,
        discription: req.body.discription,
        userName: req.body.userName,
        inputDate: req.body.inputDate


    }
    client.hset("equipmentUpdateMainForm", k, JSON.stringify(v), function (err, result) {
        res.json(200, { success: true, msg: '提交表单成功!' });
    });
});


router.post('/equipmentFile/localForm', function (req, res, next) {
    var v = {
        策略名称: req.body.NEtype,
        用户名: req.body.path,
        文件类型: req.body.fileType,
        是否默认: req.body.version,
        调度状态: req.body.discription

    }
    console.log(v);
    res.json(200, { success: true, msg: '操作成功!' });
});
router.post('/equipmentFile/gridForm', function (req, res, next) {
    var v = {
        策略名称: req.body.NEtype,
        用户名: req.body.path,
        文件类型: req.body.fileType,
        是否默认: req.body.version,
        调度状态: req.body.discription

    }
    res.json(200, { success: true, msg: '操作成功!' });
});
router.post('/equipmentFile/mainFormQuery', function (req, res, next) {
    var v = {
        策略名称: req.body.neType,
        用户名: req.body.textType,
        文件类型: req.body.version,
        是否默认: req.body.userName,
        调度状态: req.body.inputDate1,
        调度时间: req.body.inputDate2

    }
    res.json(200, { success: true, msg: '操作成功!' });
});
router.post('/equipmentFile/download', function (req, res, next) {
    var v = {
        ids: req.body.ids
    }
    res.json(200, { success: true, msg: '操作成功!' });
});
router.post('/equipmentFile/output', function (req, res, next) {
    var v = {
        ids: req.body.ids
    }
    res.json(200, { success: true, msg: '操作成功!' });
});
router.post('/equipmentFile/delete', function (req, res, next) {
    var ids = req.body.NEids.split(',');
    var infos = [];
    var with_err = false;
    var ids_del = [];

    for (var i in ids) {
        infos.push('Record ID: ' + ids[i] + ' was deleted!');
        ids_del.push(ids[i]);
    }
    for (var i in ids) {
        client.hdel("equipmentUpdateMainForm", ids[i]);
    }
    res.json(200, {
        success: true,
        with_err: with_err,
        msg: infos.join('</br>')
    });

});
router.post('/equipmentFile/formWindowInput', function (req, res, next) {
    var body = req.body;
    console.log(body.discription);
    console.log(body.version);
    console.log(body.id);
    console.log(12 + "121221sdfsdfsdf");
    res.json(200, { success: true, msg: '操作成功!' });
});

module.exports = router;