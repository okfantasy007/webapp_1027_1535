Ext.define('Admin.store.inventoryLeftMenu', {
    // extend: 'Admin.store.baseMenuStore',
    extend: 'Ext.data.TreeStore',
    storeId: 'inventoryLeftMenu',

    autoLoad: false,
    // asynchronousLoad : false, 
    proxy: {
        type: 'ajax',
        url: '/menu/inventoryLeftMenu',
        reader: {
            type: 'json'
        }
    },

    // root: {
    //     expanded: true,
    //     children: [
    //         {
    //             text: _('Equipment list'),
    //             iconCls: 'icon-clipboard4',
    //             expanded: true,
    //             fun_id:'0101',
    //             selectable: false,
    //             children: [
    //             {
    //                 text: _('Ne'),
    //                 iconCls: 'icon-router',
    //                 routeId: 'ne', 
    //                 viewType: 'inventoryNeView',
    //                 fun_id:'inventoryNeView',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('Rack'),
    //                 iconCls: 'icon-shelves_slot',
    //                 // iconCls : 'property_resource_chassis_menu',
    //                 routeId: 'rack', 
    //                 viewType: 'inventoryRackView',
    //                 fun_id:'inventoryRackView',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('Chassis'),
    //                 iconCls: 'icon-shelves_box',
    //                 routeId: 'chassis', 
    //                 viewType: 'inventoryChassisView',
    //                 fun_id:'inventoryChassisView',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('Slot'),
    //                 iconCls: 'icon-server_stack',
    //                 routeId: 'slot', 
    //                 viewType: 'inventorySlotView',
    //                 fun_id:'inventorySlotView',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('Local Card'),
    //                 iconCls: 'icon-pci-card-network',
    //                 routeId: 'card', 
    //                 viewType: 'inventoryCardView',
    //                 fun_id:'inventoryCardView',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('Remote Device'),
    //                 iconCls: 'icon-linked-documents',
    //                 routeId: 'remote_dev', 
    //                 viewType: 'inventoryRemoteDevView',
    //                 fun_id:'inventoryRemoteDevView',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('Port'),
    //                 iconCls: 'icon-port_eth',
    //                 expanded: false,
    //                 fun_id:'010107',
    //                 selectable: false, 
    //                 children: [
    //                     {
    //                         text: _('All Port'),
    //                         iconCls: 'icon-port_eth',
    //                         routeId: 'port', 
    //                         viewType: 'inventoryPortView',
    //                         fun_id:'inventoryPortView',
    //                         leaf: true
    //                     }
    //                 ]
    //             }
    //             ]
    //         },

    //         {
    //             text: _('Inventory Type'),
    //             iconCls: 'x-fa fa-th-list',
    //             expanded: false,
    //             fun_id:'0102',
    //             selectable: false, 
    //             children: [
    //                 {
    //                     text: _('Ne Type'),
    //                     iconCls: 'icon-router',
    //                     routeId: 'ne_type', 
    //                     viewType: 'inventoryNeTypeView',
    //                     fun_id:'inventoryNeTypeView',
    //                     leaf: true
    //                 },
    //                 {
    //                     text: _('Chassis Type'),
    //                     iconCls: 'icon-shelves_box',
    //                     routeId: 'chassis_type', 
    //                     viewType: 'inventoryChassisTypeView',
    //                     fun_id:'inventoryChassisTypeView',
    //                     leaf: true
    //                 },
    //                 {
    //                     text: _('Card Type'),
    //                     iconCls: 'icon-pci-card-network',
    //                     routeId: 'card_type', 
    //                     viewType: 'inventoryCardTypeView',
    //                     fun_id:'inventoryCardTypeView',
    //                     leaf: true
    //                 },
    //                 {
    //                     text: _('Port Type'),
    //                     iconCls: 'icon-port_eth',
    //                     routeId: 'port_type', 
    //                     viewType: 'inventoryPortTypeView',
    //                     fun_id:'inventoryPortTypeView',
    //                     leaf: true
    //                 }
    //             ]
    //         },

    //         {
    //             text: _('discovery and poll'),
    //             iconCls: 'x-fa fa-exchange',
    //             expanded: true,
    //             fun_id:'0103',
    //             hidden: SEC.hidden('0103'),
    //             selectable: false,
    //             children: [
    //             {
    //                 text: _('discovery task'),
    //                 // iconCls: 'icon-militar-radar',
    //                 // iconCls:'x-fa fa-spinner fa-spin',
    //                 iconCls: 'icon-radar-line fa-spin',
    //                 routeId: 'discovery_task', 
    //                 viewType: 'discoveryTaskView',
    //                 fun_id:'discoveryTaskView',
    //                 hidden: SEC.hidden('discoveryTaskView'),
    //                 leaf: true
    //             },
    //             {
    //                 text: _('discovery templates'),
    //                 iconCls: 'icon-puzzle_miss',
    //                 routeId: 'discovery_temp', 
    //                 viewType: 'discoveryTemplateView',
    //                 fun_id:'discoveryTemplateView',
    //                 hidden: SEC.hidden('discoveryTemplateView'),
    //                 // image: 'discovery_temp.png',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('discovery filter'),
    //                 iconCls: 'x-fa fa-filter',
    //                 routeId: 'discovery_filter', 
    //                 viewType: 'filterConditionView',
    //                 fun_id:'filterConditionView',
    //                 hidden: SEC.hidden('filterConditionView'),
    //                 //image: 'discovery_filter.png',
    //                 leaf: true
    //             },
    //             {
    //                 text: _('device polling'),
    //                 iconCls: 'x-fa fa-clock-o',
    //                 routeId: 'polling',  
    //                 viewType: 'pollingGrid',
    //                 fun_id:'pollingGrid',
    //                 hidden: SEC.hidden('pollingGrid'),
    //                 leaf: true
    //             }
    //             ]
    //         },
            
    //         {
    //             text: _('Synchronization Task Manage'),
    //             iconCls: 'x-fa fa-refresh',
    //             expanded: true,
    //             fun_id:'0104',
    //             hidden: SEC.hidden('0104'),
    //             selectable: false,
    //             children: [
    //                 {
    //                     text: _('Synchronization Task'),
    //                     iconCls: 'x-fa fa-clock-o',
    //                     viewType:'syncTaskMainView',
    //                     fun_id:'syncTaskMainView',
    //                     hidden: SEC.hidden('syncTaskMainView'),
    //                     routeId: 'task',
    //                     leaf: true
    //                 },
    //                 {
    //                     text: _('Ne Synchro Status monitor'),
    //                     iconCls: 'x-fa fa-camera',
    //                     viewType: 'stateMonitorView',
    //                     fun_id:'stateMonitorView',
    //                     hidden: SEC.hidden('stateMonitorView'),
    //                     routeId: 'status',
    //                     leaf: true
    //                 },
                    
    //             ]
    //         }

    //     ]
    // }

});
