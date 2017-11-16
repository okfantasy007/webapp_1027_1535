Ext.define('widget.helloGrid2View', {
    extend: 'Ext.container.Container',
    
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    viewModel: {
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/demo/employees',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
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
        title: '读取远程store的grid',
        xtype: 'grid',
        reference: 'demoGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}'
        },

        // grid显示字段
        columns: [
            { text: 'ID',  dataIndex: 'emp_no', width: 80 },
            { text: 'Name', dataIndex: 'full_name', width: 300 },
            { text: 'Gender', dataIndex: 'gender', width: 100 },
            { text: 'Birthday', dataIndex: 'birth_date', width: 120 },
            { text: 'Hire Date', dataIndex: 'hire_date', flex: 1 },
        ],

        tbar: [
            '->',
            {
                text: _('Refresh'),
                handler: 'onRefresh'
            }
        ]

    }]
});
