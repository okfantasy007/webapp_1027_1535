/***
*告警属性中的排障经验部分
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.propertyAlarmExperienceView', {
    extend: 'Ext.panel.Panel',
    xtype: 'propertyAlarmExperienceView',
    requires: [
        'Ext.grid.property.Grid'
    ],
    viewModel:{
        data:{
            factorylabelhtml:_('Empty'),
            historylabelhtml:_('Empty')
        }
    },
    controller: {
        loadAlarmExperience: function(rowRecord){
            //var factoryExperience = this.lookupReference('factoryExperience');
            //var historyExperience = this.lookupReference('historyExperience');
    
            var model = this.getView().getViewModel();
            var factorylabel ='-----------------<b>'+_('Default Resolution')+':</b>-----------------<br>';
            var factoryEStore = Ext.Ajax.request({
                url : 'alarm/historyAlarm/getFactoryExperience',
                params : {typeid: rowRecord.alarm_type_id},
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        for(var i in r.data){
                            var propertyInfo= r.data[i];
                            var alarm_type_name = (propertyInfo.alarm_type_name==null|| propertyInfo.alarm_type_name=='') ?_('None'):propertyInfo.alarm_type_name;
                            factorylabel+='<b>'+_('Fault Description')+':</b><br>'+alarm_type_name+'<br>';
                            var alarm_type_desc = (propertyInfo.alarm_type_desc==null|| propertyInfo.alarm_type_desc=='') ?_('None'):propertyInfo.alarm_type_desc;
                            factorylabel+='<b>'+_('Solution')+':</b><br>'+alarm_type_desc+'<br>';
                            if(i!=r.data.length-1){
                                factorylabel+='------------------------------<br>';
                            }
                        }  
                    }else{
                        factorylabel+=_('Empty');
                    }
                    model.set('factorylabelhtml',factorylabel);
                },
                failure:function(response){
                    factorylabel+=_('Empty');
                    model.set('factorylabelhtml',factorylabel);
                }
            });
            var historylabel='<br>-----------------<b>'+_('Historical Resolution')+'</b>-----------------<br>'
            var historyEStore = Ext.Ajax.request({
                url : 'alarm/historyAlarm/getHistoryExperience',
                params : {alarmid: rowRecord.iRCAlarmID},
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        for(var i in r.data){
                            var propertyInfo= r.data[i];
                            var recorder = (propertyInfo.recorder==null|| propertyInfo.recorder=='') ?_('None'):propertyInfo.recorder;
                            historylabel+='<b>'+_('Noter')+':</b>'+recorder+'<br>';
                            var record_time = (propertyInfo.record_time==null|| propertyInfo.record_time=='') ?_('None'):propertyInfo.record_time;
                            historylabel+='<b>'+_('Recording Time')+':</b>'+record_time+'<br>';
                            var strDeviceName = (propertyInfo.strDeviceName==null|| propertyInfo.strDeviceName=='') ?_('None'):propertyInfo.strDeviceName;
                            historylabel+='<b>'+_('Alarm Source')+':</b>'+strDeviceName+'<br>';
                            var strLocation = (propertyInfo.strLocation==null|| propertyInfo.strLocation=='') ?_('None'):propertyInfo.strLocation;
                            historylabel+='<b>'+_('Specific Location')+':</b>'+strLocation+'<br>';
                            var reason = (propertyInfo.reason==null|| propertyInfo.reason=='') ?_('None'):propertyInfo.reason;
                            historylabel+='<b>'+_('Fault Description')+':</b><br>'+reason+'<br>';
                            var resolve_result = (propertyInfo.resolve_result==null|| propertyInfo.resolve_result=='') ?_('None'):propertyInfo.resolve_result;
                            historylabel+='<b>'+_('Solution')+':</b><br>'+resolve_result+'<br>';
                            if(i!=r.data.length-1){
                                historylabel+='------------------------------<br>';
                            }
                        }
                        // var propertyInfo= r.data[0];                     
                        // historyExperience.setSource({
                        //     "处理人员": propertyInfo.recorder,
                        //     "处理时间": propertyInfo.record_time,
                        //     "告警源": propertyInfo.strDeviceName,
                        //     "具体位置": propertyInfo.strLocation,
                        //     "故障描述": propertyInfo.reason,
                        //     "解决方案": propertyInfo.resolve_result
                        // });
                    }else{
                        historylabel+=_('Empty');
                    }
                    model.set('historylabelhtml',historylabel);
                },
                failure:function(response){
                    historylabel+=_('Empty');
                    model.set('historylabelhtml',historylabel);
                }
            }); 

           
        }

    },
    autoScroll : true,
    width: 300,
    autoheight: true,
    border: false,
    layout: 'auto',
    //bodyStyle: "padding:20px;",
    items: [/*{
        title: '厂家排障建议',
        width: 300,
        xtype: 'propertygrid',
        collapsible: true,
        emptyText : _('Empty'),
        reference:'factoryExperience'
    },{
        title: '历史排障记录',
        width: 300,
        collapsible: true,
        xtype: 'propertygrid',
        collapsed: true,
        emptyText : _('Empty'),
        reference:'historyExperience'
    }*/
    {
        xtype:'label',
        reference:'labelEx',
        bind:{
           html:'{factorylabelhtml}' 
        }
    },{
        xtype:'label',
        reference:'labelHi',
        bind:{
           html:'{historylabelhtml}' 
        }
    }]
});