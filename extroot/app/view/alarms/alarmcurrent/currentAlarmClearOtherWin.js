/***
*清除同类型、同位置、已确认、所有告警时的对话框
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin', {
    extend: 'Ext.window.Window',
    xtype: 'currentAlarmClearOtherWin',
    initComponent:function(){
        this.callParent();
        this.devClearCondition = "";
        this.clearType = "";
        this.treepanel = new Object();
        this.pagingtoolbar = new Object();
        //this.secfilter = "";
        //this.seclevel = "";
        this.subNeID=0;
        this.devCleardata = new Object();
    },
    requires: [
        'Admin.view.alarms.alarmcurrent.currentAlarmClearDevWin'
    ],
    viewModel: {
        stores: {
        }
    },
    controller: {
        onLoadData:function(record,cleartype,tree,toolbar,subneid){
            var container = this.getView();
            container.devClearCondition = record;
            container.clearType = cleartype;
            container.treepanel = tree;
            container.pagingtoolbar = toolbar;
            container.subNeID = subneid;
        },
        onBeforeShow:function(){
            var container = this.getView();
            var cleartype = container.clearType;
            var condition = container.devClearCondition;
            var subneid = container.subNeID;
            var isClearDevAlarm = this.lookupReference('isClearDevAlarm');
            var clearDevAlarmListBtn = this.lookupReference('clearDevAlarmListBtn');
            Ext.Ajax.request({
                url : 'alarm/currentAlarm/getDevAlarmClear?clearType='+cleartype,
                params : {
                    condition : condition,
                    subneid: subneid
                },
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        isClearDevAlarm.setHidden(false);
                        if(r.data=="CouterSame"){
                            clearDevAlarmListBtn.setHidden(true);
                        }else{
                            clearDevAlarmListBtn.setHidden(false);
                            container.devCleardata = r.data;
                        }
                    }else{
                        isClearDevAlarm.setHidden(true);
                    }
                }
            });
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
        onToClear:function(){
            var container = this.getView();
            var cleartype = container.clearType;
            var condition = container.devClearCondition;
            var subneid = container.subNeID;
            var clearLog = this.lookupReference('strClearLog').value;
            var isClearDev = this.lookupReference('isClearDevCheckBox').checked;
                Ext.Ajax.request({
                    url : 'alarm/currentAlarm/clearAlarm?clearType='+cleartype,
                    params : {
                        condition : condition,
                        strClearLog : clearLog,
                        //strUserName : APP.user,
                        isClearDev : isClearDev,
                        subneid:subneid
                        //secFilter : secf,
                        //secLevel : secl
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
    title:_('Please input the clearing log:'),
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
        xtype : 'textareafield',
        reference:'strClearLog',
        //grow : true,
        name : 'strClearLog',
        fieldLabel: _('Clearing Log'),
        anchor : '100%'
    },{
        xtype : 'container',
        reference:'isClearDevAlarm',
        layout : 'column',
        width : 155,
        hidden:true,
        items : [{
            xtype : 'checkboxfield',
            reference:'isClearDevCheckBox',
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
            columnWidth : .2,
            style :'margin-top:2px;',
            iconCls:'x-fa  fa-plus-square',
            reference:'clearDevAlarmListBtn',
            disabled: true,
            hidden:true,
            handler: 'onClearDevBtn'
        }]
    }],
    buttons: ['->', {
        text: 'OK',
        handler:'onToClear'
    }, {
        text: 'Cancel',
        handler:'onCancel'
    }],
    listeners:{
        beforeshow:'onBeforeShow'
    }
});