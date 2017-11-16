Ext.define('Admin.view.performance.performanceView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'performanceView',
    requires: [
        'Admin.view.performance.historyTask.view.performanceMainView',
        'Admin.view.performance.templateMangement.PTMMainView',
        'Admin.view.performance.thresholdTemplateMangement.TTMMainView',
        'Admin.view.performance.historyTaskDisplay.view.historyDisplayView',
        'Admin.view.performance.realTimeTask.view.realTimeMainView',
        'Admin.view.performance.estimate.view.estimateMainView',
        'Admin.view.performance.estimate.view.basicInfo',
        'Admin.view.performance.reportExport.view.reportMainView',
    ],
    controller: 'performanceView',
    viewModel: 'performanceView',

    items: [{
        xtype: 'leftMenutree',
        menuUrl: '/menu/performance',
    }, {
        xtype: 'rightContainer'
    }]
});