var contr_status ;

Ext.define('Admin.view.resource.polling.pollingGrid', {
    extend: 'Ext.container.Container',
    xtype:'pollingGrid',
    requires: [
        'Admin.view.base.PagedGrid'
    ],
    cls: 'shadow',
    bodyPadding: 10,
    viewModel: {
        stores: {
            // 远程store
            poll_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 25,
                proxy: {
                    type: 'ajax',
                    url: '/resource/polling_task/device_poll',
                    extraParams: {time: 300},
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty : 'total'
                    },
                }
            },
        }
    },
    controller: {
        onRender: function() {
            var tb = this.getView().down('PagedGrid').down('toolbar');
            Ext.Ajax.request({
                url: '/resource/polling_task/control',
                success: function(response, opts) {
                    var obj = Ext.decode(response.responseText);
                    console.log('obj.status', obj.status);
                    if(obj.status == 'start') {
                        tb.getComponent('placeholder').setHidden(true);
                        tb.getComponent('Stopped').setHidden(true);
                        tb.getComponent('Started').setHidden(false);
                        tb.getComponent('Start').setDisabled(true);
                        tb.getComponent('Stop').setDisabled(false);
                    } else {
                        tb.getComponent('placeholder').setHidden(true);
                        tb.getComponent('Stopped').setHidden(false);
                        tb.getComponent('Started').setHidden(true);
                        tb.getComponent('Start').setDisabled(false);
                        tb.getComponent('Stop').setDisabled(true);
                    }
                },
                failure: function(response, opts) {
                    console.log('get polling status failed');
                }
            });
        },

        onChange: function (me, newValue, oldValue, ops) {
            var grid = this.lookupReference('grid');
            var store = grid.getStore();
            store.proxy.extraParams = {time: newValue};
            store.reload();
        },

        onStart: function() {
            this.setTaskStatus('start');
        },

        onStop: function() {
            this.setTaskStatus('stop');
        },

        setTaskStatus: function(status) {
            var tb = this.getView().down('PagedGrid').down('toolbar');
            Ext.Ajax.request({
                url:'/resource/polling_task/control',
                params:{status: status},
                success: function(response) {
                    if(status == 'start') {
                        tb.getComponent('placeholder').setHidden(true);
                        tb.getComponent('Stopped').setHidden(true);
                        tb.getComponent('Started').setHidden(false);
                        tb.getComponent('Start').setDisabled(true);
                        tb.getComponent('Stop').setDisabled(false);
                    } else {
                        tb.getComponent('placeholder').setHidden(true);
                        tb.getComponent('Stopped').setHidden(false);
                        tb.getComponent('Started').setHidden(true);
                        tb.getComponent('Start').setDisabled(false);
                        tb.getComponent('Stop').setDisabled(true);
                    }
                },
                failure: function(response, opts) {
                    Ext.Msg.alert(_('Failed'), _('operation failed'));
                }
            });   
        },

        onRefresh: function() {
            this.onRender();
            this.getView().down('PagedGrid').getStore().reload();
        },

        onClick: function(self , record , item , index , e , eOpts ) {
            e.preventDefault();  
            e.stopEvent();
            if (index < 0) {
                return;
            }
            
            var me = this;
            // Do something
            var hiddenPosition = false;
            var grid = this.getView().down('PagedGrid');
            var records = grid.getSelectionModel().getSelection();
            if(records.length>1){
                hiddenPosition = true;
            }
            
            var ids=records.map(function(oneRecord) {
                return oneRecord.get('neid');
            });
            Ext.Ajax.request({
                url: 'rest/security/securityManagerCenter/getResAuthorizeOpertion',
                method: 'POST',
                params : {
                    jsonObject: {res_type: record.data.res_type_name, res_id: record.data.res_id, map_hierarchy: record.data.map_hierarchy, create_user: record.data.create_user},
                    funids: ['01030403', 'yy'],
                    user: APP.user
                },
                success: function(response){
                    var r = Ext.decode(response.responseText);
                    var result = r.result;
                    if (r.error) {
                        Ext.MessageBox.alert('Message', r.msg);
                    }
                    if (r.success) {
                        var menu = new Ext.menu.Menu();
                        menu.add({
                            text: _('topo position'),
                            hidden: hiddenPosition,
                            disabled: !result['01030403'],
                            iconCls: 'x-fa fa-map-marker',
                            handler: function(){
                                var symbolid = records[0].get('symbol_id');
                                window.location = "#topology/home/" + symbolid;
                            },
                        }, 
                        '-',
                        {
                            text: _('60 s'),
                            iconCls:'fa fa-clock-o fa-2x',
                            handler:function(){
                                me.modifyPeriod(ids, 60, grid);
                            }
                        },
                        {
                            text: _('5 min'),
                            iconCls:'fa fa-clock-o fa-2x',
                            handler:function(){
                                me.modifyPeriod(ids, 300, grid);
                            }
                        }, 
                        {
                            text: _('15 min'),
                            iconCls:'fa fa-clock-o fa-2x',
                            handler:function(){
                                me.modifyPeriod(ids, 900, grid);
                            }
                        }, 
                        {
                            text: _('30 min'),
                            iconCls:'fa fa-clock-o fa-2x',
                            handler:function(){
                                me.modifyPeriod(ids, 1800, grid);
                            }
                        }, 
                        {
                            text: _('60 min'),
                            iconCls:'fa fa-clock-o fa-2x',
                            handler:function(){
                                me.modifyPeriod(ids, 3600, grid);
                            }
                        }, 
                        '-',
                        {
                            text: _('No Poll'),
                            iconCls:'fa fa-times-circle-o fa-2x',
                            handler:function(){
                                me.modifyPeriod(ids, 0, grid);
                            }
                        });
                        menu.showAt(e.getPoint());
                    }
                }
            });
        },
        
        modifyPeriod: function(ids, period, grid) {
            Ext.Ajax.request({
                url:'/resource/polling_task/period',
                params:{ids: ids.join(',') , time: period},
                success: function(response) {
                    grid.store.reload();
                    // Ext.Msg.alert(_('Success'), _('Successful operation'));
                },
                failure: function(response, opts) {
                    Ext.Msg.alert(_('Failed'), _('operation failed'));
                }
            });
        }
    },

    items:[{
        xtype: 'PagedGrid',
        title: _('Poll Device List'),
        reference:'grid',
        cls: 'shadow',
        iconCls: 'x-fa fa-circle-o',    
        selType: 'checkboxmodel',
        columnLines : true,
        rowLines : true,
        bind: {
            store: '{poll_store}',
        },

        columns: [
            { text: _('Device ID'),  dataIndex: 'neid', width: 80 },
            { text: _('IP Address'), dataIndex: 'ipaddress', width: 150 },
            { text: _('Online Status'), dataIndex: 'resourcestate', width: 100,
                    menuDisabled: true,
                    renderer: function getColor(v,m,r){
                        if(r.get('resourcestate') == 1 ){
                            m.tdCls = 'resourcestate_on';
                            return _("Online");
                        }
                        else{
                            m.tdCls = 'resourcestate_off';
                        }
                        return _("Offline");
                    }
                },
            { text: _('Device Type'),  dataIndex: 'userlabel', width: 80 },
            { text: _('Polling Protocol'),  dataIndex: 'south_protocol', width: 80 ,
                 renderer: function (v,m,r){
                        if (v == 0) {
                            return 'Unknow';
                        }
                        if (v == 1) {
                            return  'SNMP';
                        }
                        if(v ==2){
                            return 'TR069';
                        }
                        
                        if(v ==3){
                            return 'NETCONF';
                        }
                        if(v ==4){
                            return 'Openflow';
                        }
                        
                        return v;
                    } 
            },
            { text: _('Polling Time'), dataIndex: 'last_polling_time', width: 200,
                renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s') },
            { text: _('Polling Duration (s)'),  dataIndex: 'last_polling_duration', flex: 1 },
        ],

        pagingbarDock: 'top',
            // 默认每页记录数
        pagingbarDefaultValue: 25,
            // 分页策略
        pagingbarConfig: {
            fields: [{name: 'val', type: 'int'}],
            data: [
            {val: 25},
            {val: 50},
            {val: 100},
            {val: 200},
            {val: 500},
            ]
        },

        listeners: {
            itemcontextmenu: 'onClick',
            render: 'onRender'
        },  
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                _('Running status') + ':',
                {
                    text: _('Started'),                
                    itemId: 'Started',
                    iconCls:'x-fa fa-refresh fa-spin',
                    style:{
                        backgroundColor: '#ccff99',
                        border: 'solid 0px',
                    },
                    hidden: true,
                    margin: '0 40 0 0'
                },    
                {
                    text: _('Stopped'),
                    itemId: 'Stopped',
                    iconCls:'x-fa fa-square',
                    style:{
                        backgroundColor: '#ff9999',
                        border: 'solid 0px',
                    },
                    hidden: true,
                    margin: '0 40 0 0'
                }, 
                {
                    text: '',
                    itemId: 'placeholder',
                    margin: '0 40 0 0'
                },    
                {
                    text: _('Start'),
                    itemId: 'Start',
                    iconCls:'x-fa fa-play',
                    hidden: SEC.hidden('01030401'),
                    handler: 'onStart',
                    disabled: true
                },
                {
                    text: _('Stop'),
                    itemId: 'Stop',
                    iconCls:'x-fa fa-stop',
                    hidden: SEC.hidden('01030402'),
                    handler: 'onStop',
                    disabled: true,
                    margin: '0 40 0 0'
                },
                {
                    xtype: 'combobox',
                    reference: 'states',
                    //width: 80,
                    //padding: '0 0 0 5',
                    publishes: 'value',
                    fieldLabel: _('Polling Interval'),
                    displayField: 'state',
                    valueField:'time',
                    editable: false,
                    value:'300',
                    //anchor: '-15',
                    store: {
                        type: 'array',
                        fields: ['abbr', 'state','time'],
                        data: [
                            [0,_("60 s"),60],
                            [1,_('5 min'),300],
                            [2, _('15 min'),900],
                            [3, _('30 min'),1800],
                            [4, _('60 min'),3600],
                            [5, _('No Poll'),0],
                            ]
                    },
                    minChars: 0,
                    queryMode: 'local',                   
                    listeners:{
                        change:'onChange'
                        
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
    }] 
});


