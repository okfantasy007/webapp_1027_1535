Ext.define('Admin.view.inventory.basemodel.neEditForm', {
    extend: 'Ext.form.Panel',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    xtype: 'ne_edit_form',
    margin: 10,
    fieldDefaults: {
        labelWidth: 85,//最小宽度  55
        labelAlign: "right",
    },// The fields
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
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            xtype: 'hidden',
                            fieldLabel: _('Ne ID'),
                            name: 'neid',
                            allowBlank: false
                        },
                        {
                            xtype: "container",
                            layout: "vbox",
                            items: [
                                {
                                    xtype: 'textfield',
                                    fieldLabel: _('Ne Name'),
                                    allowBlank: false,
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
                                    // bind:{store:'{res_neTenantStore}'},
                                    // allowBlank: true,// 不允许为空
                                    // forceSelection: true,//设置必须从下拉框中选择一个值
                                    valueField: 'sec_user_id',
                                    displayField: 'tenant'
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: _('SSH Port'),
                                    allowBlank: false,
                                    allowDecimals: false, // 是否允许小数
                                    allowNegative: false, // 是否允许负数
                                    name: 'ssh_port'
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "vbox",
                            items: [
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: _('Longitude'),
                                    allowDecimals: true, // 是否允许小数
                                    decimalPrecision: 6, // 小数位精度
                                    allowNegative: true, // 是否允许负数
                                    maxValue: 180,
                                    minValue: -180,
                                    name: 'longitude'
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: _('Latitude'),
                                    allowDecimals: true, // 是否允许小数
                                    decimalPrecision: 6, // 小数位精度
                                    allowNegative: true, // 是否允许负数
                                    maxValue: 90,
                                    minValue: -90,
                                    name: 'latitude'
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: _('Telnet Port'),
                                    // style:'margin-top:10px',
                                    allowBlank: false,
                                    allowDecimals: false, // 是否允许小数
                                    allowNegative: false, // 是否允许负数
                                    name: 'telnet_port'
                                }
                            ]
                        },
                        {
                            itemId:"upNePortController",
                            visible:false,
                            hidden:true,
                            disabled: true,   
                            xtype: "container",
                            layout: "vbox",
                            items: [
                                {
                                    xtype : 'container',
                                    layout : 'column',
                                    items : [
                                        {
                                            itemId:"up_ne_name",
                                            xtype: "textfield",
                                            name: "uplink_port_nename" ,
                                            symbol_id:-1,
                                            columnWidth : .80,
                                            xtype: 'textfield',
                                            readOnly:true,
                                            disabled:true,
                                            labelWidth: 85,
                                            fieldLabel:_("UpLink Ne"),
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls:'search_subnet_btn',
                                            columnWidth : .2,
                                            handler: function() {
                                                var controller_up_ne = this.up("container").down("#up_ne_name");
                                                var win = Ext.widget('window', {
                                                    title: _('选择'),
                                                    border: false,
                                                    layout: 'fit',
                                                    width: 280,
                                                    height: 450,
                                                    resizable: true,
                                                    modal: true,
                                                    items: {
                                                        xtype: 'treepanel',
                                                        multiSelect: false,
                                                        rootVisible: false,
                                                        split: true,
                                                        lines: true,
                                                        scrollable: true,
                                                        emptyText : _('Empty'),
                                                        store : {
                                                            fields : [{
                                                                name : 'symbol_id'
                                                            }, {
                                                                name : 'text',
                                                                type : 'string'
                                                            }],
                                                            autoLoad: true,
                                                            proxy: {
                                                                type: 'ajax',
                                                                url: '/topo/topo_tree/tree',
                                                                extraParams: {symbol_id: 0},
                                                                reader: {
                                                                    type: 'json'
                                                                }
                                                            }
                                                        },
                                                        listeners: {
                                                            beforeitemexpand: function(node,optd){ 
                                                                // console.log('nodeExpand', node);
                                                                var symbolId=node.data.symbol_id; 
                                                                 if(symbolId!=0&&!isNaN(symbolId)){
                                                                    var childcount=node.childNodes.length;
                                                                    for(var i=0;i<childcount;i++){
                                                                        node.childNodes[0].remove();
                                                                    }
                                                                    Ext.Ajax.request({
                                                                        url: '/topo/topo_tree/tree?symbol_id=' + symbolId,
                                                                        success: function(response){
                                                                            var r=Ext.decode(response.responseText).children;
                                                                            
                                                                            for(var i=0;i<r.length;i++){
                                                                                node.appendChild(r[i]);
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            },
                                                            beforeitemcollapse: function(node,optd){  
                                                                // console.log('nodeCollapse', node);
                                                                var symbolId=node.data.symbol_id; 
                                                                if(symbolId!=0&&!isNaN(symbolId)){
                                                                    var childcount=node.childNodes.length;
                                                                    for(var i=0;i<childcount-1;i++){
                                                                        node.removeChild(node.childNodes[i]);
                                                                    }
                                                                }
                                                            },
                                                        },
                                                        buttons: [
                                                            {
                                                                text: _('Cancel'),
                                                                iconCls: 'x-fa fa-close',
                                                                handler: function() {
                                                                    this.up("window").close();
                                                                }
                                                            },
                                                            {
                                                                itemId: 'saveButtonMenu',
                                                                text: _('Save'),
                                                                iconCls: 'x-fa fa-save',
                                                                handler: function() {
                                                                    controller_up_ne.setDisabled(false);
                                                                    var select_node = this.up("window").down("treepanel").getSelectionModel().getSelection();
                                                                    console.info("select_node:",select_node);
                                                                    if(select_node.length > 0 && select_node[0].data.res_type_name == "NE"){
                                                                        controller_up_ne.setValue(select_node[0].data.symbol_name1);
                                                                        controller_up_ne.symbol_id = select_node[0].data.symbol_id;
                                                                    }
                                                                    this.up("window").close();
                                                                }
                                                            }
                                                        ]
                                                    }
                                                });
                                                win.show();
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype : 'container',
                                    // disabled:true,
                                    style:'margin-top:10px',  
                                    layout : 'column',
                                    items : [
                                        {
                                            itemId:"uplink_port",
                                            xtype: 'hidden',
                                            name: "uplink_port"
                                        },
                                        {
                                            itemId:"down_link_port",
                                            xtype: "textfield",
                                            name: "uplink_port_name" ,
                                            columnWidth : .80,
                                            disabled:true,
                                            xtype: 'textfield',
                                            readOnly:true,
                                            labelWidth: 85,
                                            fieldLabel:_("Down Port"),
                                        },
                                        {
                                            xtype: 'button',
                                            iconCls:'search_subnet_btn',
                                            columnWidth : .2,
                                            handler: function() {
                                                var controller_up_ne = this.up("form").down("#up_ne_name");
                                                var down_link_port = this.up("container").down("#down_link_port");
                                                var uplink_port = this.up("container").down("#uplink_port");
                                                console.info("controller_up_ne:",controller_up_ne);
                                                if(controller_up_ne.symbol_id != -1){
                                                    var win = Ext.widget('window', {
                                                        title: _('选择'),
                                                        border: false,
                                                        layout: 'fit',
                                                        width: 280,
                                                        height: 450,
                                                        resizable: true,
                                                        modal: true,
                                                        items: {
                                                            xtype: 'treepanel',
                                                            multiSelect: false,
                                                            rootVisible: false,
                                                            split: true,
                                                            lines: true,
                                                            scrollable: true,
                                                            emptyText : _('Empty'),
                                                            store : {
                                                                fields : [{
                                                                    name : 'port_fix_name'
                                                                }, {
                                                                    name : 'text',
                                                                    type : 'string'
                                                                }],
                                                                autoLoad: true,
                                                                proxy: {
                                                                    type: 'ajax',
                                                                    url: '/inventory/down_link_port/tree',
                                                                    extraParams: {ne_id: controller_up_ne.symbol_id},
                                                                    reader: {
                                                                        type: 'json'
                                                                    }
                                                                }
                                                            },
                                                            buttons: [
                                                                {
                                                                    text: _('Cancel'),
                                                                    iconCls: 'x-fa fa-close',
                                                                    handler: function() {
                                                                        this.up("window").close();
                                                                    }
                                                                },
                                                                {
                                                                    itemId: 'saveButtonMenu',
                                                                    text: _('Save'),
                                                                    iconCls: 'x-fa fa-save',
                                                                    handler: function() {
                                                                        down_link_port.setDisabled(false);
                                                                        var select_node = this.up("window").down("treepanel").getSelectionModel().getSelection();
                                                                        console.info("select_node:",select_node);
                                                                        if(select_node.length > 0){
                                                                            down_link_port.setValue(select_node[0].data.text);
                                                                            uplink_port.setValue(select_node[0].data.id);
                                                                        }
                                                                        this.up("window").close();
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    });
                                                    win.show();
                                                }
                                                else{
                                                    Ext.Msg.alert(_('Tips'), "请先设置上联端口！");
                                                }
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
            itemId:"offLineCheck",
            xtype: 'fieldset',
            title: _('Off Grid Inspection'),
            margin: 10,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },
            items: [
                {
                    xtype: "container",
                    layout: "hbox",
                    items: [
                        {
                            itemId:"poll_enabled",
                            xtype: 'checkboxfield',
                            uncheckedValue : 0,
                            boxLabel: _('Offline Detecting'),
                            checked: false,
                            name:"poll_enabled",
                            listeners: {
                                change: function (me, newValue, oldValue, eOpts) {
                                    var poll_protocol = this.up("form").down("#poll_protocol");
                                    var poll_interval = this.up("form").down("#poll_interval");
                                    console.info("newValue:",newValue);
                                    if(newValue == true){
                                        poll_protocol.setVisible(true).setDisabled(false);
                                        poll_interval.setVisible(true).setDisabled(false);
                                    }
                                    else{
                                        poll_protocol.setVisible(false).setDisabled(true);
                                        poll_interval.setVisible(false).setDisabled(true);
                                    }
                                }
                            }
                        },
                        {
                            itemId:"poll_protocol",
                            xtype: 'combobox',
                            fieldLabel: _('Inspection Way'),
                            editable:false,
                            name: 'poll_protocol',
                            store:Ext.create('Ext.data.Store', {
                                fields: [
                                    {name: 'level', type: 'int'},
                                    {name: 'poll_protocol', type: 'string'}
                                ],
                                data: [
                                    {"level":1, "poll_protocol":_('SNMP Ping')},
                                    {"level":0, "poll_protocol":_('ICMP Ping')},
                                    {"level":3, "poll_protocol":_('NETCONF')}
                                ]
                            }),
                            value:1,
                            valueField: 'level',
                            displayField: 'poll_protocol'
                        },
                        {
                            itemId:"poll_interval",
                            xtype: 'combobox',
                            fieldLabel: _('Polling Interval(sec.)'),
                            editable:false,
                            name: 'poll_interval',
                            store:Ext.create('Ext.data.Store', {
                                fields: [
                                    {name: 'level', type: 'int'},
                                    {name: 'poll_interval', type: 'string'}
                                ],
                                data: [
                                    {"level":60, "poll_interval":_('60 s')},
                                    {"level":300, "poll_interval":_('5 min')},
                                    {"level":900, "poll_interval":_('15 min')},
                                    {"level":1800, "poll_interval":_('30 min')},
                                    {"level":3600, "poll_interval":_('60 min')}
                                ]
                            }),
                            value:1800,
                            valueField: 'level',
                            displayField: 'poll_interval'
                        }
                    ]
                }
            ]
        },
        {
            itemId:"protocolController",
            xtype: 'checkboxfield',
            boxLabel: _('Whether to edit SNMP protocol'),
            checked: false,
            name:"protocolController",
            hidden:true,
            margin: 10,
            listeners: {
                change: function (me, newValue, oldValue, eOpts) {
                    var selectProtocolState = this.up("form").down("#snmpTemplate");
                    if(newValue == 1){
                        selectProtocolState.setVisible(true).setDisabled(false);
                    }
                    else{
                        selectProtocolState.setVisible(false).setDisabled(true);
                    }
                }
            }
        },
        {
            itemId:"snmpTemplate",
            visible:false,
            hidden:true,
            disabled: true,     
            xtype: 'fieldset',
            title: _('SNMP Template Settings'),
            margin: 10,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },
            items: [
            {
                xtype: 'numberfield',
                fieldLabel: _('Port'),
                // value: 163,
                minValue: 1,
                maxValue: 65535,                
                allowBlank: false,
                name: 'snmp_port',
            },
            {
                xtype: 'numberfield',
                fieldLabel: _('Timeout'),
                // value: 56,
                minValue: 1,
                maxValue: 3600,                
                allowBlank: false,
                name: 'timeout',
            },
            {
                xtype: 'numberfield',
                fieldLabel: _('Retries'),
                // value: 1,
                minValue: 1,
                maxValue: 1000,                
                allowBlank: false,
                name: 'retries',
            },
            {
                xtype: 'radiogroup',
                fieldLabel: _('SNMP Version'),
                items: [
                    {name: 'version',boxLabel: 'v1', inputValue: '1', reference: 'snmpv1'},
                    {name: 'version',boxLabel: 'v2c', inputValue: '2', checked: true, reference: 'snmpv2c'},
                    {name: 'version',boxLabel: 'v3', inputValue: '3', reference: 'snmpv3'},
                ]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    hideEmptyLabel: false
                },
                bind: {
                    hidden: '{snmpv3.checked}',
                },
                items: [
                {
                    xtype: 'textfield',
                    fieldLabel: _('Read Community'),
                    emptyText: _('Read Community'),
                    value: 'public',
                    maxLength: 64,
                    name: 'community_read'
                }, 
                {
                    xtype: 'textfield',
                    fieldLabel: _('Write Community'),
                    emptyText: _('Write Community'),
                    value: 'private',
                    maxLength: 64,
                    name: 'community_write'
                }
                ]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    hideEmptyLabel: false
                },
                bind: {
                    hidden: '{!snmpv3.checked}'
                },
                items: [
                {
                    xtype: 'textfield',
                    fieldLabel: _('Context name'),
                    emptyText: _('Context name'),
                    maxLength: 128,
                    value: '',
                    name: 'v3contextName'
                }, 
                {
                    xtype: 'textfield',
                    fieldLabel: _('Security name'),
                    emptyText: _('Security name'),
                    maxLength: 64,
                    name: 'v3securityName'
                }, 

                {
                    xtype: 'radiogroup',
                    fieldLabel: _('Security level'),
                    items: [
                        {name: 'v3securityLevel', boxLabel: _('noAuth,noPriv'), inputValue: 'noAuthNoPriv', reference: 'noAuthNoPriv', checked: true},
                        {name: 'v3securityLevel', boxLabel: _('Auth,noPriv'), inputValue: 'authNoPriv', reference: 'authNoPriv'},
                        {name: 'v3securityLevel', boxLabel: _('Auth,Priv'), inputValue: 'authPriv', reference: 'authPriv'},
                    ]
                },

                {
                    xtype: 'container',
                    layout: 'hbox',
                    margin: '0 0 10',
                    items: [{
                        xtype: 'fieldset',
                        flex: 1,
                        title: _('Authentication'),
                        defaultType: 'radio', // each item will be a checkbox
                        bind: {
                            // disabled: '{noAuthNoPriv.checked}',
                            hidden: '{noAuthNoPriv.checked}',
                        },

                        layout: 'anchor',
                        defaults: {
                            anchor: '100%',
                            hideEmptyLabel: false
                        },
                        items: [
                        {
                            checked: true,
                            fieldLabel: _('Authentication protocol'),
                            boxLabel: 'MD5',
                            name: 'v3authProtocol',
                            inputValue: 'MD5'
                        },
                        {
                            boxLabel: 'SHA',
                            name: 'v3authProtocol',
                            inputValue: 'SHA'
                        },
                        {
                            xtype: 'textfield',
                            name: 'v3authKey',
                            fieldLabel: _('Password'),
                            emptyText: _('Password'),
                            maxLength: 64
                        }]
                    }, 
                    {
                        xtype: 'component',
                        width: 10
                    }, 
                    {
                        xtype: 'fieldset',
                        flex: 1,
                        title: _('Privacy'),
                        defaultType: 'radio', // each item will be a radio button
                        bind: {
                            // disabled: '{!authPriv.checked}',
                            hidden: '{!authPriv.checked}',
                        },

                        layout: 'anchor',
                        defaults: {
                            anchor: '100%',
                            hideEmptyLabel: false
                        },
                        items: [
                        {
                            checked: true,
                            fieldLabel: _('Privacy protocol'),
                            boxLabel: 'DES',
                            name: 'v3privProtocol',
                            inputValue: 'DES'
                        },
                        {
                            boxLabel: 'AES',
                            name: 'v3privProtocol',
                            inputValue: 'AES'
                        },
                        {
                            xtype: 'textfield',
                            name: 'v3privKey',
                            fieldLabel: _('Password'),
                            emptyText: _('Password'),
                            maxLength: 64
                        }
                        ]
                    }]
                }

                ]
            }
            ]
        }
    ]
});