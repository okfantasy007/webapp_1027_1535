/***
*告警属性，中的板卡部分
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.propertyAlarmCardView', {
    extend: 'Ext.panel.Panel',
    xtype: 'propertyAlarmCardView',
    requires: [
        'Ext.grid.property.Grid'
    ],
    controller: {
        loadAlarmCard: function(rowRecord){
            var cardBaseByNodeId = this.lookupReference('cardBaseByNodeId');
            //var cardProByNodeId = this.lookupReference('cardProByNodeId');

            var alarmCardStore =  Ext.Ajax.request({
                url : 'alarm/historyAlarm/getCardInfoByUrl',
                params : {url: rowRecord.url},
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        for(var i in r.data){
                            var propertyInfo= r.data[i];
                            if(propertyInfo.card_name!=null){
                                var is_local = propertyInfo.is_local;
                                var islocal = "";
                                if(is_local==0){
                                    islocal= _('Remote');//"远端";
                                }else if(is_local==1){
                                    islocal= _('Local');//"局端";
                                }
                                var isexisting = propertyInfo.isexisting;
                                var is_existing = _('Regin');
                                if(isexisting==0){
                                    is_existing= _('NoRegin');//"不在位";
                                }else if(isexisting==1){
                                    is_existing= _('Regin');//"在位";
                                }
                                cardBaseByNodeId.setSource({
                                    slotname: propertyInfo.card_name==null?'':propertyInfo.card_name,
                                    carddesc: propertyInfo.card_desc==null?'':propertyInfo.card_desc,//级别
                                    slottype: propertyInfo.card_type_display_name==null?'':propertyInfo.card_type_display_name,
                                    localRemote: islocal,
                                    localposition: propertyInfo.cot_location==null?'':propertyInfo.cot_location,//propertyInfo.COT_LOCATION,
                                    isexisting: is_existing,//propertyInfo.isexisting==null?'':propertyInfo.isexisting,
                                    customersDistribution: propertyInfo.card_is_used==null?'':propertyInfo.card_is_used,//propertyInfo.CARD_IS_USED,
                                    softwareversion: propertyInfo.software_ver==null?'':propertyInfo.software_ver,
                                    hardwareVersion: propertyInfo.hardware_ver==null?'':propertyInfo.hardware_ver,
                                    updateTime: propertyInfo.update_time==null?'':propertyInfo.update_time,
                                    syncTime: propertyInfo.last_syn_time==null?'':propertyInfo.last_syn_time,
                                    serialNo: propertyInfo.serial==null?'':propertyInfo.serial,
                                    tenant: propertyInfo.tenant==null?'':propertyInfo.tenant
                                });
                                /*cardProByNodeId.setSource({
                                    serialNo: propertyInfo.serial==null?'':propertyInfo.serial,
                                    equipmentApplication: "",//propertyInfo.PURPOSE_NAME,
                                    project: "",//propertyInfo.PROJECT,
                                    station: "",//propertyInfo.STATION,
                                    machineroom: "",//propertyInfo.ROOM,
                                    rack: "",//propertyInfo.SHELF,
                                    provider: "",//propertyInfo.serial,
                                    contractor: ""//propertyInfo.PROVIDER,
                                });*/
                            }  
                        } 
                    }else{
                        cardBaseByNodeId.setSource({});
                        //cardProByNodeId.setSource({});
                    }
                }
            });
        },
        onbeforeedit: function(e){  
            e.cancel = true;  
            return false;  
        }
    },
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
        title: _('Basic Info'),
        //width: 300,
        xtype: 'propertygrid',
        //collapsible: true,
        //collapsed: true,
        reference:'cardBaseByNodeId',
        emptyText : _('Empty'),
        propertyNames: {
            slotname: _('SlotName'),//"板卡名称"
            carddesc: _('Card Desc'),// "板卡描述"
            slottype: _('SlotType'),// "板卡类型"
            localRemote: _('Local/Remote'),// "局/远端"
            localposition: _('Local position'),// "局端位置"
            isexisting: _('IsExisting'),// "在位状态"
            customersDistribution: _('Customers Distribution'),// "客户分配"
            softwareversion: _('Software Version'),// "软件版本"
            hardwareVersion: _('Hardware Version'),// "硬件版本"
            updateTime: _('Update Time'),// "更新时间"
            syncTime: _('Sync Time'),// "同步时间"
            serialNo: _('Serial No.'),//"序列号"
            tenant: _('Tenant'),//"租户"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        }      
    }/*,{
        title: _('Engineering Information'),
        width: 300,
        collapsible: true,
        xtype: 'propertygrid',
        collapsed: true,
        reference:'cardProByNodeId',
        emptyText : _('Empty'),
        propertyNames: {
            serialNo: _('Serial No.'),//"序列号"
            equipmentApplication: _('Equipment Application'),//"设备用途"
            project: _('project'),//"所属工程"
            station: _('station'),//"所属局站"
            machineroom: _('machine room'),//"所属机房"
            rack: _('Rack'),//"所属机架"
            provider: _('provider'),//"供应商"
            contractor: _('contractor'),//"承包商"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        } 
    }*/]
});