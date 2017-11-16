Ext.define('Admin.view.security.view.onlineUser.onlineUserGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Admin.view.security.model.onlineUser.onlineUserGrid',
        'Admin.view.security.viewModel.onlineUser.onlineUserGrid',
        'Admin.view.security.controller.onlineUser.onlineUserGrid'
    ],
    xtype: 'onlineUserGrid',
    itemId: 'security_online_user_view',
    columnsLines: true,
    title: '-',
    reference: 'onlineUserGrid',
    viewModel: 'onlineUserGrid',
    controller: 'onlineUserGrid',
    columnLines: true,
    columns: [
        { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' },
        { text: _('user name'), dataIndex: 'user_name', width: 150, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('User host address'), dataIndex: 'ip_address', width: 130, menuDisabled: true, sortable: false, align: 'left' },
        { text: _('Log in time'), dataIndex: 'login_time', width: 160, menuDisabled: true, sortable: false, align: 'left' },
        {
            text: _('Description'), dataIndex: 'sessionID', flex: 1, menuDisabled: true, sortable: false, renderer: function (value, meta, record) {
                return "sessionID：" + value;
            }
        }
    ],
    bind: {
        store: '{onlineUserStore}'
    },
    selModel: {
        selType: 'checkboxmodel',
        listeners: {
            selectionchange: 'onSelectChange'
        }
    },
    listeners: {
        containercontextmenu: 'onContextMenu',
        itemcontextmenu: 'onItemContextMenu'
    },
    viewConfig: {
        //Return CSS class to apply to rows depending upon data values
        getRowClass: function (record) {
            if (record.get('sessionID') == APP.sessionID)
                return 'light_gray';
        }
    },
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            itemId: 'removeButton',
            text: _('Force the user to exit'),
            tooltip: _('Force the user to exit'),
            iconCls: 'x-fa fa-sign-out',
            handler: 'onRemoveUser',
            // bind: {
            //     disabled: '{!onlineUserGrid.selection}'
            // }
            disabled: true
        }, '->', {
            text: _('Refresh'),
            tooltip: _('Refresh'),
            iconCls: 'x-fa fa-refresh',
            handler: function () {
                this.up('grid').store.reload();
            }
        }]
    }]

});