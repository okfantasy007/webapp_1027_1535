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

//获取所有sdn节点列表 db 接口
router.get('/get_sdn_node_list/:type/db', function(req, res, next) {
    var type = req.params.type;

    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {

        console.log("####", req.query);
        var sql = "select openflow_id, user_label, south_protocol \
        from db_isdc.db_inventory_node as sdn ,db_msp.res_ne as msp \
        where sdn.neid = msp.neid ORDER BY user_label ASC";

        conn.query(sql, function(err, rows, fields) {
            // console.log("####",err, sql);
            if (err) throw  err;
            var data = [];
            if (type == "select") {
                var all = {
                    "id": "",
                    "user-label": "all"
                };
                data.push(all);
            }
            for (var i in rows) {
                var row = {};
                row['id'] = rows[i]['openflow_id'];
                row['user-label'] = rows[i]['user_label'];
                if (rows[i]['openflow_id'] && rows[i]['openflow_id'].indexOf('openflow') !== -1 && parseInt(rows[i]['south_protocol']) == 4) {
                    data.push(row);
                }
            }
            // 释放数据库连接
            conn.release();
            // 返回结果
            res.json(200, {
                success: true,
                data: data
            });
        });
    });

});

//获取所有sdn节点和外部节点列表 db 接口
router.get('/get_all_node_list/:type/db', function(req, res, next) {
    var type = req.params.type;

    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {

        console.log("####", req.query);
        var sql = "select openflow_id, userlabel, south_protocol \
        from db_isdc.db_inventory_node as sdn ,db_msp.res_ne as msp \
        where sdn.neid = msp.neid ORDER BY userlabel ASC";

        conn.query(sql, function(err, rows, fields) {
            // console.log("####",err, sql);
            if (err) throw  err;
            var data = [];
            if (type == "select") {
                var all = {
                    "id": "",
                    "user-label": "all"
                };
                data.push(all);
            }
            for (var i in rows) {
                var row = {};
                row['id'] = rows[i]['openflow_id'];
                row['user-label'] = rows[i]['userlabel'];
                if (rows[i]['openflow_id'] && rows[i]['openflow_id'].indexOf('openflow') !== -1 && parseInt(rows[i]['south_protocol']) == 4) {
                    row['type'] = 'sdn';
                } else {
                    row['type'] = 'ext';
                }
                data.push(row);
            }
            // 释放数据库连接
            conn.release();
            // 返回结果
            res.json(200, {
                success: true,
                data: data
            });
        });
    });

});

//获取所有sdn节点和外部节点列表 rest接口
router.get('/get_all_node_list/:type', function(req, res, next) {
    var type = req.params.type;

    //http://172.16.75.111:8181/restconf/operational/sptn-net-topology:net-topology
    request({
        url: IPv4 + "/restconf/operational/sptn-net-topology:net-topology",
        method: "GET",
        headers: {
            'authorization': _auth
        }
    }, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            // console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);
            var allnodes = [];
            if (data["net-topology"]["nodes"] && data["net-topology"]["nodes"]["node"]) {
                var nodes = data["net-topology"]["nodes"]["node"];
                var nodelist = [];
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    node["type"] = "sdn";
                    if (node["id"].toString().indexOf("openflow") !== -1) {
                        nodelist.push(node);
                    }
                }
                nodelist.sort(function(a, b) {
                    var index_a = a["id"].indexOf(":");
                    var index_b = b["id"].indexOf(":");
                    return Number(a["id"].substring(index_a + 1)) - Number(b["id"].substring(index_b + 1));
                });
                allnodes = allnodes.concat(nodelist);
            }


            if (data["net-topology"]["ext-nodes"] && data["net-topology"]["ext-nodes"]["ext-node"]) {
                var extnodes = data["net-topology"]["ext-nodes"]["ext-node"];
                var extnodelist = [];
                for (var i = 0; i < extnodes.length; i++) {
                    var extnode = extnodes[i];
                    extnode["type"] = "ext";
                    extnode["id"] = extnode.id;
                    extnodelist.push(extnode);
                }
                allnodes = nodelist.concat(extnodelist);
            }

            if (type == "select") {
                var all = [{
                    "id": "",
                    "user-label": "all"
                }];
                allnodes = all.concat(allnodes);
            }
            res.status(200).json({
                success: true,
                data: allnodes
            });

        } else {
            res.status(response.statusCode).json({
                success: false,
                data: []
            });
        }
    });
    console.log("--------------------------get_all_node_list-------------------------");
});

//获取sdn节点和外部节点的用户标识 rest接口
router.get('/get_node_userlabel/:nodeid/:nodetype', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/opendaylight-inventory:nodes/node/openflow:2
    var nodeId = req.params.nodeid;
    var nodeType = req.params.nodetype;
    if (nodeType == 'sdn') {
        request({
            url: IPv4 + "/restconf/operational/opendaylight-inventory:nodes/node/" + nodeId,
            method: "GET",
            headers: {
                'authorization': _auth
            }
        }, function(error, response, data) {

            if (!error && response.statusCode == 200) {
                // console.log("response header: " + JSON.stringify(response.headers));
                console.log("success");
                var data = JSON.parse(data);
                data = data["node"][0]["sdn-inventory:user-label"];
                if (data) {
                    res.send(200, data);
                } else {
                    res.send(400);
                }
            } else {
                res.send(response.statusCode);
            }
        });

    } else if (nodeType == 'ext') {
        request({
            url: IPv4 + "/restconf/operational/sptn-net-topology:net-topology/ext-nodes/ext-node/" + nodeId,
            method: "GET",
            headers: {
                'authorization': _auth
            }
        }, function(error, response, data) {

            if (!error && response.statusCode == 200) {
                // console.log("response header: " + JSON.stringify(response.headers));
                console.log("success");
                var data = JSON.parse(data);
                data = data["ext-node"][0]["user-label"];
                if (data) {
                    res.send(200, data);
                } else {
                    res.send(400);
                }
            } else {
                res.send(response.statusCode);
            }
        });

    }

    console.log("--------------------------get_node_userlabel-------------------------");
});

//获取sdn节点和外部节点的用户标识 db 接口
router.get('/get_node_userlabel/:nodeid/:nodetype/db', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/opendaylight-inventory:nodes/node/openflow:2
    var nodeId = req.params.nodeid;
    var nodeType = req.params.nodetype;

    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {

        console.log("####", req.query);
        var sql = "SELECT user_label FROM db_isdc.db_inventory_node where openflow_id = ";
        sql += sprintf(" '%s'", nodeId);

        conn.query(sql, function(err, rows, fields) {
            // console.log("####",err, sql);
            if (err) throw  err;
            // 释放数据库连接
            conn.release();
            // 返回结果
            res.send(200, rows[0]['user_label']);
        });
    });

    console.log("--------------------------get_node_userlabel-------------------------");
});


//获取sdn节点和外部节点的端口用户标识 rest接口
router.get('/get_port_userlabel/:nodeid/:portnum/:nodetype', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/opendaylight-inventory:nodes/node/openflow:81/node-connector/openflow:81:9
    var nodeId = req.params.nodeid;
    var portNum = req.params.portnum;
    var connId = nodeId + ":" + portNum;
    var nodeType = req.params.nodetype;
    if (nodeType == 'sdn') {
        request({
            url: IPv4 + "/restconf/operational/opendaylight-inventory:nodes/node/" + nodeId + "/node-connector/" + connId,
            method: "GET",
            headers: {
                'authorization': _auth
            }
        }, function(error, response, data) {

            if (!error && response.statusCode == 200) {
                // console.log("response header: " + JSON.stringify(response.headers));
                console.log("success");
                var data = JSON.parse(data);
                data = data["node-connector"][0]["sdn-inventory:user-label"];
                if (data) {
                    res.send(200, data);
                } else {
                    res.send(400);
                }
            } else {
                res.send(response.statusCode);
            }
        });

    } else {
        res.send(200, 'UNKNOWN');
    }

    console.log("--------------------------get_port_userlabel-------------------------");
});

//获取sdn节点和外部节点的端口用户标识 db 接口
router.get('/get_port_userlabel/:nodeid/:portnum/:nodetype/db', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/opendaylight-inventory:nodes/node/openflow:2
    var nodeId = req.params.nodeid;
    var portNum = req.params.portnum;
    var nodeType = req.params.nodetype;

    if (nodeType == 'sdn') {
        // 从数据库连接池获取连接
        APP.dbpool.getConnection(function(err, conn) {

            console.log("####", req.query);
            var sql = "select port_name from db_isdc.db_inventory_node ,db_msp.res_port where \
        db_isdc.db_inventory_node.neid = db_msp.res_port.neid \
         and db_isdc.db_inventory_node.openflow_id = ";
            sql += sprintf(" '%s' and port_index = %d", nodeId, portNum);

            conn.query(sql, function(err, rows, fields) {
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.send(200, rows[0]['port_name']);
            });
        });
    } else {
        res.send(200, 'UNKNOWN');
    }

    console.log("--------------------------get_port_userlabel-------------------------");
});

//获取sdn节点和外部节点的端口列表 db 接口
router.get('/get_port_list/:type/:nodeid/db', function(req, res, next) {

    var type = req.params.type;
    var nodeId = req.params.nodeid;

    if (nodeId == '-1') {
        res.status(400).json({
            success: false,
            data: []
        });
        return;
    }
    if (type == "ext") {
        res.status(200).json({
            success: true,
            data: [{
                "port-id": "1",
                "user-label": "UNKNOWN"
            }]
        });
    } else if (type == "sdn") {
        // 从数据库连接池获取连接
        APP.dbpool.getConnection(function(err, conn) {

            console.log("####", req.query);

            var sql = "select openflow_id,port_index, port_name\
        from db_isdc.db_inventory_node ,db_msp.res_port where\
        db_isdc.db_inventory_node.neid = db_msp.res_port.neid and\
         db_isdc.db_inventory_node.openflow_id =";

            sql += sprintf(" '%s' ORDER BY port_name ASC", nodeId);

            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                if (err) throw  err;
                var data = [];
                for (var i in rows) {
                    var row = {};
                    row['port-id'] = rows[i]['openflow_id'] + ":" + rows[i]['port_index'];
                    row['user-label'] = rows[i]['port_name'];
                    data.push(row);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    data: data
                });
            });
        });

    }

    console.log("--------------------------get_port_list-------------------------");
});

//获取sdn节点和外部节点的端口列表 rest接口
router.get('/get_port_list/:type/:nodeid', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/opendaylight-inventory:nodes/node/openflow:2
    var nodeId = req.params.nodeid;
    var type = req.params.type;
    if (nodeId == '-1') {
        res.status(400).json({
            success: false,
            data: []
        });
        return;
    }
    if (type == "ext") {
        res.status(200).json({
            success: true,
            data: [{
                "port-id": "1",
                "user-label": "UNKNOWN"
            }]
        });

    } else if (type == "sdn") {
        request({
            url: IPv4 + "/restconf/operational/opendaylight-inventory:nodes/node/" + nodeId,
            method: "GET",
            headers: {
                'authorization': _auth
            }
        }, function(error, response, data) {

            if (!error && response.statusCode == 200) {
                // console.log("response header: " + JSON.stringify(response.headers));
                console.log("success");

                var data = JSON.parse(data);
                data = data["node"][0]["node-connector"];
                if (data) {
                    var port_list = [];
                    data.forEach(function(port) {
                        if (port.id.indexOf("LOCAL") == -1) {
                            var aport = {};
                            aport["port-id"] = port.id;
                            aport["user-label"] = port["sdn-inventory:user-label"];
                            port_list.push(aport);
                        }
                    });
                    res.status(200).json({
                        success: true,
                        data: port_list
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        data: []
                    });
                }

            } else {
                res.status(response.statusCode).json({
                    success: false,
                    data: []
                });
            }
        });

    }

    console.log("--------------------------get_port_list-------------------------");
});

//获取外部节点列表 rest接口
router.get('/get_extnode_list', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/sptn-net-topology:net-topology/ext-nodes
    request({
        url: IPv4 + "/restconf/operational/sptn-net-topology:net-topology/ext-nodes",
        method: "GET",
        headers: {
            'authorization': _auth
        }
    }, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            // console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);
            if (data['ext-nodes'] && data['ext-nodes']['ext-node']) {
                data = data['ext-nodes']['ext-node'];
                res.status(200).json({
                    success: true,
                    data: data
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: []
                });
            }
        } else {
            res.status(response.statusCode).json({
                success: false,
                data: []
            });
        }
    });
    console.log("--------------------------get_extnode_list-------------------------");
});

//获取外部节点列表 db 接口
router.get('/get_extnode_list/db', function(req, res, next) {

    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {

        console.log("####", req.query);
        /*var sql = "select openflow_id, user_label, south_protocol \
        from db_isdc.db_inventory_node as sdn ,db_msp.res_ne as msp \
        where sdn.neid = msp.neid ORDER BY user_label ASC";
*/
        var sql = "select neid, userlabel, netypeid \
        from db_msp.res_ne as msp \
        ORDER BY userlabel ASC";

        conn.query(sql, function(err, rows, fields) {
            // console.log("####",err, sql);
            if (err) throw  err;
            var data = [];
            for (var i in rows) {
                var row = {};
                row['id'] = rows[i]['neid'];
                row['user-label'] = rows[i]['userlabel'];
                if (parseInt(rows[i]['netypeid']) == 703) {//南向协议为4的为sdn节点，不为4的为外部节点
                    data.push(row);
                }
            }
            // 释放数据库连接
            conn.release();
            // 返回结果
            res.json(200, {
                success: true,
                data: data
            });
        });
    });
    console.log("--------------------------get_extnode_list-------------------------");
});

//获取内部链路（sdn设备与sdn设备相连）列表 rest接口
router.get('/get_link_list', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operations/sptn-net-topology:get-all-links-info
    var input = {
        "input": {}
    };

    // console.log("length", JSON.stringify(input).length);

    var headers = {
        'content-type': "application/json",
        'content-length': JSON.stringify(input).length,
        'authorization': _auth
    };

    var options = {
        url: IPv4 + '/restconf/operations/sptn-net-topology:get-all-links-info',
        method: 'POST',
        body: JSON.stringify(input),
        headers: headers
    };

    input = JSON.stringify(input);
    // console.log(input);

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            // console.log("data", data);
            if (data) {
                res.status(200).json({
                    success: true,
                    data: data
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: []
                });
            }
        } else {
            res.status(response.statusCode).json({
                success: false,
                data: []
            });
        }
    });
    console.log("--------------------------get_link_list-------------------------");
});

//获取包含特定外部节点的外部链路列表 rest接口
router.get('/get_extlink_list/:extnode', function(req, res, next) {

    //http://172.16.75.111:8181/restconf/operational/sptn-net-topology:net-topology/ext-links
    request({
        url: IPv4 + "/restconf/operational/sptn-net-topology:net-topology/ext-links",
        method: "GET",
        headers: {
            'authorization': _auth
        }
    }, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            // console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);
            if (data['ext-links'] && data['ext-links']['ext-link']) {
                data = data['ext-links']['ext-link'];
                var extlinklist = [];
                data.forEach(function(extlink) {
                    if (extlink.id.indexOf("-reverse") == -1) {
                        extlinklist.push(extlink);
                    }
                });
                var extnode = req.params.extnode;
                if (extnode !== "-1") {
                    extlinklist = extlinklist.filter(function(extlink) {
                        var result = false;
                        if (extlink['right-node-id'].indexOf(extnode) !== -1) {
                            result = true;
                        }
                        return result;
                    });
                }
                res.status(200).json({
                    success: true,
                    data: extlinklist
                });
            } else {
                res.status(400).json({
                    success: false,
                    data: []
                });
            }
        } else {
            res.status(response.statusCode).json({
                success: false,
                data: []
            });
        }
    });
    console.log("--------------------------get_extlink_list-------------------------");
});

//获取所有内外部链路列表 db 接口
router.get('/get_all_link_list/db', function(req, res, next) {

    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {

        console.log("####", req.query);
        var sql = "SELECT linkid, link_name \
        from db_isdc.db_inventory_link as sdn ,db_msp.topo_link as msp \
        WHERE sdn.id = msp.link_id ORDER BY link_name ASC";

        conn.query(sql, function(err, rows, fields) {
            // console.log("####",err, sql);
            if (err) throw  err;
            var data = [];
            for (var i in rows) {
                var row = {};
                row['id'] = rows[i]['linkid'];
                row['user-label'] = rows[i]['link_name'];
                data.push(row);
            }
            // 释放数据库连接
            conn.release();
            // 返回结果
            res.json(200, {
                success: true,
                data: data
            });
        });
    });
    console.log("--------------------------get_all_link_list-------------------------");
});

//获取包含特定外部节点的外部链路列表 db 接口
router.get('/get_extlink_list/:extnode/db', function(req, res, next) {

    var extNode = req.params.extnode;

    if (extNode !== '-1') {
        // 从数据库连接池获取连接
        APP.dbpool.getConnection(function(err, conn) {

            console.log("####", req.query);
/*            var sql = "SELECT linkid, link_name \
        from db_isdc.db_inventory_link as sdn ,db_msp.topo_link as msp \
        WHERE sdn.id = msp.link_id and (sdn.source_node = ";
            sql += sprintf(" '%s' or sdn.dest_node = '%s') ", extNode, extNode);
            sql += sprintf("ORDER BY link_name ASC");*/

            var sql = "SELECT link_symbol_id,link_name1 FROM\
            db_msp.topo_link_symbol AS sdn1,\
            db_msp.topo_symbol sdn2 \
            WHERE\
            (\
                sdn1.src_symbol_id = sdn2.symbol_id \
                OR sdn1.dest_symbol_id = sdn2.symbol_id \
            ) \
            AND sdn2.ne_id = ";
            sql += sprintf("%d", extNode);
            sql += " ORDER BY link_name1";

            conn.query(sql, function(err, rows, fields) {
                // console.log("####",err, sql);
                if (err) throw  err;
                var data = [];
                for (var i in rows) {
                    var row = {};
                    row['id'] = rows[i]['link_symbol_id'];
                    row['user-label'] = rows[i]['link_name1'];
                    data.push(row);
                }
                // 释放数据库连接
                conn.release();
                // 返回结果
                res.json(200, {
                    success: true,
                    data: data
                });
            });
        });

    } else {
        res.json(400, {
            success: false,
            data: []
        });
    }
    console.log("--------------------------get_extlink_list-------------------------");
});

//获取特定外部链路的用户标识 db 接口
router.get('/get_extlink_userlabel/:extlink/db', function(req, res, next) {
    var extlink = req.params.extlink;

    // 从数据库连接池获取连接
    APP.dbpool.getConnection(function(err, conn) {

        console.log("####", req.query);
        var sql = "SELECT link_name \
        from db_isdc.db_inventory_link as sdn ,db_msp.topo_link as msp \
        WHERE sdn.id = msp.link_id and sdn.linkid = ";
        sql += sprintf(" '%s'", extlink);

        conn.query(sql, function(err, rows, fields) {
            // console.log("####",err, sql);
            if (err) throw  err;
            // 释放数据库连接
            conn.release();
            // 返回结果
            res.send(200, rows[0]['link_name']);

        });
    });
    console.log("--------------------------get_extlink_userlabel-------------------------");
});

//获取特定外部链路的用户标识 rest接口
router.get('/get_extlink_userlabel/:extlink', function(req, res, next) {
    var extlink = req.params.extlink;
    //http://172.16.75.111:8181/restconf/operational/sptn-net-topology:net-topology/ext-links
    request({
        url: IPv4 + "/restconf/operational/sptn-net-topology:net-topology/ext-links/ext-link/" + extlink,
        method: "GET",
        headers: {
            'authorization': _auth
        }
    }, function(error, response, data) {

        if (!error && response.statusCode == 200) {
            // console.log("response header: " + JSON.stringify(response.headers));
            console.log("success");
            var data = JSON.parse(data);
            if (data && data['ext-link'] && data['ext-link'][0]) {
                res.send(200, data['ext-link'][0]['user-label']);
            } else {
                res.send(400);
            }
        } else {
            res.send(response.statusCode);
        }
    });
    console.log("--------------------------get_extlink_userlabel-------------------------");
});

//修改节点的用户标识 rest接口
router.post('/update_userlabel', function(req, res, next) {
    var nodeId = req.body.nodeid;
    var nodeUserLabel = req.body.nodeuserlabel;
    // console.log('nodeId:' + nodeId);
    // console.log('nodeUserLabel:' + nodeUserLabel);
    var input = {
        "input": {
            "id": nodeId,
            "user-label": nodeUserLabel
        }
    };

    // console.log("length", JSON.stringify(input).length);

    var headers = {
        'content-type': "application/json",
        'content-length': JSON.stringify(input).length,
        'authorization': _auth
    };

    var options = {
        url: 'http://172.16.61.228:8181/restconf/operations/sdn-inventory:config-node-info',
        method: 'POST',
        body: JSON.stringify(input),
        headers: headers
    };

    input = JSON.stringify(input);
    // console.log(input);

    request(options, function(error, response, data) {
        if (!error && response.statusCode == 200) {
            // console.log("data", data);
            res.status(200).json({
                success: true
            });
        } else {
            res.status(response.statusCode).json({
                success: false
            });
        }
    });
    console.log("--------------------------update_userlabel-------------------------");
});

router.post('/saveNodeConnInfo', function(req, res, next) {
    var body = {
        "input": req.body.input
    };

    var options = {
        url: IPv4 + '/restconf/operations/cli:' + req.body.protocal,
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        if (!err && response && response.statusCode == 200) {
            // console.log("data", data);
            res.status(200).json({
                success: true
            });
        } else {
            res.status(response.statusCode).json({
                success: false
            });
        }

    });
});
router.post('/getNodeConnInfo', function(req, res, next) {
    var body = {
        "input": req.body.input
    };

    var options = {
        url: IPv4 + '/restconf/operations/cli:' + req.body.protocal,
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options, function(err, response, data) {
        if(!response){
            res.status(400).json({
                success: false,
                data: null
            });
            return;
        }

        if (!err && response && response.statusCode == 200) {

            var nodeConnData = null;
            data = JSON.parse(data);

            if (data.output["ssh-list"]) {
                var orgData = data.output["ssh-list"][0];
                nodeConnData = {};
                nodeConnData.name = orgData["username"];
                nodeConnData.pwd = orgData["passwd"];
            }

            res.status(200).json({
                success: true,
                data: nodeConnData
            });
        } else {
            res.status(response.statusCode).json({
                success: false,
                data: null
            });
        }

    });
});

module.exports = router;