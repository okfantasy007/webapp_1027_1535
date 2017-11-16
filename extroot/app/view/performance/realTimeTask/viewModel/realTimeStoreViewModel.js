Ext.define('Admin.view.performance.realTimeTask.viewModel.realTimeStoreViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.realTimeStoreViewModel',
    stores: {
        realTimeStore: {
            model: 'Admin.view.performance.realTimeTask.model.realTimeStoreModel',
            autoLoad: true,
            // pageSize: 15
        },

    }
});