Ext.define('Admin.view.security.view.userGroup.userGroupGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.model.userGroup.userGroupGrid',
        'Admin.view.security.viewModel.userGroup.userGroupGrid',
        'Admin.view.security.controller.userGroup.userGroupGrid',
        'Admin.view.security.view.userGroup.userGroupTabWindow'
    ],
    controller: 'userGroupGrid',
    viewModel: 'userGroupGrid',
    xtype: 'userGroupGrid',
    itemId: 'security_group_view',
    title: '-',
    columnLines: true,
    selectedId: [],
    columns: [
        { xtype: 'rownumberer', flex: .2, sortable: false, align: 'center' },
        { text: _('User group name'), dataIndex: 'sec_usergroup_name', flex: .8, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('User group full name'), dataIndex: 'sec_usergroup_fullname', flex: 1, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('User group type'), dataIndex: 'sec_usergroup_type', flex: .65, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 0) {
                    return _('Superuser group')
                } else if (value == 1) {
                    return _('Ordinary user group')
                } else if (value == 2) {
                    return _('Tenant user group')
                }
            }
        },

        {
            text: _('Enabled state'), dataIndex: 'enable_status', flex: .65, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 1) {
                    return _('Enabled')
                }
            }
        },
        { text: _('Create time'), dataIndex: 'create_time', flex: 1, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Description'), dataIndex: 'sec_usergroup_desc', flex: 1.5, menuDisabled: true, sortable: false, align: 'left' }
    ],
    // viewConfig: {
    //     //Return CSS class to apply to rows depending upon data values
    //     getRowClass: function (record) {
    //         if (record.get('enable_status') != 1)
    //             return 'syslog_level_' + 3;
    //         else if (record.get('sec_usergroup_id') == 1)
    //             return 'syslog_level_' + 1;
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
        store: '{userGroupGridStore}'
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
            text: _('Delete'),
            tooltip: _('Delete'),
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
});