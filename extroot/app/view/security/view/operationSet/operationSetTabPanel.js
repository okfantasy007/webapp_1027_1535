Ext.define('Admin.view.security.view.operationSet.operationSetTabPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Admin.view.security.view.operationSet.operationSetTab',
        'Admin.view.security.controller.operationSet.operationSetTabPanel'
    ],
    controller: 'operationSetTabPanel',
    xtype: 'operationSetTabPanel',
    itemId: 'security_operset_form',
    layout: 'fit',
    header: {
        border: false
    },
    items: [
        { xtype: 'operationSetTab' }
    ]
});