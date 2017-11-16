Ext.define('Admin.view.security.view.user.userControlList', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.viewModel.user.userControlList',
        'Admin.view.security.model.user.userControlList',
        'Admin.view.security.controller.user.userControlList',
        'Admin.view.security.view.user.userSetControlListWindow'
    ],
    controller: 'userControlList',
    viewModel: 'userControlList',
    xtype: 'userControlList',
    itemId: 'user_form_acl',
    userId: '',
    reference: 'userControlList',
    title: _('Access control list'),
    viewConfig: {
        markDirty: false
    },
    border: false,
    columnLines: true,
    aclModel: 1,
    columns: [
        { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' },
        { xtype: 'checkcolumn', text: _('Select'), dataIndex: 'checked', width: 60, disabled: true },
        { text: _('IP address or network segment'), dataIndex: 'ip_range', width: 280, menuDisabled: true, sortable: false },
        { text: _('Description'), dataIndex: 'limit_desc', flex: 1, menuDisabled: true, sortable: false }
    ],
    bind: {
        store: '{userControlListStore}'
    },
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            text: _('Set the control list'),
            tooltip: _('Set the control list'),
            iconCls: 'x-fa fa-gear',
            handler: 'onSetControlList'
        }, '->', {
            text: _('Refresh'),
            iconCls: 'x-fa fa-refresh',
            handler: 'onControlListRefresh'
        }]
    }, {
        xtype: 'toolbar',
        items: [{
            xtype: 'radiogroup',
            itemId: 'radiogroup',
            layout: 'hbox',
            columns: 0,
            items: [{
                boxLabel: _('Use all access control lists within the system'),
                name: 'use_all_acl',
                margin: '0 0 0 7',
                inputValue: 1,
                checked: true,
                listeners: {
                    change: 'onRadioChangeL'
                }
            }, {
                boxLabel: _('Use the specified access control list'),
                itemId: "rigthRadio",
                name: 'use_all_acl',
                margin: '0 0 0 20',
                inputValue: 2,
                checked: false,
                listeners: {
                    change: 'onRadioChangeR'
                }
            }]
        }]
    }, {
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userControlListToolbar',
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