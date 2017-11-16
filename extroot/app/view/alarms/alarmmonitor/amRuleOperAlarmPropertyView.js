/***
*分组监控中，添加编辑规则中的告警属性条件模块
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperAlarmPropertyView', {
    extend: 'Ext.tab.Panel',
    xtype:'amRuleOperAlarmPropertyView',
    width:250,
    height:250,
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    plain: true,
    tabIndex:2,
    tabPosition: 'left',//tab在左边
    tabRotation: 0,
    tabBar: {
        border: true
    },
    requires: [
        'Admin.view.alarms.alarmmonitor.amRuleOperAddResources',
        'Admin.view.alarms.alarmmonitor.amRuleOperAddWords',
        'Admin.view.alarms.alarmmonitor.amRuleOperAddchecked'
    ],
    controller: {
        /*onBeforeRender:function( view, eOpts){
            Ext.Ajax.request({
                url : 'alarm/Monitor/getRuleCondtion',
                params : {
                    condition: 2
                },
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    data = r.data;
                    for(var i in data){
                        var title = data[i].CONDITION_NAME;
                        item = view.items.items[i];
                        item.title = title;
                    }
                    
                }
            });
        }*/
     },
    items:[{
        xtype:'amRuleOperAddWords',
        tabIndex:5,
        reference: 'amRuleOperAlarmNameWords',
        title:'告警名称中包含指定文字'
    },{
        xtype:'amRuleOperAddResources',
        tabIndex:6,
        reference: 'amRuleOperAlarmType',
        title:'属于指定告警类型的告警',
    },{
        xtype:'amRuleOperAddchecked',
        reference: 'amRuleOperAddAlarmStyle',
        tabIndex:7,
        title:'属于指定告警分类的告警',
        store:{
            autoLoad:true,
            fields:["id", "text"],
            data : [
                ['1', '设备告警'],
                ['2', '服务质量告警'],
                ['3', '通信告警'],
                ['4', '环境告警'],
                ['5', '处理失败告警'],
                ['6', '网络管理服务器告警']
            ]
        }
    },{
        xtype:'amRuleOperAddchecked',
        reference: 'amRuleOperAddAlarmiLevel',
        tabIndex:8,
        title:'属于特定级别的告警',
        store:{
            autoLoad:true,
            fields:["id", "text"],
            data : [
                ['1', _('Critical')],
                ['2', _('Major')],
                ['3', _('Minor')],
                ['4', _('Warning')],
                ['5', _('Unknown')]
            ]
        }
    },{
        xtype:'amRuleOperAddchecked',
        reference: 'amRuleOperAddUsers',
        tabIndex:9,
        title:'由指定人员确认的告警',
        store:{
            autoLoad:true,
            fields:["id", "text"],
            proxy: {
                type: 'ajax',
                url: 'alarm/Monitor/getSecUser',
                reader: {
                    type: 'json'
                }
            }
        }
    },{
        xtype: 'amRuleOperAddchecked',
        reference: 'amRuleOperAddAlarmStatus',
        tabIndex:10,
        title:'特定告警状态的告警',
        store:{
            autoLoad:true,
            fields:["id", "text"],
            data : [
                ['S2', _('New Come')],
                ['S1', _('Recovered')],
                ['A1', _('Acknowledged')]
            ]
        }
    }],
    listeners:{
        //beforerender:'onBeforeRender' 
    }
});