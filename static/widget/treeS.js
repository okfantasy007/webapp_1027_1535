Ext.define("widget.treeS", {
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
    controller: {
        onSelect: function () {
            this.getView().dirty = true;
            var controller = this;
            var treeForSelect = this.view.down('#lefttree');
            var treeAfterSelect = this.view.down('#righttree');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            var selections = treeForSelect.getSelection();
            var rootN = afterSelectStore.getRoot();
            var rootNode;
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
                if (selection.get('tree_parent_id') == 0) {
                    if (selection.isLeaf()) {// if (selection.get('res_type_name') == 'NE') {
                        rootNode.appendChild(selection.clone());
                        selection.remove();
                    } else if (!selection.isLeaf()) {
                        selection.data = Ext.apply(selection.getData(), { category: 1 });
                        this.copyNode(selection, rootNode);
                        selection.remove();
                    }
                }
                if (selection.get('tree_parent_id') != 0) {
                    var selectionClone = selection.clone();
                    var parentClone = this.findParent(selection, selected, selectionClone);
                    this.checkParentNode(selection);
                    if (selected.indexOf(',' + parentClone.get('symbol_id') + ',') == -1) {
                        selectionClone.parentNode.data = Ext.apply(selectionClone.parentNode.getData(), { category: 2 });
                        rootNode.appendChild(parentClone);
                    } else {
                        //var parent = afterSelectStore.getNodeById(parentClone.get('symbol_id'));
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
                        this.copyNode(selection, parent);
                        // parent.lastChild.set('iconCls', iconCls);
                        parent.sort();
                    }
                }
                if (selected.indexOf(',' + selection.get('symbol_id') + ',') >= 0 && !selection.isLeaf() && selection.get('symbol_id') != 0) {
                    var selectionClone = afterSelectStore.getNodeById(selection.get('symbol_id'));
                    if (selectionClone.get('category') != '1') {
                        selectionClone.data = Ext.apply(selectionClone.getData(), { category: 1 });
                        this.onRightTreeBeforeItemExpand(selectionClone, 'reload');
                    }
                }
            }
            rootNode.triggerUIUpdate();
            rootNode.sort();
        },
        findParent: function (node, selected, nodeClone) {
            var controller = this;
            // node.set('iconCls', this.getView().selectedIcon);
            var parentNode = node.parentNode;
            var parentClone = parentNode.clone();
            parentClone.appendChild(nodeClone);
            if (selected.indexOf(',' + parentNode.get('symbol_id') + ',') == -1) {
                if (parentNode.get('tree_parent_id') == 0) {
                    // parentNode.set('iconCls', controller.getView().selectedIcon);
                    // parentNode.remove();
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
        copyNode: function (selection, rootNode) {
            var node = selection.clone();
            for (var i in selection.childNodes) {
                var childNode = selection.childNodes[i];
                if (!childNode.isLeaf()) {
                    node.data = Ext.apply(node.getData(), { category: 1 });
                    this.copyNode(childNode, node);
                } else {
                    node.appendChild(childNode.clone());
                }
                // childNode.set('iconCls', this.getView().selectedIcon);
            }
            rootNode.appendChild(node);
            // selection.set('iconCls', this.getView().selectedIcon);
        },

        selectTreeNode: function (symbolid) {
            var treeForSelect = this.view.down('#lefttree');
            var record = treeForSelect.getStore().getNodeById(symbolid);
            if (record != null) {
                var path = record.getPath();
                treeForSelect.selectPath(path);
            }
        },

        onDeSelect: function () {
            // this.getView().dirty = true;
            // var controller = this;
            // var treeForSelect = this.view.down('#lefttree');
            // var treeAfterSelect = this.view.down('#righttree');
            // var forSelectStore = treeForSelect.getStore();
            // var afterSelectStore = treeAfterSelect.getStore();
            // var selections = treeAfterSelect.getSelection();
            // for (var i in selections) {// while (selections.length > 0) {
            //     var selection = selections[i];
            //     if (selection.get('symbol_id') == 0) {
            //         controller.onDeSelectAll();
            //         break;
            //     }
            //     if (!selection.isLeaf()) {
            //         var symbolids = this.getAllSymbolID(selection, controller);
            //         var leftNode = forSelectStore.getNodeById(selection.get('symbol_id'));
            //         if (leftNode) {
            //             if (leftNode.childNodes[0].get('symbol_id') != 'loading') {
            //                 this.loadRawNode(leftNode);
            //             }
            //         }
            //     }
            //     this.checkParentNode(selection);
            //     var symbolid = selection.get('symbol_id');
            //     var iconCls = selection.get('iconCls');
            //     if (forSelectStore.getNodeById(symbolid)) {
            //         forSelectStore.getNodeById(symbolid).set('iconCls', iconCls);
            //     }
            //     selection.parentNode.data = Ext.apply(selection.parentNode.getData(), { category: 2 });
            //     selection.remove();
            // }
            // this.getView().dirty = true;
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
                if (selection.get('tree_parent_id') == 0) {
                    if (selection.isLeaf()) {// if (selection.get('res_type_name') == 'NE') {
                        rootNode.appendChild(selection.clone());
                        selection.remove();
                    } else if (!selection.isLeaf()) {
                        selection.data = Ext.apply(selection.getData(), { category: 1 });
                        this.copyNode(selection, rootNode);
                        selection.remove();
                    }
                }
                if (selection.get('tree_parent_id') != 0) {
                    var selectionClone = selection.clone();
                    var parentClone = this.findParent(selection, selected, selectionClone);
                    this.checkParentNode(selection);
                    if (selected.indexOf(',' + parentClone.get('symbol_id') + ',') == -1) {
                        selectionClone.parentNode.data = Ext.apply(selectionClone.parentNode.getData(), { category: 2 });
                        rootNode.appendChild(parentClone);
                    } else {
                        //var parent = afterSelectStore.getNodeById(parentClone.get('symbol_id'));
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
                        this.copyNode(selection, parent);
                        parent.lastChild.set('iconCls', iconCls);
                        parent.sort();
                    }
                }
                // if (selected.indexOf(',' + selection.get('symbol_id') + ',') >= 0 && !selection.isLeaf() && selection.get('symbol_id') != 0) {
                //     var selectionClone = afterSelectStore.getNodeById(selection.get('symbol_id'));
                //     //selectionClone.remove();
                // }
            }
            rootNode.triggerUIUpdate();
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
            this.getView().dirty = true;
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
                callback: function (records, operation, success) {
                    records[0].data = Ext.apply(records[0].getData(), { category: 1 });
                    for (var i in records[0].childNodes) {
                        var record = records[0].childNodes[i];
                        if (!record.isLeaf()) {
                            record.data = Ext.apply(record.getData(), { category: 1 });
                        }
                    }
                }
            });
        },

        onDeSelectAll: function () {
            this.getView().dirty = true;
            var controller = this;
            var treeForSelect = this.view.down('#lefttree');
            var treeAfterSelect = this.view.down('#righttree');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            afterSelectStore.getRoot().removeAll();
            afterSelectStore.remove(afterSelectStore.getData().items);
            forSelectStore.reload();
        },
        // palneNodeReload: function (node) {
        //     var symbolId = node.data.symbol_id;
        //     if (symbolId != 0 && !isNaN(symbolId)) {
        //         var childcount = node.childNodes.length;
        //         for (var i = 0; i < childcount; i++) {
        //             node.childNodes[0].remove();
        //         }
        //         Ext.Ajax.request({
        //             url: '/topo/topo_tree/tree?symbol_id=' + symbolId,
        //             success: function (response) {
        //                 var r = Ext.decode(response.responseText).children;
        //                 for (var i = 0; i < r.length; i++) {
        //                     node.appendChild(r[i]);
        //                 }
        //                 if (!node.lastChild.isLeaf()) {
        //                     node.lastChild.triggerUIUpdate();
        //                 }
        //             }
        //         });
        //     }
        // }
    },
    viewModel: {
        stores: {
            leftstore: {
                type: 'tree',
                proxy: {
                    type: 'ajax',
                    // url: '/security/test/tree',
                    url: "/topo/topo_tree/tree",
                    extraParams: {
                        NEG: 1,
                        use_checkbox: 1,
                        symbol_id: 0,
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
                    // url: '/security/test/tree',
                    url: "/security/security_group/tree",
                    extraParams: {
                        NEG: 1,
                        use_checkbox: 1,
                        symbol_id: 0,
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
        checkPropagation: "both",
        itemId: "lefttree",
        listeners: {
            // beforeitemexpand: 'leftExpand'
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
        // bind: {
        //     store: '{rightstore}'
        // },
        checkPropagation: "both",
        itemId: "righttree",
        listeners: {
            // beforeitemexpand: 'rightExpand'
        }
    }]
});