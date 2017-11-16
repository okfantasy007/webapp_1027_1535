Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogStorage.runLogfieldset', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'runLogfieldset',
    layout: 'anchor',
    margin: 10,
    items: [
    	{
        	xtype: 'fieldset',
			title:_('Running Log Storage Policy'),
			//margin: 10,
			defaultType: 'textfield',
			width:417,
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
                layout: 'hbox',
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
	                   name: 'runLogDays',
	                   itemId: 'runLogDays',
	                   fieldLabel: _('Storage days'),
	                   maxValue: 365,
	                   minValue: 30,
	                   width:270,
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
	 		           name:'runLogCapacity',
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
                  name: 'runLogRetainPolicy',
                  itemId: 'runLogRetainPolicy',
                  editable:false,
                  width:290,
                  store: {
               	     fields: ['runLogRetainPolicyType','runLogRetainPolicyData'],
               	     data: [[_('Automatically covered'), 0],[_('No backup'), 1],[_('Remain the same'), 2]]
                  },
                  valueField: 'runLogRetainPolicyData',
                  displayField: 'runLogRetainPolicyType',
                  queryMode: 'local',
                  value: 0
               }
            ]
          }
        ]
      }
    ]
});