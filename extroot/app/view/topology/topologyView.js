Ext.define('Admin.view.topology.topologyView', {
    extend: 'Admin.view.main.MainContainerWrap',
    // extend: 'Ext.container.Container',

    xtype: 'topologyView',

    requires: [
        'Admin.view.topology.main.nodeTypeTreeView',
        'Admin.view.base.TopoPanel',

        // demo
        'Admin.view.topology.map.baiduMapView',

        'Admin.view.topology.main.mainModel',
        'Admin.view.topology.main.mainView',
        'Admin.view.topology.main.mainController',

        'Admin.view.topology.main.topoSubnetGridView',
        'Admin.view.topology.main.topoNodeGridView',
        'Admin.view.topology.main.topoLinkGridView',

        'Admin.view.topology.main.deviceMainView',
        'Admin.view.topology.main.subnetTreeView',
        'Admin.view.topology.main.deviceGridView',
        'Admin.view.topology.main.topoMapView',

        'Admin.view.topology.bandTopo.bandTopoView',
        'Admin.view.topology.bandTopo.bandTopoModel',
        'Admin.view.topology.bandTopo.bandTopoController',
    ],

    controller: 'topologyView',
    viewModel: 'topologyView',    

    layout: 'border',
    items: [
    {
        region: 'west',
        xtype: 'leftMenutree',
        menuUrl: '/menu/topology',
    },

    {
        region: 'center',
        xtype: 'rightContainerBorder'
    }]
});

