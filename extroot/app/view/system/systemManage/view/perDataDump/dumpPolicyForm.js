Ext.define('Admin.view.system.systemManage.view.perDataDump.dumpPolicyForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'dumpPolicyForm',
    requires: [
        'Admin.view.system.systemManage.controller.perDataDump.dumpPolicyForm'
    ],
    controller: 'dumpPolicyForm',
    itemId: 'dumpPolicyForm',
    margin: 10,
    items: [
        {
            xtype: 'form',
            bodyPadding: 7,
            layout: 'anchor',
            autoScroll: true,
            height:500,
            items: [
            	{
                   xtype: 'hidden',
                   name: 'dumpPolicyId',
                   itemId: 'dumpPolicyId'
                },
                {
                   xtype: 'container',
                   margin: '0 0 5 0',
                   items: [
            	    {
                       xtype: 'combobox',
                       fieldLabel:  _('The file format'),
                       name: 'fileFormat',
                       itemId: 'fileFormat',
                       editable:false,
                       store: {
                    	  fields: ['fileTypeType','fileTypeData'],
                          data: [['CSV', 1]]
                       },
                       valueField: 'fileTypeData',
                       displayField: 'fileTypeType',
                       queryMode: 'local',
                       value: 1
                    },

	                {
	                    xtype: 'container',
	                    layout: 'hbox',
	                    margin: '0 0 5 0',
	                    items: [
                    	{
                            xtype: 'numberfield',
                            name: 'csvStorageDays',
                            itemId: 'csvStorageDays',
                            fieldLabel: _('File storage days'),
                            maxValue: 360,
                            minValue: 7,
                            allowDecimals: false,//小数点
                            allowNegative: false,//负数
                            allowBlank: false
                         },
	       	             { 
	                       xtype: 'label',       
	                       padding: '10px',
	                   	   text: _('Day (range: 7-360)'),
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
                            name: 'csvStorageCapacity',
                            itemId: 'csvStorageCapacity',
                            fieldLabel: _('File storage capacity'),
                            maxValue: 100,
                            minValue: 5,
                            allowDecimals: false,//小数点
                            allowNegative: false,//负数
                            allowBlank: false
                         },
	       	             { 
	                       xtype: 'label',       
	                       padding: '10px',
	                   	   text: _('GB (range: 5-100)'),
	                     }
	                   ]
	                }
                  ]
              }
            ],
           	buttons: [
                {
                    text: _('Ok'),
                    itemId: 'dumpPolicySaveButton',
                    handler: 'onDumpPolicySave'
                },
                /*{
                    text: '刷新',
                    //handler: 'onDBBackupSave'
                }*/
           ]
        }
    ]
});