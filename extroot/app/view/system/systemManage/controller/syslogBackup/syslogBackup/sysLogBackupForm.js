Ext.define('Admin.view.system.systemManage.controller.syslogBackup.syslogBackup.sysLogBackupForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.sysLogBackupForm',
    
    onSelectComboboxChange: function(thi, newValue, oldValue, eOpts)  {
    	var card = this.getView().up(),
	    form = card.down('#sysLogBackupForm');
	    if(newValue == 0){
	    	form.down('#userConfig').setVisible(false);
	    }else{
	    	form.down('#userConfig').setVisible(true);
	    }
    },
    
    onLoadDBBackupConfig: function(thi, eOpts)  {
   	 var card = this.getView().up(),
   	 sysLogBackupForm = card.down('#sysLogBackupForm');
   	 
     var isAutoBackup = null,
     sysLogBackupId   = null,
     isLoginLogEnable = false,
     isSafeLogEnable  = false,
     isDevOpLogEnable = false,
     isRunLogEnable   = false,
     isSysLogEnable   = false,
     backupType       = null,
     backupPath       = null,
     fileServerIp     = null,
     fileServerPort   = null,
     username         = null,
     password         = null,
     capacity         = null,
     days             = null,
 	 retainPolicy     = null;
		 
   	 Ext.Ajax.request({
   		    url: "/syslog/api/log/v1/backupConfig",
	        success: function(response, action) {
	        	sysLogBackupId     = JSON.parse(response.responseText).rows[0].id;
	        	isAutoBackup     = JSON.parse(response.responseText).rows[0].isAutoBackup;
	        	isSafeLogEnable  = JSON.parse(response.responseText).rows[0].isSafeLogEnable;
	        	isLoginLogEnable = JSON.parse(response.responseText).rows[0].isLoginLogEnable;
	        	isDevOpLogEnable = JSON.parse(response.responseText).rows[0].isSysOpLogEnable;
	        	isRunLogEnable   = JSON.parse(response.responseText).rows[0].isRunLogEnable;
	        	isSysLogEnable   = JSON.parse(response.responseText).rows[0].isSysLogEnable;
	        	
	        	backupType       = JSON.parse(response.responseText).rows[0].backupType;
	        	backupPath       = JSON.parse(response.responseText).rows[0].backupPath;
	        	fileServerIp     = JSON.parse(response.responseText).rows[0].fileServerIp;
	        	fileServerPort   = JSON.parse(response.responseText).rows[0].fileServerPort;
	        	username         = JSON.parse(response.responseText).rows[0].username;
	        	password         = JSON.parse(response.responseText).rows[0].password;
	        	capacity         = JSON.parse(response.responseText).rows[0].capacity;
	        	days             = JSON.parse(response.responseText).rows[0].days;
	        	retainPolicy     = JSON.parse(response.responseText).rows[0].retainPolicy;
	        	
	        	//多选框赋值
	        	if(isLoginLogEnable){
	        		sysLogBackupForm.down('#log_type').down('#loginLog').setValue(true);
	        	}
	        	if(isSafeLogEnable){
	        		sysLogBackupForm.down('#log_type').down('#safeLog').setValue(true);
	        	}
	        	if(isDevOpLogEnable){
	        		sysLogBackupForm.down('#log_type').down('#operateLog').setValue(true);
	        	}
	        	if(isRunLogEnable){
	        		sysLogBackupForm.down('#log_type').down('#runLog').setValue(true);
	        	}
	        	if(isSysLogEnable){
	        		sysLogBackupForm.down('#log_type').down('#sysLog').setValue(true);
	        	}
	        	
	        	//根据后台返回值回显单选框取值
            	if (isAutoBackup == 0) {  
            		sysLogBackupForm.down('#isAutoBackup').setValue({isAutoBackup : 0});
	            } else if (isAutoBackup == 1) {
	            	sysLogBackupForm.down('#isAutoBackup').setValue({isAutoBackup : 1});
	            } 
	        	
	        	var sysLogBackupRecord = Ext.create('Ext.data.Model', 
	        		{
	 	        	   'sysLogBackupId': sysLogBackupId,
	 	        	   'isAutoBackup': isAutoBackup,
	 	               'backupType': backupType,
	 	               'backupPath': backupPath,
	 	               'fileServerIp': fileServerIp,
	 	               'fileServerPort': fileServerPort,
	 	               'username':username,
	 	               'password': password,
	 	               'capacity': capacity,
	 	               'days': days,
	 	               'retainPolicy': retainPolicy,
	                }
	            );
	        	sysLogBackupForm.loadRecord(sysLogBackupRecord);
	        }
	    });
   },
   
   onDBBackupSave: function() {
	   	var card=this.getView().up(),
	     	sysLogForm = card.down('#sysLogBackupForm');
	    
     	if (!sysLogForm.getForm().isValid()) {
	   		Ext.MessageBox.alert(_('Error'), _('Please check the configuration information is correct'));
	   		return;
	   	}
	     	
	    var newDays           = sysLogForm.form.findField("days").value,
	        newCapacity       = sysLogForm.form.findField("capacity").value;
		     
	   	var isAutoBackup   = sysLogForm.form.findField("isAutoBackup").getGroupValue(),
	     	sysLogBackupId = sysLogForm.form.findField("sysLogBackupId").value,
	   	    backupType     = sysLogForm.form.findField("backupType").value, 
		    backupPath     = sysLogForm.form.findField("backupPath").value,
		    fileServerIp   = sysLogForm.form.findField("fileServerIp").value,
		    fileServerPort = sysLogForm.form.findField("fileServerPort").value,
	   	    username       = sysLogForm.form.findField("username").value,
	   	    password       = sysLogForm.form.findField("password").value,
	   	    capacity       = ("" != newCapacity && null != newCapacity) ? parseInt(newCapacity) : 0,
	   	    days           = ("" != newDays && null != newDays) ? parseInt(newDays) : 0,
	   	    retainPolicy   = sysLogForm.form.findField("retainPolicy").value;
	   	
	   	var isLoginLogEnable   = false,
	        isSafeLogEnable    = false,
	        isSysOpLogEnable   = false,
	        isRunLogEnable     = false,
	        isSysLogEnable     = false;
	   	
	   	//获取多选框选中值
	   	var log_type = sysLogForm.down('#log_type').getChecked();
	   	log_type_value =[];
	  	Ext.Array.each(log_type, function(item){
	  		if("1" == item.inputValue){
	  			isSafeLogEnable = true;
	  		}else if("2" == item.inputValue){
	  			isLoginLogEnable = true;
	  		}else if("3" == item.inputValue){
	  			isSysOpLogEnable = true;
	  		}else if("4" == item.inputValue){
	  			isRunLogEnable = true;
	  		}else if("5" == item.inputValue){
	  			isSysLogEnable = true;
	  		}
		});

        //判断form表单值输入是否符合要求
    	if(0 != backupType){
	    	if("" == username){
	    		Ext.MessageBox.alert(_('Error'), _('username can not be empty'));
	    		return;
	    	} 
	    	if("" == password){
	    		Ext.MessageBox.alert(_('Error'), _('The password can not be empty'));
	    		return;
	    	}
	    	if("" == fileServerIp){
	    		Ext.MessageBox.alert(_('Error'), _('The IP Address can not be empty'));
	    		return;
	    	}
	    	if("" == fileServerPort){
	    		Ext.MessageBox.alert(_('Error'), _('The port can not be empty'));
	    		return;
	    	}
	    }
	    
	    var params = {
        	"id" : sysLogBackupId,
        	"isLoginLogEnable" : isLoginLogEnable,
        	"isSafeLogEnable" : isSafeLogEnable,
        	"isSysOpLogEnable" : isSysOpLogEnable,
        	"isRunLogEnable" : isRunLogEnable,
        	'isSysLogEnable' : isSysLogEnable,
        	"isAutoBackup" : isAutoBackup,
        	"backupType" : backupType,
        	"backupPath" : backupPath,
        	"fileServerIp" : fileServerIp,
        	"fileServerPort" : fileServerPort,
        	"username" : username,
        	"password" : password,
        	"days" : days,
        	"capacity" : capacity,
        	"retainPolicy" : retainPolicy
       };
   	
	   Ext.Ajax.request({
	        url : "/syslog/api/log/v1/backupConfig",
	        method : "post",
	        jsonData: params,
	        headers: { "Content-Type": 'application/json' },
	        success: function(response, action) {
	        	var obj = Ext.decode(response.responseText);
	        	if(null != obj && null != obj.cause && "success" != obj.cause){
	        		Ext.Msg.alert(_('Failed'),obj.cause);
	        	}else{
	        		Ext.Msg.alert(_('Success'),_('Modify the log backup strategy successfully'));
	        	}
	        },
	        failure: function(response, action) {
	        	Ext.Msg.alert(_('Failed'),_('Modify the log backup strategy failed'));
	        }
	  });
   }

});