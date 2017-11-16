Ext.define('Admin.view.security.view.userGroup.userGroupMember', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Admin.view.security.view.userGroup.userGroupMemberGrid',
        'Admin.view.security.controller.userGroup.userGroupMember'
    ],
    controller: 'userGroupMember',
    xtype: 'userGroupMember',
    itemId: 'security_group_form_member',
    title: _('member'),
    border: false,
    layout: 'border',
    selectedId: [],
    groupId: '',
    listeners: {
        activate: 'onActivate'
    },
    items: [{
        xtype: 'userGroupMemberGrid',
        itemId: 'centerGrid',
        reference: 'centerGrid',
        region: 'center',
        layout: 'fit',
        border: false,
        flex: 1,
        margin: '-1 -1 0 -1',
        selModel: {
            selType: 'checkboxmodel'
        },
        listeners: {
            selectionchange: 'centerChange'
        },
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                xtype: 'label',
                text: _('Selected users'),
                margin: '0 15 0 5'
            }, '-', {
                itemId: 'remove',
                text: _('Removed'),
                tooltip: _('Removed'),
                iconCls: 'x-fa fa-minus',
                disabled: true,
                handler: 'onRemove'
            }, '->', {
                text: _('Refresh'),
                tooltip: _('Refresh'),
                iconCls: 'x-fa fa-refresh',
                handler: 'centerGridRefresh'
            }]
        }]
    }, {
        xtype: 'userGroupMemberGrid',
        itemId: 'southGrid',
        reference: 'southGrid',
        region: 'south',
        layout: 'fit',
        border: false,
        flex: 1,
        split: true,
        margin: '0 -1 -1 -1',
        selModel: {
            selType: 'checkboxmodel'
        },
        listeners: {
            selectionchange: 'southChange'
        },
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                xtype: 'label',
                text: _('Selectable users'),
                margin: '0 15 0 5'
            }, '-', {
                itemId: 'select',
                text: _('select'),
                tooltip: _('select'),
                iconCls: 'x-fa fa-plus',
                disabled: true,
                handler: 'onSelect'
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
        itemId: 'userGroupMemberToolbar',
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