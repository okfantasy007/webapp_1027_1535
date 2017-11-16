Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogConfig.runLogConfigfieldset', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'runLogConfigfieldset',
    layout: 'anchor',
    margin: 10,
    items: [
    	{
        	xtype: 'fieldset',
			title:_('Running log forward'),
			//margin: 10,
			defaultType: 'textfield',
			width:407,
			defaults: {
				anchor: '100%'
			},
	        items: [
	        	{
	                xtype: 'hidden',
	                name: 'runLogId',
	                itemId: 'runLogId'
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
	           	          itemId: 'runLogIsEnabled',
	           	          items: [
	           	        	{ boxLabel: _('enabled'), name: 'runLogIsEnabled', inputValue: 1, checked: true},
	           	            { boxLabel: _('disabled'), name: 'runLogIsEnabled', inputValue: 0 },
	           	          ]
	               	   },
	                   {
	           	          xtype: 'radiogroup',
	           	          fieldLabel: _('protocolType'),
	           	          columns: 2,
	           	          vertical: true,
	           	          itemId: 'runLogProctolType',
	           	          items: [
	           	        	{ boxLabel: 'UDP', name: 'runLogProctolType', inputValue: 0, checked: true},
	           	            { boxLabel: 'TCP', name: 'runLogProctolType', inputValue: 1 },
	           	          ]
	               	   },
	               	   {
	 		             fieldLabel: _('Syslog server IP'),
	 		             xtype: 'textfield',
	 		             maxLength: 20,
	 		             labelWidth:110,
	 		             itemId: 'runLogServerIp',
	 		             name:'runLogServerIp',
	 			         vtype: 'IPAddress',
		 	          },
 	                  {
	 		             fieldLabel: _('Syslog server port'),
	 		             xtype: 'textfield',
	 		             labelWidth:110,
	 		             maxLength: 20,
	 		             itemId: 'runLogPort',
	 		             name:'runLogPort',
	 		             regex:/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
				         regexText:_('Please enter the correct port number')
	 	              }
		           ]
		    	}
        ]
      }
    ]
});