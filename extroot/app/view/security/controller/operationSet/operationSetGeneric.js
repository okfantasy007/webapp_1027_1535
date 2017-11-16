Ext.define('Admin.view.security.controller.operationSet.operationSetGeneric', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.operationSetGeneric',

    onApply: function () {//操作集修改应用功能
        var meView = this.getView();
        var tree = meView.up('secUserLeftTree');
        if (meView.isValid()) {
            meView.getForm().submit({
                url: '/security/security_operset/update_basic',
                success: function (form, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg),
                        function () {
                            tree.down('#security_operset_view').lookupController().onRefresh();
                            tree.lookupController().onRefresh();
                        });
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg));
                }
            });
        } else {
            Ext.Msg.alert(_('Incorrect input parameter'))
        }
    },

    onChange: function (self, newValue, oldValue, eOpts) {//
        var meView = this.getView();
        var form = meView.up('tabpanel').down("#operset_select_funcs");
        var sec_operator_set_id = meView.down("#sec_operator_set_id").getValue();
        form.lookupController().load_form({
            sec_operator_set_id: sec_operator_set_id,
            sec_operator_set_type: newValue
        });
    }
});