Ext.define('Admin.view.security.view.userGroup.userGroupGeneric', {
    extend: 'Ext.form.Panel',
    requires: 'Admin.view.security.controller.userGroup.userGroupGeneric',
    controller: 'userGroupGeneric',
    xtype: 'userGroupGeneric',
    itemId: 'security_gorup_form_generic',
    title: _('conventional'),
    frame: true,
    margin: -2,
    autoScroll: true,
    defaultType: 'textfield',
    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 80,
        msgTarget: 'side'
    },
    layout: 'anchor',
    defaults: {
        anchor: '100%',
        margin: '6 12 0 12'
    },
    items: [{
        xtype: 'hidden',
        name: 'sec_usergroup_id',
        itemId: 'sec_usergroup_id',
        listeners: {
            change: 'onChange'
        }
    }, {
        xtype: 'textfield',
        name: 'sec_usergroup_name',
        itemId: 'sec_usergroup_name',
        fieldLabel: _('User group name'),
        margin: '20 12 0 12',
        maxLength: 100,
        allowBlank: false
    }, {
        xtype: 'textfield',
        name: 'sec_usergroup_fullname',
        itemId: 'sec_usergroup_fullname',
        fieldLabel: _('User group full name'),
        maxLength: 100
    }, {
        xtype: 'combo',
        name: 'sec_usergroup_type',
        itemId: 'sec_usergroup_type',
        fieldLabel: _('Types of'),
        editable: false,
        displayField: 'type',
        valueField: 'id',
        store: {
            fields: [
                { name: 'type', type: 'string' },
                { name: 'id', type: 'int' }
            ],
            proxy: {
                type: 'ajax',
                url: '/security/security_group/usergroup_type',
                reader: 'json'
            },
            autoLoad: true
        },
        allowBlank: false
    }, {
        xtype: 'textarea',
        name: 'sec_usergroup_desc',
        itemId: 'sec_usergroup_desc',
        fieldLabel: _('Description'),
        scrollable: true,
        maxLength: 300
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userGroupGenericToolbar',
        hidden: true,
        defaults: {
            minWidth: 60,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Apply'), iconCls: 'x-fa fa-save', handler: 'onApply' }
        ]
    }]
});