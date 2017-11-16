Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSyncGlobalSet', {
    // extend: 'Ext.container.Container',
    extend: 'Ext.panel.Panel',
    xtype: 'AlarmSyncGlobalSet',
    title: _('Sync Parameter Set'),
    // height: 630,
    requires: ['Admin.view.alarms.AlarmSynMgt.AlarmSynDeviceSelection'],
    // width: 500,
    // layout:'fit',
	scrollable: true,
    controller:{
        selectDevice:function(){
            var controller = this;
            var AlarmSynDeviceSelection = Ext.create('Admin.view.alarms.AlarmSynMgt.AlarmSynDeviceSelection');
            var treeForSelect = AlarmSynDeviceSelection.lookup('treeForSelect');
            var forSelectStore = treeForSelect.getStore();
            AlarmSynDeviceSelection.isOtherUser = false;
            AlarmSynDeviceSelection.action = 'add';
            AlarmSynDeviceSelection.syn_task_id = '';
            AlarmSynDeviceSelection.areaTable = '';
            forSelectStore.reload();
            var popWindow = Ext.create("Ext.window.Window", {
                title: _('Selection Domain'),
                closable: true,
                autowidth: true,
                autoheight: true,
                border: false,
                layout: 'fit',
                items: AlarmSynDeviceSelection,
                closeAction: 'hide',
                width: 800,
                height: 600,
                maximizable: true,
                minimizable: true,
                modal: true,
                buttons: [{
                    xtype: "button",
                    text: _('Confirm'),
                    handler: function() {
                        popWindow.close();
                    }
                },{
                    xtype: "button",
                    text: _('Cancle'),
                    handler: function() {
                        popWindow.close();
                    }
                }]
            });
            popWindow.show();
        },
        onResumeAlarmSync: function(me, newValue, oldValue, eOpts) {
            var resumeAlarmSync = this.lookupReference('resumeAlarmSync');
            if(newValue){
                resumeAlarmSync.setDisabled(false);
            }else{
                resumeAlarmSync.setDisabled(true);
            }
        },
        onStartAlarmSync: function(me, newValue, oldValue, eOpts) {
            var startAlarmSync = this.lookupReference('startAlarmSync');
            if(newValue){
                startAlarmSync.setDisabled(false);
            }else{
                startAlarmSync.setDisabled(true);
            }
        },
        onReset:function(){
            this.lookupReference('form').getForm().reset();
        }
    },
    items:[{
        xtype: 'form',
        reference: 'form',
        padding: '50 0 20 80',
        layout: {
            type: 'table',
            columns: 2
        },
        defaults: {
            bodyStyle: 'padding:20px',
            width: 250,
        },
        items: [{
            xtype: 'checkbox',
            name : 'ii',
            boxLabel: _('Periodic task scheduling service'),
            checked: true,
            disabled: true
        },{
            html: _('If only turning on the scheduling service,can the alarm synchronization task be executed'),
            width: 550
        },{
            xtype: 'checkbox',
            name : 'ii',
            boxLabel: _('Synchronize alarm immediately after new NE added'),
            checked: true
        },{
            html: _('After turning on the function, the newly added NE will synchronize alarm automatically without manual operation'),
            width: 550
        },{
            xtype: 'checkbox',
            name : 'ii',
            boxLabel: '资源同步时，自动发起告警同步',
            checked: true
        },{
            html: '*开启此功能后，发起网元资源同步时，会自动同步告警，无需手动操作',
            width: 550
        },{
            xtype: 'checkbox',
            name : 'ii',
            boxLabel: _('Synchronize alarm after recovery of NE management channel from being interrupted'),
            listeners: {
                change:'onResumeAlarmSync'
            }
        },{
            html: _('The function can provide guarantees of the accuracy and real-time performance of alarm after recovery of the NE management channel'),
            width: 550
        },{
            xtype: 'fieldcontainer',
            reference: 'resumeAlarmSync',
            colspan: 2,
            disabled: true,
            defaultType: 'radiofield',
            defaults: {
                flex: 1
            },
            layout: 'hbox',
            items: [
                {
                    boxLabel  : _('All Ne'),
                    name      : 'resume',
                    inputValue: 'm',
                    checked: true
                }, {
                    boxLabel  : _('No Contain'),
                    reference: 'resumeAlarmSyncRadio',
                    name      : 'resume',
                    inputValue: 'l',
                }, {
                    xtype: 'button',
                    text: _('Details'),
                    handler: 'selectDevice',
                    bind:{
                        disabled:'{!resumeAlarmSyncRadio.checked}'
                    }
                }
            ]
        },{
            xtype: 'checkbox',
            name : 'ii',
            boxLabel: _('Synchronize alarm after starting of NMS server'),
            listeners: {
                change:'onStartAlarmSync'
            }
        },{
            html: _('The function can provide guarantees of the accuracy and integrity of the entire network alarm in the beginning of NMS server running'),
            width: 550
        },{
            xtype: 'fieldcontainer',
            reference: 'startAlarmSync',
            disabled: true,
            colspan: 2,
            defaultType: 'radiofield',
            defaults: {
                flex: 1
            },
            layout: 'hbox',
            items: [
                {
                    boxLabel  : _('All Ne'),
                    name      : 'start',
                    inputValue: 'm',
                    checked: true
                }, {
                    boxLabel  : _('Definition'),
                    reference: 'startAlarmSyncRadio',
                    name      : 'start',
                    inputValue: 'l',
                }, {
                    xtype: 'button',
                    text: _('Details'),
                    handler: 'selectDevice',
                    bind:{
                        disabled:'{!startAlarmSyncRadio.checked}'
                    }
                }
            ]
        }],
    }],
    buttons: [
        {
            text: _('Save'),
            iconCls:'x-fa fa-save',
            // handler: 'onSubmit',
        },
        {
            text: _('Reset'),
            iconCls:'x-fa fa-undo',
            handler: 'onReset',
        }
    ]
});