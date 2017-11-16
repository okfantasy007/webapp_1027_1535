Ext.define('Admin.view.system.systemManage.controller.server.thresholdForm', {
	extend: 'Ext.app.ViewController',
    alias: 'controller.thresholdForm', 
    
    onLoadThreshold: function() {
    	var card=this.getView().up(),
    	thresholdForm = card.down('#thresholdForm');

    	var cpuProduce = null, 
	        cpuClear = null,
            memProduce = null,
            memClear = null,
            diskProduce = null,
            diskClear = null;
    	Ext.Ajax.request({
            url : "/sysmanage/sysmng/monitor/threshold",
            success : function(response, action) {
            	cpuProduce = JSON.parse(response.responseText).threshold[0].threshold_alarm;
            	cpuClear = JSON.parse(response.responseText).threshold[0].threshold_clear;
            	memProduce = JSON.parse(response.responseText).threshold[1].threshold_alarm;
            	memClear = JSON.parse(response.responseText).threshold[1].threshold_clear;
            	diskProduce = JSON.parse(response.responseText).threshold[2].threshold_alarm;
            	diskClear = JSON.parse(response.responseText).threshold[2].threshold_clear;
            	console.log('cpuProduce'  + cpuProduce 
            			 + ", cpuClear"   + cpuClear 
            			 + ", memProduce" + memProduce
            			 + ", memClear"   + memClear
            			 + ",diskProduce" + diskProduce
            			 + ", diskClear"  + diskClear
            			 );
            	thresholdForm.down('#cpuProduce').setValue(cpuProduce);
            	thresholdForm.down('#cpuClear').setValue(cpuClear);
            	thresholdForm.down('#memProduce').setValue(memProduce);
            	thresholdForm.down('#memClear').setValue(memClear);
            	thresholdForm.down('#diskProduce').setValue(diskProduce);
            	thresholdForm.down('#diskClear').setValue(diskClear);
            }
        });
    },
    
    onRefresh: function() {
    	var controller = this;
    	controller.onLoadThreshold();
    },
    
    onSave: function() {
    	var card=this.getView().up();
	    form = card.down('#thresholdForm');
    	
    	var threshold = [],
    	    thresholdData1 = null,
    	    thresholdData2 = null,
    	    thresholdData3 = null;
    	
    	var newCpuProduce = null, 
	    	newCpuClear = null,
	    	newMemProduce = null,
	    	newMemClear = null,
	    	newDiskProduce = null,
	    	newDiskClear = null;
    	
    	var cpuProduce = null, 
    	    cpuClear = null,
	        memProduce = null,
	        memClear = null,
	        diskProduce = null,
	        diskClear = null;
	
		if (form.getForm().isValid()) {
			
			newCpuProduce = form.form.findField("cpuProduce").value;
			newCpuClear = form.form.findField("cpuClear").value;
			newMemProduce = form.form.findField("memProduce").value;
			newMemClear = form.form.findField("memClear").value;
			newDiskProduce = form.form.findField("diskProduce").value;
			newDiskClear = form.form.findField("diskClear").value;
			
			cpuProduce = ("" != newCpuProduce && null != newCpuProduce) ? parseFloat(newCpuProduce) : 0;
			cpuClear = ("" != newCpuClear && null != newCpuClear) ? parseFloat(newCpuClear) : 0;
			memProduce = ("" != newMemProduce && null != newMemProduce) ? parseFloat(newMemProduce) : 0;
			memClear = ("" != newMemClear && null != newMemClear) ? parseFloat(newMemClear) : 0;
			diskProduce = ("" != newDiskProduce && null != newDiskProduce) ? parseFloat(newDiskProduce) : 0;
			diskClear = ("" != newDiskClear && null != newDiskClear) ? parseFloat(newDiskClear) : 0;
			
			if(cpuClear >= cpuProduce){
				Ext.MessageBox.alert(_('Error'), _('The threshold of CPU alarm generates must be greater than the threshold of CPU alarm clears'));
				return;
			}else if(memClear >= memProduce){
				Ext.MessageBox.alert(_('Error'), _('The threshold of memory alarm generates must be greater than the threshold of memory alarm clears'));
				return;
			}else if(diskClear >= diskProduce){
				Ext.MessageBox.alert(_('Error'),_('The threshold of disk alarm generates must be greater than the threshold of disk alarm clears'));
				return;
			}
		    thresholdData1 = {  
	            "id" : "1",
	            "threshold_alarm" : newCpuProduce,
	            "threshold_clear":newCpuClear
	        };
		    threshold.push(thresholdData1);
		    thresholdData2 = {  
	            "id" : "2",
	            "threshold_alarm" : newMemProduce,
	            "threshold_clear":newMemClear
	        };
		    threshold.push(thresholdData2);
		    thresholdData3 = {  
	            "id" : "3",
	            "threshold_alarm" : newDiskProduce,
	            "threshold_clear":newDiskClear
	        };
		    threshold.push(thresholdData3);
		    
		    var thresholdData = {  
	    			"threshold" : threshold
	    	};
		    var strthresholdData = JSON.stringify(thresholdData); 
	        console.log("strthresholdData :" + strthresholdData);

		    Ext.Ajax.request({
		        url : "/sysmanage/sysmng/monitor/threshold",
		        method : "post",
		        jsonData: strthresholdData,
		        headers: { "Content-Type": 'application/json' },
		        success: function(response, action) {
		        	Ext.Msg.alert(_('Success'),_('Edit the threshold successfully'));
		        },
		        failure: function(response, action) {
		        	Ext.Msg.alert(_('Failed'),_('Edit the threshold failed'));
		        }
		    });
		}
		else {
		    Ext.MessageBox.alert(_('Error'), _('Please check for correct input'));
		}
    	
    }
    
});
