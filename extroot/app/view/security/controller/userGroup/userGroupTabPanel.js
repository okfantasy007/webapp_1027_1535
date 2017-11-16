Ext.define('Admin.view.security.controller.userGroup.userGroupTabPanel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userGroupTabPanel',

    beforeRender: function () {
        var meView = this.getView();
        meView.down('#userGroupTabToolbar').setHidden(true);
        meView.down('#userGroupGenericToolbar').setHidden(false);
        meView.down('#userGroupMemberToolbar').setHidden(false);
        meView.down('#userGroupOpAuthorityToolBar').setHidden(false);
        meView.down('userGroupMgDomain').edit = true;
    }
});