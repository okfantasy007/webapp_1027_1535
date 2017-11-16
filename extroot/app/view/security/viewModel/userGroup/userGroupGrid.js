Ext.define('Admin.view.security.viewModel.userGroup.userGroupGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userGroupGrid',
    stores: {
        userGroupGridStore: {
            model: 'Admin.view.security.model.userGroup.userGroupGrid',
            autoLoad: true
        }
    }
});