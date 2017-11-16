Ext.define('Admin.view.security.viewModel.onlineUser.onlineUserGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.onlineUserGrid',
    stores: {
        onlineUserStore: {
            model: 'Admin.view.security.model.onlineUser.onlineUserGrid',
            autoLoad: true
        }
    }
});