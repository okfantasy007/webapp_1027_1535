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


router.get('/date', function (req, res, next) {

    console.log("asd:" + req.query.id);
    var id = req.query.id;
    var everyweek = [{
        id: 1,
        name: '星期一'
    }, {
        id: 2,
        name: '星期二'
    }, {
        id: 3,
        name: '星期三'
    }, {
        id: 4,
        name: '星期四'
    }, {
        id: 5,
        name: '星期五'
    }, {
        id: 6,
        name: '星期六'
    }, {
        id: 7,
        name: '星期天'
    }];
    var everyday = [{
        id: 1,
        name: '1号'
    }, {
        id: 2,
        name: '2号'
    }, {
        id: 3,
        name: '3号'
    }, {
        id: 4,
        name: '4号'
    }, {
        id: 5,
        name: '5号'
    }, {
        id: 6,
        name: '6号'
    }, {
        id: 7,
        name: '7号'
    }, {
        id: 8,
        name: '8号'
    }, {
        id: 9,
        name: '9号'
    }, {
        id: 10,
        name: '10号'
    }, {
        id: 11,
        name: '11号'
    }, {
        id: 12,
        name: '12号'
    }, {
        id: 13,
        name: '13号'
    }, {
        id: 14,
        name: '14号'
    }, {
        id: 15,
        name: '15号'
    }, {
        id: 16,
        name: '16号'
    }, {
        id: 17,
        name: '17号'
    }, {
        id: 18,
        name: '18号'
    }, {
        id: 19,
        name: '19号'
    }, {
        id: 20,
        name: '20号'
    }, {
        id: 21,
        name: '21号'
    }, {
        id: 22,
        name: '22号'
    }, {
        id: 23,
        name: '23号'
    }, {
        id: 24,
        name: '24号'
    }, {
        id: 25,
        name: '25号'
    }, {
        id: 26,
        name: '26号'
    }, {
        id: 27,
        name: '27号'
    }, {
        id: 28,
        name: '28号'
    }, {
        id: 29,
        name: '29号'
    }, {
        id: 30,
        name: '30号'
    }, {
        id: 31,
        name: '31号'
    }];
    var all = [{
        id: -1,
        name: 'All'
    }];
    if (id == 2) {
        console.log(1);
        res.json(200, {
            success: true,
            'data': everyweek
        });

    } else if (id == 3) {
        console.log(2);
        res.json(200, {
            success: true,
            'data': everyday
        });

    } else if (id == 1) {
        console.log(3);
        res.json(200, {
            success: true,
            'data': [{
                id: 1,
                name: '每一天'
            }]
        });
    } else if (id == -1) {
        console.log(3);
        res.json(200, {
            success: true,
            'data': all
        });
    }
});
module.exports = router;