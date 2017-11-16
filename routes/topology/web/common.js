var amqp = require('amqplib/callback_api');
// 节点告警状态对应的颜色
var alarm_colors = [
    // '#5cb85c',      // 绿色
    '#00CD00',      // 绿色
    '#d9534f',      // 红色
    '#ff851b',      // 橙色
    '#f0ad4e',      // 黄色
    '#31b0d5',      // 蓝色
    '#696969',      // 灰色
]

// 节点图标
exports.get_image_path = function(rec, types) {
	var pathprefix = 'stylesheets/icons/';
    
    if (rec['display_topo_type_id'] != null && rec['display_topo_type_id'] in types || rec['topo_type_id'] != null && rec['topo_type_id'] in types) {
    	var h = types[rec['topo_type_id']];
        if (rec['display_topo_type_id'] != null) {
            h = types[rec['display_topo_type_id']];
        }
        if (h['map_icon_path'] != null) {
        	if (rec['status_is_ping_ok'] == 1) {
                rec['img'] = sprintf("%s%s_%s%s", pathprefix, h['map_icon_path'].split(".")[0], rec['minlevel'], '.png');
                rec['svg_icon_color'] = alarm_colors[ parseInt(rec['minlevel']) ];
        	} else {
                rec['img'] = sprintf("%s%s_%s", pathprefix, h['map_icon_path'].split(".")[0], '5.png');
                rec['svg_icon_color'] = alarm_colors[ 5 ];
        	}
        }

        // svg图标
        if (h['svg_icon'] || h['svg_icon']!='null') {
            rec['svg_icon'] = h['svg_icon'];
        }
            
        rec['display_name'] = h['display_name'];
    }
};

// 树节点图标颜色
exports.set_tree_status = function(tree) {

    for (var i in tree) {
        if (!("leaf" in tree[i])) {
        	if (('isscan' in tree[i])  && tree[i]['isscan']) {
                continue;
        	}

            this.set_tree_status(tree[i]['children']);
            tree[i]['minlevel'] = get_minlevel(tree[i]['children']);
        }
        
        if (tree[i]['minlevel'] == 10) {
            tree[i]['minlevel'] = 0;
        }

        if (tree[i]['status_is_ping_ok'] == 1) {
            tree[i]['iconCls'] += ("_" + tree[i]['minlevel']);
        } else {
            tree[i]['iconCls'] += "_5";
        }
    }
};

// 树节点图标
exports.get_device_tree_node_type = function(rows, nodes) {
	var types={};
	    for (var i in rows) {
	        types[rows[i]['topo_type_id']] = rows[i];
	    }
	    
	    for(var i in nodes) {
	    	var v = nodes[i];

            if (v.children) {
                // 非叶子节点默认图标
                v['svg_icon'] = 'icon-subnet';
            } else {
                // 叶子节点默认图标
                // v['svg_icon'] = 'icon-server-rack';
                v['svg_icon'] = 'icon-rack-server-network';
            }

	        if (v['display_topo_type_id'] != null && (v['display_topo_type_id'] in types) || v['topo_type_id'] != null && (v['topo_type_id'] in types)) {
	            var h = types[v['topo_type_id']];
	            if (v['display_topo_type_id'] != null) {
	                h = types[v['display_topo_type_id']];
	            }
	        
	            if (h['tree_icon_path'] != null) {
	                v['iconCls'] = h['tree_icon_path'].split('.')[0].replace(/\//g, '_') + '_' + v['level'];
	            } else {
	                v['iconCls'] = "device_clt" + '_' + v['level'];
	            }

	            v['display_name'] = h['display_name'];
	            // # v['qtip'] = "%s</br>%s</br>%s" % (h['DISPLAY_NAME'], v['iconCls'], h['TREE_ICON_PATH'])

                if (h['svg_icon'] !=null) {
                    v['svg_icon']=h['svg_icon']  ;
                }
	        } else {
	            // v['qtip'] = "[%s]" % v['TOPO_TYPE_ID']
	            v['iconCls'] = "device_clt" + '_' + v['level'];
	        }

            // 获取树节点的状态颜色
            v['svg_icon_color'] = alarm_colors[ parseInt(v['level']) ];

            // 使用glyph图标
            // v['glyph'] = "xe970@icomoon";

            // 隐藏iconCls指定的图标           
            v['iconCls'] = "x-tree-node-icon";
            v['subnet'] = v['text'];
            // 在text域中使用自定义glyph图标 + 显示内容
            v['text'] = sprintf(
                // '<i class="icomoon %s" style="color:%s;vertical-align:middle;font-size:20px"></i><span style="vertical-align:middle"> %s</span>',
                '<i class="icomoon %s topo-tree-glyph-icon" style="color:%s"></i><span class="topo-tree-text">%s</span>',
                v['svg_icon'],          // 自定义glyph图标
                v['svg_icon_color'],    // 图标颜色
                v['text']               // 树节点文本
            ) 

	    }
};

// 计算级别
var get_minlevel = function(tree) {
    var minlevel = 10;
    for (var i in tree) {
        if ('leaf' in tree[i]) {
            if (tree[i]['minlevel'] < minlevel && tree[i]['minlevel'] != 0) {
                minlevel = tree[i]['minlevel'];
            }
        } else {
            var sta = get_minlevel(tree[i]['children']);
            if (sta < minlevel && sta != 0) {
                minlevel = sta;
            }
            tree[i]['isscan'] = true;
        }  
    }
        
    return minlevel;
};

// 递归构树
exports.push_node_chan = function(tree, nodes, chan_ids) {
    var current_tree = tree
    while (true) {
        var current_node;
        var chan_id = chan_ids.shift();
        var findnodes = current_tree
            .filter(function (n) {
                return n['symbol_id']==chan_id
            });

        if (findnodes.length == 0) {
            current_tree.push(nodes[chan_id]);
            current_node = current_tree[current_tree.length-1];
            current_node.leaf = true;
        } else {
            current_node = findnodes[0];
        }

        if (chan_ids.length > 0) {
            if (current_node.children == undefined) {
                current_node.children=[];
            };
            if (chan_id==0) {
                current_node.expanded = true
            } else {
                current_node.expanded = false
            };
            if (current_node.leaf) {
                delete current_node.leaf
            };
            current_tree = current_node.children
        } else {
            break
        }
    }
};


//记录拓扑日志(promise-await形式)
exports.logTopology = async function(task){
    var amqp_conn;
    var amqp_chanel;
    try{
        var amqp_url = sprintf("amqp://admin:admin@%s:%d", APP.config.mq.amqp_host, APP.config.mq.amqp_port);
        console.log('-----------topo_amqp_url------------',amqp_url);
        //var amqp_url = sprintf("amqp://admin:admin@%s:%d", "172.16.75.93",5672);
        amqp_conn = await amqp_connect_promise(amqp,amqp_url);
        amqp_chanel = await amqp_createChannel_promise(amqp_conn);

        amqp_send(amqp_chanel, "logs_op_queue", JSON.stringify(task));
        console.log('-----拓扑promise-await形式-----amqp_send-----true---',task);
    }catch(err){
        log.error(err);
    }

    if(amqp_chanel) {
        amqp_chanel.close(function() {
            amqp_conn.close(function() {
            })
        })
    }
}


function amqp_createChannel_promise(amqp_conn) {
    return new Promise(function(resolve, reject) {
        amqp_conn.createChannel(function(err, mq_ch) {
            if(err) {
                reject(err);
            }else{
                resolve(mq_ch);
            }
        });
    });
}

function amqp_connect_promise(amqp,amqp_url) {
    return new Promise(function(resolve, reject) {
        amqp.connect(amqp_url, function(err, mq_conn) {
            if(err) {
                reject(err);
            }else{
                resolve(mq_conn);
            }
        });
    });
}

var amqp_send = function(amqp_chanel, topic, payload) {
    var queueName = topic;
    amqp_chanel.assertQueue(queueName, {durable: false});
    amqp_chanel.sendToQueue(queueName, new Buffer(payload));
}



