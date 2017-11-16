Ext.define('Admin.view.system.systemManage.controller.dbBackup.dbBackupConfigForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.dbBackupConfigForm',
    
    onSelectRadioChange: function(thi, newValue, oldValue, eOpts)  {
    	var card = this.getView(),
	    form = card.down('#configForm');
	    if(newValue.schedule_type == 0){
	    	form.down('#cycleInterval').setVisible(true);
	    }else{
	    	form.down('#cycleInterval').setVisible(false);
	    }
    },
    
    onSelectComboboxChange: function(thi, newValue, oldValue, eOpts)  {
    	var card = this.getView(),
	    form = card.down('#configForm');
	    if(newValue == 0){
	    	form.down('#userConfig').setVisible(false);
	    }else{
	    	form.down('#userConfig').setVisible(true);
	    }
    },
    
    onLoadDBBackupConfig: function()  {
    	var card = this.getView().up(),
	    form = card.down('#dbBackupConfigForm');

    	var schedule_type = null, 
    	schedule_date = null,
    	schedule_interval = null,
    	mode = null,
    	user = null,
    	password = null,
    	ip = null,
    	port = null,
    	path = null,
    	reserve = null;
    	Ext.Ajax.request({
    		//url : "/system/chartTest/dbBackupTest",
    		url : "/sysmanage/sysmng/backup/auto",
            success : function(response, action) {
            	schedule_type     = JSON.parse(response.responseText).schedule[0].schedule_type;
            	schedule_date     = JSON.parse(response.responseText).schedule[0].schedule_date;
            	schedule_interval = JSON.parse(response.responseText).schedule[0].schedule_interval;
            	mode              = JSON.parse(response.responseText).schedule[0].mode;
            	user              = JSON.parse(response.responseText).schedule[0].user;
            	password          = JSON.parse(response.responseText).schedule[0].password;
            	ip                = JSON.parse(response.responseText).schedule[0].ip;
            	port              = JSON.parse(response.responseText).schedule[0].port;
            	path              = JSON.parse(response.responseText).schedule[0].path;
            	reserve           = JSON.parse(response.responseText).schedule[0].reserve;
            	
            	//根据后台返回值回显单选框取值
            	if (schedule_type == 0) {  
            		form.down('#schedule_type').setValue({schedule_type : 0});
	            } else if (schedule_type == 1) {
	            	form.down('#schedule_type').setValue({schedule_type : 1});
	            } 
            	
            	//form.down('#schedule_type').setValue(schedule_type);
            	form.down('#schedule_date').setValue(schedule_date);
            	form.down('#schedule_interval').setValue(schedule_interval);
            	form.down('#mode').setValue(mode);
            	form.down('#user').setValue(user);
            	form.down('#password').setValue(password);
            	form.down('#ip').setValue(ip);
            	form.down('#port').setValue(port);
            	form.down('#path').setValue(path);
            	form.down('#reserve').setValue(reserve);
            }
        });
    },
    
    onDBBackupSave: function() {
    	var card = this.getView().up(),
    	dbBackupConfigForm = card.down('#dbBackupConfigForm');
    	
    	if (!dbBackupConfigForm.getForm().isValid()) {
	   		Ext.MessageBox.alert(_('Error'), _('Please check the configuration information is correct'));
	   		return;
	   	}
    	
	    var newInterval = dbBackupConfigForm.form.findField("schedule_interval").value,
	        newReserve  = dbBackupConfigForm.form.findField("reserve").value,
	        newPort     = dbBackupConfigForm.form.findField("port").value;
	        
	    var schedule_type     = dbBackupConfigForm.form.findField("schedule_type").getGroupValue(), 
	        schedule_interval = ("" != newInterval && null != newInterval) ? newInterval : 0,
	        schedule_date     = dbBackupConfigForm.form.findField("schedule_date").value,
        	mode              = dbBackupConfigForm.form.findField("mode").value,
        	ip                = dbBackupConfigForm.form.findField("ip").value,
        	port              = ("" != newPort && null != newPort) ? parseInt(newPort) : 0,
        	user              = dbBackupConfigForm.form.findField("user").value,
        	password          = dbBackupConfigForm.form.findField("password").value,
        	path              = dbBackupConfigForm.form.findField("path").value,
        	reserve           = ("" != newReserve && null != newReserve) ? newReserve : 0;
	    
        //判断form表单值输入是否符合要求
	    if(0 == schedule_type && 0 == schedule_interval){
	    	Ext.MessageBox.alert(_('Error'), _('The schedule interval can not be empty'));
	    	return;
	    }
	    if(0 != mode){
	    	if("" == user){
	    		Ext.MessageBox.alert(_('Error'), _('username can not be empty'));
	    		return;
	    	}
	    	if("" == password){
	    		Ext.MessageBox.alert(_('Error'), _('The password can not be empty'));
	    		return;
	    	}
	    	if("" == ip){
	    		Ext.MessageBox.alert(_('Error'), _('The IP Address can not be empty'));
	    		return;
	    	}
	    	if(0 == port){
	    		Ext.MessageBox.alert(_('Error'), _('The port number can only be positive integer'));
	    		return;
	    	}
	    }
	    if("" == path){
	    	Ext.MessageBox.alert(_('Error'), _('The backup path can not be empty'));
	    	return;
	    }
	    if(0 == reserve){
	    	Ext.MessageBox.alert(_('Error'), _('The storage days can not be empty'));
	    	return;
	    }
    	
		var params = { 
			schedule_type : schedule_type,
			schedule_interval : schedule_interval,
			schedule_date : Ext.Date.format(new Date(schedule_date),'Y-m-d H:i:s'),
			mode         : mode,
			ip           : ip,
			port         : port,
			user         : user,
			password     : password,
			path         : path,
			reserve      : reserve,
	    };
		
	    Ext.Ajax.request({
	        url : "/sysmanage/sysmng/backup/auto",
	        method : "post",
	        jsonData: params,
	        headers: { "Content-Type": 'application/json' },
	        success: function(response, action) {
	        	 Ext.Msg.alert(_('Success'),_('Edit the backups strategy successfully'));
	        },
	        failure: function(response, action) {
	        	Ext.Msg.alert(_('Failed'),_('Edit the backups strategy failed'));
	        }
	   });
    }
    
});
