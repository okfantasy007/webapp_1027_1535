Ext.define('Admin.view.system.systemManage.controller.syslogBackup.syslogStorage.sysLogForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.sysLogForm',
    
    onLoadFormData: function(thi, eOpts)  {
    	 var card = this.getView().up(),
    	 sysLogForm = card.down('#sysLogForm');
    	 
    	//安全日志
 	     var safeLogDays            = null,
 	         safeLogId              = null,
	         safeLogCapacity        = null,
	         safeLogIsEnabled       = null,
	    	 safeLogRetainPolicy    = null;
	     //操作日志
	     var operateLogDays         = null,
	         operateLogId           = null,
	    	 operateLogCapacity     = null,
	     	 operateLogIsEnabled    = null,
	     	 operateLogRetainPolicy = null;
	     //运行日志
	     var runLogDays             = null,
	         runLogId               = null,
	 	     runLogCapacity         = null,
	 	     runLogIsEnabled        = null,
	 	     runLogRetainPolicy     = null;
	     //登录日志
	 	 var loginLogDays           = null,
	 	     loginLogId             = null,
	         loginLogCapacity       = null,
		     loginLogIsEnabled      = null,
		     loginLogRetainPolicy   = null;
	     //syslog日志
		 var sysLogDays             = null,
		     sysLogId               = null,
		     sysLogCapacity         = null,
		     sysLogIsEnabled        = null,
		     sysLogRetainPolicy     = null;
		 
    	 Ext.Ajax.request({
    		//url : "/system/chartTest/syslogTest",
 	        url: "/syslog/api/log/v1/storeConfig?type=all",
 	        success: function(response, action) {
 	        	safeLogId              = JSON.parse(response.responseText).rows[0].id;
 	        	safeLogDays            = JSON.parse(response.responseText).rows[0].days;
 	        	safeLogCapacity        = JSON.parse(response.responseText).rows[0].capacity;
 	        	safeLogIsEnabled       = JSON.parse(response.responseText).rows[0].isEnable;
 	        	safeLogRetainPolicy    = JSON.parse(response.responseText).rows[0].retainPolicy;
 	        	
 	        	operateLogId           = JSON.parse(response.responseText).rows[1].id;
 	        	operateLogDays         = JSON.parse(response.responseText).rows[1].days;
 	        	operateLogCapacity     = JSON.parse(response.responseText).rows[1].capacity;
 	        	operateLogIsEnabled    = JSON.parse(response.responseText).rows[1].isEnable;
 	        	operateLogRetainPolicy = JSON.parse(response.responseText).rows[1].retainPolicy;
 	        	
 	        	runLogId               = JSON.parse(response.responseText).rows[2].id;
 	        	runLogDays             = JSON.parse(response.responseText).rows[2].days;
 	        	runLogCapacity         = JSON.parse(response.responseText).rows[2].capacity;
 	        	runLogIsEnabled        = JSON.parse(response.responseText).rows[2].isEnable;
 	        	runLogRetainPolicy     = JSON.parse(response.responseText).rows[2].retainPolicy;
 	        	
 	        	sysLogId               = JSON.parse(response.responseText).rows[3].id;
 	        	sysLogDays             = JSON.parse(response.responseText).rows[3].days;
 	        	sysLogCapacity         = JSON.parse(response.responseText).rows[3].capacity;
 	        	sysLogIsEnabled        = JSON.parse(response.responseText).rows[3].isEnable;
 	        	sysLogRetainPolicy     = JSON.parse(response.responseText).rows[3].retainPolicy;
 	        	
 	        	loginLogId             = JSON.parse(response.responseText).rows[4].id;
 	        	loginLogDays           = JSON.parse(response.responseText).rows[4].days;
 	        	loginLogCapacity       = JSON.parse(response.responseText).rows[4].capacity;
 	        	loginLogIsEnabled      = JSON.parse(response.responseText).rows[4].isEnable;
 	        	loginLogRetainPolicy   = JSON.parse(response.responseText).rows[4].retainPolicy;
 	        	
 	        	//根据后台返回值回显单选框取值
            	if (safeLogIsEnabled == 0) {  
            		sysLogForm.down('#safeLogIsEnabled').setValue({safeLogIsEnabled : 0});
	            } else if (safeLogIsEnabled == 1) {
	            	sysLogForm.down('#safeLogIsEnabled').setValue({safeLogIsEnabled : 1});
	            }
            	if (operateLogIsEnabled == 0) {  
            		sysLogForm.down('#operateLogIsEnabled').setValue({operateLogIsEnabled : 0});
	            } else if (operateLogIsEnabled == 1) {
	            	sysLogForm.down('#operateLogIsEnabled').setValue({operateLogIsEnabled : 1});
	            }
            	if (runLogIsEnabled == 0) {  
            		sysLogForm.down('#runLogIsEnabled').setValue({runLogIsEnabled : 0});
	            } else if (runLogIsEnabled == 1) {
	            	sysLogForm.down('#runLogIsEnabled').setValue({runLogIsEnabled : 1});
	            }
            	if (sysLogIsEnabled == 0) {  
            		sysLogForm.down('#sysLogIsEnabled').setValue({sysLogIsEnabled : 0});
	            } else if (sysLogIsEnabled == 1) {
	            	sysLogForm.down('#sysLogIsEnabled').setValue({sysLogIsEnabled : 1});
	            }
            	if (loginLogIsEnabled == 0) {  
            		sysLogForm.down('#loginLogIsEnabled').setValue({loginLogIsEnabled : 0});
	            } else if (loginLogIsEnabled == 1) {
	            	sysLogForm.down('#loginLogIsEnabled').setValue({loginLogIsEnabled : 1});
	            }

 	        	var sysLogRecord = Ext.create('Ext.data.Model', 
 	        		{
 	        		   'safeLogId': safeLogId,
 	        		   'safeLogDays': safeLogDays,
	 	               'safeLogCapacity': safeLogCapacity,
	 	               'safeLogIsEnabled': safeLogIsEnabled,
	 	               'safeLogRetainPolicy': safeLogRetainPolicy,
	 	               
	 	               'operateLogId': operateLogId,
	 	               'operateLogDays': operateLogDays,
	 	               'operateLogCapacity':operateLogCapacity,
	 	               'operateLogIsEnabled': operateLogIsEnabled,
	 	               'operateLogRetainPolicy': operateLogRetainPolicy,
	 	               
	 	               'runLogId': runLogId,
	 	               'runLogDays': runLogDays,
	 	               'runLogCapacity': runLogCapacity,
	 	               'runLogIsEnabled': runLogIsEnabled,
	 	               'runLogRetainPolicy': runLogRetainPolicy,
	 	               
	 	               'sysLogId': sysLogId,
	 	               'sysLogDays': sysLogDays,
	 	               'sysLogCapacity': sysLogCapacity,
	 	               'sysLogIsEnabled': sysLogIsEnabled,
	 	               'sysLogRetainPolicy': sysLogRetainPolicy,
	 	               
	 	               'loginLogId': loginLogId,
	 	               'loginLogDays': loginLogDays,
	 	               'loginLogCapacity': loginLogCapacity,
	 	               'loginLogIsEnabled': loginLogIsEnabled,
	 	               'loginLogRetainPolicy': loginLogRetainPolicy,
	                }
 	            );
 	        	sysLogForm.loadRecord(sysLogRecord);
 	        }
 	    });
    },
    
    onSysLogBackupSave: function() {
    	var card=this.getView().up(),
    	sysLogForm = card.down('#sysLogForm');
    	
    	if (!sysLogForm.getForm().isValid()) {
	   		Ext.MessageBox.alert(_('Error'), _('Please check the configuration information is correct'));
	   		return;
	   	}
	     
    	//获取安全日志form表单值
    	var newSafeLogDays = sysLogForm.form.findField("safeLogDays").value,
    	    newSafeLogCapacity = sysLogForm.form.findField("safeLogCapacity").value,
    	    safeLogId = sysLogForm.form.findField("safeLogId").value,
    	    safeLogDays         = ("" != newSafeLogDays && null != newSafeLogDays) ? newSafeLogDays : 0,
	        safeLogCapacity     = ("" != newSafeLogCapacity && null != newSafeLogCapacity) ? parseInt(newSafeLogCapacity) : 0,
	        safeLogIsEnabled    = sysLogForm.form.findField("safeLogIsEnabled").getGroupValue(), 
	    	safeLogRetainPolicy = sysLogForm.form.findField("safeLogRetainPolicy").value;
    	    
    	//获取操作日志form表单值
	    var newOperateLogDays      = sysLogForm.form.findField("operateLogDays").value,
	        newOperateLogCapacity  = sysLogForm.form.findField("operateLogCapacity").value,
	        operateLogId = sysLogForm.form.findField("operateLogId").value,
	        operateLogDays         = ("" != newOperateLogDays && null != newOperateLogDays) ? newOperateLogDays : 0,
	    	operateLogCapacity     = ("" != newOperateLogCapacity && null != newOperateLogCapacity) ? parseInt(newOperateLogCapacity) : 0,
        	operateLogIsEnabled    = sysLogForm.form.findField("operateLogIsEnabled").getGroupValue(), 
        	operateLogRetainPolicy = sysLogForm.form.findField("operateLogRetainPolicy").value;
	    
	    //获取运行日志form表单值
        var newRunLogDays      = sysLogForm.form.findField("runLogDays").value,
            newRunLogCapacity  = sysLogForm.form.findField("runLogCapacity").value,
            runLogId = sysLogForm.form.findField("runLogId").value,
            runLogDays         = ("" != newRunLogDays && null != newRunLogDays) ? newRunLogDays : 0,
    	    runLogCapacity     = ("" != newRunLogCapacity && null != newRunLogCapacity) ? parseInt(newRunLogCapacity) : 0,
    	    runLogIsEnabled    = sysLogForm.form.findField("runLogIsEnabled").getGroupValue(), 
    	    runLogRetainPolicy = sysLogForm.form.findField("runLogRetainPolicy").value;
    	    
	    //获取syslog日志form表单值
	    var newSysLogDays     = sysLogForm.form.findField("sysLogDays").value,
            newSysLogCapacity  = sysLogForm.form.findField("sysLogCapacity").value,
            sysLogId = sysLogForm.form.findField("sysLogId").value,
	        sysLogDays         = ("" != newSysLogDays && null != newSysLogDays) ? newSysLogDays : 0,
		    sysLogCapacity     = ("" != newSysLogCapacity && null != newSysLogCapacity) ? parseInt(newSysLogCapacity) : 0,
		    sysLogIsEnabled    = sysLogForm.form.findField("sysLogIsEnabled").getGroupValue(), 
		    sysLogRetainPolicy = sysLogForm.form.findField("sysLogRetainPolicy").value;

        //获取登录日志form表单值
        var newLoginLogDays      = sysLogForm.form.findField("loginLogDays").value,
            newLoginLogCapacity  = sysLogForm.form.findField("loginLogCapacity").value,
            loginLogId = sysLogForm.form.findField("loginLogId").value,
            loginLogDays         = ("" != newLoginLogDays && null != newLoginLogDays) ? newLoginLogDays : 0,
	        loginLogCapacity     = ("" != newLoginLogCapacity && null != newLoginLogCapacity) ? parseInt(newLoginLogCapacity) : 0,
		    loginLogIsEnabled    = sysLogForm.form.findField("loginLogIsEnabled").getGroupValue(), 
		    loginLogRetainPolicy = sysLogForm.form.findField("loginLogRetainPolicy").value;

        

        //判断form表单值输入是否符合要求
	    if(0 != safeLogIsEnabled){
	    	if(0 == safeLogCapacity){
	    		Ext.MessageBox.alert(_('Error'), _('Security log storage policy storage capacity cannot be empty'));
	    		return;
	    	}
	    	if(0 == safeLogDays){
	    		Ext.MessageBox.alert(_('Error'), _('Security log storage policy storage days cannot be empty'));
	    		return;
	    	}
	    }
	    if(0 != operateLogIsEnabled){
	    	if(0 == operateLogCapacity){
	    		Ext.MessageBox.alert(_('Error'), _('Operate log storage policy storage capacity cannot be empty'));
	    		return;
	    	}
	    	if(0 == operateLogDays){
	    		Ext.MessageBox.alert(_('Error'), _('Operate log storage policy storage days cannot be empty'));
	    		return;
	    	}
	    }
	    if(0 != runLogIsEnabled){
	    	if(0 == runLogCapacity){
	    		Ext.MessageBox.alert(_('Error'), _('Running log storage policy storage capacity cannot be empty'));
	    		return;
	    	}
	    	if(0 == runLogDays){
	    		Ext.MessageBox.alert(_('Error'), _('Running log storage policy storage days cannot be empty'));
	    		return;
	    	}
	    }
        if(0 != sysLogIsEnabled){
	    	if(0 == sysLogCapacity){
	    		Ext.MessageBox.alert(_('Error'), _('Syslog log storage policy storage capacity cannot be empty'));
	    		return;
	    	}
	    	if(0 == sysLogDays){
	    		Ext.MessageBox.alert(_('Error'), _('Syslog log storage policy storage days cannot be empty'));
	    		return;
	    	}
	    }
        if(0 != loginLogIsEnabled){
	    	if(0 == loginLogCapacity){
	    		Ext.MessageBox.alert(_('Error'), _('Login log storage policy storage capacity cannot be empty'));
	    		return;
	    	}
	    	if(0 == loginLogDays){
	    		Ext.MessageBox.alert(_('Error'), _('Login log storage policy storage days cannot be empty'));
	    		return;
	    	}
	    }
	    
	    var strorePolicy = [],
	    safeLogStrorePolicy = null,
	    operateLogStrorePolicy = null,
	    runLogStrorePolicy = null,
	    loginLogStrorePolicy = null,
	    sysLogStrorePolicy = null;
	    
	    safeLogStrorePolicy = {  
	            "id" : safeLogId,
	            "type" : 0,
	            "capacity" : safeLogCapacity,
	            "days" : safeLogDays,
	            "retainPolicy" : safeLogRetainPolicy,
	            "isEnable" : safeLogIsEnabled
	    };
	    strorePolicy.push(safeLogStrorePolicy);
	    operateLogStrorePolicy = {  
	            "id" : operateLogId,
	            "type" : 1,
	            "capacity" : operateLogCapacity,
	            "days" : operateLogDays,
	            "retainPolicy" : operateLogRetainPolicy,
	            "isEnable" : operateLogIsEnabled
	    };
	    strorePolicy.push(operateLogStrorePolicy);
	    runLogStrorePolicy = {  
	            "id" : runLogId,
	            "type" : 2,
	            "capacity" : runLogCapacity,
	            "days" : runLogDays,
	            "retainPolicy" : runLogRetainPolicy,
	            "isEnable" : runLogIsEnabled
	    };
	    strorePolicy.push(runLogStrorePolicy);
	    sysLogStrorePolicy = {  
	            "id" : sysLogId,
	            "type" : 3,
	            "capacity" : sysLogCapacity,
	            "days" : sysLogDays,
	            "retainPolicy" : sysLogRetainPolicy,
	            "isEnable" : sysLogIsEnabled
	    };
	    strorePolicy.push(sysLogStrorePolicy);
	    loginLogStrorePolicy = {  
	            "id" : loginLogId,
	            "type" : 4,
	            "capacity" : loginLogCapacity,
	            "days" : loginLogDays,
	            "retainPolicy" : loginLogRetainPolicy,
	            "isEnable" : loginLogIsEnabled
	    };
	    strorePolicy.push(loginLogStrorePolicy);
	    var strStrorePolicyData = JSON.stringify(strorePolicy); 
    	
		Ext.Ajax.request({
	        url : "/syslog/api/log/v1/storeConfig",
	        method : "post",
	        jsonData: strStrorePolicyData,
	        headers: { "Content-Type": 'application/json' },
	        success: function(response, action) {
	        	var obj = Ext.decode(response.responseText);
	        	if(null != obj && null != obj.cause && "success" != obj.cause){
	        		Ext.Msg.alert(_('Failed'),obj.cause);
	        	}else{
	        		Ext.Msg.alert(_('Success'),_('Modify the log storage policy successfully'));
	        	}
	        },
	        failure: function(response, action) {
	        	Ext.Msg.alert(_('Failed'),_('Modify the log storage policy failed'));
	        }
	   });
    }

});