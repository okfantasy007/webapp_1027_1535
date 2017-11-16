/***
*告警属性中的告警信息部分
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.propertyAlarmInfoView', {
    extend: 'Ext.panel.Panel',
    xtype: 'propertyAlarmInfoView',
    requires: [
        'Ext.grid.property.Grid',
        'Ext.layout.container.Accordion'
    ],
    controller: {
        loadAlarmInfo: function(rowRecord){

        	var alarmInfo = this.lookupReference('propertyAlarmInfo');
        	var alarmSource = this.lookupReference('propertyAlarmSource');
        	var alarmConfirm = this.lookupReference('propertyAlarmConfirm');
        	var alarmClear = this.lookupReference('propertyAlarmClear');
            if(rowRecord!=null){
                //给告警级别赋值
                var vLevel = rowRecord.iLevel;
                var vLevelData = "";
                if (vLevel == 1) {
                    vLevelData = _('Critical');
                }else if (vLevel == 2) {
                    vLevelData = _('Major');
                }else if (vLevel == 3) {
                    vLevelData = _('Minor');
                } else if (vLevel == 4) {
                    vLevelData = _('Warning Alarm');
                }else if (vLevel == 5) {
                    vLevelData = _('Unknown Alarm');
                }else{
                    vLevelData = vLevel;
                }
                var isaffect = rowRecord.is_affect_service;
                var affect = "";
                if(isaffect==0){
                    affect=_('Not affect');
                }else if(isaffect==1){
                    affect=_('Affect');
                }else if(isaffect==2){
                    affect=_('Lead to service interruption');
                }
                var adminStatus = rowRecord.admin_status;
                var adminStatus1 = "";
                if(adminStatus==0){
                    adminStatus1=_('Not Acknowledged');
                }else if(adminStatus==1){
                    adminStatus1=_('Acknowledged');
                }else if(adminStatus==2){
                    adminStatus1=_('Cleared');
                }else if(adminStatus==3){
                    adminStatus1=_('filtered');
                }
                var iStatus = rowRecord.iStatus;
                var iStatus1="";
                if(iStatus==1){
                    iStatus1=_('Recovered');
                }else if(iStatus==2){
                    iStatus1=_('New Come');
                }
                var alarmcategory = rowRecord.alarm_category;
                var category = ""
                if(alarmcategory=="1"){
                    category=_('Equipment alarm');
                }else if(alarmcategory=="2"){
                    category=_('Quality of service alarm');
                }else if(alarmcategory=="3"){
                    category=_('Communication alarm');
                }else if(alarmcategory=="4"){
                    category=_('Environment alarm');
                }else if(alarmcategory=="5"){
                    category=_('Process error alarm');
                }
                alarmInfo.setSource({
                    alarmname: rowRecord.strName==null?'':rowRecord.strName,
                    iLevel: vLevelData,//级别
                    alarmcategory: category,
                    affection: affect,
                    adminstatus: adminStatus1,
                    alarmstatus: iStatus1,
                    alarmcount: rowRecord.iObject==null?'':rowRecord.iObject,
                    firstreporttime: rowRecord.strUptime==null?'':rowRecord.strUptime,
                    lastreporttime: rowRecord.strLastTime==null?'':rowRecord.strLastTime,
                    recoverytime: rowRecord.strRecoveryTime==null?'':rowRecord.strRecoveryTime,
                    responsetime: rowRecord.responding_time==null?'0'+_('Seconds'):rowRecord.responding_time,
                    processingtime: rowRecord.processing_time==null?'0'+_('Seconds'):rowRecord.processing_time,
                    lasingtime: rowRecord.lasting_time==null?'0'+_('Seconds'):rowRecord.lasting_time
                });
                var alarm_source_type = rowRecord.alarm_source_type;
                var alarmsourcetype = "";
                if(alarm_source_type==1){
                    alarmsourcetype =  _(' NE');
                }else if (alarm_source_type==2) {
                    alarmsourcetype =  _('Chassis');
                }else if(alarm_source_type==3){
                    alarmsourcetype =  _('Card');
                }else if (alarm_source_type==4) {
                    alarmsourcetype =  _('Port');
                }else if(alarm_source_type==5){
                    alarmsourcetype =  _('TimeSlot');
                }else if (alarm_source_typev==6) {
                    alarmsourcetype =  _('Power');
                }else if (alarm_source_type==7) {
                    alarmsourcetype =  _('Fan');
                }
                alarmSource.setSource({
                    alarmsourcetype: alarmsourcetype,
                    devicetype: rowRecord.netype_display_name==null?'':rowRecord.netype_display_name,
                    alarmsourcename: rowRecord.strDeviceName==null?'':rowRecord.strDeviceName,
                    ipaddress: rowRecord.strIPAddress==null?'':rowRecord.strIPAddress,
                    alarmsrclocation: rowRecord.strLocation==null?'':rowRecord.strLocation,
                    alarmdescription: rowRecord.strDesc==null?'':rowRecord.strDesc
                });
                alarmConfirm.setSource({
                    ackuser: rowRecord.strUserName==null?'':rowRecord.strUserName,
                    acktime: rowRecord.strAckTime==null?'':rowRecord.strAckTime,
                    acklog: rowRecord.strAckLog==null?'':rowRecord.strAckLog,
                    ackhost: rowRecord.strackhost==null?'':rowRecord.strackhost
                });
                alarmClear.setSource({
                    clearoperator: rowRecord.clear_user==null?'':rowRecord.clear_user,
                    faultcause: rowRecord.fault_reason_name==null?'':rowRecord.fault_reason_name,
                    clearingtime: rowRecord.strClearTime==null?'':rowRecord.strClearTime,
                    clearinglog: rowRecord.strClearLog==null?'':rowRecord.strClearLog,
                });
            }else{
               
            }
            
        },
        //将responding_time，processing_time，lasting_time的值，转换为：XX天XX时XX分XX秒的形式
        //目前没有用，已在java后台转换
        onGetTime: function(v){
            if(v!=null && v>0){
                var vd = Math.floor(v/(24*60*60));
                var vdy = v%(24*60*60);
                var vh = Math.floor(vdy/3600);
                var vhy = vdy%3600;
                var vm = Math.floor(vhy/60);
                var vs = vhy%60;
                var vContent = '';
                if(vd>0){
                    vContent=vContent+vd+_('Days');
                }
                if(vh>0){
                    vContent=vContent+vh+_('Hours');
                }
                if(vm>0){
                    vContent=vContent+vm+_('Minutes');
                }
                if(vs>0){
                    vContent=vContent+vs+_('Seconds');
                }
                if(vd==0 && vh==0 && vm==0 && vs==0){
                    vContent='0'+_('Seconds');
                }
                return vContent;
            }else{
                return '0'+_('Seconds');
            }
        },
        onbeforeedit: function(e){  
            e.cancel = true;  
            return false;  
        },
        onCollapse: function( p, eOpts ){
            console.log('collapse');
        }
    },
    title: _('Basic Info'),
    autoScroll : true,
    width: 300,
    height: 300,
    border: false,
    layout: 'accordion',
    layoutConfig: {  
        activeOnTop: true,  //设置打开的字面板置顶  
        fill: true,         //字面板充满父面板的剩余空间  
        hideCollapseTool: false,   //显示“展开收缩”按钮  
        titleCollapse: true,      //允许通过点击子面板的标题来展开或者收缩面板  
        animate: true             //使用动画效果  
    },
    items: [{
        title: _('Alarm Info'),
        xtype: 'propertygrid',
        reference: 'propertyAlarmInfo',
        emptyText : _('Empty'),
        propertyNames: {
            alarmname: _('Alarm Name'),//Alarm Name:strName:告警名称
            iLevel: _('Alarm Level'),//'告警级别'
            alarmcategory:_('Alarm Category'),//"告警分类"
            affection:_('Service Affection'),//"业务影响"
            adminstatus:_('Operation Status'),//"操作状态"
            alarmstatus:_('Alarm Status'),//"告警状态"
            alarmcount:_('Count'),//"发生次数"
            firstreporttime:_('First Report Time'),//"初次上报时间"
            lastreporttime:_('Last Report Time'),//"最近上报时间"
            recoverytime:_('Recovery Time'),//"自动恢复时间"
            responsetime:_('Response Time'),//"响应时长"
            processingtime:_('Processing Time'),//"处理时长"
            lasingtime:_('Lasting Time')//"告警历时"
        },
        listeners:{
            beforeedit: 'onbeforeedit',
            collapse: 'onCollapse'
        }     
    },{
        title: _('Alarm Origin'),
        xtype: 'propertygrid',
        reference: 'propertyAlarmSource',
        emptyText : _('Empty'),
        propertyNames: {
            alarmsourcetype: _('Alarm Source Type'),//"告警源类型"
            devicetype: _('Device Type'),// "设备类型"
            alarmsourcename: _('Alarm Source Name'),// "告警源名称"
            ipaddress: _('IP Address'),// "IP地址"
            alarmsrclocation: _('Alarm Src Location'),// "告警源位置"
            alarmdescription: _('Alarm Description'),// "告警描述"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        } 
    },{
        title: _('Alarm Ack'),
        xtype: 'propertygrid',
        reference: 'propertyAlarmConfirm',
        emptyText : _('Empty'),
        propertyNames: {
            ackuser: _('Ack User'),// "操作者"
            acktime: _('Ack Time'),// "告警确认时间"
            acklog: _('Ack Log'),// "告警确认日志"
            ackhost: _('Ack Host'),// "告警确认主机"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        } 
    },{
        title: _('Alarm Clear'),
        xtype: 'propertygrid',
        reference: 'propertyAlarmClear',
        emptyText : _('Empty'),
        propertyNames: {
            clearoperator: _('Clear Operator'),//"清除人员"
            faultcause: _('Fault Cause'),//"故障原因"
            clearingtime: _('Clearing Time'),//"告警清除时间"
            clearinglog: _('Clearing Log'),//"告警清除日志"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        } 
     }]
});