Ext.define('Admin.view.security.view.user.userOfGroup', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Admin.view.security.view.user.userOfGroupGrid',
        'Admin.view.security.controller.user.userOfGroup'
    ],
    controller: 'userOfGroup',
    itemId: 'user_form_belongto_usergroup',
    xtype: 'userOfGroup',
    layout: 'border',
    title: _('belong user group'),
    border: false,
    selectedId: [],
    userId: '',
    listeners: {
        activate: 'onActivate'
    },
    items: [{
        xtype: 'userOfGroupGrid',
        itemId: 'centerGrid',
        reference: 'centerGrid',
        region: 'center',
        layout: 'fit',
        border: false,
        flex: 1,
        margin: '-1 -1 0 -1',
        listeners: {
            selectionchange: 'centerChange'
        },
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                xtype: 'label',
                text: _('Selected userGroups'),
                margin: '0 15 0 5'
            }, '-', {
                itemId: 'remove',
                text: _('Removed'),
                tooltip: _('Removed'),
                iconCls: 'x-fa fa-minus',
                disabled: true,
                handler: 'onRemove',
            }, '->', {
                text: _('Refresh'),
                tooltip: _('Refresh'),
                iconCls: 'x-fa fa-refresh',
                handler: 'centerGridRefresh'
            }]
        }]
    }, {
        xtype: 'userOfGroupGrid',
        itemId: 'southGrid',
        reference: 'southGrid',
        region: 'south',
        layout: 'fit',
        border: false,
        flex: 1,
        split: true,
        margin: '0 -1 -1 -1',
        listeners: {
            selectionchange: 'southChange'
        },
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                xtype: 'label',
                text: _('Selectable userGroups'),
                margin: '0 15 0 5'
            }, '-', {
                itemId: 'select',
                text: _('select'),
                tooltip: _('select'),
                iconCls: 'x-fa fa-plus',
                disabled: true,
                handler: 'onSelect',
            }, '->', {
                text: _('Refresh'),
                tooltip: _('Refresh'),
                iconCls: 'x-fa fa-refresh',
                handler: 'southGridRefresh'
            }]
        }]
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userOfGroupToolbar',
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