Ext.define('Admin.view.security.viewModel.user.managementDomain', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.managementDomain',
    stores: {
        userControlListStore: {
            model: 'Admin.view.security.model.user.managementDomain',
            autoLoad: true
        }
    }
});