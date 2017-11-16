Ext.define('Admin.view.security.view.operationSet.operationSetGeneric', {
    extend: 'Ext.form.Panel',
    requires: 'Admin.view.security.controller.operationSet.operationSetGeneric',
    controller: 'operationSetGeneric',
    xtype: 'operationSetGeneric',
    itemId: 'operset_form_generic',
    title: _('conventional'),
    frame: true,
    autoScroll: true,
    margin: -2,
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
        name: 'sec_operator_set_id',
        itemId: 'sec_operator_set_id',
        value: "-9999"

    }, {
        xtype: 'hidden',
        name: 'is_default',
        value: -1
    }, {
        xtype: 'combobox',
        name: 'sec_operator_set_type',
        itemId: 'sec_operator_set_type',
        fieldLabel: _('Types of'),
        margin: '20 12 0 12',
        multiSelect: false,
        editable: false,
        store: {
            fields: [
                { name: 'id', type: 'int' },
                { name: 'name', type: 'string' }
            ],
            // proxy: {
            //     type: 'ajax',
            //     url: '/security/test/type',
            //     reader: 'array'
            // },
            // autoLoad: true
            data: [
                { id: 1, name: _("Network management applications") },
                { id: 2, name: _("Network equipment") }
            ]
        },
        displayField: 'name',
        valueField: 'id',
        value: 1,
        // emptyText: 'Select the user level...'
        listeners: {
            change: 'onChange'
        }
    }, {
        xtype: 'textfield',
        name: 'sec_operator_set_name',
        itemId: 'sec_operator_set_name',
        fieldLabel: _('name'),
        // disabled: editmode,
        maxLength: 100,
        allowBlank: false
    }, {
        xtype: 'textarea',
        name: 'sec_operator_set_desc',
        itemId: 'sec_operator_set_desc',
        maxLength: 200,
        fieldLabel: _('Description')
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'operationSetGenericToolbar',
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