Ext.define('Admin.view.performance.historyTaskDisplay.viewModel.chartStoreViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.chartStoreViewModel',
    stores: {
        chartStore: {
            model: 'Admin.view.performance.historyTaskDisplay.model.chartStoreModel',
            autoLoad: true,
            //pageSize: 15
        },

    }
});

