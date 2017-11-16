Ext.define('Admin.view.security.controller.userGroup.userGroupGeneric', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userGroupGeneric',
    onApply: function () {
        var meView = this.getView();
        var tree = meView.up('secUserLeftTree');
        var userGroupGeneric = meView.getForm();
        if (userGroupGeneric.isValid()) {
            userGroupGeneric.submit({
                url: '/security/security_group/update_basic',
                success: function (form, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg),
                        function () {
                            tree.down('#security_group_view').lookupController().onRefresh();
                            tree.lookupController().onRefresh();
                        });
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg));
                }
            });
        } else {
            Ext.Msg.alert(_('Notice'), _('The input parameter is not formatted correctly'));
        }
    },
    onChange: function (self, nv, ov, eOpts) {
        var meView = this.getView();
        meView.down('#sec_usergroup_name').setDisabled(nv == 1);
        meView.down('#sec_usergroup_fullname').setDisabled(nv == 1);
        meView.down('#sec_usergroup_type').setDisabled(true);
        if (nv == 1) {
            var store = meView.down('#sec_usergroup_type').getStore();
            store.add({ type: _('Superuser group'), id: 0 })
        }
    }
});