Ext.define('Admin.view.system.systemManage.controller.perDataDump.storagePolicyForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.storagePolicyForm',
    
    onChangeRadiogroup: function() {
    	var card = this.getView().up(),
    	controller = this,
    	storagePolicyForm = card.down('#storagePolicyForm'),
    	dumpPolicyForm = card.up().down('#dumpPolicyForm'),
    	
    	newValue = storagePolicyForm.down('#dbRpIsEnable').getValue().dbRpIsEnable;
	    if(newValue == 1){
	    	storagePolicyForm.down('#csvRpIsEnable').setDisabled(false);
	    	storagePolicyForm.down('#dbDataStorageDays').setDisabled(false);
	    	storagePolicyForm.down('#dbDataStorageCapacity').setDisabled(false);
	    	
	    	//“是否启用”取值为“是”，并且“存储策略”取值为“转储”时，转储策略Tab页才可用
	    	controller.onChangeComboboxChange();
	    }else if(newValue == 0){
	    	storagePolicyForm.down('#csvRpIsEnable').setDisabled(true);
	    	storagePolicyForm.down('#dbDataStorageDays').setDisabled(true);
	    	storagePolicyForm.down('#dbDataStorageCapacity').setDisabled(true);
	    	
	    	dumpPolicyForm.down('#fileFormat').setDisabled(true);
	    	dumpPolicyForm.down('#csvStorageDays').setDisabled(true);
	    	dumpPolicyForm.down('#csvStorageCapacity').setDisabled(true);
	    	dumpPolicyForm.down('#dumpPolicySaveButton').setDisabled(true);
	    }
    },
    
    onChangeComboboxChange: function() {
    	var card = this.getView().up(),
    	storagePolicyForm = card.down('#storagePolicyForm'),
    	dumpPolicyForm = card.up().down('#dumpPolicyForm');
    	var newValue = storagePolicyForm.form.findField("csvRpIsEnable").value;

	    if(newValue == 1){
	    	dumpPolicyForm.down('#fileFormat').setDisabled(false);
	    	dumpPolicyForm.down('#csvStorageDays').setDisabled(false);
	    	dumpPolicyForm.down('#csvStorageCapacity').setDisabled(false);
	    	dumpPolicyForm.down('#dumpPolicySaveButton').setDisabled(false);
	    }else if(newValue == 0){
	    	dumpPolicyForm.down('#fileFormat').setDisabled(true);
	    	dumpPolicyForm.down('#csvStorageDays').setDisabled(true);
	    	dumpPolicyForm.down('#csvStorageCapacity').setDisabled(true);
	    	dumpPolicyForm.down('#dumpPolicySaveButton').setDisabled(true);
	    }
    },
    
    onLoadPerDumpData: function()  {
    	var card = this.getView().up(),
    	controller = this,
    	storagePolicyForm = card.down('#storagePolicyForm'),
    	dumpPolicyForm = card.up().down('#dumpPolicyForm');

    	var id = null,
    	dbRpIsEnable = null,
    	csvRpIsEnable = null, 
    	dbDataStorageCapacity = null,
    	dbDataStorageDays = null,
    	fileFormat = null,
    	csvStorageDays = null,
    	csvStorageCapacity = null;

    	Ext.Ajax.request({
    		//url : "/system/chartTest/storagePolicyTest",
    		url : "/pmManagement/api/pmdata/storage/management/queryRP",
            success : function(response, action) {
            	//存储策略tab页初始化
            	id = JSON.parse(response.responseText).data.id;
            	dbRpIsEnable = JSON.parse(response.responseText).data.dbRpIsEnable;
            	csvRpIsEnable  = JSON.parse(response.responseText).data.csvRpIsEnable;
            	dbDataStorageCapacity = JSON.parse(response.responseText).data.dbDataStorageCapacity;
            	dbDataStorageDays = JSON.parse(response.responseText).data.dbDataStorageDays;
            	storagePolicyForm.down('#storagePolicyId').setValue(id);

            	//根据后台返回值回显单选框取值
            	if (dbRpIsEnable == 0) {  
	       		    storagePolicyForm.down('#dbRpIsEnable').setValue({dbRpIsEnable : 0});
	            } else if (dbRpIsEnable == 1) {
	            	storagePolicyForm.down('#dbRpIsEnable').setValue({dbRpIsEnable : 1});
	            } 

            	storagePolicyForm.down('#csvRpIsEnable').setValue(csvRpIsEnable);
            	storagePolicyForm.down('#dbDataStorageCapacity').setValue(dbDataStorageCapacity);
            	storagePolicyForm.down('#dbDataStorageDays').setValue(dbDataStorageDays);
            	
            	//转储策略tab页初始化
            	fileFormat = JSON.parse(response.responseText).data.fileFormat;
            	csvStorageDays = JSON.parse(response.responseText).data.csvStorageDays;
            	csvStorageCapacity = JSON.parse(response.responseText).data.csvStorageCapacity;
            	dumpPolicyForm.down('#dumpPolicyId').setValue(id);
            	dumpPolicyForm.down('#fileFormat').setValue(fileFormat);
            	dumpPolicyForm.down('#csvStorageDays').setValue(csvStorageDays);
            	dumpPolicyForm.down('#csvStorageCapacity').setValue(csvStorageCapacity);
            	
            	//根据初始值控制页面字段是否可用
            	controller.onChangeRadiogroup();
            },
        });
    },
    
    onStorageSave: function()  {
    	var card=this.getView().up(),
    	storagePolicyForm = card.down('#storagePolicyForm');
    	
    	if (!storagePolicyForm.getForm().isValid()) {
	   		Ext.MessageBox.alert(_('Error'), _('Please check the configuration information is correct'));
	   		return;
	   	}
    	
	    var newStoragePolicyId = storagePolicyForm.form.findField("storagePolicyId").value;
	    var dbRpIsEnable      = storagePolicyForm.form.findField("dbRpIsEnable").getGroupValue(), 
	        storagePolicyId = ("" != newStoragePolicyId && null != newStoragePolicyId) ? parseInt(newStoragePolicyId) : 0,
	        csvRpIsEnable     = storagePolicyForm.form.findField("csvRpIsEnable").value,
	        dbDataStorageCapacity = storagePolicyForm.form.findField("dbDataStorageCapacity").value,
	        dbDataStorageDays     = storagePolicyForm.form.findField("dbDataStorageDays").value;
        	
		var params = { 
			csvRpIsEnable: csvRpIsEnable,
			dbDataStorageCapacity: dbDataStorageCapacity,
			dbDataStorageDays: dbDataStorageDays,
			dbRpIsEnable: dbRpIsEnable,
			id: storagePolicyId
	    };
		
	    Ext.Ajax.request({
	        url : "/pmManagement/api/pmdata/storage/management/updateDBRP",
	        method : "post",
	        jsonData: params,
	        headers: { "Content-Type": 'application/json' },
	        success: function(response, action) {
	        	var obj = Ext.decode(response.responseText);
	        	if(obj.success == false){
	        		Ext.Msg.alert(_('Failed'),obj.cause);
	        	}else{
	        		Ext.Msg.alert(_('Success'),_('Update the storage policy successfully'));
	        	}
	        },
	        failure: function(response, action) {
	        	Ext.Msg.alert(_('Failed'),_('Update the storage policy failed'));
	        }
	   });   
    },

});
