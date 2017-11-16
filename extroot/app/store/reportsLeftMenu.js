Ext.define('Admin.store.reportsLeftMenu', {
    extend: 'Admin.store.baseMenuStoreN',
    storeId: 'reportsLeftMenu',

    root: {
        expanded: true,
        children: [
            {
                text: _('Template Management'),
                iconCls: 'icon-puzzle_miss',
                routeId: 'home', // routeId defaults to viewType
                viewType: 'reportTemplateListView',
                leaf: true
            },
            {
                text: _('Task Management'),
                iconCls: 'x-fa fa-tasks',
                routeId: 'report_task', // routeId defaults to viewType
                viewType: 'reportTaskListView',
                leaf: true
            },
            {
                text: _('Result Management'),
                iconCls: 'x-fa fa-line-chart',
                routeId: 'report_result', // routeId defaults to viewType
                viewType: 'reportResultListView',
                leaf: true
            }
        ]
    }

});
