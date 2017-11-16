Ext.define('Admin.view.inventory.inventoryPortView', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.inventory.basemodel.basePortGrid'
    ],
    xtype: 'inventoryPortView',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            port_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'rest/inventory/res_port/select/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                listeners : {
                    beforeload: function(store, options) {
                        var ary = window.location.hash.split('/');
                        console.log("beforeload:", ary,ary.length);
                        if(ary.length > 2){
                            if(ary[2] == "card_id"){
                                var base_id = Public.hexToString (ary[3]);
                                Ext.apply(store.proxy.extraParams, {search_id:ary[2] + "='" + base_id + "'",type:"web_router"});
                            }
                            else{
                                Ext.apply(store.proxy.extraParams,  {search_id:ary[2] + "=" + ary[3],type:"web_router"});
                            }
                        }
                        else{
                            Ext.apply(store.proxy.extraParams, {});
                        }    
                    }
                }
            }
        }
    },
    listeners: {
        activate: 'onActive'
    },
    controller: {
        onActive: function(me, eOpts) {
            var view = this.getView();
            
            var grid = this.lookupReference('portGrid');
            var form = grid.up("panel").down('form');

            var ary = window.location.hash.split('/');
            // console.log("onActive",  ary,ary.length);
            var paging = grid.down('pagingtoolbar');
                paging.moveFirst();
            var store = grid.getStore();

            if(ary.length > 2){
                if(ary[2] == "card_id"){
                    var base_id = Public.hexToString (ary[3]);
                    // Ext.apply(store.proxy.extraParams, {search_id:ary[2] + "='" + base_id + "'",type:"web_router"});
                    store.proxy.extraParams = {search_id:ary[2] + "='" + base_id + "'",type:"web_router"};
                    store.proxy.url="rest/inventory/res_port/select/page"
                }
                else{
                    // Ext.apply(store.proxy.extraParams,  {search_id:ary[2] + "=" + ary[3],type:"web_router"});
                    store.proxy.extraParams = {search_id:ary[2] + "=" + ary[3],type:"web_router"};
                    store.proxy.url="rest/inventory/res_port/select/page"
                }
            }
            else{
                // Ext.apply(store.proxy.extraParams, {});
                store.proxy.extraParams = {};
                store.proxy.url="rest/inventory/res_port/select/page"
            } 
            store.reload();
        },
        onselectionchange: function (sm, selections) {
            var toolMenuCard = this.lookupReference('toolMenuCard');
            var toolMenuCls = this.lookupReference('toolMenuCls');
            var number = selections.length;
            if (number == 1) {
                toolMenuCard.down("#onProperty").setDisabled(false);
                toolMenuCard.down("#editButton").setDisabled(false);
                toolMenuCls.down("#onProperty").setDisabled(false);
                toolMenuCls.down("#editButton").setDisabled(false);
            } 
            else {
                toolMenuCard.down("#onProperty").setDisabled(true);
                toolMenuCard.down("#editButton").setDisabled(true);
                toolMenuCls.down("#onProperty").setDisabled(true);
                toolMenuCls.down("#editButton").setDisabled(true);
            }
        },
        onProperty: function() {
            var grid = this.lookupReference('portGrid'),
                form = this.lookupReference('port_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(false);
            form.down("#saveButtonMenu").setVisible(false);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(true);    
            })
            form.setTitle(_("Port Properties Info"));
        },
        onEdit: function() {
            var grid = this.lookupReference('portGrid'),
                form = this.lookupReference('port_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(true);
            form.down("#saveButtonMenu").setVisible(true);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(false);    
            })
            form.setTitle(_("Port Edit Info"));
        },
        onRefresh: function() {
            var grid = this.lookupReference('portGrid'),
                form = this.lookupReference('searchCondationForm');

            var values = form.getForm().getValues();
            // console.info("values:",values);
            var paging = grid.down('pagingtoolbar');
            paging.moveFirst();

            var store = grid.getStore();

            store.proxy.url= 'rest/inventory/res_port/select/page',
            store.proxy.extraParams = values;
            store.reload();
        },
        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var form = this.lookupReference('port_edit_form');
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function(field) {
                //设置只读  
                field.setReadOnly(false);    
            })
            form.setTitle(_("Port Edit Info"));
        },

        onSubmit: function() {
            var form_grid = this.lookupReference('inventoryFormGrid'),
                form = this.lookupReference('port_edit_form'),
                view = this.getView(),
                controller = this;
            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: 'rest/inventory/res_port/edit',
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
            this.lookupReference('port_edit_form').getForm().reset();
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
        title: _('Port Management'),
        iconCls: 'icon-port_eth',
        reference: 'inventoryFormGrid',
        layout : {
            type : 'vbox',
            align : 'stretch',
            pack : 'start'
        },
        items : [
        {
            xtype: 'form',
            itemId: 'searchForm',
            reference: 'searchCondationForm',
            visible:false,
            hidden:true, 
            border: true,
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
                        fieldLabel: _('Port Index'),
                        name: 'port_index'
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
                        valueField: 'sec_user_id',
                        displayField: 'tenant'
                    }
                    ]
                },
                {
                    xtype: "container",
                    layout: "vbox",
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: _('Port Name'),
                            name: 'userlabel'
                        },
                        {
                            xtype: 'combobox',
                            fieldLabel: _('Running status'),
                            name: 'operstatus',
                            store: {
                                fields: [
                                    {name: 'level', type: 'int'},
                                    {name: 'value', type: 'string'}
                                ],
                                data: [
                                    {"level":0, "value":_('Fault')},
                                    {"level":1, "value":_('Status Normal')}
                                ]
                            },
                            allowBlank : true,// 不允许为空
                            //typeAhead: true,
                            forceSelection: true,//设置必须从下拉框中选择一个值
                            valueField:'level',
                            displayField:'value',
                            emptyText: 'Select a state...',
                            queryMode: 'local'
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
                                store.proxy.url="rest/inventory/res_port/select/page"
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
                                store.proxy.url="rest/inventory/res_port/select/page"
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
            xtype: 'basePortGrid',
            reference: 'portGrid',
            // 绑定到viewModel的属性
            bind: {
                store: '{port_grid_store}',
            },
            listeners: {
                selectionchange: "onselectionchange",
                itemdblclick: 'onItemDoubleClick'
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
                        itemId:"onProperty",
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
                        itemId: "editButton",
                        text: _('Modify'),
                        tooltip : _('Modify'),
                        iconCls:'x-fa fa-edit',
                        hidden:SEC.hidden('0101070101'),
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
                    text: _('Edit'),
                    disabled : true,
                    hidden: true,
                    disabled: true,
                    menu: [
                        {
                            text : _('告警过滤'),
                            tooltip : _('告警过滤'),
                            iconCls : 'property_alarm_filter_menu',
                            disabled : true,
                            hidden: true,
                            bind: {
                                disabled: '{!portGrid.selection}'
                            },
                            handler : function() {
                                Ext.Msg.alert('Operation',"该功能未完善！");
                            }
                        },
                        {
                            text : _('网元管理'),
                            tooltip : _('网元管理'),
                            iconCls : 'property_deviceview_menu',
                            disabled : true,
                            hidden: true,
                            bind: {
                                disabled: '{!portGrid.selection}'
                            },
                            handler : function() {
                               Ext.Msg.alert('Operation',"该功能未完善！");
                            }
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
                        hidden:SEC.hidden('0101070102'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            // var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/res_port/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text:_('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!portGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('0101070103'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('userlabel'));
                                ids.push(records[i].get('port_id'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids.join(",")

                            location.href = "/inventory/res_port/export/datacsv?" + Ext.Object.toQueryString(send_info)
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
                    itemId: "editButton",
                    tooltip : _('Modify'),
                    iconCls : 'property_edit_menu',
                    hidden:SEC.hidden('0101070101'),
                    disabled: true,
                    handler : "onEdit"
                },
                {
                    itemId:"onProperty",
                    tooltip : _('Properties'),
                    iconCls : 'topo_rclick_view_menu',
                    disabled: true,
                    handler : "onProperty"
                },
                {
                    iconCls: 'property_refresh_menu',
                    tooltip : _('Refresh'),
                    handler : 'onRefresh'
                },
                {
                    tooltip:_('Export'),
                    //disabled: true,
                    iconCls:'topo_export_menu_icon',
                    menu: [
                    {
                        text: _('Export All'),
                        tooltip: _('Export All'),
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('0101070102'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            // var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/res_port/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!portGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('0101070103'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];
                            for (var i in records) {
                                names.push(records[i].get('userlabel'));
                                ids.push(records[i].get('port_id'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids.join(",")

                            location.href = "/inventory/res_port/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        }
                    }
                    ]
                }
            ]
        }        
        ]
    },
    {
        title: _("Port Edit Info"),
        xtype: 'form',
        itemId: 'editForm',
        reference: 'port_edit_form',
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
                name: 'port_id'
            },
            {
                xtype: 'textfield',
                fieldLabel: _('Port Name'),
                name: 'userlabel'
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
            },
            {
                xtype: 'textfield',
                fieldLabel: _('Description'),
                name: 'port_desc'
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
