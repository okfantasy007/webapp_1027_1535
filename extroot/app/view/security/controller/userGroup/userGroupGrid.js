Ext.define('Admin.view.security.controller.userGroup.userGroupGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userGroupGrid',

    onSelectChange: function (thisModel, selRecords) {
        var meView = this.getView();
        var length = selRecords.length;
        meView.down('#remove').setDisabled(selRecords == 0);
        meView.down('#edit').setDisabled(length != 1);
        if (length == 1 && selRecords[0].get('sec_usergroup_id') == 1) {
            meView.down('#remove').setDisabled(true);
        }
    },

    onAdd: function () {
        var window = new Admin.view.security.view.userGroup.userGroupTabWindow();
        window.down('#security_group_form_member').lookupController().loadPages(null);
        window.show();
        this.getView().add(window);
    },

    onEdit: function () {
        var meView = this.getView(),
            record = meView.getSelectionModel().getSelection()[0];
        this.selectSecurityMenuTreeNode('security_group_form,' + record.get('sec_usergroup_id'));
    },

    selectSecurityMenuTreeNode: function (nodeid) {
        var meView = this.getView();
        var treeMenu = meView.up("secUserLeftTree").down("treepanel");
        var node = this.findTreeNodesById(treeMenu.getRootNode().childNodes, nodeid);
        treeMenu.getSelectionModel().select([node]);
    },

    findTreeNodesById: function (rootnodes, nodeid) {
        for (var i in rootnodes) {
            if (rootnodes[i].get('id') == nodeid) {
                return rootnodes[i];
            } else if (rootnodes[i].childNodes.length > 0) {
                var node = this.findTreeNodesById(rootnodes[i].childNodes, nodeid);
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
        names.push('下列用户组将被删除</br>');
        Ext.Array.each(records, function (rec) {
            if (rec.get('sec_usergroup_id') == 1) {
                protnames.push("'" + rec.get('sec_usergroup_name') + "'");
            } else {
                names.push(rec.get('sec_usergroup_name'));
                ids.push(rec.get('sec_usergroup_id'));
                name.push(rec.get('sec_usergroup_name'));
            }
        });
        if (protnames.length > 0) {
            Ext.Msg.alert(_('Notice'), _('You can not delete the Super Administrators group'));
        } else {
            Ext.MessageBox.confirm(_('Delete confirmation'), names.join('<br/>'),
                function (np) {
                    if (np == 'yes') {
                        Ext.create('Ext.form.Panel').getForm().submit({
                            url: '/security/security_group/delete',
                            params: {
                                ids: ids.join(','),
                                name: name.join(',')
                            },
                            waitTitle: _('Please wait...'),
                            waitMsg: _('Please wait...'),
                            success: function (form, action) {
                                Ext.Msg.alert(_('Notice'), _(action.result.msg),
                                    function () {
                                        me.onRefresh();
                                        meView.up('secUserLeftTree').lookupController().onRefresh();
                                    });
                            },
                            failure: function (form, action) {
                                Ext.Msg.alert(_('Notice'), _(action.result.msg));
                            }
                        });
                    }
                });
        }
    },

    onRefresh: function () {
        var meView = this.getView();
        meView.getStore().reload();
    },

    ondbClick: function (dataview, record, item, index, e) {
        this.selectSecurityMenuTreeNode('security_group_form,' + record.get('sec_usergroup_id'));
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