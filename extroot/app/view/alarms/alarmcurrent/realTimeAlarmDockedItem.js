/***
*当前告警的工具栏
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.realTimeAlarmDockedItem', {
    extend: 'Ext.Toolbar',
    xtype: 'realTimeAlarmDockedItem',
    reference: 'realTimeAlarmDockedItem',
    // style: {
    //     background: '#E0E0E0',//'#D8D8D8',//'#FFCC66',
    //     bodyStyle: 'border-width:0 0 3px 0;'
    // },
    controller:{
        onCeckLinkage:function(symbolids){
            var realTimeTreepanel =  this.getView().up('currentAlarmTreeView');
            realTimeTreepanel.getStore().proxy.url='alarm/currentAlarm/getLinkageAlarm';
            realTimeTreepanel.getStore().proxy.extraParams={symbolid:symbolids};
            realTimeTreepanel.getStore().reload();
            this.getView().up('realTimeAlarmView').lookupController().onGetAlarmSecSymbolid(symbolids);
        },
        onCeckLinkageFalse:function(me,checked){
            var realTimeTreepanel =  this.getView().up('currentAlarmTreeView');
            Ext.TaskManager.stop(realTimeTreepanel.task);//停止任务
            if(checked){
                var topoMainView = realTimeTreepanel.up('topoMainView');
                var topoTree = topoMainView.down('treepanel');
                var selectItems = topoTree.getSelection();
                var ary = [];
                for (var i in selectItems){
                    ary.push(selectItems[i].get('symbol_id'));
                }
                //realTimeTreepanel.LinkageSymbol = ary;
                var symbolids = ary.join(',');
                this.onCeckLinkage(symbolids);
            }else{
                //var ary = [0];
                //realTimeTreepanel.LinkageSymbol = ary;
                this.onCeckLinkage(0);
            }
        },
        onShowLatestAlarm: function(me,checked){
            var Freezingcheckbtn = this.lookupReference('Freezing');
            if(checked){
                Freezingcheckbtn.setDisabled(true);
            }else{
                Freezingcheckbtn.setDisabled(false);
            }
        },
        onFreezing:function(me,checked){
            var realTimeTreepanel =  this.getView().up('currentAlarmTreeView');
            var ShowLatestAlarm = this.lookupReference('ShowLatestAlarm');
            if(checked){
                ShowLatestAlarm.setDisabled(true);
                Ext.TaskManager.stop(realTimeTreepanel.task);//停止任务
            }else{
                ShowLatestAlarm.setDisabled(false);
                Ext.TaskManager.start(realTimeTreepanel.task);//启动任务
            }
        },
        onExpandAll:function(){
            var dockedItems = this.getView();
            var treepanel = dockedItems.up('currentAlarmTreeView');
            treepanel.expandAll();
        },
        onCloseAll: function() {
            var dockedItems = this.getView();
            var treepanel = dockedItems.up('currentAlarmTreeView');
            treepanel.collapseAll();
        },
        onRefresh:function(){
            var dockedItems = this.getView();
            var treepanel = dockedItems.up('currentAlarmTreeView');
            treepanel.getStore().proxy.url='alarm/currentAlarm/getLinkageAlarm';
            //treepanel.getStore().proxy.extraParams={symbolid:0};
            treepanel.getStore().reload();
        }
    },
    items: [/*{
        xtype:'label',
        forId: 'myFieldId',
        margin: '10 0 0 0'
    },{
        itemId : 'tbSeparator',
        xtype: 'tbseparator'
    },*/{
        text : _('Confirm Alarm'),
        tooltip : _('Confirm Alarm'),
        iconCls : 'x-fa fa-check-circle',
        disabled : true,
        reference:'confirmAlarmBtn',
        handler: function(){
            this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onConfirmAlarm();
        }
    },{
        text : _('Cancel Confirm'),
        tooltip : _('Cancel Confirm'),
        iconCls : 'x-fa fa-circle',
        reference:'unConfirmAlarmBtn',
        disabled : true,
        handler: function(){
            this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onUnconfirmAlarm();
        }
    },{
        itemId : 'tbSeparator',
        xtype: 'tbseparator'
    },{
        //清除告警的menu
        xtype: 'splitbutton',
        text : _('Clear'),
        iconCls : 'x-fa fa-minus-circle',
        menu:[{
            //'清除选择项',
            text : _('Selected Items'),
            tooltip : _('Selected Items'),
            //iconCls : 'delete_alarm_btn',
            reference:'clearSelectedBtn',
            handler: function(){
                this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onClearSelected();
            },
            //disabled: true
            bind:{disabled:'{realTime_more_check_disabled}'}
        },{
            //'所有同类型',
            text : _('Same Type'),
            tooltip : _('Same Type'),
            //iconCls : 'delete_alarm_btn',
            reference:'clearSameTypeBtn',
            handler: function(){
                this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onClearSameType();
            },
            //disabled: true
            bind:{disabled:'{realTime_one_check_disabled}'}
        },{
            //'所有同位置',
            reference:'clearSameLocationBtn',
            text : _('Same Position'),
            tooltip : _('Same Position'),
            //iconCls : 'delete_alarm_btn',
            handler: function(){
                this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onClearSameLocation();
            },
            //disabled: true
            bind:{disabled:'{realTime_one_check_disabled}'}              
        },{
            //'所有已确定',
            reference:'clearConfirmedBtn',
            text : _('Confirmed'),
            tooltip : _('Confirmed'),
            //iconCls : 'delete_alarm_btn',
            handler: function(){
                this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onClearConfirmed();
            }   
        },{
            //'全部清除',
            reference:'clearAllBtn',
            text : _('Clear All'),
            tooltip : _('Clear All'),
            handler:function(){
                this.up('realTimeAlarmDockedItem').up('currentAlarmTreeView').lookupController().onClearAllAlarm();
            }               
        }]
    },{
        itemId : 'tbSeparator',
        xtype: 'tbseparator'
    },/*{
        text : _('Promoted Main Alarm'),
        tooltip : _('Promoted Main Alarm'),
        iconCls : 'ack_alarm_btn',
        disabled : true,
        reference:'promotedMainAlarmBtn',
        handler: 'onPromotedMainAlarm'
    },*/'->', {
        itemId : 'CheckLinkage',
        xtype : 'checkboxfield',
        reference:'CheckLinkage',
        boxLabel : _('Check Linkage'),
        checked : false,
        padding : '0 6 0 0',
        handler: 'onCeckLinkageFalse'
    },{
        itemId : 'ShowLatestAlarm',
        xtype : 'checkboxfield',
        reference:'ShowLatestAlarm',
        boxLabel : _('Show Latest Alarm'),
        checked : false,
        padding : '0 6 0 0',
        handler: 'onShowLatestAlarm'
    },{
        itemId : 'Freezing',
        xtype:'checkboxfield',
        reference:'Freezing',
        tooltip : _('Freezing'),
        boxLabel : _('Freezing'),
        checked : false,
        padding : '0 6 0 0',
        handler: 'onFreezing'
    },{
        itemId : 'tbSeparator',
        xtype: 'tbseparator'
    },{
        itemId : 'expandAll',
        text : '',// _('Full Expand'),
        tooltip : _('Full Expand'),
        handler :'onExpandAll',
        iconCls : 'toggle_plus',
        disabled : false
    },{
        itemId : 'closeAll',
        text : '',//_('Collapse All'),
        tooltip : _('Collapse All'),
        handler : 'onCloseAll',
        iconCls : 'toggle_minus',
        disabled : false
    },{
        itemId : 'tbSeparator1',
        xtype: 'tbseparator'
    },{
        itemId : 'Refresh',
        text : _('Refresh'),
        tooltip : _('Refresh'),
        iconCls : 'x-fa fa-refresh',
        handler : 'onRefresh'
    }]
});