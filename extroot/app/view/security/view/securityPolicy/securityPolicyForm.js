Ext.define('Admin.view.security.view.securityPolicy.securityPolicyForm', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.security.view.securityPolicy.securityPolicy',
        'Admin.view.security.model.securityPolicy.securityPolicy',
        'Admin.view.security.controller.securityPolicy.securityPolicy'
    ],
    controller: 'securityPolicy',
    xtype: 'securityPolicyForm',
    layout: 'fit',
    cls: "shadow",
    items: [{
        xtype: 'form',
        trackResetOnLoad: true,
        // title: _('设置安全策略'),
        // iconCls: 'x-fa fa-legal',
        layout: "fit",
        reader: {
            type: 'json',
            model: 'Admin.view.security.model.securityPolicy.securityPolicy',
            rootProperty: 'data',
            successProperty: 'success'
        },
        items: [
            { xtype: 'securityPolicy' }
        ]
    }]
});