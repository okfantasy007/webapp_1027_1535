Ext.define('Admin.view.system.systemManage.view.server.editMonitorTaskForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'editMonitorTaskForm',
    requires: [
        'Admin.view.system.systemManage.controller.server.editMonitorTaskForm'
    ],
    controller: 'editMonitorTaskForm',
    itemId: 'editMonitorTaskForm',
    margin: 10,
    items: [
    	{
            xtype: 'form',
            title: _('Edit Monitor Tasks'),
            bodyPadding: 7,
            autoScroll: true,
            items: [
              {
                xtype: 'container',
                labelWidth: 60,
                margin: '0 0 5 0',
                height:120,
                items: [
	               {
	                  xtype: 'container',
	                  layout: 'hbox',
	                  labelWidth: 10,
	                  margin: '0 0 5 0',
	                  itemId: 'monitorCycle',
	                  items: [
	              	      {
	                       xtype: 'combobox',
	                       fieldLabel:  _('collectPeriod'),
	                       name: 'interval',
	                       itemId: 'interval',
	                       editable:false,
	                       store: {
	                    	  fields: ['cycleData','cycleUnit'],
	                         data: [['5', 5],['30', 30],['60', 60]]
	                       },
	                       valueField: 'cycleData',
	                       displayField: 'cycleUnit',
	                       queryMode: 'local',
	                       value: 5
	                    },
	                    { 
	                       xtype: 'label',       
	                       padding: '10px',
	                  	   text: _('Seconds'), 
	                  	   margins: '0 0 0 10'  
	                    }
	                ]
	              },
	              {
	                 xtype: 'container',
	                 layout: 'hbox',
	                 margin: '0 0 5 0',
	                 itemId: 'dataSaveTime',
	                 items: [
	                    {
	                      xtype: 'combobox',
	                      fieldLabel:  _('The retention time'), 
	                      name: 'retain',
	                      itemId: 'retain',
	                      editable:false,
	                      store: {
	                    	 fields: ['saveData','saveDuration'],
	                         data: [['7', 7],['15', 15],['30', 30],['90', 90]]
	                      },
	                      valueField: 'saveData',
	                      displayField: 'saveDuration',
	                      queryMode: 'local',
	                      value: 7
	                    },
	                    { 
	                      xtype: 'label',       
	                  	  padding: '10px',
	                  	  text: _('Days'),
	                  	  margins: '0 0 0 10'  
	                    }
	              ]
	            }
           ]
         }],
         buttons: [
             {
               text: _('Canceled'),
               handler: 'onEditCancel'
             },
             {
               text: _('Ok'),
               handler: 'onEditSubmit'
           }
          ]
      }
    ],
   
});
