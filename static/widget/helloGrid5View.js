Ext.define('widget.helloGrid5View', {
    extend: 'Ext.container.Container',

    requires: [
        'Admin.view.base.PagedGrid'
        // 'Admin.vtype.IPAddress'
    ],
    
    // 指定布局
    layout: 'card',

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
                        // idProperty: 'emp_no',
                        // totalProperty: 'totalCount'
                    },
                }
            },

            // 本地store, 这是一个ArrayStore
            gender_local: {
                fields: [
                    'abbr',
                    'name'
                ],
                data: [
                    ['M', 'Male'],
                    ['F', 'Famale'],
                ]
            },

            // 远程store, 这是一个ArrayStore
            gender_remote: {
                autoLoad: true,             
                fields: [
                    'abbr',
                    'name'
                ],
                proxy: {
                    type: 'ajax',
                    url: '/demo/employees/gender',
                    reader: 'array'
                }
            }

        }
    },

    controller: {

        onActive: function() {
            var grid = this.lookupReference('demoGrid'),
                view = this.getView();

            // console.log(grid, view);
            // grid.setConfig({
            //     title : view.title,
            //     iconCls : view.iconCls,
            // });
        },

        onAdd: function() {
            var form = this.lookupReference('demoForm');
            this.clearForm(form);
            this.getView().setActiveItem( form );
        },

        onEdit: function() {
            var grid = this.lookupReference('demoGrid'),
                form = this.lookupReference('demoForm'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);
        },

        onDelete: function() {
            var grid = this.lookupReference('demoGrid'),
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

            // records[i].drop();
            // this.onRefresh();
        },

        onRefresh: function() {
            this.lookupReference('demoGrid').getStore().reload();
        },

        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var form = this.lookupReference('demoForm');
            this.loadFormRecord(form, record);
        },

        onSubmit: function() {
            var grid = this.lookupReference('demoGrid'),
                form = this.lookupReference('demoForm'),
                view = this.getView(),
                controller = this;

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/demo/employees/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        Ext.Msg.alert(_('Success'), action.result.msg);
                        view.setActiveItem( grid );
                        controller.onRefresh();
                    },
                    failure: function(form, action) {
                        Ext.MessageBox.alert(_('操作失败!'), action.result.msg);
                    }
                });                
            }
            else {
                Ext.MessageBox.alert(_('输入错误!'), '请检查输入错误！');
            }
        },

        onCancel: function() {
            this.getView().setActiveItem( this.lookupReference('demoGrid') );
        },

        onReset: function() {
            this.lookupReference('demoForm').getForm().reset();
        },

        // 清除form变量到初始值
        clearForm: function(form) {
            if (form.orgValues) {
                form.getForm().setValues( form.orgValues );
                this.setResetRecord(form);
                form.getForm().reset();
            } else {
                this.saveOriginalValues(form);
            };
        },

        // load记录到form
        loadFormRecord: function(form, record) {
            this.saveOriginalValues(form);
            form.getForm().loadRecord(record);
            this.setResetRecord(form);
            this.getView().setActiveItem( form );
        },

        // 保存form初始变量
        saveOriginalValues: function(form){
            if (!form.orgValues) {
                form.orgValues = Ext.clone( form.getForm().getValues() );
            }
        },

        // 使用当前form中的变量值作为reset后初始值
        setResetRecord: function(form) {
            var fields = form.query();
            for (var i in fields) {
                 fields[i].originalValue =  fields[i].value;
            }
        }
    },

    items: [
    {
        title: '读取远程store的grid,增加分页显示(继承使用),演示对数据库的增删查改操作',
        iconCls: 'x-fa fa-circle-o',
        xtype: 'PagedGrid',
        reference: 'demoGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}',
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
            activate: 'onActive',
        }
    },

    {
        xtype: 'form',
        reference: 'demoForm',
        margin: 10,
        items: [
        {
            xtype: 'fieldset',
            title: 'Employee Information',

            margin: 10,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },

            items: [
            {
                xtype: 'hidden',
                name: 'emp_no'
            },
            {
                fieldLabel: 'First Name',
                emptyText: 'First Name',
                allowBlank: false,
                // vtype:'IPAddress',
                name: 'first_name'
            }, 
            {
                fieldLabel: 'Last Name',
                emptyText: 'Last Name',
                allowBlank: false,
                name: 'last_name'
            },
            {
                xtype: 'combobox',
                fieldLabel: 'Gender',
                name: 'gender',
                bind: {
                    store: '{gender_remote}',
                },                
                valueField: 'abbr',
                displayField: 'name',
                queryMode: 'local',
                value: 'M',
                emptyText: 'Select a gender...'
            }, 
            {
                xtype: 'datefield',
                fieldLabel: 'Birthday',
                name: 'birth_date',
                format: 'Y-m-d',
                value: new Date(),
                maxValue: new Date()
            },
            {
                xtype: 'datefield',
                fieldLabel: 'Hire Date',
                name: 'hire_date',
                format: 'Y-m-d',
                value: new Date(),
                maxValue: new Date()
            }
            ]
        }],

        buttons: [
        {
            text: _('Reset'),
            iconCls:'x-fa fa-undo',
            handler: 'onReset',
        },
        {
            text: _('Cancel'),
            iconCls:'x-fa fa-close',
            handler: 'onCancel',
        },
        {
            text: _('Save'),
            iconCls:'x-fa fa-save',
            handler: 'onSubmit',
        }]

    }]

});
