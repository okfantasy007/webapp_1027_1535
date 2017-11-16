Ext.define('Admin.view.security.viewModel.user.userOfGroupGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userOfGroupGrid',
    stores: {
        userOfGroupGridStore: {
            model: 'Admin.view.security.model.user.userOfGroupGrid',
            autoLoad: true
        }
    }
});