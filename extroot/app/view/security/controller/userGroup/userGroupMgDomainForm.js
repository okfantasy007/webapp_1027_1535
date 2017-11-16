Ext.define("Admin.view.security.controller.userGroup.userGroupMgDomainForm", {
    extend: "Admin.view.security.secBaseController.setAndArrayController",
    alias: "controller.userGroupMgDomainForm",
    //=================================向右移动触发事件==================================
    onCheckedNodesClick1: function () {
        var me = this;
        var meView = me.getView();
        var records = meView.down("#noselectTree").getChecked(),
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetSet = me.getSubnetSet("userGroupMgDomain"),
            subnetDevSet = me.getSubnetDevSet("userGroupMgDomain"),
            symbolSet = me.getSymbolSet("userGroupMgDomain"),
            delSubnetSet = me.getDelSubnetSet("userGroupMgDomain"),
            delSymbolSet = me.getDelSymbolSet("userGroupMgDomain"),
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
            //if (records[i].get('symbol_id') != 'loading') {
            me.pushNodeChanToTree(selectTree, records[i]);
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
    },
    //=================================向左移动触发事件=================================
    onCheckedNodesClick2: function () {
        var me = this;
        var meView = me.getView();
        var records = meView.down("#selectTree").getChecked(),
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetSet = me.getSubnetSet("userGroupMgDomain"),
            subnetDevSet = me.getSubnetDevSet("userGroupMgDomain"),
            symbolSet = me.getSymbolSet("userGroupMgDomain"),
            delSubnetSet = me.getDelSubnetSet("userGroupMgDomain"),
            delSymbolSet = me.getDelSymbolSet("userGroupMgDomain"),
            noselected_ids = meView.noselected_ids;
        //=================================移动节点传递五个集合算法=================================
        for (var i in records) {
            me.onSet(records[i], 1);
            //=================================移动子节点传递五个集合算法=================================
            if (records[i].get("res_type_name") == "TOPO_SUBNET" || records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                records[i].set("category", 1);
                //---------------改动-------------------------------------------
                if (records[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                    noselectTree.getRootNode().childNodes[0].set("category", 1);
                }
                //-------------添加------------------------------------------
                subnetDevSet.delete(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                delSubnetSet.add(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
                subnetSet.delete(records[i].get("symbol_id") + "*" + records[i].get("res_type_name") + "*" + records[i].get("real_res_type_name") + "*" + records[i].get("map_hierarchy"));
            } else {
                //records[i].set("category", 2);
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
    },
    //=================================节点移动（左右移动都调用）算法=================================
    pushNodeChanToTree: function (tree, node) {
        var chan = [];
        this.getTreeUpNodeChan(node, chan);
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
        var meView = this.getView();
        var tree = meView.up("secUserLeftTree");
        var userGroupMgDomain = tree.down("userGroupMgDomain");
        if (userGroupMgDomain.edit) {
            var sec_usergroup_id = tree.down("userGroupTab").sec_usergroup_id;
            var subnetArr = me.getSubnetArray("userGroupMgDomain"),
                subnetDevArr = me.getSubnetDevArray("userGroupMgDomain"),
                symbolArr = me.getSymbolArray("userGroupMgDomain"),
                delSubnetArr = me.getDelSubnetArray("userGroupMgDomain"),
                delSymbolArr = me.getDelSymbolArray("userGroupMgDomain"),
                name = tree.down("userGroupTab").name;
            //=================================集合遍历转化为数组=================================
            Ext.Ajax.request({
                url: "/security/security_group/update_domain",
                params: {
                    name: name,
                    sec_usergroup_id: sec_usergroup_id,
                    subnetArr: subnetArr.join("-"),
                    subnetDevArr: subnetDevArr.join("-"),
                    symbolArr: symbolArr.join("-"),
                    delSubnetArr: delSubnetArr.join("-"),
                    delSymbolArr: delSymbolArr.join("-")
                },
                method: "POST"
            });
        } else {
            var selectTree = meView.down("#selectTree"),
                noselectTree = meView.down("#noselectTree"),
                parentTree = meView.up("secUserLeftTree").down("userGroupMgDomain").down("#selectedTree"),
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
            // parentTree.selectedIds = selectedIds.concat();
        }

        if (userGroupMgDomain.edit) {
            tree.down("userGroupOpAuthority").down('treepanel').getStore().reload();
            tree.down("userGroupMgDomain").down('treepanel').getStore().reload();
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
        var sec_usergroup_id = meView.up("secUserLeftTree").down('userGroupTab').sec_usergroup_id;
        var symbolId = node.data.symbol_id,
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetArr = me.getSubnetArray("userGroupMgDomain"),
            subnetDevArr = me.getSubnetDevArray("userGroupMgDomain"),
            symbolArr = me.getSymbolArray("userGroupMgDomain"),
            delSubnetArr = me.getDelSubnetArray("userGroupMgDomain"),
            delSymbolArr = me.getDelSymbolArray("userGroupMgDomain"),
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
                    sec_usergroup_id: sec_usergroup_id,
                    NEG: 1,
                },
                success: function (response) {
                    r = Ext.decode(response.responseText).children;
                    for (var i = 0; i < r.length; i++) {
                        node.appendChild(r[i]);
                    }
                    if (node.get('checked')) {
                        for (var i in node.childNodes) {
                            node.childNodes[i].set('checked', true);
                        }
                    }
                    if (node.lastChild && !node.lastChild.isLeaf()) {
                        node.lastChild.triggerUIUpdate();
                    }
                }
            });
        }
    },

    onBeforeItemExpand2: function (node, optd) {
        var me = this;
        var meView = me.getView();
        var sec_usergroup_id = meView.up("secUserLeftTree").down('userGroupTab').sec_usergroup_id;
        var symbolId = node.data.symbol_id,
            selectTree = meView.down("#selectTree"),
            noselectTree = meView.down("#noselectTree"),
            subnetArr = me.getSubnetArray("userGroupMgDomain"),
            subnetDevArr = me.getSubnetDevArray("userGroupMgDomain"),
            symbolArr = me.getSymbolArray("userGroupMgDomain"),
            delSubnetArr = me.getDelSubnetArray("userGroupMgDomain"),
            delSymbolArr = me.getDelSymbolArray("userGroupMgDomain"),
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
                    sec_usergroup_id: sec_usergroup_id,
                },
                success: function (response) {
                    var r = Ext.decode(response.responseText).children;
                    for (var i = 0; i < r.length; i++) {
                        node.appendChild(r[i]);
                    }
                    if (node.lastChild && !node.lastChild.isLeaf()) {
                        node.lastChild.triggerUIUpdate();
                    }
                }
            });
            if (symbolId != 0 || node.get("id") != 'root') {
                var parent = node.parentNode;

                if (parent.get('category') == 1 && parent.get('leftorright') == 2) {
                    if (node.get('res_type_name') == "TOPO_SUBNET") {
                        node.set('category', 1);
                    }
                    node.set('leftorright', 2);
                    node.set('isown', 1);
                }
            }
            var rootnodes = selectTree.getRootNode().childNodes;
        }
    },
    //=================================移动父节点节点传递五个集合算法=================================
    onSet: function (node, direction) {
        var me = this;
        var subnetSet = me.getSubnetSet("userGroupMgDomain"),
            subnetDevSet = me.getSubnetDevSet("userGroupMgDomain"),
            symbolSet = me.getSymbolSet("userGroupMgDomain"),
            delSubnetSet = me.getDelSubnetSet("userGroupMgDomain"),
            delSymbolSet = me.getDelSymbolSet("userGroupMgDomain");

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
                        subnetSet.delete(parent.get("symbol_id") + "*" + parent.get("res_type_name") + "*" + parent.get("real_res_type_name") + "*" + parent.get("map_hierarchy"));
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
        var meView = me.getView();
        var value = meView.down('#selectfield').getValue();
        var arr = meView.arr;
        if (value.trim().length <= 0) {
            return
        }
        var oldSymbolId = meView.oldSymbolId;
        var tree = meView.down('#noselectTree');
        var node = me.depthTraversal(value);
        if (node == null) {
            meView.oldSymbolId = 0;
            return;
        }
        meView.oldSymbolId = node.get('symbol_id');
        node.set('checked', true);
        arr.push(node);
        if (arr.length > 1) {
            var node = arr[arr.length - 2];
            node.set('checked', false);
            // if (node.hasChildNodes()) {
            //     for (var i in node.childNodes) {
            //         node.childNodes[i].set('checked', false);
            //     }
            // }
        }
        tree.expandPath(node.getPath());
    },

    depthTraversal: function (value) {
        var me = this;
        var meView = me.getView();
        var oldSymbolId = meView.oldSymbolId;
        var getNode = meView.down('#noselectTree').getStore().getNodeById(oldSymbolId);
        var value = value;
        var parentNode = getNode.parentNode;
        var node = me.TraversalChildren(getNode, value);
        if (node != null) {
            return node;
        }
        while (parentNode != null) {
            var parentChildrens = parentNode.childNodes;
            var index = parentNode.get('index');
            var num = 0;
            if (index != '') {
                num = index;
            }
            for (var i = index; i < parentChildrens.length; i++) {
                parentNode.set('index', i + 1);
                node = parentChildrens[i];

                if (node.get('text').indexOf(value) != -1) {
                    return node;
                }
                node = this.TraversalChildren(node, value);
                if (node != null) {
                    return node;
                }
            }
            parentNode = parentNode.parentNode;
        }
        return null;
    },

    TraversalChildren: function (getNode, value) {
        var me = this;
        var node = getNode;
        me.onBeforeItemExpand1(node, null);
        var childrens = node.childNodes;
        if (childrens.length <= 0) {
            return null;
        }
        for (var i = 0; i < childrens.length; i++) {
            node.set('index', i + 1);
            var childnode = childrens[i];
            if (childnode.get('text').indexOf(value) != -1) {
                return childnode;
            }

            childnode = me.TraversalChildren(childnode, value);

            if (childnode != null) {
                return childnode;
            }
        }
        return null;
    }
});