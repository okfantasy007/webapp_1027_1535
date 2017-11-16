Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogConfig.safeLogConfigfieldset', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'safeLogConfigfieldset',
    layout: 'anchor',
    margin: 10,
    items: [
    	{
        	xtype: 'fieldset',
			title:_('Security log forward'),
			//margin: 10,
			defaultType: 'textfield',
			width:407,
			//height: 500,
			defaults: {
				anchor: '100%'
			},
	        items: [
	        	{
	                xtype: 'hidden',
	                name: 'safeLogId',
	                itemId: 'safeLogId'
	            },
	        	{
	                xtype: 'container',
	                margin: '0 0 5 0',
	                items: [
	                	 {
	           	          xtype: 'radiogroup',
	           	          fieldLabel: _('Whether to enable'),
	           	          columns: 2,
	           	          vertical: true,
	           	          itemId: 'safeLogIsEnabled',
	           	          items: [
	           	        	{ boxLabel: _('enabled'), name: 'safeLogIsEnabled', inputValue: 1, checked: true},
	           	            { boxLabel: _('disabled'), name: 'safeLogIsEnabled', inputValue: 0 },
	           	          ]
	               	   },
	                   {
	           	          xtype: 'radiogroup',
	           	          fieldLabel: _('protocolType'),
	           	          columns: 2,
	           	          vertical: true,
	           	          itemId: 'safeLogProctolType',
	           	          items: [
	           	        	{ boxLabel: 'UDP', name: 'safeLogProctolType', inputValue: 0, checked: true},
	           	            { boxLabel: 'TCP', name: 'safeLogProctolType', inputValue: 1 },
	           	          ]
	               	   },
	               	   {
	 		             fieldLabel: _('Syslog server IP'),
	 		             xtype: 'textfield',
	 		             maxLength: 20,
	 		             labelWidth:110,
	 		             itemId: 'safeLogServerIp',
	 		             name:'safeLogServerIp',
	 			         vtype: 'IPAddress',
		 	          },
 	                  {
	 		             fieldLabel: _('Syslog server port'),
	 		             xtype: 'textfield',
	 		             labelWidth:110,
	 		             maxLength: 20,
	 		             itemId: 'safeLogPort',
	 		             name:'safeLogPort',
	 		             regex:/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
				         regexText:_('Please enter the correct port number')
	 	              }
		           ]
		    	}
         ]
      }
    ]
});