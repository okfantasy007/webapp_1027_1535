Ext.define('Admin.view.security.controller.securityPolicy.securityPolicy', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.securityPolicy',

    onSave: function () {
        var me = this;
        var meView = this.getView();
        var form = meView.down('form').getForm();
        if (form.isDirty()) {
            form.submit({
                url: '/security/security_strategy/update',
                success: function (self, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg));
                    if (action.result.msg) {
                        me.beforeRender();
                    }
                },
                failure: function (self, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg));
                }
            });
        } else {
            Ext.Msg.alert(_('Notice'), _('Please make changes to the data'));
        }
    },

    onRefresh: function () {
        this.beforeRender();
    },

    beforeRender: function () {
        var meView = this.getView();
        var form = meView.down('form').getForm();
        form.load({
            url: '/security/security_strategy/load',
            method: 'GET',
            failure: function (self, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg));
            }
        });
    },

    onPwdReset: function () {
        var meView = this.getView();
        meView.down('#pwdForm').getForm().reset();
    },

    onAccReset: function () {
        var meView = this.getView();
        meView.down('#accForm').getForm().reset();
    },

    maxNamePwdSameNum: function () {
        var meView = this.getView();
        var comboValue = meView.down('#max_name_pwd_same_num').getValue();
        var numberfield = meView.down('#no_name_char_num');
        numberfield.setVisible(comboValue == 2).setDisabled(!(comboValue == 2));
    },

    foreverLock: function () {
        var meView = this.getView();
        var checkfieldValue = meView.down('#forever_lock').getValue();
        var numberfield = meView.down('#auto_unlock_time');
        numberfield.setVisible(!checkfieldValue).setDisabled(checkfieldValue);
    }
});