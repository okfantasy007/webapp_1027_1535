Ext.define('Admin.view.system.users.UsersView', {
    extend: 'Ext.grid.Panel',
    xtype: 'usersView',
    
    // 指定panel边缘的阴影效果
    cls: 'shadow',

    viewModel: {
        stores: {
            // 远程store
            userlist_remote2: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/users/list',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    },
                    simpleSortMode: true
                }
            },
            // 本地store
            userlist_local2: {
                fields: ['SEC_USER_ID', 'USER_NAME', 'FULL_NAME'],
                data: [
                    { "SEC_USER_ID":"1", 'USER_NAME': 'user1', "FULL_NAME":"user full name 1"  },
                    { "SEC_USER_ID":"2", 'USER_NAME': 'user2', "FULL_NAME":"user full name 2"  },
                    { "SEC_USER_ID":"3", 'USER_NAME': 'user3', "FULL_NAME":"user full name 3"  },
                    { "SEC_USER_ID":"4", 'USER_NAME': 'user4', "FULL_NAME":"user full name 4"  },
                    { "SEC_USER_ID":"5", 'USER_NAME': 'user5', "FULL_NAME":"user full name 5"  },
                    { "SEC_USER_ID":"6", 'USER_NAME': 'user6', "FULL_NAME":"user full name 6"  },
                    { "SEC_USER_ID":"7", 'USER_NAME': 'user7', "FULL_NAME":"user full name 7"  },
                    { "SEC_USER_ID":"8", 'USER_NAME': 'user8', "FULL_NAME":"user full name 8"  },
                    { "SEC_USER_ID":"91", 'USER_NAME': 'user9', "FULL_NAME":"user full name 9"  },
                ]
            }
        }
    },

    controller: {
        onRefresh: function() {
            this.getView().store.reload();
        },
        onAddUser: function() {
            // this.lookupReference('usersGrid').store.reload();
        },
        onRemoveUser: function() {
            // this.lookupReference('usersGrid').store.reload();
        }
    },

    // 引用标签
    reference: 'usersGrid',

    // 绑定到viewModel的项目
    bind: {
        // title: '{title}',
        // iconCls: '{iconCls}',
        store: '{userlist_remote2}'
        // store: '{userlist_local2}'
    },

    columns: [
        { text: 'USER_NAME',  dataIndex: 'USER_NAME', width: 200 },
        { text: 'SEC_USER_ID', dataIndex: 'SEC_USER_ID', width: 250 },
        { text: 'FULL_NAME', dataIndex: 'FULL_NAME', flex: 1 }
    ],

    // 标题栏按钮
    tools: [
        {
            tooltip:_('Refresh'),
            iconCls:'x-fa fa-refresh',
            handler: 'onRefresh'
        }
    ],

    tbar: [
        {
            text: 'Add User',
            handler: 'onAddUser'
        }, 
        {
            text: 'Remove User',
            handler: 'onRemoveUser',
            bind: {
                disabled: '{!usersGrid.selection}'
            }
        }
    ]
   
});
