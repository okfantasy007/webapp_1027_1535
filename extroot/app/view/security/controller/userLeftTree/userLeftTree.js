Ext.define('Admin.view.security.controller.userLeftTree.userLeftTree', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.secUserLeftTree',

    onRefresh: function () {
        this.getView().down('treepanel').store.reload();
    },

    onLoad: function () {
        var treeMenu = this.getView().down('treepanel');
        if (treeMenu) {
            var selectModel = treeMenu.getSelectionModel();
            var isExist = selectModel.getSelection().length;
            var firstChild = treeMenu.getRootNode().firstChild
            if (!isExist && firstChild) {
                selectModel.select([firstChild.firstChild]);//数据加载时默认选中用户
            }
        }
    },

    onSelectChange: function (self, records, eOpts) {//节点变化页面的数据变化
        var meView = this.getView();
        var rec = records[0];
        if (!rec) {
            return;
        }
        var centerPanel = meView.down('#centerPanel');
        var activePanel = meView.down('#' + rec.get('itemId'));
        if (rec.get('itemId') != 'security_menu_root') {
            centerPanel.setActiveItem(rec.get('itemId'));
        }
        if (activePanel) {
            activePanel.setConfig({//页面标题变化
                title: rec.get('text')
            });
            activePanel.setConfig({//页面图片变化
                iconCls: rec.get('iconCls')
            });
            if (rec.get('itemId') == 'security_user_form') {//修改时页面数据辩护（用户）
                meView.down('userTab').lookupController().loadPages(rec);
            };
            if (rec.get('itemId') == 'security_group_form') {//修改时页面数据辩护（用户组）
                meView.down('userGroupTab').lookupController().loadPages(rec);
                meView.sec_usergroup_id = rec.get(' sec_usergroup_id');
            };
            if (rec.get('itemId') == 'security_operset_form') {//修改时页面数据辩护（操作集）
                meView.down('operationSetTab').lookupController().loadPages(rec);
            }
        }
    },

    onSplitResize: function (me, eOpts) {
        var secUserLeftTree = this.getView();
        var rightContainer = secUserLeftTree.up('rightContainer');
        secUserLeftTree.minHeight = rightContainer.getHeight();
    },

    onContextMenu: function (self, record, item, index, e, eOpts) {
        e.preventDefault();
        e.stopEvent();
        var treeMenu = this.getView().down('treepanel');
        var me = this;
        var rightMenu = new Ext.menu.Menu({
            items: [
                {
                    text: _('Refresh'),
                    funcid: '040120',
                    iconCls: 'x-fa fa-sign-in',
                    handler: function () {
                        me.view.down('treepanel').store.reload();
                    }
                },
                {
                    text: _('新建用户'),
                    funcid: '040107',
                    iconCls: 'x-fa fa-edit',
                    handler: function () {
                        me.view.down('userGrid').lookupController().onAdd();
                    }
                },
                {
                    text: _('新建用户组'),
                    funcid: '040121',
                    iconCls: 'x-fa fa-edit',
                    handler: function () {
                        me.view.down('userGroupGrid').lookupController().onAdd();
                    }
                },
                {
                    text: _('新建操作集'),
                    funcid: '040108',
                    iconCls: 'x-fa fa-arrows',
                    handler: function () {
                        me.view.down('operationSetGrid').lookupController().onAdd();
                    }
                },
                {
                    text: _('Delete'),
                    funcid: '040109',
                    iconCls: 'x-fa fa-trash',
                    // disabled: false,
                    handler: function () {
                        alert(1);
                        var itemId = record.data.itemId;
                        var name = record.data.text;
                        var id = record.data;
                        console.log(id);
                        if (itemId == 'security_user_form') {
                            var id = record.data.sec_user_id;
                            me.onDelete([name], [id], 'userGrid', '/security/del_user');
                        }
                        if (itemId == 'security_group_form') {
                            var id = record.data.sec_usergroup_id;
                            me.onDelete([name], [id], 'userGroupGrid', '/security/security_group/delete');
                        }
                        if (itemId == 'security_operset_form') {
                            var id = record.data.sec_operator_set_id;
                            me.onDelete([name], [id], 'operationSetGrid', '/security/security_operset/delete');
                        }
                    }
                },
                {
                    text: _('重置密码'),
                    funcid: '040123',
                    iconCls: 'x-fa fa-file-text-o',
                    // disabled: true,
                    handler: function () {
                        me.onSetPwd(record);
                    }
                },
                {
                    text: _('解除锁定'),
                    funcid: '040122',
                    iconCls: 'x-fa fa-exchange',
                    handler: 'onNeSynchronization'
                }
            ]
        });

        if (record.data.itemId == 'security_menu_root') {
            rightMenu.items.getAt(1).setVisible(false);
            rightMenu.items.getAt(2).setVisible(false);
            rightMenu.items.getAt(3).setVisible(false);
            rightMenu.items.getAt(4).setVisible(false);
            rightMenu.items.getAt(5).setVisible(false);
            rightMenu.items.getAt(6).setVisible(false);
        }
        if (record.data.itemId == 'security_user_view') {
            rightMenu.items.getAt(0).setVisible(false);
            rightMenu.items.getAt(2).setVisible(false);
            rightMenu.items.getAt(3).setVisible(false);
            rightMenu.items.getAt(4).setVisible(false);
            rightMenu.items.getAt(5).setVisible(false);
            rightMenu.items.getAt(6).setVisible(false);
        }
        if (record.data.itemId == 'security_user_form') {
            rightMenu.items.getAt(0).setVisible(false);
            rightMenu.items.getAt(1).setVisible(false);
            rightMenu.items.getAt(2).setVisible(false);
            rightMenu.items.getAt(3).setVisible(false);
            if (record.data.lock_status == 0) {
                rightMenu.items.getAt(6).setVisible(false);
            }
        }
        if (record.data.itemId == "security_group_view") {
            rightMenu.items.getAt(0).setVisible(false);
            rightMenu.items.getAt(1).setVisible(false);
            rightMenu.items.getAt(3).setVisible(false);
            rightMenu.items.getAt(4).setVisible(false);
            rightMenu.items.getAt(5).setVisible(false);
            rightMenu.items.getAt(6).setVisible(false);
        }
        if (record.data.itemId == 'security_group_form') {
            rightMenu.items.getAt(0).setVisible(false);
            rightMenu.items.getAt(1).setVisible(false);
            rightMenu.items.getAt(2).setVisible(false);
            rightMenu.items.getAt(3).setVisible(false);
            rightMenu.items.getAt(5).setVisible(false);
            rightMenu.items.getAt(6).setVisible(false);
        }
        if (record.data.itemId == "security_operset_view") {
            rightMenu.items.getAt(0).setVisible(false);
            rightMenu.items.getAt(1).setVisible(false);
            rightMenu.items.getAt(2).setVisible(false);
            rightMenu.items.getAt(4).setVisible(false);
            rightMenu.items.getAt(5).setVisible(false);
            rightMenu.items.getAt(6).setVisible(false);
        }
        if (record.data.itemId == "security_operset_form") {
            rightMenu.items.getAt(0).setVisible(false);
            rightMenu.items.getAt(1).setVisible(false);
            rightMenu.items.getAt(2).setVisible(false);
            rightMenu.items.getAt(3).setVisible(false);
            rightMenu.items.getAt(5).setVisible(false);
            rightMenu.items.getAt(6).setVisible(false);
        }
        if (record.data.id != 'security_group_form,1' && record.data.id != 'security_user_form,1' && record.data.id != 'security_online_user_view' && (record.data.itemId != "security_operset_form" || record.data.id.split(',')[1]) > 0) {
            rightMenu.showAt(e.getXY());
            treeMenu.add(rightMenu);
        }
    },

    onDelete: function (name, ids, type, url) {
        var me = this;
        Ext.MessageBox.confirm(_('Delete confirmation'), name.join('<br/>'),
            function (np) {
                if (np == 'yes') {
                    Ext.create('Ext.form.Panel').getForm().submit({
                        url: url,
                        params: {
                            ids: ids.join(','),
                            name: name.join(',')
                        },
                        waitTitle: _('Please wait...'),
                        waitMsg: _('Please wait...'),
                        success: function (form, action) {
                            Ext.Msg.alert(_('Notice'), _(action.result.msg),
                                function () {
                                    me.view.down(type).lookupController().onRefresh();
                                    me.view.down('treepanel').store.reload();
                                });

                        },
                        failure: function (form, action) {
                            Ext.Msg.alert(_('Notice'), _(action.result.msg));
                        }
                    });
                }
            });
    },

    onSetPwd: function (record) {
        var win = new Ext.window.Window({
            title: _('Reset Password'),
            iconCls: "",
            modal: true,
            width: "33%",
            minWidth: 200,
            height: "42%",
            minHeight: 250,
            monitorResize: true,
            layout: "fit",
            items: [{
                xtype: "form",
                layout: "anchor",
                defaultType: "textfield",
                defaults: {
                    anchor: "100%",
                    margin: "6 12 0 12"
                },
                items: [{
                    name: 'oldPassword',
                    itemId: 'oldPassword',
                    fieldLabel: _('Enter the old password'),
                    inputType: "password",
                    maxLength: 16,
                    allowBlank: false,
                    margin: "15 12 0 12"
                }, {
                    name: 'newPassword',
                    itemId: 'newPassword',
                    inputType: 'password',
                    fieldLabel: _('Enter a new password'),
                    maxLength: 16,
                    allowBlank: false
                }, {
                    name: 'confirmPassword',
                    itemId: 'confirmPassword',
                    inputType: 'password',
                    fieldLabel: _('confirm password'),
                    maxLength: 16,
                    allowBlank: false
                }],
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    itemId: 'userTabToolbar',
                    defaults: {
                        minWidth: 60,
                        margin: 3
                    },
                    items: [
                        {
                            xtype: 'component',
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            text: _('Cancel'),
                            iconCls: 'x-fa fa-close',
                            handler: function () {
                                this.up('window').close();
                            }
                        },
                        {
                            xtype: 'button',
                            text: _('Save'),
                            iconCls: 'x-fa fa-save',
                            handler: function () {
                                var window = this.up('window');
                                this.up('form').getForm().submit({
                                    url: '',
                                    method: 'POST',
                                    params: {
                                        userName: record.data.text
                                    },
                                    success: function (form, action) {
                                        Ext.MessageBox.alert(_('Notice'), _(action.result.msg), function () {
                                            window.close();
                                        });
                                    },
                                    failure: function (response, opts) {
                                        Ext.MessageBox.alert(_('Notice'), _(action.result.msg));
                                    }
                                });
                            }
                        }
                    ]
                }]
            }]
        });
        win.show();
    }
});