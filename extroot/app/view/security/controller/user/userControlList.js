Ext.define('Admin.view.security.controller.user.userControlList', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userControlList',

    onRadioChangeL: function (self, nv, ov) {//左侧选项
        var meView = this.getView();
        if (nv) {
            meView.getColumns()[1].setDisabled(true);
            meView.getStore().each(function (r) {
                r.set('checked', true)
            })
        }
    },

    onRadioChangeR: function (self, nv, ov) {//右侧选项
        var meView = this.getView();
        if (nv) {
            meView.getColumns()[1].setDisabled(false);
            if (meView.aclModel == 1) {
                meView.getStore().each(function (r) {
                    r.set("checked", false);
                })
            }
            else {
                meView.getStore().reload();
            }
        }
    },

    onSetControlList: function () {//用户设置控制列表
        var meView = this.getView();
        var window = new Admin.view.security.view.user.userSetControlListWindow();
        window.down('controlListGrid').setConfig("header", false);//隐藏title
        window.setTitle(_('Access control list'));
        window.setIconCls('x-fa fa-filter');
        window.show();
        meView.up("secUserLeftTree").add(window);
    },

    onControlListRefresh: function () {
        var meView = this.getView();
        var radiogroup = meView.down('radiogroup');
        var value = meView.aclModel;
        var userId = meView.userId;
        this.moveRadiogroup(value, radiogroup, userId);
    },

    onApply: function () {
        var meView = this.getView();
        var userId = meView.userId;
        var selectControlListId = [];
        var name = meView.up('userTab').name;
        var tree = meView.up('secUserLeftTree');
        var radioGroup = meView.down('radiogroup').getValue();
        if (radioGroup.use_all_acl == 2) {
            var records = meView.getStore().getData();
            for (var i in records.items) {
                if (records.items[i].get('checked')) {
                    selectControlListId.push(records.items[i].get('id'))
                }
            }
        };
        Ext.create('Ext.form.Panel').getForm().submit({
            url: '/security/user_acl_modify',
            params: {
                name: name,
                sec_user_id: userId,
                use_all_acl: radioGroup.use_all_acl,
                selectControlListId: selectControlListId.join(',')
            },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg),
                    function () {
                        meView.aclModel = radioGroup.use_all_acl;
                        tree.down('userGrid').lookupController().onRefresh();
                        tree.lookupController().onRefresh();
                    });
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg));
            }
        });
    },

    loadPages: function (rec) {
        var meView = this.getView();
        var radiogroup = meView.down('radiogroup');
        var userId = rec.get('sec_user_id');
        var userControlListToolbar = meView.down("#userControlListToolbar");
        userControlListToolbar.setDisabled(userId == 1);
        meView.userId = userId;
        var value = rec.get('ip_limit_mode');
        this.moveRadiogroup(value, radiogroup, userId);
    },

    moveRadiogroup: function (value, radiogroup, userId) {
        var meView = this.getView();
        if (value == 1) {
            radiogroup.items.items[0].setValue(true);
            meView.getStore().proxy.extraParams = {
                'use_all_acl': value,
                'sec_user_id': userId
            };
            meView.getStore().reload();
        }
        else if (value == 2) {
            radiogroup.items.items[1].setValue(true);
            meView.getStore().proxy.extraParams = {
                'use_all_acl': value,
                'sec_user_id': userId
            };
            meView.getStore().reload();
        }
    }

});