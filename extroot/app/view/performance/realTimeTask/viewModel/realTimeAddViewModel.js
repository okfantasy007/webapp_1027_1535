Ext.define('Admin.view.performance.realTimeTask.viewModel.realTimeAddViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.realTimeAddViewModel',
    stores: {
        collectStore: {
            model: 'Admin.view.performance.realTimeTask.model.collectStoreModel',
            autoLoad: true,
        },
        protocolStore: {
            model: 'Admin.view.performance.realTimeTask.model.protocolTypeModel',
            autoLoad: true,
        },
    }
});