var express = require('express');
var request = require("request");
var os = require('os');
var http = require('http');

var router = express.Router();

var username = 'admin';
var password = 'admin';
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
console.log("===>" + _auth);

var IPv4 = 'http://' + APP.sdn_rest.host + ':' + APP.sdn_rest.port;

//根据分页参数返回数据
function getDataByPage(params, data) {
    var len = data.length;
    var count = Math.ceil(len / params.limit);

    if (params.page < count) {
        return data.slice(params.start, params.page * params.limit);
    } else if (params.page == count) {
        return data.slice(params.start);
    }
}

//根据过滤参数返回过滤
function filterData(params, data) {
    var newData = data.filter(function(element, index, array) {
        var flag = true;

        for (var name in params) {
            if (name == "eline-vlan") {
                if (element["ingress-node-vlan"].toString().indexOf(params[name].toString()) == -1 && element["egress-node-vlan"].toString().indexOf(params[name].toString()) == -1) {
                    flag = false;
                    // 查询字段有一个不满足时即跳出循环
                    break;
                }
            } else {
                if (element[name].toString().indexOf(params[name].toString()) == -1) {
                    flag = false;
                    // 查询字段有一个不满足时即跳出循环
                    break;
                }
            }
        }
        return flag;
    });

    return newData;
}

router.post('/:operation', function(req, res, next) {
    var operation = req.params.operation;
    // var input = req.body.input;
    // input = JSON.parse(input);
    // var body = {
    //     input: input
    // };
    var body = req.body;
    var options = {
        url: IPv4 + '/restconf/operations/y1564-api:' + operation + '-y1564',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        if (!err && response.statusCode == 200) {
            var data = JSON.parse(data);
            if (data && data['output'] && data['output']['result'] == true) {
                res.status(200).json({
                    success: true
                });
            } else {
                res.status(400).json({
                    success: false
                });
            }
        } else {
            res.status(response.statusCode).json({
                success: false
            });
        }
    });
});

//获取y1564任务列表
router.get('/get_y1564_task_list', function(req, res, next) {
    var options = {
        url: IPv4 + '/restconf/operational/y1564-api:task',
        headers: {
            'authorization': _auth
        }
    };
    request.get(options, function(err, response, data) {
        // console.log(data);
        if (!err && response.statusCode == 200) {
            if (data) {
                data = JSON.parse(data);
                if (data['task'] && data['task']['task-list'] && data['task']['task-list'].length > 0) {
                    var y1564_task_list = data['task']['task-list'];
                    var y1564_task_list_show = [];
                    for (var i = 0; i < y1564_task_list.length; i++) {
                        var task = y1564_task_list[i];
                        if (task['throughput-container'] && task['throughput-container']['throughput-task']) {
                            for (var m = 0; m < task['throughput-container']['throughput-task'].length; m++) {
                                var ct = task['throughput-container']['throughput-task'][m];
                                ct['service-id'] = task['service-id'];
                                y1564_task_list_show.push(ct);
                            }
                        }
                        if (task['performance-container'] && task['performance-container']['performance-task']) {
                            for (var n = 0; n < task['performance-container']['performance-task'].length; n++) {
                                var pt = task['performance-container']['performance-task'][n];
                                pt['service-id'] = task['service-id'];
                                y1564_task_list_show.push(pt);
                            }
                        }
                    }
                    var query = {
                        page: req.query.page,
                        limit: req.query.limit,
                        start: req.query.start
                    };
                    var params = req.query;
                    delete params['_dc'];
                    delete params['page'];
                    delete params['limit'];
                    delete params['start'];
                    var filter_task_list = filterData(params, y1564_task_list_show);
                    var query_page_data = getDataByPage(query, filter_task_list);
                    res.status(200).json({
                        totalCount: filter_task_list.length,
                        data: query_page_data
                    });
                } else {
                    res.status(200).json({
                        totalCount: 0,
                        data: []
                    });
                }
            }
        } else {
            if (!response) {
                res.status(400).json({
                    totalCount: 0,
                    data: []
                });
            } else {
                res.status(response.statusCode).json({
                    totalCount: 0,
                    data: []
                });
            }
        }
    });
});

//获取y1564任务状态
router.get('/get_y1564_task_status/:elineId/:group', function(req, res, next) {
    var elineId = req.params.elineId;
    var group = req.params.group;
    var options = {
        url: IPv4 + '/restconf/operational/y1564-api:group-container/group-status-container/' + elineId + '/' + group,
        headers: {
            'authorization': _auth
        }
    };
    request.get(options, function(err, response, data) {
        // console.log(data);
        if (!err && response.statusCode == 200) {
            if (data) {
                data = JSON.parse(data);
                if (data['group-status-container'] && data['group-status-container'].length > 0) {
                    res.status(200).json({
                        success: false,
                        status: data['group-status-container'][0]['group-status']
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        status: ""
                    });
                }

            } else {
                res.status(400).json({
                    success: false,
                    status: ""
                });
            }
        } else {
            res.status(response.statusCode).json({
                success: false,
                status: ""
            });
        }
    });
});

module.exports = router;