Ext.define('Admin.view.system.systemManage.controller.server.editMonitorTaskForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.editMonitorTaskForm',

    onEditCancel: function() {
    	var card=this.getView().up(),
    	    view = card.down('#monitorTaskListGrid');
    	card.setActiveItem(view);
    },
    
    onEditSubmit: function () {
    	var card = this.getView().up(),
            view = card.down('#monitorTaskListGrid'),
            monitorTaskGrid = card.down('#monitorTaskGrid'),
	        monitorConfigForm = card.down('#editMonitorTaskForm'),
	        records = monitorTaskGrid.getSelectionModel().getSelection();

	    if (monitorConfigForm.getForm().isValid()) {
	        var params = {  
	        	interval : monitorConfigForm.form.findField("interval").value,
	        	retain : monitorConfigForm.form.findField("retain").value
	        };
	        Ext.Ajax.request({
	            url : "/sysmanage/sysmng/monitor/task?act=2",
	            method : "post",
	            jsonData: params,
	            headers: { "Content-Type": 'application/json' },
	            success: function(response, action) {
	            	 Ext.Msg.alert(_('Success'),_('Edit a monitor task successfully'));
	            	 monitorTaskGrid.getSelectionModel().deselect(records);
	            	 monitorTaskGrid.store.reload(); 
                	 card.setActiveItem(view) 
	            },
	            failure: function(response, action) {
	            	Ext.Msg.alert(_('Failed'),_('Edit a monitor task failed'));
	            }
	        });
	    }
	    else {
	        Ext.MessageBox.alert(_('Error'), '');
	    }
	}
    
});
