/***
 *分组监控的进入页，主要是分组监控模块及规则添加编辑模块的综合
 * @author ldy 2017/8/10
 * 
 */
Ext.define('Admin.view.alarms.alarmmonitor.alarmMonitorMainPanel', {
    extend: 'Ext.container.Container', //'Ext.panel.Panel',
    xtype: 'alarmMonitorMainPanel',
    reference: 'alarmMonitorMainPanel',
    layout: 'card',
    requires: [
        'Admin.view.alarms.alarmmonitor.amRuleOperView',
        'Admin.view.alarms.alarmmonitor.alarmGroupMonitorView'
    ],
    initComponent:function(){
        this.callParent();
        this.scanCount=0;
    },
    controller: {
        onActivate:function(newActiveItem, me, oldActiveItem, eOpts){
           if(this.getView().scanCount==0){
                this.getView().scanCount=1;
            }else{
                console.log('--load monitor view--')
                var alarmGroupMonitorView = this.lookupReference('alarmGroupMonitorView');
                var ruletree = alarmGroupMonitorView.lookupReference('treelist');
                var monitorAlarmTree = alarmGroupMonitorView.lookupReference('monitorAlarmTree');
                var monitorPagingToolBar = monitorAlarmTree.lookupReference('monitorPagingToolBar');
                monitorPagingToolBar.alarm_page_isqurey=1;
                //ruletree.getSelectionModel().clearSelections();
                //ruletree.getView().refresh();
                ruletree.store.proxy.extraParams={};
                ruletree.store.load();

                monitorAlarmTree.store.proxy.extraParams={};
                //monitorAlarmTree.store.reload();

                monitorPagingToolBar.store.proxy.extraParams={};
                monitorPagingToolBar.store.load();

                alarmGroupMonitorView.lookupController().onAfterRender();
            }
            //ruletree.setActiveItem(0);
        },
        onBeforeDeactivate:function(me,eOpts){
            var monitorAlarmTree =  me.down('currentAlarmTreeView');
            Ext.TaskManager.stop(monitorAlarmTree.task);//停止任务
            console.log('--stop monitor task before deactivate--')
        }
    },
    items: [{
        xtype: 'alarmGroupMonitorView',
        reference: 'alarmGroupMonitorView'
    }, {
        xtype: 'amRuleOperView',
        //title: _('Edit Monitor Rules'),
        reference: 'amRuleOperView'
    }],
    listeners: {
        activate: 'onActivate',
        //beforedestroy:'onBeforeDestroy',
        beforedeactivate:'onBeforeDeactivate'
    }
});