Ext.define('Admin.view.performance.historyTask.viewModel.templateViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.templateViewModel',
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