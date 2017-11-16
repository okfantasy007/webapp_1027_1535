/***
*清除设备告警的列表-----暂时没有完成
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmClearDevWin', {
    extend: 'Ext.window.Window',
    xtype: 'currentAlarmClearDevWin',
    controller: {
        onBeforeShow:function(condition){
             var clearDevAlarmTree = this.lookupReference('clearDevAlarmTree');
            clearDevAlarmTree.getStore().data = data;
            //var count = data.length;
            //var pagingToolBar = this.lookupReference('pagingToolBar');
            //pagingToolBar.getStore.data = count;
        },
        /*onPagingChange:function(){
            if(me.alarm_page_isqurey==1){
                me.moveFirst();
                me.alarm_page_isqurey=0;
            }else{
                if(pagedata.toRecord==0){
                    var combobox =  me.down('combobox');
                     me.alarm_page_limit = combobox.value;
                }else{
                    me.alarm_page_limit = pagedata.toRecord - pagedata.fromRecord + 1;
                }
                if(pagedata.fromRecord==0){
                    me.alarm_page_start=0;
                }else{
                    me.alarm_page_start = pagedata.fromRecord - 1;
                }
                    
                var clearDevAlarmTree =this.lookupReference('clearDevAlarmTree');
                if(clearDevAlarmTree!=null){
                    clearDevAlarmTree.getStore().proxy.url='alarm/currentAlarm/getMainAlarmByParam?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start; 
                    clearDevAlarmTree.getStore().reload();
                }
            }
        }
        onOk:function(){
            this.getView().close();
        },*/
        onCancel:function(){
            this.getView().close();
        }
    },
    title: _('Clear Device Alarm'),
    closable: true,
    width: 500,
    height: 400,
    border: false,
    layout: 'auto',
    bodyPadding : '5 3 5 3',
    items: [{
        xtype: 'currentAlarmTreeView',
        reference: 'clearDevAlarmTree',
        header: false,
        store: {},
        /*tbar : {
            xtype:'currentAlarmTreeToolBar',
            reference: 'pagingToolBar',
            store: {},
            listeners : {
                change : 'onPagingChange'
            }
        }*/
    }],
    buttons: ['->', /*{
        text: 'OK',
        handler:'onOk'
    }, */{
        text: 'Cancel',
        handler:'onCancel'
    }],
    listeners:{
        beforeshow:'onBeforeShow'
    }
});