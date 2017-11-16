Ext.define('Admin.view.system.systemManage.view.syslogBackup.syslogBackup.sysLogBackupForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'sysLogBackupForm',
    requires: [
        'Admin.view.system.systemManage.controller.syslogBackup.syslogBackup.sysLogBackupForm'
    ],
    controller: 'sysLogBackupForm',
    itemId: 'sysLogBackupForm',
    margin: 10,
    height:600,
    items: [
        {
            xtype: 'form',
            bodyPadding: 7,
            layout: 'anchor',
            autoScroll: true,
            height:600,
            items: [
               {
	              xtype: 'hidden',
	              name: 'sysLogBackupId',
	              itemId: 'sysLogBackupId'
	           },
               {
                  xtype: 'container',
                  labelWidth: 10,
                  margin: '0 0 5 0',
                  items: [
            	   {
        	         xtype: 'radiogroup',
        	         fieldLabel: _('Whether to automatic backups'),
        	         columns: 2,
        	         vertical: true,
        	         itemId: 'isAutoBackup',
        	         items: [
        	        	{ boxLabel: _('yes'), name: 'isAutoBackup', inputValue: 1, checked: true },
        	            { boxLabel: _('No'), name: 'isAutoBackup', inputValue: 0 },
        	         ],
            	  },
            	  {
            		 xtype: 'checkboxgroup',
            		 fieldLabel: _('Log Type'),
            		 itemId: 'log_type',
            		 columns: 6,
            		 vertical: true,
            		 allowBlank:false,
            		 width:650,
            		 items: [
	            		  { boxLabel: _('Security Log'), name: 'log_type', itemId: 'safeLog', inputValue: '1'},
	            		  { boxLabel: _('Login Log'), name: 'log_type', itemId: 'loginLog', inputValue: '2' },
	            		  { boxLabel: _('Operate Log'), name: 'log_type', itemId: 'operateLog', inputValue: '3' },
	            		  { boxLabel: _('Running Log'), name: 'log_type', itemId: 'runLog', inputValue: '4' },
	            		  { boxLabel: _('Syslog Log'), name: 'log_type', itemId: 'sysLog', inputValue: '5' }
            		 ]
            	  },
            	  {
   	                 xtype: 'combobox',
   	                 fieldLabel: _('Retention Policy'),
   	                 name: 'retainPolicy',
   	                 labelWidth:110,
   	                 itemId: 'retainPolicy',
   	                 editable:false,
   	                 store: {
   	               	     fields: ['retainPolicyType','retainPolicyData'],
   	                     data: [[_('Delete all files'), 0],[_('No more backup'), 1]]
   	                 },
   	                 valueField: 'retainPolicyData',
   	                 displayField: 'retainPolicyType',
   	                 queryMode: 'local',
   	                 value: 0,
   	              },
            	  {
                     xtype: 'combobox',
                     fieldLabel: _('Backup Type'),
                     labelWidth:110,
                     name: 'backupType',
                     itemId: 'backupType',
                     editable:false,
                     store: {
                   	 fields: ['backupType','backupData'],
                         data: [[ _('Local storage'), 0],[_('FTP server'), 1],/*['HTTP服务器', 2]*/]
                     },
                     valueField: 'backupData',
                     displayField: 'backupType',
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
       		            fieldLabel: _('Login User'),
       		            xtype: 'textfield',
       			        name: 'username',
       			        itemId: 'username',
       			        labelWidth:110,
       			        maxLength: 20,
  				        maxLengthText: _('The user name cannot exceed 20 characters'),
       	             },
   	                 {
    		            fieldLabel: _('Login Password'),
    		            xtype: 'textfield',
    			        labelWidth:110,
    			        inputType:'password',
    			        name: 'password',
    			        itemId: 'password',
    			        maxLength: 20,
					    maxLengthText: _('Passwords cannot exceed 20 characters'),
    	            },
    	            {
    		           fieldLabel: _('IP Adress'),
    		           xtype: 'textfield',
    		           labelWidth:110,
    			       name: 'fileServerIp',
    			       itemId: 'fileServerIp',
    			       vtype: 'IPAddress'
    	            },
    	            {
     		           fieldLabel: _('Process Port'),
     		           xtype: 'textfield',
     		           labelWidth:110,
     			       name: 'fileServerPort',
     			       itemId: 'fileServerPort',
     			       regex:/^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
			           regexText:_('Please enter the correct port number'),
     	            }
                   ]
	              },
  	              {
      		         fieldLabel: _('The backup path'),
      		         xtype: 'textfield',
      			     allowBlank: false,
      			     labelWidth:110,
      			     name: 'backupPath',
      			     itemId: 'backupPath',
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
		 		         name:'capacity',
		 		         labelWidth:110,
		 			     allowBlank: false,
		 			     regex:/^[0-9]*[1-9][0-9]*$/,
				         regexText:_('The range is positive integer')
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
                    layout: 'hbox',
                    margin: '0 0 5 0',
                    items: [
	             	  {
	                    xtype: 'numberfield',
	                    name: 'days',
	                    itemId: 'days',
	                    fieldLabel: _('File storage time'),
	                    labelWidth:110,
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