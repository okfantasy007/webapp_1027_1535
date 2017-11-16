Ext.define('Admin.view.reports.reportsView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'reportsView',

    requires: [
        // 'Admin.view.base.clock.picker',
        // 'Admin.view.base.clock.clock',
        'Admin.view.reports.reportTemplateListView',
        'Admin.view.reports.reportTaskListView',
        'Admin.view.reports.reportResultListView'
    ],

    controller: 'reportsView',
    viewModel: 'reportsView',

    items: [{
        xtype: 'leftMenutree',
        menuUrl: '/menu/reports'
    }, {
        xtype: 'rightContainer'
    }]
});