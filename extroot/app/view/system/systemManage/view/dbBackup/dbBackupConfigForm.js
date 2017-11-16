Ext.define('Admin.view.system.systemManage.view.dbBackup.dbBackupConfigForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'dbBackupConfigForm',
    requires: [
        'Admin.view.system.systemManage.controller.dbBackup.dbBackupConfigForm'
    ],
    controller: 'dbBackupConfigForm',
    itemId: 'dbBackupConfigForm',
    margin: 10,
    items: [
        {
            xtype: 'form',
            bodyPadding: 7,
            layout: 'anchor',
            itemId: 'configForm',
            autoScroll: true,
            height:500,
            items: [
               {
                  xtype: 'container',
                  labelWidth: 10,
                  margin: '0 0 5 0',
                  itemId: 'monitorCycle',
                  items: [
            	   {
        	         xtype: 'radiogroup',
        	         fieldLabel: _('Type of backup plan'),
        	         columns: 2,
        	         vertical: true,
        	         itemId: 'schedule_type',
        	         items: [
        	        	{ boxLabel: _('Periodic'), name: 'schedule_type', inputValue: 0, checked: true},
        	            { boxLabel: _('One-time'), name: 'schedule_type', inputValue: 1 },
        	         ],
        	         listeners: {
        	        	change: 'onSelectRadioChange'
		             }
            	  },
            	  {
					 xtype: 'datetimefield',
					 fieldLabel:_('Execution date'),
					 minValue: new Date(),
					 name: 'schedule_date',
					 itemId:'schedule_date'
				  },
				  {
	                 xtype: 'container',
	                 layout: 'hbox',
	                 margin: '0 0 10 0',
	                 itemId: 'cycleInterval',
	                 items: [
	                	{
                          xtype: 'numberfield',
                          name: 'schedule_interval',
                          itemId: 'schedule_interval',
                          fieldLabel: _('Periodic intervals'),
                          maxValue: 30,
                          minValue: 1,
                          allowDecimals: false,//小数点
                          allowNegative: false,//负数
                          allowBlank: false
                       },
      	               { 
                         xtype: 'label',       
                         padding: '10px',
                  	     text: _('Day (range: 1-30)'),
                       }
	                 ]
		           }
                ]
              },
              {
                   xtype: 'container',
                   margin: '0 0 5 0',
                   items: [
            	    {
                       xtype: 'combobox',
                       fieldLabel: _('File storage mode'),
                       name: 'mode',
                       itemId: 'mode',
                       editable:false,
                       store: {
                    	  fields: ['modeType','modeData'],
                          data: [[_('Local storage'), 0],[_('Backup server'), 1],[_('FTP server'), 2]]
                       },
                       valueField: 'modeData',
                       displayField: 'modeType',
                       queryMode: 'local',
                       value: 0,
                       listeners: {
            	        	change: 'onSelectComboboxChange'
			            }
                    },
                    {
	                   xtype: 'container',
	                   margin: '0 0 5 0',
	                   itemId: 'userConfig',
	                   hidden: true,
	                   items: [
	              	     {
	       		            fieldLabel: _('User Name'),
	       		            xtype: 'textfield',
	       			        name: 'user',
	       			        itemId: 'user',
	       			        maxLength: 20,
	  				        maxLengthText: _('The user name cannot exceed 20 characters'),
	       	             },
	   	                 {
	    		            fieldLabel: _('Password'),
	    		            xtype: 'textfield',
	    			        inputType:'password',
	    			        name: 'password',
	    			        itemId: 'password',
	    			        maxLength: 20,
						    maxLengthText: _('Passwords cannot exceed 20 characters'),
	    	            },
	    	            {
	    		           fieldLabel: _('IP Adress'),
	    		           xtype: 'textfield',
	    			       name: 'ip',
	    			       itemId: 'ip',
	    			       vtype: 'IPAddress'
	    	           },
	    	           {
	     		           fieldLabel: _('Process Port'),
	     		           xtype: 'textfield',
	     			       name: 'port',
	     			       itemId: 'port',
	     			       regex:/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
				           regexText:_('Please enter the correct port number'),
	     	           }
	                 ]
	                },
	                {
	                    xtype: 'container',
	                    layout: 'hbox',
	                    margin: '0 0 5 0',
	                    items: [
	              	    {
	      		           fieldLabel: _('The backup path'),
	      		           xtype: 'textfield',
	      			       allowBlank: false,
	      			       name: 'path',
	      			       itemId: 'path',
	      			       blankText: _('Please enter the backup path'),
	      	            }
	                  ]
	                },
	                {
	                    xtype: 'container',
	                    layout: 'hbox',
	                    margin: '0 0 5 0',
	                    items: [
                    	{
                            xtype: 'numberfield',
                            name: 'reserve',
                            itemId: 'reserve',
                            fieldLabel: _('Storage days'),
                            maxValue: 30,
                            minValue: 7,
                            allowDecimals: false,//小数点
                            allowNegative: false,//负数
                            allowBlank: false
                         },
	       	             { 
	                       xtype: 'label',       
	                       padding: '10px',
	                   	   text: _('Day (range: 7-30)'),
	                     }
	                   ]
	                }
                  ]
              }
            ],
            listeners: {
           	  beforerender: 'onLoadDBBackupConfig',
           	},
           	buttons: [
                {
                    text: _('Ok'),
                    handler: 'onDBBackupSave'
                },
                /*{
                    text: '刷新',
                    //handler: 'onDBBackupSave'
                }*/
           ]
        }
    ]
});