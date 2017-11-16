Ext.define('Admin.view.security.view.user.userOfGroupGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.viewModel.user.userOfGroupGrid',
        'Admin.view.security.model.user.userOfGroupGrid'
    ],
    viewModel: 'userOfGroupGrid',
    xtype: 'userOfGroupGrid',
    columnLines: true,
    columns: [
        { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' },
        { text: _('User group name'), dataIndex: 'sec_usergroup_name', width: 120, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('User group type'), dataIndex: 'sec_usergroup_type', width: 120, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 0) {
                    return _('Superuser group')
                }
                else if (value == 1) {
                    return _('Ordinary user group')
                } else if (value == 2) {
                    return _('Tenant user group')
                }
            }
        },
        { text: _('User group full name'), dataIndex: 'sec_usergroup_fullname', width: 120, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('Enabled state'), dataIndex: 'enable_status', width: 90, menuDisabled: true, sortable: false, align: 'left', renderer: function (value, meta, record) {
                if (value == 1) {
                    return _('Enabled')
                } else {
                    return _('Not Enabled')
                }
            }
        },
        { text: _('Create time'), dataIndex: 'create_time', width: 170, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Description'), dataIndex: 'sec_usergroup_desc', width: 250, menuDisabled: true, sortable: false, align: 'left' }
    ],
    bind: {
        store: '{userOfGroupGridStore}'
    },
    selModel: {
        selType: 'checkboxmodel'
    }
    // viewConfig: {
    //     loadMask: false//取消刷新读取中的动画
    // }
});