Ext.define('Admin.view.alarms.alarmfilter.alarmFilterMainView', {
    extend: 'Ext.container.Container',
    xtype: 'alarmFilterMainView',
      
    requires: [
        'Admin.view.alarms.alarmfilter.alarmLevelFilterView',
		'Admin.view.alarms.alarmfilter.alarmTypeFilterView',
		'Admin.view.alarms.alarmfilter.alarmDeviceFilterView',
		'Admin.view.alarms.alarmfilter.alarmChassisFilterView',
		'Admin.view.alarms.alarmfilter.alarmCardFilterView',
		'Admin.view.alarms.alarmfilter.alarmPortFilterView',
		'Admin.view.alarms.alarmfilter.alarmTimeFilterView',
		'Admin.view.alarms.alarmfilter.alarmFilterTreeView',
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
			xtype:'alarmFilterTreeView',
		},
		{
			xtype:'panel',
			reference: 'alarmFilterPanel',
			layout:'card',
			autoScroll:true,
			flex: 7,
			items:[{
				xtype:'alarmLevelFilterView'
			},
			{
				xtype:'alarmTypeFilterView'
			},
			{
				xtype:'alarmDeviceFilterView'
			},
			{
				xtype:'alarmChassisFilterView'
			},
			{
				xtype:'alarmCardFilterView'
			},
			{
				xtype:'alarmPortFilterView'
			},
			{
				xtype:'alarmTimeFilterView',
			}]
			
		},
	
	]

});

