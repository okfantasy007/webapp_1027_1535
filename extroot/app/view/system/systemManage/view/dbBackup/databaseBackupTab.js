Ext.define('Admin.view.system.systemManage.view.dbBackup.databaseBackupTab', {
	extend: 'Ext.tab.Panel',
    xtype: 'databaseBackupTab',
    requires: [
        'Admin.view.system.systemManage.controller.dbBackup.databaseBackupTab',
        'Admin.view.system.systemManage.view.dbBackup.dbBackupListGrid',
        'Admin.view.system.systemManage.view.dbBackup.dbBackupConfigForm'
    ],
    controller: 'databaseBackupTab',
    itemId: 'databaseBackupTab',
    margin: 10,
    items: [
    	{
             xtype: 'container',
             title: _('Backup Rules'),
             itemId: 'dbBackupConfigForm',
             items: [
            	 {
            		 xtype: 'dbBackupConfigForm'
            	 }
             ]
            
        },
        {
            xtype: 'container',
            title: _('Backup Data'),
            itemId: 'dbBackupListGrid',
            items: [
	           	 {
	           		 xtype: 'dbBackupListGrid'
	           	 }
            ]
       }
    ]
});
