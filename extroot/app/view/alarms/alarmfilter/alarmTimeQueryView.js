Ext.define('Admin.view.alarms.alarmfilter.alarmTimeQueryView', {
    extend: 'Ext.panel.Panel',
    xtype: 'alarmTimeQueryView',
    requires: ['Admin.view.base.PagedGrid',
	'Admin.view.alarms.alarmfilter.alarmTimeNeFilterView',
	'Admin.view.alarms.alarmfilter.alarmTimeNeTypeFilterView',
	'Admin.view.alarms.alarmfilter.alarmTimeCardFilterView',
	'Admin.view.alarms.alarmfilter.alarmTimeCardTypeFilterView',
	'Admin.view.base.DateTimeField.field.Time'
    //'Admin.view.alarms.alarmTypeMenu'
    ],
	//layout:'card',
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
			list_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTimeFilterResource',
                    actionMethods: { 
                        read: 'POST',
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            }
			
        
         
        }
    },

    controller: {
		onComChanged:function( me , newValue , oldValue , eOpts ) {
			var grid = this.getView().down('grid');
			if(newValue=='1'){
			 var neWin = Ext.create("Ext.window.Window", {
                reference: 'neAndCardWin',
                title: _('Query'),
                closable: true,
				autoScroll : true,
                items: [
				{
					title:_('Alarm Card Query'),
					xtype:'alarmTimeNeFilterView',
					autoScroll : false,
					
				}
				],
                closeAction: 'hide',
                width: 800,
                height:420,
				modal:true,
				resizable:false,
                buttons: [
				{
                    xtype: "button",
                    text: _("Ok"),
                    handler: function() {
						var negrid = neWin.down('alarmTimeNeFilterView').down('grid');
						var records = negrid.getSelectionModel().getSelection();
						var type='1';
						for(var i=0;i<records.length;i++){
							var neName = records[i].get('neName');
							var ircnenodeId = records[i].get('neId');
						    var rec = {'type': type,'name':neName,'logicalField':ircnenodeId};
							grid.getStore().insert(0,rec);
							
						}
					  neWin.close();

                    }
                },
                {
                    xtype: "button",
                    text: _("Cancel"),
                    handler: function() {
                        neWin.close();
                    }
                }]
            });
			neWin.show();
			}else if(newValue=='2'){
			var grid = this.getView().down('grid');
			var neTypeWin = Ext.create("Ext.window.Window", {
                reference: 'neTypeWin',
                title: _('Query'),
                closable: true,
				autoScroll : true,
                items: [
				{
					title:_('Alarm Card Query'),
					xtype:'alarmTimeNeTypeFilterView',
					autoScroll : false,
					
				}
				],
                closeAction: 'hide',
                width: 800,
                height:420,
				modal:true,
				resizable:false,
                buttons: [
				{
                    xtype: "button",
                    text: _("Confirm"),
                    handler: function() {
					    var netypegrid = neTypeWin.down('alarmTimeNeTypeFilterView').down('grid');
						var records = netypegrid.getSelectionModel().getSelection();
						var type='2';
						for(var i=0;i<records.length;i++){
							var neTypeName = records[i].get('neTypeName');
							var neTypeId =records[i].get('neTypeId');
						    var rec = {'type': type,'name':neTypeName,'logicalField':neTypeId};
							grid.getStore().insert(0,rec);
						}
					   neTypeWin.close();

                    }
                },
                {
                    xtype: "button",
                    text: _("Cancel"),
                    handler: function() {
                        neTypeWin.close();
                    }
                }]
            });
			neTypeWin.show();
			}else if(newValue=='3'){
			 var grid = this.getView().down('grid');
			 var cardWin = Ext.create("Ext.window.Window", {
                reference: 'cardWin',
                title: _('Query'),
                closable: true,
				autoScroll : true,
                items: [
				{
					title:_('Alarm Card Query'),
					xtype:'alarmTimeCardFilterView',
					autoScroll : false,
					
				}
				],
                closeAction: 'hide',
                width: 800,
                height:420,
				modal:true,
				resizable:false,
                buttons: [
				{
                    xtype: "button",
                    text: _("Confirm"),
                    handler: function() {
						var cardgrid = cardWin.down('alarmTimeCardFilterView').down('grid');
						var records = cardgrid.getSelectionModel().getSelection();
						var type='3';
						for(var i=0;i<records.length;i++){
							var cardName = records[i].get('cardName');
							var cardId =records[i].get('cardId');
						    var rec = {'type': type,'name':cardName,'logicalField':cardId};
							grid.getStore().insert(grid.store.getCount(),rec);
						}
					   cardWin.close();

                    }
                },
                {
                    xtype: "button",
                    text: _("Cancel"),
                    handler: function() {
                        cardWin.close();
                    }
                }]
            });
			cardWin.show();
			}else if(newValue=='4'){
			 var grid = this.getView().down('grid');
			 var cardTypeWin = Ext.create("Ext.window.Window", {
                reference: 'cardTypeWin',
                title:  _('Query'),
                closable: true,
				autoScroll : true,
                items: [
				{
					title:_('Alarm Card Query'),
					xtype:'alarmTimeCardTypeFilterView',
					autoScroll : false,
					
				}
				],
                closeAction: 'hide',
                width: 800,
                height:420,
				modal:true,
				resizable:false,
                buttons: [
				{
                    xtype: "button",
                    text: _("Confirm"),
                    handler: function() {
					   var cardtypegrid = cardTypeWin.down('alarmTimeCardTypeFilterView').down('grid');
						var records = cardtypegrid.getSelectionModel().getSelection();
						var type='4';
						for(var i=0;i<records.length;i++){
							var cardTypeName = records[i].get('cardTypeName');
							var name = records[i].get('cardTypeName')+'^^'+records[i].get('neTypeName');
						    var rec = {'type': type,'name':cardTypeName,'logicalField':name};
							grid.getStore().insert(grid.store.getCount(),rec);
						}
					   cardTypeWin.close();

                    }
                },
                {
                    xtype: "button",
                    text: _("Cancel"),
                    handler: function() {
                        cardTypeWin.close();
                    }
                }]
            });
			cardTypeWin.show();
			}
		},	
		onSubmit:function(){
		   var view  = this.getView().up();
		   var mainGrid = view.down('grid');
		   var alarmTime_form_1 =  this.getView().down('form');
		   var alarmTime_grid= this.getView().down('panel').nextSibling().down('grid');
		   var alarmTime_form_2 =  this.getView().down('panel').nextSibling().nextSibling();
		   var  startTime = alarmTime_form_2.getForm().findField('startTime').getValue();
		   var  endTime = alarmTime_form_2.getForm().findField('endTime').getValue();
		   if(Date.parse(startTime)>Date.parse(endTime)){
			   Ext.Msg.alert(_('Tips'), _('End Time Maxer than Start Time'));
			   return ;
		   }
		   var target =false;
		   var alarmjson="" ;
		   if(alarmTime_form_1.down('radiofield').checked){
			   target =true;
			   alarmjson="[]";
		   }else{
			 var alarmStore = alarmTime_grid.getStore();
			 alarmjson="[" ;
			for(var i=0;i< alarmStore.data.length;i++){
			alarmjson= alarmjson+'{';
				var record = alarmStore.getAt(i); 
				var logicalField = "'"+record.get('logicalField')+"'";
				var type ="'"+record.get('type')+"'";
			alarmjson= alarmjson  +"logicalField :"+logicalField+","+" type:"+type +"},"
				
			}
			alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";
		   }
		 
			var timeMark = alarmTime_form_2.getForm().findField('ruleId').getValue();
			var url="alarm/alarmResource/addTimeFilter";
			if(!(''==timeMark)){
				url="alarm/alarmResource/modifyAlarmTimeFilter";
			}
			alarmTime_form_2.getForm().submit({
                            url: url,
                            params:{
								
								target:target,
								condition:alarmjson
								
								},
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('With Errors'), _('Failed'));
                                } else {
                                    Ext.Msg.alert(_('Success'), _('Success'));
                                }
								view.setActiveItem(mainGrid);
								mainGrid.getStore().proxy.url = 'alarm/alarmResource/getAlarmTimeFilter';	
								mainGrid.getStore().reload();	
								
								
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), action.result.msg);
                            }
                        }); // form
			
				
			
           
		 
		   
		  
			
			
		},
		onDelete:function(){
			var grid  =this.getView().down('grid');
			
			var records = grid.getSelectionModel().getSelection();
			
			 for(var i=0 ;i<records.length;i++){
             grid.getStore().remove(records[i]);
            }
		},
		onCancel:function(){
			var grid =	this.getView().up().down('grid');
			this.getView().up().setActiveItem(grid);
		},
		
		 onDisabled:function(){
			var grid  =this.getView().down('panel').nextSibling().down('grid');
			//var radio_1 = this.getView().down('form').down('radiofield');
			var panel = this.getView().down('form').nextSibling();
			var radio_2 = this.getView().down('form').down('radiofield').nextSibling();
			radio_2.setValue(false);
			panel.setDisabled(true);
			grid.getStore().removeAll();
			//grid.getView().refresh();
			
			
		},
		
		onEnabled:function(){
			var grid  =this.getView().down('panel').nextSibling().down('grid');
			var panel = this.getView().down('form').nextSibling();
			var radio_1 = this.getView().down('form').down('radiofield');
			var form = this.getView().down('form');
			radio_1.setValue(false);
			panel.setDisabled(false);

			
		
			
		},

        onRefresh: function() {
            this.lookupReference('alarmGrid').getStore().reload();
        },
        
        onReset: function() {
            this.lookupReference('alarmTypeForm').getForm().reset();
        },

    },

    items: [
	{
		title:_('Time Filter'),
		margin:'10 10 0 10',
		xtype:'form',
		items:[
		 {
			xtype: 'fieldset',
			title: _('Choice Way'),
			layout: 'hbox',
			defaults: {
			 anchor: '100%',
			 labelWidth : 90,
			labelAlign : "right",
			},
		 items:[
		 	{
            xtype: 'radiofield',
            fieldLabel: _('All Objects'),
            name: _('All Objects'),
		    checked:true,
			labelAlign : 'right',
			//handler:'onDisabled'
			listeners:{
				 change:'onDisabled'
			}
			
			
			},
			{
            xtype: 'radiofield',
            fieldLabel: _('Custom Objects'),
            name:_('Custom Objects'),
			labelAlign : 'right',
		   // handler:'onEnabled'
			listeners:{
				 change:'onEnabled'
			}
			}
		 
		 ]}
	
		]
		
	},
    {
		 title: _('Selected Alarm Source'),
		 xtype: 'panel',
		 margin:'0 10 0 10',
		 disabled:true,
		 border:true, 
		 width:600,
		 height:250,
		 autoScroll:true,
		 items:[
		 {
		 xtype:'grid',
		// border:true, 
		 reference:'typeInfo',
		 height:200,
		 bind: {
			store: '{list_remote}',
		},
        columns: [
		 {
            text: 'logicalField',
            dataIndex: 'logicalField',
			hidden:true
			
			
			
        },
		{
            text: 'ruleId',
            dataIndex: 'ruleId',
			hidden:true
			
			
        },
        {
            text: _('Type'),
            dataIndex: 'type',
			width:300,
			renderer: function(value, m, r) {
                if (value == 1) {
					return _("Ne");
				}
				 if (value == 2) {
					return _("neType");
				}
				 if (value == 3) {
					return _("Card");
				}
				 if (value == 4) {
					return _("Card Type");
				}
				return value;
			   }
        },
        {
            text: _('Name'),
            dataIndex: 'name',
			width:200
        }
       ]
		 }
		 ],
		  bbar:[ 
            	 {
            xtype: 'combobox',
            emptyText: _("Choice"),
            store:Ext.create('Ext.data.Store',{
        	fields:["text","value"],
        	data:[
        	      {
        	    	  text:_("Ne"),value:1
        	      },{
        	    	  text:_("neType"),value:2
        	      },{
        	    	  text:_("Card"),value:3
        	      },{
        	    	  text:_("Card Type"),value:4
        	      }
        	  ]
        	
			}),
			listeners : {
			'change':'onComChanged'
			},
            displayField: "text",
            valueField: 'value',

			},
            {
                text: _('Delete'),
             //   iconCls: 'x-fa fa-plus',
                handler: 'onDelete',
            }	
          ],


	},
	{
		xtype:'form',
		items:[
		{
            xtype: 'textfield',
            fieldLabel: 'ruleId',
            name: 'ruleId',
			hidden:'true'
 	
		},
		{
		titile:_('Filter Alarm Time Set'),
		xtype:'panel',
		items:[
		
		 {
			xtype: 'fieldset',
			title: _('Filter Alarm Time Set'),
			layout: 'hbox',
			fieldDefaults : {
				labelAlign : 'right',
				labelWidth : 150
				},
		items:[
		
		{
                xtype: 'checkbox',
                boxLabel: _('MON'),
                checked: true,
				name: 'one'
         },
		 {
                xtype: 'checkbox',
                boxLabel: _('TUEY'),
                checked: true,
				name: 'two'
         },
		 {
                xtype: 'checkbox',
                boxLabel: _('WED'),
                checked: true,
				name: 'three'
         },
		 {
                xtype: 'checkbox',
                boxLabel: _('THU'),
                checked: true,
				name: 'four'
         },
		 {
                xtype: 'checkbox',
                boxLabel: _('FRI'),
                checked: true,
				name: 'five'
         },
		 {
                xtype: 'checkbox',
                boxLabel: _('SAT'),
                checked: true,
				name: 'six'
         },
		 {
                xtype: 'checkbox',
                boxLabel: _('SUN'),
                checked: true,
				name: 'seven'
         },
		]
		},
		{
		xtype:'panel',
		items:[
		 {
			xtype: 'fieldset',
			layout: 'vbox',
			fieldDefaults : {
				labelAlign : 'right',
				labelWidth : 150
				},
		 items:[
		  {
           // xtype: 'timeSelectfield',
		    xtype: 'timefield',
		 	format:'H:i:s',
			increment: 30,
            fieldLabel: _('Start Time'),
			allowBlank:false,
            name: 'startTime'
        },
		 {
           // xtype: 'timeSelectfield',
		    xtype: 'timefield',
			format:'H:i:s',
			increment: 30,
            fieldLabel: _('End Time'),
			allowBlank:false,
            name: 'endTime'
        },
		{
            xtype: 'textfield',
            fieldLabel: _('Remark'),
            name: 'comments'
        }
		 
		 ]}
		
	]
	}
		]
	
	},
	{
		xtype:'panel',
		items:[
		 {
			xtype: 'fieldset',
			layout: 'hbox',
			fieldDefaults : {
				labelAlign : 'right',
				labelWidth : 150
				},
		 items:[
		 {
                fieldLabel: _('Enable Filter Rules'),
                iconCls: 'x-fa fa-plus',
                xtype:'checkboxfield',
				name: 'filterEnable'
				},
				{
                fieldLabel: _('Enable Corba Filter'),
                iconCls: 'x-fa fa-plus',
                xtype:'checkboxfield',
				name: 'isCorbaFilter'
				},
				{
                fieldLabel: _('Save History'),
                iconCls: 'x-fa fa-plus',
                xtype:'checkboxfield',
				name: 'isSaved'
			   }
		 
		 ]}
		
		]
	},

	
		]
	
	}

	],
	 buttons: [
			{
                text:_('Confirm'),
				handler:'onSubmit'
            },
			{
                text:_('Cancel'),
				handler:'onCancel'
            }
		 ]

});