Ext.define('Admin.store.topologyLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'topologyLeftMenu',

    root: {
        expanded: true,
        children: [
            {
                text: _('Topology View'),
                iconCls: 'icon-globe',
                routeId: 'home', 
                viewType: 'topoMainView',
                fun_id:'topoMainView',
                leaf: true
            },

            {
                text: _('Subnet List'),
                iconCls: 'icon-subnet',
                routeId: 'subnet', 
                viewType: 'topoSubnetGridView',
                fun_id:'topoSubnetGridView',
                // image: 'subnet.png',
                leaf: true
            },
            {
                text: _('Node List'),
                iconCls: 'icon-line-segment',
                routeId: 'node', 
                viewType: 'topoNodeGridView',
                fun_id:'topoNodeGridView',
                // image: 'nodes.png',
                leaf: true
            },
            {
                text: _('Link List'),
                iconCls: 'x-fa fa-link',
                routeId: 'link', 
                viewType: 'topoLinkGridView',
                fun_id:'topoLinkGridView',
                // image: 'links.png',
                leaf: true
            },
            // {
            //     text: _('地理视图'),
            //     iconCls: 'x-fa fa-globe',
            //     routeId: 'home222', 
            //     viewType: 'topoMapView',
            //     image: 'topo2.png',
            //     leaf: true
            // },
            // {
            //     text: _('地理视图(demo)'),
            //     iconCls: 'x-fa fa-globe',
            //     routeId: 'baiduMapView', 
            //     viewType: 'baiduMapView',
            //     leaf: true
            // },
            {
                text: _('Device View'),// Device Views
                iconCls: 'x-fa fa-server',
                viewType: 'deviceMainView',
                fun_id:'deviceMainView',
                // image: 'topo3.png',
                routeId: 'device', // routeId defaults to viewType
                leaf: true
            },
            {
                text: _('ManagerTopo'),
                iconCls: 'icon-globe',
                viewType: 'bandTopoView',
                fun_id:'bandTopoView',
                // image: 'topo3.png',
                routeId: 'bandTopo', // routeId defaults to viewType
                leaf: true
            }
        ]
    }

});
