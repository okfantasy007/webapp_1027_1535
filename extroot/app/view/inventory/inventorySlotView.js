Ext.define('Admin.view.inventory.inventorySlotView', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'inventorySlotView',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            slot_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'rest/inventory/res_slot/select/page',
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
            var grid = this.lookupReference('slotGrid'),
                view = this.getView();
        },
        onEdit: function() {
            var grid = this.lookupReference('slotGrid'),
                form = this.lookupReference('slot_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(true);
            form.down("#saveButtonMenu").setVisible(true);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(false);    
            }) 
            form.setTitle(_("Slot Edit Info"));
        },
        onProperty: function() {
            var grid = this.lookupReference('slotGrid'),
                form = this.lookupReference('slot_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(false);
            form.down("#saveButtonMenu").setVisible(false);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(true);    
            })
            form.setTitle(_("Slot Properties Info"));
        },
        onDelete: function() {
            var grid = this.lookupReference('slotGrid'),
                records = grid.getSelectionModel().getSelection(),
                form = this.lookupReference('searchCondationForm'),
                names = [], ids=[];
            var values = form.getForm().getValues();    
            for (var i in records) {
                var record_json ={}
                record_json["slot_id"] = records[i].get('slot_id');
                names.push(records[i].get('slot_name'));
                ids.push(record_json);
            }
            Ext.MessageBox.confirm(_('Do you confirm deletion?'), names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        Ext.Ajax.request({
                            url: 'rest/inventory/res_slot/delete',    //请求地址
                            jsonData :{slot_ids: ids},
                            success: function(response){
                                var r = Ext.decode(response.responseText)
                                if (r.success) {
                                    Ext.Msg.alert(_('Tips'), r.msg);
                                }else{
                                    Ext.Msg.alert(_('Tips'), r.msg);
                                }
                                var paging = grid.down('pagingtoolbar');
                                paging.moveFirst();
                                var store = grid.getStore();
                                store.proxy.url= 'rest/inventory/res_slot/select/page',
                                store.proxy.extraParams = values;
                                store.reload();
                            }
                        });
                    } // if 
                }
            );
        },
        onRefresh: function() {
            var grid = this.lookupReference('slotGrid'),
                form = this.lookupReference('searchCondationForm');
            var values = form.getForm().getValues();
            // console.info("values:",values);
            var paging = grid.down('pagingtoolbar');
            paging.moveFirst();
            var store = grid.getStore();
            store.proxy.url= 'rest/inventory/res_slot/select/page',
            store.proxy.extraParams = values;
            store.reload();
        },
        onselectionchange: function (sm, selections) {
            var toolMenuCard = this.lookupReference('toolMenuCard');
            var toolMenuCls = this.lookupReference('toolMenuCls');
            var number = selections.length;
            if (number == 1) {
                toolMenuCard.down("#onProperty").setDisabled(false);
                toolMenuCard.down("#editButton").setDisabled(false);
                toolMenuCard.down("#relatedResources").setDisabled(false);
                toolMenuCls.down("#onProperty").setDisabled(false);
                toolMenuCls.down("#editButton").setDisabled(false);
            } 
            else {
                toolMenuCard.down("#onProperty").setDisabled(true);
                toolMenuCard.down("#editButton").setDisabled(true);
                toolMenuCard.down("#relatedResources").setDisabled(true);
                toolMenuCls.down("#onProperty").setDisabled(true);
                toolMenuCls.down("#editButton").setDisabled(true);
            }
        },
        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var form = this.lookupReference('slot_edit_form');
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(false);    
            }) 
            form.setTitle(_("Slot Edit Info"));
        },
        onSubmit: function() {
            var form_grid = this.lookupReference('inventoryFormGrid'),
                form = this.lookupReference('slot_edit_form'),
                view = this.getView(),
                controller = this;

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/rest/inventory/res_slot/edit',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        Ext.Msg.alert(_('Success'), action.result.msg);
                        view.setActiveItem( form_grid );
                        controller.onRefresh();
                    },
                    failure: function(form, action) {
                        Ext.MessageBox.alert(_('Operation Failure!'), action.result.msg);
                    }
                });                
            }
            else {
                Ext.MessageBox.alert(_('Tip'), _('Please Check The Input Content'));
            }
        },

        onCancel: function() {
            this.getView().setActiveItem( this.lookupReference('inventoryFormGrid') );
        },
        onReset: function() {
            this.lookupReference('slot_edit_form').getForm().reset();
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
        title:_("Slot Management"),
        iconCls: 'icon-server_stack',
        reference: 'inventoryFormGrid',
        layout : {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
        },
        items : [
        {
            xtype: 'form',
            reference: 'searchCondationForm',
            border: true,
            visible:false,
            hidden:true,            
            fieldDefaults: {
                labelWidth:75,//最小宽度  55
                labelAlign: "right",
            },// The fields
            items: [
            {
                xtype: "container",
                padding: '6 0 0 0',
                layout: "hbox",
                items: [        
                {
                    xtype: "container",
                    layout: "vbox",
                    items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Slot Index'),
                        name: 'slot_index'
                    }, 
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Slot Name'),
                        name: 'slot_name'
                    }
                    ]
                },
                {
                    xtype: "container",
                    layout: "vbox",
                    items: [
                        {
                            xtype: 'combobox',
                            fieldLabel: _('Tenant'),
                            editable:false,
                            name: 'tenant',
                            store: {
                                fields: [
                                    {name: 'sec_user_id', type: 'string'},
                                    {name: 'tenant', type: 'string'}
                                ],
                                proxy: {
                                    type: 'ajax',
                                    url: 'inventory/res_ne/select/tenant',
                                    reader: {
                                        type: 'json',
                                        rootProperty: 'data'
                                    }
                                },
                                autoLoad: true
                            },
                            valueField: 'sec_user_id',
                            displayField: 'tenant'
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: _('Userlabel'),
                            name: 'userlabel'
                        }
                    ]
                },
                {
                    xtype: "container",
                    layout: "hbox",
                    padding: '36 0 0 0',
                    items: [// Reset and Submit buttons
                        {
                            xtype: 'button',
                            text: _('Reset'),//'重置查询',
                            iconCls:'search_reset_bnt',
                            margin: 5,
                            handler: function() {
                                this.up('form').getForm().reset();
                                var paging = this.up("form").up("panel").down("grid").down('pagingtoolbar');
                                paging.moveFirst();

                                var store = this.up("form").up("panel").down("grid").getStore();

                                store.proxy.url="rest/inventory/res_slot/select/page"
                                store.proxy.extraParams = {};
                                store.reload();
                            }
                        },
                        {
                            xtype: 'button',
                            iconCls:'search_with_condition',
                            text: _('Search'),
                            width:70,
                            margin: 5,
                            handler: function () {
                                var values = this.up("form").getForm().getValues();
                                
                                var paging = this.up("form").up("panel").down("grid").down('pagingtoolbar');
                                paging.moveFirst();

                                var store = this.up("form").up("panel").down("grid").getStore();

                                store.proxy.url="rest/inventory/res_slot/select/page"
                                store.proxy.extraParams = values;
                                store.reload();
                            }
                        }
                    ]
                }
                ]
            }
            ]
        }, 
        {
            border: true,
            xtype: 'PagedGrid',
            reference: 'slotGrid',
            // 绑定到viewModel的属性
            bind: {
                store: '{slot_grid_store}',
            },
            selType: 'checkboxmodel',
            // grid显示字段
            columns: [
                // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
                { text: _('Belong Ne'), dataIndex: 'ne_userlabel', width: 135 },
                { text: _('Belong Chassis'), dataIndex: 'chassis_userlabel', width: 135 },
                { text: _('Slot Name'), dataIndex: 'slot_name', width: 150 },
                { text:  _('Slot Index'),  dataIndex: 'slot_index', width: 150 },
                { text: _('Userlabel'), dataIndex: 'userlabel', width: 120 },
                { text: _('Tenant'), dataIndex: 'tenant', width: 120 },
                { text:  _('Update Time'), dataIndex: 'update_time', width: 160, 
                    renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s'),  
                    flex: 1 
                },
                {xtype: 'hidden',text: '机箱ID', dataIndex: 'chassis_id', width: 120},
                {xtype: 'hidden',text: '板卡ID', dataIndex: 'slot_id', width: 120},
                {xtype: 'hidden',text: 'NE ID', dataIndex: 'neid', width: 120}
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
            itemId:"toolMenuCard",
            reference: 'toolMenuCard',
            xtype: 'toolbar',
            border: true,
            items: [
                {
                    text: _('Operation'),
                    menu: [
                    {
                        text : _('Properties'),
                        tooltip : _('Properties'),
                        iconCls : 'topo_rclick_view_menu',
                        disabled : true,
                        handler : "onProperty"
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
                        text: _('Modify'),
                        tooltip : _('Modify'),
                        iconCls:'x-fa fa-edit',
                        hidden:SEC.hidden('01010401'),
                        disabled : true,
                        handler: 'onEdit'   
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
                        hidden:SEC.hidden('01010402'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            // var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/res_slot/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!slotGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01010403'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('slot_name'));
                                ids.push(records[i].get('slot_id'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids.join(",")

                            location.href = "/inventory/res_slot/export/datacsv?" + Ext.Object.toQueryString(send_info)
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
                    itemId:"searchConditions",
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
            border: true,
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
                        }
                        else{
                            var searchCondationForm = this.up("panel").down("form");
                            searchCondationForm.setVisible(!checkbox_value);
                        }
                        checkboxobj.setValue(!checkbox_value);
                    }
                },
                {
                    tooltip : _('Modify'),
                    iconCls : 'property_edit_menu',
                    hidden:SEC.hidden('01010401'),
                    disabled:true,
                    handler : "onEdit"
                },
                {
                    tooltip : _('Properties'),
                    iconCls : 'topo_rclick_view_menu',
                    disabled:true,
                    handler : "onProperty"
                },
                {
                    iconCls: 'property_refresh_menu',
                    tooltip : _('Refresh'),
                    handler : "onRefresh"
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
                        hidden:SEC.hidden('01010402'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            // var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/res_slot/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!slotGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01010403'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('slot_name'));
                                ids.push(records[i].get('slot_id'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids.join(",")

                            location.href = "/inventory/res_slot/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        }
                    }
                    ]
                }
            ]
        }        
        ]
    },
    {
        title: _("Slot Edit Info"),
        xtype: 'form',
        reference: 'slot_edit_form',
        margin: 10,
        items: [
        {
            xtype: 'fieldset',
            title: _('Basic Information'),
            margin: 10,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },

            items: [
            {
                xtype: 'hidden',
                name: 'slot_id'
            },
            {
                fieldLabel: _('Slot Name'),
                name: 'slot_name'
            },
            {
                xtype: 'combobox',
                fieldLabel: _('Tenant'),
                editable:false,
                name: 'tenant',
                store: {
                    fields: [
                        {name: 'sec_user_id', type: 'string'},
                        {name: 'tenant', type: 'string'}
                    ],
                    proxy: {
                        type: 'ajax',
                        url: 'inventory/res_ne/select/tenant',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    },
                    autoLoad: true
                },
                value:"",
                valueField: 'sec_user_id',
                displayField: 'tenant'
            }
           
            ]
        }],

        buttons: [
        {
            itemId : 'reSetButtonMenu',
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
            itemId : 'saveButtonMenu',
            text: _('Save'),
            iconCls:'x-fa fa-save',
            handler: 'onSubmit',
        }]
    }
    ]

});
