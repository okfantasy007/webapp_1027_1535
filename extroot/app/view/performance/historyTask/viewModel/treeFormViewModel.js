Ext.define('Admin.view.performance.historyTask.viewModel.treeFormViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.treeFormViewModel',
    stores: {
        reStore: {
            model: 'Admin.view.performance.historyTask.model.reStoreModel',
            autoLoad: true,
            pageSize: 15
        },
    }
});