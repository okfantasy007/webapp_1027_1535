Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogConfig.sysLogConfigfieldset', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'sysLogConfigfieldset',
    layout: 'anchor',
    margin: 10,
    items: [
    	{
        	xtype: 'fieldset',
			title:_('Syslog log forward'),
			margin: '0 0 5 7',
			defaultType: 'textfield',
			width:407,
			defaults: {
				anchor: '100%'
			},
	        items: [
	        	{
	                xtype: 'hidden',
	                name: 'sysLogId',
	                itemId: 'sysLogId'
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
	           	          itemId: 'sysLogIsEnabled',
	           	          items: [
	           	        	{ boxLabel: _('enabled'), name: 'sysLogIsEnabled', inputValue: 1, checked: true},
	           	            { boxLabel: _('disabled'), name: 'sysLogIsEnabled', inputValue: 0 },
	           	          ]
	               	   },
	                   {
	           	          xtype: 'radiogroup',
	           	          fieldLabel: _('protocolType'),
	           	          columns: 2,
	           	          vertical: true,
	           	          itemId: 'sysLogProctolType',
	           	          items: [
	           	        	{ boxLabel: 'UDP', name: 'sysLogProctolType', inputValue: 0, checked: true},
	           	            { boxLabel: 'TCP', name: 'sysLogProctolType', inputValue: 1 },
	           	          ]
	               	   },
	               	   {
	 		             fieldLabel: _('Syslog server IP'),
	 		             xtype: 'textfield',
	 		             maxLength: 20,
	 		             labelWidth:110,
	 		             itemId: 'sysLogServerIp',
	 		             name:'sysLogServerIp',
	 			         vtype: 'IPAddress',
		 	          },
 	                  {
	 		             fieldLabel: _('Syslog server port'),
	 		             xtype: 'textfield',
	 		             labelWidth:110,
	 		             maxLength: 20,
	 		             itemId: 'sysLogPort',
	 		             name:'sysLogPort',
	 		             regex:/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
				         regexText:_('Please enter the correct port number')
	 	              }
		           ]
		    	}
	        ]
	      }
      ]
});