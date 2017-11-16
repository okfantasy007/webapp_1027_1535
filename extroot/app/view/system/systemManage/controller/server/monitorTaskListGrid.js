Ext.define('Admin.view.system.systemManage.controller.server.monitorTaskListGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitorTaskListGrid',
    
    onSelectChange: function (thisModel, selRecords) {
		var monitorTaskListGrid = this.getView();
		monitorTaskListGrid.down('#edit').setDisabled(selRecords.length != 1);
		//monitorTaskListGrid.down('#remove').setDisabled(selRecords.length == 0);
		monitorTaskListGrid.down('#regain').setDisabled(selRecords.length == 0 || selRecords[0].get('task_status') == 0);
		monitorTaskListGrid.down('#stop').setDisabled(selRecords.length == 0 || selRecords[0].get('task_status') == 1);
	},
	
	onRefresh: function () {
		var monitorTaskGrid = this.getView().down('#monitorTaskGrid'),
		records = monitorTaskGrid.getSelectionModel().getSelection();
		monitorTaskGrid.getSelectionModel().deselect(records);
	    monitorTaskGrid.store.reload();
	},
	
	onAdd: function() {
    	var grid = this.getView(),
        card = grid.up(),
        form = card.down('#addMonitorTaskForm');
        form.getForm().reset();
        
        card.setActiveItem(form);
    }, 
    
    onEdit: function () {
    	var card = this.getView().up();
    	editMonitorTaskForm = card.down('#editMonitorTaskForm');
	    monitorTaskGrid = this.getView().up().down('#monitorTaskGrid');
        record = monitorTaskGrid.getSelectionModel().getSelection()[0];
        
        editMonitorTaskForm.getForm().reset();
        editMonitorTaskForm.down('#interval').setValue(record.data.task_interval);
        editMonitorTaskForm.down('#retain').setValue(record.data.task_retain);
        card.setActiveItem(editMonitorTaskForm);
	},
	
    //删除监控任务
    onRemove: function() { 
    	var grid = this.getView().up().down('#monitorTaskGrid');
            view = this.getView();
            controller = this;
	    
	    Ext.MessageBox.confirm(_('Confirmation'), _('Confirm deletion of the selected monitoring task?'), 
		function(btn) {
	        if (btn=='yes') {
	        	 Ext.Ajax.request({
	                 url :  "/sysmanage/sysmng/monitor/task?act=1",
	                 method : "post",
	                 headers: { "Content-Type": 'application/json' },
	                 success: function(response, action) {
	                	  Ext.Msg.alert(_('Success'),_('Delete the monitor task successfully'));
	                      controller.onRefresh();
	                 },
	                 failure: function(response, action) {
	                	Ext.Msg.alert(_('Failed'),_('Delete the monitor task failed'));
	                    controller.onRefresh();
	                 }
	             });
	        }
         }
	  )
	},
	
	//恢复监控任务
	onRegain: function () {
		var grid = this.getView().up().down('#monitorTaskGrid');
        view = this.getView();
        controller = this;
    
	    Ext.MessageBox.confirm(_('Confirmation'), _('Confirm recovery check monitoring task?'), 
		function(btn) {
	        if (btn=='yes') {
	        	 Ext.Ajax.request({
	                 url :  "/sysmanage/sysmng/monitor/task?act=4",
	                 method : "post",
	                 headers: { "Content-Type": 'application/json' },
	                 success: function(response, action) {
	                	  Ext.Msg.alert(_('Success'),_('Recovery the monitor task successfully'));
	                      controller.onRefresh();
	                 },
	                 failure: function(response, action) {
	                	 Ext.Msg.alert(_('Failed'),_('Recovery the monitor task failed'));
	                     controller.onRefresh();
	                 }
	             });
	        }
	     }
	  )
	},
	
	//暂停监控任务
	onStop: function () {
		var grid = this.getView().up().down('#monitorTaskGrid');
        view = this.getView();
        controller = this;
    
	    Ext.MessageBox.confirm(_('Confirmation'), _('Verify that the monitoring task is paused'), 
		function(btn) {
	        if (btn=='yes') {
	        	 Ext.Ajax.request({
	                 url :  "/sysmanage/sysmng/monitor/task?act=3",
	                 method : "post",
	                 headers: { "Content-Type": 'application/json' },
	                 success: function(response, action) {
	                	  Ext.Msg.alert(_('Success'),_('Stop the monitor task successfully'));
	                      controller.onRefresh();
	                 },
	                 failure: function(response, action) {
	                	Ext.Msg.alert(_('Failed'),_('Stop the monitor task failed'));
	                    controller.onRefresh();
	                 }
	             });
	        }
	     }
	  )  
	},
    
});