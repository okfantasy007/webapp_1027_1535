Ext.define('widget.helloGrid3View', {
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
                pageSize: 15,
                // remoteSort: true,
                // buffered: false,
                // sorters: [{
                //     property: 'TIMESTAMP(date)',
                //     direction: 'DESC'
                // }],
                proxy: {
                    type: 'ajax',
                    url: '/demo/employees/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    },
                    // simpleSortMode: true
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
        title: '读取远程store的grid，增加分页显示',
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
            { text: 'Hire Date', dataIndex: 'hire_date', flex: 1 },
        ],

        dockedItems: [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    '->',
                    {
                        text: _('Refresh'),
                        handler: 'onRefresh'
                    }
                ]
            },
            {
                xtype: 'pagingtoolbar',
                dock: 'top',
                // dock: 'bottom',
                inputItemWidth: 80,
                displayInfo: true,
                displayMsg : _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}', 
                emptyMsg: _("Empty"),
                items: [
                    '-',
                    {
                        fieldLabel: _('Page Size'),
                        xtype: 'combobox',
                        width: 170,
                        padding: '0 0 0 5',
                        displayField: 'val',
                        valueField: 'val',
                        multiSelect: false,
                        editable: false,
                        labelWidth: 60,
                        store: Ext.create('Ext.data.Store', {
                            fields: [{name: 'val', type: 'int'}],
                            data: [
                                {val: 15},
                                {val: 25},
                                {val: 50},
                                {val: 100},
                                {val: 200},
                                {val: 500},
                                {val: 1000},
                            ]
                        }),
                        value: 15,
                        listeners: {
                            change: function(me, newValue, oldValue, ops) {
                                var grid = this.up('grid');
                                Ext.apply(grid.store, {pageSize: newValue});
                                this.up('pagingtoolbar').moveFirst();
                            }
                        }
                    }
                ]
            }

        ]//dockedItems

    }]
});
