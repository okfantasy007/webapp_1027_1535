Ext.define('Admin.view.performance.historyTask.viewModel.updTemplateViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.updTemplateViewModel',
    stores: {
        quotaTemplateStore: {
            model: 'Admin.view.performance.historyTask.model.quotaTemplateModel',
            autoLoad: true,
            pageSize: 15
        },
        thresholdTemplateStore: {
            model: 'Admin.view.performance.historyTask.model.thresholdTemplateModel',
            autoLoad: true,
            pageSize: 15
        },

    }
});