Ext.define('Admin.view.performance.historyTask.viewModel.addViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.addViewModel',
    stores: {
        collectPeriodStore: {
            model: 'Admin.view.performance.historyTask.model.collectPeriodStoreModel',
            autoLoad: true,
        },

        interactPeriodStore: {
            model: 'Admin.view.performance.historyTask.model.interactPeriodStoreModel',
            autoLoad: true,
        },
        protocolTypeStore: {
            model: 'Admin.view.performance.historyTask.model.protocolTypeStoreModel',
            autoLoad: true,
        },
        resourceStore: {
            model: 'Admin.view.performance.historyTask.model.resourceStoreModel',
            autoLoad: true,
        },

    }
});