Ext.define('Admin.view.performance.historyTask.viewModel.mainViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.mainViewModel',
    //xtype:'mainViewModel',
    stores: {
        performanceStore: {
            model: 'Admin.view.performance.historyTask.model.performanceStoreModel',
            autoLoad: true,
            pageSize: 15
        },

    }
});