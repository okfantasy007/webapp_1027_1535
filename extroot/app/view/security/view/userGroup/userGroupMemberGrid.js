Ext.define('Admin.view.security.view.userGroup.userGroupMemberGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.viewModel.userGroup.userGroupMemberGrid',
        'Admin.view.security.model.userGroup.userGroupMemberGrid'
    ],
    viewModel: 'userGroupMemberGrid',
    xtype: 'userGroupMemberGrid',
    columnLines: true,
    columns: [
        { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' },
        { text: _('user name'), dataIndex: 'user_name', width: 120, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Full name of the user'), dataIndex: 'full_name', width: 120, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('user type'), dataIndex: 'user_type_str', width: 120, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 0) {
                    return _('Superuser')
                } else if (value == 1) {
                    return _('general user')
                } else if (value == 2) {
                    return _('Tenant users')
                }
            }
        },
        {
            text: _('Locked state'), dataIndex: 'lock_status_str', width: 90, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 1) {
                    return _('locking')
                } else {
                    return _('Unlocked')
                }
            }
        },
        { text: _('Create time'), dataIndex: 'create_time', width: 170, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Description'), dataIndex: 'user_desc', menuDisabled: true, sortable: false, width: 250 }
    ],
    bind: {
        store: '{userGridStore}'
    }
    // viewConfig: {
    //     loadMask: false//取消刷新读取中的动画
    // }
});