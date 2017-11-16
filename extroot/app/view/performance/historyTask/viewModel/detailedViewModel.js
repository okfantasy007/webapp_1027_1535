Ext.define('Admin.view.performance.historyTask.viewModel.detailedViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.detailedViewModel',
    stores: {
        resourceStore: {
            model: 'Admin.view.performance.historyTask.model.resourceStoreModel',
            autoLoad: true,
            pageSize: 15
        },

    }
});