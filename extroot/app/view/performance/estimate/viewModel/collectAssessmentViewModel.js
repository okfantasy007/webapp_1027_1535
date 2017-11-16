Ext.define('Admin.view.performance.estimate.viewModel.collectAssessmentViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.collectAssessmentViewModel',

    stores: {
        processStore: {
            model: 'Admin.view.performance.estimate.model.processStoreModel',
            autoLoad: true,
        },

        basicStore: {
            model: 'Admin.view.performance.estimate.model.basicStoreModel',
            autoLoad: true,
            pageSize: 2,
        },
        loadChartStore: {
            model: 'Admin.view.performance.estimate.model.loadChartStoreModel',
            autoLoad: true,
        },
    }
});