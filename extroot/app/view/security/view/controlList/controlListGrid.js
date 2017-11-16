Ext.define('Admin.view.security.view.controlList.controlListGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.view.controlList.controlListWindow',
        'Admin.view.security.viewModel.controlList.controlListGrid',
        'Admin.view.security.model.controlList.controlListGrid',
        'Admin.view.security.controller.controlList.controlListGrid'
    ],
    xtype: 'controlListGrid',
    title: _('Access control list'),
    //frame: true,
    iconCls: 'x-fa fa-filter',
    columnLines: true,
    cls: "shadow",
    viewModel: 'controlListGrid',
    controller: 'controlListGrid',
    columns: [
        { xtype: 'rownumberer', width: 30, sortable: false, align: 'center' },
        { text: _('IP address or network segment'), dataIndex: 'ip_range', width: 280, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Description'), dataIndex: 'limit_desc', flex: 1, menuDisabled: true, sortable: false, align: 'left' }
    ],
    selModel: {
        selType: 'checkboxmodel',
        listeners: {
            selectionchange: 'onSelectChange'
        }
    },
    bind: {
        store: '{controlListStore}'
    },
    listeners: {
        itemdblclick: 'ondbClick'
    },
    dockedItems: [
        {
            xtype: 'toolbar',
            items: [
                {
                    text: _('Add'),
                    tooltip: _('Add'),
                    iconCls: 'x-fa fa-plus',
                    handler: 'onAdd'
                },
                {
                    text: _('Edit'),
                    itemId: 'edit',
                    tooltip: _('Edit'),
                    iconCls: 'x-fa fa-edit',
                    handler: 'onEdit',
                    disabled: true
                },
                {
                    text: _('Remove'),
                    itemId: 'remove',
                    tooltip: _('Remove'),
                    iconCls: 'x-fa fa-trash',
                    handler: 'onRemove',
                    disabled: true
                },
                '->',
                {
                    text: _('Refresh'),
                    tooltip: _('Refresh'),
                    iconCls: 'x-fa fa-refresh',
                    handler: 'onRefresh'
                }
            ]
        }
    ]
});