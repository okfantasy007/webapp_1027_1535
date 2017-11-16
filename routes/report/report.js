var express = require('express');
var request = require("request");
var os = require('os');
var http = require('http');
var router = express.Router();

var username = 'admin';
var password = 'admin';
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
console.log("===>" + _auth);

var IPv4 = "172.16.75.66";

var upload_dir = './static/report/';
var fs = require('fs');
var util = require('util');
var multiparty = require('multiparty');
var path = require('path');

router.post('/receive', function(req, res, next) {

    console.log("enter receive");
    var form = new multiparty.Form({
        uploadDir: upload_dir
    });


    form.parse(req, function(err, fields, files) {

        var filesTmp = JSON.stringify(files, null, 2);

        if (err) {
            console.log('parse error: ' + err);
        } else {
            console.log('parse files: ' + filesTmp);
            var inputFile = files.inputFile[0];
            console.log('inputFile: ' + inputFile);
            var uploadedPath = inputFile.path;
            console.log('uploadedPath: ' + uploadedPath);
            var dstPath = upload_dir + inputFile.originalFilename;
            //  var dstPath = path.join(upload_dir, inputFile.originalFilename);
            console.log('dstPath: ' + dstPath);
            //重命名为真实文件名  
            fs.rename(uploadedPath, dstPath, function(err) {
                if (err) {
                    console.log('rename error', err);
                    res.status(400).json({
                        success: false
                    });

                } else {
                    console.log('rename ok');
                    res.status(200).json({
                        success: true
                    });
                }
            });
        }
    });

});

//获取指定日期列表
router.get('/gettimedetaillist/:type/:lang', function(req, res, next) {

    var type = req.params.type;
    var lang = req.params.lang;
    if (type == 'month') {
        if (lang == 'zh_CN') {
            var unit = '日';
        } else {
            var unit = 'th';
        }
        var datas = [];
        for (var i = 1; i < 31; i++) {
            var data = {
                'time_detail': String(i),
                'time_detail_name': String(i) + unit
            };
            if (i == 2 && lang == 'en_US') {
                data['time_detail_name'] = String(i) + 'nd';
            }
            if (i == 3 && lang == 'en_US') {
                data['time_detail_name'] = String(i) + 'rd';
            }
            datas.push(data);
        }
    } else {
        var datas = [{
            'time_detail': '1',
            'time_detail_name': lang == 'zh_CN' ? '周一' : 'monday'
        }, {
            'time_detail': '2',
            'time_detail_name': lang == 'zh_CN' ? '周二' : 'tuesday'
        }, {
            'time_detail': '3',
            'time_detail_name': lang == 'zh_CN' ? '周三' : 'wednesday'
        }, {
            'time_detail': '4',
            'time_detail_name': lang == 'zh_CN' ? '周四' : 'thursday'
        }, {
            'time_detail': '5',
            'time_detail_name': lang == 'zh_CN' ? '周五' : 'friday'
        }, {
            'time_detail': '6',
            'time_detail_name': lang == 'zh_CN' ? '周六' : 'saturday'
        }, {
            'time_detail': '7',
            'time_detail_name': lang == 'zh_CN' ? '周日' : 'sunday'
        }];

    }
    res.status(200).json({
        success: true,
        data: datas
    });
    console.log("--------------------------gettimedetaillist-------------------------");
});

//获取模板列表
router.get('/gettemplatelist/page', function(req, res, next) {

    //初始默认不分页
    var page = "",
        row = "";
    if (req.query.page !== undefined && req.query.page !== "") { //如果req.query.page参数不为空，则需要分页
        var page = Number(req.query.page);
        var rows = Number(req.query.limit);
    }

    var template_name = req.query.template_name;
    var url = "http://" + IPv4 + ":8088/rest/report_template/getTemplateInfo?page=" + page + "&rows=" + rows;
    if (template_name !== undefined && template_name !== "") {
        url += ("&template_name=" + template_name);
    }

    request({
        url: url,
        method: "GET"
    }, function(error, response, data) { //data为序列化json字符串

        if (!error && response.statusCode == 200) {
            console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);

            if (data && data["status"] == "success") {
                var totalCount = data["count"];
                data = data["data"];
                res.status(200).json({
                    success: true,
                    data: data,
                    count: totalCount
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: [],
                    totalCount: 0
                });
            }
        } else {
            res.status(400).json({
                success: false,
                data: [],
                totalCount: 0
            });
        }
    });
    console.log("--------------------------gettunnels-------------------------");
});

//获取所有模板列表不分页
router.get('/gettemplatelist/all', function(req, res, next) {


    var url = "http://" + IPv4 + ":8088/rest/report_template/getAllTemplateInfo";

    request({
        url: url,
        method: "GET"
    }, function(error, response, data) { //data为序列化json字符串

        if (!error && response.statusCode == 200) {
            console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);

            if (data && data["status"] == "success") {
                var totalCount = data["count"];
                data = data["data"];
                res.status(200).json({
                    success: true,
                    data: data,
                    count: totalCount
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: [],
                    totalCount: 0
                });
            }
        } else {
            res.status(400).json({
                success: false,
                data: [],
                totalCount: 0
            });
        }
    });
    console.log("--------------------------gettunnels-------------------------");
});

//获取所有模板列表不分页db
router.get('/gettemplatelist/db/all', function(req, res, next) {


    var sql_search_condation = " where 1=1 ";

    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        console.log("####", req.query);
        var count_sql = "SELECT COUNT(*) AS count FROM report_template " + sql_search_condation;
        // 第一次查询 获取记录总数
        conn.query(count_sql, function(err, rows, fields) {
            var totalCount = rows[0].count;
            console.info("totalCount:", totalCount);

            var sql = 'SELECT * FROM report_template ' + sql_search_condation;

            console.log("##SQL##", sql);

            // 第二次查询 获取记录数组
            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                // if (err) throw  err;
                for (var i in rows) {
                    // console.log(i, rows[i]);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    count: totalCount,
                    data: rows,
                });
            });

        });
    });
});

//获取模板列表db
router.get('/gettemplatelist/db/page', function(req, res, next) {

    log.debug('GET /res_ne/all_data_with_page');
    console.info("req.query.template_name:", req.query.template_name, "req.query.template_desc:", req.query.template_desc);

    var sql_search_condation = " where 1=1 ";

    if (req.query.template_name != undefined && req.query.template_name != "") {
        sql_search_condation += sprintf(" and template_name like '%%%s%%' ", req.query.template_name)
    }

    if (req.query.template_desc != undefined && req.query.template_desc != "") {
        sql_search_condation += sprintf(" and template_desc like '%%%s%%' ", req.query.template_desc)
    }

    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        console.log("####", req.query);
        var count_sql = "SELECT COUNT(*) AS count FROM report_template " + sql_search_condation;
        // 第一次查询 获取记录总数
        conn.query(count_sql, function(err, rows, fields) {
            var totalCount = rows[0].count;
            console.info("totalCount:", totalCount);

            var sql = 'SELECT * FROM report_template ' + sql_search_condation;

            if (req.query.start !== undefined && req.query.start !== "") { //是否需要分页
                sql += sprintf(' LIMIT %d, %d', req.query.start, req.query.limit);
            }
            console.log("##SQL##", sql);

            // 第二次查询 获取记录数组
            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                // if (err) throw  err;
                for (var i in rows) {
                    // console.log(i, rows[i]);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    count: totalCount,
                    data: rows,
                });
            });

        });
    });
});

//获取任务列表
router.get('/gettasklist/page', function(req, res, next) {
    var page = Number(req.query.page);
    var rows = Number(req.query.limit);

    var task_name = req.query.task_name;
    var url = "http://" + IPv4 + ":8088/rest/report_task/getTaskInfo?page=" + page + "&rows=" + rows;
    if (task_name !== undefined && task_name !== "") { //模糊查询
        url += ("&task_name=" + task_name);
    }

    var options = {
        url: url,
        method: "GET"
    };

    request(options, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);

            if (data && data["status"] == "success") {
                var totalCount = data["count"];

                data = data["data"];
                res.status(200).json({
                    success: true,
                    data: data,
                    count: totalCount
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: [],
                    totalCount: 0
                });
            }
        } else {
            res.status(400).json({
                success: false,
                data: [],
                totalCount: 0
            });
        }
    });
    console.log("--------------------------gettunnels-------------------------");
});

//获取任务列表db
router.get('/gettasklist/db/page', function(req, res, next) {

    log.debug('GET /res_ne/all_data_with_page');
    console.info("req.query.task_name:", req.query.task_name);

    var sql_search_condation = " where 1=1 ";

    if (req.query.task_name != undefined && req.query.task_name != "") {
        sql_search_condation += sprintf(" and task_name like '%%%s%%' ", req.query.task_name)
    }

    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        console.log("####", req.query);
        var count_sql = "SELECT COUNT(*) AS count FROM report_task " + sql_search_condation;
        // 第一次查询 获取记录总数
        conn.query(count_sql, function(err, rows, fields) {
            var totalCount = rows[0].count;
            console.info("totalCount:", totalCount);

            var sql = 'SELECT r.task_id,\
            r.task_name,\
            r.template_path,\
            r.template_id,\
            r.template_name,\
            r.execute_time,\
            r.report_type,\
            r.task_cycle,\
            r.task_status,\
            r.file_path,\
            r.rest_parameter,\
            r.creater,\
            r.time_detail,\
            DATE_FORMAT(r.create_time, "%Y-%m-%d %H:%i:%S") AS create_time,\
            DATE_FORMAT(r.modify_time, "%Y-%m-%d %H:%i:%S") AS modify_time,\
            r.params_identify_id FROM report_task r ' + sql_search_condation;

            sql += sprintf(' LIMIT %d, %d', req.query.start, req.query.limit);
            console.log("##SQL##", sql);

            // 第二次查询 获取记录数组
            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                // if (err) throw  err;
                for (var i in rows) {
                    // console.log(i, rows[i]);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    count: totalCount,
                    data: rows,
                });
            });

        });
    });
});

//新增任务
router.post('/addtask', function(req, res, next) {


    var add_task_params = JSON.stringify(req.body);

    console.log("add_task_params:" + add_task_params);
    var url = "http://" + IPv4 + ":8088/rest/report_task/addTask";

    var headers = {
        'content-type': "application/json",
        'content-length': add_task_params.length
    };

    var options = {
        url: url,
        method: 'POST',
        body: add_task_params,
        headers: headers
    };

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log("data", data);
            var data = JSON.parse(data);
            if (data && data["status"] == "success") {
                res.status(200).json({
                    success: true,
                    status: "success"
                });
            } else {
                res.status(400).json({
                    success: false,
                    status: "failure"
                });
            }
        }
    });

});

//新增任务db
router.post('/addtask/db', function(req, res, next) {

    console.info("req.body: ", req.body);

    var params = req.body;

    var add_task_sql = 'INSERT INTO report_task(\
    task_name,\
    template_name,\
    execute_time,\
    report_type,\
    task_cycle, \
    time_detail,\
    task_status,\
    creater,\
    create_time) VALUES(?,?,?,?,?,?,?,?,?)';

    var add_task_params = [
        params["task_name"],
        params["template_name"],
        params["execute_time"],
        params["report_type"],
        params["task_cycle"],
        params["time_detail"],
        params["task_status"],
        params["creater"],
        params["create_time"]
    ];

    var task_cycle = params.task_cycle;

    if (task_cycle == '0' || task_cycle == '3') {
        add_task_sql = 'INSERT INTO report_task(\
            task_name,\
            template_name,\
            execute_time,\
            report_type,\
            task_cycle, \
            task_status,\
            creater,\
            create_time) VALUES(?,?,?,?,?,?,?,?)';
        add_task_params = [
            undefined,
            params["template_name"],
            params["execute_time"],
            params["report_type"],
            params["task_cycle"],
            params["task_status"],
            params["creater"],
            params["create_time"]
        ];
    }

    console.log(add_task_sql);
    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        conn.query(add_task_sql, add_task_params, function(err, result) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                return;
            }
            console.log('-------INSERT----------');
            console.log('INSERT ID:', result);
            console.log('#######################');
            conn.release();
            res.status(200).json({
                success: true,
                status: "success",
                info: "insert success"
            });
        });
    });
});

//修改任务 一次只能修改一个任务 post
router.post('/modifytask', function(req, res, next) {

    var task_id = req.body["task_id"];
    var modify_task_params = JSON.stringify(req.body);
    var url = "http://" + IPv4 + ":8088/rest/report/report_task/modifyTaskInfo";

    var headers = {
        'content-type': "application/json",
        'content-length': modify_task_params.length
    };

    var options = {
        url: url,
        method: 'POST',
        body: modify_task_params,
        headers: headers
    };

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log("data", data);
            var data = JSON.parse(data);
            if (data && data["status"] == "success") {
                res.status(200).json({
                    success: true,
                    status: "success"
                });
            } else {
                res.status(400).json({
                    success: false,
                    status: "failure"
                });

            }
        }
    });

});

//修改任务db 一次只能修改一个任务
router.post('/modifytask/db', function(req, res, next) {

    console.info("req.body: ", req.body);

    var params = req.body;

    var modify_task_sql = 'UPDATE report_task SET \
    task_name = ?,\
    template_name = ?,\
    execute_time = ?,\
    report_type = ?,\
    task_cycle = ?,\
    time_detail = ?,\
    task_status = ?, \
    modify_time = ? \
    where task_id = ?';


    var modify_task_params = [
        params["task_name"],
        params["template_name"],
        params["execute_time"],
        params["report_type"],
        params["task_cycle"],
        params["time_detail"],
        params["task_status"],
        params["modify_time"],
        Number(params['task_id'])
    ];

    var task_cycle = params.task_cycle;

    if (task_cycle == '0' || task_cycle == '3') {
        var modify_task_sql = 'UPDATE report_task SET \
            task_name = ?,\
            template_name = ?,\
            execute_time = ?,\
            report_type = ?,\
            task_cycle = ?,\
            task_status = ?, \
            modify_time = ? \
            where task_id = ?';


        var modify_task_params = [
            params["task_name"],
            params["template_name"],
            params["execute_time"],
            params["report_type"],
            params["task_cycle"],
            params["task_status"],
            params["modify_time"],
            Number(params['task_id'])
        ];
    }

    console.log(modify_task_sql);
    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        conn.query(modify_task_sql, modify_task_params, function(err, result) {
            if (err) {
                console.log('[MODIFY ERROR] - ', err.message);
                return;
            }
            console.log('-------MODIFY----------');
            console.log('MODIFY ID:', result.affectedRows);
            console.log('#######################');
            conn.release();
            res.status(200).json({
                success: true,
                status: "success",
                info: "modify success"
            });
        });
    });
});

//删除任务 可以同时删除多个任务
router.post('/deletetask', function(req, res, next) {

    var taskids = req.body.taskids;
    var url = "http://" + IPv4 + ":8088/rest/report_task/deleteTask?task_id=" + taskids;

    var options = {
        url: url,
        method: "GET"
    };

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log("data", data);
            var data = JSON.parse(data);
            if (data && data["status"] == "success") {
                res.status(200).json({
                    status: "success"
                });
            } else {
                res.status(400).json({
                    status: "failure"
                });

            }
        }
    });

});

//删除任务db
router.post('/deletetask/db', function(req, res, next) {

    console.info("req.body: ", req.body);

    var taskids = req.body.taskids;
    taskids = taskids.split(",");
    for (var i = 0; i < taskids.length; i++) {
        taskids[i] = Number(taskids[i]);
    }

    var delete_task_sql = 'DELETE FROM report_task where 1 = 1 and ';
    delete_task_sql += sprintf('task_id = %d ', taskids[0]);
    taskids = taskids.slice(1); //去掉第一个taskid
    if (taskids && taskids.length !== 0) {
        for (var i = 0; i < taskids.length; i++) {
            delete_task_sql += sprintf('or task_id = %d', taskids[i]);
        }
    }

    console.log(delete_task_sql);
    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        conn.query(delete_task_sql, function(err, result) {
            if (err) {
                console.log('[DELETE ERROR] - ', err.message);
                return;
            }
            console.log('-------DELETE----------');
            console.log('DELETE ID:', result.affectedRows);
            console.log('#######################');
            conn.release();
            res.status(200).json({
                status: "success",
                info: "delete success"
            });
        });
    });
});


//启动任务 可以同时启动多个任务
router.post('/starttask', function(req, res, next) {

    var taskids = req.body.taskids;
    var url = "http://" + IPv4 + ":8088/rest/report_task/startTask?task_id=" + taskids;

    var options = {
        url: url,
        method: "GET"
    };

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log("data", data);
            var data = JSON.parse(data);
            if (data && data["status"] == "success") {
                res.status(200).json({
                    status: "success"
                });
            } else {
                res.status(400).json({
                    status: "failure"
                });
            }
        }
    });

});

//启动任务db
router.post('/starttask/db', function(req, res, next) {

    console.info("req.body: ", req.body);

    var taskids = req.body.taskids;
    taskids = taskids.split(",");
    for (var i = 0; i < taskids.length; i++) {
        taskids[i] = Number(taskids[i]);
    }

    var start_task_sql = 'UPDATE report_task SET task_status = "1" where 1 = 1 and ';
    start_task_sql += sprintf('task_id = %d ', taskids[0]);
    taskids = taskids.slice(1); //去掉第一个taskid
    if (taskids && taskids.length !== 0) {
        for (var i = 0; i < taskids.length; i++) {
            start_task_sql += sprintf('or task_id = %d ', taskids[i]);
        }
    }

    console.log(start_task_sql);
    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        conn.query(start_task_sql, function(err, result) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                return;
            }
            console.log('-------UPDATE----------');
            console.log('UPDATE ID:', result.affectedRows);
            console.log('#######################');
            conn.release();
            res.status(200).json({
                success: true,
                status: "success",
                info: "start success"
            });
        });
    });
});

//停止任务 可以同时停止多个任务
router.post('/stoptask', function(req, res, next) {

    var taskids = req.body.taskids;
    var url = "http://" + IPv4 + ":8088/rest/report_task/stopTask?task_id=" + taskids;

    var options = {
        url: url,
        method: "GET"
    };

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log("data", data);
            var data = JSON.parse(data);
            if (data && data["status"] == "success") {
                res.status(200).json({
                    status: "success"
                });
            } else {
                res.status(400).json({
                    status: "failure"
                });
            }
        }
    });

});

//停止任务db 可以同时停止多个任务
router.post('/stoptask/db', function(req, res, next) {

    console.info("req.body: ", req.body);

    var taskids = req.body.taskids;
    taskids = taskids.split(",");
    for (var i = 0; i < taskids.length; i++) {
        taskids[i] = Number(taskids[i]);
    }

    var stop_task_sql = 'UPDATE report_task SET task_status = "0" where 1 = 1 and ';
    stop_task_sql += sprintf('task_id = %d ', taskids[0]);
    taskids = taskids.slice(1); //去掉第一个taskid
    if (taskids && taskids.length !== 0) {
        for (var i = 0; i < taskids.length; i++) {
            stop_task_sql += sprintf('or task_id = %d ', taskids[i]);
        }
    }

    console.log(stop_task_sql);
    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        conn.query(stop_task_sql, function(err, result) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                return;
            }
            console.log('-------UPDATE----------');
            console.log('UPDATE ID:', result.affectedRows);
            console.log('#######################');
            conn.release();
            res.status(200).json({
                success: true,
                status: "success",
                info: "stop success"
            });
        });
    });
});

//获取所有任务结果列表
router.get('/gettaskresultlist/page', function(req, res, next) {

    var page = Number(req.query.page);
    var rows = Number(req.query.limit);

    var url = "http://" + IPv4 + ":8088/rest/report_task_result/getTaskResultInfo?page=" + page + "&rows=" + rows;

    request({
        url: url,
        method: "GET"
    }, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);

            if (data && data["status"] == "success") {
                var totalCount = data["count"];

                data = data["data"];
                res.status(200).json({
                    success: true,
                    data: data,
                    count: totalCount
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: [],
                    totalCount: 0
                });
            }
        } else {
            res.status(400).json({
                success: false,
                data: [],
                totalCount: 0
            });
        }
    });
    console.log("--------------------------gettaskresultlist-------------------------");
});

//获取特定任务的结果列表
router.get('/gettaskresultlist/page/:task_id', function(req, res, next) {

    var task_id = req.params.task_id;
    console.log("task_id", task_id);
    var page = Number(req.query.page);
    var rows = Number(req.query.limit);

    var url = "http://" + IPv4 + ":8088/rest/report_task_result/getTaskResultInfo?page=" + page + "&rows=" + rows + "&task_id=" + task_id;

    request({
        url: url,
        method: "GET"
    }, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);

            if (data && data["status"] == "success") {
                var totalCount = data["count"];

                data = data["data"];
                res.status(200).json({
                    success: true,
                    data: data,
                    count: totalCount
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: [],
                    totalCount: 0
                });
            }
        } else {
            res.status(400).json({
                success: false,
                data: [],
                totalCount: 0
            });
        }
    });
    console.log("--------------------------gettaskresultlist-------------------------");
});

//获取所有任务结果列表
router.get('/gettaskresultlist/db/page', function(req, res, next) {

    log.debug('GET /res_ne/all_data_with_page');

    var sql_search_condation = " where 1=1 ";

    console.log("report_name: " + req.query.report_name);

    if (req.query.report_name != undefined && req.query.report_name != "") {
        sql_search_condation += sprintf(" and report_name like '%%%s%%' ", req.query.report_name)
    }

    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        console.log("####", req.query);
        var count_sql = "SELECT COUNT(*) AS count FROM report_task_result " + sql_search_condation;
        // 第一次查询 获取记录总数
        conn.query(count_sql, function(err, rows, fields) {
            var totalCount = rows[0].count;
            console.info("totalCount:", totalCount);

            var sql = 'SELECT r.task_id,\
            r.task_name,\
            r.report_name,\
            r.execute_result,\
            DATE_FORMAT(r.start_time, "%Y-%m-%d %H:%i:%S") AS start_time,\
            DATE_FORMAT(r.end_time, "%Y-%m-%d %H:%i:%S") AS end_time,\
            r.time_consuming FROM report_task_result r ' + sql_search_condation;

            sql += sprintf(' LIMIT %d, %d', req.query.start, req.query.limit);
            console.log("##SQL##", sql);

            // 第二次查询 获取记录数组
            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                // if (err) throw  err;
                for (var i in rows) {
                    // console.log(i, rows[i]);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    count: totalCount,
                    data: rows
                });
            });

        });
    });
});

//获取特定任务的结果列表
router.get('/gettaskresultlist/db/page/:task_id', function(req, res, next) {

    log.debug('GET /res_ne/all_data_with_page');

    var task_id = req.params.task_id;
    console.log("task_id", task_id);

    var sql_search_condation = " where 1=1 ";

    if (task_id != undefined && task_id != "") { //如果task_id为空字符串或undefined，则需要过滤出对应任务的结果列表
        //反之，得到所有任务的结果列表
        sql_search_condation += sprintf(" and task_id = %d ", task_id);
    }

    // 从数据库连接池获取连接
    APP.dbpool_report.getConnection(function(err, conn) {

        console.log("####", req.query);
        var count_sql = "SELECT COUNT(*) AS count FROM report_task_result " + sql_search_condation;
        // 第一次查询 获取记录总数
        conn.query(count_sql, function(err, rows, fields) {
            var totalCount = rows[0].count;
            console.info("totalCount:", totalCount);

            var sql = 'SELECT r.task_id,\
            r.task_name,\
            r.report_name,\
            r.execute_result,\
            DATE_FORMAT(r.start_time, "%Y-%m-%d %H:%i:%S") AS start_time,\
            DATE_FORMAT(r.end_time, "%Y-%m-%d %H:%i:%S") AS end_time,\
            r.time_consuming FROM report_task_result r ' + sql_search_condation;

            sql += sprintf(' LIMIT %d, %d', req.query.start, req.query.limit);
            console.log("##SQL##", sql);

            // 第二次查询 获取记录数组
            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                // if (err) throw  err;
                for (var i in rows) {
                    // console.log(i, rows[i]);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    count: totalCount,
                    data: rows
                });
            });

        });
    });
});

module.exports = router;