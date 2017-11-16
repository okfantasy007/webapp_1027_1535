Ext.define('Admin.view.alarms.alarmnotify.alarmNotifyMainView', {
    extend: 'Ext.container.Container',
    xtype: 'alarmNotifyMainView',
      
    requires: [
        'Admin.view.alarms.alarmnotify.alarmNotifyTreeView',
        'Admin.view.alarms.alarmnotify.alarmNotifyListGridView',
		'Admin.view.alarms.alarmnotify.alarmSmsNotifyView',
		'Admin.view.alarms.alarmnotify.alarmTrapNotifyView',
		'Admin.view.alarms.alarmnotify.alarmSocketNotifyView',
		'Admin.view.alarms.alarmnotify.alarmMailConfigNotifyView',
    ],

    // layout:'fit',
    cls: 'shadow',
	layout: {
        type: 'vbox',
        align: 'stretch'
   	},


	controller: {
	        
	},

	items:[
   		{			
			xtype:'alarmNotifyTreeView',
		//	style: {
		//		background: '#fff'
		//   },
		//	flex: 1
		},
		{
			xtype:'panel',
			reference: 'alarmNotifyPanel',
			layout:'card',
			//flex:7,
			items:[{
				xtype:'alarmNotifyListGridView'
			},
			{
				xtype:'alarmSmsNotifyView'
			},
			{
				xtype:'alarmMailConfigNotifyView'
			},
			{
				xtype:'alarmTrapNotifyView'
			},
			{
				xtype:'alarmSocketNotifyView'
			}]
			
		},
	
	]

});

