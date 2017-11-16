Ext.define('Admin.view.security.controller.user.userTabPanel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userTabPanel',
    onRender: function () {
        var meView = this.getView();
        meView.down('#userTabToolbar').setHidden(true);
        meView.down('#userGenericToolbar').setHidden(false);
        meView.down('#userInfoToolbar').setHidden(false);
        meView.down('#userOfGroupToolbar').setHidden(false);
        meView.down('#userControlListToolbar').setHidden(false);
        meView.down('#user_name').setReadOnly(true);
        meView.down('#user_name').addCls("x-item-disabled");
        meView.down('#user_password').setDisabled(true).setHidden(true);
        meView.down('#password_again').setDisabled(true).setHidden(true);
        meView.down('#userOpAuthorityToolBar').setHidden(false);
        meView.down('userMgDomain').edit = true;
    }
});