Ext.define('widget.helloGrid4View', {
    extend: 'Ext.container.Container',

    requires: [
        'Admin.view.base.PagedGrid'
    ],
    
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    viewModel: {
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/demo/employees/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    },
                }
            }
        }
    },

    controller: {
        onRefresh: function() {
            this.lookupReference('demoGrid').getStore().reload();
        },
    },

    items: [{
        title: '读取远程store的grid，增加分页显示(继承使用)',
        xtype: 'PagedGrid',
        reference: 'demoGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}',
        },

        // grid显示字段
        columns: [
            { text: 'ID',  dataIndex: 'emp_no', width: 80 },
            { text: 'Name', dataIndex: 'full_name', width: 300 },
            { text: 'Gender', dataIndex: 'gender', width: 100 },
            { text: 'Hire Date', dataIndex: 'hire_date', flex: 1 },
        ],

        // 分页工具条位置
        // pagingbarDock: 'bottom',
        pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 15,
        // 分页策略
        pagingbarConfig: {
            fields: [{name: 'val', type: 'int'}],
            data: [
                {val: 15},
                {val: 30},
                {val: 60},
                {val: 100},
                {val: 200},
                {val: 500},
                {val: 1000},
                {val: 2000},
            ]
        },

        // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                '->',
                {
                    text: _('Refresh'),
                    handler: 'onRefresh'
                }
            ]
        }]
    }]
});
