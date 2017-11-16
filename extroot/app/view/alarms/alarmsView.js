Ext.define('Admin.view.alarms.alarmsView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'alarmsView',
	
	 requires: [
		'Admin.view.alarms.alarmtype.alarmTypeView',
		'Admin.view.alarms.alarmnotify.alarmNotifyMainView',
		'Admin.view.alarms.alarmfilter.alarmFilterMainView',
        'Admin.view.alarms.alarmcurrent.currentAlarmView',
        'Admin.view.alarms.alarmhistory.historyAlarmView',
        //'Admin.view.alarms.alarmmonitor.alarmGroupMonitorView',
        'Admin.view.alarms.alarmmonitor.alarmMonitorMainPanel',
        'Admin.view.alarms.alarmReverse.alarmReverse',
        'Admin.view.alarms.alarmReverse.AlarmReSet',
        'Admin.view.alarms.alarmReverse.AlarmRePattern',
        'Admin.view.alarms.AlarmReparExp.AlarmReparExp',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncMgtMainView',
        'Admin.view.alarms.queryBookMark.BookMarkButton',
        'Admin.view.alarms.alarmServerConfig.alarmServerConfigGridView',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncTaskMainView',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncStatus',
        'Admin.view.alarms.AlarmSynMgt.AlarmSyncGlobalSet',
        'Admin.view.alarms.alarmStatistics.currentAlarmStatisticsGridView',
        'Admin.view.alarms.alarmStatistics.historyAlarmStatisticsGridView',
        'Admin.view.alarms.alarmAllNeSync.confirmAllNeSync'
        //'Admin.view.alarms.alarmcurrent.realTimeAlarmView'
     ],

    controller: 'alarmsView',
    viewModel: 'alarmsView',    

    items: [{
        xtype: 'leftMenutree',
        menuUrl: '/menu/alarm',
    },
    {
        xtype: 'rightContainer'
    }]
});
