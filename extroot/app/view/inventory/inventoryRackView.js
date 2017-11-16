Ext.define('Admin.view.inventory.inventoryRackView', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'inventoryRackView',
    // 指定布局
    layout: 'card',

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            rack_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'rest/inventory/res_rack/select/page',
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
            var grid = this.lookupReference('rackGrid'),
                view = this.getView();
        },
        onToRouteView: function(me , e , eOpts){
            var grid = this.lookupReference('rackGrid'),
                records = grid.getSelectionModel().getSelection(); 
            var root_routeId = window.location.hash.split('/')[0];
            if(records.length > 0){
                var id = records[0].get('rackid');
                var to = me.routeId + '/rackid/' + id;
                console.log(root_routeId,to);
                if (root_routeId && to) {
                    this.redirectTo(root_routeId +'/'+ to);
                } 
            }          
        },
        onAdd: function() {
            var form = this.lookupReference('rack_add_form');
            this.clearForm(form);
            this.getView().setActiveItem( form );
        },
        onEdit: function() {
            var grid = this.lookupReference('rackGrid'),
                form = this.lookupReference('rack_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(true);
            form.down("#saveButtonMenu").setVisible(true);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(false);    
            })
            form.setTitle(_("Rack Edit Info"));
        },
        onProperty: function() {
            var grid = this.lookupReference('rackGrid'),
                form = this.lookupReference('rack_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(false);
            form.down("#saveButtonMenu").setVisible(false);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(true);    
            })
            form.setTitle(_("Rack Properties Info"));
        },
        onDelete: function() {
            var grid = this.lookupReference('rackGrid'),
                records = grid.getSelectionModel().getSelection(),
                names = [], ids=[];
            for (var i in records) {
                names.push(records[i].get('userlabel'));
                ids.push(records[i].get('rackid'));
            }
            Ext.MessageBox.confirm(_('Do you confirm deletion?'), names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'ids', value:  ids.join(',')},
                                {xtype: 'hidden', name: 'names', value:  names.join(',')}
                            ]
                        }).getForm().submit({
                            url: 'rest/inventory/res_rack/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.with_err) {
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
            var grid = this.lookupReference('rackGrid'),
                form = this.lookupReference('searchCondationForm');

            var values = form.getForm().getValues();
            var paging = grid.down('pagingtoolbar');
            paging.moveFirst();

            var store = grid.getStore();

            store.proxy.url= 'rest/inventory/res_rack/select/page',
            store.proxy.extraParams = values;
            store.reload();
        },

        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var form = this.lookupReference('rack_edit_form');
            this.loadFormRecord(form, record);
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

        addRackSubmit: function() {
            var grid = this.lookupReference('inventoryFormGrid'),
                form = this.lookupReference('rack_add_form'),
                view = this.getView(),
                controller = this;

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: 'rest/inventory/res_rack/add',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        Ext.Msg.alert(_('Success'), action.result.data);
                        view.setActiveItem( grid );
                        controller.onRefresh();
                    },
                    failure: function(form, action) {
                        Ext.MessageBox.alert(_('Operation Failure!'), action.result.data);
                    }
                });                
            }
            else {
                 Ext.MessageBox.alert(_('Tip'), _('Please Check The Input Content'));
            }
        },
        addRackCancel: function() {
            this.getView().setActiveItem( this.lookupReference('inventoryFormGrid') );
        },
        addRackReset: function() {
            this.lookupReference('rack_add_form').getForm().reset();
        },

        editRackSubmit: function() {
            var grid = this.lookupReference('inventoryFormGrid'),
                form = this.lookupReference('rack_edit_form'),
                view = this.getView(),
                controller = this;

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: 'rest/inventory/res_rack/edit',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        Ext.Msg.alert(_('Success'), action.result.msg);
                        view.setActiveItem( grid );
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
        editRackCancel: function() {
            this.getView().setActiveItem( this.lookupReference('inventoryFormGrid') );
        },
        editRackReset: function() {
            this.lookupReference('rack_edit_form').getForm().reset();
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
        title: _('Rack Management'),
        iconCls: 'icon-shelves_slot',
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
                        fieldLabel: _('Rack Name'),
                        name: 'userlabel'
                    }, 
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Vendor Name'),
                        name: 'vendor_name'
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
                            xtype: "container",
                            layout: "hbox",
                            padding: '0 0 0 45',
                            items: [// Reset and Submit buttons
                                {
                                    xtype: 'button',
                                    text: _('Reset'),//'重置查询',
                                    iconCls:'search_reset_bnt',
                                    width:70,
                                    // margin: 5,
                                    // margins : '0 30 0 30',
                                    style : 'margin:0px 20px 0px 0px;',
                                    handler: function() {
                                        this.up('form').getForm().reset();
                                        var paging = this.up("form").up("panel").down("grid").down('pagingtoolbar');
                                        paging.moveFirst();

                                        var store = this.up("form").up("panel").down("grid").getStore();

                                        store.proxy.url="rest/inventory/res_rack/select/page"
                                        store.proxy.extraParams = {};
                                        store.reload();
                                    }
                                },
                                {
                                    xtype: 'button',
                                    iconCls:'search_with_condition',
                                    text: _('Search'),
                                    width:70,
                                    // margin: 0 25,
                                    // margins : '0 0 0 30',
                                    handler: function () {
                                        var values = this.up("form").getForm().getValues();
                                
                                        var paging = this.up("form").up("panel").down("grid").down('pagingtoolbar');
                                        paging.moveFirst();

                                        var store = this.up("form").up("panel").down("grid").getStore();

                                        store.proxy.url="rest/inventory/res_rack/select/page"
                                        store.proxy.extraParams = values;
                                        store.reload();
                                    }
                                }
                            ]
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
            reference: 'rackGrid',
            // 绑定到viewModel的属性
            bind: {
                store: '{rack_grid_store}',
            },
            selType: 'checkboxmodel',
            // grid显示字段
            columns: [
                // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
                { xtype: 'hidden', text: '机架ID',  dataIndex: 'rackid', width: 80 },
                { text: _('Rack Name'), dataIndex: 'userlabel', width: 150 },
                // { text: '机架行位置', dataIndex: 'row', width: 100 },
                // { text: '机架列位置', dataIndex: 'col', width: 100 },
                { text: _('Area'), dataIndex: 'area', width: 100 },
                { text: _('Vendor Name'), dataIndex: 'vendor_name', width: 100 },
                { text: _('Remark'), dataIndex: 'remark', width: 100 },
                { text: _('Row'), dataIndex: 'row', width: 60 },
                { text: _('Col'), dataIndex: 'col', width: 60 },
                { text: _('Floor'), dataIndex: 'floor', width: 60 },
                { text: _('Tenant'), dataIndex: 'tenant', width: 100 },
                { text: _('Update Time'), dataIndex: 'update_time', width: 160, 
                    renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s') , flex: 1
                }
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
                activate: 'onActive',
                selectionchange: "onselectionchange"
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
                    //iconCls: 'delete_alarm_btn',
                    autoShow :true,
                    menu: [
                    {
                        itemId: "onProperty",
                        text : _('Properties'),
                        tooltip : _('Properties'),
                        disabled: true,
                        iconCls : 'topo_rclick_view_menu',
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
                        text : _('Add'),
                        tooltip : _('Add'),
                        iconCls : 'topo_device_add_icon',
                        hidden:SEC.hidden('01010204'),
                        handler: 'onAdd'
                    },
                    {
                        itemId: "editButton",
                        text: _('Modify'),
                        tooltip : _('Modify'),
                        iconCls:'x-fa fa-edit',
                        disabled: true,
                        hidden:SEC.hidden('01010201'),
                        handler: 'onEdit' 
                    },
                    {
                        text: _('Delete'),
                        tooltip : _('Delete'),
                        iconCls:'x-fa fa-trash',
                        hidden:SEC.hidden('01010202'),
                        handler: 'onDelete',
                        bind: {
                            disabled: '{!rackGrid.selection}'
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
                    text: _('Resources'),
                    disabled: false,
                    menu: [
                    {
                        itemId:"relatedResources",
                        text : _('Related Resources'),
                        iconCls : 'resource_type_menu',
                        disabled: true,
                        menu: [
                        {
                            text : _('Chassis List'),
                            tooltip :_('Chassis List'),
                            iconCls : 'property_resource_chassis_menu',
                            hidden:SEC.hidden('01010203'),
                            routeId:"chassis",
                            handler : 'onToRouteView'
                        }
                        ]
                    },
                    {
                        text : _('同步'),
                        tooltip : _('同步'),
                        hidden : true,
                        iconCls : 'property_resource_sync_menu',
                        disabled : true,
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
                        hidden:SEC.hidden('01010205'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            // var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/res_rack/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!rackGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01010206'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('userlabel'));
                                ids.push(records[i].get('rackid'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids.join(",")

                            location.href = "/inventory/res_rack/export/datacsv?" + Ext.Object.toQueryString(send_info)
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
                    tooltip : _('Add'),
                    iconCls : 'topo_device_add_icon',
                    hidden:SEC.hidden('01010204'),
                    handler : 'onAdd'
                },
                {
                    itemId: "editButton",
                    tooltip : _('Modify'),
                    iconCls : 'property_edit_menu',
                    hidden:SEC.hidden('01010201'),
                    disabled:true,
                    handler : "onEdit"
                },
                {
                    itemId: "onProperty",
                    tooltip : _('Properties'),
                    iconCls : 'topo_rclick_view_menu',
                    disabled:true,
                    handler : "onProperty"
                },
                {
                    tooltip : _('Delete'),
                    disabled: false,
                    iconCls : 'topo_node_delete_icon',
                    hidden:SEC.hidden('01010202'),
                    handler : "onDelete",
                    bind: {
                        disabled: '{!rackGrid.selection}'
                    } 
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
                        hidden:SEC.hidden('01010205'),
                        handler : function() {
                            var search_form = this.up("panel").up("panel").down("form")
                            var send_info = search_form.getValues();
                            // var send_info = search_form.getValues();
                            send_info.range = "all"

                            location.href = "/inventory/res_rack/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        } 
                    },
                    {
                        text: _('Export Selected'),
                        tooltip: _('Export Selected'),
                        bind: {
                            disabled: '{!rackGrid.selection}'
                        },
                        iconCls: 'property_export_excel_menu',
                        hidden:SEC.hidden('01010206'),
                        handler : function() {
                            var grid = this.up("panel").up("panel").down("grid"),
                            records = grid.getSelectionModel().getSelection(),
                            names = [], ids=[];

                            for (var i in records) {
                                names.push(records[i].get('userlabel'));
                                ids.push(records[i].get('rackid'));
                            }    
                            var send_info = new Object();
                            send_info.range = "part";
                            send_info.selection_condition = ids.join(",")

                            location.href = "/inventory/res_rack/export/datacsv?" + Ext.Object.toQueryString(send_info)
                        }
                    }
                    ]
                }
            ]
        }        
        ]
    },
    {
        title: _("Rack Edit Info"),
        xtype: 'form',
        reference: 'rack_edit_form',
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
                name: 'rackid'
            },
            // 机架名称（userlabel）、
            {
                fieldLabel: _('Rack Name'),
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
                // queryMode:"local",
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
            handler: 'editRackReset',
        },
        {
            text: _('Cancel'),
            iconCls:'x-fa fa-close',
            handler: 'editRackCancel',
        },
        {
            itemId : 'saveButtonMenu',
            text: _('Save'),
            iconCls:'x-fa fa-save',
            handler: 'editRackSubmit',
        }]
    },
    {
        title: _('Add Rack'),
        xtype: 'form',
        reference: 'rack_add_form',
        margin: 10,
        items: [
        {
            xtype: 'fieldset',
            title: _('Basic Information'),
            autoShow: true,
            collapsible: false,
            autoHeight: true,
            autoWidth: true,
            baseCls:"x-fieldset",
            maskDisabled:false,
            margin: 10,
            defaultType: 'textfield',
            fieldDefaults : {
                width : 325,
                labelWidth : 110,
                labelAlign : "right",
                margin : 2
            },
            items: [
            {
                xtype: "container",
                layout: "vbox",
                items: [ 
                {
                    xtype: "container",
                    layout: "vbox",
                    items: [
                    {
                        xtype : 'numberfield',
                        minValue : 0, 
                        fieldLabel: _('Rack ID'),
                        allowBlank: false,
                        allowDecimals:false,  
                        allowNegative :false, //禁止负数
                        htmlActiveErrorsTpl: [
                            '<ul class="{listCls}">',
                            '<li>' + _("Please enter a valid positive integer") + '</li>',
                            '</ul>'
                        ],
                        name: 'rackid'
                    }
                    ]
                },          
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Rack Name'),
                        allowBlank: false,
                        name: 'userlabel'
                    }, 
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Vendor Name'),
                        name: 'vendor_name'
                    }
                    ]
                },
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            xtype: 'datefield',
                            fieldLabel: _('Update Time'),
                            name: 'update_time',
                            format: 'Y-m-d',
                            value: new Date(),
                            maxValue: new Date()
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
                },
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: _('Remark'),
                            name: 'remark'
                        },
                        {
                            xtype : 'numberfield',
                            fieldLabel: _('Row'),
                            minValue : 0,
                            allowDecimals:false, 
                            allowNegative :false, //禁止负数 
                            htmlActiveErrorsTpl: [
                                '<ul class="{listCls}">',
                                '<li>' + _("Please enter a valid positive integer") + '</li>',
                                '</ul>'
                            ],
                            name: 'row'
                        }
                    ]
                },
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: _('Area'),
                            name: 'area'
                        },
                        {
                            xtype : 'numberfield',
                            fieldLabel: _('Col'),
                            allowDecimals:false,
                            allowNegative :false, //禁止负数  
                            minValue : 0,
                            htmlActiveErrorsTpl: [
                                '<ul class="{listCls}">',
                                '<li>' + _("Please enter a valid positive integer") + '</li>',
                                '</ul>'
                            ],
                            name: 'col'
                        }
                    ]
                },
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            xtype : 'numberfield',
                            fieldLabel: _('Rack Num'),
                            allowDecimals:false,  
                            allowNegative :false, //禁止负数
                            minValue : 0,
                            htmlActiveErrorsTpl: [
                                '<ul class="{listCls}">',
                                '<li>' + _("Please enter a valid positive integer") + '</li>',
                                '</ul>'
                            ],
                            name: 'racknum'
                        },
                        {
                            xtype : 'numberfield',
                            fieldLabel: _('Floor'),
                            allowDecimals:false,  
                            allowNegative :false, //禁止负数
                            minValue : 0,
                            htmlActiveErrorsTpl: [
                                '<ul class="{listCls}">',
                                '<li>' + _("Please enter a valid positive integer") + '</li>',
                                '</ul>'
                            ],
                            name: 'floor'
                        }
                    ]
                },
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            xtype : 'numberfield',
                            fieldLabel: _('Height') + "(cm)",
                            minValue : 0,
                            allowNegative :false, //禁止负数
                            htmlActiveErrorsTpl: [
                                '<ul class="{listCls}">',
                                '<li>' + _("Please enter a valid positive integer") + '</li>',
                                '</ul>'
                            ],
                            name: 'floor_height'
                        },
                        {
                            xtype : 'numberfield',
                            fieldLabel: _('Weight')+ "(kg)",
                            allowNegative :false, //禁止负数
                            minValue : 0,
                            htmlActiveErrorsTpl: [
                                '<ul class="{listCls}">',
                                '<li>' + _("Please enter a valid positive integer") + '</li>',
                                '</ul>'
                            ],
                            name: 'carrying_weight'
                        }
                    ]
                }
                ]
            }
            ]
        }],

        buttons: [
        {
            itemId : 'reSetButtonMenu',
            text: _('Reset'),
            iconCls:'x-fa fa-undo',
            handler: 'addRackReset',
        },
        {
            text: _('Cancel'),
            iconCls:'x-fa fa-close',
            handler: 'addRackCancel',
        },
        {
            itemId : 'saveButtonMenu',
            text: _('Save'),
            iconCls:'x-fa fa-save',
            handler: 'addRackSubmit',
        }]
    }
    ]

});
