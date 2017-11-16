Ext.define('Admin.view.system.systemManage.controller.dbBackup.dbBackupListGrid', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.dbBackupListGrid',
    
    onSelectRowChange: function(thi, selected, eOpts)   {
    	var card = this.getView();
    	card.down('#restore').setDisabled(selected.length == 0);
    	card.down('#download').setDisabled(selected.length == 0);
    },
    
    onRefresh: function()   {
    	 this.getView().down('#dbBackupListGrid').store.reload();
    },
    
    //备份
    onBackup: function()   {
         var controller = this;
    	 Ext.MessageBox.confirm(_('Confirmation'), _('Confirm backup based on existing backup policies?'), 
			function(btn) {
		        if (btn=='yes') {
		        	 Ext.Ajax.request({
		                 url :  "/sysmanage/sysmng/backup/manual",
		                 method : "post",
		                 headers: { "Content-Type": 'application/json' },
		                 success: function(response, action) {
		                	Ext.Msg.alert(_('Success'),_('Backup of data files successfully'));
		                 	controller.onRefresh();
		                 },
		                 failure: function(response, action) {
		                	Ext.Msg.alert(_('Failed'),_('Backup of data files failed'));
		                 }
		             });
		        }
		     }
	   )
   },
    
   //下载
   onDownload: function()   {
   	   var grid = this.getView().down('#dbBackupListGrid'),
       selected = grid.getSelectionModel().getSelection()[0],
       path = selected.get("path"),
       name = selected.get("name"),
       url = "/sysmanage/sysmng/backup/download?path=" + path + "&name=" + name;
	    
   	   Ext.MessageBox.confirm(_('Confirmation'), _('Make sure to download the selected data file?'), 
			function(btn) {
		        if (btn=='yes') {
		        	Ext.Ajax.request({
	                   url :  url,
	                   success: function(response, action) {
	                	  try {
	                		  if(response && response.status && 200 == response.status){
			                      window.location.href = url;
	                		  }else{
	                			  Ext.Msg.alert(_('Failed'),_('Download the backup data files failed'));
	                		  }
						  } catch (e) {
							Ext.Msg.alert(_('Failed'),_('Download the backup data files failed'));
							return;
						  }
	                	 
	                   },
	                   failure: function(response, action) {
	                	  Ext.Msg.alert(_('Failed'),_('Download the backup data files failed'));
	                   }
	             });
		    }
		})
   },
    
   //还原
   onRestore: function()   {
    	var grid = this.getView().down('#dbBackupListGrid'),
        controller = this,
        selected = grid.getSelectionModel().getSelection()[0];
        var params = { 
        		path : selected.get("path"),
        		name : selected.get("name")
    	};
    
	    Ext.MessageBox.confirm(_('Confirmation'), _('Make sure to restore the selected data file?'), 
		function(btn) {
	        if (btn=='yes') {
	        	 Ext.Ajax.request({
	                 url :  "/sysmanage/sysmng/backup/restore",
	                 method : "post",
	                 jsonData: params,
	                 headers: { "Content-Type": 'application/json' },
	                 success: function(response, action) {
	                	 Ext.Msg.alert(_('Success'),_('Restore the data files successfully'));
	                     controller.onRefresh();
	                 },
	                 failure: function(response, action) {
	                	 Ext.Msg.alert(_('Failed'),_('Restore the data files failed'));
	                 }
	             });
	        }
	     }
	  )
   }
   
});
