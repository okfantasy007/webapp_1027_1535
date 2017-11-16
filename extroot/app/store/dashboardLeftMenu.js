Ext.define('Admin.store.dashboardLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'dashboardLeftMenu',

    root: {
        expanded: true,
        children: [
            {
                text: _('全局一览'),
                iconCls: 'x-fa fa-line-chart',
                // viewType: 'dashboardMainView',
                viewType: 'helloGrid6View',
                routeId: 'home', // routeId defaults to viewType
                leaf: true
            },
            {
                text: _('全局一览'),
                iconCls: 'x-fa fa-line-chart',
                viewType: 'PrototypeView',
                image: 'dashboard1.png',
                routeId: 'home2', // routeId defaults to viewType
                leaf: true
            },
            {
                text: _('配置选项'),
                iconCls: 'x-fa fa-gears',
                routeId: 'config', // routeId defaults to viewType
                viewType: 'PrototypeView',
                image: 'config1.png',
                leaf: true
            },
            {
                text: _('布局示范'),
                iconCls: 'x-fa fa-crosshairs',
                routeId: 'layoutdemo', 
                viewType: 'layoutdemoview',
                leaf: true
            },        
            {
                text: _('性能一览'),
                iconCls: 'x-fa fa-pie-chart',
                viewType: 'formview',
                routeId: 'performance', // routeId defaults to viewType
                leaf: true
            },
            {
                text: _('告警一览'),
                iconCls: 'x-fa fa-list-ol ',
                viewType: 'pageblank',
                routeId: 'alarms',
                leaf: true
            },
            {
                text: _('Top10'),
                iconCls: 'x-fa fa-bar-chart',
                viewType: 'page404',
                routeId: 'top10', // routeId defaults to viewType
                leaf: true
            },
        ]
    }

});
