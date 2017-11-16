Ext.define('Admin.view.alarms.alarmnotify.alarmSmsNotifyView', {
    extend: 'Ext.panel.Panel',
	xtype:'alarmSmsNotifyView',
  
    cls: 'shadow',
    viewModel: {
		data:{
			task_status:'false'	
		},
		
        stores: {
			
			keywordsStore_remote:
			{
                autoLoad: true,
                proxy: {
					fields:["value", "text"],
                    type: 'ajax',
                    url: '/alarm/alarmResource/getSmsTemplateKeys',
                    reader: 'json'
                }

            },
        }
    },

    controller: {  
	
	onRender:function(){
			 var viewModel =this.getViewModel();
			 var form =this.getView().down('form');
				Ext.Ajax.request({
							url : '/alarm/alarmResource/getSmsServerStatus',
							success : function(response) {							
							if(response.responseText=='true'){
								viewModel.set('task_status', response.responseText);
								form.down('label').setText(_('Run Status:running'));
								form.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
							}else{							
								viewModel.set('task_status', response.responseText);
								form.down('label').setText(_('Run Status:stopping'));	
								form.items.each(function(item,index,length){   
							   item.setDisabled(false);
								});
							}
							
								}
		});
		
		},
	
	 startService:function(){
			var smsform =this.getView().down('form');
			var  isModify= smsform.getForm().isDirty();
			var viewModel =this.getViewModel();
			var view = this.getView();
			smsform.getForm().submit({
                            url: '/alarm/alarmResource/startSmsServiceStatus',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
									Ext.Msg.alert(_('Success'),  _('Start successfully'));
									viewModel.set('task_status', 'true');
									smsform.down('label').setText(_('Run Status:running'));
									smsform.items.each(function(item,index,length){   
									item.setDisabled(true);
									});
                            },
                            failure: function(form, action) {
									Ext.Msg.alert(_('Failed'), _('Start unsuccessfully'));
									viewModel.set('task_status', 'false');
									smsform.down('label').setText(_('Run Status:stopping'));	
									smsform.items.each(function(item,index,length){   
									item.setDisabled(false);
									});
                            }
                        }); // form
	
		 },
		 stopService:function(){
			var smsform =this.getView().down('form');
			var viewModel =this.getViewModel();
			var view = this.getView();
			smsform.getForm().submit({
                            url: '/alarm/alarmResource/stopSmsServiceStatus',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
									Ext.Msg.alert(_('Success'), _('Stop successfully'));
								viewModel.set('task_status', 'false');
								smsform.down('label').setText(_('Run Status:stopping'));	
								smsform.items.each(function(item,index,length){   
							    item.setDisabled(false);
								});
		
                            },
                            failure: function(form, action) {
								Ext.Msg.alert(_('Failed'), _('Stop unsuccessfully'));
								viewModel.set('task_status', 'true');
								smsform.down('label').setText(_('Run Status:running'));
								smsform.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
                            }
                        }); // form
			
		 },
		onTest:function(){
		 var form =this.getView().down('form');
		 form.getForm().submit({
                            url: '/alarm/alarmResource/testSMSConnection',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('With Errors'), action.result.msg);
                                } else {
                                    Ext.Msg.alert(_('Success'), action.result.msg);
                                }
								 Ext.Msg.alert(_('Success'),_('Connect successfully'));
								//view.setActiveItem(alarmNotifyListGrid);
                              //  alarmNotifyListGrid.getStore().reload();
								
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), _('Connect unsuccessfully'));
                            }
                        }); // form
	
		
		},
	
		onApply:function(){
		
		var form =this.getView().down('form');
		form.getForm().submit({
                            url: '/alarm/alarmResource/modifySmsTemplateKeys',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('With Errors'), action.result.msg);
                                } else {
                                    Ext.Msg.alert(_('Success'), action.result.msg);
                                }
								 Ext.Msg.alert(_('Success'), _('Set successfully'));
								
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Failed'), _('Set unsuccessfully'));
                            }
                        }); // form
	 //	this.onRefresh();
			
		},
		onInsert:function(){
			
		var form =this.getView().down('form');
	
		var textArea = form.down('textarea');

		var textAreaValue= textArea.value;
		
		var combobox = form.down('combobox');
		
		var comboboxValue= combobox.value;		
		var value= textAreaValue +''+'%'+comboboxValue+'%';
		textArea.setRawValue(value); 
		textArea.value =value;
			
		},

        onRefresh: function() {
			
        var form =this.getView().down('form');
		Ext.Ajax.request({
							url : '/alarm/alarmResource/getSmsConfigParams',
							success : function(response) {
							var value =  Ext.decode(response.responseText);							
							form.getForm().setValues(value);
								}
		});
		
		
		
        },

     
    },

		items:[
		{
		xtype:'form',
		margin:10,
		trackResetOnLoad:true,
		reference: 'alarmSmsConfigNotifyPanel',
		title:_('Alarm Sms Service'),
		iconCls: 'x-fa fa-circle-o',
		layout:{
				type:'vbox',
				align:'center'
			},
			fieldDefaults : {
			labelWidth : 90,
			labelAlign : "right",
			},
		bbar:[ 
                       //添加按钮  
                       '->',
                      {  
                       	xtype:'label',
                   		text:_('Run Status:stopping'),
                   	
                   		
                   	},
					 {  
             		text:_('Start'),
             		tooltip:_('Start'),
					iconCls:'process_start',
             	    bind: {
					disabled: '{task_status=="true"}'
					} ,
                   	handler:'startService'
             		
					},
					{  
             		text:_('Stop'),
             		tooltip:_('Stop'),
					iconCls:'process_stop',
             	    bind: {
					disabled: '{task_status=="false"}'
					} ,
                   	handler:'stopService'
             		
					},
				//	{  
                //       	text:_('Apply'),
               //        	tooltip:_('Apply'),
			   //		iconCls:'x-fa fa-save',
               //        	handler:'onApply',
			//		bind: {
			//			disabled: '{task_status=="true"}'
			//			} 
                       		
             //       },
					{
                       	text:_('Refresh'),
                       	tooltip:_('Refresh'),
						iconCls:'x-fa fa-refresh',
                       	handler:'onRefresh',
						bind: {
						disabled: '{task_status=="true"}'
						}
						
                    },
					{
                 		text:_('Test Server Connection'),
                 		tooltip:_('Test Server Connection'),
						iconCls:'',
						bind: {
						disabled: '{task_status=="true"}'
						} ,
                 	    handler:'onTest'
                 	}
                        	
          ],		
		items: [
		
		{
			xtype: 'fieldset',
			title: _('Sms Config Params'),
			width:800,
			defaults: {
			 anchor: '100%'
		 },
		items:[
			{
			xtype:'textfield',
            fieldLabel: 'start',
            name: 'start',
			bind: {
			value: '{task_status=="true"}'
			},
			hidden:true
         },
		 {
			xtype:'textfield',
            fieldLabel: _('User Uid'),
			allowBlank:false,
            name: 'uid'
         },
		 {
			xtype:'textfield',
            fieldLabel: _('User Key'),
			allowBlank:false,
            name: 'key'
        },
		{
           	 xtype:'textarea',
           	 fieldLabel: _('Sms template Content'),
			 name:'template',
			 value:'',
           	
        }, 
		{
            xtype: 'fieldcontainer',
            layout: 'hbox',
			items:[
			{
        	xtype:'combobox',
        	fieldLabel: _('template Keywords'),
	         name: 'keywords',
	         queryMode:'local',
			 bind: {
              store: '{keywordsStore_remote}',
			},  
			 value:_('Circuit ID'),			
	         displayField:"text",
			 valueField : 'value',
        },
		 {
        	xtype:'button',
        	text:_('Insert'),
			handler:'onInsert'
        
		}
			]
		}
		
		 
		
        ]
		}],
			listeners: {
		//	render: 'onRender',
		},
	
		}
	],
   

});
