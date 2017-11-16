Ext.define('Admin.view.alarms.alarmnotify.alarmTrapNotifyView', {
    extend: 'Ext.panel.Panel',
	xtype:'alarmTrapNotifyView',
    cls: 'shadow',
    viewModel: {
		
		data:{
			task_status:'false'	
		},
        stores: {
           
			trapOid_list_remote:
			{
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTrapInfo',
                    reader: {
                        type: 'json',
                        rootProperty: 'alarmVariableList',
                    }
                }

            },
			trapIp_list_remote:
			{
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTrapIpInfo',
                    reader: {
                        type: 'json'
                    }
                }

            }
		
        }
    },

    controller: {  
	
		onApply:function(){
			var tabpanel =this.getView().down('tabpanel');
			var ipForm = this.getView().down('tabpanel').down('form');
			var ipgrid = ipForm.down('grid');
			var msfForm =  this.getView().down('tabpanel').down('form').nextSibling();
			var oidgrid = msfForm.down('grid');
			var ipstore =ipgrid.getStore();
		
			var ipjson='';
			for(var i=0;i<ipstore.data.length;i++){
				var record = ipstore.getAt(i); 
				var trapIp = record.get('targetIp');
			
			ipjson= ipjson +trapIp +";"
				
			}
			ipjson=ipjson.substring(0,ipjson.length-1);
			var odiStore = oidgrid.getStore();
			
			var oidjson="[";
			if(odiStore.data.length==0){
				oidjson='[]';
			}else{
				
				for(var i=0;i<odiStore.data.length;i++){
				oidjson= oidjson+'{';
				var record = odiStore.getAt(i); 
				var value = record.get('value');
				var oid =record.get('oid');
				var resource =record.get('resource');
				var type =record.get('type');
			oidjson= oidjson  +"value :'"+value+"',"+" oid:'"+oid +"',"+" resource:'"+resource+"',"+" type:'"+type+"'},"
				
			}
			oidjson=oidjson.substring(0,oidjson.length-1)+"]";
			}

			msfForm.getForm().submit({
                            url: '/alarm/alarmResource/modifyTrapInfo',
                            params:{ipjson:ipjson,oidjson:oidjson},
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                               Ext.Msg.alert(_('Success'), _('Set successfully'));
								
								
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
                            }
                        }); // form
				
			
		},
	
		onIpAdd:function(){
			
			var ipForm = this.getView().down('tabpanel').down('form');

			if(ipForm.isValid()){
				var ipValue = ipForm.down('textfield').value;
				var msgValue = ipForm.down('textfield').nextSibling().value;
				var grid= ipForm.down('grid');
				var trapIp=ipValue+':'+msgValue;
				var rec = {'targetIp': trapIp};
				grid.getStore().insert(grid.store.getCount(),rec);
			
			}else{
				 Ext.Msg.alert(_('Tips'), _('please enter a valid ip address'));
			}
			
			
			//var data = "{"+"}";
			//textArea.setValue(textArea.value+'\n'+ipValue+''+msgValue);
			
		},
		onIpDelete:function(){
			
			var ipForm = this.getView().down('tabpanel').down('form');
			var grid = ipForm.down('grid');
			var records = grid.getSelectionModel().getSelection();
			 for(var i=0 ;i<records.length;i++){
             grid.getStore().remove(records[i]);
            }
			//var data = "{"+"}";
			//textArea.setValue(textArea.value+'\n'+ipValue+''+msgValue);
			
		},
		onOidDelete:function(){
				
			var msfForm =  this.getView().down('tabpanel').down('form').nextSibling();
			var oidgrid = msfForm.down('grid');
			 var records = oidgrid.getSelectionModel().getSelection();
			 for(var i=0 ;i<records.length;i++){
             oidgrid.getStore().remove(records[i]);
            }
		},
		onOidAdd:function(){
			
		var msfForm =  this.getView().down('tabpanel').down('form').nextSibling();
		var oidgrid = msfForm.down('grid');
		var oidStore = oidgrid.getStore();
		var oidjson="[" ;
		if(oidStore.data.length==0){
			oidjson = '[]';
		}else{
			for(var i=0;i<oidStore.data.length;i++){
			oidjson= oidjson+'{';
			var record = oidStore.getAt(i); 
			var value = record.get('value');
			var oid =record.get('oid');
			var resource =record.get('resource');
			var type =record.get('type');
			oidjson= oidjson  +"value :'"+value+"',"+" oid:'"+oid +"',"+" resource:'"+resource+"',"+" type:'"+type+"'},"
				
			}
			oidjson=oidjson.substring(0,oidjson.length-1)+"]";
		}

		var oidForm = Ext.create('Ext.form.Panel',{
            reference:'oidForm',
            title:_('Basic Info'),
			reader:{type:'json',root: 'data'},
            header:false,
            border:false,
            collapsible:true,
			fieldDefaults : {
			labelWidth : 90,
			labelAlign : "right",
			},
            layout:{type:'table',columns:1},
            items:[

                {
                    xtype:'textfield',
                    fieldLabel: _('Properties'),
                    name: 'resource',
					readOnly: true
                },
               {
                    xtype:'textfield',
                    fieldLabel: 'OID',
                    name: 'oid',
					readOnly: true
                },
                {
                xtype:'textfield',
                fieldLabel: _('Type'),
                name: 'type',
				readOnly: true
                },
				{
                xtype:'textfield',
                fieldLabel: 'value',
                name: 'value',
				hidden:true
                },

                  ],
        }); 


	var oidEditWin = Ext.create("Ext.window.Window", {
                reference:'oidEditWin',
                title:_('templateEdit'),
                closable:true,       //这里要注意不要写成 closeable（多一个e）
                autowidth:true,
                autoheight:true,
                border:false,
                layout: 'auto',
                bodyStyle : "padding:20px;", 
                items:oidForm,
                closeAction:'hide',
				modal:true,
				resizable:false,
                width:400,
                height:250,
                buttons: [
                  { xtype: "button", text: _("Ok"), handler: function () {
                   //发起ajax请求；
				   var trapMsg = oidForm.getForm().getValues();
				
				   	oidgrid.getStore().insert(oidgrid.store.getCount(),trapMsg);
                    oidEditWin.close();
                      } },
                  { xtype: "button", text: _("Cancel"), handler: function () { 
                     oidEditWin.close();
                      } }
              ]
             }); 
			// alert(levelStore);
			    oidEditWin.show();
				Ext.Ajax.request({
							url : '/alarm/alarmResource/addTrapInfo',
							method:'post',
							params:{condition:oidjson},
							success : function(response) {
							var value =  Ext.decode(response.responseText);
							oidForm.getForm().setValues(value);
								}
		});
				
  
               
			
		},
	
      
        onRefresh: function() {
			var ipform =this.getView().down('tabpanel').down('form');
			ipform.getForm().reset();
			var msgform = this.getView().down('tabpanel').down('form').nextSibling();
			msgform.getForm().reset();
			var ipgrid = this.getView().down('tabpanel').down('grid');
			ipgrid.getStore().reload();
			var oidgrid = this.getView().down('tabpanel').down('form').nextSibling().down('grid');
			oidgrid.getStore().reload();
            Ext.Ajax.request({
							url : '/alarm/alarmResource/getTrapInfo',
							success : function(response) {							
							ipform.getForm().setValues( Ext.decode(response.responseText));
							msgform.getForm().setValues( Ext.decode(response.responseText));
							
								}
		});
        },
		 startService:function(){
			var viewModel =this.getViewModel();
			var tabpanel =this.getView().down('tabpanel');
			var ipform =this.getView().down('tabpanel').down('form');
			var msgform = this.getView().down('tabpanel').down('form').nextSibling();
			var ipgrid = ipform.down('grid');
			var oidgrid = msgform.down('grid');
			var ipstore =ipgrid.getStore();
			var oidstore =oidgrid.getStore();
			if(ipstore.data.length==0){
				  Ext.Msg.alert(_('Tips'), _('Trap Target Address'));
				   return;

			}
			
			if(oidstore.data.length==0){
				  Ext.Msg.alert(_('Tips'), _('Trap Message Set'));
				  return;
			}
				
			Ext.Msg.confirm(_("Confirm"), _("Save Config Data"), function (btn) {
			
			if(btn=='yes'){
			var ipstore =ipgrid.getStore();
		
			var ipjson='';
			for(var i=0;i<ipstore.data.length;i++){
				var record = ipstore.getAt(i); 
				var trapIp = record.get('targetIp');
			
			ipjson= ipjson +trapIp +";"
				
			}
			ipjson=ipjson.substring(0,ipjson.length-1);
			var odiStore = oidgrid.getStore();
			
			var oidjson="[";
			if(odiStore.data.length==0){
				oidjson='[]';
			}else{
				
				for(var i=0;i<odiStore.data.length;i++){
				oidjson= oidjson+'{';
				var record = odiStore.getAt(i); 
				var value = record.get('value');
				var oid =record.get('oid');
				var resource =record.get('resource');
				var type =record.get('type');
			oidjson= oidjson  +"value :'"+value+"',"+" oid:'"+oid +"',"+" resource:'"+resource+"',"+" type:'"+type+"'},"
				
			}
			oidjson=oidjson.substring(0,oidjson.length-1)+"]";
			}

			msgform.getForm().submit({
                            url: '/alarm/alarmResource/modifyTrapInfo',
                            params:{ipjson:ipjson,oidjson:oidjson},
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
							Ext.Ajax.request({
							url : '/alarm/alarmResource/startTrapServiceStatus',
							success : function(response) {
							
							if(response.responseText){
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), _('Set successfully'));
								viewModel.set('task_status', 'true');
								ipform.down('label').setText(_('Run Status:running'));
								ipform.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
								msgform.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Failed'), _('Set unsuccessfully'));
								viewModel.set('task_status', 'false');
								ipform.down('label').setText(_('Run Status:stopping'));	
								ipform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								msgform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
							}
							
						
							
								}
				});
								
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
								return ;
                            }
                        }); // form
				
				
				
				
			}else{
				Ext.Ajax.request({
							url : '/alarm/alarmResource/startTrapServiceStatus',
							success : function(response) {
						
							if(response.responseText){
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), _('Set successfully'));
								viewModel.set('task_status', 'true');
								ipform.down('label').setText(_('Run Status:running'));
								ipform.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
								msgform.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Failed'), _('Set unsuccessfully'));
								viewModel.set('task_status', 'false');
								ipform.down('label').setText(_('Run Status:stopping'));	
								ipform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								msgform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
							}
							
						
							
								}
				});
			}
			});
				
			
				
			
			
		 },
		 stopService:function(){
			 var viewModel =this.getViewModel();
			 var view = this.getView();
			 var form =this.getView().down('tabpanel').down('form');
			 var msgform = this.getView().down('tabpanel').down('form').nextSibling();
			Ext.Ajax.request({
							url : '/alarm/alarmResource/stopTrapServiceStatus',
							success : function(response) {
							
						 if(response.responseText){
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), _('Set successfully'));
								viewModel.set('task_status', 'false');
								form.down('label').setText(_('Run Status:stopping'));	
								form.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								msgform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Failed'), _('Set unsuccessfully'));
								viewModel.set('task_status', 'true');
								form.down('label').setText(_('Run Status:running'));
								form.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
								msgform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								
							}
						
							
								}
						}); 
		 }

        
        

    },
	items:[
	{
			xtype:'tabpanel',
			height:'100%',
			margin:10,
			reference: 'alarmTrapNotifyPanel',
			title:_('Trap Server Set'),
			iconCls: 'x-fa fa-circle-o',
			header:true,
			autoLoad:true,
			bbar:[ 
                '->',
					{  
                		text:_('Apply'),
                		tooltip:_('Apply'),
						iconCls:'x-fa fa-save',
						bind: {
						disabled: '{task_status=="true"}'
						} ,
                	    handler:'onApply'
                		
                	},{
                		text:_('Refresh'),
                		tooltip:_('Refresh'),
						iconCls:'x-fa fa-refresh',
                	    handler:'onRefresh',
						bind: {
						disabled: '{task_status=="true"}'
						} ,
                	}                        	
                ],
			items:[
			{
			xtype:'form',
			title:_('Trap Target Ip'),
			height:'600',
			autoScroll:true,
			reference: 'alarmTrapIpNotifyPanel',
			bbar:
			[ 
                       //添加按钮  
                       '->',
                      	 {  
                       	xtype:'label',
                   		text:_('Run Status:stopping'),
                   		forId:'runStatus',
                   		
                   	},{  
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
                   		
                   	}                   	
               ],
			 items: [
			 
			 {
			xtype: 'fieldset',
			title: _('Trap Ip Config Params'),
			layout: 'hbox',
			defaults: {
			 anchor: '100%',
			 labelWidth : 90,
			labelAlign : "right",
			},
			items:[
			{
				xtype:'textfield',
  	            fieldLabel: _('Target Ip'),
				allowBlank:false,
				regex:/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
				regexText:_('Please Enter Right IP Address'),
  	            name: 'Ip',
				
  	          
  	        },
  	        {
  	            fieldLabel: _('Target Port'),
  	            name: 'Port',
				xtype:'numberfield',
		        maxValue:65535,
		        minValue:1,
		        hideTrigger:true,
				value:'162'
  	           
  	        }
			 ]},
			 
			{
  	           	 xtype:'grid',
				 height: 300,
				 title:_('Trap IP List'),
				 width:'100%',
				 border:true,
			tbar:[ 
            	{  
                		text:_('Add'),
                		tooltip:_('Add'),
						iconCls:'x-fa fa-plus',
                	    handler:'onIpAdd'
                		
                	},{
                		text:_('Delete'),
                		tooltip:_('Delete'),
						iconCls:'x-fa fa-trash',
                	    handler:'onIpDelete'
                	} 					
                ],
				 columns: [
				{ text: _('IP List'), dataIndex: 'targetIp', width:'100%' },
				], 
				bind:{
					store:'{trapIp_list_remote}',
				},
				
				
  	           	
  	           	
  	        }
  	        
			]
			},
			{
			xtype:'form',
			title:_('Trap Message'),
			height:'600',
			autoScroll:true,
			reference: 'alarmTrapMessageNotifyPanel',	
			items: [
			 {
			xtype: 'fieldset',
			title: _('Trap Message Config Params'),
			layout: 'hbox',
			defaults: {
			 anchor: '100%',
			 labelWidth : 90,
			labelAlign : "right",
			},
			 items:[
			 {
				xtype:'textfield',
  	            fieldLabel: _('SNMP Version'),
  	            name: 'snmpVersion',
				readOnly:true
  	        },
  	        {
				xtype:'textfield',
  	            fieldLabel: _('Community'),
  	            name: 'community',
  	        },
			{
				xtype:'textfield',
  	        	fieldLabel: _('Enterprice OID'),
   	            name: 'enterpriceOid',
  	           	
  	        }
			 ]},
			{
				title:_('Variable List'),
				xtype: 'grid',
				height:300,
				border:true,
				autoScroll:true,
				bind:{
					store:'{trapOid_list_remote}',
				},
				columns: [
				{ text: _('Properties'), dataIndex: 'resource',width:'20%'},
				{ text: 'OID', dataIndex: 'oid' , width:'20%'},
				{ text: _('Properties'), dataIndex: 'value', width:'20%',hidden:true},
				{ text: _('Type'), dataIndex: 'type', width:'20%' }
				],
				
				tbar:[
				{  
                		text:_('Add'),
                		tooltip:_('Add'),
						iconCls:'x-fa fa-plus',
                	    handler:'onOidAdd'
                		
                	},{
                		text:_('Delete'),
                		tooltip:_('Delete'),
						iconCls:'x-fa fa-trash',
                	    handler:'onOidDelete'
                	} 		
				],
				
  	           	
  	        }
  	        
  	    ]
			}
			]
	}
	]
       
   

});
