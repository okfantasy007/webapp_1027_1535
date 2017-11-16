/***
*分组监控中，添加编辑规则中的影响客户条件模块
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.amRuleOperAlarmCustomView', {
    extend: 'Ext.tab.Panel',
    xtype:'amRuleOperAlarmCustomView',
    width:250,
    height:250,
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    plain: true,
    tabIndex:3,
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
        tabIndex:14,
        reference: 'amRuleOperCusNameWords',
        title:'客户名称中包含特定文字',
        /*dockedItems: [{
            xtype: 'toolbar',
            dock: 'left',
            items: [{
                itemid:'addWords',
                iconCls:'x-fa  fa-plus-square',//'add',
                tooltip : _('Add'),
                reference:'addCusNameWords',
                disabled:true,
                handler: function(){
                    var amRuleOperCusNameWords = this.up('amRuleOperAddWords');
                    //amRuleOperCusNameWords.lookupController().onAddWords();
                    textfield = amRuleOperCusNameWords.down('textfield');
                    gridpanel = amRuleOperCusNameWords.down('gridpanel');
                    if(textfield.value==""){
                        Ext.Msg.alert(_('With Errors'), '关键字不能为空' );
                    }else{
                        //var mainWordsGrid = this.lookupReference('mainWordsGrid');
                        var p = new Ext.data.Record({                   
                            text:textfield.value
                         }); 
                        var store = gridpanel.getStore();
                        store.data.add(p);
                        gridpanel.getView().refresh();
                        textfield.setValue('');
                    }
                }
            },{
                itemid:'editWords',
                iconCls:'x-fa fa-edit',//'edit_task',
                tooltip : _('Edit'),//'编辑',
                reference:'editCusNameWords',
                disabled:true,
                handler: 'onEditCusNameWords'
            },{
                itemid:'removeWords',
                iconCls:'x-fa fa-remove',//'remove ',
                reference:'removeCusNameWords',
                tooltip : _('Delete'),
                disabled:true,
                handler: 'onRemoveCusNameWords'
            }]
        }]*/
    },{
        xtype:'amRuleOperAddWords',
        tabIndex:15,
        reference: 'amRuleOperEthIdWords',
        title:'电路编号中包含特定文字',
        /*dockedItems: [{
            xtype: 'toolbar',
            dock: 'left',
            items: [{
                itemid:'addWords',
                iconCls:'x-fa  fa-plus-square',//'add',
                tooltip : _('Add'),
                reference:'addEthWords',
                disabled:true,
                handler: function(){
                    var amRuleOperEthWords = this.up('amRuleOperAddWords');
                    textfield = amRuleOperEthWords.down('textfield');
                    gridpanel = amRuleOperEthWords.down('gridpanel');
                    if(textfield.value==""){
                        Ext.Msg.alert(_('With Errors'), '关键字不能为空' );
                    }else{
                        //var mainWordsGrid = this.lookupReference('mainWordsGrid');
                        var p = new Ext.data.Record({                   
                            text:textfield.value
                         }); 
                        var store = gridpanel.getStore();
                        store.data.add(p);
                        gridpanel.getView().refresh();
                        textfield.setValue('');
                    }
                }
            },{
                itemid:'editWords',
                iconCls:'x-fa fa-edit',//'edit_task',
                tooltip : _('Edit'),//'编辑',
                reference:'editEthWords',
                disabled:true,
                handler: 'onEditEthWords'
            },{
                itemid:'removeWords',
                iconCls:'x-fa fa-remove',//'remove ',
                reference:'removeEthWords',
                tooltip : _('Delete'),
                disabled:true,
                handler: 'onRemoveEthWords'
            }]
        }]*/
    },{
        xtype:'amRuleOperAddchecked',
        reference: 'amRuleOperAddEffectPro',
        tabIndex:16,
        title:'指定业务影响程度的告警',
        store:{
            autoLoad:true,
            fields:["id", "text"],
            data : [
                ['0', '无影响'],
                ['1', '业务劣化'],
                ['2', '业务中断']
            ]
        }
    }/*,{
        xtype:'amRuleOperAddchecked',
        reference: '',
        tabIndex:17,
        title:'影响指定级别客户的告警'
    },{
        xtype:'amRuleOperAddchecked',
        reference: '',
        tabIndex:18,
        title:'影响指定行业客户的告警'
    }*/],
    listeners:{
        //beforerender:'onBeforeRender' 
    }
});