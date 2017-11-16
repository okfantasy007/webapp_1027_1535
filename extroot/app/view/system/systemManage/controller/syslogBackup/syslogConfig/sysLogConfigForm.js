Ext.define('Admin.view.system.systemManage.controller.syslogBackup.syslogConfig.sysLogConfigForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.sysLogConfigForm',
    
    onLoadFormData: function(thi, eOpts)  {
   	 var card = this.getView().up(),
   	 sysLogForm = card.down('#sysLogConfigForm');
   	 
   	 //安全日志
     var safeLogProctolType     = null,
         safeLogId              = null,
         safeLogServerIp        = null,
         safeLogIsEnabled       = null,
         safeLogPort            = null;
     //操作日志
     var operateLogProctolType  = null,
         operateLogId           = null,
         operateLogServerIp     = null,
     	 operateLogIsEnabled    = null,
     	 operateLogPort          = null;
     //运行日志
     var runLogProctolType      = null,
         runLogId               = null,
         runLogServerIp         = null,
 	     runLogIsEnabled        = null,
 	     runLogPort             = null;
     //登录日志
 	 var loginLogProctolType    = null,
 	     loginLogId             = null,
 	     loginLogServerIp       = null,
	     loginLogIsEnabled      = null,
	     loginLogPort           = null;
     //syslog日志
	 var sysLogProctolType      = null,
	     sysLogId               = null,
	     sysLogServerIp         = null,
	     sysLogIsEnabled        = null,
	     sysLogPort             = null;
		 
   	 Ext.Ajax.request({
   		    //url : "/system/chartTest/syslogConfigTest",
	        url: "/syslog/api/log/v1/syslogConfig",
	        success: function(response, action) {
	        	safeLogId              = JSON.parse(response.responseText).rows[0].id;
	        	safeLogServerIp            = JSON.parse(response.responseText).rows[0].syslogServerIp;
	        	safeLogPort        = JSON.parse(response.responseText).rows[0].port;
	        	safeLogIsEnabled       = JSON.parse(response.responseText).rows[0].isEnabled;
	        	safeLogProctolType    = JSON.parse(response.responseText).rows[0].proctolType;
	        	
	        	operateLogId           = JSON.parse(response.responseText).rows[1].id;
	        	operateLogServerIp         = JSON.parse(response.responseText).rows[1].syslogServerIp;
	        	operateLogPort     = JSON.parse(response.responseText).rows[1].port;
	        	operateLogIsEnabled    = JSON.parse(response.responseText).rows[1].isEnabled;
	        	operateLogProctolType = JSON.parse(response.responseText).rows[1].proctolType;
	        	
	        	runLogId               = JSON.parse(response.responseText).rows[2].id;
	        	runLogServerIp             = JSON.parse(response.responseText).rows[2].syslogServerIp;
	        	runLogPort         = JSON.parse(response.responseText).rows[2].port;
	        	runLogIsEnabled        = JSON.parse(response.responseText).rows[2].isEnabled;
	        	runLogProctolType     = JSON.parse(response.responseText).rows[2].proctolType;
	        	
	        	sysLogId               = JSON.parse(response.responseText).rows[3].id;
	        	sysLogServerIp             = JSON.parse(response.responseText).rows[3].syslogServerIp;
	        	sysLogPort         = JSON.parse(response.responseText).rows[3].port;
	        	sysLogIsEnabled        = JSON.parse(response.responseText).rows[3].isEnabled;
	        	sysLogProctolType     = JSON.parse(response.responseText).rows[3].proctolType;
	        	
	        	loginLogId             = JSON.parse(response.responseText).rows[4].id;
	        	loginLogServerIp           = JSON.parse(response.responseText).rows[4].syslogServerIp;
	        	loginLogPort       = JSON.parse(response.responseText).rows[4].port;
	        	loginLogIsEnabled      = JSON.parse(response.responseText).rows[4].isEnabled;
	        	loginLogProctolType   = JSON.parse(response.responseText).rows[4].proctolType;
	        	
	        	//根据后台返回值回显单选框取值
		       	if (safeLogIsEnabled == 0) {  
		       		sysLogForm.down('#safeLogIsEnabled').setValue({safeLogIsEnabled : 0});
		        } else if (safeLogIsEnabled == 1) {
		            sysLogForm.down('#safeLogIsEnabled').setValue({safeLogIsEnabled : 1});
		        }
		       	if (safeLogProctolType == 0) {  
		       		sysLogForm.down('#safeLogProctolType').setValue({safeLogProctolType : 0});
		        } else if (safeLogIsEnabled == 1) {
		            sysLogForm.down('#safeLogProctolType').setValue({safeLogProctolType : 1});
		        }
		       	
		       	
		       	if (operateLogIsEnabled == 0) {  
		       		sysLogForm.down('#operateLogIsEnabled').setValue({operateLogIsEnabled : 0});
		        } else if (operateLogIsEnabled == 1) {
		            sysLogForm.down('#operateLogIsEnabled').setValue({operateLogIsEnabled : 1});
		        }
		       	if (operateLogProctolType == 0) {  
		       		sysLogForm.down('#operateLogProctolType').setValue({operateLogProctolType : 0});
		        } else if (operateLogProctolType == 1) {
		            sysLogForm.down('#operateLogProctolType').setValue({operateLogProctolType : 1});
		        }
		       	
		       	if (runLogIsEnabled == 0) {  
	       		    sysLogForm.down('#runLogIsEnabled').setValue({runLogIsEnabled : 0});
	            } else if (runLogIsEnabled == 1) {
	            	sysLogForm.down('#runLogIsEnabled').setValue({runLogIsEnabled : 1});
	            }
		       	if (runLogProctolType == 0) {  
	       		    sysLogForm.down('#runLogProctolType').setValue({runLogProctolType : 0});
	            } else if (runLogProctolType == 1) {
	            	sysLogForm.down('#runLogProctolType').setValue({runLogProctolType : 1});
	            }
		       	
		       	if (sysLogIsEnabled == 0) {  
	       		    sysLogForm.down('#sysLogIsEnabled').setValue({sysLogIsEnabled : 0});
	            } else if (sysLogIsEnabled == 1) {
	            	sysLogForm.down('#sysLogIsEnabled').setValue({sysLogIsEnabled : 1});
	            }
		       	if (sysLogProctolType == 0) {  
	       		    sysLogForm.down('#sysLogProctolType').setValue({sysLogProctolType : 0});
	            } else if (sysLogProctolType == 1) {
	            	sysLogForm.down('#sysLogProctolType').setValue({sysLogProctolType : 1});
	            }
		       	
		       	if (loginLogIsEnabled == 0) {  
	       		    sysLogForm.down('#loginLogIsEnabled').setValue({loginLogIsEnabled : 0});
	            } else if (loginLogIsEnabled == 1) {
	            	sysLogForm.down('#loginLogIsEnabled').setValue({loginLogIsEnabled : 1});
	            }
		       	if (loginLogProctolType == 0) {  
	       		    sysLogForm.down('#loginLogProctolType').setValue({loginLogProctolType : 0});
	            } else if (loginLogProctolType == 1) {
	            	sysLogForm.down('#loginLogProctolType').setValue({loginLogProctolType : 1});
	            }
	        	
	        	var sysLogConfigRecord = Ext.create('Ext.data.Model', 
	        		{
	        		   'safeLogId': safeLogId,
	        		   'safeLogProctolType': safeLogProctolType,
	 	               'safeLogServerIp': safeLogServerIp,
	 	               'safeLogIsEnabled': safeLogIsEnabled,
	 	               'safeLogPort': safeLogPort,
	 	               
	 	               'operateLogId': operateLogId,
	 	               'operateLogProctolType': operateLogProctolType,
	 	               'operateLogServerIp':operateLogServerIp,
	 	               'operateLogIsEnabled': operateLogIsEnabled,
	 	               'operateLogPort': operateLogPort,
	 	               
	 	               'runLogId': runLogId,
	 	               'runLogProctolType': runLogProctolType,
	 	               'runLogServerIp': runLogServerIp,
	 	               'runLogIsEnabled': runLogIsEnabled,
	 	               'runLogPort': runLogPort,
	 	               
	 	               'loginLogId': loginLogId,
	 	               'loginLogProctolType': loginLogProctolType,
	 	               'loginLogServerIp': loginLogServerIp,
	 	               'loginLogIsEnabled': loginLogIsEnabled,
	 	               'loginLogPort': loginLogPort,
	 	               
	 	               'sysLogId': sysLogId,
	 	               'sysLogProctolType': sysLogProctolType,
	 	               'sysLogServerIp': sysLogServerIp,
	 	               'sysLogIsEnabled': sysLogIsEnabled,
	 	               'sysLogPort': sysLogPort,
	                }
	            );
	        	sysLogForm.loadRecord(sysLogConfigRecord);
	        }
	    });
   },
   
   onSysLogConfigSave: function() {
	   	var card=this.getView().up(),
	   	sysLogForm = card.down('#sysLogConfigForm');
	   	
	   	if (!sysLogForm.getForm().isValid()) {
	   		Ext.MessageBox.alert(_('Error'), _('Please check the configuration information is correct'));
	   		return;
	   	}
	     
   	    //获取安全日志form表单值
   	    var newSafeLogPort = sysLogForm.form.findField("safeLogPort").value,
   	    safeLogId = sysLogForm.form.findField("safeLogId").value,
   	    safeLogServerIp = sysLogForm.form.findField("safeLogServerIp").value,
	    safeLogIsEnabled = sysLogForm.form.findField("safeLogIsEnabled").getGroupValue(),
	    safeLogProctolType = sysLogForm.form.findField("safeLogProctolType").getGroupValue(), 
	    safeLogPort = ("" != newSafeLogPort && null != newSafeLogPort) ? parseInt(newSafeLogPort) : 0;
	    
	    var newOperateLogPort = sysLogForm.form.findField("operateLogPort").value,
	    operateLogId = sysLogForm.form.findField("operateLogId").value,
   	    operateLogServerIp = sysLogForm.form.findField("operateLogServerIp").value,
   	    operateLogIsEnabled = sysLogForm.form.findField("operateLogIsEnabled").getGroupValue(),
	    operateLogProctolType = sysLogForm.form.findField("operateLogProctolType").getGroupValue(), 
	    operateLogPort = ("" != newOperateLogPort && null != newOperateLogPort) ? parseInt(newOperateLogPort) : 0;
	    
	    var newRunLogPort = sysLogForm.form.findField("runLogPort").value,
	    runLogId = sysLogForm.form.findField("runLogId").value,
   	    runLogServerIp = sysLogForm.form.findField("runLogServerIp").value,
   	    runLogIsEnabled = sysLogForm.form.findField("runLogIsEnabled").getGroupValue(),
	    runLogProctolType = sysLogForm.form.findField("runLogProctolType").getGroupValue(), 
	    runLogPort = ("" != newRunLogPort && null != newRunLogPort) ? parseInt(newRunLogPort) : 0;
	    
	    var newLoginLogPort = sysLogForm.form.findField("loginLogPort").value,
	    loginLogId = sysLogForm.form.findField("loginLogId").value,
	    loginLogServerIp = sysLogForm.form.findField("loginLogServerIp").value,
	    loginLogIsEnabled = sysLogForm.form.findField("loginLogIsEnabled").getGroupValue(),
	    loginLogProctolType = sysLogForm.form.findField("loginLogProctolType").getGroupValue(), 
	    loginLogPort = ("" != newLoginLogPort && null != newLoginLogPort) ? parseInt(newLoginLogPort) : 0;
	    
	    var newSysLogPort = sysLogForm.form.findField("sysLogPort").value,
	    sysLogId = sysLogForm.form.findField("sysLogId").value,
	    sysLogServerIp = sysLogForm.form.findField("sysLogServerIp").value,
	    sysLogIsEnabled = sysLogForm.form.findField("sysLogIsEnabled").getGroupValue(),
	    sysLogProctolType = sysLogForm.form.findField("sysLogProctolType").getGroupValue(), 
	    sysLogPort = ("" != newSysLogPort && null != newSysLogPort) ? parseInt(newSysLogPort) : 0;
	    
	    //判断form表单值输入是否符合要求
	    if(0 != safeLogIsEnabled){
	    	if("" == safeLogServerIp){
	    		Ext.MessageBox.alert(_('Error'), _('Security log syslog server IP cannot be empty'));
	    		return;
	    	}
	    	if(0 == safeLogPort){
	    		Ext.MessageBox.alert(_('Error'), _('Security log syslog server port cannot be empty'));
	    		return;
	    	}
	    }
	    if(0 != operateLogIsEnabled){
	    	if(0 == operateLogServerIp){
	    		Ext.MessageBox.alert(_('Error'), _('Operate log syslog server IP cannot be empty'));
	    		return;
	    	}
	    	if(0 == operateLogPort){
	    		Ext.MessageBox.alert(_('Error'), _('Operate log syslog server port cannot be empty'));
	    		return;
	    	}
	    }
	    if(0 != runLogIsEnabled){
	    	if(0 == runLogServerIp){
	    		Ext.MessageBox.alert(_('Error'), _('Running log syslog server IP cannot be empty'));
	    		return;
	    	}
	    	if(0 == runLogPort){
	    		Ext.MessageBox.alert(_('Error'), _('Running log syslog server port cannot be empty'));
	    		return;
	    	}
	    }
	    if(0 != sysLogIsEnabled){
	    	if(0 == sysLogServerIp){
	    		Ext.MessageBox.alert(_('Error'), _('Syslog log syslog server IP cannot be empty'));
	    		return;
	    	}
	    	if(0 == sysLogPort){
	    		Ext.MessageBox.alert(_('Error'), _('Syslog log syslog server port cannot be empty'));
	    		return;
	    	}
	    }
	    if(0 != loginLogIsEnabled){
	    	if(0 == loginLogServerIp){
	    		Ext.MessageBox.alert(_('Error'), _('Login log syslog server IP cannot be empty'));
	    		return;
	    	}
	    	if(0 == loginLogPort){
	    		Ext.MessageBox.alert(_('Error'), _('Login log syslog server port cannot be empty'));
	    		return;
	    	}
	    }
	    
	    var sysLogConfig = [],
	    safeLogSysLogConfig = null,
	    operateLogSysLogConfig = null,
	    runLogSysLogConfig = null,
	    loginLogSysLogConfig = null,
	    sysLogSysLogConfig = null;
	    
	    safeLogSysLogConfig = {  
	    		 "id": safeLogId,
	    	     "syslogServerIp": safeLogServerIp,
	    	     "port": safeLogPort,
	    	     "proctolType": safeLogProctolType,
	    	     "isEnabled": safeLogIsEnabled	
	    };
	    sysLogConfig.push(safeLogSysLogConfig);
	    operateLogSysLogConfig = {  
	    		 "id": operateLogId,
	    	     "syslogServerIp": operateLogServerIp,
	    	     "port": operateLogPort,
	    	     "proctolType": operateLogProctolType,
	    	     "isEnabled": operateLogIsEnabled	
	    };
	    sysLogConfig.push(operateLogSysLogConfig);
	    runLogSysLogConfig = {  
	    		 "id": runLogId,
	    	     "syslogServerIp": runLogServerIp,
	    	     "port": runLogPort,
	    	     "proctolType": runLogProctolType,
	    	     "isEnabled": runLogIsEnabled	
	    };
	    sysLogConfig.push(runLogSysLogConfig);
	    sysLogSysLogConfig = {  
	    		 "id": sysLogId,
	    	     "syslogServerIp": sysLogServerIp,
	    	     "port": sysLogPort,
	    	     "proctolType": sysLogProctolType,
	    	     "isEnabled": sysLogIsEnabled	
	    };
	    sysLogConfig.push(sysLogSysLogConfig);
	    loginLogSysLogConfig = {  
	    		 "id": loginLogId,
	    	     "syslogServerIp": loginLogServerIp,
	    	     "port": loginLogPort,
	    	     "proctolType": loginLogProctolType,
	    	     "isEnabled": loginLogIsEnabled	
	    };
	    sysLogConfig.push(loginLogSysLogConfig);
	    var strSysLogConfigData = JSON.stringify(sysLogConfig); 
   	
		Ext.Ajax.request({
	        url : "/syslog/api/log/v1/syslogConfig",
	        method : "post",
	        jsonData: strSysLogConfigData,
	        headers: { "Content-Type": 'application/json' },
	        success: function(response, action) {
	        	var obj = Ext.decode(response.responseText);
	        	if(null != obj && null != obj.cause && "success" != obj.cause){
	        		Ext.Msg.alert(_('Failed'),obj.cause);
	        	}else{
	        		Ext.Msg.alert(_('Success'),_('Modify the syslog configuration successfully'));
	        	}
	        },
	        failure: function(response, action) {
	        	Ext.Msg.alert(_('Failed'),_('Modify the syslog configuration failed'));
	        }
	   });
   }

});