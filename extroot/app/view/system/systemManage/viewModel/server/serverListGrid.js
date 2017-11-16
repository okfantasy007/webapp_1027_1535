Ext.define('Admin.view.system.systemManage.viewModel.server.serverListGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.serverListGrid',
    stores: {
    	serverListStore: {
            model: 'Admin.view.system.systemManage.model.server.serverListGrid',
            autoLoad: true,
            pageSize: 10,
        }
    }
});