/***
*清除选择项时的故障原因的操作对话框
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmFaultReasonWin', {
    extend: 'Ext.window.Window',
    xtype: 'currentAlarmFaultReasonWin',
    reference:'currentAlarmFaultReasonWin',
    initComponent:function(){
        this.callParent();
       // this.faultItems = new Array();
        this.maxFaultId = "0";
        this.parentView = new Object();
    },
    requires: [
    ],
    viewModel: {
        stores: {
            faultStore:{
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: 'alarm/currentAlarm/getFaultReason',
                    reader: 'json'
                }
            },
        }
    },
    controller: {
        onLoadData: function(pView){
            var container = this.getView();
            container.parentView = pView;
        },
        //得到故障原因的最大id
        onGetMaxFaultId: function(){
            var container = this.getView();
            var faultReasonList = this.lookupReference('faultReasonList');
            var faultData = faultReasonList.getStore().data;
            var allFaults = faultData.items;
            var maxid = 0;
            for(var i in allFaults){
                var faultid = allFaults[i].get("value");  
                if(maxid<faultid){
                    maxid=faultid;
                }
            }
            container.maxFaultId=maxid;
        },
        //判断列表中是否存在相同的故障原因
        onIsHasSameItem:function(items,text){
            var b= false;
            Ext.Array.forEach(items,function(item){ //单纯的遍历数组
                var itemname = item.get("text");
                if(itemname==text){
                    b=true;
                }
            });
            return b;
        },
        //添加故障原因
        onFaultAdd: function(){
            var container = this.getView();
            var faultReasonName = this.lookupReference('faultReasonName');
            var faultReasonList = this.lookupReference('faultReasonList');
            var faultName = faultReasonName.value;
            if(faultName==null || faultName==""){
                Ext.Msg.alert(_('With Errors'), faultReasonName.getFieldLabel() + _('Can not be empty!') );
            }else{ 
                
                var allFaults = faultReasonList.getStore().data.items;
                var b = this.onIsHasSameItem(allFaults,faultName);
                if(b){
                    Ext.Msg.alert(_('With Errors'), faultReasonName.getFieldLabel() + _('already exist') );
                }else{
                    this.onGetMaxFaultId();
                    var newfaultid = container.maxFaultId+1;
                    Ext.Ajax.request({
                        url : 'alarm/currentAlarm/addFaultReason',
                        params : {
                            faultname : faultName,
                            faultid : newfaultid
                        },
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText)
                            if (r.success) {
                                faultReasonList.getStore().reload();
                                container.maxFaultId = newfaultid;
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        }
                    });
                    faultReasonName.setValue("");
                }
            }
        },
        //编辑故障原因
        onFaultEdit: function(){
            var controller = this;
            var faultReasonList = this.lookupReference('faultReasonList');
            var allFaults = faultReasonList.getStore().data.items;
            var oldFaults = faultReasonList.selection;
            if(oldFaults!=null){
                var oldFaultid = oldFaults.get("value");
                var oldFaultName = oldFaults.get("text");
                Ext.MessageBox.prompt(_('Confirmation'), _('Modify Fault Cause')+':'+oldFaultName, callback);
                function callback(id,text) {
                    if (id == 'ok') {
                        if (text=="") {
                            Ext.Msg.alert(_('With Errors'), _('Can not be empty!'));
                        }else if(text == oldFaultName){
                            Ext.Msg.alert(_('With Errors'), _('The content is the same as the original content'));
                        }else{
                            var b = controller.onIsHasSameItem(allFaults,text);
                            if(b){
                                Ext.Msg.alert(_('With Errors'), _('The Fault Cause already exist') );
                            }else{
                                Ext.Ajax.request({
                                    url : 'alarm/currentAlarm/updateFaultReason',
                                    params : {
                                        faultid : oldFaultid,
                                        newfault : text
                                    },
                                    method : 'post',
                                    success : function(response) {
                                        var r = Ext.decode(response.responseText)
                                        if (r.success) {
                                            oldFaults.set("text",text)
                                        }else{
                                            Ext.MessageBox.alert(_('Tips'),  _('Operation Failure!'));
                                        }
                                    }
                                }); 
                            } 
                        }
                    }
                }
            }else{
                Ext.Msg.alert(_('With Errors'), _('Please select one item for operate'));
            }
        },
        //删除故障原因
        onFaultRemove: function(){
    
            var controller = this;
            var faultReasonList = this.lookupReference('faultReasonList');
            var faultsSelection = faultReasonList.selection;
            var allFaults = faultReasonList.getStore().data.items;
            if(faultsSelection!=null){
                var Faultid = faultsSelection.get("value");
                Ext.MessageBox.confirm(_('Confirmation'), _('This operation will delete the selected historical alarms in database, continue?'), function(btn) {
                    if (btn == 'yes') {
                        Ext.Ajax.request({
                            url : 'alarm/currentAlarm/deleteFaultReason',
                            params : {
                                faultid : Faultid
                            },
                            method : 'post',
                            success : function(response) {
                                var r = Ext.decode(response.responseText);
                                if (r.success) {
                                    faultReasonList.getStore().reload();
                                    //getMaxFaultId = controller.onGetMaxFaultId();
                                }else{
                                    Ext.MessageBox.alert(_('Tips'),  _('Operation Failure!'));
                                }
                            }
                        });
                    }
                });
            }else{
                Ext.Msg.alert(_('With Errors'), _('Please select one item at least for operate!'));
            }
        },
        onFaultOk:function(){
            var container = this.getView();
            container.parentView.getStore().reload();
            container.close();
        }
    },
    title: _('Edit Fault Cause'),
    closable: true,
    width: 250,
    autoheight: true,
    border: false,
    layout: 'auto',
    bodyPadding : '5 3 5 3',
    items: [{
        xtype : 'panel',
        reference:'faultpanel',
        items : [{
            xtype : 'textfield',
            reference:'faultReasonName',
            fieldLabel : _('Fault Cause'),
            name : 'faultReasonName',
            width : 180,
            labelWidth : 60,
            labelAlign : "left",
            margin : 1
        },{
            header: false,
            xtype: 'gridpanel',
            width: 180,
            height: 200,
            border: true,
            autoScroll : true,
            lines: false,
            reference:'faultReasonList',
            emptyText : _('Empty'),
            bind:{
                store:'{faultStore}'
            },
            columns:[{
                //text:'FAULT_REASON_ID',
                dataIndex : 'value',
                align: 'left',
                menuDisabled : true,
                hidden:true
            },{
                //text:'FAULT_REASON_NAME',
                dataIndex : 'text',
                align: 'left',
                menuDisabled : true
            }]
        }],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'right',
            items: [{
                iconCls:'x-fa  fa-plus-square',//'add',
                tooltip : _('Add'),
                reference:'userRuleAdd',
                handler: 'onFaultAdd'
            },{
                iconCls:'x-fa fa-edit',//'edit_task',
                tooltip : _('Edit'),//'编辑',
                reference:'userRuleEdit',
                handler: 'onFaultEdit'
            },{
                iconCls:'x-fa fa-remove',//'remove ',
                reference:'userRuleRemove',
                tooltip : _('Delete'),
                handler: 'onFaultRemove'
            }]
        }]
    }],
    buttons: ['->', {
        text: 'ok',
        handler:'onFaultOk'
    }]
});