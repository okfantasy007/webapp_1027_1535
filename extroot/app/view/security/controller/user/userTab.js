Ext.define('Admin.view.security.controller.user.userTab', {
    extend: 'Admin.view.security.secBaseController.genericController',
    alias: 'controller.userTab',
    onOk: function () {
        var me = this;
        me.onSubmit('userTab');
    },

    onCancel: function () {
        var meView = this.getView();
        meView.up().close();
    },

    loadPages: function (rec) {
        var meView = this.getView();
        meView.down('#user_form_generic').getForm().loadRecord(rec);
        meView.down('#user_form_detail').getForm().loadRecord(rec);
        meView.down('#user_form_belongto_usergroup').lookupController().loadPages(rec);
        meView.down('#user_form_resource').lookupController().loadPages(rec);
        meView.down('#user_form_operset').lookupController().loadPages(rec);
        meView.down('#user_form_acl').lookupController().loadPages(rec);
        meView.sec_user_id = rec.get('sec_user_id');
        meView.name = rec.get('user_name');
    }
});