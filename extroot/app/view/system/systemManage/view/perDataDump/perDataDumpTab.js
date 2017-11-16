Ext.define('Admin.view.system.systemManage.view.perDataDump.perDataDumpTab', {
	extend: 'Ext.tab.Panel',
    xtype: 'perDataDumpTab',
    requires: [
        'Admin.view.system.systemManage.view.perDataDump.dataRestoreGrid',
        'Admin.view.system.systemManage.view.perDataDump.storagePolicyForm',
        'Admin.view.system.systemManage.view.perDataDump.dumpPolicyForm',
        'Admin.view.system.systemManage.controller.perDataDump.syslogBackupTab'
    ],
    controller: 'syslogBackupTab',
    itemId: 'perDataDumpTab',
    margin: 10,
    items: [
    	{
             xtype: 'container',
             title:  _('Storage Policy'),
             items: [
            	 {
            		 xtype: 'storagePolicyForm'
            	 }
             ]
            
        },
        {
            xtype: 'container',
            title:  _('Dump Strategy'),
            itemId: 'dumpPolicyForm',
            items: [
	           	 {
	           		 xtype: 'dumpPolicyForm'
	           	 }
            ]
       },
       {
           xtype: 'container',
           title:  _('Data Reduction'),
           items: [
	           	 {
	           		 xtype: 'dataRestoreGrid'
	           	 }
           ]
      }
    ]
});
