/***
*告警属性中的设备信息部分
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.propertyAlarmDeviceView', {
    extend: 'Ext.panel.Panel',
    xtype: 'propertyAlarmDeviceView',
    requires: [
        'Ext.grid.property.Grid'
    ],
    controller: {
        loadAlarmDevice: function(rowRecord){
            var deviceBaseByNodeId = this.lookupReference('deviceBaseByNodeId');
            var deviceOperaByNodeId = this.lookupReference('deviceOperaByNodeId');
            var deviceProByNodeId = this.lookupReference('deviceProByNodeId');
            var alarmDeviceStore =  Ext.Ajax.request({
                url : 'alarm/historyAlarm/getDeviceInfoByNodeid',
                params : {nodeid: rowRecord.iRCNetNodeID},
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        for(var i in r.data){
                            var deviceProperty= r.data[i];
                            var iPingOk = _('Offline');
                            if(deviceProperty.resourcestate==1){
                                iPingOk = _('Online');
                            }else{
                                iPingOk = _('Offline');
                            }
                            deviceBaseByNodeId.setSource({
                                nodename: deviceProperty.userlabel==null?'':deviceProperty.userlabel,
                                hostname: deviceProperty.hostname==null?'':deviceProperty.hostname,
                                devicetype: deviceProperty.netypename==null?'':deviceProperty.netypename,
                                ipaddress: deviceProperty.ipaddress==null?'':deviceProperty.ipaddress,
                                netname: deviceProperty.symbol_name1==null?'':deviceProperty.symbol_name1,
                                //"设备用途": deviceProperty.PURPOSE_NAME,
                                softwareversion: deviceProperty.software_ver==null?'':deviceProperty.software_ver,
                                hardwareversion: deviceProperty.hardware_ver==null?'':deviceProperty.hardware_ver,
                                onlineStatus: iPingOk
                                //"告警状态": deviceProperty.ISTATUS
                            });
                            //var lastResTime = deviceProperty.last_res_sync_begin_time;
                            deviceOperaByNodeId.setSource({
                                createdtime: deviceProperty.create_time==null?'':deviceProperty.create_time,
                                synctime: deviceProperty.last_res_sync_begin_time==null?'':deviceProperty.last_res_sync_begin_time,
                                syncstatus: deviceProperty.last_sync_status==null?'':deviceProperty.last_sync_status,
                                //"同步次数": deviceProperty.SYN_TIMES
                            });
                            deviceProByNodeId.setSource({
                                provider: deviceProperty.vendor==null?'':deviceProperty.vendor,
                                contractor: deviceProperty.owner==null?'':deviceProperty.owner,
                                serialno: deviceProperty.serial==null?'':deviceProperty.serial,//deviceProperty.SERIAL,
                                specificlocation:deviceProperty.location==null?'':deviceProperty.location,
                                tenant:deviceProperty.tenant==null?'':deviceProperty.tenant
                                //"所属工程": deviceProperty.PROJECT,
                                //"所属局站": deviceProperty.STATION,
                                //"所属机房": deviceProperty.ROOM,
                                //"机架编号": deviceProperty.SHELF
                            });
                        }
                    }else{
                        deviceBaseByNodeId.setSource({});
                        deviceOperaByNodeId.setSource({});
                        deviceProByNodeId.setSource({});
                    }
                }
            });
        },
        onbeforeedit: function(e){  
            e.cancel = true;  
            return false;  
        }
    },
    title: _('Device Properties'),
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
        reference:'deviceBaseByNodeId',
        emptyText : _('Empty'),
        propertyNames: {
            nodename: _('Node Name'),//"节点名称"
            hostname: _('Host Name'),//"主机名称"
            devicetype: _('Device Type'),//"设备类型"
            ipaddress: _('IP Address'),//"IP地址"
            netname: _('Net Name'),//"所在子网/子图"
            softwareversion: _('Software Version'),//"软件版本"
            hardwareversion: _('Hardware Version'),//"硬件版本"
            onlineStatus: _('onlineStatus'),//"在线状态"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        } 
    },{
        title: _('Operational Information'),
        //width: 300,
        //collapsible: true,
        xtype: 'propertygrid',
        //collapsed: true,
        reference:'deviceOperaByNodeId',
        emptyText : _('Empty'),
        propertyNames: {
            createdtime: _('Created Time'),//"创建时间"
            synctime: _('Sync Time'),//"同步时间"
            syncstatus: _('Sync Status'),//"同步状态"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        }          
    },{
        title: _('Engineering Information'),
        //width: 300,
        //collapsible: true,
        xtype: 'propertygrid',
        //collapsed: true,
        reference:'deviceProByNodeId',
        emptyText : _('Empty'),
        propertyNames: {
            provider: _('provider'),//"提供商"
            contractor: _('contractor'),//"承包商"
            serialno: _('Serial No.'),//"序列号"
            specificlocation: _('Specific Location'),//"所在位置"---这个翻译为具体位置
            tenant: _('Tenant'),//"租户"
        },
        listeners:{
            beforeedit: 'onbeforeedit'
        } 
    }]
});