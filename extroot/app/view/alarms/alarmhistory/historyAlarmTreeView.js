Ext.define('Admin.view.alarms.alarmhistory.historyAlarmTreeView', {
    extend: 'Ext.tree.Panel',
    xtype: 'historyAlarmTreeView',
    rootVisible : false,
    store:{},
    autoWidth : true,
    autoHeight : true,
    frame : false,
    autoScroll : true,
    lines : true,
    columnLines : true,//是否显示列分割线，默认为false
    rowLines : true,
    disableSelection:false,//是否禁止行选择
    flex : 1,
    split : false,
    animate : true,// 动画效果
    containerScroll : true,
    emptyText : _('Empty'),
    loadMask:true,//加载时有加载的图标
    multiSelect : true,
    viewConfig : {
        forceFit: true,//列宽度自适应
        scrollOffset: 0,//去除最右边空白
            // Return CSS class to apply to rows depending upon data values
        getRowClass : function(record) {
            if (record.get('iStatus') == 1) {
                return 'alarm_col_2';
            }
            return null;
        }
    },
        columns : [{   
            xtype: 'treecolumn', 
            dataIndex:'treecolumn',
            width: 70, 
            sortable: true, 
            align: 'center', 
            headerCheckbox: true  
        },{
            text : _('Alarm ID'),
            dataIndex : 'iRCAlarmLogID',
            width : 75,
            align: 'center',
            menuDisabled : true
        },/*{
            text : iRCNetNodeID,
            dataIndex : 'iRCNetNodeID',
            width : 75,
            align: 'center',
            menuDisabled : true,
            hidden: true
        }, {
            text : iRCAlarmID,
            dataIndex : 'iRCAlarmID',
            width : 75,
            align: 'center',
            menuDisabled : true
            hidden: true
        }, {
            text : iRCNETypeID,
            dataIndex : 'iRCNETypeID',
            width : 75,
            align: 'center',
            menuDisabled : true
            hidden: true
        },*/ {
            text : _('Alarm Level'),
            dataIndex : 'iLevel',
            width : 95,
            menuDisabled : true,
            align: 'center',
        //hidden: true //隐藏
            renderer: function getColor(v,m,r){
                //if (r.get('iStatus') != 1) {
                    m.tdCls = 'alarm_bk_'+ r.get('iLevel');
                //}
                if (v == 1) {
                    return  _('Critical');
                }else if (v == 2) {
                    return  _('Major');
                }else if (v == 3) {
                    return  _('Minor');
                }else if (v == 4) {
                    return  _('Warning Alarm');
                }else if (v == 5) {
                    return  _('Unknown Alarm');
                }else{
                    return v;
                }
            }
        }, {
            text : _('Alarm Name'),
            dataIndex : 'strName',
            width : 100,
            menuDisabled : true

        }, {
            text : _('Alarm Description'),
            dataIndex : 'strDesc',
            width : 100,
            menuDisabled : true
        },{
            text : _('First Report Time'),
            dataIndex : 'strUptime',
            width : 150,
            menuDisabled : true
        },{
            //最近一次上报时间
            text : _('Last Report Time'),
            dataIndex : 'strLastTime',
            width : 150,
            menuDisabled : true,
            hidden: true
        },{
            text : _('Alarm Source Name'),
            dataIndex : 'strDeviceName',
            width : 120,
            menuDisabled : true
        }, {
            text : _('Alarm Src Location'),
            dataIndex : 'strLocation',
            width : 120,
            menuDisabled : true
        },{
            text : _('Alarm Source Type'),
            dataIndex : 'alarm_source_type',
            width : 150,
            menuDisabled : true,
            hidden: true,
            renderer: function getalarmSourceType(v){
                if(v==1){
                    return _(' NE');
                }else if (v==2) {
                    return _('Chassis');
                }else if(v==3){
                    return _('Card');
                }else if (v==4) {
                    return _('Port');
                }else if(v==5){
                    return _('TimeSlot');
                }else if (v==6) {
                    return _('Power');
                }else if (v==7) {
                    return _('Fan');
                }else{
                    return v; 
                }
            }
        }, {
            text : _('IP Address'),
            dataIndex : 'strIPAddress',
            width : 100,
            menuDisabled : true
        }, {
            text : _('Device Type'),
            dataIndex : 'netype_display_name',
            width : 100,
            menuDisabled : true
        },{
            text : _('Alarm Category'),
            dataIndex : 'alarm_event_type',
            width : 150,
            menuDisabled : true,
            hidden: true,
            renderer: function getIstatus(v){
                if(v==0){
                    return _('unknown');
                }else if (v==1) {
                    return _('Revertive');
                }else if (v==2) {
                    return _('Fault');
                }else if (v==3) {
                    return _('Notify');
                }else{
                    return v;
                }
            }
        }, {
            text : _('Alarm Status'),
            dataIndex : 'iStatus',
            width : 100,
            menuDisabled : true,
            renderer: function getIstatus(v){
                if(v==1){
                    return _('Recovered');
                }else if (v==2) {
                    return _('New Come');
                }else{
                    return v;
                }
            }
        }, {
            text : _('Operation Status'),
            dataIndex : 'admin_status',
            width : 110,
            menuDisabled : true,
            renderer: function getIstatus(v){
                if(v==1){
                   return _('Acknowledged');
                }else if (v==0) {
                    return _('Not Acknowledged');
                }else if(v==2){
                    return _('Clear');
                }else if(v==3){
                    return _('Filter');
                }else{
                    return v;
                }
            }
        },{
            text : _('Alarm URL'),
            dataIndex : 'url',
            width : 150,
            menuDisabled : true,
            hidden: true
        },{
            //'告警历时'
            text : _('Lasting Time'),
            dataIndex : 'lasting_time',
            width : 150,
            menuDisabled : true
        },{
            //'告警自动恢复告警'
            text : _('Recovery Time'),
            dataIndex : 'strRecoveryTime',
            width : 150,
            menuDisabled : true,  
        },{   
            text : _('Alarm Count'),
            dataIndex : 'iObject',
            width : 150,
            menuDisabled : true,
            hidden: true
        },{
            text : _('Local Alarm'),
            dataIndex : 'is_local',
            width : 150,
            menuDisabled : true,
            hidden: true,
            renderer: function getIslocal(v){
                if(v==0){
                    return _('Remote');//"远端";
                }else if(v==1){
                    return _('Local');//"局端";
                }else{
                    return v;
                }
            }
        },{
            text : _('Is Affect Service'),
            dataIndex : 'is_affect_service',
            width : 150,
            menuDisabled : true,
            hidden: true,
            renderer: function getIsAffectService(v){
                if(v==0){
                    return _('Not affect');
                }else if(v==1){
                    return _('Affect');
                }else if(v==2){
                    return _('Lead to service interruption');
                }else{
                    return v;
                }
            }
        },{
            text : _('Ack User'),//告警确认人员，操作者
            dataIndex : 'strUserName',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Ack Host'),//告警确认主机
            dataIndex : 'strackhost',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Ack Log'),//告警确认日志
            dataIndex : 'strAckLog',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Ack Time'),//告警确认时间
            dataIndex : 'strAckTime',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Clear Operator'),//告警清除人员
            dataIndex : 'clear_user',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Clearing Log'),//告警清除日志
            dataIndex : 'strClearLog',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Clearing Time'),//告警清除时间
            dataIndex : 'strClearTime',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Tenant'),//客户，目前是租户
            dataIndex : 'cus_name',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Response Time'),//响应时间
            dataIndex : 'responding_time',
            width : 150,
            menuDisabled : true,
            flex : 1
        },{
            text : _('Processing Time'),//处理时长
            dataIndex : 'processing_time',
            width : 150,
            menuDisabled : true,
            flex : 1
        },{
            text : _('Fault Cause'),//故障原因
            dataIndex : 'fault_reason_name',
            width : 150,
            menuDisabled : true,
            flex : 1,
            hidden: true
        },{
            text : _('Gateway Name'),
            dataIndex : 'gateway_name',
            width : 150,
            menuDisabled : true,
            flex : 1
            //hidden: true
        }/*,{
            //text : '',
            dataIndex : 'flexThis',
            width : 150,
            menuDisabled : true,
            flex : 1
        }*/]
});