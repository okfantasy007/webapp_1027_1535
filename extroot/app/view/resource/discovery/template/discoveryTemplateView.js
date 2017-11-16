Ext.define('Admin.view.resource.discovery.template.discoveryTemplateView', {
    extend: 'Ext.container.Container',
    xtype: 'discoveryTemplateView',

    requires: [
        'Admin.view.resource.discovery.template.discoveryTemplateGridView',
        'Admin.view.resource.discovery.template.protocol.snmpFormView',
        'Admin.view.resource.discovery.template.protocol.icmpFormView',
        'Admin.view.resource.discovery.template.protocol.netconfFormView'
    ],
    
    layout: 'card',
    cls: 'shadow',
    defaults: {
        xtype: 'container'
    },

    items: [
        {
            items: [
            {
                    xtype: 'discoveryTemplateGridView',
                    title: _('discovery templates'),
                    iconCls: 'x-fa fa-circle-o'
            }]
        },
        {
            items: [
            {
                xtype: 'snmpFormView',
                title: _('SNMP Template Settings'),
                iconCls: 'x-fa fa-circle-o' 
            }]
        },
        {
            items: [
            {
                xtype: 'icmpFormView',
                title: _('ICMP Template Settings'),
                iconCls: 'x-fa fa-circle-o' 
            }]
        },
        {
            items: [
            {
                xtype: 'netconfFormView',
                title: _('NETCONF Template Settings'),
                iconCls: 'x-fa fa-circle-o' 
            }]
        }
    ]
});
