Ext.define('Admin.view.security.controller.operationSet.operationSetTab', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.operationSetTab',

    onCancel: function () {
        var meView = this.getView();
        meView.up().close();
    },

    onOk: function () {
        var meView = this.getView();
        var form = meView.down('operationSetGeneric');
        var member = meView.down('operationSetMember');
        if (form.getForm().isValid()) {
            form.getForm().submit({
                url: '/security/security_operset/add',
                params: {
                    fun_ids: member.ids_selected.join(',')
                },
                success: function (self, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg),
                        function () {
                            meView.up('grid').lookupController().onRefresh();
                            meView.up('secUserLeftTree').lookupController().onRefresh();
                            meView.up().close();
                        });
                },
                failure: function (self, action) {
                    Ext.Msg.alert(_('Notice'), _(action.result.msg));
                }

            });
        } else {
            Ext.Msg.alert(_('Notice'), _('Incorrect input parameter'));
        }
    },
    loadPages: function (rec) {
        var meView = this.getView();
        meView.down('#operset_form_generic').getForm().loadRecord(rec);
        meView.down('#operset_select_funcs').lookupController().load_form({
            sec_operator_set_id: rec.get('sec_operator_set_id'),
            sec_operator_set_type: rec.get('sec_operator_set_type')
        });
        meView.name = rec.get('sec_operator_set_name');
    }
});