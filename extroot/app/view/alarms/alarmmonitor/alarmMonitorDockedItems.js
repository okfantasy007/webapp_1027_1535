/***
*分组监控的工具栏
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.alarmMonitorDockedItems', {
    extend: 'Ext.Toolbar',
    xtype: 'alarmMonitorDockedItems',
    //style: {
    //    background: '#E0E0E0',//'#D8D8D8',//'#FFCC66',
    //    bodyStyle: 'border-width:0 0 3px 0;'
    //},
    controller:{
        onAlarmIlevelCount:function(sqlCondition){
            var treepanel = this.getView().up('currentAlarmTreeView');
            var subNeID = treepanel.subNeID;
            var MonitorView = treepanel.up('alarmGroupMonitorView');
            var viewmodel = MonitorView.getViewModel();

            if(sqlCondition==null){
               sqlCondition="";
            }
            Ext.Ajax.request({
                url : 'alarm/Monitor/getAlarmiLevelCount',
                params : {
                    condition : sqlCondition,
                    subneid : subNeID
                },
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        viewmodel.set('monitorAlarm_lv1_count',r.data.alarm_lv1_count);
                        viewmodel.set('monitorAlarm_lv2_count',r.data.alarm_lv2_count);
                        viewmodel.set('monitorAlarm_lv3_count',r.data.alarm_lv3_count);
                        viewmodel.set('monitorAlarm_lv4_count',r.data.alarm_lv4_count);
                        viewmodel.set('monitorAlarm_lv5_count',r.data.alarm_lv5_count);
                    }else{
                        viewmodel.set('monitorAlarm_lv1_count',0);
                        viewmodel.set('monitorAlarm_lv2_count',0);
                        viewmodel.set('monitorAlarm_lv3_count',0);
                        viewmodel.set('monitorAlarm_lv4_count',0);
                        viewmodel.set('monitorAlarm_lv5_count',0);
                    }     
                 },
                 failure:function(){
                    viewmodel.set('monitorAlarm_lv1_count',0);
                    viewmodel.set('monitorAlarm_lv2_count',0);
                    viewmodel.set('monitorAlarm_lv3_count',0);
                    viewmodel.set('monitorAlarm_lv4_count',0);
                    viewmodel.set('monitorAlarm_lv5_count',0);
                 }
            });
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
        }
    },
    items: [{
        xtype: 'button',
        ui: 'alarm-counter',
        style: 'background:#d9534f',
        bind: {
            text:'{monitorAlarm_lv1_count}',
            tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{monitorAlarm_lv1_count}', 1),
        },
        reference:'alarmCriticalBtn'
    },{
        xtype: 'button',
        ui: 'alarm-counter',
        style: 'background:#ff851b',
        bind: {
            text:'{monitorAlarm_lv2_count}',
            tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{monitorAlarm_lv2_count}', 2),
        },
        reference:'alarmMajorBtn'
    },{
        xtype: 'button',
        ui: 'alarm-counter',
        style: 'background:#f0ad4e',
        bind: {
            text:'{monitorAlarm_lv3_count}',
            tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{monitorAlarm_lv3_count}', 3),
        },
        reference:'alarmMinorBtn'
    },{
        xtype: 'button',
        ui: 'alarm-counter',
        style: 'background:#31b0d5',     // 浅蓝
        bind: {
            text:'{monitorAlarm_lv4_count}',
            tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{monitorAlarm_lv4_count}', 4),
        },
        reference:'alarmWarningBtn'
    },{
        xtype: 'button',
        ui: 'alarm-counter',
        style: 'background:#999',    // 灰色
        bind: {
            text:'{monitorAlarm_lv5_count}',
            tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{monitorAlarm_lv5_count}', 5),
        },
        reference:'alarmUnknownBtn'
    },{
        xtype: 'button',
        ui: 'alarm-counter-total',
        bind: {
            text: '{monitorAlarm_total_count}',
            tooltip: _('Current total number of alarms') + ': {monitorAlarm_total_count}',
        },
        reference:'alarmCountsBtn',
        margin: '0 20 0 0'
    },'|',{
        //清除告警的menu
        xtype: 'splitbutton',
        tooltip : _('Clear'),
        iconCls : 'x-fa fa-minus-circle',
        menu:[{
            //'清除选择项',
            text : _('Selected Items'),
            tooltip : _('Selected Items'),
            //iconCls : 'delete_alarm_btn',
            reference:'clearSelectedBtn',
            handler: function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onClearSelected();
            },
            bind:{disabled:'{moreChecked_disabled}'}
            //disabled: true
        },{
            //'所有同类型',
            text : _('Same Type'),
            tooltip : _('Same Type'),
            //iconCls : 'delete_alarm_btn',
            reference:'clearSameTypeBtn',
            handler: function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onClearSameType();
            },
            bind:{disabled:'{oneChecked_disabled}'}
            //disabled: true
        },{
            //'所有同位置',
            reference:'clearSameLocationBtn',
            text : _('Same Position'),
            tooltip : _('Same Position'),
            //iconCls : 'delete_alarm_btn',
            handler: function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onClearSameLocation();
            },
            bind:{disabled:'{oneChecked_disabled}'}
            //disabled: true                  
        },{
            //'所有已确定',
            reference:'clearConfirmedBtn',
            text : _('Confirmed'),
            tooltip : _('Confirmed'),
            //iconCls : 'delete_alarm_btn',
            handler: function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onClearConfirmed();
            }    
        },{
            //'全部清除',
            reference:'clearAllBtn',
            text : _('Clear All'),
            tooltip : _('Clear All'),  
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onClearAllAlarm();
            }                  
        }]
    },{
        //text : _('Confirm Alarm'),
        tooltip : _('Confirm Alarm'),
        iconCls : 'x-fa fa-check-circle',
        bind:{disabled:'{moreChecked_disabled}'},
        //disabled : true,
        reference:'confirmAlarmBtn',
        handler: function(){
            this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onConfirmAlarm();
        }
    },{
        xtype: 'splitbutton',
        tooltip: _('Localization'),
        reference:'locationBtn',
        iconCls: 'x-fa fa-map-marker',
        bind:{disabled:'{oneChecked_disabled}'},
        menu:[{
            text:_('Topological Localization'),
            reference:'topoLocationBtn',
            bind:{disabled:'{oneChecked_disabled}'},
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onTopologicalLocalization();
            }
        },{
            text:_('device Localization'),
            reference:'devLocationBtn',
            //iconCls: 'x-fa fa-undo',
            bind:{disabled:'{oneChecked_disabled}'}
            //disabled: true
        }]
    },{
        //text: _('Properties'),
        tooltip:_('Properties'),
        xtype: 'button',
        reference:'propertyBtn',
        iconCls:'x-fa fa-file-text-o',
        handler: function(){
            this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onProperyTool();
        },
        bind:{disabled:'{oneChecked_disabled}'}
        //disabled: true
    },{
        xtype: 'splitbutton',
        tooltip: _('Filter settings'),
        reference:'filterBtn',
        iconCls: 'x-fa fa-external-link',
        bind:{disabled:'{moreChecked_disabled}'},
        menu:[{
            text: _('Level Filtering'),
            reference:'filerLevelBtn',
            //iconCls: 'x-fa fa-undo',
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onFilteriLevel();
            },
            bind:{disabled:'{moreChecked_disabled}'}
            //disabled: true
        },{
            text:_('Type Filtering'),
            reference:'filterTypeBtn',
            //iconCls: 'x-fa fa-undo',
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onFilterType();
            },
            bind:{disabled:'{moreChecked_disabled}'}
            //disabled: true
        },{
            text:_('Position Filtering'),
            reference:'filterLocationBtn',
            //iconCls: 'x-fa fa-undo',
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onFilterLocation();
            },
            bind:{disabled:'{moreChecked_disabled}'}
            //disabled: true
        },{
            text:_('Position & Type'),
            reference:'filterTypeLocBtn',
            //iconCls: 'x-fa fa-undo',
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onFilterTypeLoc();
            },
            bind:{disabled:'{moreChecked_disabled}'}
            //disabled: true
        }]
    },{
        tooltip: _('Export'),
        xtype: 'splitbutton',
        iconCls:'x-fa fa-download',
        menu:[{
            text:_('All'),
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onExportAll();
            }
        },{
            text:_('current page'),
            reference: 'currentpageExportBtn',
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onExportCurrentPage();
            }
        },{
            text:_('selected'),
            reference: 'selectExportBtn',
            bind:{disabled:'{moreChecked_disabled}'},
            handler:function(){
                this.up('alarmMonitorDockedItems').up('currentAlarmTreeView').lookupController().onExportSelected();
            }
        }]
    },'->', {
        itemId : 'expandAll',
        text : '',// _('Full Expand'),
        tooltip : _('Full Expand'),
        handler :'onExpandAll',
        iconCls : 'x-fa fa-search-plus'
    },{
        itemId : 'closeAll',
        text : '',//_('Collapse All'),
        tooltip : _('Collapse All'),
        handler : 'onCloseAll',
        iconCls : 'x-fa fa-search-minus'
    }]
});