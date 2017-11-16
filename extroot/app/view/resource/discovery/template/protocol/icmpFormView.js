Ext.define('Admin.view.resource.discovery.template.protocol.icmpFormView', {
    extend: 'Admin.view.resource.discovery.template.protocol.baseForm',
    xtype: 'icmpFormView',

    items: [
    {
        xtype: 'fieldset',

        margin: 10,
        defaultType: 'textfield',
        defaults: {
            anchor: '100%'
        },

        items: [
        {
            xtype: 'hidden',
            name: 'id'
        },
        {
            xtype: 'hidden',
            name: 'type',
            value: 'ICMP'
        },
        {
            fieldLabel: _('Name'),
            emptyText: _('Name'),
            allowBlank: false,
            vtype: 'NameCn',
            maxLength: 64,
            name: 'name'
        }, 
        {
            xtype: 'numberfield',
            fieldLabel: _('Timeout'),
            value: 5,
            minValue: 1,
            maxValue: 3600,                
            allowBlank: false,
            name: 'timeout',
        },
        {
            xtype: 'numberfield',
            fieldLabel: _('Retries'),
            value: 1,
            minValue: 1,
            maxValue: 1000,                
            allowBlank: false,
            name: 'retries',
        },
        
        ]
    }]

});
