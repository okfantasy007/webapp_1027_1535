Ext.define('Admin.view.performance.historyTaskDisplay.viewModel.taskViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.taskViewModel',
    stores: {
        taskStore: {
            model: 'Admin.view.performance.historyTaskDisplay.model.taskStoreModel',
            autoLoad: true,
            pageSize: 15
        },

    }
});