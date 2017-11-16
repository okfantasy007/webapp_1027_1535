Ext.define('Admin.view.alarms.alarmnotify.alarmSocketNotifyView', {
    extend: 'Ext.panel.Panel',
	xtype:'alarmSocketNotifyView',
  
    cls: 'shadow',
    viewModel: {
		
		data:{
			task_status:'false'	
		},
        stores: {
          
        }
    },

    controller: {  
		onRefresh: function() {
			var socketform = this.getView().down('form');
	
				Ext.Ajax.request({
							url : '/alarm/alarmResource/getSocketNotifyService',
							success : function(response) {
							socketform.getForm().setValues( Ext.decode(response.responseText));
							
								}
		});
        },
		onRender:function(){
			var socketform = this.getView().down('form');
			Ext.Ajax.request({
							url : '/alarm/alarmResource/getSocketServerStatus',
							success : function(response) {							
							if(response.responseText=='true'){
								socketform.down('label').setText(_('Run Status:running'));
							}else{
							   socketform.down('label').setText(_('Run Status:stopping'));	
							}
							
								}
		});
		
		
		},
	
        onApply:function(){
			
			var form = this.getView().down('form');
	
			form.getForm().submit({
                            url: '/alarm/alarmResource/modifySocketServiceStatus',
                            
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

        onRefresh: function() {
		 var socketform = this.getView().down('form');
           Ext.Ajax.request({
							url : '/alarm/alarmResource/getSocketNotifyService',
							success : function(response) {

							socketform.getForm().setValues( Ext.decode(response.responseText));
							
							
								}
			});
			Ext.Ajax.request({
							url : '/alarm/alarmResource/getSocketServerStatus',
							success : function(response) {						
							
							if(response.responseText=='true'){
								socketform.down('label').setText(_('Run Status:running'));
							}else{
							   socketform.down('label').setText(_('Run Status:stopping'));	
							}
							
								}
			});
		
        },

		 startService:function(){
			var viewModel =this.getViewModel();
			var socketform =this.getView().down('form');
			Ext.Msg.confirm(_("Confirm"), _("Save Config Data"), function (btn) {			
			if(btn=='yes'){
				socketform.getForm().submit({
                            url: '/alarm/alarmResource/modifySocketServiceStatus',
                            
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
							
                               Ext.Ajax.request({
								url : '/alarm/alarmResource/startSocketServiceStatus',
								success : function(response) {							
								if(response.responseText){
								var r =  Ext.decode(response.responseText);
								 Ext.Msg.alert(_('Success'), _('Set successfully'));
								viewModel.set('task_status', 'true');
								socketform.down('label').setText(_('Run Status:running'));
								socketform.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
								}else{
								var r =  Ext.decode(response.responseText);
								 Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
								viewModel.set('task_status', 'false');
								socketform.down('label').setText(_('Run Status:stopping'));	
								socketform.items.each(function(item,index,length){   
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
							url : '/alarm/alarmResource/startSocketServiceStatus',
							success : function(response) {						
							if(response.responseText){
								var r =  Ext.decode(response.responseText);
								 Ext.Msg.alert(_('Success'), _('Set successfully'));
								viewModel.set('task_status', 'true');
								socketform.down('label').setText(_('Run Status:running'));
								socketform.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
							}else{
								var r =  Ext.decode(response.responseText);
								 Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
								viewModel.set('task_status', 'false');
								socketform.down('label').setText(('Run Status:stopping'));	
								socketform.items.each(function(item,index,length){   
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
			 var form =this.getView().down('form');
			 Ext.Ajax.request({
							url : '/alarm/alarmResource/stopSocketServiceStatus',
							success : function(response) {					
						 if(response.responseText){
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), _('Set successfully'));
								viewModel.set('task_status', 'false');
								form.down('label').setText(_('Run Status:stopping'));	
								form.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								
							}else{
								var r =  Ext.decode(response.responseText);
								Ext.Msg.alert(_('Success'), _('Set unsuccessfully'));
								viewModel.set('task_status', 'true');
								form.down('label').setText(_('Run Status:running'));
								form.items.each(function(item,index,length){   
								item.setDisabled(true);
								});
								
							}
						
							
								}
						}); 
		 }

       
       
    },

	title:_('Socket Server Set'),
	iconCls: 'x-fa fa-circle-o',
	margin:10,
    items:[
		{
			xtype:'form',
			items: [
			{
				xtype:'panel',
				items:[	
				{
				xtype: 'fieldset',
				title: _('Port Params'),
				fieldDefaults : {
				labelWidth : 150,
				labelAlign : "right",
 
			},
				items:[
				
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				{
					xtype:'numberfield',
	  	            fieldLabel: _('Port'),
	  	            name: 'port',
					maxValue:65535,
					minValue:1,
					hideTrigger:true,
	  	        },
	  	        {
					xtype:'numberfield',
	  	            fieldLabel: _('Max Client Connections'),
	  	            name: 'msxSessionCount',
					maxValue:65535,
					minValue:1,
					hideTrigger:true
	  	        }
				
				]},
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				{
				  	xtype:'numberfield',
	  	        	fieldLabel: _('Msg Send TimeOut'),
	   	            name: 'sendTimeOut',
					maxValue:65535,
					minValue:1,
					hideTrigger:true
	  	           	
	  	        },
	  	      {
				 xtype:'numberfield',
	  	         fieldLabel: _('Msg Send Rentry'),
	   	         name: 'sendRetryTimes',
				 maxValue:65535,
				 minValue:1,
				 hideTrigger:true
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
				title: _('Config Params'),
				fieldDefaults : {
				labelAlign : 'right',
				labelWidth : 150
				},
				items:[
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				  {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Circuit ID'),
	  	            name: 'circuitNumValue',
	  	            labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Type ID'),
	  	            name: 'alarmTypeIdValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Last Report Time'),
	  	            name: 'latestReportTimeValue',
	  	            labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Node Name'),
	  	            name: 'alarmNodeNameValue',
	  	            labelAlign:'right',
		   	        labelWidth:150,
	  	        }
				]},
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				 {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Ack Log'),
	  	            name: 'alarmConfigLogVlaue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Ack Time'),
	  	            name: 'alarmConfigTimeValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: 'URL',
	  	            name: 'urlValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Device Type'),
	  	            name: 'deviceTypeValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        }
				]},
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				 {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm ID'),
	  	            name: 'alarmIdValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Customer Name'),
	  	            name: 'customerNameValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Node IP'),
	  	            name: 'alarmNodeIpValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Clearing Log'),
	  	            name: 'alarmClearLogValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        }
				]},
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				   {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Name'),
	  	            name: 'alarmNameValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Clearing Time'),
	  	            name: 'alarmClearTimeValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Count'),
	  	            name: 'frequencyValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Location'),
	  	            name: 'alarmLoctionValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        }
				]},
				
				{
				xtype: 'container',
				layout: 'hbox',
				margin: '0 0 5 0',
				items: [
				{
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Node ID'),
	  	            name: 'alarmNodeIdValue',
	  	            labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Status'),
	  	            name: 'alarmStatusValue',
	  	            labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Time'),
	  	            name: 'alarmTimeValue',
	  	          labelAlign:'right',
		   	        labelWidth:150,
	  	        },
	  	      {
	  	        	xtype:'checkbox',
	  	            fieldLabel: _('Alarm Level'),
	  	            name: 'alarmLevelValue',
	  	            labelAlign:'right',
		   	        labelWidth:150,
	  	        }
				]}
				
				
				]}
			
				]
			}
			
			  
	  	      
	  	        
	  	    ],
			
			listeners: {
			//render: 'onRender',
		},	
		bbar:[ 
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
             		
             	},{  
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
		}
	
                
             ],
	
   

});
