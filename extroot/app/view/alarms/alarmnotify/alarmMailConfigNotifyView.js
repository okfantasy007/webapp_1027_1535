Ext.define('Admin.view.alarms.alarmnotify.alarmMailConfigNotifyView', {
    extend: 'Ext.panel.Panel',
	xtype:'alarmMailConfigNotifyView',
  
    cls: 'shadow',
    viewModel: {
		data:{
			task_status:'false'	
		},
		
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getalarmType',
					extraParams: {condition: '15'},
					actionMethods : {  
					 create : 'POST',
					 read   : 'POST',
					 update : 'POST',
					 destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
					},  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
			enCodeTypeStore: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getEnCodeType',
					actionMethods : { 
					 read   : 'GET',
					},  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
			keywordsStore_remote:
			{
                autoLoad: true,
                proxy: {
					fields:["value", "text"],
                    type: 'ajax',
                    url: '/alarm/alarmResource/getSmsTemplateKeys',
                    reader: 'json'
                }

            }
			
        }
    },

    controller: {  
	
		onRender:function(){
			 var viewModel =this.getViewModel();
			 var form =this.getView().down('form');
				Ext.Ajax.request({
							url : '/alarm/alarmResource/getMailServerStatus',
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
		onTitleInsert:function(){
			
		var form =this.getView().down('form');
		var textArea = form.getForm().findField('title');

		var textAreaValue= textArea.value;
		
		var combobox = form.getForm().findField('titlekeyWords')
		
		var comboboxValue= combobox.value;
		var value= textAreaValue +''+'%'+comboboxValue+'%';
		textArea.setRawValue(value); 
		textArea.value =value;	
			
		},
		onContentInsert:function(){
			
		var form =this.getView().down('form');
	
		var textArea = form.getForm().findField('content');

		var textAreaValue= textArea.value;
		
		var combobox = form.getForm().findField('contentkeyWords')
		
		var comboboxValue= combobox.value;
		var value= textAreaValue +''+'%'+comboboxValue+'%';
		textArea.setRawValue(value); 
		textArea.value =value;	
			
		},
	onTest:function(){
		 var form =this.getView().down('form');
		  var smtp = form.getForm().findField('smtpServer').getValue();
		  if(''==smtp.trim()){
			 Ext.Msg.alert(_('Tips'), _('SMTP Server Address Invalid'));
			  return;
		  }
			  form.getForm().submit({
                            url: '/alarm/alarmResource/testMailConnection',
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
		startService:function(){
			var mailform =this.getView().down('form');
			var  isModify= mailform.getForm().isDirty();
			var viewModel =this.getViewModel();
			var view = this.getView();
			
			mailform.getForm().submit({
                            url: '/alarm/alarmResource/startMailServiceStatus',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
									Ext.Msg.alert(_('Success'),  _('Start successfully'));
									viewModel.set('task_status', 'true');
									mailform.down('label').setText(_('Run Status:running'));
									mailform.items.each(function(item,index,length){   
									item.setDisabled(true);
									});
                            },
                            failure: function(form, action) {
									Ext.Msg.alert(_('Failed'), _('Start unsuccessfully'));
									viewModel.set('task_status', 'false');
									mailform.down('label').setText(_('Run Status:stopping'));	
									mailform.items.each(function(item,index,length){   
									item.setDisabled(false);
									});
                            }
                        }); // form
	
		
			
		},
		stopService:function(){
			 var viewModel =this.getViewModel();
			 var view = this.getView();
			  var mailform =this.getView().down('form');
			  mailform.getForm().submit({
                            url: '/alarm/alarmResource/stopMailServiceStatus',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
									Ext.Msg.alert(_('Success'), _('Stop successfully'));
								viewModel.set('task_status', 'false');
								mailform.down('label').setText(_('Run Status:stopping'));	
								mailform.items.each(function(item,index,length){   
							    item.setDisabled(false);
								});
		
                            },
                            failure: function(form, action) {
								Ext.Msg.alert(_('Failed'), _('Stop unsuccessfully'));
								viewModel.set('task_status', 'true');
								mailform.down('label').setText(_('Run Status:running'));
								mailform.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
                            }
                        }); 
		},
		 onApply: function() {
			var mailform =this.getView().down('form');
			mailform.getForm().submit({
                            url: '/alarm/alarmResource/modifyMailConfigParams',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('With Errors'), action.result.msg);
                                } else {
                                    Ext.Msg.alert(_('Success'), action.result.msg);
                                }
								 Ext.Msg.alert(_('Success'), _('Set successfully'));
								//view.setActiveItem(alarmNotifyListGrid);
                              //  alarmNotifyListGrid.getStore().reload();
								
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Failed'), _('Set unsuccessfully'));
                            }
                        });
	
		 
        },

        onRefresh: function() {
		
		var mailform =this.getView().down('form');
		
		Ext.Ajax.request({
							url : '/alarm/alarmResource/getMailConfigParams',
							success : function(response) {						
							var value =  Ext.decode(response.responseText);						
							mailform.getForm().setValues(value);
								}
		});		
		
		
		
        }

     
    },

    items:[
		{
			xtype:'form',
			margin:10,
			reference: 'alarmMailConfigNotifyPanel',
			title:_('Alarm Mail Service'),
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
				  '->',
				  _('Running status') + ':',
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
                 		
                 	},{
                 		text:_('Stop'),
                 		tooltip:_('Stop'),
						iconCls:'process_stop',
                 	    bind: {
						disabled: '{task_status=="false"}'
						} ,
                 	     handler:'stopService'
                 	},
				//	{  
                 //      		text:_('Apply'),
                //       		tooltip:_('Apply'),
				//			iconCls:'x-fa fa-save',
				//			bind: {
				//			disabled: '{task_status=="true"}'
				//			} ,
                //       	    handler:'onApply'
                       		
                //     },
					 {
                       		text:_('Refresh'),
                       		tooltip:_('Refresh'),
							iconCls:'x-fa fa-refresh',
							bind: {
							disabled: '{task_status=="true"}'
							} ,
                       	    handler:'onRefresh'
                     },
					
					{
                 		text:_('Test Server Connection'),
                 		tooltip:_('Test Server Connection'),
						bind: {
						disabled: '{task_status=="true"}'
						} ,
                 	    handler:'onTest'
                 	}
                  	
                 ],
			items:[
			
			{
			xtype: 'fieldset',
			title: _('Mail Config Params'),
			width:800,
			defaults: {
			 anchor: '100%'
		},
			items:[
			{
				xtype:'textfield',
				fieldLabel: _('SMTP Server'),
				allowBlank:false,
				name: 'smtpServer'
				},
				{
				xtype:'textfield',
				fieldLabel: _('Port'),
				name: 'port'
				},
				{
				xtype:'checkbox',
				boxLabel: _('Mail encode Type'),
				name: 'encryptTypeEnable',
				checked:false
			},
			{
        	 xtype:'combobox',
        	 fieldLabel: _('encode Type'),
	         name: 'encryptType',
	         emptyText:_("--Please select--"),
	         bind:{store:'{enCodeTypeStore}'},
  	         displayField:"text",
			 valueField : 'value'
			},
			{
			xtype:'textfield',
            fieldLabel: _('Account'),
            name: 'userName',
			vtype:'email',
			},
			{
			xtype:'textfield',
            fieldLabel: _('Password'),
            name: 'passWord',
			inputType: 'password',
			},
			
	//		{
  //      	xtype:'checkbox',
   //         boxLabel: '邮件发送时身份验证',
  //          name: 'mailCheck',
	//		handler :'onCheck'
	//		},
			
			{
           	 xtype:'textarea',
           	 fieldLabel: _('Mail Title Template'),
			 name:'title'
           	
			},
			{
            xtype: 'fieldcontainer',
            layout: 'hbox',
			items:[
				{
        	xtype:'combobox',
        	fieldLabel: _('Title KeyWords'),
	         name: 'titlekeyWords',
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
			handler:'onTitleInsert'
			}
			]
			},
			{
           	 xtype:'textarea',
           	 fieldLabel: _('Mail Content Template'),
			 name:'content',
           	
			},
			{
            xtype: 'fieldcontainer',
            layout: 'hbox',
			items:[
			{
        	xtype:'combobox',
        	fieldLabel: _('Content KeyWords'),
	         name: 'contentkeyWords',
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
			handler:'onContentInsert'
		}
			]
			}
			
			]}
			],
		listeners: {
		//	render: 'onRender',
		},	
			
		},
  
        
    ],

});
