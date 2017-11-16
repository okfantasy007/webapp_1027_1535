Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogConfig.loginLogConfigfieldset', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'loginLogConfigfieldset',
    layout: 'anchor',
    margin: 10,
    items: [
    	{
        	xtype: 'fieldset',
			title:_('Login log forward'),
			defaultType: 'textfield',
			width:407,
			defaults: {
				anchor: '100%'
			},
	        items: [
	        	{
	                xtype: 'hidden',
	                name: 'loginLogId',
	                itemId: 'loginLogId'
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
	           	          itemId: 'loginLogIsEnabled',
	           	          items: [
	           	        	{ boxLabel: _('enabled'), name: 'loginLogIsEnabled', inputValue: 1, checked: true},
	           	            { boxLabel: _('disabled'), name: 'loginLogIsEnabled', inputValue: 0 },
	           	          ]
	               	   },
	                   {
	           	          xtype: 'radiogroup',
	           	          fieldLabel: _('protocolType'),
	           	          columns: 2,
	           	          vertical: true,
	           	          itemId: 'loginLogProctolType',
	           	          items: [
	           	        	{ boxLabel: 'UDP', name: 'loginLogProctolType', inputValue: 0, checked: true},
	           	            { boxLabel: 'TCP', name: 'loginLogProctolType', inputValue: 1 },
	           	          ]
	               	   },
	               	   {
	 		             fieldLabel: _('Syslog server IP'),
	 		             xtype: 'textfield',
	 		             maxLength: 20,
	 		             labelWidth:110,
	 		             itemId: 'loginLogServerIp',
	 		             name:'loginLogServerIp',
	 			         vtype: 'IPAddress'
		 	          },
 	                  {
	 		             fieldLabel: _('Syslog server port'),
	 		             xtype: 'textfield',
	 		             itemId: 'loginLogPort',
	 		             labelWidth:110,
	 		             maxLength: 20,
	 		             name:'loginLogPort',
	 		             regex:/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
				         regexText:_('Please enter the correct port number'),
	 	              }
		           ]
		    	}
	       ]
      }
    ]
});