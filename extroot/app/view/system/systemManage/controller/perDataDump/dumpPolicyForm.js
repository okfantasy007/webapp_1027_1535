Ext.define('Admin.view.system.systemManage.controller.perDataDump.dumpPolicyForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.dumpPolicyForm',
    
    onDumpPolicySave: function()  {
    	var card=this.getView().up(),
    	dumpPolicyForm = card.down('#dumpPolicyForm');
    	
    	if (!dumpPolicyForm.getForm().isValid()) {
	   		Ext.MessageBox.alert(_('Error'), _('Please check the configuration information is correct'));
	   		return;
	   	}
    	
	    var newDumpPolicyId = dumpPolicyForm.form.findField("dumpPolicyId").value;
	    var fileFormat = dumpPolicyForm.form.findField("fileFormat").value,
	    csvStorageDays = dumpPolicyForm.form.findField("csvStorageDays").value,
	    csvStorageCapacity = dumpPolicyForm.form.findField("csvStorageCapacity").value,
	    dumpPolicyId = ("" != newDumpPolicyId && null != newDumpPolicyId) ? parseInt(newDumpPolicyId) : 0;
        	
		var params = { 
			csvStorageCapacity: csvStorageCapacity,
			csvStorageDays: csvStorageDays,
			fileFormat: fileFormat,
			id: dumpPolicyId
	    };
		
	    Ext.Ajax.request({
	        url : "/pmManagement/api/pmdata/storage/management/updateCSVRP",
	        method : "post",
	        jsonData: params,
	        headers: { "Content-Type": 'application/json' },
	        success: function(response, action) {
	        	var obj = Ext.decode(response.responseText);
	        	if(obj.success == false){
	        		Ext.Msg.alert(_('Failed'),obj.cause);
	        	}else{
	        		Ext.Msg.alert(_('Success'),_('Update the dump policy successfully'));
	        	}
	        },
	        failure: function(response, action) {
	        	Ext.Msg.alert(_('Failed'),_('Update the dump policy failed'));
	        }
	   });   
    },
    
});