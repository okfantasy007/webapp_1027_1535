Ext.define('Admin.view.system.systemManage.controller.server.serverDetailGrid', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.serverDetailGrid',
    
    onSerchReset: function () {
    	var grid = this.getView(),
        card = grid.up(),
        form = card.down('#serchForm');
        form.getForm().reset();
    },
    
    //返回主机列表列
    onReturn: function () {
    	var card=this.getView().up(),
	    view = card.down('#serverListMainGrid');
	    card.setActiveItem(view);
    },
    
    onSerch: function () {
    	var grid = this.getView(),
        card = grid.up(),
        serchForm = card.down('#serchForm'),
    	operateEndTime = serchForm.getForm().getValues().operateEndTime,
    	operateStartTime = serchForm.getForm().getValues().operateStartTime,
    	serverHistoryGridStore = card.up().down('#serverHistoryGrid').getStore();
    	
    	var currentDate = new Date(),
    	currentTime= currentDate.getTime(),
    	startTimeParse = Date.parse(operateStartTime),//Date.parse的处理很关键   
        endTimeParse = Date.parse(operateEndTime); 
    	
    	var startTimeFlag = !(operateStartTime == "" || startTimeParse == "NaN");
    	var endTimeFlag   = !(operateEndTime == "" || endTimeParse == "NaN");
    	
    	if(startTimeFlag){
    		if(startTimeParse > currentTime){
    			Ext.Msg.show({   
                   title:_('Notice'),   
                   msg: _('The starting time cannot be later than the current time')
                });
    			return;
    		}
    	}
    	if(endTimeFlag){
    		if(endTimeParse > currentTime){
    			Ext.Msg.show({   
                   title:_('Notice'),   
                   msg: _('The deadline cannot be later than the current time')   
                });
    			return;
    		}
    	}
    	if(startTimeFlag && endTimeFlag){
    		if(startTimeParse > endTimeParse){
    			Ext.Msg.show({   
                   title:_('Notice'),   
                   msg: _('The starting time cannot be later than the deadline time')   
                });
    			return;
        	}
    	}

    	var paging = card.up().down('#serverHistoryGrid').down('#pagingtoolbar');
    	paging.moveFirst();

    	if(null != operateStartTime){
    		serverHistoryGridStore.getProxy().setExtraParam('date_max',operateEndTime);
    	}else{
    		serverHistoryGridStore.getProxy().setExtraParam('date_max',"");
    	}
    	if(null != operateStartTime){
    		serverHistoryGridStore.getProxy().setExtraParam('date_min',operateStartTime);
    	}else{
    		serverHistoryGridStore.getProxy().setExtraParam('date_min',"");
    	}
    	paging.reset();
		serverHistoryGridStore.reload();
		//serverHistoryGridStore.getProxy().setExtraParams();
    },
    
    //停止实时监控服务器
    onDeactivate: function () {
        if (this.timeChartTask) {
            Ext.TaskManager.stop(this.timeChartTask);
        }
    },
   
    //启动实时监控服务器
    onActivate: function () {
    	var chart = this.lookupReference('time-chart');
    	chart.getStore().removeAll();
        this.addNewTimeData();
        this.timeChartTask = Ext.TaskManager.start({
            run: this.addNewTimeData,
            interval: 5000,
            //repeat: 5,
            scope: this
        });
    },
   
    addNewTimeData: function() {
        var me = this,
            chart = me.lookupReference('time-chart'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = 50000,
            second = 5000,
            xValue, lastRecord;
          
        var serchForm = this.getView().up().down('#serchForm');
    	ip = serchForm.getForm().getValues().ip;
        
        Ext.Ajax.request({
	        url :  "/sysmanage/sysmng/monitor/query?ip=" + ip,
	        success: function(response, action) {
	        	newSysChartCpu = JSON.parse(response.responseText).data[0].cpu_load;
	        	newSysChartMem = JSON.parse(response.responseText).data[0].mem_load;
	        	newSysChartDisk = JSON.parse(response.responseText).data[0].disk_load;
	        }
	    });

        if (count > 0) {
            lastRecord = store.getAt(count - 1);
            xValue = lastRecord.get('xValue') + second;
            if (xValue - me.startTime > visibleRange) {
                me.startTime = xValue - visibleRange;
                xAxis.setMinimum(this.startTime);
                xAxis.setMaximum(xValue);
            }
            store.add({
                xValue: xValue,
                cpu: newSysChartCpu,
                mem: newSysChartMem,
                disk: newSysChartDisk
            });

        } else {
            chart.animationSuspended = true;
            me.startTime = Math.floor(Ext.Date.now() / 1000) * 1000;
            xAxis.setMinimum(me.startTime);
            xAxis.setMaximum(me.startTime + visibleRange);

            store.add({
                xValue: this.startTime,
                cpu: newSysChartCpu,
                mem: newSysChartMem,
                disk: newSysChartDisk
            });
            chart.animationSuspended = false;
        }
    },
    
    onSeriesTooltipRender: function (tooltip, record, item) {
        var title = item.series.getTitle();
        tooltip.setHtml(title + ': ' +
            record.get(item.series.getYField()) + '%');
    },

});
var newSysChartCpu = 0;
var newSysChartMem = 0;
var newSysChartDisk = 0;