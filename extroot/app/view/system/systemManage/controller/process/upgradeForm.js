Ext.define('Admin.view.system.systemManage.controller.process.upgradeForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.upgradeForm',

    onCancel: function() {
        this.getView().up().setActiveItem(0);
    },
    
    onSubmit: function() {
    	var card = this.getView().up();
    	    view = card.down('#processMainGrid');
            processGrid = card.down('#processGrid');
    	    upgradeForm = card.down('#upgradeForm');	
 
	    if(upgradeForm.getForm().isValid()){ 
	    	var path = upgradeForm.form.findField("upload_file").value;
		    var params = {  
		    		"path":path
	        };
		    var paramsData = JSON.stringify(params); 
	    	upgradeForm.getForm().submit({
         		 url: '/system/upload', 
                 waitTitle:_('Connecting'),
                 waitMsg: _('Transmit data...'),
                 success: function (response, action) {
			        	 Ext.Ajax.request({
	   			        		url: '/sysmanage/sysmng/process?act=2',
	   			                method : "post",
	   			                jsonData: paramsData,
	   			                headers: { "Content-Type": 'application/json' },
	   			                success: function(response, action) {
	   			                   Ext.Msg.alert(_('Success'),_('Upgrade system successfully'));
	   			                   processGrid.store.reload(); 
       	                           card.setActiveItem(view) 
	   			                 },
	   			                 failure: function(response, action) {
	   			                   Ext.Msg.alert(_('Failed'),_('Upgrade system failed'));
	   			                 }
	   			             });
                 },
                 failure: function(form, action) {
                     Ext.Msg.alert(_('Failed'), _('Upload Failed'));
                 }
                
             }); 
	  }else{  
		  Ext.Msg.alert(_('Notice'),_('Please select file and upload again'));  
	  }
    } 
});
