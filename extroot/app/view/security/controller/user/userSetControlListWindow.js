Ext.define('Admin.view.security.controller.user.userSetControlListWindow', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userSetControlListWindow',

    onClose: function () {
        var meView = this.getView();
        meView.close();
    }
});
