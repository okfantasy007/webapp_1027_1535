var express = require('express');
var router = express.Router();
var username = 'admin';
var password = 'admin';
var request = require('request');
var viz = require('viz.js');
var async = require('async');

//拓扑常用方法
var topo = {
    maxx: 450, //拓扑视图的x坐标的最大值
    maxy: 450, //拓扑视图的y坐标的最大值
    padding: 100,  //每个节点之间的距离
    centerx: 450 / 2, // 拓扑视图的中心点x坐标
    centery: 450, // 拓扑视图的中心点y坐标
    first: true,
    parenNode: {
        //background_params: JSON.stringify({
        //    "background_type": "map",
        //    "background_opacity": 0.42,
        //    "mapEnable": true,
        //    "mapCenter": {"lng": 117.126646, "lat": 40.109345},
        //    "mapZoom": 8,
        //    "mapType": {
        //        "af": "地图",
        //        "jr": [{"uh": {}, "IV": null, "R_": false, "vw": true, "zIndex": 0, "ba": 2, "f_": true}],
        //        "k": {
        //            "B_": "显示普通地图",
        //            "AE": "",
        //            "fc": 3,
        //            "Zb": 19,
        //            "O2": 3,
        //            "N2": 19,
        //            "Ob": 256,
        //            "GF": "black",
        //            "mD": "",
        //            "we": {},
        //            "tips": "显示普通地图",
        //            "maxZoom": 19
        //        }
        //    }
        //}),
        background_params: null,
        map_hierarchy: ",0,",
        map_parent_id: -1,
        symbol_id: 0,
        tree_parent_id: -1
    },
    /*
     * 方法名：findNodeIndex
     * 功能： 在指定范围内根据指定属性名称查找指定属性值的索引值
     * 入参： 查找的属性值， 查找的范围对象数组， 查找的属性名称
     * 出参： 查找的结果在对象数组中的索引值
     * */
    findNodeIndex: function (nodeid, nodes, name) {
        var findIndex = -1;

        if (nodes) {
            nodes.forEach(function (node, index) {
                if (node[name] == nodeid) {
                    findIndex = index;

                    return false;
                }
            });
        }
        return findIndex;
    },
    /*
     * 方法名：formatNodes
     * 功能： 将指定节点数组格式化成d3需要的格式
     * 入参： 节点对象数珠
     * 出参： 重新整理成d3格式后的节点数组
     * */
    formatNodes: function (nodes) {
        var result = [];
        var path = 'stylesheets/icons/resource/newtopo/symbols/company/'; //图片的路径前缀

        nodes.forEach(function (node, index) {
            var baseNode = {
                symbol_id: node.neid, // 节点id值，必须为数字类型
                symbol_name1: node['user_label'],
                topo_type_id: "11_NMS", // 拓扑类型id
                tree_parent_id: 0, // 节点的父级id值
                display_topo_type_id: null,
                real_res_type_name: "NE",
                res_type_name: "NE",
                map_parent_id: 0,
                map_hierarchy: ",0,202,",
                remark: null,
                minlevel: 0,
                is_locked: 0,
                layout: 2,
                ne_parent_id: 0,
                symbol_style: 1,
                fixed: 1,
                name: node['user_label'],  // 节点的名称，视图中显示的字段
                nodename: node.user_label,
                userlabel: node['user_label'],
                status: node['openflow_status'] == 1 ? 'Online' : 'Offline',
                nodeid: node.openflow_id,
                display_name: "NMS",
                parent_topo_id: node['paren-topo-id'],
                type: node.type,
                ip: node.ip,
                //openflow_id: node.openflow_id
            };

            if (node.x) {
                baseNode.x = node.x;
            }

            if (node.y) {
                baseNode.y = node.y;
            }

            //根据不同的节点类型需要展示的图片
            switch (node.type) {
                case 'sdn':
                {
                    baseNode.img = node['openflow_status'] == 1 ? path + 'company_0.png' : path + 'company_1.png';
                }
                    break;
                case 'ext':
                {
                    baseNode.img = node['openflow_status'] == 1 ? path + 'spliter_0.png' : path + 'spliter_1.png';
                    baseNode.nodeip = node.ip;
                    baseNode.resourceid = node['resource-id'];
                }
                    break;
                case 'cloud':
                {
                    baseNode.img = path + 'clouds/cloud.png';
                    baseNode.cloudStatus = node.cloudStatus;
                }
                    break;
            }

            result.push(baseNode);
        });

        return result;
    },
    /*
     * 方法名：findLinIndex
     * 功能：
     * 入参： 链路对象数组， 节点对象数组， 链路的层级类型
     * 出参： 重新整理成d3格式后的链路对象数组
     * */
    findLinIndex: function (link, links) {
        var findIndex = -1;

        links.forEach(function (localLink, index) {
            var findStr = link['source_node'] + link['source_ltp'] + link['dest_node'] + link['dest_ltp'];
            var localStr = localLink['source_node'] + localLink['source_ltp'] + localLink['dest_node'] + localLink['dest_ltp'];
            var localStrRer = localLink['dest_node'] + localLink['dest_ltp'] + localLink['source_node'] + localLink['source_ltp'];

            if (findStr == localStr || findStr == localStrRer) {
                findIndex = index;
                return;
            }
        });

        return findIndex;
    },
    /*
     * 方法名：formatLinks
     * 功能： 将指定链路数组格式化成d3需要的格式
     * 入参： 链路对象数组， 节点对象数组， 链路的层级类型
     * 出参： 重新整理成d3格式后的链路对象数组
     * */
    formatLinks: function (links, nodes) {
        var result = [];
        var orginLinks = [];

        if (!links || !nodes) {
            return;
        }

        links.forEach(function (link, index) {
            //if(topo.findLinIndex(link, orginLinks) !== -1){
            //    return;
            //}
            var baseLink = {
                color_rgb: null,
                dest_symbol_id: link['dest_neid'],
                direction: 1,
                link_name1: link.id,
                link_symbol_id: index,
                real_res_type_name: "TOPO_MAINVIEW_LINK_SYMBOL",
                remark: null,
                shape: 0,
                src_symbol_id: link['source_neid'],
                style: 0,
                width: 2,
                linkid: link.id,
                source: topo.findNodeIndex(link['source_node'], nodes, 'nodeid'),
                target: topo.findNodeIndex(link['dest_node'], nodes, 'nodeid'),
                status: link['con_status'],
                role: link.role,
                left_node_id: link['source_node'],
                right_node_id: link['dest_node'],
                left_node_userlabel: link['source_user_label'],
                left_node_name: link['source_user_label'],
                left_ltp_user_label: link['source_ltp_name'],
                right_node_userlabel: link['dest_user_label'],
                right_node_name: link['dest_user_label'],
                right_ltp_user_label: link['dest_ltp_name']
            };

            if (link.id && link.id.toString().indexOf('-cloud-link-') !== -1) {
                baseLink.style = 5;
            }

            switch (baseLink.status) {
                case 'Online':
                    baseLink.color = 0;
                    break;
                case 'Offline':
                    baseLink.color = 1;
                    break;
                case 'Unknown':
                    baseLink.color = 6;
                    break;
            }

            result.push(baseLink);
            orginLinks.push(link);
        });

        return result;
    },
    /*
     * 方法名：formatClouds
     * 功能： 将云节点格式化成云对象数组
     * 入参： 要画云的外部节点对象数组
     * 出参： 整理成云对象数组
     * */
    formatClouds: function (clouds) {
        var cloudObj = {};
        var cloudTopo = [];

        //根据要化云的外部节点数组转化为云对象数组
        clouds.forEach(function (node) {
            if (cloudObj[node['parent-topo-id']]) {
                cloudObj[node['parent-topo-id']].push(node);
            } else {
                cloudObj[node['parent-topo-id']] = [];
                cloudObj[node['parent-topo-id']].push(node);
            }
        });

        //云对象数组进一步整理云对象的属性
        for (var cloud in cloudObj) {
            cloudTopo.push({
                id: 'cloud-' + cloud,
                name: 'cloud-' + cloud,
                userlabel: 'cloud-' + cloud,
                'operate-status': 'operate-up',
                img: 'stylesheets/icons/resource/newtopo/symbols/clouds/cloud.png',
                'paren-topo-id': cloud,
                subnets: cloudObj[cloud],
                cloudStatus: 'close',
                type: 'cloud'
            });
        }

        return cloudTopo;
    },
    /*
     * 方法名：searchTopo
     * 功能： 根据查询条件获取查询的拓扑
     * 入参： 要画云的外部节点对象数组
     * 出参： 修改拓扑视图对象中的链路和节点
     * */
    searchTopo: function (query, responseObj) {
        if (query.search_content) {
            var str = query.search_content;
            var search_category = query.search_category;
            var search_node = [];

            if (!query.search_category || !str) {
                return;
            }

            var name = (query.search_category == 'user_label') ? 'userlabel' : 'name';

            responseObj.links = responseObj.links.filter(function (link, index) {
                var findFlag;

                if (query.condition == 'contain') {
                    findFlag = link['left_node_' + name].indexOf(str) !== -1 || link['right_node_' + name].indexOf(str) !== -1;
                } else {
                    findFlag = link['left_node_' + name] == str || link['right_node_' + name] == str;
                }

                if (findFlag) {
                    search_node.push({nodeid: link.left_node_id});
                    search_node.push({nodeid: link.right_node_id});
                    return true;
                } else {
                    return false;
                }
            });

            responseObj.nodes = responseObj.nodes.filter(function (node, index) {
                if (query.condition == 'contain') {
                    if (node.name && node.name.indexOf(str) !== -1) {
                        return true;
                    } else if (topo.findNodeIndex(node.nodeid, search_node, 'nodeid') !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (node.name == str) {
                        return true;
                    } else if (topo.findNodeIndex(node.nodeid, search_node, 'nodeid') !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            });

            responseObj.links.forEach(function (link) {
                link.source = topo.findNodeIndex(link['left_node_id'], responseObj.nodes, 'nodeid');
                link.target = topo.findNodeIndex(link['right_node_id'], responseObj.nodes, 'nodeid');
            });
        }
    },
    /*
     * 方法名：getElineTopo
     * 功能： 将eline层的数转化为拓扑视图数据
     * 入参： 额里呢数据，存储拓扑视图数据的对象
     * 出参： 修改拓扑视图对象中的链路和节点
     * */
    getCloseCloudTopo: function (data) {
        var me = this;
        var extLinks = [];
        var extNodes = [];

        data.extNodes.forEach(function (node) {
            var index = me.findNodeIndex(node.id, data.extCloudNodes, 'id');

            if (index == -1) {
                extNodes.push(node);
            }
        });

        data.extLinks.forEach(function (link) {
            var leftIndex = me.findNodeIndex(link['left-node-id'], data.extCloudNodes, 'id');
            var rightIndex = me.findNodeIndex(link['right-node-id'], data.extCloudNodes, 'id');

            if (leftIndex == -1 && rightIndex !== -1) {
                link['right-node-id'] = 'cloud-' + data.extCloudNodes[rightIndex]['parent-topo-id'];
                extLinks.push(link);
            }

            if (leftIndex !== -1 && rightIndex == -1) {
                link['left-node-id'] = 'cloud-' + data.extCloudNodes[leftIndex]['parent-topo-id'];
                extLinks.push(link);
            }

            if (leftIndex == -1 && rightIndex == -1) {
                extLinks.push(link);
            }
        });

        return {
            extLinks: extLinks,
            extNodes: extNodes
        };
    },
    /*
     * 方法名：getOpenCloudTopo
     * 功能： 将拓扑数据转化为云展开状态下的拓扑视图数据
     * 入参： 拓扑的外部节点、外部链路、外部云节点对象
     * 出参： 指定云展开状态下的外部链路
     * */
    getOpenCloudTopo: function (data, cloud) {
        var extLinks = [];

        //云展开状态下，节点不变，多了云节点， 链路不变，只是增加了外部节点与云之间的链路
        data.extLinks.forEach(function (link) {
            var leftIndex = topo.findNodeIndex(link['left-node-id'], data.extCloudNodes, 'id');
            var rightIndex = topo.findNodeIndex(link['right-node-id'], data.extCloudNodes, 'id');

            if (!(leftIndex !== -1 && rightIndex !== -1)) {
                extLinks.push(link);
            }
        });

        data.extCloudNodes.forEach(function (node) {
            var link = {
                id: node.id + '-cloud-link-' + node['parent-topo-id'],
                'left-node-id': node.id,
                'right-node-id': cloud.id
            };
            extLinks.push(link);
        });

        return extLinks;
    },
    /*
     * 方法名：getPwLspTopo
     * 功能： 获取pw或是lsp层下的拓扑视图数据
     * 入参： 拓扑的外部节点、外部链路、外部云节点对象
     * 出参： 指定云展开状态下的外部链路
     * */
    getBandTopo: function (data, responseObj, query) {
        var me = this;
        var clouds = [];//云节点
        var sdnNodes = [];
        var extNodes = [];
        var sdnLinks = [];
        var extLinks = [];

        if (data.node) {
            data.node.forEach(function (node) {
                node.type = 'sdn';
            });
            sdnNodes = sdnNodes.concat(data.node);
        }

        if (data['ext-node']) {
            data['ext-node'].forEach(function (node) {
                node.type = 'ext';
            });
            extNodes = extNodes.concat(data['ext-node']);
        }

        clouds = me.formatClouds(extNodes);

        //当前是否存在云节点
        if (me['current_clouds']) {
            clouds.forEach(function (cloud) {
                var index = me.findNodeIndex(cloud.id, me['current_clouds'], 'id');

                //最新的云节点存在历史的云节点中，将历史云节点的状态更新到当前的云节点
                if (index !== -1) {
                    cloud.cloudStatus = me['current_clouds'][index].cloudStatus;
                }

                if (query && query.cloudid) {
                    //双击云节点，将该云节点状态更新
                    if (cloud.id == query.cloudid) {
                        cloud.cloudStatus = query.status;
                    }
                }
            });
        }

        me['current_clouds'] = clouds;

        if (data['ext-link']) {
            extLinks = extLinks.concat(data['ext-link']);
        }

        if (data.link) {
            sdnLinks = sdnLinks.concat(data.link);
        }

        var topoData = {
            extNodes: extNodes,
            extLinks: extLinks
        };

        clouds.forEach(function (cloud) {
            topoData.extCloudNodes = cloud.subnets;

            if (cloud.cloudStatus == 'open') {
                topoData.extLinks = me.getOpenCloudTopo(topoData, cloud);
            } else {
                var topo = me.getCloseCloudTopo(topoData);
                topoData.extLinks = topo.extLinks;
                topoData.extNodes = topo.extNodes;
            }
        });

        responseObj.nodes = me.formatNodes(sdnNodes.concat(clouds, topoData.extNodes));
        responseObj.links = me.formatLinks(sdnLinks.concat(topoData.extLinks), responseObj.nodes);
    }
};

//拓扑保存
router.post('/save_layout', function (req, res, next) {
    var nodes = JSON.parse(req.body.nodes);
    var layer = req.body.layer;

    //将node的下x y坐标和背景设置保存
    APP.dbpool.getConnection(function (err, conn) {
        var sql_ary = [], sql;

        for (var i in nodes) {
            sql_ary.push(
                sprintf("\
                SELECT openflow_id \
                FROM   db_isdc.db_topo_layout as a \
                WHERE  a.openflow_id = '%s' AND a.layer = '%s'", nodes[i].nodeid, layer)
            );
        }

        sql = sql_ary.join(";");

        conn.query(sql, function (err, rows, fields) {
            var sqlArry = [], addSql;

            for (var index in rows) {
                if (rows[index].length !== 0) {
                    sqlArry.push(
                        sprintf("UPDATE db_isdc.db_topo_layout SET x=%f, y=%f, background_params='%s' WHERE openflow_id='%s' AND layer='%s'",
                            nodes[index].x, nodes[index].y, req.body.background_params, nodes[index].nodeid, layer)
                    );
                } else {
                    sqlArry.push(
                        sprintf("INSERT INTO db_isdc.db_topo_layout (openflow_id, x, y , layer, background_params) VALUES ('%s', %f, %f, '%s', '%s')",
                            nodes[index].nodeid, nodes[index].x, nodes[index].y, layer, req.body.background_params)
                    );
                }
            }
            addSql = sqlArry.join(";");
            addSql += ';';

            conn.query(addSql, function (err, result) {
                if (err) {
                    console.log(err);
                }

                conn.release();

                res.status(200).json({
                    success: !err,
                    msg: 'success'
                });
            })

        });
    }); // getConnection
});

router.get('/', function (req, res, next) {
    var query = {
        cloudid: req.query.cloudid,
        status: req.query.status
    };

    var responseObj = {
        success: true,
        parentnode: [topo.parenNode],
        maxx: topo.maxx,
        maxy: topo.maxy,
        nodes: [],
        links: []
    };

    //if(body.output['background-params']){
    //    responseObj.parentnode.background_params = body.output['background-params'];
    //}


    //////////////sql/////////////////////////////////////////////
    var nodes = [];
    var links = [];
    var layer = 'band';

    async.waterfall(
        [
            // step 1 func
            function (callback) {
                APP.dbpool.getConnection(function (err, conn) {
                    // call step 2 func
                    callback(null, conn);
                })
            },
            // step 3 func
            function (conn, callback) {
                var sql = sprintf("\
		    		SELECT DISTINCT hostname AS openflow_id,  neid, userlabel AS user_label, resourcestate AS openflow_status,  ipaddress AS ip, x, y, background_params\
                    FROM db_msp.res_ne AS a\
                    INNER JOIN (db_isdc.db_inventory_link AS b\
                    INNER JOIN  db_isdc.db_topology_down_port AS c ON b.dest_ltp=CONCAT(c.openflow_id,':',c.openflow_port) OR b.source_ltp=CONCAT(c.openflow_id,':',c.openflow_port)\
                    )\
                    ON(b.source_neid=a.neid OR b.dest_neid=a.neid)\
                    LEFT  JOIN db_isdc.db_topo_layout AS layout\
                    ON layout.openflow_id=a.hostname AND layout.layer='%s';\
                    ", layer);

                conn.query(sql, function (err, rows, fields) {
                    console.log('==================node=============');
                    if (rows && rows.length > 0) {
                        console.log('=======================node', rows);
                        nodes = rows;

                        if (rows[0].background_params) {
                            topo.parenNode.background_params = rows[0].background_params;
                        }
                    }
                    // call step 4 func
                    callback(null, conn);
                });
            },
            // step 5 func
            function (conn, callback) {
                console.log('==================node=============');

                if (nodes.length > 0) {
                    var sql = sprintf("\
                    SELECT a.id, linkid, source_neid, source_node, source_ltp, dest_neid, dest_ltp, dest_node, con_status,\
                        c.userlabel AS source_user_label ,\
                        d.userlabel AS dest_user_label,\
                        e.port_name AS source_ltp_name,\
                        f.port_name as dest_ltp_name\
                    \
                    FROM db_isdc.db_inventory_link AS a\
                    \
                    INNER JOIN db_isdc.db_topology_down_port AS b ON a.source_ltp=CONCAT(b.openflow_id, ':', b.openflow_port) OR a.dest_ltp=CONCAT(b.openflow_id, ':', b.openflow_port)\
                    \
                    INNER JOIN db_msp.res_ne  AS c ON a.source_neid=c.neid\
                    INNER JOIN db_msp.res_ne AS d ON a.dest_neid=d.neid\
                    \
                    INNER JOIN db_msp.res_port  AS e ON a.source_neid=e.neid AND  a.source_ltp=CONCAT(a.source_node, ':', e.port_index)\
                    INNER JOIN db_msp.res_port AS f ON a.source_neid=f.neid AND  a.dest_ltp=CONCAT(a.dest_node, ':', f.port_index);\
	                ");

                    conn.query(sql, function (err, rows, fields) {
                        console.log('==================link=============');
                        if (rows && rows.length > 0) {
                            console.log('=======================link', rows);
                            links = rows;
                        }
                        // call final func
                        callback(null, conn);
                    });
                } else {
                    // call final func
                    callback(null, conn);
                }
            }
        ],
        // final func
        function (err, conn) {
            conn.release();

            var output = {
                node: nodes,
                link: links
            };

            topo.getBandTopo(output, responseObj, query);

            if (req.query) {
                var queryObj = {
                    search_category: req.query.search_category,
                    search_content: req.query.search_content,
                    condition: req.query.condition
                };

                topo.searchTopo(queryObj, responseObj);
            }

            res.status(200).json(responseObj);
        });
});

//拓扑布局修改
router.post('/new_layout', function (req, res, next) {
    var padding = 64;
    var nodes = JSON.parse(req.body.nodes);
    var links = JSON.parse(req.body.links);
    var engine = req.body.type;

    // 生成dot格式输入
    var ary = [];

    ary.push("graph G {");	// 无向图
    // ary.push("digraph G {"); // 有向图
    ary.push(
        sprintf('\tsize="%d,%d"; margin=%d; ratio=fill;',
            parseInt(req.body.width) - padding * 2,
            parseInt(req.body.height) - padding * 2,
            padding)
    );
    for (var i in nodes) {
        ary.push(sprintf("\t%d;", nodes[i]))
    }

    for (var i in links) {
        // ary.push(sprintf("\t%d -> %d;", links[i].source, links[i].target))  // 有向图
        ary.push(sprintf("\t%d -- %d;", links[i].source, links[i].target));  // 无向图
    }

    ary.push("}");

    var dot = ary.join("\n");

    // 调用viz.js, 输出为文本，按行分割
    // 参考 https://github.com/mdaines/viz.js
    var result = viz(dot, {
        engine: engine,
        format: "plain"
        // format: "json"
    });
    var lines = result.split("\n");

    // 组织结果格式
    var r = {};
    r.nodes = {};
    for (var i in lines) {
        var a = lines[i].split(' ');
        if (a[0].toLowerCase() == 'graph') {
            r.scale = parseFloat(a[1]);
            r.width = parseFloat(a[2]) + padding * 2;
            r.height = parseFloat(a[3]) + padding * 2;
        }
        if (a[0].toLowerCase() == 'node') {
            var n = {};
            n.x = parseFloat(a[2]) + padding;
            n.y = parseFloat(a[3]) + padding;
            r.nodes[a[1]] = n;
        }
    }

    // 针对树形布局，y坐标反转
    if (engine == 'dot') {
        for (var k in r.nodes) {
            r.nodes[k].y = parseFloat(req.body.height) - r.nodes[k].y;
        }
    }

    r.wscale = parseFloat(req.body.height) / r.height;
    r.hscale = parseFloat(req.body.width) / r.width;

    // 返回计算结果
    r.success = r.wscale <= 1 && r.hscale <= 1;
    // console.log(r);
    res.status(200).json(r);
});

module.exports = router;