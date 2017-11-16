/***
*分组监控中，添加编辑规则中的告警源条件模块
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperAlarmSourceView', {
    extend: 'Ext.tab.Panel',//'Ext.container.Container',
    xtype:'amRuleOperAlarmSourceView',
    width:250,
    height:250,
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    plain: true,
    tabIndex:1,
    tabPosition: 'left',//tab在左边
    tabRotation: 0,
    tabBar: {
        border: true
    },
    requires: [
        'Admin.view.alarms.alarmmonitor.amRuleOperAddResources',
        'Admin.view.alarms.alarmmonitor.amRuleOperSubneTree',
        'Admin.view.alarms.alarmmonitor.amRuleOperAddWords',
        'Admin.view.alarms.alarmmonitor.amRuleOperAddchecked'
    ],
    controller: {
        getAlarmSourceCondition:function(){
            var conditionGroup="{group:'1',data:"
            var data="[";
            var subne = this.getamRuleOperSubne();
            if(subne!=""){
             
            }
        },
        getamRuleOperSubne:function(){
            var amRuleOperSubneTree = this.lookupReference('amRuleOperSubneTree');
            var treeCheckeds = amRuleOperSubneTree.getChecked();
            var checklength = treeCheckeds.length;
            if(checklength>0){
                var ids=[];
                for(var i in treeCheckeds){
                    var checkedData = treeCheckeds[i].get('symbol_id');
                    ids.push(checkedData);
                }
                var value = ids.join();
                var patternid = amRuleOperSubneTree.tabIndex;
                var condition = "{ patternid:'"+patternid+"', values:'"+value+"''}";
                return condition;
            }else{
                return "";
            }
            
        },
        getamRuleOperResourcesNe:function(){
            var amRuleOperResourcesNe = this.lookupReference('amRuleOperResourcesNe');
            var neStore = amRuleOperResourcesNe.getStore();


        },
        getamRuleOperResourcesChassis:function(){
            var amRuleOperResourcesChassis = this.lookupReference('amRuleOperResourcesChassis');
            var chassisStore = amRuleOperResourcesChassis.getStore();
        },
        getamRuleOperResourcesCard:function(){
            var amRuleOperResourcesCard = this.lookupReference('amRuleOperResourcesCard');
            var cardStore = amRuleOperResourcesCard.getStore();
        },
        getamRuleOperAlarmSouceWords:function(){
            var amRuleOperAlarmSouceWords = this.lookupReference('amRuleOperAlarmSouceWords');
            var mainWordsGrid = amRuleOperAlarmSouceWords.lookupReference('mainWordsGrid');
            var alarmSourceData = mainWordsGrid.getStore().data;
            
        },
        getamRuleOperAddDeviceType:function(){
            var amRuleOperAddDeviceType = this.lookupReference('amRuleOperAddDeviceType');
            var mainWordsGrid = amRuleOperAddDeviceType.lookupReference('mainWordsGrid');
            var deviceTypeData = mainWordsGrid.getStore().data;
        }
     },
    items:[{
        xtype:'amRuleOperSubneTree',
        tabIndex:21,
        reference: 'amRuleOperSubneTree',
        title:'来源指定子网'
    },{
        xtype:'amRuleOperAddResources',
        tabIndex:22,
        reference: 'amRuleOperResourcesNe',
        title:'来源指定网元'
    },{
        xtype:'amRuleOperAddResources',
        reference: 'amRuleOperResourcesChassis',
        tabIndex:23,
        title:'来源指定机箱'
    },{
        xtype:'amRuleOperAddResources',
        reference: 'amRuleOperResourcesCard',
        tabIndex:24,
        title:'来源指定板卡'
    },{
        xtype:'amRuleOperAddWords',
        reference: 'amRuleOperAlarmSouceWords',
        tabIndex:25,
        title:'告警源名称中包含指定文字'
    },/*{
        xtype: 'amRuleOperAddWords',
        reference: 'amRuleOperAddDeviceType',
        tabIndex:26,
        title:'来源指定设备类型'
    }*/{
        xtype:'amRuleOperAddResources',
        reference: 'amRuleOperAddDeviceType',
        tabIndex:26,
        title:'来源指定设备类型'
    }]
});