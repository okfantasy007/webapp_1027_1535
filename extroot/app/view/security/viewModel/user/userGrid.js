Ext.define('Admin.view.security.viewModel.user.userGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userGrid',
    stores: {
        userGridStore: {
            model: 'Admin.view.security.model.user.userGrid',
            autoLoad: true
        }
    }
});