Ext.define('Admin.view.security.view.operationSet.operationSetTab', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Admin.view.security.view.operationSet.operationSetGeneric',
        'Admin.view.security.controller.operationSet.operationSetTab',
        'Admin.view.security.view.operationSet.operationSetMember'
    ],
    xtype: 'operationSetTab',
    controller: 'operationSetTab',
    itemId: 'security_operset_form_table',
    border: false,
    deferredRender: false,//很重要的属性死也要记住,
    name: "",
    tabBar: {
        //plain: true,
        layout: {
            pack: 'left'
        }
    },
    items: [{
        xtype: 'operationSetGeneric',
        // iconCls: 'x-fa fa-gears'
    }, {
        xtype: 'operationSetMember',
        // iconCls: 'x-fa fa-user'
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'operationSetTabToolbar',
        defaults: {
            minWidth: 80,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Cancel'), iconCls: 'x-fa fa-close', handler: 'onCancel' },
            { xtype: 'button', text: _('Save'), iconCls: 'x-fa fa-save', handler: 'onOk' }
        ]
    }]
});