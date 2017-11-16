Ext.define('Admin.view.system.systemManage.viewModel.server.monitorTaskListGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.monitorTaskListGrid',
    stores: {
    	monitorTaskListtStore: {
            model: 'Admin.view.system.systemManage.model.server.monitorTaskListGrid',
            autoLoad: true,
            pageSize: 10,
        }
    }
});