
Ext.define('Admin.view.dashboard.dashboardView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'dashboardView',

    requires: [
        // 'Admin.view.pages.dashboardMainView'
    ],

    controller: 'dashboardView',
    viewModel: 'dashboardView',    

    items: [
    {
        xtype: 'leftMenutree',
        store: 'dashboardLeftMenu'
    },
    {
        // margin: 0,
        xtype: 'rightContainerTitled'
    }]
});
