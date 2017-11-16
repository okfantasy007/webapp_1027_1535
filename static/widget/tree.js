Ext.define("widget.tree", {
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
        rightMove: function () {
            var me = this;
            var leftTree = me.view.down('#leftTree');
            var rightTree = me.view.down('#rightTree');
            var leftTreeStore = leftTree.store;
            var rightTreeStore = rightTree.store;
            var selections = leftTree.getSelection();
            var root = rightTreeStore.root;
            var equipR = root.childNodes[0];
            for (var i in selections) {
                var selection = selections[i];
                if (selection.get('depth') == 1) {
                    break;
                }
                // if (selection.get('depth') == 2) {
                var selectionClone = selection.clone();
                me.insertParents(selection, selectionClone, rightTreeStore, me);
                if (!selection.isLeaf()) {
                    // equipR.appendChild(selection.clone());

                    var rightExistNode = rightTreeStore.getNodeById(selection.get("id"));
                    me.insertChilds(selection, rightExistNode, me);
                }
                selection.remove();
                // }
            }
        },

        leftMove: function () {

        },

        insertChilds: function (selection, rightExistNode, me) {
            var selectionClone = selection.clone();
            var childs = selection.childNodes;
            for (var i in childs) {
                // alert(3333);
                if (!childs[i].isLeaf()) {
                    // alert(2);
                    me.insertChilds(childs[i], selectionClone, me);
                } else {
                    // alert(1);
                    selectionClone.appendChild(childs[i].clone());
                }
            }
            // console.log(se)
            rightExistNode.appendChild(selectionClone);
        },

        insertParents: function (selection, selectionClone, treeStore, me) {
            var parentNode = selection.parentNode;
            var parentClone = parentNode.clone();
            parentClone.appendChild(selectionClone);
            var existNode = treeStore.getNodeById(parentClone.get('id'));
            if (existNode) {
                existNode.appendChild(selectionClone);
                return;
            } else {
                return me.insertParents(parentNode, parentClone, treeStore, me);
            }
        }
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
        multiSelect: true,
        margin: "-2 0 0 0",
        title: "leftTree",
        rootVisible: false,
        bind: {
            store: '{leftstore}'
        },
        itemId: "leftTree",
        listeners: {
            // beforeitemexpand: 'onBeforeItemExpand'
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
                handler: "rightMove"
            }, {
                text: "<",
                itemId: "deselect",
                handler: "leftMove"
            }]
        }]
    }, {
        xtype: "treepanel",
        flex: 1,
        multiSelect: true,
        margin: "-2 0 0 0",
        title: "righttree",
        rootVisible: false,
        // bind: {
        //     store: '{rightstore}'
        // },
        itemId: "rightTree",
        listeners: {
            // beforeitemexpand: 'onRightTreeBeforeItemExpand'
        }
    }]
});