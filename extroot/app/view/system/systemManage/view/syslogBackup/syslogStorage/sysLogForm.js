Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogStorage.sysLogForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'sysLogForm',
    requires: [
        'Admin.view.system.systemManage.view.syslogBackup.syslogStorage.safeLogfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogStorage.operateLogfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogStorage.loginLogfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogStorage.runLogfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogStorage.sysLogfieldset',
        'Admin.view.system.systemManage.controller.syslogBackup.syslogStorage.sysLogForm'
    ],
    controller: 'sysLogForm',
    itemId: 'sysLogForm',
    layout: 'anchor',
    margin: 10,
    height:600,
    items: [
    	{
            xtype: 'container',
            margin: '0 0 5 0',
            layout: 'hbox',
            items: [
              {
            	  xtype:'safeLogfieldset'
              },
              {
                  xtype: 'panel',
                  flex: 1
              },
              {
          		  xtype:'operateLogfieldset'
          	  },
              {
                  xtype: 'panel',
                  flex: 1
              },
              {
          		  xtype:'runLogfieldset'
          	  }
           ]
    	},
        {
            xtype: 'container',
            margin: '0 0 5 0',
            layout: 'hbox',
            items: [
              {
            	  xtype:'sysLogfieldset'
              },
              {
            	  xtype:'loginLogfieldset'
              }
            ]
        }
    ],
	buttons: [
        {
            text: _('Ok'),
            handler: 'onSysLogBackupSave'
        },
        /*{
            text: '刷新',
            //handler: 'onDBBackupSave'
        }*/
   ],
   listeners: {
	  beforerender: 'onLoadFormData',
   } 
});