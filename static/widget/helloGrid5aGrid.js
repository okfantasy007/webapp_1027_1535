Ext.define('widget.helloGrid5aGrid', {
    extend: 'Admin.view.base.PagedGrid',
    xtype: 'helloGrid5aGrid',

    controller: {

        onAdd: function() {
            var grid = this.getView(),
                card = grid.up(),
                form = card.down('helloGrid5aForm');
            form.lookupController().clearForm();
            //card.setActiveItem( form );
            form.show();
        },

        onEdit: function() {
            var grid = this.getView(),
                record = grid.getSelectionModel().getSelection()[0],
                card = grid.up(),
                form = card.down('helloGrid5aForm');
            form.lookupController().loadFormRecord(record);
            card.setActiveItem( form );
        },

        onDelete: function() {
            var grid = this.getView(),
                records = grid.getSelectionModel().getSelection(),
                names = [], ids=[];

            for (var i in records) {
                records[i]
                console.log('delete... ', records[i].get('full_name'));
                names.push(records[i].get('full_name'));
                ids.push(records[i].get('emp_no'));
            }

            Ext.MessageBox.confirm(_('Confirmation'), names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'ids', value:  ids.join(',')}
                            ]
                        }).getForm().submit({
                            url: '/demo/employees/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('With Errors'), action.result.msg);
                                } else {
                                    Ext.Msg.alert(_('Success'), action.result.msg);
                                }
                                grid.store.reload();
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), action.result.msg);
                            }
                        }); // form
                    } // if 
                }
            );

        },

        onRefresh: function() {
            this.getView().getStore().reload();
        },

        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var grid = this.getView(),
                card = grid.up(),
                form = card.down('helloGrid5aForm');
            form.lookupController().loadFormRecord(record);
            card.setActiveItem( form );
        }

    },

    title: '读取远程store的grid,增加分页显示(继承使用),演示对数据库的增删查改操作,view,grid,form分别定义',
    iconCls: 'x-fa fa-circle-o',

    store: {
        autoLoad: true,
        // 每页显示记录数
        pageSize: 15,
        proxy: {
            type: 'ajax',
            url: '/demo/employees/page',
            reader: {
                type: 'json',
                rootProperty: 'data'
            },
        }
    },

    selType: 'checkboxmodel',

    // grid显示字段
    columns: [
        // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
        { text: 'ID',  dataIndex: 'emp_no', width: 80 },
        { text: 'Name', dataIndex: 'full_name', width: 300 },
        { text: 'Gender', dataIndex: 'gender_name', width: 100 },
        { text: 'Birthday', dataIndex: 'birth_date', width: 120 },
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
            {
                text: _('Add'),
                iconCls:'x-fa fa-plus',
                handler: 'onAdd'
            },
            {
                text: _('Edit'),
                iconCls:'x-fa fa-edit',
                handler: 'onEdit',
                bind: {
                    disabled: '{!demoGrid.selection}'
                }                    
            },
            {
                text: _('Delete'),
                iconCls:'x-fa fa-trash',
                handler: 'onDelete',
                bind: {
                    disabled: '{!demoGrid.selection}'
                }                    
            },
            '->',
            {
                text: _('Refresh'),
                iconCls:'x-fa fa-refresh',
                handler: 'onRefresh'
            }
        ]
    }],

    listeners: {
        itemdblclick: 'onItemDoubleClick',
    }

});
