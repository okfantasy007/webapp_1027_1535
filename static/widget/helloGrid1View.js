Ext.define('widget.helloGrid1View', {
    extend: 'Ext.container.Container',
    
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    viewModel: {
        stores: {
            // 本地store
            hello_grid_local: {
                fields: ['id','USER_NAME', 'FULL_NAME'],
                data: [
                    { "id":"1", 'USER_NAME': 'user1', "FULL_NAME":"user full name 1"  },
                    { "id":"2", 'USER_NAME': 'user2', "FULL_NAME":"user full name 2"  },
                    { "id":"3", 'USER_NAME': 'user3', "FULL_NAME":"user full name 3"  },
                    { "id":"4", 'USER_NAME': 'user4', "FULL_NAME":"user full name 4"  },
                    { "id":"5", 'USER_NAME': 'user5', "FULL_NAME":"user full name 5"  },
                    { "id":"6", 'USER_NAME': 'user6', "FULL_NAME":"user full name 6"  },
                    { "id":"7", 'USER_NAME': 'user7', "FULL_NAME":"user full name 7"  },
                    { "id":"8", 'USER_NAME': 'user8', "FULL_NAME":"user full name 8"  },
                    { "id":"9", 'USER_NAME': 'user9', "FULL_NAME":"user full name 9"  },
                ]
            }
        }
    },

    controller: {
        onRefresh: function() {
            var store = this.lookupReference('helloGrid').getStore();
            store.each(function(record){
                var idx = Math.floor (Math.random() * 100);
                record.set({
                    USER_NAME: 'User ' + idx,
                    FULL_NAME: 'User full name ' + idx,
                });
            });
        }
    },

    items: [{
        title: '读取本地store的grid',
        xtype: 'grid',
        reference: 'helloGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{hello_grid_local}'
        },

        // grid显示字段
        columns: [
            { text: 'SEC_USER_ID', dataIndex: 'id', width: 150 },
            { text: 'USER_NAME',  dataIndex: 'USER_NAME', width: 250 },
            { text: 'FULL_NAME', dataIndex: 'FULL_NAME', flex: 1 }
        ],

        // 标题栏按钮
        tools: [
            {
                tooltip:_('Refresh'),
                iconCls:'x-fa fa-refresh',
                handler: 'onRefresh'
            }
        ]

    }]
});
