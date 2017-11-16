Ext.define('Admin.view.system.systemManage.controller.process.processListGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.processListGrid',
    
    /**
     * 进程管理列表选中事件
     */
    onSelectChange: function (thisModel, selRecords) {
		var processListGrid = this.getView();
		processListGrid.down('#start').setDisabled(selRecords.length == 0);
		processListGrid.down('#stop').setDisabled(selRecords.length == 0);
		//processListGrid.down('#upgradeProcesses').setDisabled(selRecords.length == 0);
        for (var i in selRecords) {
            if (selRecords[i].get('rstatus') == 0) {
            	processListGrid.down('#start').setDisabled(true);
            }
            if (selRecords[i].get('rstatus') == 1 || selRecords[i].get('rstatus') == 2) {
            	processListGrid.down('#stop').setDisabled(true);
            }
        }
	},
	
	//判断是否显示“停止健康检查”和“开启健康检查”按钮
	onLoadHealthCheckButton: function() {
		var processListGrid = this.getView(),
		checkon = 0;
		Ext.Ajax.request({
			    url: '/sysmanage/sysmng/process/health',
                headers: { "Content-Type": 'application/json' },
                success: function(response, action) {
                	checkon = JSON.parse(response.responseText).checkon;
                	if(checkon == 1){
                		processListGrid.down('#stopHealthCheck').setDisabled(false);
                		processListGrid.down('#startHealthCheck').setDisabled(true);
                	}else if(checkon == 0){
                		processListGrid.down('#stopHealthCheck').setDisabled(true);
                		processListGrid.down('#startHealthCheck').setDisabled(false);
                	}

                }
        });   
	},
	
	/**
	 * 停止健康检查
	 */
	stopHealthCheck: function() {
		var processListGrid = this.getView().up().down('#processGrid'),
            view = this.getView(),
            controller= this;
            
        var params = {  
        		"checkon": 0
    	};
        var strProInstanceData = JSON.stringify(params); 
 
   	    Ext.MessageBox.confirm(_('Confirm'), _('Do you want to stop health check?'), 
   	    		function(btn) {
   			        if (btn=='yes') {
   			        	 Ext.Ajax.request({
   			        		url: '/sysmanage/sysmng/process/health',
   			                method : "post",
   			                jsonData: strProInstanceData,
   			                headers: { "Content-Type": 'application/json' },
   			                success: function(response, action) {
   			                	Ext.Msg.alert(_('Success'),_('Stop health checks successfully'));
   			                    view.setActiveItem( processListGrid );
   			                    controller.onRefresh();
   			                    processListGrid.down('#stopHealthCheck').setDisabled(true);
   	                		    processListGrid.down('#startHealthCheck').setDisabled(false);
   			                 },
   			                 failure: function(response, action) {
   			                	Ext.Msg.alert(_('Failed'),_('Stop health checks failed'));
   			                 }
   			             });
   			        }
   	          }
   	   	   )
	},
	
	/**
	 * 启动健康检查
	 */
	startHealthCheck: function() {
		var processListGrid = this.getView().up().down('#processGrid'),
            view = this.getView(),
            controller= this;
            
        var params = {  
        		"checkon": 1
    	};
        var strProInstanceData = JSON.stringify(params); 
 
   	    Ext.MessageBox.confirm(_('Confirm'), _('Do you want to start health check?'), 
   	    		function(btn) {
   			        if (btn=='yes') {
   			        	 Ext.Ajax.request({
   			        		url: '/sysmanage/sysmng/process/health',
   			                method : "post",
   			                jsonData: strProInstanceData,
   			                headers: { "Content-Type": 'application/json' },
   			                success: function(response, action) {
   			                	Ext.Msg.alert(_('Success'),_('Start health checks successfully'));
   			                    view.setActiveItem( processListGrid );
   			                    controller.onRefresh();
   			                    processListGrid.down('#stopHealthCheck').setDisabled(false);
   	                		    processListGrid.down('#startHealthCheck').setDisabled(true);
   			                 },
   			                 failure: function(response, action) {
   			                	Ext.Msg.alert(_('Failed'),_('Start health checks failed'));
   			                 }
   			             });
   			        }
   	          }
   	   	   )
	},
	
	/**
	 * 卸载系统
	 */
	uninstallSystem: function() {
		var processListGrid = this.getView().up().down('#processGrid'),
            view = this.getView(),
            controller= this;
 
   	    Ext.MessageBox.confirm(_('Confirm'), "<font color='red'>" + _('Do you want to uninstall the system?') + "</font>", 
   	    		function(btn) {
   			        if (btn=='yes') {
   			    	    Ext.MessageBox.confirm(_('Confirm'),"<font color='red'>" + _('This operation is not recoverable, confirm the unloading system?') + "</font>",
   			    	    		function(btn) {
   			    			        if (btn=='yes') {
   			    			        	Ext.Ajax.request({
   			    			        		url: '/sysmanage/sysmng/process?act=1',
   			    			                method : "post",
   			    			                headers: { "Content-Type": 'application/json' },
   			    			                success: function(response, action) {
   			    			                	Ext.Msg.alert(_('Success'),_('Uninstall system successfully'));
   			    			                    view.setActiveItem( processListGrid );
   			    			                    controller.onRefresh();
   			    			                 },
   			    			                 failure: function(response, action) {
   			    			                	Ext.Msg.alert(_('Failed'),_('Uninstall system failed'));
   			    			                    controller.onRefresh();
   			    			                 }
   			    			             });
   			    			        }
   			    	          })
   			        }
   	          })
	},
	
	/**
	 * 启动进程操作
	 */
	onStartProcess: function() {
		var process_instance = [],
		    processListGrid = this.getView().up().down('#processGrid'),
            records = processListGrid.getSelectionModel().getSelection(),
            view = this.getView(),
            controller= this,
            record = null;
        for(var i in records){
        	record = null;
        	record = {
        		"process_name" : records[i].get('process_name'),
        		"ip" : records[i].get('ip'),
        	}
        	process_instance.push(record);
        }
        var proInstanceData = {  
    			"process_instance" : process_instance
    	};
        var strProInstanceData = JSON.stringify(proInstanceData); 
        console.log('onStartProcess :' + strProInstanceData);
   	    Ext.MessageBox.confirm(_('Confirm'), _('Do you want to start the selected processes?'), 
   	    		function(btn) {
   			        if (btn=='yes') {
   			        	 Ext.Ajax.request({
   			                 url :  "/sysmanage/sysmng/process?act=3",
   			                 method : "post",
   			                 jsonData: strProInstanceData,
   			                 headers: { "Content-Type": 'application/json' },
   			                 success: function(response, action) {
   			                	Ext.Msg.alert(_('Success'),_('Start process successfully'));
   			                    view.setActiveItem( processListGrid );
   			                    controller.onRefresh();
   			                 },
   			                 failure: function(response, action) {
   			                	Ext.Msg.alert(_('Failed'),_('Start process failed'));
   			                    controller.onRefresh();
   			                 }
   			             });
   			        }
   	          }
   	   	   )
	},
	
	/**
	 * 停止进程操作
	 */
	onStopProcess: function() {
		var process_instance = [],
		    processListGrid = this.getView().up().down('#processGrid'),
            records = processListGrid.getSelectionModel().getSelection(),
            view = this.getView(),
            controller= this,
            record = null;
        for(var i in records){
        	record = null;
        	record = {
        		"process_name" : records[i].get('process_name'),
        		"ip" : records[i].get('ip'),
        	}
        	process_instance.push(record);
        }
        var proInstanceData = {  
    			"process_instance" : process_instance
    	};
        var strProInstanceData = JSON.stringify(proInstanceData); 
   	    Ext.MessageBox.confirm(_('Confirm'), _('Do you want to stop the selected processes?'), 
   	    		function(btn) {
   			        if (btn=='yes') {
   			        	 Ext.Ajax.request({
   			                 url :  "/sysmanage/sysmng/process?act=4",
   			                 method : "post",
   			                 jsonData: strProInstanceData,
   			                 headers: { "Content-Type": 'application/json' },
   			                 success: function(response, action) {
   			                	Ext.Msg.alert(_('Success'),_('Stop process successfully'));
   			                    view.setActiveItem( processListGrid );
   			                    controller.onRefresh();
   			                 },
   			                 failure: function(response, action) {
   			                	Ext.Msg.alert(_('Failed'),_('Stop process failed'));
   			                    controller.onRefresh();
   			                 }
   			             });
   			        }
   	          }
   	   	   )
	},
	
	/**
	 * 卸载进程操作
	 */
	onUpgradeProcesses: function() {
		var process_instance = [],
		    del_list = [],
		    processListGrid = this.getView().up().down('#processGrid'),
            records = processListGrid.getSelectionModel().getSelection(),
            view = this.getView(),
            controller= this,
            record = null,
		    ip = records[0].get('ip');
        for(var i in records){
        	record = null;
        	record = {
        		"process_name" : records[i].get('process_name'),
        	}
        	process_instance.push(record);
        }
        var proInstanceData = {  
    			"ip" : ip,
        		"process_instance" : process_instance
    	};
        del_list.push(proInstanceData);
        var del_listData = {  
        		"del_list" : del_list
    	};
        
        var strProInstanceData = JSON.stringify(del_listData); 
   	    Ext.MessageBox.confirm(_('Confirm'), _('Do you want to uninstall the selected processes?'), 
   	    		function(btn) {
   			        if (btn=='yes') {
   			        	 Ext.Ajax.request({
   			                 url :  "/sysmanage/sysmng/process?act=1",
   			                 method : "post",
   			                 jsonData: strProInstanceData,
   			                 headers: { "Content-Type": 'application/json' },
   			                 success: function(response, action) {
   			                	Ext.Msg.alert(_('Success'),_('Uninstall process successfully'));
   			                    view.setActiveItem( processListGrid );
   			                    controller.onRefresh();
   			                 },
   			                 failure: function(response, action) {
   			                	Ext.Msg.alert(_('Failed'),_('Uninstall process failed'));
   			                    controller.onRefresh();
   			                 }
   			             });
   			        }
   	          }
   	   	   )
	},
	
	// 刷新主机列表
    onRefresh: function () {
        this.getView().down('#processGrid').store.reload();
    },
	
	/**
	 * 升级操作
	 */
	onUpgradeSystem: function() {
        var grid = this.getView(),
            card = grid.up(),
            form = card.down('upgradeForm');
        form.getForm().reset();
        card.setActiveItem(form);
	},
	
	/**
	 * 安装进程操作
	 */
	onInstallProcess: function() {
        var grid = this.getView(),
            card = grid.up(),
            form = card.down('installProcessForm');
        card.setActiveItem(form);
	}
	
});