Ext.define('Admin.view.performance.estimate.viewModel.chatViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.chatViewModel',

    stores: {
        chartStore: {
            model: 'Admin.view.performance.estimate.model.basicStoreModel',
            autoLoad: true,
        },

    }
});