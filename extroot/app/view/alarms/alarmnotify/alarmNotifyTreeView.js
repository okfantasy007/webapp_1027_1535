Ext.define('Admin.view.alarms.alarmnotify.alarmNotifyTreeView', {
    extend: 'Ext.container.Container',
    xtype:'alarmNotifyTreeView',

  controller: {
	 onNotifyList:function(){
		var view = this.getView();
	    var rightView = view.up().down('panel');
		rightView.layout.setActiveItem(0);
		var grid =rightView.down('alarmNotifyListGridView').down('PagedGrid');
		grid.getStore().reload();
		
	 },
		 
	 onNotifySMSService:function(){
		var rightView = this.getView().up().down('panel');		
		rightView.layout.setActiveItem(1);
		var form =rightView.down('alarmSmsNotifyView').down('form');

		Ext.Ajax.request({
							url : '/alarm/alarmResource/getSmsConfigParams',
							success : function(response) {				
							var value =  Ext.decode(response.responseText);							
							form.getForm().setValues(value);
								}
		});
		//解决不同的用户同时登录改变服务状态，切换页面，状态不变化的问题
		 var viewModel =rightView.down('alarmSmsNotifyView').getViewModel();
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
	 onNotifyMailConfig:function(){
		
		var rightView = this.getView().up().down('panel');
		rightView.layout.setActiveItem(2);		
		var form =rightView.down('alarmMailConfigNotifyView').down('form');
		Ext.Ajax.request({
							url : '/alarm/alarmResource/getMailConfigParams',
							success : function(response) {						
							var value =  Ext.decode(response.responseText);
							form.getForm().setValues(value);
							}
		});
		
		var viewModel =rightView.down('alarmMailConfigNotifyView').getViewModel();
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

	 onNotifyTrap:function(){
		 
		var rightView = this.getView().up().down('panel');
		rightView.layout.setActiveItem(3);
		var tabpanel = rightView.down('alarmTrapNotifyView').down('tabpanel');
		tabpanel.setActiveTab(1);
		tabpanel.setActiveTab(0);
		var ipform = rightView.down('alarmTrapNotifyView').down('tabpanel').down('form');
		var msgform = rightView.down('alarmTrapNotifyView').down('tabpanel').down('form').nextSibling();
		var oidgrid = rightView.down('alarmTrapNotifyView').down('tabpanel').down('grid');
		oidgrid.getStore().reload();
		
		Ext.Ajax.request({
							url : '/alarm/alarmResource/getTrapInfo',
							success : function(response) {						
							var r = Ext.decode(response.responseText);
							msgform.getForm().setValues( Ext.decode(response.responseText));
							
							
							
								}
		});
		
		var viewModel =rightView.down('alarmTrapNotifyView').getViewModel();
				Ext.Ajax.request({
							url : '/alarm/alarmResource/getTrapServerStatus',
							success : function(response) {
							
							if(response.responseText=='true'){								
								viewModel.set('task_status', response.responseText);
								ipform.down('label').setText(_('Run Status:running'));
								ipform.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
								msgform.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
								//oidgrid.setDisabled(true);
								
							}else{								
								viewModel.set('task_status', response.responseText);
								ipform.down('label').setText(_('Run Status:stopping'));
								ipform.items.each(function(item,index,length){   
								item.setDisabled(false);
								});
								msgform.items.each(function(item,index,length){   
							   item.setDisabled(false);
								});								
								//oidgrid.setDisabled(false);
							}
							
								}
		});
		
		
		
		 
	 },
	 onNotifySocket:function(){
		 
		var rightView = this.getView().up().down('panel');
		rightView.layout.setActiveItem(4);
		var socketform = rightView.down('alarmSocketNotifyView').down('form');
		
		//var socketform_2 = test.down('alarmSocketNotifyView').down('form').nextSibling();
		Ext.Ajax.request({
							url : '/alarm/alarmResource/getSocketNotifyService',
							success : function(response) {						
							socketform.getForm().setValues( Ext.decode(response.responseText));
							//socketform_2.getForm().setValues( Ext.decode(response.responseText));
							
								}
		});
		var viewModel =rightView.down('alarmSocketNotifyView').getViewModel();
			Ext.Ajax.request({
							url : '/alarm/alarmResource/getSocketServerStatus',
							success : function(response) {						
							if(response.responseText=='true'){					
								viewModel.set('task_status', response.responseText);
								socketform.down('label').setText(_('Run Status:running'));
								socketform.items.each(function(item,index,length){   
							   item.setDisabled(true);
								});
							}else{
								viewModel.set('task_status', response.responseText);
								socketform.down('label').setText(_('Run Status:stopping'));	
								socketform.items.each(function(item,index,length){   
							    item.setDisabled(false);
								});
							}
							
								}
		});
	}
  },
	 items: [{
            xtype: 'segmentedbutton',
            items: [
			{
                text: _('Notify List'),
				pressed: true,
				handler:'onNotifyList'
            },
			{
                text: _('Sms Server'),
				handler:'onNotifySMSService'
            },
			{
                text: _('Mail Server'),
				handler:'onNotifyMailConfig'
            }, 
			{
                text: _('Trap Server'),
				handler:'onNotifyTrap'
            }, 
			{
                text: _('Socket Server'),
				handler:'onNotifySocket'
            }
			
			
			]
        }]


});
