var express = require('express');
var router = express.Router();
var username = 'admin';
var password = 'admin';
var request = require('request');
var viz = require('viz.js');
var _auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
var urlPre = 'http://' +  APP.sdn_rest.host + ':' + APP.sdn_rest.port;

//拓扑常用方法
var topo = {
    maxx: 450, //拓扑视图的x坐标的最大值
    maxy: 450, //拓扑视图的y坐标的最大值
    padding: 100,  //每个节点之间的距离
    centerx: 450 / 2, // 拓扑视图的中心点x坐标
    centery: 450, // 拓扑视图的中心点y坐标
    parenNode: {
        //background_params:JSON.stringify( {
        //    "background_type": "map",
        //    "background_opacity": 0.42,
        //    "mapEnable": true,
        //    "mapCenter": {
        //        "lng": 117.692363,
        //        "lat": 34.663649
        //    },
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
    ingressNodes : {
        id: [],
        userlabel:[],
        ltp_id: [],
        ltp_name: []
    },
    egressNodes : {
        id: [],
        userlabel: [],
        ltp_id: [],
        ltp_name: []
    },
    /*
     * 方法名：findNodeIndex
     * 功能： 在指定范围内根据指定属性名称查找指定属性值的索引值
     * 入参： 查找的属性值， 查找的范围对象数组， 查找的属性名称
     * 出参： 查找的结果在对象数组中的索引值
     * */
    findNodeIndex: function (nodeid, nodes, name) {
        var findIndex = -1;

        if(nodes){
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
    formatNodes: function(nodes){
        var result = [];
        var path = 'stylesheets/icons/resource/newtopo/symbols/company/'; //图片的路径前缀

        var sourceCount = 0;
        var targetCount = 0;

        nodes.forEach(function (node, index) {
            var baseNode = {
                symbol_id: node['ne-id'], // 节点id值，必须为数字类型
                symbol_name1: node.userlabel,
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
                symbols: [],
                name: node.userlabel,  // 节点的名称，视图中显示的字段
                nodename: node.userlabel,
                userlabel: node.userlabel,
                ip: node.ip,
                nodeid: node.id,
                display_name: "NMS",
                parent_topo_id: node['paren-topo-id'],
                type: node.type,
                status: node['openflow-status']
            };

            //根据不同的节点类型需要展示的图片和相关的特性
            switch (node.type){
                case 'sdn': baseNode.img = node['openflow-status'] == 'up' ? path + 'company_0.png' :  path + 'company_1.png'; break;
                case 'ext': {
                    baseNode.img = node['openflow-status'] == 'up' ? path + 'spliter_0.png' :  path + 'spliter_1.png';
                } break;
                case 'cloud': {
                    baseNode.img =  path + 'clouds/cloud.png';
                    baseNode.cloudStatus = node.cloudStatus;
                } break;
            }

            //根据节点的源宿确定eline的坐标
            if(node.x){
                baseNode.x = node.x;
            }

            if(node.y){
                baseNode.y = node.y;
            }

            result.push(baseNode);
        });

        return result;
    },

    /*
     * 方法名：formatLinks
     * 功能： 将指定链路数组格式化成d3需要的格式
     * 入参： 链路对象数组， 节点对象数组， 链路的层级类型
     * 出参： 重新整理成d3格式后的链路对象数组
     * */
    formatLinks: function (links, nodes, linktype) {
        var result = [];

        if (!linktype || !links || !nodes) {
            return;
        }

        links.forEach(function (link, index) {
            var baseLink = {
                color_rgb: null,
                dest_symbol_id: link['right-node-id'],
                direction: 2,
                link_name1: link.name,
                link_symbol_id: index,
                real_res_type_name: "TOPO_MAINVIEW_LINK_SYMBOL",
                remark: null,
                shape: 0,
                src_symbol_id: link['left-node-id'],
                style: 0,
                width: 5,
                linkid: link.id,
                source: topo.findNodeIndex(link['left-node-id'], nodes, 'nodeid'),
                target: topo.findNodeIndex(link['right-node-id'], nodes, 'nodeid'),
                role: link.role,
                left_node_id: link['left-node-id'],
                right_node_id: link['right-node-id'],
                left_node_userlabel: link['left-node-user-label'],
                right_node_userlabel: link['right-node-user-label'],
                left_ltp_name: link['left-ltp-name'],
                right_ltp_name: link['right-ltp-name'],
                status: link['openflow-status']
            };

            //根据不同类型确定link的相关属性
            switch (linktype) {
                case 'eline': {
                    baseLink.eline_userlabel = link['eline-userlabel'];
                    baseLink.eline_id = link['eline-id'];
                    baseLink.left_vlan = link['left-vlan-list'];
                    baseLink.right_vlan = link['right-vlan-list'];
                    baseLink.color = (link['openflow-status'] == 'up') ? 0 : 1;

                    var sourceCount = topo.ingressNodes.id.length;
                    var destCount = topo.egressNodes.id.length;

                    if(sourceCount > 0 && destCount > 0){
                        baseLink.relation = sourceCount + '-' + destCount;
                        baseLink.left_node_userlabel = topo.ingressNodes.userlabel.join(',');
                        baseLink.right_node_userlabel = topo.egressNodes.userlabel.join(',');
                    }

                }break;
                case 'pw': {
                    baseLink.eline_name = link['eline-name'];
                    baseLink.eline_id = link['eline-id'];
                    baseLink.pw_id = link['pw-id'];
                    baseLink.pw_name = link['pw-name'];
                    baseLink.work_status = link['work-status'];
                    baseLink.oam_status = link['oam-status'];

                    if(link['openflow-status'] == 'up'){
                        baseLink.color = 0;
                    }else{
                        if(baseLink.work_status == baseLink.role){
                            baseLink.color = 0;
                        }else{
                            baseLink.color = 7;
                        }
                    }
                }break;
                case 'lsp': {
                    baseLink.lsp_userlabel = link['lsp-userlabel'];
                    baseLink.lsp_id = link['lsp-id'];
                    baseLink.lsp_name = link['lsp-name'];
                    baseLink.tunnel_id = link['tunnel-id'];
                    baseLink.backward_label = link['backward-label'];
                    baseLink.backward_vlan = link['backward-vlan'];
                    baseLink.forward_label = link['forward-label'];
                    baseLink.forward_vlan = link['forward-vlan'];
                    baseLink.work_status = link['work-status'];
                    baseLink.oam_status = link['oam-status'];

                    if(link['openflow-status'] == 'up'){
                        baseLink.color = 0;
                    }else{
                        if(baseLink.work_status == baseLink.role){
                            baseLink.color = 0;
                        }else{
                            baseLink.color = 7;
                        }
                    }
                }break;
            }

            result.push(baseLink);
        });

        return result;
    },
    /*
     * 方法名：formatClouds
     * 功能： 将云节点格式化成云对象数组
     * 入参： 要画云的外部节点对象数组
     * 出参： 整理成云对象数组
     * */
    formatClouds: function(clouds){
        var cloudObj = {};
        var cloudTopo = [];

        //根据要化云的外部节点数组转化为云对象数组
        clouds.forEach(function(node){
            if(cloudObj[node['parent-topo-id']]){
                cloudObj[node['parent-topo-id']].push(node);
            }else{
                cloudObj[node['parent-topo-id']] = [];
                cloudObj[node['parent-topo-id']].push(node);
            }
        });

        //云对象数组进一步整理云对象的属性
        for(var cloud in cloudObj){
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

            //从link中找到包含该查找的内容的link
            responseObj.links = responseObj.links.filter(function (link, index) {
                var findFlag;

                if (query.condition == 'contain') {
                    findFlag = link['left_node_' + search_category].indexOf(str) !== -1 || link['right_node_' + search_category].indexOf(str) !== -1;
                } else {
                    findFlag = link['left_node_' + search_category] == str || link['right_node_' + search_category] == str;
                }

                if (findFlag) {
                    search_node.push({nodeid: link.left_node_id});
                    search_node.push({nodeid: link.right_node_id});
                    return true;
                } else {
                    return false;
                }
            });

            //从nodes中查找存在该字符串的node
            var name = query.search_category == 'name' ? 'name' : 'userlabel';
            responseObj.nodes = responseObj.nodes.filter(function (node, index) {
                if (query.condition == 'contain') {
                    if (node[name].indexOf(str) !== -1) {
                        return true;
                    } else if (topo.findNodeIndex(node.nodeid, search_node, 'nodeid') !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (node[name] == str) {
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
    getElineTopo: function(data, responseObj){
        var nodes = [];
        var links = [];

        topo.ingressNodes = {
            id: [],
                userlabel:[],
                ltp_id: [],
                ltp_name: []
        };

        topo.egressNodes = {
            id: [],
                userlabel: [],
                ltp_id: [],
                ltp_name: []
        };

        if(data['eline-node-list']){
            data['eline-node-list'].forEach(function(node){
                node.type = 'sdn';
                node.id = node['openflow-id'];

                if(node['node-position'] == 'ingress'){
                    topo.ingressNodes.id.push(node.id);
                    topo.ingressNodes.userlabel.push(node.userlabel);
                }else if(node['node-position'] == 'egress'){
                    topo.egressNodes.id.push(node.id);
                    topo.egressNodes.userlabel.push(node.userlabel);
                }
            });
            nodes = nodes.concat(data['eline-node-list']);
        }

        if(data['eline-ext-node-list']){
            this.elineExtNodes = data['eline-ext-node-list'];
            data['eline-ext-node-list'].forEach(function(node){
                node.type = 'ext';
                node.id = node['openflow-id'];

                if(node['node-position'] == 'ingress'){
                    topo.ingressNodes.id.push(node.id);
                    topo.ingressNodes.userlabel.push(node.userlabel);
                }else if(node['node-position'] == 'egress'){
                    topo.egressNodes.id.push(node.id);
                    topo.egressNodes.userlabel.push(node.userlabel);
                }
            });
            nodes = nodes.concat(data['eline-ext-node-list']);
        }
        nodes = this.formatNodes(nodes);

        if(data['eline-link-list']){
            links = links.concat(this.formatLinks(data['eline-link-list'], nodes,  'eline'));
        }

        responseObj.nodes = nodes;
        responseObj.links = links;
    },
    /*
     * 方法名：getCloseCloudTopo
     * 功能： 将拓扑数据转化为云非展开状态下的拓扑视图数据
     * 入参： 拓扑的外部节点、外部链路、外部云节点对象
     * 出参： 指定云非展开状态下的外部节点和链路
     * */
    getCloseCloudTopo: function(data){
        var me = this;
        var extLinks = [];
        var extNodes = [];

        data.extNodes.forEach(function(node){
            var index =  me.findNodeIndex(node.id, data.extCloudNodes, 'id');

            if(index == -1){
                extNodes.push(node);
            }
        });

        data.extLinks.forEach(function(link){
            var leftIndex = me.findNodeIndex(link['left-node-id'], data.extCloudNodes, 'id');
            var rightIndex = me.findNodeIndex(link['right-node-id'], data.extCloudNodes, 'id');

            if(leftIndex == -1 && rightIndex !== -1){
                link['right-node-id'] = 'cloud-' + data.extCloudNodes[rightIndex]['parent-topo-id'];
                extLinks.push(link);
            }

            if(leftIndex !== -1 && rightIndex == -1){
                link['left-node-id'] = 'cloud-' + data.extCloudNodes[leftIndex]['parent-topo-id'];
                extLinks.push(link);
            }

            if(leftIndex == -1 && rightIndex == -1){
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
        data.extLinks.forEach(function(link){
            var leftIndex = topo.findNodeIndex(link['left-node-id'], data.extCloudNodes, 'id');
            var rightIndex = topo.findNodeIndex(link['right-node-id'], data.extCloudNodes, 'id');

            if(!(leftIndex !== -1 && rightIndex !== -1)){
                extLinks.push(link);
            }
        });

        data.extCloudNodes.forEach(function(node){
            var link = {
                id: node.id + '-cloud-link-' +node['parent-topo-id'],
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
    getPwLspTopo: function(data, responseObj, type, query){
        var me = this;
        var elineExtNodes = this.elineExtNodes;
        var drawExtNodes = [];// 要画云的外部节点
        var unDrawExtNodes = []; //不画云的节点
        var clouds = [];//云节点
        var sdnNodes = [];
        var extNodes = [];
        var sdnLinks = [];
        var extLinks = [];

        if(data[type + '-node-list']){
            data[type + '-node-list'].forEach(function(node){
                node.type = 'sdn';
                node.id = node['openflow-id'];
            });
            sdnNodes = sdnNodes.concat(data[type + '-node-list']);
        }

        if(data[type + '-ext-node-list']){
            data[type + '-ext-node-list'].forEach(function (node) {
                node.type = 'ext';
                node.id = node['openflow-id'];

                //外部节点不在eline层的宿节点中为需要画云
                if(me.findNodeIndex(node.id, elineExtNodes, 'id') == -1){
                    drawExtNodes.push(node);
                }else{ //外部节点在eline层的宿节点中为不需要画云
                    unDrawExtNodes.push(node);
                }
            });
            extNodes =  extNodes.concat(data[type + '-ext-node-list']);
        }

        clouds = me.formatClouds(drawExtNodes);

        //当前是否存在云节点
        if(me[type + '_current_clouds']){
            clouds.forEach(function(cloud){
                var index = me.findNodeIndex(cloud.id, me[type + '_current_clouds'], 'id');

                //最新的云节点存在历史的云节点中，将历史云节点的状态更新到当前的云节点
                if( index !== -1){
                    cloud.cloudStatus = me[type + '_current_clouds'][index].cloudStatus;
                }

                if(query &&  query.cloudid){
                    //双击云节点，将该云节点状态更新
                    if(cloud.id == query.cloudid){
                        cloud.cloudStatus = query.status;
                    }
                }
            });
        }

        me[type + '_current_clouds'] = clouds;

        if(data[type + '-ext-link-list']){
            extLinks = extLinks.concat(data[type + '-ext-link-list']);
        }

        if(data[type + '-link-list']){
            sdnLinks = sdnLinks.concat(data[type + '-link-list']);
        }

        var topoData = {
            extNodes: extNodes,
            extLinks: extLinks
        };

        clouds.forEach(function(cloud){
            topoData.extCloudNodes =  cloud.subnets;

            if(cloud.cloudStatus == 'open'){
                topoData.extLinks = me.getOpenCloudTopo(topoData, cloud);
            }else{
                var topo = me.getCloseCloudTopo(topoData);
                topoData.extLinks = topo.extLinks;
                topoData.extNodes = topo.extNodes;
            }
        });

        responseObj.nodes = me.formatNodes(sdnNodes.concat(clouds, topoData.extNodes));
        responseObj.links = me.formatLinks(sdnLinks.concat(topoData.extLinks), responseObj.nodes, type);
    }
};

//获取所有eline的拓扑路由
router.get('/eline/:elineid', function (req, res, next) {
    var body = {
        input: {
            'eline-id': req.params.elineid
        }
    };
    var options = {
        url: urlPre + '/restconf/operations/topo-cloud:get-all-eline',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options , function(err, response, body){
        var responseObj = {
            success: false,
            parentnode: [topo.parenNode],
            maxx: topo.maxx,
            maxy: topo.maxy,
            nodes: [],
            links: []
        };

        if(response && response.statusCode == 200 && body){
            body = JSON.parse(body);

            if(body.output && body.output['error-code'] == 200){
                responseObj.success = true;

                if(!body.output['background-params']){
                    responseObj.parentnode.background_params = body.output['background-params'];
                }

                topo.getElineTopo(body.output, responseObj);

                var queryObj = {
                    search_category: req.query.search_category,
                    search_content: req.query.search_content,
                    condition: req.query.condition
                };
                if (req.query) {
                    topo.searchTopo(queryObj, responseObj);
                }
            }
        }

        res.status(200).json(responseObj);
    });
});

//获取指定eline下的pw拓扑
router.get('/pw/:elineid', function (req, res, next) {
    var body = {
        input: {
            'eline-id': req.params.elineid
        }
    };
    var options = {
        url: urlPre +  '/restconf/operations/topo-cloud:get-pw-by-eline',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options , function(err, response, body){
        var responseObj = {
            success: false,
            parentnode: [topo.parenNode],
            maxx: topo.maxx,
            maxy: topo.maxy,
            nodes: [],
            links: []
        };

        if(response && response.statusCode == 200 && body){
            body = JSON.parse(body);

            if(body.output && body.output['error-code'] == 200){
                var query = {
                    cloudid: req.query.cloudid,
                    status: req.query.status
                };

                responseObj.success = true;

                if(body.output['background-params']){
                    responseObj.parentnode.background_params = body.output['background-params'];
                }


                topo.getPwLspTopo(body.output, responseObj, 'pw', query);

                var queryObj = {
                    search_category: req.query.search_category,
                    search_content: req.query.search_content,
                    condition: req.query.condition
                };
                if (req.query) {
                    topo.searchTopo(queryObj, responseObj);
                }
            }
        }

        res.status(200).json(responseObj);
    });
});

//获取指定eline下的指定pw下的lsp
router.get('/lsp/:elineid/:pwid', function (req, res, next) {
    var body = {
        input: {
            'eline-id': req.params.elineid,
            'pw-id': req.params.pwid
        }
    };
    var options = {
        url: urlPre + '/restconf/operations/topo-cloud:get-lsp-by-pw',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options , function(err, response, body){
        var responseObj = {
            success: false,
            parentnode: [topo.parenNode],
            maxx: topo.maxx,
            maxy: topo.maxy,
            nodes: [],
            links: []
        };

        if(response && response.statusCode == 200 && body){
            body = JSON.parse(body);

            if(body.output && body.output['error-code'] == 200){
                var query = {
                    cloudid: req.query.cloudid,
                    status: req.query.status
                };

                responseObj.success = true;

                if(body.output['background-params']){
                    responseObj.parentnode.background_params = body.output['background-params'];
                }

                topo.getPwLspTopo(body.output, responseObj, 'lsp', query);

                var queryObj = {
                    search_category: req.query.search_category,
                    search_content: req.query.search_content,
                    condition: req.query.condition
                };
                if (req.query) {
                    topo.searchTopo(queryObj, responseObj);
                }
            }
        }

        res.status(200).json(responseObj);
    });
});

//拓扑布局修改
router.post('/new_layout', function(req, res, next) {
    // console.log(req.body);
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
            parseInt(req.body.width) - padding*2,
            parseInt(req.body.height)- padding*2,
            padding)
    );
    for (var i in nodes) {
        ary.push(sprintf("\t%d;",nodes[i]))
    }
    for (var i in links) {
        // ary.push(sprintf("\t%d -> %d;", links[i].source, links[i].target))  // 有向图
        ary.push(sprintf("\t%d -- %d;", links[i].source, links[i].target)); // 无向图
    }
    ary.push("}");
    var dot = ary.join("\n");
    // console.log(dot);

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
        if (a[0].toLowerCase()=='graph') {
            r.scale = parseFloat(a[1]);
            r.width = parseFloat(a[2]) + padding*2;
            r.height = parseFloat(a[3]) + padding*2;
        }
        if (a[0].toLowerCase()=='node') {
            var n = {};
            n.x = parseFloat(a[2]) + padding;
            n.y = parseFloat(a[3]) + padding;
            r.nodes[ a[1] ] = n;
        }
    }

    // 针对树形布局，y坐标反转
    if (engine=='dot') {
        for (var k in r.nodes) {
            r.nodes[k].y = parseFloat(req.body.height) - r.nodes[k].y;
        }
    }

    r.wscale = parseFloat(req.body.height)/r.height;
    r.hscale = parseFloat(req.body.width)/r.width;

    // 返回计算结果
    r.success = r.wscale<=1 &&  r.hscale<=1;
    // console.log(r);
    res.json(200, r);
});

router.post('/eline/forceprotect', function (req, res, next) {
    var body = {
        input: {
            'eline-id': req.body.elineid,
            'psCommand': req.body.cmd
        }
    };
    var options = {
        url: urlPre + '/restconf/operations/raisecom-eline:forced-protection',
        headers: {
            'authorization': _auth,
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(body).length
        },
        body: JSON.stringify(body)
    };

    request.post(options , function(err, response, body){
        var responseObj = {
            success: false,
            msg: 'failure'
        };

        if(response && response.statusCode == 200 && body){
            body = JSON.parse(body);

            if(body.output && body.output['error-code'] == 200){
                if(body.output['result']){
                    responseObj.success = false;
                    responseObj.msg = 'success';
                }
            }
        }

        res.status(200).json(responseObj);
    });
});

module.exports = router;