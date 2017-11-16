Ext.define('Admin.view.security.view.user.userGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.view.user.userTabWindow',
        'Admin.view.security.view.user.userSetPwdWindow',
        'Admin.view.security.model.user.userGrid',
        'Admin.view.security.viewModel.user.userGrid',
        'Admin.view.security.controller.user.userGrid'

    ],
    viewModel: 'userGrid',
    controller: 'userGrid',
    xtype: 'userGrid',
    itemId: 'security_user_view',
    title: '-',
    columnLines: true,
    columns: [
        { xtype: 'rownumberer', flex: .2, sortable: false, align: 'center' },
        { text: _('user name'), dataIndex: 'user_name', flex: .8, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Full name of the user'), dataIndex: 'full_name', flex: 1, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('user type'), dataIndex: 'user_type', flex: .65, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 0) {
                    return _('Superuser group')
                }
                else if (value == 1) {
                    return _('general user')
                } else if (value == 2) {
                    return _('Tenant users')
                }
            }
        },
        {
            text: _('Locked state'), dataIndex: 'lock_status', flex: .65, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 1) {
                    return _('locking')
                } else if (value == 2) {
                    return _('Permanent lock');
                } else {
                    return _('Unlocked')
                }
            }
        },
        {
            text: _('Create time'), dataIndex: 'create_time', flex: 1, menuDisabled: true, sortable: false, align: 'left'
        },
        { text: _('Description'), dataIndex: 'user_desc', menuDisabled: true, sortable: false, flex: 1.5 }
    ],
    // viewConfig: {
    //     //Return CSS class to apply to rows depending upon data values
    //     getRowClass: function (record) {
    //         if (record.get('lock_status') != 0)
    //             return 'syslog_level_' + 3;
    //         else
    //             if (record.get('user_type') == 0)
    //                 return 'syslog_level_' + 1;
    //             else
    //                 return 'syslog_level_' + 6;
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
        store: '{userGridStore}'
    },

    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            text: _('Add'),
            tooltip: _('Add'),
            iconCls: 'x-fa fa-plus',
            handler: 'onAdd'
        }, {
            text: _('Edit'),
            itemId: 'edit',
            tooltip: _('Edit'),
            iconCls: 'x-fa fa-edit',
            disabled: true,
            handler: 'onEdit'
        }, {
            text: _('Delete'),
            itemId: 'remove',
            tooltip: _('Delete'),
            iconCls: 'x-fa fa-trash',
            disabled: true,
            handler: 'onDelete'
        }, {
            text: _('unlock'),
            itemId: 'unlock',
            tooltip: _('unlock'),
            iconCls: 'x-fa fa-unlock',
            disabled: true,
            handler: 'onUnlock'
        }, {
            text: _('set password'),
            itemId: 'pwd',
            tooltip: _('set password'),
            iconCls: 'x-fa fa-key',
            disabled: true,
            handler: 'onSetPwd'
        }, '->', {
            text: _('Refresh'),
            tooltip: _('Refresh'),
            iconCls: 'x-fa fa-refresh',
            handler: 'onRefresh'
        }]
    }]
});

