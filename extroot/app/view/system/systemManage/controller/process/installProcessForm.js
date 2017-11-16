Ext.define('Admin.view.system.systemManage.controller.process.installProcessForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.installProcessForm',

    onCancel: function() {
        this.getView().up().setActiveItem(0);
    },
    
    onInstallProcess: function() {
    	//构造安装接口body
    	var setuplist = [],
            process_instance = [],
            setupData = null,
            processData = null;
        
    	var card = this.getView().up(),
    	    view = card.down('#processMainGrid'),
            processGrid = card.down('#processGrid'),
            installProcessForm = card.down('#installProcessForm');	

	    if(installProcessForm.getForm().isValid()){
	    	var path = installProcessForm.form.findField("upload_file").value;
		    var ip = installProcessForm.form.findField("ip").value;
	        processData = {  
	            "subsys_name" : "",
	            "process_name" : "",
	            "path":path
	        };
	        process_instance.push(processData);
	        setupData = {  
	            "ip" : ip,
	            "process_instance" : process_instance
	        };
	        setuplist.push(setupData);
	        var setupListData = {  
	    			"setup_list" : setuplist
	    	};
	        var strSetupListData = JSON.stringify(setupListData); 
	        console.log("setUpClick setupListData :" + strSetupListData);
	    	
	        //提交表单
	    	installProcessForm.getForm().submit({
         		 url: '/system/upload', 
                 waitTitle: _('Connecting'),
                 waitMsg: _('Transmit data...'),
                 success: function (response, action) {
                	     //文件上传成功，调用进程安装接口
			        	 Ext.Ajax.request({
	   			        		url: '/sysmanage/sysmng/process?act=0',
	   			                method : "post",
	   			                jsonData: strSetupListData,
	   			                headers: { "Content-Type": 'application/json' },
	   			                success: function(response, action) {
	   			                   Ext.Msg.alert(_('Success'),_('Install process successfully'));
	   			                   processGrid.store.reload(); 
       	                           card.setActiveItem(view) 
	   			                 },
	   			                 failure: function(response, action) {
	   			                	Ext.Msg.alert(_('Failed'),_('Install process failed'));
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
    },
    
    /**
     * 获取文件名
     */
    getFileName: function (path){
    	var arr = path.split('\\');
	   	var fileName = arr[arr.length-1];
	   	var arr = fileName.split('.');
	   	arr.pop();
	   	return arr;
    },   
  
    onQueryServer: function () {
    	var card = this.getView().up(),
        form = card.down('queryServerList');
        card.setActiveItem(form);
    },
    
    onSelectServerChange: function (thisModel, selRecords) {
		var serverListGrid = this.getView();
		serverListGrid.down('#submit').setDisabled(selRecords.length == 0);
	},

	
	onCancelServer: function() {
		var card = this.getView().up(),
	        view = card.down('#installProcessForm');
         card.setActiveItem(view);
    },
    
    onSubmitServer: function() {
    	var card = this.getView().up(),
    	    view = card.down('#installProcessForm'),
    	    installProcessForm = card.down('#installProcessForm');
    	    
    	var queryServerList = this.getView().up().down('#queryServerList'),
            record = queryServerList.getSelectionModel().getSelection()[0];

            installProcessForm.loadRecord(record);
            card.setActiveItem(view);
    }
    
});
