Ext.define('Admin.view.security.viewModel.user.userControlList', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userControlList',
    stores: {
        userControlListStore: {
            model: 'Admin.view.security.model.user.userControlList',
            autoLoad: true
        }
    }
});