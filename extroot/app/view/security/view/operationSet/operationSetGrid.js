Ext.define('Admin.view.security.view.operationSet.operationSetGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.model.operationSet.operationSetGrid',
        'Admin.view.security.viewModel.operationSet.operationSetGrid',
        'Admin.view.security.controller.operationSet.operationSetGrid',
        'Admin.view.security.view.operationSet.operationSetTabWindow'
    ],
    controller: 'operationSetGrid',
    viewModel: 'operationSetGrid',
    xtype: 'operationSetGrid',
    itemId: 'security_operset_view',
    title: '-',
    columnLines: true,
    columns: [
        { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' },
        { text: _('Action set name'), dataIndex: 'sec_operator_set_name', width: 250, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('Operation set type'), dataIndex: 'sec_operator_set_type', width: 150, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 1) {
                    return _('Network management applications')
                } else {
                    return _('Network equipment')
                }
            }
        },
        { text: _('Operation set description'), dataIndex: 'sec_operator_set_desc', flex: 1, menuDisabled: true, sortable: false }
    ],
    // viewConfig: {
    //     //Return CSS class to apply to rows depending upon data values
    //     getRowClass: function (record) {
    //         if (record.get('is_default'))
    //             return 'syslog_level_' + 2;
    //         else
    //             return 'syslog_level_' + 6;
    //     }
    // },
    selModel: {
        selType: 'checkboxmodel',
        listeners: {
            selectionchange: 'onSelectChange'
        }
    },
    listeners: {
        itemdblclick: 'ondbClick',
        containercontextmenu: 'onContextMenu',
        itemcontextmenu: 'onItemContextMenu'
    },
    bind: {
        store: '{operationSetGridStore}'
    },
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            itemId: 'add',
            text: _('Add'),
            tooltip: _('Add'),
            iconCls: 'x-fa fa-plus',
            handler: 'onAdd'
        }, {
            itemId: 'edit',
            text: _('Edit'),
            tooltip: _('Edit'),
            iconCls: 'x-fa fa-edit',
            disabled: true,
            handler: 'onEdit'
        }, {
            itemId: 'remove',
            text: _('Remove'),
            tooltip: _('Remove'),
            iconCls: 'x-fa fa-trash',
            disabled: true,
            handler: 'onDelete'
        }, '->', {
            text: _('Refresh'),
            tooltip: _('Refresh'),
            iconCls: 'x-fa fa-refresh',
            handler: 'onRefresh'
        }]
    }]
})