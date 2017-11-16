//定义controller
Ext.define('Admin.view.config.sdn.dhcpServerView', {
    extend: 'Ext.container.Container',
    xtype: 'dhcpServerView',

    layout: 'card',

    cls: 'shadow',// 指定panel边缘的阴影效果

    viewModel: {
        stores: {
            // 远程store
            pool_store: {
                id:"pool_store",
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/dhcpServer/pools',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        // totalProperty: 'totalCount'// 不写则已，写则必须与后台保持一致
                    }
                }
            },
            pool_addr_store :{
                id:"pool_addr_store",
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/config/sdn/dhcpServer/ips',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }

        }
    },

    controller: {

        pool_info:{},//存放选中的地址池

        getAddPoolPanel:function (type) {

           var form = Ext.create('Ext.form.Panel', {
                itemId: 'dhcpFrom',
                frame: true,
                bodyPadding: 10,
                autoScroll: true,
                defaultType: 'textfield',
                fieldDefaults: {
                    labelAlign: 'right',
                    labelWidth: 120,
                    labelStyle: 'padding-left:0px;',
                    msgTarget: 'side'
                },
                layout: 'anchor',
                defaults: {
                    anchor:'95%'
                },
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel:_('Pool name'),
                        allowBlank: false,
                        readOnly: (type == 'add'? false : true),
                        name: 'pool_name'
                    }, {
                        xtype: 'numberfield',
                        name: 'vlan',
                        allowDecimals:false ,
                        minValue: 1,
                        maxValue: 4094,
                        allowBlank: false,
                        readOnly: (type == 'add'? false : true),
                        fieldLabel: _('Pool VLAN')
                    }, {
                        xtype: 'textfield',
                        name: 'start_ip',
                        allowBlank: false,
                        regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                        readOnly: (type == 'add'? false : true),
                        fieldLabel: _('Pool start IP')
                    },{
                        xtype: 'textfield',
                        name: 'end_ip',
                        allowBlank: false,
                        regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                        readOnly: (type == 'add'? false : true),
                        fieldLabel: _('Pool end IP')
                    },{
                        xtype: 'textfield',
                        name: 'mask_address',
                        allowBlank: false,
                        regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                        readOnly: (type == 'add'? false : true),
                        fieldLabel: _('Mask address')
                    },{
                        xtype: 'textfield',
                        name: 'gateway',
                        allowBlank: false,
                        regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)($|(?!\.$)\.)){4}$/,
                        readOnly: (type == 'add'? false : true),
                        fieldLabel: _('Gateway')
                    },{
                        xtype: 'combobox',
                        store: Ext.create('Ext.data.Store', {
                            autoLoad: true,
                            proxy: {
                                type: 'ajax',
                                url: '/config/sdn/eline/getcontrollerinfo',
                                reader: {
                                    type: 'json',
                                    rootProperty: 'data'
                                }
                            }
                        }),
                        displayField: 'controllerIPPort',
                        valueField: 'controllerIPPort',
                        name: 'controllerinfo',
                        allowBlank: false,
                        editable: true,
                        value: '',
                        readOnly: (type == 'add'? false : true),
                        fieldLabel: _('Controller IP port')
                    }],
                buttons: [
                    {
                        text: _('Cancel'),
                        iconCls: 'x-fa fa-remove',
                        handler: function() {this.up('window').close();}
                    },
                    {
                        text: _('Submit'),
                        iconCls: 'x-fa fa-save',
                        hidden: (type == 'add'? false : true),
                        handler: function() {
                            var win = this.up('window');
                            var form = this.up('form').getForm();

                            if (!form.isValid()) {
                                Ext.MessageBox.alert(_('Tip'), _('Incorrect input parameter'));
                                return;
                            }

                            var poolInfo = form.getValues();

                            form.submit({
                                url: '/config/sdn/dhcpServer/create',
                                /*waitTitle : _('Please wait...'),
                                waitMsg : _('Please wait...'),*/
                                success: function(form, action) {
                                    var grid = Ext.getCmp('foolGridId');//Ext.StoreMgr.get('pool_store');
                                    var store = grid.getStore();
                                    store.reload();
                                    win.close();
                                },
                                failure: function(form, action) {
                                    var msg = Ext.decode(action.response.responseText).msg;

                                    switch (msg) {
                                        case 'ip pool Conflict null':
                                        {
                                            msg = _('OverlapIPErrMsg');
                                            form.findField('end_ip').markInvalid(msg);
                                        }
                                            break;
                                        case 'ip pool name repetition null':
                                        {
                                            msg = _('RepeateNameErrMsg');
                                            form.findField('pool_name').markInvalid(msg);
                                        }
                                            break;
                                        case 'start ip and end ip are not in the same segment null':
                                        {
                                            msg = _('IPSegmentErrMsg');
                                            form.findField('end_ip').markInvalid(msg);
                                        }
                                            break;
                                        case 'start ip is not smaller than end ip null':
                                        {
                                            msg = _('IPRangeErrMsg');
                                            form.findField('start_ip').markInvalid(msg);
                                        }
                                            break;
                                        default:
                                        {
                                            msg = _('ConnectErrMsg');
                                            Ext.MessageBox.alert(_('Tip'), msg);
                                        }
                                    }
                                }
                            });
                        }
                    }
                ]
            });

            return form;
        },

        addPool: function(){
            var form_panel = this.getAddPoolPanel('add');
            var combobox = form_panel.down('combobox');
            var win = Ext.widget('window', {
                title: _('Create Address Pool'),
                iconCls: 'x-fa fa-plus',
                border: false,
                layout: 'fit',
                width: 500,
                height: 450,
                minWidth: 500,
                minHeight: 450,
                resizable: false,
                modal: true,
                items: form_panel
            });
            win.show();

            combobox.getStore().load({
                callback: function(records, operation, success) {
                    if(records && records.length > 0){
                        combobox.setValue(records[0].get('controllerIPPort'));
                    }
                }
            });
        },

        modifyPool:function(){
            var grid = this.lookupReference('foolGrid'),
                sel = grid.getSelectionModel(),
                store =grid.getStore();

            if (sel.getCount() == 0) {
                Ext.MessageBox.alert(_('Tip'), _('Please select a record'));
                return;
            }
            var grid_rec = sel.getSelection()[0],
                store_rec = store.findRecord('pool_id', grid_rec.get('pool_id'));

            var form_panel = this.getAddPoolPanel('view');
            form_panel.getForm().setValues(store_rec.data);

            var win = Ext.widget('window', {
                title: _('View'),
                iconCls: "x-fa fa-edit",
                border: false,
                layout: 'fit',
                width: 500,
                height: 450,
                minWidth: 500,
                minHeight: 450,
                resizable: true,
                modal: true,
                items: form_panel
            });
            win.show();
        },

        delPool:function() {
            var grid = this.lookupReference('foolGrid');
            var recrods = grid.getSelectionModel();
            if (recrods.getCount() == 0) {
                Ext.MessageBox.alert(_('Tip'), _('Select at least one record!'));
                return;
            }

            var ipGrid = this.lookupReference('addressGrid');
            var pool_id = recrods.getSelection()[0].data['pool_id'];

            Ext.MessageBox.confirm(_('Tip'), _('Are you sure to delete it?'), function (btn) {
                if (btn == 'yes') {
                    Ext.create('Ext.form.Panel', {
                        items: [
                            {xtype: 'hidden', name: 'ids', value:  pool_id}
                        ]
                    }).getForm().submit({
                        url: '/config/sdn/dhcpServer/delete',
                        success: function(form, action) {
                            if (action.result.success==false) {
                                Ext.Msg.alert(_('With Errors'), action.result.msg);
                            } else {
                                Ext.Msg.alert(_('Success'), action.result.msg);
                            }
                            grid.store.reload();
                            var ipStore=ipGrid.store;
                            ipStore.proxy.extraParams = {pool_id:pool_id};
                            ipStore.reload();
                        },
                        failure: function(form, action) {
                            Ext.Msg.alert(_('Tips'), action.result.msg);
                        }
                    });
                }
            });
        },

        refreshPool:function(){
            var grid = this.lookupReference('foolGrid');
            var store = grid.getStore();
            store.reload();
            this.onIpRefresh();
        },

        onPoolSelect:function (form, record, index, eOpts) {
            var grid = this.lookupReference('addressGrid');
            var pool_id = {
                'pool_id': record.get('pool_id')
            };

            this.pool_info['pool_id'] = record.get('pool_id');

            var text = grid.down('#pool_address_name');
            text.setText(_('Pool name')+': ' + record.data['pool_name']);

            var useRateField = grid.down('#pool_address_rate');
            var userRate = Math.floor(record.data['use_count']/record.data['total_count'] * 100) ;
            userRate = isNaN(userRate)?0:userRate;
            var color = 'green';
            if(userRate >= 80){
                color = 'red';
            }else if(userRate >= 60){
                color = 'orange';
            }else{
                color = 'green';
            }

            useRateField.setText(_('Usage rate')+" : " + userRate + '%');
            useRateField.setStyle({'background':'green','color':'#ffffff'})

            var unUseField = grid.down('#pool_address_unused');
            var unUseCount = parseInt(record.data['total_count']) - parseInt(record.data['use_count']);
            unUseField.setText(_('Unused number')+" : " + unUseCount);

           this.onIpRefresh();
        },

        onRelease:function(){
            var grid = this.lookupReference('addressGrid');
            var sel = grid.getSelectionModel();

            if(sel.getCount() <1){
                Ext.MessageBox.alert(_('Tip'), _('Please select a record')+"！");
                return;
            }

            var selectData = sel.getSelection();

            var releaseData = {
                'pool_id': selectData[0].data['pool_id'],
                'ips': []
            };
            for (var i = 0; i < selectData.length; i++) {
                var data = selectData[i].data;
                releaseData['ips'].push({"release_ip":data['ip_addr']});
            }

            Ext.create('Ext.form.Panel', {
                items: []
            }).getForm().submit({
                url: '/config/sdn/dhcpServer/release',
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                jsonSubmit: true,
                params: releaseData,
                success: function(form, action) {
                    if (action.result.success==false) {
                        Ext.Msg.alert(_('With Errors'), action.result.msg);
                    } else {
                        Ext.Msg.alert(_('Success'), action.result.msg);
                    }
                    var ipStore=grid.store;
                    ipStore.proxy.extraParams = {pool_id:selectData[0].data['pool_id']};
                    ipStore.reload();
                },
                failure: function(form, action) {
                    Ext.Msg.alert(_('Tips'), action.result.msg);
                }
            });
        },

        onIpRefresh:function(){
            if(this.pool_info && this.pool_info.pool_id ) {
                var ipGrid = this.lookupReference('addressGrid');
                var ipStore = ipGrid.store;
                ipStore.proxy.extraParams = {pool_id: this.pool_info.pool_id};
                ipStore.reload();
            }
        }
    },

    items: [
        {
            xtype: 'panel',
            title: _('Address Pool List'),
            iconCls: 'x-fa fa-th',
            reference: 'mainFormGrid',
            //baseStyle: "margin: -50px 0px 0px -10px",内层样式
            //style:margin: -50px 0px 0px -10px",外层样式
            layout : 'border',
            border: false,
            height:600,
            items:[
                {
                    xtype: 'panel',
                    region: 'north',
                    layout: 'fit',
                    border: false,
                    split: true,
                    height: 300,
                    items: [
                        {
                            xtype: 'grid',
                            reference: 'foolGrid',
                            id:"foolGridId",
                            // 绑定到viewModel的属性
                            bind: {
                                store: '{pool_store}',
                            },
                            // selType: 'checkboxmodel',
                            selModel:Ext.create('Ext.selection.CheckboxModel', {
                                mode: 'SINGLE',
                                listeners: {
                                    //selectionchange:"onselectionchange"
                                }
                            }),
                            emptyText: _('No data to display'),
                            columnLines: true,
                            //height: 300,
                            columns: [
                                { text: _('Pool name'), dataIndex: 'pool_name', flex:1, menuDisabled: true},
                                { text: _('Pool VLAN'), dataIndex: 'vlan', flex:1, menuDisabled: true },
                                { text: _('Pool start IP'), dataIndex: 'start_ip', flex:1, menuDisabled: true },
                                { text: _('Pool end IP'), dataIndex: 'end_ip', flex:1, menuDisabled: true   },
                                { text: _('Mask address'), dataIndex: 'mask_address', flex:1, menuDisabled: true},
                                { text: _('Gateway'), dataIndex: 'gateway', flex:1, menuDisabled: true},
                                { text: _('Controller IP port'), dataIndex: 'controllerinfo', flex:1, menuDisabled: true}
                            ],
                            dockedItems: [{
                                xtype: 'toolbar',
                                items: [
                                    /*{
                                        xtype: 'component',
                                        html: ' 地址池列表',
                                        cls: 'x-fa fa-th',
                                        margin: '0 25 0 5'},
                                    '-',*/
                                    {
                                        itemId: 'addButton',
                                        text:_('Create'),
                                        tooltip: _('Create'),
                                        iconCls:'x-fa fa-plus',
                                        disabled: false,
                                        handler: "addPool"
                                    },
                                    {
                                        itemId: 'viewButton',
                                        text:_('Detail'),
                                        tooltip:_('Detail'),
                                        iconCls:'x-fa fa-desktop',
                                        bind: {
                                            disabled: '{!foolGrid.selection}',
                                        },
                                        handler: "modifyPool"
                                    },
                                    {
                                        itemId: 'deleteButton',
                                        text:_('Delete'),
                                        tooltip:_('Delete'),
                                        iconCls:'x-fa fa-trash',
                                        bind: {
                                            disabled: '{!foolGrid.selection}',
                                        },
                                        handler: "delPool"
                                    },
                                    '->',
                                    {
                                        text:_('Refresh'),
                                        tooltip:_('Refresh'),
                                        iconCls:'x-fa fa-refresh',
                                        handler: "refreshPool"
                                    }]
                            }],
                            listeners: {
                                select: "onPoolSelect",
                                //selectionchange: function(sm, selections) {}
                            },
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    region: 'center',
                    layout: 'fit',
                    split: true,
                    flex:1,
                    border: false,
                    items: [
                        {
                            xtype: 'grid',
                            border: false,
                            reference: 'addressGrid',
                            bind: {
                                store: '{pool_addr_store}',
                            },
                            selModel: Ext.create('Ext.selection.CheckboxModel'),
                            columnLines: true,
                            emptyText: _('No data to display'),
                            columns: [
                                {
                                    text: _('IP Address'),
                                    dataIndex: 'ip_addr',
                                    flex: 1,
                                    menuDisabled: true,
                                    sortable: true},
                                {
                                    text: _('Usage Status'),
                                    dataIndex: 'ip_status',
                                    flex: 1,
                                    menuDisabled: true,
                                    sortable: true,
                                    renderer: function (value) {
                                        if (value == 'unallocate') {
                                            return _('Unassigned');
                                        } else if (value == 'allocate') {
                                            return _('Assigned');
                                        } else {
                                            return _('Pre-assigned');
                                        }
                                    }
                                },
                                {
                                    text: _('Customer ID'),
                                    dataIndex: 'mac',
                                    flex: 1,
                                    menuDisabled: true,
                                    sortable: true,
                                    renderer: function (value) {
                                        return value == 0 ? null : value;
                                    }
                                },
                                {
                                    text: _('Offline time'),
                                    dataIndex: 'logout_time',
                                    flex: 1,
                                    menuDisabled: true,
                                    sortable: true,
                                    renderer: function (value) {
                                        return value == 0 ? null : value;
                                    }
                                },
                                {
                                    text: _('Release advice'),
                                    dataIndex: 'isRelease',
                                    flex: 1,
                                    menuDisabled: true,
                                    sortable: true,
                                    renderer: function (value) {
                                        return (value == 'true') ? _('DhcpRelease'):_('Not Release');
                                    }
                                }
                            ],
                            dockedItems: [{
                                xtype: 'toolbar',
                                items: [
                                    {
                                        xtype: 'label',
                                        itemId: 'pool_address_name',
                                        html: '  '+_('Pool name')+' : ',
                                        //cls: 'x-fa fa-th',
                                        margin: '0 25 0 5'
                                    },
                                    {
                                        xtype: 'label',
                                        itemId: 'pool_address_rate',
                                        html: ' '+_('Usage rate')+' : ',
                                        //cls: 'x-fa fa-th',
                                        margin: '0 25 0 5'
                                    },
                                    {
                                        xtype: 'label',
                                        itemId: 'pool_address_unused',
                                        html: ' '+_('Unused number')+' : ',
                                        //cls: 'x-fa fa-th',
                                        margin: '0 25 0 5'
                                    },
                                    {
                                        itemId: 'editButton',
                                        text: _('DhcpRelease'),
                                        tooltip: _('DhcpRelease'),
                                        iconCls: 'x-fa fa-wrench',
                                        disabled: false,
                                        handler: "onRelease"
                                    },
                                    '->',
                                    {
                                        text: _('Refresh'), tooltip: _('Refresh'), iconCls: 'x-fa fa-refresh',
                                        handler: "onIpRefresh"
                                    }
                                ]
                            }]
                        }
                    ]
                },
            ]
        }
    ],
})
