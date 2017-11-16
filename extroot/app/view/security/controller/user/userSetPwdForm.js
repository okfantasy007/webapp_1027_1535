Ext.define('Admin.view.security.controller.user.userSetPwdForm', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userSetPwdForm',

    onCancel: function () {
        var meView = this.getView();
        meView.up().close();
    },

    onOk: function () {
        var me = this;
        var meView = me.getView();
        meView.getForm().submit({
            url: '/security/reset_pwd',
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (self, action) {
                Ext.Msg.alert(_('Notice'), _(action.result.msg),
                    function () {
                        meView.up('#security_user_view').lookupController().onRefresh();
                        meView.up('secUserLeftTree').lookupController().onRefresh();
                        meView.up().close();
                        // Ext.getCmp('userGridGlobal').lookupController().onRefresh();
                        // Ext.getCmp('secTreemenuGlobal').lookupController().onRefresh();
                    });
            },
            failure: function (slet, action) {
                var num = action.result.num;
                console.log(num);
                if (!num) {
                    num = "";
                }
                Ext.Msg.alert(_('Notice'), _(action.result.msg) + num);
            }
        });
    },
    onChangePwd: function () {
        var changPwd = this.getView().down('#changPwd');
        var changPwdCp = this.getView().down('#changPwdCopy');
        var value = changPwd.getValue();
        if (value) {
            changPwdCp.setDisabled(true);
        } else {
            changPwdCp.setDisabled(false);
        }
    }
});