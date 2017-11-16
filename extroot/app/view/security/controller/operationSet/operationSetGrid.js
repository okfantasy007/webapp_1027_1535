Ext.define('Admin.view.security.controller.operationSet.operationSetGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.operationSetGrid',

    onAdd: function () {//添加
        var window = new Admin.view.security.view.operationSet.operationSetTabWindow();
        window.show();
        this.getView().add(window);
    },

    onSelectChange: function (thisModel, selRecords) {
        var all = false;
        var meView = this.getView();
        var length = selRecords.length;
        meView.down('#remove').setDisabled(length == 0);
        meView.down('#edit').setDisabled(length != 1);
        for (var i in selRecords) {
            if (selRecords[i].get('is_default') == 1) {
                all = true;
                break
            }
        }
        if (all) {
            meView.down('#remove').setDisabled(true);
        }
    },

    onEdit: function () {
        var meView = this.getView(),
            record = meView.getSelectionModel().getSelection()[0];
        this.selectSecurityMenuTreeNode('security_operset_form,' + record.get('sec_operator_set_id'));
    },

    selectSecurityMenuTreeNode: function (nodeid) {
        var me = this;
        var treeMenu = me.getView().up('secUserLeftTree').down('treepanel');
        var node = me.findTreeNodesById(treeMenu.getRootNode().childNodes, nodeid);
        treeMenu.getSelectionModel().select([node]);
    },

    findTreeNodesById: function (rootnodes, nodeid) {
        var me = this;
        for (var i in rootnodes) {
            if (rootnodes[i].get('id') == nodeid) {
                return rootnodes[i];
            } else if (rootnodes[i].childNodes.length > 0) {
                var node = me.findTreeNodesById(rootnodes[i].childNodes, nodeid);
                if (node != null) {
                    return node;
                }
            }
        }
        return null;
    },

    onDelete: function () {
        var me = this;
        var meView = me.getView();
        var records = meView.getSelectionModel().getSelection();
        var names = [], ids = [], protnames = [], name = [];
        names.push(_("The following sets of operations will be deleted:<br/>"));
        Ext.Array.each(records,
            function (rec) {
                if (rec.get('is_default') == 0) {
                    names.push("'" + rec.get('sec_operator_set_name') + "'");
                    ids.push(rec.get('id'));
                    name.push(rec.get('sec_operator_set_name'));
                } else {
                    protnames.push("'" + rec.get('sec_operator_set_name') + "'");
                }
            });
        if (protnames.length > 0) {
            Ext.Msg.alert(_('Notice'), _("The following default set of operations can not be deleted:<br/>") + protnames.join('<br/>'));
            return;
        };

        Ext.MessageBox.confirm(_('Delete confirmation'), names.join('<br/>'),
            function (btn) {
                if (btn == 'yes') {
                    console.log(name);
                    Ext.create('Ext.form.Panel').getForm().submit({
                        url: '/security/security_operset/delete',
                        params: {
                            ids: ids.join(','),
                            name: name.join(',')
                        },
                        waitTitle: _('Please wait...'),
                        waitMsg: _('Please wait...'),
                        success: function (form, action) {
                            Ext.Msg.alert(_('Notice'), _(action.result.msg),
                                function () {
                                    meView.up('secUserLeftTree').lookupController().onRefresh();
                                    me.onRefresh();
                                });
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert(_('Notice'), _(action.result.msg));
                        }
                    });
                }
            });
    },

    onRefresh: function () {
        var meView = this.getView();
        meView.getStore().reload();
    },

    ondbClick: function (dataview, record, item, index, e) {
        this.selectSecurityMenuTreeNode('security_operset_form,' + record.get('sec_operator_set_id'));
    },

    onContextMenu: function (self, e, eOpts) {
        this.rightMenu(e);
    },

    onItemContextMenu: function (self, record, item, index, e, eOpts) {
        this.rightMenu(e);
    },

    rightMenu: function (e) {
        e.preventDefault();
        e.stopEvent();
        var grid = this.view;
        var me = this;
        var rightMenu = new Ext.menu.Menu({
            items: [
                {
                    text: _('Refresh'),
                    funcid: '040120',
                    iconCls: 'x-fa fa-sign-in',
                    handler: function () {
                        me.view.store.reload();
                    }
                }
            ]
        });
        rightMenu.showAt(e.getXY());
        grid.add(rightMenu);
    }
});