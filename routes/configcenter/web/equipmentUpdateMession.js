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
    // res.send('list all users!');
    // console.log( req );
    // var v = {
    //     messionName: req.body.messionName,
    //     executeState: req.body.textType,
    //     userName: req.body.fileType,
    //     startDate1: req.body.whetherChooseFromFileStore,
    //     startDate2: req.body.versionData,
    //     endDate1: req.body.neType,
    //     endDate2: req.body.path,
    //     textType: req.body.whetherActive,
    //     textVersion: req.body.startDate,
    //     createDate1: req.body.description,
    //     createDate2: req.query.createDate2


    // };
    console.log(req.query.messionName);
    console.log(211112);

    client.hgetall("lsj", function (err, obj) {
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
        console.log(pageAry);

        // 返回结果
        res.json(200, {
            success: true,
            totalCount: ary.length,
            data: pageAry,
        });

    });
});
router.post('/mainForm', function (req, res, next) {
    var k = req.body.id == '' ? newsn() : req.body.id;
    // var v = {
    //         messionName:req.body.messionName,
    //         executeState:req.body.executeState,
    //         userName: req.body.userName,
    //         startDate1: req.body.startDate1,
    //         startDate2: req.body.startDate2,
    //         endDate1: req.body.endDate1,
    //         endDate2: req.body.endDate2,
    //         textType: req.body.textType,
    //         textVersion: req.body.textVersion,
    //         createDate1: req.body.createDate1,
    //         createDate2: req.body.createDate2


    //     };
    var v = {
        messionName: req.body.messionName,
        executeState: req.body.textType,
        userName: req.body.fileType,
        startDate1: req.body.whetherChooseFromFileStore,
        startDate2: req.body.versionData,
        endDate1: req.body.neType,
        endDate2: req.body.path,
        textType: req.body.whetherActive,
        textVersion: req.body.startDate,
        createDate1: req.body.description,
        createDate2: req.query.createDate2


    };
    console.log(3333333);
    console.log(v);
    client.hset("user", k, JSON.stringify(v), function (err, result) {
        res.json(200, { success: true, msg: '操作成功!' });
    });
});
router.post('/', function (req, res, next) {
    var k = req.body.id == '' ? newsn() : req.body.id;
    var v = {
        messionName: req.body.messionName,
        startDate: req.body.startDate,
        progress: req.body.progress,
        executeState: req.body.executeState,
        fileStyle: req.body.fileStyle,
        fileVersion: req.body.fileVersion,
        userName: req.body.userName,
        createDate: req.body.createDate


    }
    client.hset("lsj", k, JSON.stringify(v), function (err, result) {
        res.json(200, { success: true, msg: '操作成功!' });
    });
});
router.post('/output', function (req, res, next) {
    var v = {
        req: req.body
    };
    console.log(v);
    client.hset("lichan", JSON.stringify(v), function (err, result) {
        res.json(200, { success: true, msg: '操作成功!' });
    });
});
router.post('/getGrid1', function (req, res, next) {
    var v = {
        reqGrid: req.body.messionIds
    };
    console.log(v);
    client.hset("grid1", JSON.stringify(v), function (err, result) {
        res.json(200, { success: true, msg: '操作成功!' });
    });
    console.log(11111111);
});


module.exports = router;