Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSyncMgtMainView', {
    extend: 'Ext.container.Container',
    xtype: 'AlarmSyncMgtMainView',
     
    requires: [
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncContainer',
        'Admin.view.alarms.AlarmSynMgt.AlarmSynTaskForm',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncTaskGrid',
        'Admin.view.alarms.AlarmSynMgt.AlarmSynMgtTree',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncTaskList',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncStatus',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncGlobalSet'
    ],
    // width: 500,
    height: 700,
    
    cls: 'shadow',
    layout: 'border',
    // layout: 'hbox',
	items:[
    {           
        region: 'west',
        // flex: 1,
        width: 250,
        xtype:'AlarmSynMgtTree',
        split: true
    },	
    {
        region: 'center',
        xtype: 'fieldset',
        // title: '操作',
        // flex: 4,
        // autoScroll : true,
        scrollable: 'vertical',
        // defaults: {
        //     anchor: '100%'
        // },
        items: [
        {
        // region: 'center',
            
            xtype:'AlarmSyncContainer', 
            // title: '告警',
            layout:'card', 
            items:[
                {
                    xtype:'AlarmSyncTaskList'
                // xtype:'historyAlarmView'
                
                // flex: 1,
                // margin: '5 0 0 0',
                },
                {
                    xtype:'AlarmSyncTaskGrid'
                // flex: 2,
                // margin: '5 0 0 0',
                },
                {
                    xtype:'AlarmSynTaskForm'
                },
                {
                    xtype:'AlarmSyncStatus'
                },
                {
                    xtype:'AlarmSyncGlobalSet'
                }

            ]
        }
        ]
    }
    
    
    
	]
});