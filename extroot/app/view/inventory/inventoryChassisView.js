Ext.define('Admin.view.inventory.inventoryChassisView', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'inventoryChassisView',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            chassis_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'rest/inventory/res_chassis/select/page',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                listeners : {
                    // beforeload :"filterbeforeload"
                    beforeload: function(store, options) {
                        var ary = window.location.hash.split('/');
                        console.log("beforeload:", ary,ary.length);
                        if(ary.length > 2){
                            var new_params = {search_id:ary[2] + "=" + ary[3],type:"web_router"};
                            Ext.apply(store.proxy.extraParams, new_params);
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
        onToRouteView: function(me , e , eOpts){
            var grid = this.lookupReference('chassisGrid'),
                records = grid.getSelectionModel().getSelection(); 
            var root_routeId = window.location.hash.split('/')[0];
            if(records.length > 0){
                var id = records[0].get('chassis_id');
                var base_id = Public.stringToHex(id);  
                var to = me.routeId + '/chassis_id/' + base_id;
                // console.log("chassis_id_onToRouteView",root_routeId,to);
                if (root_routeId && to) {
                    this.redirectTo(root_routeId +'/'+ to);
                } 
            }          
        },
        onActive: function(me, eOpts) {
            var view = this.getView();
            var grid = this.lookupReference('chassisGrid');
            var form = grid.up("panel").down('form');

            var ary = window.location.hash.split('/');
            // console.log("onActive", form, ary,ary.length);
            var paging = grid.down('pagingtoolbar');
                paging.moveFirst();
            var store = grid.getStore();

            if(ary.length > 2){
                store.proxy.url="rest/inventory/res_chassis/select/page"
                store.proxy.extraParams = {search_id:ary[2] + "=" + ary[3],type:"web_router"};
            }
            else{
                var values = form.getForm().getValues();
                store.proxy.url="rest/inventory/res_chassis/select/page"
                store.proxy.extraParams = values;
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
        onEdit: function() {
            var grid = this.lookupReference('chassisGrid'),
                form = this.lookupReference('chassis_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);
            form.down("#reSetButtonMenu").setVisible(true);
            form.down("#saveButtonMenu").setVisible(true);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(false);    
            }) 
            form.setTitle(_('Chassis Edit Info'));
        },
        onProperty: function() {
            var grid = this.lookupReference('chassisGrid'),
                form = this.lookupReference('chassis_edit_form'),
                record = grid.getSelectionModel().getSelection()[0];
            this.loadFormRecord(form, record);

            form.down("#reSetButtonMenu").setVisible(false);
            form.down("#saveButtonMenu").setVisible(false);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(true);    
            })
            form.setTitle(_('Chassis Properties Info'));
        },
        onDelete: function() {
            var grid = this.lookupReference('chassisGrid'),
                records = grid.getSelectionModel().getSelection(),
                names = [], ids=[];
            var form = grid.up("panel").down('form');
            for (var i in records) {
                var record_json ={}
                record_json["chassis_id"] = records[i].get('chassis_id');
                record_json["userlabel"] = records[i].get('userlabel');
                names.push(records[i].get('userlabel'));
                ids.push(record_json);
            }
            Ext.MessageBox.confirm(_('Do you confirm deletion?'), names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        Ext.Ajax.request({
                            url: 'rest/inventory/res_chassis/delete',  //请求地址
                            jsonData :{chassis_ids: ids},
                            success: function(response){
                                var r = Ext.decode(response.responseText)
                                if (r.success) {
                                    Ext.Msg.alert(_('Tips'), r.msg);
                                }
                                else{
                                    Ext.Msg.alert(_('Tips'), r.msg);
                                }
                                var values = form.getForm().getValues();
                                var store = grid.getStore();
                                store.proxy.url = "rest/inventory/res_chassis/select/page"
                                store.proxy.extraParams = values;
                                store.reload();
                            }
                        });
                    } // if 
                }
            );
        },
        onRefresh: function() {
            var grid = this.lookupReference('chassisGrid'),
                form = this.lookupReference('searchCondationForm');
            var values = form.getForm().getValues();
            console.info("onRefresh_values:",values);
            var paging = grid.down('pagingtoolbar');
            paging.moveFirst();

            var store = grid.getStore();

            store.proxy.url="rest/inventory/res_chassis/select/page"
            store.proxy.extraParams = values;
            store.reload();
        },
        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var form = this.lookupReference('chassis_edit_form');
            this.loadFormRecord(form, record);
            form.getForm().getFields().each(function(field) {  
                //设置只读  
                field.setReadOnly(false);    
            }) 
            form.setTitle(_('Chassis Edit Info'));
        },

        onSubmit: function() {
            var form_grid = this.lookupReference('inventoryFormGrid'),
                form = this.lookupReference('chassis_edit_form'),
                view = this.getView(),
                controller = this;

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/rest/inventory/res_chassis/edit',
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
            this.lookupReference('chassis_edit_form').getForm().reset();
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
        title:_('Chassis Management'),
        iconCls: 'icon-shelves_box',
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
                        fieldLabel: _('Chassis Name'),
                        name: 'userlabel'
                    }, 
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Chassis index'),
                        name: 'chassis_index'
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
                            xtype: 'combobox',
                            fieldLabel: _('IsExisting'),
                            name: 'isexisting',
                            store: {
                                fields: [
                                    {name: 'level', type: 'int'},
                                    {name: 'value', type: 'string'}
                                ],
                                data: [
                                    {"level":0, "value":_('Lost')},
                                    {"level":1, "value":_('Exist')}
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
                                store.proxy.url="rest/inventory/res_chassis/select/page"
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
                                store.proxy.url="rest/inventory/res_chassis/select/page"
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
            reference: 'chassisGrid',
            // 绑定到viewModel的属性
            bind: {
                store: '{chassis_grid_store}',
            },
            selType: 'checkboxmodel',
            // grid显示字段
            columns: [
                { xtype: 'hidden', text: '机箱ID',  dataIndex: 'chassis_id', width: 150 },
                { text: _('Belong Ne'), dataIndex: 'ne_userlabel', width: 120 },
                { text: _('Ne Type'), dataIndex: 'netype_userlabel', width: 100},
                { text: _('Chassis Name'), dataIndex: 'userlabel', width: 150 },
                { text: _('Fixed Name'), dataIndex: 'chassis_fix_name', width: 120 },
                { text: _('Chassis Type'), dataIndex: 'chassis_type_name', width: 135 },
                { text: _('Chassis index'), dataIndex: 'chassis_index', width: 80 },
                { 
                    text: _('IsExisting'), dataIndex: 'isexisting', width: 80,
                    menuDisabled: true,
                    renderer: function getColor(v,m,r){
                        if (r.get('isexisting') == 1) {
                            m.tdCls = 'resourcestate_on';
                            return _('Exist');
                        }
                        else {
                            m.tdCls = 'resourcestate_off';
                        }
                        return _('Lost');
                    }
                },
                { 
                    xtype: 'hidden', text: '告警状态', dataIndex: 'alarmstate', width: 80,
                    menuDisabled: true,
                    renderer: function getColor(v,m,r){
                        if (r.get('alarmstate') == 0) {
                            m.tdCls = 'resourcestate_on';
                            return _("正常");
                        }
                        else {
                            m.tdCls = 'resourcestate_off';
                        }
                        return _("异常");
                    }
                },
                { text: _('Chassis Temperature'), dataIndex: 'temperature', width: 80 },
                // { text: '机箱资产编号', dataIndex: 'serial', width: 100 },
                { text: _('Chassis Desc'), dataIndex: 'chassis_desc', width: 100 },
                { xtype: 'hidden', text: _('Chassis Desc'), dataIndex: 'desc_info', width: 100 },
                { text: _('Tenant'), dataIndex: 'tenant', width: 100 },
                { text: _('Update Time'), dataIndex: 'update_time', width: 160, 
                    renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s')  
                },
                { menuDisabled: true, flex: 1},

                {xtype: 'hidden',text: '网元ID', dataIndex: 'neid', width: 120},
                {xtype: 'hidden',text: '机架ID', dataIndex: 'rackid', width: 120},
                {xtype: 'hidden',text: '机箱类型ID', dataIndex: 'chassis_type_id', width: 120},
                {xtype: 'hidden',text: _('Chassis Name'), dataIndex: 'chassis_name', width: 150 },
                {xtype: 'hidden',text: 'Friendly name', dataIndex: 'userlabel', width: 120},
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
                        itemId: "onProperty",
                        text : _('Properties'),
                        tooltip : _('Properties'),
                        iconCls : 'topo_rclick_view_menu',
                        disabled : true,
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
                        itemId: "editButton",
                        text: _('Modify'),
                        tooltip : _('Modify'),
                        iconCls:'x-fa fa-edit',
                        hidden:SEC.hidden('01010301'),
                        disabled : true,
                        handler: 'onEdit'  
                    },
                    {
                        text: _('Delete'),
                        tooltip : _('Delete'),
                        iconCls:'x-fa fa-trash',
                        hidden:SEC.hidden('01010302'),
                        handler: 'onDelete',
                        bind: {
                            disabled: '{!chassisGrid.selection}'
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
                    //iconCls: 'config_apply_btn',
                    disabled: false,
                    menu: [
                    {
                        itemId:"relatedResources",
                        text : _('Related Resources'),
                        iconCls : 'resource_type_menu',
                        disabled: true,
                        menu: [
                        {
                            text : _('Local Card List'),
                            tooltip : _('Local Card List'),
                            iconCls : 'property_resource_card_menu',
                            hidden:SEC.hidden('01010303'),
                            routeId: 'card', 
                            handler : "onToRouteView"
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
                    text: '定位', 
                    //iconCls: 'config_apply_btn',
                    disabled: false,
                    hidden : true,
                    menu: [
                    {
                        text : _('拓扑定位'),
                        tooltip : _('拓扑定位'),
                        iconCls : 'property_topo_location_menu',
                        bind: {
                            disabled: '{!chassisGrid.selection}'
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
                            tooltip:_('Export All'),
                            iconCls: 'property_export_excel_menu',
                            hidden:SEC.hidden('01010304'),
                            handler : function() {
                                var search_form = this.up("panel").up("panel").down("form")
                                var send_info = search_form.getValues();
                                // var send_info = search_form.getValues();
                                send_info.range = "all"

                                location.href = "/inventory/res_chassis/export/datacsv?" + Ext.Object.toQueryString(send_info)
                            } 
                        },
                        {
                            text: _('Export Selected'),
                            tooltip: _('Export Selected'),
                            bind: {
                                disabled: '{!chassisGrid.selection}'
                            },
                            iconCls: 'property_export_excel_menu',
                            hidden:SEC.hidden('01010305'),
                            handler : function() {
                                var grid = this.up("panel").up("panel").down("grid"),
                                    records = grid.getSelectionModel().getSelection(),
                                    names = [], ids=[];

                                for (var i in records) {
                                    names.push(records[i].get('userlabel'));
                                    ids.push(records[i].get('chassis_id'));
                                }    
                                var send_info = new Object();
                                send_info.range = "part";
                                send_info.selection_condition = ids.join(",")

                                location.href = "/inventory/res_chassis/export/datacsv?" + Ext.Object.toQueryString(send_info)
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
            xtype: 'toolbar',
            hidden:true,
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
                    itemId: "editButton",
                    tooltip : _('Modify'),
                    iconCls : 'property_edit_menu',
                    hidden:SEC.hidden('01010301'),
                    disabled:true,
                    handler : "onEdit"
                },
                {
                    itemId: "onProperty",
                    tooltip : _('Properties'),
                    iconCls : 'topo_rclick_view_menu',
                    disabled:true,
                    handler: 'onProperty'
                },
                {
                    tooltip : _('Delete'),
                    disabled: false,
                    iconCls : 'topo_node_delete_icon',
                    hidden:SEC.hidden('01010302'),
                    handler : "onDelete",
                    bind: {
                        disabled: '{!chassisGrid.selection}'
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
                            hidden:SEC.hidden('01010304'),
                            handler : function() {
                                var search_form = this.up("panel").up("panel").down("form")
                                var send_info = search_form.getValues();
                                // var send_info = search_form.getValues();
                                send_info.range = "all"

                                location.href = "/inventory/res_chassis/export/datacsv?" + Ext.Object.toQueryString(send_info)
                            } 
                        },
                        {
                            text: _('Export Selected'),
                            tooltip: _('Export Selected'),
                            bind: {
                                disabled: '{!chassisGrid.selection}'
                            },
                            iconCls: 'property_export_excel_menu',
                            hidden:SEC.hidden('01010305'),
                            handler : function() {
                                var grid = this.up("panel").up("panel").down("grid"),
                                    records = grid.getSelectionModel().getSelection(),
                                    names = [], ids=[];

                                for (var i in records) {
                                    names.push(records[i].get('userlabel'));
                                    ids.push(records[i].get('chassis_id'));
                                }    
                                var send_info = new Object();
                                send_info.range = "part";
                                send_info.selection_condition = ids.join(",")

                                location.href = "/inventory/res_chassis/export/datacsv?" + Ext.Object.toQueryString(send_info)
                            }
                        }
                    ]
                }
            ]
        }        
        ]
    },
    {
        title: _('Chassis Edit Info'),
        xtype: 'form',
        reference: 'chassis_edit_form',
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
                name: 'chassis_id'
            },
            {
                fieldLabel: _('Chassis Name'),
                allowBlank: true,
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
                fieldLabel: _('Chassis Desc'),
                name: 'chassis_desc'
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
