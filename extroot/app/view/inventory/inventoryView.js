
Ext.define('Admin.view.inventory.inventoryView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'inventoryView',

    requires: [
        'Admin.view.inventory.inventoryNeView',
        'Admin.view.inventory.inventoryRackView',
        'Admin.view.inventory.inventoryChassisView',
        'Admin.view.inventory.inventorySlotView',
        'Admin.view.inventory.inventoryCardView',
        'Admin.view.inventory.inventoryRemoteDevView',
        'Admin.view.inventory.inventoryPortView',

        'Admin.view.inventory.inventoryNeTypeView',
        'Admin.view.inventory.inventoryChassisTypeView',
        'Admin.view.inventory.inventoryCardTypeView',
        'Admin.view.inventory.inventoryPortTypeView',

        'Admin.view.inventory.devicePanel',

        'Admin.view.resource.discovery.template.discoveryTemplateView',
        'Admin.view.resource.discovery.task.discoveryTaskView',
        'Admin.view.resource.discovery.filter.filterConditionView',
        'Admin.view.resource.polling.pollingGrid',
        'Admin.view.resource.syncmanage.syncTask.syncTaskMainView',
        'Admin.view.resource.syncmanage.stateMonitorView'
    ],

    controller: 'inventoryView',
    viewModel: 'inventoryView',    

    items: [{
        xtype:   'leftMenutree',
        menuUrl: '/menu/inventory',
    },
    {
        xtype: 'rightContainer'
    }]
});
