Ext.define('Admin.view.performance.historyTask.viewModel.updTreeFormViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.updTreeFormViewModel',
    stores: {
        reStore: {
            model: 'Admin.view.performance.historyTask.model.reStoreModel',
            autoLoad: true,
            pageSize: 15
        },
    }
});