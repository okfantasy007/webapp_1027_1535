Ext.define('Admin.view.system.systemManage.viewModel.process.processListGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.processListGrid',
    stores: {
    	processListStore: {
            model: 'Admin.view.system.systemManage.model.process.processListGrid',
            autoLoad: true,
            pageSize: 50,
        }
    }
});