Ext.define('Admin.view.alarms.alarmnotify.alarmSmsConfigNotifyView', {
    extend: 'Ext.panel.Panel',
	xtype:'alarmSmsConfigNotifyView',
    cls: 'shadow',
    viewModel: {
			data:{
			task_status:'false'	
		},
		
        stores: {
			levellist_remote:
			{
                autoLoad: true,
				 fields:["value", "text"],
                proxy: {
                    type: 'ajax',
                    url: '/alarm/getalarmLevel',
                    reader: 'json'
                }

            },
			        // 远程store
            smsType1Store: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/getSmsGSMType',
					actionMethods : { 
					 read   : 'GET',
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
		
		onRender:function(){
			 var viewModel =this.getViewModel();
			 var form =this.getView().down('form');
				Ext.Ajax.request({
							url : 'alarm/getSmsServerStatus',
							success : function(response) {
							console.log("112tttt",response.responseText);
							console.log("113tt",form.down('label'));
							if(response.responseText=='true'){
								console.log('cccc1',response.responseText);
								viewModel.set('task_status', response.responseText);
								form.down('label').setText('运行状态：运行中');
								form.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
							}else{
								console.log('cccc2',response.responseText);
								viewModel.set('task_status', response.responseText);
								form.down('label').setText('运行状态：已停止');	
								form.items.each(function(item,index,length){   
							   item.setDisabled(false);
								});
							}
							
								}
		});
		
		},
		 startService:function(){
			var form =this.getView().down('form');
			var viewModel =this.getViewModel();
			var view = this.getView();
			  var url ='alarm/startSmsServiceStatus'; 
					Ext.Ajax.request({
							url : url,
							success : function(response) {
							console.log("113",response.responseText);
							if(response.responseText){
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), '启动成功');
								viewModel.set('task_status', 'true');
								form.down('label').setText('运行状态：运行中');
							    form.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
								
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert('失败', '启动失败');
								viewModel.set('task_status', 'false');
								form.down('label').setText('运行状态：已停止');	
								form.items.each(function(item,index,length){   
							   item.setDisabled(false);
								});
							}
							
						
							
								}
				});
			 
			  
		
		 },
		 stopService:function(){
			var form =this.getView().down('form');
			var viewModel =this.getViewModel();
			var view = this.getView();
			Ext.Ajax.request({
							url : 'alarm/stopSmsServiceStatus',
							success : function(response) {
							console.log("113",response.responseText);
						 if(response.responseText){
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), '停止成功');
								viewModel.set('task_status', 'false');
								form.down('label').setText('运行状态：已停止');	
								form.items.each(function(item,index,length){   
							    item.setDisabled(false);
								});
								
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert('失败', '停止失败');
								viewModel.set('task_status', 'true');
								form.down('label').setText('运行状态：运行中');
								form.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
								
							}
						
							
								}
						}); 
		 },
		
		onModify:function(){
			var viewModel =this.getViewModel();
			var form =this.getView().down('form');
			form.getForm().submit({
                            url: 'alarm/modifySmsConfig',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                Ext.Msg.alert(_('Success'), '设置成功');
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), '设置失败');
                            }
                        }); // form
		}
		
		
		
       
      
    },

		items:[
		{
			xtype:'form',
			title: '告警短信参数配置',
			iconCls: 'x-fa fa-circle-o',
			margin:10,
			reference: 'alarmSmsServiceNotifyPanel',
			reader:{type:'json',root: 'data'},
			layout:{
				type:'vbox',
				align:'center'
			},
			fieldDefaults : {
			labelWidth : 90,
			labelAlign : "right",
			margin: '15 0 0 5',
			},
			bbar:[ 
                 //添加按钮  
                     '->',
                  {  
                       	xtype:'label',
                   		text:'运行状态：已停止',
                   	
                   		
                  },
				 {  
             		text:'启动',
             		tooltip:'启动',
					iconCls:'process_start',
             	    bind: {
					disabled: '{task_status=="true"}'
					} ,
                   	handler:'startService'
             		
					},{  
             		text:'停止',
             		tooltip:'停止',
					iconCls:'process_stop',
             	    bind: {
					disabled: '{task_status=="false"}'
					} ,
                   	handler:'stopService'
             		
					},
				
				 {  
                 		text:'修改',
                 		tooltip:'修改',
						iconCls:'',
                 	    handler:'onModify',
						 bind: {
						disabled: '{task_status=="true"}'
					} ,
                 		
                 	}
                  	
                 ],
			items:[
		 {
			xtype: 'fieldset',
			title: '参数配置',
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
            fieldLabel: '用户Uid',
			allowBlank:false,
            name: 'uid'
         },
		 {
			xtype:'textfield',
            fieldLabel: '用户Key',
			allowBlank:false,
            name: 'key'
        },
		]}
        
      
			],
		listeners: {
			render: 'onRender',
		},	
			
		},
		
            
        
    ],
   

});
