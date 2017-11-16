Ext.define('Admin.view.security.controller.operationSet.operationSetTabPanel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.operationSetTabPanel',

    beforeRender: function () {
        var meView = this.getView();
        meView.down('#operationSetTabToolbar').setHidden(true);
        meView.down('#operationSetGenericToolbar').setHidden(false);
        meView.down('#operationSetMemberToolbar').setHidden(false);
        meView.down('#sec_operator_set_type').setDisabled(true);
    }
});