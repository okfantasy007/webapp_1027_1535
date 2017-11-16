Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogStorage.operateLogfieldset', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'operateLogfieldset',
    layout: 'anchor',
    margin: 10,
    items: [
    	{
        	xtype: 'fieldset',
			title:_('Operation Log Storage Policy'),
			//margin: 10,
			defaultType: 'textfield',
			width:417,
			defaults: {
				anchor: '100%'
			},
	        items: [
        	  {
                    xtype: 'hidden',
                    name: 'operateLogId',
                    itemId: 'operateLogId'
              },
	          {
	                xtype: 'container',
	                margin: '0 0 5 0',
	                layout: 'hbox',
	                items: [
	                	 {
	           	          xtype: 'radiogroup',
	           	          fieldLabel: _('Whether to enable'),
	           	          columns: 2,
	           	          vertical: true,
	           	          itemId: 'operateLogIsEnabled',
	           	          items: [
	           	        	{ boxLabel: _('enabled'), name: 'operateLogIsEnabled', inputValue: 1, checked: true},
	           	            { boxLabel: _('disabled'), name: 'operateLogIsEnabled', inputValue: 0 },
	           	          ]
	               	   }
		             ]
		      },
	    	  {
                xtype: 'container',
                margin: '0 0 5 0',
                layout: 'hbox',
                items: [
	            	 {
	                   xtype: 'numberfield',
	                   name: 'operateLogDays',
	                   itemId: 'operateLogDays',
	                   fieldLabel: _('Storage days'),
	                   width:270,
	                   maxValue: 365,
	                   minValue: 30,
	                   allowDecimals: false,//小数点
	                   allowNegative: false,//负数
	                 },
	   	             { 
	                   xtype: 'label',       
	                   padding: '10px',
	                   width:140,
	                   text: _('Day (range: 30-365)')
	                 }
	             ]
	    	},
	    	{
                xtype: 'container',
                margin: '0 0 5 0',
                layout: 'hbox',
                items: [
		             {
	 		           fieldLabel: _('Storage Capacity'),
	 		           xtype: 'textfield',
	 		           maxLength: 20,
	 		           width:270,
	 		           name:'operateLogCapacity',
	 			       regex:/^[0-9]*[1-9][0-9]*$/,
			           regexText:_('Please enter the correct storage capacity')
	 	             },
 	                 { 
	                   xtype: 'label',       
	                   padding: '10px',
	               	   text: 'G'
	                 }
	            ]
	    	},
            {
              xtype: 'container',
              labelWidth: 10,
              margin: '0 0 5 0',
              itemId: 'monitorCycle',
              items: [
        	   {
                  xtype: 'combobox',
                  fieldLabel: _('Retention Policy'),
                  name: 'operateLogRetainPolicy',
                  itemId: 'operateLogRetainPolicy',
                  editable:false,
                  width:290,
                  store: {
               	     fields: ['operateLogRetainPolicyType','operateLogRetainPolicyData'],
               	     data: [[_('Automatically covered'), 0],[_('No backup'), 1],[_('Remain the same'), 2]]
                  },
                  valueField: 'operateLogRetainPolicyData',
                  displayField: 'operateLogRetainPolicyType',
                  queryMode: 'local',
                  value: 0,
               }
            ]
          }
        ]
      }
    ]
});