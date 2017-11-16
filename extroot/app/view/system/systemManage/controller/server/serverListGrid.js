Ext.define('Admin.view.system.systemManage.controller.server.serverListGrid', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.serverListGrid',
    
    onSelectChange: function (thisModel, selRecords) {
		var serverListGrid = this.getView();
		//serverListGrid.down('#remove').setDisabled(selRecords.length == 0);
		serverListGrid.down('#monitor').setDisabled(selRecords.length == 0);
	},
	
    onRefresh: function () {
        this.getView().down('#serverGrid').store.reload();
    },
    
    onAdd: function() {
    	var grid = this.getView(),
        card = grid.up(),
        form = card.down('#addServerForm');
        form.getForm().reset();
        card.setActiveItem(form);
    }, 
    
    //删除服务器
    onRemove: function() { 
    	var grid = this.getView().down('#serverGrid');
            controller = this;
	        selected = grid.getSelectionModel().getSelection()[0];
	        ip = selected.get("ip");
	    
	    Ext.MessageBox.confirm(_('Confirmation'), _('Confirm deletion of the selected server?'), 
		function(btn) {
	        if (btn=='yes') {
	        	 Ext.Ajax.request({
	                 url :  "/sysmanage/sysmng/host?ip="+ ip + "&act=1",
	                 method : "post",
	                 headers: { "Content-Type": 'application/json' },
	                 success: function(response, action) {
	                	  Ext.Msg.alert(_('Success'),_('Delete the server successfully'));
	                      controller.onRefresh();
	                 },
	                 failure: function(response, action) {
	                	 if(null != response && "" != response.responseText){
	 	            		try{
	 	            			var obj = Ext.decode(response.responseText);
	 	            			if(obj && obj.cause){
	    	            			if(obj.cause == '23141'){
	    	            				Ext.Msg.alert(_('Failed'),_('host has not been installed yet'));
	    				            }else{
	    				            	Ext.Msg.alert(_('Failed'),_('Delete the server failed'));
	    				            }
	    	            		}
	 	            		}catch(e){
	 	            			Ext.Msg.alert(_('Failed'),_('Delete the server failed'));
	 	            			return;
	 	            		}
	 	         	    }else{
	 	         	    	Ext.Msg.alert(_('Failed'),_('Delete the server failed'));
	 	         	    }
	                    controller.onRefresh();
	                 }
	             });
	        }
         }
	  )
	},
	
	//查看服务器监控数据
	onMonitor: function() { 
        var grid = this.getView(),
        card = grid.up(),
        serverGrid = this.getView().down('#serverGrid');
        
        serverDetailGrid = card.down('#serverDetailGrid');
	    serverHistoryGrid = serverDetailGrid.down('#serverHistoryGrid');
	    serchForm = serverDetailGrid.down('#serchForm');
	    
	    selected = serverGrid.getSelectionModel().getSelection()[0];
	    ip = selected.get("ip");
        
        serchForm.loadRecord(selected);
		serverHistoryGrid.getStore().getProxy().setExtraParam('ip',selected.data.ip);
		serverHistoryGrid.getStore().reload();
		card.setActiveItem(serverDetailGrid);
        
	},
    
    //根据是否打开性能监控，动态显示‘采集周期’和‘保留时长’
    changeMonitorConfig: function (thi, newValue, oldValue, eOpts ) {
    	var serverListGrid = this.getView();
    	if(newValue == 'stop'){
    		serverListGrid.down('#monitorCycle').setVisible(false);
    		serverListGrid.down('#dataSaveTime').setVisible(false);
    	}else{
    		serverListGrid.down('#monitorCycle').setVisible(true);
    		serverListGrid.down('#dataSaveTime').setVisible(true);
    	}
    },
});