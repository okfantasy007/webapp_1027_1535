Ext.define('Admin.view.alarms.AlarmReparExp.propertyForm', {
    extend: 'Ext.container.Container',
        xtype:'propertyForm',
                items: [
        { 
                xtype: 'form',
                title: _('Basic Info'),
                width : 750,
                height: 200,
                header: true,
                border: true,
                collapsible: true,
                layout: {
                    type: 'table',
                    columns: 2
                },
                fieldDefaults : {
                    width : 250,
                    labelWidth : 90,
                    labelAlign : "right",
                    margin: 10
                },
                items: [

                {
                    xtype: 'textfield',
                    fieldLabel: _('Noter'),
                    name: 'recorder',
                    readOnly: true,

                },
                {
                    xtype: 'textfield',
                    fieldLabel: _('Recording Time'),
                    name: 'record_time',
                    readOnly: true,

                },

                {
                    xtype: 'textarea',
                    fieldLabel: _('Fault Description'),
                    name: 'reason',
                    readOnly: true,

                },
                {
                    xtype: 'textarea',
                    fieldLabel: _('Fault Solution'),
                    name: 'resolve_result',
                    readOnly: true,

                }
                ]
        },
        {
            title: _('History Alarms Related to the Fault'),
            header: true,
            xtype: 'gridpanel',
            //iconCls: 'x-fa fa-circle-o',
            width: 750,
            height: 250,
            border: true,
            autoScroll : true,
            store: {
                autoLoad: true,
                pageSize: 5,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/AlarmRepairExp/getSymptom',
                              extraParams: {experienceid: '0'},
                              actionMethods : {  
                                  create : 'POST',
                                  read   : 'POST',
                                  update : 'POST',
                                  destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
                              },  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        // totalProperty: 'resultSize'
                    }
                }
                    },
            columns: [
                {   xtype: 'rownumberer', width: 60, sortable: true, align: 'center' },
                {
                    text : _('Alarm Name'),
                    dataIndex : 'strName',
                    width : 120,
                    align: 'center',
                    menuDisabled : false
                },{
                    text : _('Alarm Source'),
                    dataIndex : 'strDeviceName',
                    width : 120,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Specific Location'),
                    dataIndex : 'strLocation',
                    width : 100,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Generate Time'),
                    dataIndex : 'strUptime',
                    width : 160,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Device Type'),
                    dataIndex : 'iRCNETypeID',
                    width : 120,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Alarm ID'),
                    dataIndex : 'iRCAlarmLogID',
                    width : 120,
                    align: 'center',
                    menuDisabled : true
                }]
        }
            ]
    });
