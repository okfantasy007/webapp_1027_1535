/***
*清除选择项时的对话框
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmClearSelectWin', {
    extend: 'Ext.window.Window',
    xtype: 'currentAlarmClearSelectWin',
    initComponent:function(){
        this.callParent();
        this.ids = new Array();
        this.treepanel = new Object();
        this.pagingtoolbar = new Object();
        this.DevClearStore = new Object();
    },
    requires: [
        'Admin.view.alarms.alarmcurrent.currentAlarmFaultReasonWin',
        'Admin.view.alarms.alarmcurrent.currentAlarmClearDevWin'
    ],
    viewModel: {
        stores: {
            faultStore:{
                autoLoad: true,
                fields: ["value", "text"],
                proxy: {
                    type: 'ajax',
                    url: 'alarm/currentAlarm/getFaultReason',
                    reader: 'json'
                }
            },
        }
    },
    controller: {
        onLoadData:function(record,tree,toolbar){
            var container = this.getView();
            container.ids=record;
            container.treepanel = tree;
            container.pagingtoolbar = toolbar;
        },
        //show前需要，判断时是否有告警包含：可以清除设备告警的权限
        onBeforeShow:function(){
            var container = this.getView();
            var isClearDevAlarm = this.lookupReference('isClearDevAlarm');
            //查看是否存在需要清除设备告警的告警
            Ext.Ajax.request({
                url : 'alarm/currentAlarm/getDevAlarmClear?clearType=clearSelected',
                params : {
                    ids : container.ids.join()
                },
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        isClearDevAlarm.setHidden(false);
                        container.DevClearStore = r.data;
                    }else{
                        isClearDevAlarm.setHidden(true);
                    }
                }
            });
            //isClearDevAlarm.setHidden(false);
        },
        //清除设备告警checkbox的选择
        onIsClearDevChange: function(field) {
            alert(field.checked);
            var clearDevBtn = this.lookupReference("clearDevBtn");
            if(field.checked){
                clearDevBtn.setDisabled(false);
            }else{
                clearDevBtn.setDisabled(true);
            }
        },
        //显示清除设备告警列表
        onClearDevBtn:function(){
            var container = this.getView();
            var devClearWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearDevWin');
            devClearWin.lookupController().onBeforeShow(container.devCleardata);
            devClearWin.show();
        },

        onAddFault: function(){
            var container = this.getView(); 
            var faultReasonInfo = container.lookupReference('faultReasonInfo');
            var faultReasonWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmFaultReasonWin');
            faultReasonWin.lookupController().onLoadData(faultReasonInfo);
            faultReasonWin.show();  
        },

        validatefield: function(me, isValid, eOpts){
            if(!me.validate()){
                Ext.Msg.alert(_('With Errors'), me.getFieldLabel() + _('Can not be empty!') );
            }
        },
        onToClear:function(){
            var container = this.getView();
            var record =  container.ids.join();
            var isClearDevCheckBox  = this.lookupReference('isClearDev');
            var reasonSelect = this.lookupReference('faultReasonInfo').selection;
            var faultReasonid = '';
            if(reasonSelect==null){
               Ext.MessageBox.alert(_('Tips'), _('Fault Cause')+_('Can not be empty!'));
               return;
            }else{
                faultReasonid = reasonSelect.get("value");
                if(faultReasonid==''){
                    Ext.MessageBox.alert(_('Tips'), _('Fault Cause')+_('Can not be empty!'));
                    return; 
                }
            }
            faultReasonid = reasonSelect.get("value");
            
            var clearLog = this.lookupReference('strClearLog').value;
            var isClearDev = isClearDevCheckBox.checked;
            var reasonField = this.lookupReference('reasonField').value;
            var reasonResultField = this.lookupReference('reasonResultField').value;
            Ext.Ajax.request({
                url : 'alarm/currentAlarm/clearAlarm?clearType=clearSelected',
                params : {
                    ids : record,
                    strClearLog : clearLog,
                    //strAckHost:'127.0.0.1',
                    strUserName:APP.user,
                    isClearDev:isClearDev,
                    faultid:faultReasonid,
                    reason:reasonField,
                    reasonresult:reasonResultField
                },
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                         
                        if(container.pagingtoolbar!=null){
                            container.pagingtoolbar.getStore().reload();
                        }else{
                            container.treepanel.getStore().reload();
                        }
                        container.treepanel.lookupController().onSetHeaderAlarmCount();
                        container.treepanel.lookupController().onSetMonitorAlarmCount();
                        container.close();
                    }else{
                        Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                        container.close();
                    }
                },
                failure:function(){
                    Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                    container.close();
                }
            });
        },
        onCancel:function(){
            var container = this.getView();
            container.close();
        }
    },
    title: _("cleared alarm's infomation"),
    closable: true,
    width: 300,
    autoheight: true,
    border: false,
    layout: 'auto',
    bodyPadding : '5 3 5 3',
    fieldDefaults : {
        width : 250,
        labelWidth : 90,
        labelAlign : "right",
        margin : 1
    },
    items: [{
        xtype:'textfield',
        fieldLabel : _('Clear Operator'),
        name : 'strUserName',
        value: APP.user,
        readOnly: true
    },{
        xtype:'textfield',
        fieldLabel : _('Clearing Log'),
        reference:'strClearLog',
        name : 'strClearLog',
        /*listeners: {
            validitychange: 'validatefield',
        }*/
    },{
        xtype : 'container',
        layout : 'column',
        width : 280,
        items : [{
            xtype : 'combo',
            reference:'faultReasonInfo',
            columnWidth : .9,
            fieldLabel : _('Fault Cause'),
            name : 'fault_reason_name',
            bind:{
                store:'{faultStore}'
            },
            emptyText:_('logs_pls_check'),
            displayField : 'text',
            valueField : 'value',
            mode : 'local',
            editable : false
        },{
            xtype: 'button',
            columnWidth : .1,
            style :'margin-top:2px;',
            iconCls:'x-fa  fa-plus-square',//'add',
            handler: 'onAddFault'
        }]
    },{
        xtype : 'container',
        reference:'isClearDevAlarm',
        layout : 'column',
        width : 155,
        hidden:true,
        items : [{
            xtype : 'checkboxfield',
            reference:'isClearDev',
            columnWidth : .8,
            boxLabel : _('Clear Device Alarm'),
            name : _('Clear Device Alarm'),
            inputValue: '1',
            listeners: {
                change: 'onIsClearDevChange'
            }
        },{
            xtype: 'button',
            reference:'clearDevBtn',
            //tooltip : _('Reset'),
            columnWidth : .2,
            style :'margin-top:2px;',
            iconCls:'x-fa  fa-plus-square',//'add',
            disabled: true,
            handler: 'onClearDevBtn'
        }]
    },{
        xtype : 'textareafield',
        reference:'reasonField',
        grow : true,
        name : 'reason',
        fieldLabel: _('Fault Description'),
        anchor : '100%',
        allowBlank: false,
        /*listeners: {
            validitychange: 'validatefield',
        }*/
    },{
        xtype : 'textareafield',
        reference:'reasonResultField',
        grow : true,
        name : 'resolve_result',
        fieldLabel: _('Fault Solution'),
        anchor : '100%',
        allowBlank: false,
        /*listeners: {
            validitychange: 'validatefield',
        }*/
    }],
    buttons: ['->', {
        text: 'OK',
        handler:'onToClear'
    },{
        text: 'Cancel',
        handler:'onCancel'
    }],
    listeners:{
        beforeshow:'onBeforeShow'
    }
});