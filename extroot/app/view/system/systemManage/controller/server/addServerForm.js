Ext.define('Admin.view.system.systemManage.controller.server.addServerForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.addServerForm',

    onCancel: function() {
    	var card=this.getView().up(),
    	    view = card.down('#serverListMainGrid');

    	card.setActiveItem(view);
    },

    onSave: function() {
    	var card=this.getView().up();
	        view = card.down('#serverListMainGrid');
    	    serverGrid = card.down('#serverGrid');
    	    hostform = this.getView().up().down('#addServerForm');

        if (hostform.getForm().isValid()) {
            var params = {  
                ip : hostform.form.findField("ip").value,
                host_name : hostform.form.findField("host_name").value,
                login_user : hostform.form.findField("login_user").value,
                password : hostform.form.findField("password").value
             };
            Ext.Ajax.request({
                url : "/sysmanage/sysmng/host",
                method : "post",
                jsonData: params,
                headers: { "Content-Type": 'application/json' },
                success: function(response, action) {
                	 Ext.Msg.alert(_('Success'),_('Add a server successfully'));
                	 serverGrid.store.reload(); 
                	 card.setActiveItem(view) 
                },
                failure: function(response, action) {
                	if(null != response && "" != response.responseText){
                		try{
                			var obj = Ext.decode(response.responseText);
                			if(obj && obj.cause){
    	            			if(obj.cause == '23131'){
    	            				Ext.Msg.alert(_('Failed'),_('host can not connect, please check ip, user name, password or ssh service is running'));
    				            }else if(obj.cause == '23132'){
    				            	Ext.Msg.alert(_('Failed'),_('host do not satisfied, please check it'));
    	            			}else if(obj.cause == '23133'){
    	            				Ext.Msg.alert(_('Failed'),_('there has duplicate host'));
    	            			}else{
    	            				Ext.Msg.alert(_('Failed'),_('Add a server failed'));
    	            			}
    	            		}
                		}catch(e){
                			Ext.Msg.alert(_('Failed'),_('Add a server failed'));
                			return;
                		}
                	}else{
                		Ext.Msg.alert(_('Failed'),_('Add a server failed'));
                	}
                }
            });
        }
        else {
            Ext.MessageBox.alert(_('Error'), _('Please check whether the server information is correct'));
        }
    } 
    
});
