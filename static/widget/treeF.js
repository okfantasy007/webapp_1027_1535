Ext.define("widget.treeF", {
    extend: "Ext.panel.Panel",
    syn_task_id: '',
    areaTable: '',
    margin: -2,
    bodyPadding: 10,
    layout: 'hbox',
    dirty: false,
    loaded: false,
    isOtherUser: false,
    action: 'add',
    selectedIcon: 'alarmSyn_select_icon',
    subnetSet: new Set(),
    subnetDevSet: new Set(),
    symbolSet: new Set(),
    delSubnetSet: new Set(),
    delSymbolSet: new Set(),
    controller: {

        onSet: function (node, direction) {
            var controller = this;
            var subnetSet = controller.view.subnetSet,
                subnetDevSet = controller.view.subnetDevSet,
                symbolSet = controller.view.symbolSet,
                delSubnetSet = controller.view.delSubnetSet,
                delSymbolSet = controller.view.delSymbolSet;
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

        onSelect: function () {
            var controller = this;
            var treeForSelect = this.view.down('#lefttree');
            var treeAfterSelect = this.view.down('#righttree');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            var selections = treeForSelect.getSelection();
            var rootN = afterSelectStore.getRoot();
            var rootNode;
            var subnetSet = controller.view.subnetSet,
                subnetDevSet = controller.view.subnetDevSet,
                symbolSet = controller.view.symbolSet,
                delSubnetSet = controller.view.delSubnetSet,
                delSymbolSet = controller.view.delSymbolSet;
            for (var i in selections) {
                controller.onSet(selections[i], 2);
                //=================================移动子节点传递五个集合算法=================================
                if (selections[i].get("res_type_name") == "TOPO_SUBNET" || selections[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                    selections[i].set("category", 1);
                    if (selections[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                        treeAfterSelect.getRootNode().childNodes[0].set("category", 1);
                    }
                    subnetDevSet.add(selections[i].get("symbol_id") + "*" + selections[i].get("res_type_name") + "*" + selections[i].get("real_res_type_name") + "*" + selections[i].get("map_hierarchy"));

                    delSubnetSet.delete(selections[i].get("symbol_id") + "*" + selections[i].get("res_type_name") + "*" + selections[i].get("real_res_type_name") + "*" + selections[i].get("map_hierarchy"));

                    if (selections[i].get("leftorright") == 4) {
                        delSubnetSet.add(selections[i].get("symbol_id") + "*" + selections[i].get("res_type_name") + "*" + selections[i].get("real_res_type_name") + "*" + selections[i].get("map_hierarchy"));
                    }
                } else {
                    selections[i].set("category", 2);
                    if (selections[i].get("symbol_id") != "loading") {
                        symbolSet.add(selections[i].get("symbol_id") + "*" + selections[i].get("res_type_name") + "*" + selections[i].get("real_res_type_name") + "*" + selections[i].get("map_hierarchy"));
                        delSymbolSet.delete(selections[i].get("symbol_id") + "*" + selections[i].get("res_type_name") + "*" + selections[i].get("real_res_type_name") + "*" + selections[i].get("map_hierarchy"));
                    }
                }
                selections[i].set("leftorright", 2);
                if (selections[i].get("res_type_name") == "SEC_ALLOBJ_SET") {
                    treeAfterSelect.getRootNode().childNodes[0].set("leftorright", 2);
                }
            }

            console.log(subnetSet);
            console.log(subnetDevSet);
            console.log(delSubnetSet);
            console.log(delSymbolSet);
            console.log(subnetSet);
            if (selections.length > 0) {
                if (afterSelectStore.getData().items.length == 0) {
                    rootNode = forSelectStore.getData().items[0].clone();
                    rootN.appendChild(rootNode);
                } else {
                    rootNode = afterSelectStore.getData().items[0];
                }
            }
            for (var i in selections) {
                var selected = this.getAllSymbolID(rootNode, controller);
                var selection = selections[i];
                if (selection.get('symbol_id') == 0) {
                    controller.onSelectAll(forSelectStore, afterSelectStore);
                    break;
                }
                if (selection.get('iconCls') != this.getView().selectedIcon && selection.get('tree_parent_id') == 0) {
                    if (selection.isLeaf()) {// if (selection.get('res_type_name') == 'NE') {
                        rootNode.appendChild(selection.clone());
                        selection.remove();
                    } else if (!selection.isLeaf()) {
                        var exist = afterSelectStore.getNodeById(selection.get("symbol_id"));
                        if (!exist) {
                            this.copyNode(selection, rootNode);//右移非叶子节点且节点已经展开，将所有选中节点的子节点都copy到选中节点中
                        } else {
                            this.copyNode2(selection, exist);
                        }
                        selection.remove();
                    }
                }

                if (selection.get('iconCls') != this.getView().selectedIcon && selection.get('tree_parent_id') != 0) {
                    var selectionClone = selection.clone();
                    var parentClone = this.findParent(selection, selected, selectionClone);
                    this.checkParentNode(selection);
                    if (selected.indexOf(',' + parentClone.get('symbol_id') + ',') == -1) {
                        rootNode.appendChild(parentClone);
                    } else {
                        var dirparent = afterSelectStore.getNodeById(selectionClone.parentNode.get('symbol_id'));
                        if (dirparent.get('category') != 1) {
                            dirparent.data = Ext.apply(dirparent.getData(), { category: 2 });
                            dirparent.appendChild(selectionClone);
                            dirparent.sort();
                        }
                    }
                    if (!selection.isLeaf()) {
                        selection.data = Ext.apply(selection.getData(), { category: 1 });
                        var parent = selectionClone.parentNode;
                        var iconCls = selectionClone.get('iconCls');
                        selectionClone.remove();
                        this.copyNode(selection, parent, afterSelectStore);
                        parent.sort();
                    }
                }
                if (selected.indexOf(',' + selection.get('symbol_id') + ',') >= 0 && !selection.isLeaf() && selection.get('symbol_id') != 0) {
                    var selectionClone = afterSelectStore.getNodeById(selection.get('symbol_id'));
                    if (selectionClone.get('category') != '1') {
                        selectionClone.data = Ext.apply(selectionClone.getData(), { category: 1 });
                    }
                }
            }
            rootNode.sort();
        },
        findParent: function (node, selected, nodeClone) {
            var controller = this;
            var parentNode = node.parentNode;
            var parentClone = parentNode.clone();
            parentClone.appendChild(nodeClone);
            if (selected.indexOf(',' + parentNode.get('symbol_id') + ',') == -1) {
                if (parentNode.get('tree_parent_id') == 0) {
                    return parentClone;
                } else {
                    return this.findParent(parentNode, selected, parentClone);
                }
            } else {
                return parentClone;
            }
        },
        getAllSymbolID: function (rootNode, controller) {
            var selected = ',';
            rootNode.eachChild(function (child) {
                if (!child.isLeaf()) {
                    selected = selected.concat(child.get('symbol_id'));
                    selected = selected.concat(controller.getAllSymbolID(child, controller));
                } else {
                    selected = selected.concat(child.get('symbol_id'), ',');
                }
            });
            return selected;
        },

        copyNode: function (selection, rootNode, treeStore) {
            var node = selection.clone();
            for (var i in selection.childNodes) {
                var childNode = selection.childNodes[i];
                if (!childNode.isLeaf()) {
                    this.copyNode(childNode, node);
                } else {
                    node.appendChild(childNode.clone());
                    console.log(node);
                }
                childNode.set('iconCls', this.getView().selectedIcon);
            }
            rootNode.appendChild(node);
            selection.set('iconCls', this.getView().selectedIcon);
        },

        copyNode2: function (selection, exist) {
            var node = selection.clone();
            alert(0)
            for (var i in selection.childNodes) {

                var childNode = selection.childNodes[i];
                console.log(childNode);
                if (!childNode.isLeaf()) {
                    this.copyNode(childNode, exist);
                } else {
                    alert(1);
                    console.log(childNode.clone());
                    exist.appendChild(childNode.clone());
                }
                childNode.set('iconCls', this.getView().selectedIcon);
            }
        },

        onDeSelect: function () {
            var controller = this;
            var treeForSelect = this.view.down('#lefttree');
            var treeAfterSelect = this.view.down('#righttree');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            var selections = treeAfterSelect.getSelection();
            var rootN = forSelectStore.getRoot();
            var rootNode;
            if (selections.length > 0) {
                if (forSelectStore.getData().items.length == 0) {
                    rootNode = afterSelectStore.getData().items[0].clone();
                    rootN.appendChild(rootNode);
                } else {
                    rootNode = forSelectStore.getData().items[0];
                }
            }
            for (var i in selections) {
                var selected = this.getAllSymbolID(rootNode, controller);
                var selection = selections[i];
                if (selection.get('symbol_id') == 0) {
                    controller.onSelectAll(afterSelectStore, forSelectStore);
                    break;
                }
                if (selection.get('iconCls') != this.getView().selectedIcon && selection.get('tree_parent_id') == 0) {
                    if (selection.isLeaf()) {// if (selection.get('res_type_name') == 'NE') {
                        rootNode.appendChild(selection.clone());
                        selection.remove();
                    } else if (!selection.isLeaf()) {
                        var exist = forSelectStore.getNodeById(selection.get("symbol_id"));
                        console.log(exist);
                        if (!exist) {
                            this.copyNode(selection, rootNode);//右移非叶子节点且节点已经展开，将所有选中节点的子节点都copy到选中节点中
                        } else {
                            this.copyNode2(selection, exist);
                        }
                        selection.remove();
                    }
                }
                if (selection.get('iconCls') != this.getView().selectedIcon && selection.get('tree_parent_id') != 0) {
                    var selectionClone = selection.clone();
                    var parentClone = this.findParent(selection, selected, selectionClone);
                    // /console.log(parentClone);
                    this.checkParentNode(selection);
                    if (selected.indexOf(',' + parentClone.get('symbol_id') + ',') == -1) {
                        selectionClone.parentNode.data = Ext.apply(selectionClone.parentNode.getData(), { category: 2 });
                        rootNode.appendChild(parentClone);
                    } else {
                        var dirparent = forSelectStore.getNodeById(selectionClone.parentNode.get('symbol_id'));
                        if (dirparent.get('category') != 1) {
                            dirparent.data = Ext.apply(dirparent.getData(), { category: 2 });
                            dirparent.appendChild(selectionClone);
                            dirparent.sort();
                        }
                    }
                    if (!selection.isLeaf()) {
                        selection.data = Ext.apply(selection.getData(), { category: 1 });
                        var parent = selectionClone.parentNode;
                        var iconCls = selectionClone.get('iconCls');
                        selectionClone.remove();
                        this.copyNode(selection, parent);
                        parent.lastChild.set('iconCls', iconCls);
                        parent.sort();
                    }
                }
                // if (selected.indexOf(',' + selection.get('symbol_id') + ',') >= 0 && !selection.isLeaf() && selection.get('symbol_id') != 0) {
                //     var selectionClone = afterSelectStore.getNodeById(selection.get('symbol_id'));
                //     if (selectionClone.get('category') != '1') {
                //         selectionClone.data = Ext.apply(selectionClone.getData(), { category: 1 });
                //     }
                // }

            }
            rootNode.sort();
        },

        checkParentNode: function (selection) {
            var parent = selection.parentNode;
            if (selection.get('symbol_id') == 0) {
                return;
            }
            var childcount = parent.childNodes.length;
            if (childcount == 1) {
                this.checkParentNode(parent);
            }
            selection.remove();
        },

        onSelectAll: function (forSelectStore, afterSelectStore) {
            var controller = this;
            forSelectStore.root.removeAll();
            afterSelectStore.root.removeAll();
            afterSelectStore.setProxy({
                type: 'ajax',
                url: '/topo/topo_tree/tree',
                extraParams: { symbol_id: 0 },
                reader: {
                    type: 'json'
                }
            });
            afterSelectStore.load({
                callback: function (selections, operation, success) {
                    selections[0].data = Ext.apply(selections[0].getData(), { category: 1 });
                    for (var i in selections[0].childNodes) {
                        var record = selections[0].childNodes[i];
                        if (!record.isLeaf()) {
                            record.data = Ext.apply(record.getData(), { category: 1 });
                        }
                    }
                }
            });
        },

        onDeSelectAll: function () {
            var controller = this;
            var treeForSelect = this.view.down('#lefttree');
            var treeAfterSelect = this.view.down('#righttree');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            afterSelectStore.getRoot().removeAll();
            afterSelectStore.remove(afterSelectStore.getData().items);
            forSelectStore.reload();
        },

        toArray: function (set) {
            var arr = [];
            if (set != null) {
                set.forEach(function (element, sameElement, set) {
                    arr.push(element);
                });
            }
            return arr;
        },

        onBeforeItemExpand: function (node, optd) {
            if (node.get('id') == 'root') {
                return;
            }
            var me = this;
            var meView = me.getView();
            // var sec_user_id = meView.up("secUserLeftTree").down('userTab').sec_user_id;
            var selectTree = meView.down("#righttree"),
                noselectTree = meView.down("#lefttree"),
                subnetArr = me.toArray(me.view.subnetArray),
                subnetDevArr = me.toArray(me.view.subnetDevArr),
                symbolArr = me.toArray(me.view.symbolArr),
                delSubnetArr = me.toArray(me.view.delSubnetArr),
                delSymbolArr = me.toArray(me.view.delSymbolArr),
                rootnodes = selectTree.getRootNode().childNodes,
                symbolId = node.data.symbol_id;
            //=================================分层加载（expand属性为了只分层加载一次）=================================
            if (symbolId != "" && symbolId != undefined && node.get("expand") == undefined) {
                node.set("expand", true);
                var childcount = node.childNodes.length;
                node.removeAll();
                Ext.Ajax.request({
                    url: "/security/security_group/tree",
                    // async: false,
                    method: "GET",
                    params: {
                        symbol_id: symbolId,
                        subnetArr: subnetArr.join("-"),
                        subnetDevArr: subnetDevArr.join("-"),
                        symbolArr: symbolArr.join("-"),
                        delSubnetArr: delSubnetArr.join("-"),
                        delSymbolArr: delSymbolArr.join("-"),
                        // sec_usergroup_id: sec_user_id,
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
                        // if (node.get('checked')) {
                        //     for (var i in node.childNodes) {
                        //         node.childNodes[i].set('checked', true);
                        //     }
                        // }
                    }
                });
            }
        },
    },
    viewModel: {
        stores: {
            leftstore: {
                type: 'tree',
                proxy: {
                    type: 'ajax',
                    url: "/security/security_group/tree",
                    extraParams: {
                        NEG: 1,
                        use_checkbox: 1,
                        symbol_id: 0,
                        // sec_usergroup_id: sec_user_id,
                        type: 'user'
                    }
                },
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                }
            },
            rightstore: {
                type: 'tree',
                proxy: {
                    type: 'ajax',
                    url: "/security/security_group/tree",
                    extraParams: {
                        // NEG: 1,
                        use_checkbox: 1,
                        symbol_id: 0,
                        // sec_usergroup_id: sec_user_id,
                        type: 'user'
                    }
                },
                reader: {
                    type: 'json',
                    rootProperty: 'data',
                }
            }
        }
    },
    layout: "hbox",
    defaults: {
        height: "100%",
    },
    items: [{
        xtype: "treepanel",
        flex: 1,
        margin: "-2 0 0 0",
        title: "lefttree",
        multiSelect: true,
        rootVisible: false,
        bind: {
            store: '{leftstore}'
        },
        itemId: "lefttree",
        listeners: {
            beforeitemexpand: 'onBeforeItemExpand'
        }
    }, {
        xtype: "fieldcontainer",
        layout: "center",
        width: 60,
        items: [{
            xtype: "fieldcontainer",
            layout: "vbox",
            defaultType: "button",
            defaults: {
                width: 40,
                margin: 4
            },
            items: [{
                text: ">",
                itemId: "select",
                handler: "onSelect"
            }, {
                text: "<",
                itemId: "deselect",
                handler: "onDeSelect"
            }]
        }]
    }, {
        xtype: "treepanel",
        flex: 1,
        margin: "-2 0 0 0",
        title: "righttree",
        rootVisible: false,
        multiSelect: true,
        bind: {
            store: '{rightstore}'
        },
        itemId: "righttree",
        listeners: {
            beforeitemexpand: 'onBeforeItemExpand'
        }
    }]
});