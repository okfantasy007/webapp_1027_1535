Ext.define('Admin.view.system.systemManage.view.perDataDump.storagePolicyForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'storagePolicyForm',
    requires: [
        'Admin.view.system.systemManage.controller.perDataDump.storagePolicyForm'
    ],
    controller: 'storagePolicyForm',
    itemId: 'storagePolicyForm',
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
                  xtype: 'hidden',
                  name: 'storagePolicyId',
                  itemId: 'storagePolicyId'
               },
               {
                  xtype: 'container',
                  labelWidth: 10,
                  margin: '0 0 5 0',
                  items: [
            	   {
        	         xtype: 'radiogroup',
        	         fieldLabel: _('Whether to enable'),
        	         columns: 2,
        	         vertical: true,
        	         itemId: 'dbRpIsEnable',
        	         items: [
        	        	{ boxLabel:  _('yes'), name: 'dbRpIsEnable', inputValue: 1, checked: true},
        	            { boxLabel: _('No'), name: 'dbRpIsEnable', inputValue: 0},
        	         ],
        	         listeners: {
         	        	change: 'onChangeRadiogroup'
			         }
            	   }
                ]
              },
              {
                   xtype: 'container',
                   margin: '0 0 5 0',
                   items: [
            	    {
                       xtype: 'combobox',
                       fieldLabel:  _('Storage Policy'),
                       name: 'csvRpIsEnable',
                       itemId: 'csvRpIsEnable',
                       editable:false,
                       store: {
                    	  fields: ['modeType','modeData'],
                          data: [[_('Dump'), 1],[_('Do not keep'), 0]]
                       },
                       valueField: 'modeData',
                       displayField: 'modeType',
                       queryMode: 'local',
                       value: 0,
                       listeners: {
            	        	change: 'onChangeComboboxChange'
			            }
                    },
	                {
	                    xtype: 'container',
	                    layout: 'hbox',
	                    margin: '0 0 5 0',
	                    items: [
                    	{
                            xtype: 'numberfield',
                            name: 'dbDataStorageDays',
                            itemId: 'dbDataStorageDays',
                            fieldLabel:  _('Storage days'),
                            maxValue: 180,
                            minValue: 7,
                            allowDecimals: false,//小数点
                            allowNegative: false,//负数
                            allowBlank: false
                         },
	       	             { 
	                       xtype: 'label',  
	                       padding: '10px',
	                   	   text:  _('Day (range: 7-180)'),
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
                            name: 'dbDataStorageCapacity',
                            itemId: 'dbDataStorageCapacity',
                            fieldLabel:  _('Storage Capacity'),
                            maxValue: 50,
                            minValue: 5,
                            allowDecimals: false,//小数点
                            allowNegative: false,//负数
                            allowBlank: false
                         },
	       	             { 
	                       xtype: 'label',   
	                       padding: '10px',
	                   	   text:  _('GB (range: 5-50)'),
	                     }
	                   ]
	                }
                  ]
              }
            ],
            listeners: {
           	  beforerender: 'onLoadPerDumpData',
            },
           	buttons: [
                {
                    text: _('Ok'),
                    handler: 'onStorageSave'
                },
                /*{
                    text: '刷新',
                    //handler: 'onDBBackupSave'
                }*/
           ]
        }
    ]
});