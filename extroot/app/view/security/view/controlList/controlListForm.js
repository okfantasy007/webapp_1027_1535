Ext.define('Admin.view.security.view.controlList.controlListForm', {
    extend: 'Ext.form.Panel',
    requires: 'Admin.view.security.controller.controlList.controlListForm',
    scrollable: "y",
    fieldDefaults: {
        labelAlign: 'left',
        labelWidth: 100,
        msgTarget: 'side'
    },
    layout: 'anchor',
    xtype: 'controlListForm',
    defaults: {
        anchor: '100%',
        margin: 10
    },
    controller: 'controlListForm',
    items: [{
        xtype: 'hidden',
        name: 'id'
    }, {
        xtype: 'fieldset',
        title: _('Select the IP address representation'),
        items: [{
            xtype: 'radiogroup',
            margin: 5,
            columns: 0,
            items: [{
                boxLabel: _('IP address or network segment'),
                name: 'ip_limit_type',
                itemId: 'ipSubnet',
                checked: true,
                listeners: {
                    change: 'onChange'
                },
                inputValue: 1
            }, {
                boxLabel: _('Start IP address ~ End IP address'),
                name: 'ip_limit_type',
                itemId: 'ipRange',
                inputValue: 0
            }]
        }]
    }, {
        xtype: 'textfield',
        vtype: 'ipSubnet',
        vtypeText: _("Invalid input parameter"),
        name: 'ip_range',
        itemId: 'ip_range',
        fieldLabel: _('IP address or network segment'),
        allowBlank: false
    }, {
        xtype: 'textfield',
        vtype: 'IPAddress',
        vtypeText: _("Invalid input parameter"),
        name: 'ip_range_from',
        itemId: 'ip_range_from',
        fieldLabel: _('Start IP address'),
        disabled: true,
        allowBlank: false,
        hidden: true
    }, {
        xtype: 'textfield',
        vtype: 'IPAddress',
        vtypeText: _("Invalid input parameter"),
        name: 'ip_range_to',
        itemId: 'ip_range_to',
        fieldLabel: _('End IP address'),
        disabled: true,
        allowBlank: false,
        hidden: true
    }, {
        xtype: 'textfield',
        name: 'limit_desc',
        itemId: 'limit_desc',
        fieldLabel: _('Description'),
        allowBlank: true
    }, {
        xtype: 'displayfield',
        itemId: 'ip_subnet_tips',
        fieldLabel: _('Example'),
        value: _('10.10.10.10 indicates a single IP address</br> 10.10.10.16/255.255.255.0 indicates network segment')
    }, {
        xtype: 'displayfield',
        itemId: 'ip_range_tips',
        fieldLabel: _('Example'),
        value: _('Start IP Address: 10.0.0.0</br> End IP Address: 10.255.255.255'),
        hidden: true
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        defaults: {
            minWidth: 60,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Cancel'), iconCls: 'x-fa fa-close', handler: 'onCancel' },
            { xtype: 'button', text: _('Save'), iconCls: 'x-fa fa-save', handler: 'onOk' }
        ]
    }]
});