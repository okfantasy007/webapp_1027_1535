Ext.define('Admin.view.security.controller.user.userInfo', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userInfo',

    onApply: function () {
        var meView = this.getView();
        var name = meView.up('userTab').name;
        var tree = meView.up('secUserLeftTree');
        meView.getForm().submit({
            url: '/security/user_info_modify',
            params: { name: name },
            waitTitle: _('Please wait...'),
            waitMsg: _('Please wait...'),
            success: function (form, action) {
                Ext.MessageBox.alert(_('Notice'), _(action.result.msg), function () {
                    tree.down('#security_user_view').lookupController().onRefresh();
                    tree.lookupController().onRefresh();
                });
            },
            failure: function (form, action) {
                Ext.MessageBox.alert(_('Notice'), _(action.result.msg));
            }
        });
    }
});