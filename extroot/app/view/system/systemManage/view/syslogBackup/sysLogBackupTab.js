Ext.define('Admin.view.system.systemManage.view.syslogBackup.sysLogBackupTab', {
	extend: 'Ext.tab.Panel',
    xtype: 'sysLogBackupTab',
    requires: [
        'Admin.view.system.systemManage.view.syslogBackup.syslogStorage.sysLogForm',
        'Admin.view.system.systemManage.view.syslogBackup.syslogConfig.sysLogConfigForm',
        'Admin.view.system.systemManage.view.syslogBackup.syslogBackup.sysLogBackupForm'
    ],
    //controller: 'syslogBackupTab',
    itemId: 'sysLogBackupTab',
    margin: 10,
    items: [
    	{
             xtype: 'container',
             title: _('Log Storage Policy'),
             items: [
            	 {
            		 xtype: 'sysLogForm'
            	 }
             ]
            
        },
        {
            xtype: 'container',
            title: _('Log Backup Strategy'),
            itemId: 'sysLogBackupForm',
            items: [
	           	 {
	           		 xtype: 'sysLogBackupForm'
	           	 }
            ]
       },
       {
           xtype: 'container',
           title: _('Syslog Configuration'),
           items: [
	           	 {
	           		 xtype: 'sysLogConfigForm'
	           	 }
           ]
      }
    ]
});
