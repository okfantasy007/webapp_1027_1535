var express = require('express');
var router = express.Router();

var sprintf = require("sprintf-js").sprintf;
const newsn = require('uuid/v1');
var redis = require('redis');

var client = APP.redis_client;

router.post('/init', function(req, res, next) {
    client.del("users");

    for (var i = 0; i < 100; i++) {

        var k = newsn();
        var v = {
                name: sprintf("user%d", i+1),
                group: sprintf("group%d", i+1),
            }

        client.hset("users", k, JSON.stringify(v));
    };

    res.json(200, {success: true}); 
});

router.get('/', function(req, res, next) {
    // res.send('list all users!');
    // console.log( req );
    console.log( req.headers );

    client.hgetall("users", function (err, obj) {
        // console.dir(obj);
        var ary=[];
        for (var k in obj) {
            var record = JSON.parse(obj[k]); 
            record['id'] = k;
            ary.push(record)
        }
        res.json(200, {success: true, 'data': ary });  
    });
});

router.get('/page', function(req, res, next) {
    // res.send('list all users!');
    // console.log( req );
    console.log( req.query );

    client.hgetall("users", function (err, obj) {
        // console.dir(obj);

        // 从redis获取数据
        var ary=[];
        for (var k in obj) {
            var record = JSON.parse(obj[k]); 
            record['id'] = k;
            ary.push(record)
        }

        // 获取分页数据
        var pageAry = ary.filter(function(item, idx){
            var start = parseInt(req.query.start);
            var end = start + parseInt(req.query.limit);
            return idx >= start && idx < end;
        });
 
        // 返回结果
        res.json(200, {
            success: true,
            totalCount: ary.length,
            data: pageAry,
        });  

    });
});

router.post('/', function(req, res, next) {
    console.log(req.body);
    var k = req.body.id == '' ? newsn() : req.body.id;
    var v = {
            name: req.body.name,
            group: req.body.group,
        }
    client.hset("users", k, JSON.stringify(v), function(err, result){
        console.log(err, result);
        res.json(200, {success: true, msg: '操作成功!' });        
    });
});

router.post('/delete', function(req, res, next) {
    console.log(req.body);
    var ids = req.body.ids.split(',');
    var infos = [];
    var with_err = false;
    var ids_del = [];

    for (var i in ids) {
        console.log(ids[i]);
        infos.push( 'Record ID: ' + ids[i] + ' was deleted!');
        ids_del.push(ids[i]);
    }

    for (var i in ids) {
        console.log(ids[i]);
        client.hdel("users", ids[i]);
    }

    res.json(200, {
        success: true,
        with_err: with_err,
        msg: infos.join('</br>')
    });  

});


module.exports = router;
