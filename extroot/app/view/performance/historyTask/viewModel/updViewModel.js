Ext.define('Admin.view.performance.historyTask.viewModel.updViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.updViewModel',
    stores: {
        collectPeriodStore: {
            model: 'Admin.view.performance.historyTask.model.collectPeriodStoreModel',
            autoLoad: true,
        },

        interactPeriodStore: {
            model: 'Admin.view.performance.historyTask.model.interactPeriodStoreModel',
            autoLoad: true,
        },
        resourceStore: {
            model: 'Admin.view.performance.historyTask.model.resourceStoreModel',
            autoLoad: true,
        },
        protocolTypeStore: {
            model: 'Admin.view.performance.historyTask.model.protocolTypeStoreModel',
            autoLoad: true,
        },

    }
});