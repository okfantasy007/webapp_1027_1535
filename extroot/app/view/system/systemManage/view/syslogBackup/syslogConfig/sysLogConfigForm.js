Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogConfig.sysLogConfigForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'sysLogConfigForm',
    requires: [
        'Admin.view.system.systemManage.view.syslogBackup.syslogConfig.safeLogConfigfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogConfig.operateLogConfigfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogConfig.loginLogConfigfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogConfig.runLogConfigfieldset',
        'Admin.view.system.systemManage.view.syslogBackup.syslogConfig.sysLogConfigfieldset',
        'Admin.view.system.systemManage.controller.syslogBackup.syslogConfig.sysLogConfigForm'
    ],
    controller: 'sysLogConfigForm',
    itemId: 'sysLogConfigForm',
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
            	  xtype:'safeLogConfigfieldset'
              },
              {
                  xtype: 'panel',
                  flex: 1
              },
              {
          		  xtype:'operateLogConfigfieldset'
          	  },
              {
                  xtype: 'panel',
                  flex: 1
              },
              {
          		  xtype:'runLogConfigfieldset'
          	  }
           ]
    	},
        {
            xtype: 'container',
            margin: '0 0 5 0',
            layout: 'hbox',
            items: [
              {
            	  xtype:'sysLogConfigfieldset'
            	 
              },
              {
            	  xtype:'loginLogConfigfieldset'
              }
            ]
        }
    ],
	buttons: [
        {
            text: _('Ok'),
            handler: 'onSysLogConfigSave'
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