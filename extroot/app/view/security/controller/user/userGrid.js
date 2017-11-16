Ext.define('Admin.view.security.controller.user.userGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userGrid',

    onSelectChange: function (thisModel, selRecords) {
        var meView = this.getView();
        var length = selRecords.length;
        meView.down('#edit').setDisabled(length != 1);
        meView.down('#remove').setDisabled(length == 1 && selRecords[0].get('user_type') == 0 || length == 0);
        meView.down('#pwd').setDisabled(length == 1 && selRecords[0].get('user_type') == 0 || length != 1);
        meView.down('#unlock').setDisabled(length == 0);
        for (var i in selRecords) {
            if (selRecords[i].get('lock_status') == 0 || selRecords[i].get('lock_status') == 2) {
                meView.down('#unlock').setDisabled(true);
            }
        }
    },

    onAdd: function () {
        var window = new Admin.view.security.view.user.userTabWindow();
        window.down('#user_form_belongto_usergroup').lookupController().loadPages(null);
        window.show();
        this.getView().add(window);
    },

    onEdit: function () {
        var meView = this.getView(),
            record = meView.getSelectionModel().getSelection()[0];
        this.selectSecurityMenuTreeNode('security_user_form,' + record.get('sec_user_id'));
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
        names.push(_('The following users will be deleted </ br>'));
        Ext.Array.each(records,
            function (rec) {
                if (rec.get('sec_user_id') == 1) {
                    protnames.push("'" + rec.get('user_name') + "'");
                } else {
                    names.push(rec.get('user_name'));
                    ids.push(rec.get('sec_user_id'));
                    name.push(rec.get('user_name'));
                }
            });
        if (protnames.length > 0) {
            Ext.Msg.alert(_('Notice'), _('Can not delete super administrator'));
        } else {
            Ext.MessageBox.confirm(_('Delete confirmation'), names.join('<br/>'),
                function (np) {
                    if (np == 'yes') {
                        Ext.create('Ext.form.Panel').getForm().submit({
                            url: '/security/del_user',
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

    onSetPwd: function () {
        var meView = this.view;
        var window = new Admin.view.security.view.user.userSetPwdWindow();
        var record = meView.getSelectionModel().getSelection()[0];
        window.down('form').getForm().loadRecord(record);
        window.show();
        meView.down('userGrid').add(window);
    },

    onRefresh: function () {
        var meView = this.getView();
        meView.getStore().reload();
    },

    onUnlock: function () {
        var me = this;
        var meView = this.getView();
        var records = meView.getSelectionModel().getSelection();
        var names = [], ids = [], protnames = [];
        names.push(_('The following users will be unlocked</br>'));
        Ext.Array.each(records,
            function (rec) {
                if (rec.get('sec_user_id') == 1) {
                    protnames.push("'" + rec.get('user_name') + "'");
                } else {
                    names.push(rec.get('user_name'));
                    ids.push(rec.get('sec_user_id'));
                }
            });

        Ext.MessageBox.confirm(_('Unlock confirmation'), names.join('<br/>'),
            function (np) {
                if (np == 'yes') {
                    Ext.create('Ext.form.Panel').getForm().submit({
                        url: '/security/unlock_user',
                        // url: '/rest/security/usermanagercenter/get_loginmode',
                        params: {
                            ids: ids.join(',')
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
    },

    ondbClick: function (dataview, record, item, index, e) {
        this.selectSecurityMenuTreeNode('security_user_form,' + record.get('sec_user_id'));
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