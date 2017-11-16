/***
*当前告警及历史告警的查询模块
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmhistory.alarmCheckFormView', {
    extend: 'Ext.form.Panel',
    xtype: 'alarmCheckFormView',
    header: false,
    region:'north',
    border : true,
    autoWidth : true,
    autoHeight : true,
    frame : false,
    autoScroll : true,
    bodyPadding : '5 3 5 3',
    layout:{type:'table',columns:4},
    //visible:false,
    labelAlign : 'right',
    defaultType : 'textfield',
    fieldDefaults : {
        width : 250,
        labelWidth : 90,
        labelAlign : "right",
        margin : 1
    },
    
    bodyStyle: 'border-width:0 0 3px 0; border-color: #D8D8D8;',
    
    /*requires: [
        //'Ext.data.SimpleStore',
        'Admin.view.alarms.alarmhistory.alarmCheckDateDetection'
    ],*/
    viewModel: {
        stores: {
        	levelstore: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['0', _('All Levels')],
                        ['1', _('Critical')],
                        ['2', _('Major')],
                        ['3', _('Minor')],
                        ['4', _('Warning Alarm')],
                        ['5', _('Unknown Alarm')]]
            },

            statusstore: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['0', _('All Status')],
                        ['1', _('Recovered')],
                        ['2', _('New Come')]]
            },

            adminstore: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['-1', _('All Status')],
                        ['0', _('Not Acknowledged')],
                        ['1', _('Acknowledged')]]
            },
            //告警源类型  Alarm Source Category
            alarmsourcetypestore: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['0', _('All Type')],
                        ['1', _('NE')],
                        ['2', _('Chassis')],
                        ['3', _('Card')],
                        ['4', _('Port')],
                        ['5', _('TimeSlot')],
                        ['6', _('Power')],
                        ['7', _('Fan')]]
            },
            //告警分类
            alarmtypestore: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['0', _('All Type')],
                        ['1', _('Equipment alarm')],
                        ['2', _('Quality of service alarm')],
                        ['3', _('Communication alarm')],
                        ['4', _('Environment alarm')],
                        ['5', _('Process error alarm')]]
            },

            hisadminstore: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['-1', _('All Status')],
                        ['0', _('Not Acknowledged')],
                        ['1', _('Acknowledged')],
                        ['2', _('Cleared')],
                        ['3', _('Filtered')]]
            },

            uptime1store: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['0', '>=']]
            },

            uptime2store: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [['0', '<=']]
            }
        }
    },
    controller:{
        onRecordTime1Selected: function(field, value) {
            var onRecordTime2 = this.lookupReference('strUptimeMax');
            onRecordTime2.setMinValue(value);
        },
        onRecordTime2Selected: function(field, value) {
            var onRecordTime1 = this.lookupReference('strUptimeMin');
            onRecordTime1.setMaxValue(value);
        },
    },
    items : [{
        xtype : 'numberfield',
        fieldLabel : _('Alarm ID'),
        name : 'iRCAlarmLogID',
        minValue : 0
    },{
        xtype : "combo",
        fieldLabel : _('Alarm Level'),
        name : 'iLevel',
        bind: {
            store: '{levelstore}'
        },
        displayField : 'text',
        valueField : 'value',
        value : '0',
        mode : 'local',
        editable : false
    }, {
        fieldLabel : _('Alarm Name'),
        name : 'strName'
    },{
        xtype : 'container',
        layout : 'column',
        width : 350,
        items : [{
            xtype : "combo",
            fieldLabel : _('First Report Time'),
            columnWidth : .47,
            name : 'strUptime1',
            bind: {
                store: '{uptime1store}'
            },
            displayField : 'text',
            valueField : 'value',
            value : '0',
            mode : 'local',
            editable : false
        },{
            xtype : 'datetimefield',
            columnWidth : .45,
            editable : false,
            name : 'strUptimeMin',
            itemId: 'strUptimeMin',
            reference:'strUptimeMin',
            //vtype: 'daterange',
            //endDateField: 'strUptimeMax'
            listeners: {
                select: 'onRecordTime1Selected'
            }
        },{
            xtype: 'button',
            tooltip : _('Reset'),
            columnWidth : .08,
            style :'margin-top:2px;',
            iconCls:'search_reset_bnt',
            handler: function(){//'onUptimeMinReset'
                var alarmCheckForm = this.up('alarmCheckFormView');
                alarmCheckForm.getForm().setValues({strUptimeMin: ''});
            }
        }]
    },{
        xtype : 'textfield',
        fieldLabel : _('Alarm Source Name'),
        name : 'strDeviceName'
    },{
        xtype : 'textfield',
        fieldLabel : _('Device Type'),
        name : 'netype_display_name'
    },{
        xtype : 'textfield',
        fieldLabel : _('IP Address'),
        name : 'strIPAddress'
    },{
        xtype : 'container',
        layout : 'column',
        width : 350,
        items : [{
            xtype : "combo",
            fieldLabel : _('First Report Time'),
            columnWidth : .47,
            name : 'strUptime2',
            bind: {
                store: '{uptime2store}'
            },
            displayField : 'text',
            valueField : 'value',
            value : '0',
            mode : 'local',
            editable : false
        },{
            xtype : 'datetimefield',
            columnWidth : .45,
            editable : false,
            name : 'strUptimeMax',
            itemId: 'strUptimeMax',
            reference:'strUptimeMax',
            //vtype: 'daterange',
            //startDateField: 'strUptimeMin'
            listeners: {
                select: 'onRecordTime2Selected'
            }
        },{
            xtype: 'button',
            tooltip : _('Reset'),
            columnWidth : .08,
            style :'margin-top:2px;',
            iconCls:'search_reset_bnt',
            handler: function(){//'onUptimeMinReset'
                var alarmCheckForm = this.up('alarmCheckFormView');
                alarmCheckForm.getForm().setValues({strUptimeMax: ''});
            }
        }]
    },{
        xtype : "combo",
        fieldLabel : _('Alarm Status'),
        name : 'iStatus',
        bind: {
            store: '{statusstore}'
        },
        displayField : 'text',
        valueField : 'value',
        value : '0',
        mode : 'local',
        editable : false,
        forceSelection : true
    },{
        xtype : "combo",
        fieldLabel : _('Operation Status'),
        name : 'admin_status',
        bind: {
            store: '{adminstore}'
        },
        displayField : 'text',
        valueField : 'value',
        value : '-1',
        mode : 'local',
        editable : false
    },{
        xtype : "combo",
        fieldLabel : _('Alarm Source Type'),
        name : 'alarm_source_type',
        bind: {
            store: '{alarmsourcetypestore}'
        },
        displayField : 'text',
        valueField : 'value',
        value : '0',
        mode : 'local',
        editable : false,
        forceSelection : true
    },{
        fieldLabel : _('Gateway Name'),
        name : 'gateway_name',
        width : 348,
    },{
        xtype : "combo",
        fieldLabel : _('Alarm Category'),
        name : 'alarm_event_type',
        bind: {
            store: '{alarmtypestore}'
        },
        displayField : 'text',
        valueField : 'value',
        value : '0',
        mode : 'local',
        editable : false
    },{
        xtype : 'container',
        layout : 'column',
        width : 253,
        items : [{
            xtype : "combo",
            fieldLabel : _('Lasting Time(Min.)'),
            columnWidth : .67,
            name : 'lasttime1',
            bind: {
                store: '{uptime1store}'
            },
            displayField : 'text',
            valueField : 'value',
            value : '0',
            mode : 'local',
            editable : false
        }, {
            xtype : 'numberfield',
            columnWidth : .33,
            name : 'LASTING_TIME_MIN',
            minValue : 0
        }]
    },{
        xtype : 'container',
        layout : 'column',
        width : 253,
        items : [{
            xtype : "combo",
            fieldLabel : _('Lasting Time(Min.)'),
            columnWidth : .67,
            name : 'lasttime2',
            bind: {
                store: '{uptime2store}'
            },
            displayField : 'text',
            valueField : 'value',
            value : '0',
            mode : 'local',
            editable : false,
            emptyText : '<='
        }, {
            xtype : 'numberfield',
            columnWidth : .33,
            name : 'LASTING_TIME_MAX',
            minValue : 0
        }]
    },{
        xtype : 'container',
        layout : 'column',
        width : 430,
        items : [{
            xtype : 'numberfield',
            fieldLabel : _('Alarm Src Location'),
            columnWidth : .40,
            name : 'strLocation',
            minValue : 0,
            emptyText : _('Chassis')
        }, {
            xtype : 'numberfield',
            fieldLabel:_('Chassis'),
            labelWidth : 30,
            labelSeparator:'',
            //fieldStyle:{width:10},
            columnWidth : .26,
            name : 'slot',
            minValue : 0,
            emptyText : _('Slot')
        }, {
            xtype : 'numberfield',
            fieldLabel:_('Slot'),
            labelWidth : 30,
            labelSeparator:'',
            //fieldStyle:{width:10},
            columnWidth : .26,
            name : 'port',
            minValue : 0,
            emptyText : _('Port')
        },{
            xtype:'label',
            labelWidth:30,
            columnWidth : .08,
            html:_('Port'),
            margin:'10 0 0 0'
        }]
    }]
});