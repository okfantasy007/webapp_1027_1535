
Ext.define('Admin.view.resource.syncmanage.syncTask.baseTask', {
    extend: 'Ext.container.Container',
    requires: 'Admin.view.alarms.AlarmSynMgt.AlarmSynDevicePanel',

    xtype: 'baseTask',
    id:'ressyncTaskForm',
    controller:{
        onReset: function() {
            this.lookupReference('baseForm').getForm().reset();
            
        },

        onCancel: function() {
            this.getView().up().setActiveItem('ressyncTaskGrid');
        },

        onRefresh: function() {
            var Tree =this.getView().up('syncTaskMainView').down('syncTaskTree').lookupReference('taskTree');
            Tree.getStore().reload();
            this.getView().up().down('syncTaskGrid').down('PagedGrid').getStore().reload();
        },
       
        onSubmit: function() {
            var form = this.lookupReference('baseForm');
            controller=this;
            var AlarmSynDevicePanel = this.lookupReference('AlarmSynDevicePanel');
            var symbolID = AlarmSynDevicePanel.getController().getAllSymbolID();
            if(symbolID==undefined){
                Ext.Msg.alert(_('input error'), _('Please select task resource'));
                return;
            }

            var theBasicInfoPanel = this.getView().down('form').down('tabpanel').down('form').getComponent('p_param');
            var fs_time_range = theBasicInfoPanel.getComponent('fs_time_range');
            var isPersist = fs_time_range.getComponent('is_continual_syn').getValue();
            console.log('isPersist', isPersist);
            if(!isPersist) {
                var startDate = fs_time_range.getComponent('startDate').getValue();
                var endDate = fs_time_range.getComponent('endDate').getValue();
                console.log('startDate', startDate.valueOf(), startDate);
                console.log('endDate', endDate.valueOf(), endDate);
                if(startDate.valueOf() >= endDate.valueOf()) {
                    Ext.MessageBox.alert(_('input error'), _('End Time must be bigger than begin time'));
                    return;
                }

                console.log('Date.now()', Date.now());
                if(endDate.valueOf() <= Date.now()) {
                    Ext.MessageBox.alert(_('input error'), _('End Time must be bigger than current time'));
                    return;
                }
            }

            var fs_task_period = theBasicInfoPanel.getComponent('fs_task_period');
            var thePeriodWay = fs_task_period.getComponent('cb_task_period').getValue();
            if(thePeriodWay == 1) {
                fs_task_period.getComponent('EXECUTE_TIME_WEEK').setValue(6);
                console.log('Period way is by day');
            }

            var info = AlarmSynDevicePanel.getController().getAllInfo();
            let isModified = AlarmSynDevicePanel.getController().hasEdited();
            let extrap = isModified ? Ext.JSON.encode(info) : {};
            if(form.getForm().isValid()){
                form.getForm().submit({
                    params:{info: extrap},
                    url: '/resource/syn_task/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        controller.onRefresh();
                        controller.getView().up().setActiveItem('ressyncTaskGrid');
                        Ext.Msg.alert(_('Success'), action.result.msg);
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert(_('Failed'), action.result.msg);
                    }
                });
            }
            else{
                Ext.MessageBox.alert(_('input error'), _('Please Check The Input Content'));
            }   
        }
    },
    items:[
    {
        xtype:'form',
        defaults: {
            anchor: '100%',
            bodyPadding: 10,
        },
        items:[
        {
            xtype:'tabpanel',
            layout:'fit',
            items:[
            {
                title: _('Task Basic Information'),
                xtype: 'form',
                layout: 'hbox',
                msgTarget : 'under',
                reference:'baseForm',

                items:[
                {
                    xtype:'panel',
                    flex:1,
                    itemId: 'p_param',
                    // fieldDefaults: {
                    //     labelAlign: 'right',
                    //     labelWidth: 115,
                        
                    // },
                    items:[
                        {
                            xtype: 'fieldset',
                            title: _('Task Basic Information'),
                            fieldDefaults: {
                                labelAlign: 'right',
                                labelWidth: 115,
                        
                            },
                            defaults: {
                                anchor: '100%',
                               
                            },
                            margin: 10,
                            items:[
                                {
                                    xtype: 'textfield',
                                    name: 'TASK_NAME',
                                    fieldLabel: _('Task Name'),                               
                                    allowBlank: false
                                },
                                {
                                    xtype: 'combo',
                                    name:'TASK_START_TYPE',
                                    editable:false ,
                                    fieldLabel: _('Start Type'),
                                    value:2,
                                    store: {
                                        type: 'array',
                                        fields: [ 'value', 'task_status' ],
                                        data: [
                                            [1,_('Manual')],
                                            [2,_('Automatic')],
                                            [3,_('Disabled')]
                                        ]
                                    },
                                    valueField:'value',
                                    displayField: 'task_status',
                                    queryMode: 'local',
                                    allowBlank: false,
                                    selectOnTab: false,
                                },
                                {                                                                          
                                    xtype: 'combo',
                                    fieldLabel: _('Task Group'),
                                    name: 'SYN_TASK_GROUP_ID',
                                    reference:'SYN_TASK_GROUP_ID',
                                    editable:false ,
                                    store: {
                                        autoLoad: true,             
                                        fields: [
                                            'group_id',
                                            'group_name'
                                        ],
                                        proxy: {
                                            type: 'ajax',
                                            url: '/resource/syn_group_task/task_group_info',
                                            reader: 'array'
                                        }
                                    },             
                                    valueField: 'group_id',
                                    displayField: 'group_name',
                                    queryMode: 'local',
                                    value:1,                           
                                },
                                {
                                    reference:'taskid_textfield',
                                    xtype:'textfield',
                                    name :'SYN_TASK_ID',
                                    hidden:true
                                },
                                {
                                    xtype:'textfield',
                                    fieldLabel:_('Remark task'),
                                    name :'REMARK'
                                }
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            title: _('Task period'),
                            itemId: 'fs_task_period',
                            defaults: {
                                anchor: '100%',
                                allowBlank: false
                            },
                            margin: 10,
                            items:[
                            {
                                xtype: 'combo',
                                itemId: 'cb_task_period',
                                margin: '5 0 10 0',
                                fieldLabel: _('Task period'),
                                reference:'cycle',                               
                                name:'TASK_PERIOD',
                                editable:false ,
                                value: 1,
                                store: {
                                    type: 'array',
                                    fields: [ 'value','task_cycle' ],
                                    data: [
                                        [1,_('EveryDay')],
                                        [2,_('EveryWeek')],                
                                    ]
                                },
                                valueField:'value',
                                displayField: 'task_cycle',  
                                queryMode: 'local',
                                listeners: {
                                    change: function ( self, newValue , oldValue , eOpts ) {
                                        var form = this.up('form');  
                                        if ( newValue==1 ){
                                            form.down('#EXECUTE_TIME_WEEK').setDisabled(true).setVisible(false);
                                        } else{
                                            form.down('#EXECUTE_TIME_WEEK').setDisabled(false).setVisible(true);
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'timefield',
                                itemId: 'EXECUTE_TIME_DAY',
                                increment:5,
                                format:'H:i',
                                name: 'EXECUTE_TIME',
                                fieldLabel: _('Plan run time'),
                                value:'22:00',
                                minValue: '00:00',
                                maxValue: '24:00',
                            },
                            {
                                xtype: 'combo',
                                hidden:true,
                                itemId: 'EXECUTE_TIME_WEEK',
                                margin: '5 0 10 0',
                                editable:false ,
                                fieldLabel: _('nweek'),
                                multiSelect:'true',
                                reference:'res_sync_execute_time_by_week',
                                name:'weekday',
                                value: 6,
                                store: {
                                    type: 'array',
                                    fields: [ 'value','day' ],
                                    data: [
                                        [1,_('Monday')],
                                        [2,_('Tuesday')],
                                        [3,_('Wednesday')],
                                        [4,_('Thursday')],
                                        [5,_('Friday')],
                                        [6,_('Saturday')],
                                        [7,_('Sunday')],         
                                    ]
                                },
                                valueField:'value',
                                displayField: 'day',  
                                queryMode: 'local',
                            }                   
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            title: _('Task valid Time'),
                            itemId: 'fs_time_range',
                            defaults: {
                                anchor: '100%'
                            },
                            margin: 10,
                            items:[
                                {
                                    xtype: 'checkbox',
                                    boxLabel: _('Persist Synchro'),
                                    name:'isContinul',
                                    value: true,
                                    reference: 'isResSyncManagePersist',
                                    itemId: 'is_continual_syn'
                                },
                                {
                                    xtype: 'datefield',
                                    format:'Y-m-d',
                                    editable:false ,
                                    name: 'TASK_EXPIRY_START_TIME',
                                    itemId: 'startDate',
                                    fieldLabel: _('Begin Time'),
                                    value:new Date,
                                    bind:{
                                         readOnly : '{isResSyncManagePersist.checked}'
                                    }
                                },
                                {
                                    xtype: 'datefield',
                                    format:'Y-m-d',
                                    editable:false ,
                                    name: 'TASK_EXPIRY_END_TIME',
                                    itemId: 'endDate',
                                    value:Ext.Date.add(new Date(),Ext.Date.MONTH,1),
                                    fieldLabel: _('End Time'),
                                    bind:{
                                         readOnly: '{isResSyncManagePersist.checked}'
                                    }
                                },
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            title: _('Task Information'),
                            defaults: {
                                anchor: '100%',
                                disabled:'true',
                            },
                            margin: 10,
                            items:[
                                {
                                    xtype: 'combo',
                                    name:'TASK_STATUS',
                                    fieldLabel: _('Task status'),
                                    store: {
                                        type: 'array',
                                        fields: [ 'value', 'task_status' ],
                                        data: [
                                            [1,_('Started')],
                                            [2,_('stopped task')],
                                            [3,_('Invalid')]
                                        ]
                                    },
                                    valueField:'value',
                                    displayField: 'task_status',
                                    queryMode: 'local',
                                    selectOnTab: false,
                                },
                                {
                                    xtype:'textfield',
                                    fieldLabel:_('Last execute time'),
                                    name:'LAST_EXECUTE_TIME',
                                },
                                {
                                    xtype:'textfield',
                                    fieldLabel:_('Create User task'),
                                    name:'CREATE_USER'
                                },
                                {
                                    xtype:'textfield',
                                    fieldLabel:_('Create time'),
                                    name:'CREATE_TIME'
                                },
                            ]
                        }
                    ],
                    
                },
                {
                    xtype:'panel',
                    flex:1,
                    items:[
                    {
                        xtype: 'fieldset',
                        title: _('Task Resource Domain'),
                        scrollable:'y',
                        margin: 10,
                        maxHeight:850,
                        //minHeight : 500,
                        //height: 850,                    
                        items:[
                            {      
                                xtype:'AlarmSynDevicePanel',
                                reference: 'AlarmSynDevicePanel',
                                height: '100%', 
                                margin:5
                            },
                        ]
                    }]
                   
                    
                }       
                ]
            },
            {
                title: _('Differ Model'),
                xtype: 'check_tree', 
               // height:850 ,   
            }
            ]
        },       
        ],
        buttons: [
            {
                text: _('Save'),
                iconCls:'x-fa fa-save',
                width:150,
                handler: 'onSubmit',

            },
            {
                text: _('Cancel'),
                width:150,
                iconCls:'x-fa fa-close',
                handler: 'onCancel',
            },
            
        ]
    }
    ],
});
