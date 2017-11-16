/***
*分组监控中，添加编辑规则的首页
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperView', {
    extend: 'Ext.panel.Panel',//'Ext.container.Container',
    xtype:'amRuleOperView',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    layout: 'border',
    width: 700,
    height: 500,//350,
    autoScroll : true,
    requires: [
        'Admin.view.alarms.alarmmonitor.amRuleOperAlarmSourceView',
        'Admin.view.alarms.alarmmonitor.amRuleOperShareCondition',
        'Admin.view.alarms.alarmmonitor.amRuleOperAlarmCustomView',
        'Admin.view.alarms.alarmmonitor.amRuleOperAlarmPropertyView',
        'Ext.tab.Panel'
    ],
    controller: { 
        onTabChange:function ( tabPanel, newCard, oldCard, eOpts ) {
            console.log('---换--');
        },
        onSaveRule:function(){
            var alarmMonitorMainPanel = this.getView().up('alarmMonitorMainPanel');
            var tabpanel = this.getView().down('tabpanel');
            //var ruleName = tabpanel.header.lookupReference('ruleName');
            var ruleName = this.lookupReference('ruleName');
            if(ruleName==null || ruleName.value==""){
                 Ext.Msg.alert(_('Tips'), '规则名称不能为空');
            }else{
                var getRuleInfo = this.lookupReference('getRuleInfo');
                var rulrInfostore = getRuleInfo.getStore();
                if(rulrInfostore.getCount()>0){
                    var jsonInfo="";
                    Ext.Array.forEach(rulrInfostore.data.items,function(str,index,array){
                        jsonInfo = jsonInfo+JSON.stringify(str.data);
                        jsonInfo+=","
                    });
                    jsonInfo = jsonInfo.substring(0,jsonInfo.length-1);
                    if(jsonInfo.length>0){
                       jsonInfo="["+jsonInfo+"]";
                    }
                    Ext.Ajax.request({
                        url : 'alarm/Monitor/addRule',
                        params : {
                            condition : jsonInfo,
                            rulename : ruleName.value
                        },
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if(r.success){
                                var alarmGroupMonitorView = alarmMonitorMainPanel.down('alarmGroupMonitorView');
                                alarmGroupMonitorView.lookupController().onUserRuleRefresh();
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        },
                        failure:function(){
                            Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                        }   
                    });
                }else{
                    Ext.Msg.alert(_('Tips'), '没有设置规则条件'); 
                }
                //告警源条件
                //var amRuleOperAlarmSourceView = this.lookupReference('amRuleOperAlarmSourceView');
                //amRuleOperAlarmSourceView.lookupController().getAlarmSourceCondition();
                //告警属性条件
                //var amRuleOperAlarmPropertyView = this.lookupReference('amRuleOperAlarmPropertyView');
                //影响客户条件
                //var amRuleOperAlarmCustomView = this.lookupReference('amRuleOperAlarmCustomView');
                //规则共享条件
                //var amRuleOperShareCondition = this.lookupReference('amRuleOperShareCondition');
                //amRuleOperShareCondition.lookupController().getShareCondition();

                //var alarmMonitorMainPanel = this.getView().up('alarmMonitorMainPanel');
                //alarmMonitorMainPanel.setActiveItem(0);
                ruleName.value="";
                alarmMonitorMainPanel.setActiveItem(0);
            }
        },
        onCancelRule:function(){
            var alarmMonitorMainPanel = this.getView().up('alarmMonitorMainPanel');
            alarmMonitorMainPanel.setActiveItem(0);
        },
        onReset:function(){

        }
    },
    items:[{
        title: '规则条件展示',
        region: 'east',
        split: true,
        width:400,
        collapseDirection:'right',
        collapsible:true,
        collapsed:true,
        xtype:'gridpanel',
        reference:'getRuleInfo',
        store:{
            fields:['condition_group','pattern_id','condition_name','condition_value','condition_text'],
        },
        autoScroll : true,
        columns:[{
            text : '条件组号',
            dataIndex : 'condition_group',
            width : 100,
            menuDisabled : true,
            renderer: function getIstatus(v){
                if(v==1){
                    return "告警源条件";
                }
                if(v==2) {
                    return "告警属性条件";
                }
                if(v==3){
                    return "影响客户条件";
                }
                if(v==4){
                    return "规则共享条件";
                }
            }
        },{
            text : 'pattern_id',
            dataIndex : 'pattern_id',
            width : 100,
            menuDisabled : true,
            hidden:true
        },{
            text : '条件名称',
            dataIndex : 'condition_name',
            width : 150,
            menuDisabled : true
        },{
            text : 'condition_value',
            dataIndex : 'condition_value',
            menuDisabled : true,
            hidden:true
        },{
            text : '条件内容',
            dataIndex : 'condition_text',
            //width : 100,
            flex:1,
            menuDisabled : true
            
        }]
    },{
    	xtype: 'tabpanel',
        //header: false,
        region: 'center',
        plain: true,
        tabPosition: 'top',//tab在左边
        tabRotation: 0,
        tabBar: {
            border: true
        },
        header:{
             //title: _('Edit Monitor Rules'),
            itemPosition: 0,
            items:[{
                xtype: 'textfield',
                fieldLabel : '规则名称',
                height:28,
                name : 'ruleName',
                reference:'ruleName',
                //fullscreen:true
            }]
        },
        items: [{
        	xtype:'amRuleOperAlarmSourceView',
            reference:'amRuleOperAlarmSourceView',
            title:'告警源条件'
        },{
            xtype:'amRuleOperAlarmPropertyView',
            reference:'amRuleOperAlarmPropertyView',
            title:'告警属性条件'
        }/*,{
            xtype:'amRuleOperAlarmCustomView',
            reference:'amRuleOperAlarmCustomView',
            title:'影响客户条件'  
        }*/,{
            xtype:'amRuleOperShareCondition',
            reference:'amRuleOperShareCondition',
            title:'规则共享条件'  
        }],
        listeners:{
            tabchange :'onTabChange'
        }
    }],
     buttons: ['->', {
        text: 'Save',
        handler:'onSaveRule'
    }, {
        text: 'Cancel',
        handler:'onCancelRule'
    }]
});