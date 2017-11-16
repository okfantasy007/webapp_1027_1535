Ext.define("Admin.view.security.controller.user.userMgDomainForm", {
    extend: "Admin.view.security.secBaseController.setAndArrayController",
    alias: "controller.userMgDomainForm",
    click: function (self, node) {
        console.log(node.get('id'));
    },
    //=================================向右移动触发事件=================================
    onCheckedNodesClick1: function () {
        var me = this;
        var meView = this.getView();
        var records = meView.down("#noselectTree").getChecked(),
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetSet = me.getSubnetSet("userMgDomain"),
            subnetDevSet = me.getSubnetDevSet("userMgDomain"),
            symbolSet = me.getSymbolSet("userMgDomain"),
            delSubnetSet = me.getDelSubnetSet("userMgDomain"),
            delSymbolSet = me.getDelSymbolSet("userMgDomain"),
            selected_ids = me.getView().selected_ids;

        //=================================移动节点传递五个集合算法=================================
        for (var i in records) {

            me.onSet(records[i], 2);
            //=================================移动子节点传递五个集合算法=================================
            if (records[i].get("res_type_name") == "TOPO_SUBNET" || records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                records[i].set("category", 1);
                if (records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                    selectTree.getRootNode().childNodes[0].set("category", 1);
                }
                subnetDevSet.add(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));

                delSubnetSet.delete(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));

                if (records[i].get("leftorright") == 4) {
                    delSubnetSet.add(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                }
            } else {
                records[i].set("category", 2);
                if (records[i].get("symbol_id") != "loading") {
                    symbolSet.add(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                    delSymbolSet.delete(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                }
            }
            records[i].set("leftorright", 2);
            if (records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                selectTree.getRootNode().childNodes[0].set("leftorright", 2);
            }

        }

        //=================================节点向右移动算法=================================
        for (var i in records) {
            me.pushNodeChanToTree(selectTree, records[i]);
        }
        //=================================节点删除算法（除去根节点和根节点第一个子节点）=================================
        for (var i in records) {
            if (records[i].get("depth") > 1) {
                records[i].remove();
                Ext.destroy(records[i]);
            } else {
                records[i].set("checked", false);
            }
        }

        selectTree.getStore().sort("text", "ASC");//排序防止节点移动后乱序
    },
    //=================================向左移动触发事件=================================
    onCheckedNodesClick2: function () {
        var me = this;
        var meView = this.getView();
        var records = meView.down("#selectTree").getChecked(),
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            noselected_ids = meView.noselected_ids,
            selected_ids = meView.selected_ids,
            subnetSet = me.getSubnetSet("userMgDomain"),
            subnetDevSet = me.getSubnetDevSet("userMgDomain"),
            symbolSet = me.getSymbolSet("userMgDomain"),
            delSubnetSet = me.getDelSubnetSet("userMgDomain"),
            delSymbolSet = me.getDelSymbolSet("userMgDomain");
        //=================================移动节点传递五个集合算法=================================
        for (var i in records) {
            me.onSet(records[i], 1);
            //=================================移动子节点传递五个集合算法=================================
            if (records[i].get("res_type_name") == "TOPO_SUBNET" || records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                records[i].set("category", 1);
                if (records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                    noselectTree.getRootNode().childNodes[0].set("category", 1);
                }
                subnetDevSet.delete(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                delSubnetSet.add(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
            } else {
                records[i].set("category", 2);
                if (records[i].get("symbol_id") != "loading") {
                    symbolSet.delete(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                    delSymbolSet.add(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                }
            }
            records[i].set("leftorright", 1);
            if (records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                noselectTree.getRootNode().childNodes[0].set("leftorright", 1);
            }
        }

        //=================================节点向左移动算法=================================
        for (var i in records) {
            // if (records[i].get('symbol_id') != 'loading') {
            me.pushNodeChanToTree(noselectTree, records[i]);
            // }
        }
        //=================================节点删除算法（除去根节点和根节点第一个子节点）=================================
        for (var i in records) {
            if (records[i].get("depth") > 1) {
                records[i].remove();
            } else {
                records[i].set("checked", false);
            }
        }
        noselectTree.getStore().sort("text", "ASC");//排序防止节点移动后乱序
    },
    //=================================节点移动（左右移动都调用）算法=================================
    pushNodeChanToTree: function (tree, node) {
        var me = this;
        var chan = [];
        me.getTreeUpNodeChan(node, chan);
        chan = chan.reverse();
        for (var i in chan) {
            var existNode = tree.store.getNodeById(chan[i].get("id"));
            if (existNode == null) {
                var parentNode = tree.store.getNodeById(chan[i].parentNode.get("id"));
                var n = chan[i].copy();
                n.data.checked = false;
                var index = chan[i].get("index");
                parentNode.insertChild(index, n);
            }
        }
    },

    getTreeUpNodeChan: function (node, chan) {
        if (node.get("depth") == 0) {
            return;
        }
        chan.push(node);
        this.getTreeUpNodeChan(node.parentNode, chan);
    },

    onOk: function () {
        var me = this;
        var meView = me.getView();
        var tree = meView.up("secUserLeftTree");
        var userMgDomain = tree.down("userMgDomain")
        if (userMgDomain.edit) {
            var sec_user_id = tree.down("userTab").sec_user_id,
                name = tree.down("userTab").name;
            var subnetArr = me.getSubnetArray("userMgDomain"),
                subnetDevArr = me.getSubnetDevArray("userMgDomain"),
                symbolArr = me.getSymbolArray("userMgDomain"),
                delSubnetArr = me.getDelSubnetArray("userMgDomain"),
                delSymbolArr = me.getDelSymbolArray("userMgDomain");
            //=================================集合遍历转化为数组=================================
            Ext.Ajax.request({
                url: "/security/security_group/update_domain",
                params: {
                    name: name,
                    sec_usergroup_id: sec_user_id,
                    type: 'user',
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-")
                },
                method: "POST"
            });
        } else {
            var parentTree = tree.down("userMgDomain").down("#selectedTree"),
                selectTree = meView.down("#selectTree"),
                noselectTree = meView.down("#noselectTree"),
                rootnodes = selectTree.getRootNode().childNodes;
            parentTree.getRootNode().removeAll();
            var walkDownTreeNodes = function (nodes) {
                for (var i in nodes) {
                    nodes[i].set("checked", null);
                    if (nodes[i].childNodes.length > 0) {
                        walkDownTreeNodes(nodes[i].childNodes);
                    }
                }
            };

            walkDownTreeNodes(rootnodes);

            var node_copy = rootnodes[0].copy("0", true);
            parentTree.getRootNode().appendChild(rootnodes[0]);
            var res_tree = parentTree.up("tabpanel").down("#resource_tree");
            var root_node = res_tree.getRootNode();
            root_node.childNodes[1].remove();
            root_node.childNodes[0].set('expanded', true);
            var removeChildren = function (nodes) {
                for (var i in nodes) {
                    if (nodes[i].get('category') == 1) {
                        nodes[i].removeAll();
                        nodes[i].set('lock', 1);
                        //nodes[i].set('expanded',true);
                    }
                    if (nodes[i].childNodes.length > 0) {
                        removeChildren(nodes[i].childNodes)
                    }
                }
            }
            removeChildren([node_copy]);
            root_node.appendChild(node_copy);
        }

        if (tree.down("userMgDomain").edit) {
            tree.down("userOpAuthority").down('treepanel').getStore().reload();
            tree.down("userMgDomain").down('treepanel').getStore().reload();
        }
        meView.up().close();
    },

    onCancel: function () {
        var meView = this.getView();
        meView.up().close();
    },

    onBeforeItemExpand1: function (node, optd) {
        var me = this;
        var meView = me.getView();
        var sec_user_id = meView.up("secUserLeftTree").down('userTab').sec_user_id;
        var selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetArr = me.getSubnetArray("userMgDomain"),
            subnetDevArr = me.getSubnetDevArray("userMgDomain"),
            symbolArr = me.getSymbolArray("userMgDomain"),
            delSubnetArr = me.getDelSubnetArray("userMgDomain"),
            delSymbolArr = me.getDelSymbolArray("userMgDomain"),
            rootnodes = selectTree.getRootNode().childNodes,
            symbolId = node.data.symbol_id;
        //=================================分层加载（lock属性为了只分层加载一次）=================================
        if (symbolId != "" && symbolId != undefined && node.get("lock") == undefined) {
            node.set("lock", 1);
            var childcount = node.childNodes.length;
            for (var i = 0; i < childcount; i++) {
                node.childNodes[0].remove();
            }
            Ext.Ajax.request({
                url: "/security/security_group/tree",
                async: false,
                method: "GET",
                params: {
                    symbol_id: symbolId,
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-"),
                    sec_usergroup_id: sec_user_id,
                    NEG: 1,
                    type: "user"
                },
                success: function (response) {
                    r = Ext.decode(response.responseText).children;
                    for (var i = 0; i < r.length; i++) {
                        node.appendChild(r[i]);
                    }
                    if (node.lastChild && !node.lastChild.isLeaf()) {
                        node.lastChild.triggerUIUpdate();
                    }
                    if (node.get('checked')) {
                        for (var i in node.childNodes) {
                            node.childNodes[i].set('checked', true);
                        }
                    }
                }
            });
        }
    },

    onBeforeItemExpand2: function (node, optd) {
        var me = this;
        var meView = me.getView();
        var sec_user_id = meView.up("secUserLeftTree").down('userTab').sec_user_id;
        var symbolId = node.data.symbol_id,
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetArr = me.getSubnetArray("userMgDomain"),
            subnetDevArr = me.getSubnetDevArray("userMgDomain"),
            symbolArr = me.getSymbolArray("userMgDomain"),
            delSubnetArr = me.getDelSubnetArray("userMgDomain"),
            delSymbolArr = me.getDelSymbolArray("userMgDomain"),
            rootnodes = selectTree.getRootNode().childNodes;
        //=================================分层加载（lock属性为了只分层加载一次）=================================
        if (symbolId != "" && symbolId != undefined && node.get("lock") == undefined) {
            node.set("lock", 1);
            var childcount = node.childNodes.length;
            for (var i = 0; i < childcount; i++) {
                node.childNodes[0].remove();
            }
            Ext.Ajax.request({
                url: "/security/security_group/tree",
                async: false,
                method: "GET",
                params: {
                    symbol_id: symbolId,
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-"),
                    sec_usergroup_id: sec_user_id,
                    type: "user"
                },
                success: function (response) {
                    var r = Ext.decode(response.responseText).children;
                    for (var i = 0; i < r.length; i++) {
                        node.appendChild(r[i]);
                    }
                    //===============异步加载时子结点的最后一个节点前没有加号===============
                    if (node.lastChild && !node.lastChild.isLeaf()) {
                        node.lastChild.triggerUIUpdate();
                    }
                    if (node.get('checked')) {
                        for (var i in node.childNodes) {
                            node.childNodes[i].set('checked', true);
                        }
                    }
                }
            });
        }
    },
    //=================================移动父节点节点传递五个集合算法=================================
    onSet: function (node, direction) {
        var me = this;
        var subnetSet = me.getSubnetSet("userMgDomain"),
            subnetDevSet = me.getSubnetDevSet("userMgDomain"),
            symbolSet = me.getSymbolSet("userMgDomain"),
            delSubnetSet = me.getDelSubnetSet("userMgDomain"),
            delSymbolSet = me.getDelSymbolSet("userMgDomain");
        var moveParent = function (node, direction) {
            var parent = node.parentNode;
            if (node == null || parent.get("id") == "root") {
                return;
            }
            if (parent != null && parent.get("leftorright") != 4 && direction != parent.get("leftorright")) {
                parent.set("leftorright", 4);
                if (direction == 2) {
                    subnetSet.add(parent.get("symbol_id") + "*" + parent.get("res_type_name") + "*" + parent.get("real_res_type_name") + "*" + parent.get("map_hierarchy"));
                } else {
                    if (parent.get("category") == 1) {
                        var childrens = parent.childNodes;
                        for (var i in childrens) {
                            if (childrens[i].get("res_type_name") == "TOPO_SUBNET") {
                                subnetDevSet.add(childrens[i].get("symbol_id") + "*" + childrens[i].get("res_type_name") + "*" + childrens[i].get("real_res_type_name") + "*" + childrens[i].get("map_hierarchy"));
                            } else if (childrens[i].get("symbol_id") != "loading") {
                                symbolSet.add(childrens[i].get("symbol_id") + "*" + childrens[i].get("res_type_name") + "*" + childrens[i].get("real_res_type_name") + "*" + childrens[i].get("map_hierarchy"));
                            }
                        }
                        subnetDevSet.delete(parent.get("symbol_id") + "*" + parent.get("res_type_name") + "*" + parent.get("real_res_type_name") + "*" + parent.get("map_hierarchy"));
                        delSubnetSet.add(parent.get("symbol_id") + "*" + parent.get("res_type_name") + "*" + parent.get("real_res_type_name") + "*" + parent.get("map_hierarchy"));
                        subnetSet.add(parent.get("symbol_id") + "*" + parent.get("res_type_name") + "*" + parent.get("real_res_type_name") + "*" + parent.get("map_hierarchy"));
                    }
                }
                parent.set("category", 2);
                moveParent(parent, direction);
            }
        };
        moveParent(node, direction);
    },

    onCheck: function () {
        var me = this;
        var meView = this.getView();
        var value = meView.down('#selectfield').getValue();
        var tree = meView.down('#noselectTree');
        tree.expandAll();
        var array = meView.arr;
        // if (value.trim().length <= 0) {
        //     Ext.Msg.alert(_("Notice"), _("Please enter the search criteria!"));
        //     return;
        // }
        // var oldSymbolId = meView.oldSymbolId;
        // 
        // var node = me.depthTraversal(value);
        // if (node == null) {
        //     Ext.Msg.alert(_("Notice"), _("Did not find the node!"));
        //     return;
        // }
        // meView.oldSymbolId = node.get('symbol_id');
        // node.set('checked', true);
        Ext.Ajax.request({
            url: '',
            method: 'POST',
            success: function (res) {
                var obj = Ext.decode(rec.responseText);
                var hierarchy = obj.map_hierarchy;
                var arr = hierarchy.split(",").filter(function (v) {
                    return v != '';
                });
                var path = '';
                for (var i in arr) {
                    path = path + arr[i] + "/";
                }
                path = "/root/" + path;
                tree.expandPath(path);
                var node = tree.store.getNodeById(arr[arr.length - 1]);
                node.set('checked', true);
                array.push(node);
                if (array.length > 1) {
                    var node = array[array.length - 2];
                    node.set('checked', false);
                    if (node.hasChildNodes()) {
                        for (var i in node.childNodes) {
                            node.childNodes[i].set('checked', false);
                        }
                    }
                }
            },
            failure: function () {

            }
        })

    },

    // depthTraversal: function (value) {
    //     var me = this;
    //     var meView = this.getView();
    //     var oldSymbolId = meView.oldSymbolId;
    //     var getNode = meView.down('#noselectTree').getStore().getNodeById(oldSymbolId);
    //     var value = value;
    //     var node = me.TraversalChildren(getNode, value);
    //     if (node != null) {
    //         return node;
    //     }
    //     var parentNode = getNode.parentNode;
    //     while (parentNode != null) {
    //         var parentChildrens = parentNode.childNodes;
    //         var index = parentNode.get('index');
    //         var num = 0;
    //         if (index != '') {
    //             num = index;
    //         }
    //         for (var i = index; i < parentChildrens.length; i++) {
    //             parentNode.set('index', i + 1);
    //             node = parentChildrens[i];

    //             if (node.get('text').indexOf(value) != -1) {
    //                 return node;
    //             }
    //             node = this.TraversalChildren(node, value);
    //             if (node != null) {
    //                 return node;
    //             }
    //         }
    //         parentNode = parentNode.parentNode;
    //     }
    //     return null;
    // },

    // TraversalChildren: function (getNode, value) {
    //     var me = this;
    //     var node = getNode;
    //     if (!node.isLeaf() && node.get('lock') != 1) {
    //         me.onBeforeItemExpand1(node, null);
    //     }
    //     var childrens = node.childNodes;
    //     if (childrens.length <= 0) {
    //         return null;
    //     }
    //     for (var i = 0; i < childrens.length; i++) {
    //         node.set('index', i + 1);
    //         var childnode = childrens[i];
    //         if (childnode.get('text').indexOf(value) != -1) {
    //             return childnode;
    //         }

    //         childnode = me.TraversalChildren(childnode, value);

    //         if (childnode != null) {
    //             return childnode;
    //         }
    //     }
    //     return null;
    // }
});