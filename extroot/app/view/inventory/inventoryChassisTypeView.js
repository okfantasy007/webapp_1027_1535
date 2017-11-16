Ext.define('Admin.view.inventory.inventoryChassisTypeView', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'inventoryChassisTypeView',
    /// 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            chassisType_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/inventory/chassis_type/select/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    },
                }
            }

        }
    },
    controller: {
        onActive: function() {
            var grid = this.lookupReference('chassisTypeGrid'),
                view = this.getView();
        },
        onProperty: function() {
            var grid = this.lookupReference('chassisTypeGrid'),
                form = this.lookupReference('edit_chassisType_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(true);    
            })
            form.setTitle(_("Chassis Type Properties"));
        },

        onRefresh: function() {
            var grid = this.lookupReference('chassisTypeGrid'),
                form = this.lookupReference('searchCondationForm');
            var values = form.getForm().getValues();
            // console.info("values:",values);
            var paging = grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = grid.getStore();
            store.proxy.url= 'inventory/chassis_type/select/page',
            store.proxy.extraParams = values;
            store.reload();
        },
        onselectionchange: function (sm, selections) {
            var toolMenuCard = this.lookupReference('toolMenuCard');
            var toolMenuCls = this.lookupReference('toolMenuCls');
            var number = selections.length;
            if (number == 1) {
                toolMenuCard.down("#onProperty").setDisabled(false);
                toolMenuCls.down("#onProperty").setDisabled(false);
            } 
            else {
                toolMenuCard.down("#onProperty").setDisabled(true);
                toolMenuCls.down("#onProperty").setDisabled(true);
            }
        },
        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var form = this.lookupReference('edit_chassisType_form');
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(true);    
            })
            form.setTitle(_("Chassis Type Properties"));
        },
        onCancel: function() {
            this.getView().setActiveItem( this.lookupReference('inventoryTypeFormGrid') );
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
        xtype: 'panel',
        title:_("Chassis Type Management"),
        iconCls: 'icon-shelves_box',
        reference: 'inventoryTypeFormGrid',
        layout : {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
        },
        items : [
        {
            xtype: 'form',
            reference: 'searchCondationForm',
            border:true,
            visible:false,
            hidden:true,            
            fieldDefaults: {
                labelWidth:75,//最小宽度  55
                labelAlign: "right",
            },// The fields
            items: [
            {
                xtype: "container",
                layout: "hbox",
                padding: '6 0 0 0',
                items: [        
                {
                    xtype: "container",
                    layout: "vbox",
                    items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Chassis Type'),
                        name: 'chassis_type_name'
                    }, 
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Ne Type'),
                        name: 'netypename'
                    }
                    ]
                },
                {
                    xtype: "container",
                    layout: "vbox",
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: _('Slot Num'),
                            name: 'slot_num'
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            padding: '0 0 0 45',
                            items: [// Reset and Submit buttons
                                {
                                    xtype: 'button',
                                    text: _('Reset'),//'重置查询',
                                    style : 'margin:0px 20px 0px 0px;',
                                    iconCls:'search_reset_bnt',
                                    handler: function() {
                                        this.up('form').getForm().reset();
                                        var paging = this.up("form").up("panel").down("grid").down('pagingtoolbar');
                                        paging.moveFirst();

                                        var store = this.up("form").up("panel").down("grid").getStore();

                                        store.proxy.url="inventory/chassis_type/select/page"
                                        store.proxy.extraParams = {};
                                        store.reload();
                                    }
                                },
                                {
                                    xtype: 'button',
                                    iconCls:'search_with_condition',
                                    text: _('Search'),
                                    width:70,
                                    handler: function () {
                                        var values = this.up("form").getForm().getValues();
                                        
                                        var paging = this.up("form").up("panel").down("grid").down('pagingtoolbar');
                                        paging.moveFirst();

                                        var store = this.up("form").up("panel").down("grid").getStore();

                                        store.proxy.url="inventory/chassis_type/select/page"
                                        store.proxy.extraParams = values;
                                        store.reload();
                                    }
                                }
                            ]
                        }
                    ]
                },
                
                ]
            }
            ]
        }, 
        {
            xtype: 'PagedGrid',
            reference: 'chassisTypeGrid',
            border:true,
            // 绑定到viewModel的属性
            bind: {
                store: '{chassisType_grid_store}',
            },
            selType: 'checkboxmodel',
            // grid显示字段
            columns: [
                { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' }, 
                { text: _('Chassis Type'), dataIndex: 'chassis_type_name', width: 120 },
                { text: _('Ne Type'), dataIndex: 'netypename', width: 180 },
                { text: _('Slot Num'), dataIndex: 'slot_num', flex: 1 }
            ],
            viewConfig: {
                //Return CSS class to apply to rows depending upon data values
                emptyText: _('No data to display'),
                deferEmptyText: false,
                trackOver: false,
                stripeRows: true
            },
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
            listeners: {
                itemdblclick: 'onItemDoubleClick',
                selectionchange: "onselectionchange",
                activate: 'onActive',
            }
        }         
        ],
        // 自定义工具条
        dockedItems: [
        {
            reference: 'toolMenuCard',
            itemId: 'toolMenuCard',
            xtype: 'toolbar',
            border:true,
            items: [
                {
                    text: _('Operation'),
                    //iconCls: 'delete_alarm_btn',
                    menu: [
                    {
                        itemId: "onProperty",
                        text : _('Properties'),
                        tooltip : _('Properties'),
                        iconCls : 'topo_rclick_view_menu',
                        disabled:true,
                        handler: 'onProperty'
                    },
                    {
                        text : _('Search'),
                        tooltip : _('Search'),
                        iconCls : 'property_search_menu',
                        hidden:true,
                        handler : function() {
                            var checkboxobj = this.up("panel").up("panel").down("#toolMenuCard").down("#searchConditions");
                            var checkbox_value = checkboxobj.getValue();
                            if(checkbox_value){
                                var searchCondationForm = this.up("panel").up("panel").down("form");
                                searchCondationForm.setVisible(!checkbox_value);
                                checkboxobj.setValue(!checkbox_value);
                            }
                            else{
                                var searchCondationForm = this.up("panel").up("panel").down("form");
                                searchCondationForm.setVisible(!checkbox_value);
                                checkboxobj.setValue(!checkbox_value);
                            }
                        }
                    },
                    {
                        text: _('Refresh'),
                        iconCls: 'property_refresh_menu',
                        tooltip : _('Refresh'),
                        handler : 'onRefresh'
                    }
                    ]
                },
                {
                    text: _('Export'),
                    menu: [
                    {
                        text: _('Export All'),
                        tooltip: _('Export All'),
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01020201'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/chassis_type/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!chassisTypeGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01020202'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('chassis_type_name'));
                                ids.push(records[i].get('chassis_type_id'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids

                            location.href = "/inventory/chassis_type/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        }
                    }
                    ]
                },
                '->',
                {
                    xtype: 'checkboxfield',
                    boxLabel: _('Quick operation'),
                    checked: false,
                    padding: '0 6 0 0',
                    listeners: {
                        change: function (me, newValue, oldValue, eOpts) {
                            var searchCondationForm = this.up("panel").down("#toolMenuCls");
                            searchCondationForm.setVisible(newValue);
                        }
                    }
                },
                {
                    itemId: "searchConditions",
                    xtype: 'checkboxfield',
                    boxLabel: _('Show Conditions'),
                    checked: false,
                    padding: '0 6 0 0',
                    listeners: {
                        change: function (me, newValue, oldValue, eOpts) {
                            var searchCondationForm = this.up("panel").down("form");
                            searchCondationForm.getForm().reset();
                            searchCondationForm.setVisible(newValue);
                        }
                    }
                }
            ]
        },
        {
            reference: 'toolMenuCls',
            itemId: 'toolMenuCls',
            hidden:true,
            xtype: 'toolbar',
            border:true,
            items: [
                {
                    itemId : 'SearchBtn',
                    tooltip : _('Search'),
                    iconCls: 'property_search_menu',
                    hidden:true,
                    handler : function() {
                        var checkboxobj = this.up("panel").down("#toolMenuCard").down("#searchConditions");
                        var checkbox_value = checkboxobj.getValue();
                        if(checkbox_value){
                            var searchCondationForm = this.up("panel").down("form");
                            searchCondationForm.setVisible(!checkbox_value);
                            checkboxobj.setValue(!checkbox_value);
                        }
                        else{
                            var searchCondationForm = this.up("panel").down("form");
                            searchCondationForm.setVisible(!checkbox_value);
                            checkboxobj.setValue(!checkbox_value);
                        }
                    }
                }, 
                {
                    itemId: "onProperty",
                    tooltip : _('Properties'),
                    iconCls : 'topo_rclick_view_menu',
                    disabled: true,
                    handler: 'onProperty'
                },
                {
                    iconCls: 'property_refresh_menu',
                    tooltip : _('Refresh'),
                    handler : 'onRefresh'
                },
                {
                    tooltip: _('Export'),
                    //disabled: true,
                    iconCls:'topo_export_menu_icon',
                    menu: [
                    {
                        text: _('Export All'),
                        tooltip: _('Export All'),
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01020201'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/chassis_type/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!chassisTypeGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01020202'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('chassis_type_name'));
                                ids.push(records[i].get('chassis_type_id'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids

                            location.href = "/inventory/chassis_type/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        }
                    }
                    ]
                }
            ]
        }        
        ]
    },
    {
        xtype: 'form',
        reference: 'edit_chassisType_form',
        margin: 10,
        items: [
        {
            xtype: 'fieldset',
            title: _('Chassis basic information'),

            margin: 10,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },

            items: [
            {
                xtype: 'hidden',
                name: 'chassis_type_id'
            },
            {
                fieldLabel: _('Chassis Type'),
                readOnly:true,
                name: 'chassis_type_name'
            }, 
            {
                fieldLabel: _('Ne Type'),
                readOnly:true,
                name: 'netypename'
            },
            {
                fieldLabel: _('Slot Num'),
                readOnly:true,
                name: 'slot_num'
            }
            ]
        }],
        buttons: [
            {
                text: _('Cancel'),
                iconCls:'x-fa fa-close',
                handler: 'onCancel',
            }
        ]
    }
    ]
});