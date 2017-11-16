Ext.define('Admin.view.security.controller.userGroup.userGroupOpAuthority', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userGroupOpAuthority',
    getOpersetNodesInTree: function (rootnodes) {
        var me = this;
        var meView = me.getView();
        var ids = [];
        for (var i in rootnodes) {
            if (rootnodes[i].get('leaf')) {
                if (rootnodes[i].get('res_type_name') == 'operset') {
                    ids.push(rootnodes[i].get('id'))
                }
            } else if (rootnodes[i].childNodes.length > 0) {
                ids = ids.concat(me.getOpersetNodesInTree(rootnodes[i].childNodes));
            }
        }
        meView.operset_ids = ids;
        return ids;
    },

    loadPages: function (rec) {
        var meView = this.getView();
        var resourceStore = meView.down('#resource_tree').getStore();
        var opersetStore = meView.down('#operset_tree').getStore();
        var isAdmin = rec.get("is_belongto_admin");
        var groupid = rec.get("sec_usergroup_id");
        var userGroupOpAuthorityToolBar = meView.down("#userGroupOpAuthorityToolBar");
        userGroupOpAuthorityToolBar.setDisabled(isAdmin || groupid == 1);
        resourceStore.proxy.extraParams = {
            sec_usergroup_id: groupid
        }

        opersetStore.proxy.extraParams.type = -1;
        resourceStore.reload();
        opersetStore.reload();
    },

    onApply: function () {
        var me = this;
        var meView = this.getView();
        var tree = meView.down('#resource_tree'),
            name = meView.up('userGroupTab').name,
            sec_usergroup_id = meView.up('userGroupTab').sec_usergroup_id,
            ids = me.getOpersetNodesInTree(tree.getRootNode().childNodes),
            delIds = meView.delIds,
            addIds = meView.addIds,
            delIdsArr = [],
            addIdsArr = [];
        if (delIds != undefined) {
            delIds.forEach(function (element, sameElement, set) {
                delIdsArr.push(element);
            });
        }
        if (addIds != undefined) {
            addIds.forEach(function (element, sameElement, set) {
                addIdsArr.push(element);
            });
        }
        Ext.create('Ext.form.Panel').getForm().submit({
            url: '/security/security_group/update_operstor',
            params: {
                name: name,
                sec_usergroup_id: sec_usergroup_id,
                delIdsArr: delIdsArr.join(','),
                addIdsArr: addIdsArr.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg));
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg));
            }
        });
        meView.addIds.clear();
        meView.delIds.clear();
    },
    onSelect: function () {
        var meView = this.getView();
        var tree = meView.down('#resource_tree');
        if (tree.getSelection().length == 1) {
            var target_node = tree.getSelection()[0];
            var delIds = meView.delIds;
            delIds.add(target_node.get("id"));
            if (target_node.get('res_type_name') == 'operset') {
                target_node.remove();
            }
        };
    },

    onDeSelect: function () {
        var me = this;
        var meView = me.getView();
        var tree = meView.down('#resource_tree');
        var opersetTree = meView.down('#operset_tree');
        if (tree.getSelection().length == 1 && opersetTree.getSelection().length == 1) {
            var target_node = tree.getSelection()[0];
            var source_node = (opersetTree.getSelection()[0]).copy();
            source_node.set('id', target_node.get('id') + '_' + source_node.get('id') + '_' + target_node.get('category'));
            target_node.removeAll();
            var addIds = meView.addIds;
            addIds.add(source_node.get('id'));
            target_node.appendChild(source_node);
            target_node.expand();
        };
        me.getOpersetNodesInTree(tree.getRootNode().childNodes);
    },

    onResourceSelectChange: function (self, records, eOpts) {
        if (records.length != 1) {//刷新时监听事件会再次出发为防止空指针
            return;
        }
        var meView = this.getView();
        var rec = records[0];
        var opersetStore = meView.down('#operset_tree').getStore();
        var select_btn = meView.down('#select');
        var deselect_btn = meView.down('#deselect');

        if (rec.get('res_type_name') == 'operset') {
            select_btn.setDisabled(false);
        }
        else {
            select_btn.setDisabled(true);
        }
        if (records.length != 1) {
            return
        };
        if (rec.get('symbol_id') == -7) {
            // 网管应用类型
            opersetStore.proxy.extraParams.type = 1;
        } else if (rec.get('res_type_name') == 'NE' || (rec.get('res_type_name') == 'TOPO_SUBNET' && rec.get('category') == 1) || (rec.get('res_type_name') == 'SEC_ALLOBJ_SET' && rec.get('category') == 1)) {

            // 设备类型
            opersetStore.proxy.extraParams.type = 2;
        } else {
            // 不显示类型
            opersetStore.proxy.extraParams.type = -1;
        }
        opersetStore.reload();
    },

    onOpersetSelectChange: function (self, records, eOpts) {
        var meView = this.getView();
        var deselect_btn = meView.down('#deselect');
        if (records.length == 1) {
            deselect_btn.setDisabled(false);
        }
        else {
            deselect_btn.setDisabled(true);
        }
    },

    onBeforeItemExpand: function (node, optd) {
        var meView = this.getView();
        var sec_usergroup_id = meView.up('userGroupTab').sec_usergroup_id;
        var symbolId = node.data.symbol_id;
        if (symbolId != '' && symbolId != undefined && symbolId != -7 && node.get('res_type_name') != 'NE' && node.get('category') != 1) {
            var childcount = node.childNodes.length;
            for (var i = 0; i < childcount; i++) {
                node.childNodes[0].remove();
            }
            Ext.Ajax.request({
                url: "/security/security_group/getFunAccess",
                method: "GET",
                params: {
                    symbol_id: symbolId,
                    sec_usergroup_id: sec_usergroup_id
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
        }
    }
});