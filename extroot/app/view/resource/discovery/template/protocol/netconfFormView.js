Ext.define('Admin.view.resource.discovery.template.protocol.netconfFormView', {
    extend: 'Admin.view.resource.discovery.template.protocol.baseForm',
    xtype: 'netconfFormView',

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
            value: 'NETCONF'
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
            fieldLabel: _('Port'),
            value: 83,
            minValue: 1,
            maxValue: 65535,                
            allowBlank: false,
            name: 'port',
        },
        {
            xtype: 'numberfield',
            fieldLabel: _('Timeout'),
            value: 3,
            minValue: 1,
            maxValue: 60,                
            allowBlank: false,
            name: 'timeout',
        },
        {
            xtype: 'numberfield',
            fieldLabel: _('Retries'),
            value: 3,
            minValue: 1,
            maxValue: 10,                
            allowBlank: false,
            name: 'retries',
        },

        {
            xtype: 'textfield',
            fieldLabel: _('User Name'),
            emptyText: _('User Name'),
            value: 'admin',
            maxLength: 64,
            allowBlank: false,
            name: 'user'
        }, 
        {
            xtype: 'textfield',
            fieldLabel: _('Password'),
            emptyText: _('Password'),
            value: 'admin',
            maxLength: 64,
            allowBlank: false,
            name: 'password'
        },

        ]
    }]

});
