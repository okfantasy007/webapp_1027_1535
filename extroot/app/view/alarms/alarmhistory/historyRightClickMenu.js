/***
*历史告警的右键菜单
* @author ldy 2017/8/10
* 
*/

Ext.define('Admin.view.alarms.alarmhistory.historyRightClickMenu', {
    extend: 'Ext.menu.Menu',
    xtype: 'historyRightClickMenu',
    initComponent: function() {
        this.callParent();
        this.history_treedata_collection = new Object();//记录选中的告警
        this.history_checkform_collection = new Object();
        this.history_pagingtoolbar_collection = new Object();
    },
    controller: {
    	loadData: function(tree,form,pagingbar){
            var container = this.getView();
            container.history_treedata_collection = tree;
            container.history_checkform_collection = form;
            container.history_pagingtoolbar_collection = pagingbar;

            var checkeddate = container.history_treedata_collection.getSelection();//getChecked();
            var checkCount = checkeddate.length; 
            
            var addRepair = this.lookupReference('addRepair');
            var sameTypeRepair = this.lookupReference('sameTypeRepair');
            var alarmSelectDelete = this.lookupReference('alarmSelectDelete');
            var property = this.lookupReference('property');
            var location = this.lookupReference('location');
            var topologyLocation = this.lookupReference('topologyLocation');
            var deviceLocation = this.lookupReference('deviceLocation');
            var exportSelect = this.lookupReference('exportSelect');

            if(checkCount>0){
                alarmSelectDelete.setDisabled(false);
                addRepair.setDisabled(false);
                exportSelect.setDisabled(false);
            }else{
                alarmSelectDelete.setDisabled(true);
                addRepair.setDisabled(true);
                exportSelect.setDisabled(true);
            }
            if(checkCount==1){
                property.setDisabled(false);
                location.setDisabled(false);
                topologyLocation.setDisabled(false);
                deviceLocation.setDisabled(false);
                sameTypeRepair.setDisabled(false);
            }else{
                property.setDisabled(true);
                location.setDisabled(true);
                topologyLocation.setDisabled(true);
                deviceLocation.setDisabled(true);
                sameTypeRepair.setDisabled(true);
            }
    	},
    	//排障经验面板
        createExperienceWin: function(rowRecord) {

            var alarmExperienceWin = Ext.create("Ext.window.Window", {
                reference: 'alarmExperienceWin',
                title: _('With Same Alarm Type'),
                closable: true,
                autowidth: true,
                height: 400,
                border: false,
                layout: 'auto',
                autoScroll : true,
                //bodyStyle: "padding:20px;",
                //maximizable: true,
                //minimizable: true,
                items: [{
                    xtype:'propertyAlarmExperienceView'
                }]
            });
            var proAlarmExperience = alarmExperienceWin.down('propertyAlarmExperienceView');
            proAlarmExperience.lookupController().loadAlarmExperience(rowRecord);
            return alarmExperienceWin;
        },

    	onSameTypeRepair: function(){
            var container = this.getView();
            var checkeddate = container.history_treedata_collection.getSelection();//getChecked();
            var checkCount = checkeddate.length; 
            
            if(checkCount==1){
            	var alarmExperienceWin = this.createExperienceWin(checkeddate[0]);
                alarmExperienceWin.show();
            }else{
                Ext.MessageBox.alert(_('Tips'), _('Can only select one item'));
            }
    	},
    	onAlarmSelectDelete: function(){
            var container = this.getView();
            var checkeddate = container.history_treedata_collection.getSelection();//getChecked();
            var checkCount = checkeddate.length; 
            var ids = [];
            for(var i=0;i<checkCount;i++){  
                var alarmid = checkeddate[i].get("iRCAlarmLogID");
                ids.push(alarmid);
            }
            Ext.MessageBox.confirm(_('Confirmation'), _('Delete Selected Items'), function(btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url : 'alarm/historyAlarm/deleteSelectedHistoryAlarm',
                        params : {
                            ids : ids.join(',')
                        },
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                                container.history_treedata_collection.getStore().reload();
                                container.history_pagingtoolbar_collection.getStore().reload();
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        }
                    });
                }
            });
    	},
    	onAlarmQueryDelete: function(){
            var container = this.getView();
            Ext.MessageBox.confirm(_('Confirmation'), _('Delete Query results'), function(btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url : 'alarm/historyAlarm/deleteCheckedHistoryAlarm',
                        params : container.history_checkform_collection.getForm().getValues(),
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                                container.history_treedata_collection.getStore().reload();
                                container.history_pagingtoolbar_collection.getStore().reload();
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        }
                    });
                }
            });
    	},
    	onAlarmAllDelete: function(){
            var container = this.getView();
            Ext.MessageBox.confirm(_('Confirmation'), _('Delete All'), function(btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url : 'alarm/historyAlarm/deleteAllHistoryAlarm',
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                                container.history_treedata_collection.getStore().reload();
                                container.history_pagingtoolbar_collection.getStore().reload();
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        },
                        failure : function(response){}
                    });
                }
            });
    	},
    	//属性窗体
        createPropertyWin: function(rowRecord) {
            var alarmPropertyWin = Ext.create("Admin.view.alarms.alarmproperty.alarmPropertyWindow", {});
            alarmPropertyWin.lookupController().loadData(rowRecord);
            return alarmPropertyWin;
        },
        onProperty: function(){
            var container = this.getView();
        	var checkeddate = container.history_treedata_collection.getSelection();//getChecked();
            var checkCount = checkeddate.length;

        	if(checkCount==1){
        		alarmPropertyWin = this.createPropertyWin(checkeddate[0]);
                alarmPropertyWin.show();
            }else{
                Ext.MessageBox.alert(_('Tips'), _('Can only select one item'));
            }
        }

    },
    items: [{
        name: 'repair',
        reference:'repair',
        icon: 'x-fa fa-wrench', //图标文件 
        text: _('Troubleshooting'),
        menu: {
            items: [{
                name: 'addRepair',
                reference: "addRepair",
                text: _('Add Troubleshooting'),
                disabled : true,
                handler: function() {
                
                }
            },{
                name: 'sameTypeRepair',
                reference: "sameTypeRepair",
                text: _('With Same Alarm Type'),
                disabled : true,
                handler: 'onSameTypeRepair'
            }]
        }  
    },{
        name: 'delete',
        iconCls : 'delete_alarm_btn', //图标文件
        text: _('Delete'),
        menu: {   
            items: [{
                itemId : 'alarmSelectDelete',
                reference: "alarmSelectDelete",
                name: 'DeleteSelectedItems',
                text : _('Delete Selected Items'),
                handler: 'onAlarmSelectDelete',
                disabled : true
            },{
                itemId : 'alarmQueryDelete',
                name: 'DeleteQueryresults',
                text : _('Delete Query results'),
                handler: 'onAlarmQueryDelete'  
            },{
                itemId : 'alarmAllDelete',
                name: 'DeleteAll',
                text : _('Delete All'),
                handler:'onAlarmAllDelete'
            }]
        }
    },{
        name: 'property',
        reference: "property",
        // icon: 'images/write2.gif', //图标文件
        handler: 'onProperty',
        text: _('Properties'),
        disabled : true
    },{
        reference: "location",
        name: 'location',
        // icon: 'images/write2.gif', //图标文件
        text: _('Localization'),
        //xtype: 'splitbutton',
        disabled : true,
        menu: {   
            items: [{
                reference: "topologyLocation",
                name: 'topologyLocation',
                text : _('Topological Localization'),
                disabled : true
            },{
                reference: "deviceLocation",
                name: 'deviceLocation',
                text : _('device Localization'),
                disabled : true
            }]
        } 
    },{
        name: 'export',
        text: _('Export'),
        menu:[{
            text:_('All'),
        },{
            text:_('current page'),
        },{
            text:_('selected'),
            reference: 'exportSelect',
            
            disabled: true
        }]
    }]
});