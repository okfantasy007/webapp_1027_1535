Ext.define('Admin.view.system.systemManage.view.server.thresholdForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'thresholdForm',
    requires: [
        'Admin.view.system.systemManage.controller.server.thresholdForm'
    ],
    controller: 'thresholdForm',
    items: [
        {
            xtype: 'form',
            layout: 'anchor',
            itemId: 'thresholdForm',
            bodyPadding: 7,
            title: _('The threshold management'),
            layout: 'anchor',
            autoScroll: true,
            fieldDefaults: {
                labelAlign: 'left',
                labelWidth: 260,
                msgTarget: 'side',
            },
            defaults: {
                anchor: '100%'
            },
            items: [
              {
                  xtype: 'container',
                  layout: 'hbox',
                  margin: '0 0 5 0',
                  items: [
            	     {
      		            fieldLabel: _('The CPU alarm generates the threshold'),
      		            xtype: 'textfield',
      			        allowBlank: false,
      			        name: 'cpuProduce',
      			        itemId: 'cpuProduce',
      			        regex:/^[0-9][0-9]?(\.[0-9]{1,2})?$|^100$/,
      			        regexText: _('You can only enter floating point Numbers, the range of values: 0-100, 2 decimal places'),
      			        
      	             },
      	             { 
                        xtype: 'label',       
                        padding: '10px',
                  	    text: '%'
                     }
                  ]
              },
              {
                  xtype: 'container',
                  layout: 'hbox',
                  margin: '0 0 5 0',
                  items: [
            	     {
      		            fieldLabel: _('The CPU alarm clears the threshold'),
      		            xtype: 'textfield',
      			        allowBlank: false,
      			        name: 'cpuClear',
      			        itemId: 'cpuClear',
    			        regex:/^[0-9][0-9]?(\.[0-9]{1,2})?$|^100$/,
    			        regexText: _('You can only enter floating point Numbers, the range of values: 0-100, 2 decimal places'),
      	             },
      	             { 
                        xtype: 'label',       
                        padding: '10px',
                  	    text: '%'
                     }
                  ]
              },
              {
                  xtype: 'container',
                  layout: 'hbox',
                  margin: '0 0 5 0',
                  items: [
            	     {
      		            fieldLabel: _('The memory alarm generates the threshold'),
      		            xtype: 'textfield',
      			        allowBlank: false,
      			        name: 'memProduce',
      			        itemId: 'memProduce',
    			        regex:/^[0-9][0-9]?(\.[0-9]{1,2})?$|^100$/,
    			        regexText: _('You can only enter floating point Numbers, the range of values: 0-100, 2 decimal places'),
      	             },
      	             { 
                        xtype: 'label',       
                        padding: '10px',
                  	    text: '%'
                     }
                  ]
              },
              {
                  xtype: 'container',
                  layout: 'hbox',
                  margin: '0 0 5 0',
                  items: [
            	     {
      		            fieldLabel: _('The memory alarm clears the threshold'),
      		            xtype: 'textfield',
      			        allowBlank: false,
      			        name: 'memClear',
      			        itemId: 'memClear',
    			        regex:/^[0-9][0-9]?(\.[0-9]{1,2})?$|^100$/,
    			        regexText: _('You can only enter floating point Numbers, the range of values: 0-100, 2 decimal places'),
      	             },
      	             { 
                        xtype: 'label',       
                        padding: '10px',
                  	    text: '%'
                     }
                  ]
              },
              {
                  xtype: 'container',
                  layout: 'hbox',
                  margin: '0 0 5 0',
                  items: [
            	     {
      		            fieldLabel: _('The disk alarm generates the threshold'),
      		            xtype: 'textfield',
      			        allowBlank: false,
      			        name: 'diskProduce',
      			        itemId: 'diskProduce',
    			        regex:/^[0-9][0-9]?(\.[0-9]{1,2})?$|^100$/,
    			        regexText: _('You can only enter floating point Numbers, the range of values: 0-100, 2 decimal places'),
      	             },
      	             { 
                        xtype: 'label',       
                        padding: '10px',
                  	    text: '%'
                     }
                  ]
              },
              {
                  xtype: 'container',
                  layout: 'hbox',
                  margin: '0 0 5 0',
                  items: [
            	     {
      		            fieldLabel: _('The disk alarm clears the threshold'),
      		            xtype: 'textfield',
      			        allowBlank: false,
      			        name: 'diskClear',
      			        itemId: 'diskClear',
    			        regex:/^[0-9][0-9]?(\.[0-9]{1,2})?$|^100$/,
    			        regexText: _('You can only enter floating point Numbers, the range of values: 0-100, 2 decimal places'),
      	             },
      	             { 
                        xtype: 'label',       
                        padding: '10px',
                  	    text: '%'
                     }
                  ]
              },
              
            ],
            listeners: {
           	  beforerender: 'onLoadThreshold',
           	},
        }
    ],
    fbar: [
        {
        	text: _('Save'),
            handler: 'onSave'
        },
        {
        	text: _('Refresh'),
            handler: 'onRefresh'
        }
    ]
});
