Ext.define('Admin.view.system.systemManage.controller.server.addMonitorTaskForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.addMonitorTaskForm',
    require:['Ext.window.Toast'],
    
    onAddCancel: function() {
    	var card=this.getView().up(),
    	view = card.down('#monitorTaskListGrid');
    	card.setActiveItem(view);
    },
    
    onAddSubmit: function () {
    	var card = this.getView().up();
            view = card.down('#monitorTaskListGrid');
            monitorTaskGrid = card.down('#monitorTaskGrid');
	        monitorConfigForm = card.down('#addMonitorTaskForm');

	    if (monitorConfigForm.getForm().isValid()) {
	        var params = {  
	        	interval : monitorConfigForm.form.findField("interval").value,
	        	retain : monitorConfigForm.form.findField("retain").value
	        };
	        Ext.Ajax.request({
	            url : "/sysmanage/sysmng/monitor/task?act=0",
	            method : "post",
	            jsonData: params,
	            headers: { "Content-Type": 'application/json' },
	            success: function(response, action) {
	            	 Ext.Msg.alert(_('Success'),_('Add a monitor task successfully'));
	            	 monitorTaskGrid.store.reload(); 
                	 card.setActiveItem(view) 
	            },
	            failure: function(response, action) {
	            	Ext.Msg.alert(_('Failed'),_('Add a monitor task failed'));
	            }
	        });
	    }
	    else {
	        Ext.MessageBox.alert(_('Error'), '');
	    }
	}
    
});
