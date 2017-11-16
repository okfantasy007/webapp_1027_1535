/***
*实时告警模块--拓扑下面告警联动部分
* @author ldy 2017/8/25
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.realTimeAlarmView', {
    extend: 'Ext.tab.Panel',//'Ext.container.Container',
    xtype: 'realTimeAlarmView',
    requires: [
        'Admin.view.alarms.alarmcurrent.realTimeAlarmDockedItem',
        'Admin.view.alarms.alarmcurrent.currentAlarmTreeView'
    ],
    // 指定panel边缘的阴影效果
    //cls: 'shadow',
    tabPosition: 'left',
    plain: true,
    defaults: {
        //bodyPadding: 10,
        scrollable: true
    },
    initComponent:function(){
        this.callParent();
        this.sec_symbols = '';
        this.selectSymbols = '';
    },
    viewModel: {
        stores: {
            storeTree : {
                autoLoad : true,
                //pageSize : 15,
                type:'tree',
                proxy : {
                    type : 'ajax',
                    url : 'alarm/currentAlarm/getLinkageAlarm',
                    extraParams:{symbolid:0},
                    actionMethods : {  
                        read   : 'POST'
                    }
                },
                reader : {
                     type : 'json',
                     //totalProperty : 'totalCount',
                     rootProperty : 'children'
                },
                /*onProxyLoad:function(operation){
                        var me = this,
                        response = operation.getResponse(),
                        responseText = response.responseText,
                        count = responseText.substring(responseText.indexOf(":")+1,responseText.indexOf(",")),
                        resultSet = operation.getResultSet(),
                        records = operation.getRecords(),
                        successful = operation.wasSuccessful();
                        if (me.destroyed) {
                            return;
                        }
                        if (resultSet) {
                            me.totalCount = count;//resultSet.getTotal();//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!这里!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        }
                        if (successful) {
                            records = me.processAssociation(records);
                            me.loadRecords(records, operation.getAddRecords() ? { addRecords: true} : undefined);
                        } else {
                            me.loading = false;
                        }
 
                        if (me.hasListeners.load) {
                            me.fireEvent('load', me, records, successful, operation);
                        }
                        me.callObservers('AfterLoad', [records, successful, operation]);
                },*/
            },
            storeEvent:{
                type:'tree',
                proxy : {
                    type : 'ajax',
                    url : 'alarm/currentAlarm/getLinkageAlarmEvent',
                    extraParams:{symbolid:0},
                    actionMethods : {  
                        read   : 'POST'
                    }
                },
                reader : {
                     type : 'json',
                     rootProperty : 'children'
                }
            }
        },
        data:{
            realTime_one_check_disabled:true,
            realTime_more_check_disabled:true
        }
    },
    controller: { 
        onAfterRender:function(){
            //拓扑实时告警的安全接口
            this.onGetAlarmSecSymbolid('0');
        },
        onBeforeDestroy:function(){
            console.log('----stop  realTime beforeDestory-----');
            var treepanel = this.getView().getActiveTab();//this.lookupReference('realTimeCurrentAlarmTree');
            Ext.TaskManager.stop(treepanel.task);//停止任务
        },
        onGetAlarmSecSymbolid:function(symbolids){
            
            var me = this.getView();
            var alarmTree = me.getActiveTab();
            if(me.selectSymbols == symbolids && me.sec_symbols!=''){
                alarmTree.alarm_sec_symbols=me.sec_symbols;
                Ext.TaskManager.start(alarmTree.task);//启动任务 
                console.log('----start newCard task ----');
            }else{
                me.selectSymbols = symbolids;
                Ext.Ajax.request({
                    method:'post',
                    url:'alarm/currentAlarm/getTopoSymbolids',
                    params:{
                        symbolid:symbolids
                    },
                    success:function(response){
                        try{
                            var r = Ext.decode(response.responseText);
                            if(r.success){
                                var secSymbolids= r.data;
                                alarmTree.alarm_sec_symbols=secSymbolids;
                                me.sec_symbols=secSymbolids;
                                Ext.TaskManager.start(alarmTree.task);//启动任务 
                                console.log('----start newCard task ----');
                            }else{
                                alarmTree.alarm_sec_symbols='';
                                me.sec_symbols='';
                                Ext.TaskManager.stop(alarmTree.task);//停止任务
                            }
                        }catch(error){
                            alarmTree.alarm_sec_symbols='';
                            me.sec_symbols='';
                            Ext.TaskManager.stop(alarmTree.task);//停止任务
                            console.log('----catch-error: stop a newCard task ----');
                        }finally{
                            //console.log('---alarm_sec_symbols:'+alarmTree.alarm_sec_symbols);
                        }
                    },
                    failure: function(response) {
                        alarmTree.alarm_sec_symbols='';
                        me.sec_symbols='';
                        Ext.TaskManager.stop(alarmTree.task);//停止任务
                    }
                });
            }
        },
        onTreeCheckChage: function(){
            var realTimeTreePanel = this.lookupReference('realTimeCurrentAlarmTree');
            var realTimeAlarmDockedItem = realTimeTreePanel.down('realTimeAlarmDockedItem');
            var confirmAlarm = realTimeAlarmDockedItem.lookupReference('confirmAlarmBtn');
            var unConfirmAlarm = realTimeAlarmDockedItem.lookupReference('unConfirmAlarmBtn');
            var checkdata = realTimeTreePanel.getSelection();//getChecked();
            var checkCount = checkdata.length;

            var hasUnConfirm=0;
            var hasConfirm = 0;
            for(var i=0;i<checkCount;i++){
                var aStatus = checkdata[i].get("admin_status");
                if(aStatus==1){
                    hasConfirm=1;//已确认
                }else{
                    hasUnConfirm=1;//未确认
                }
                if(hasUnConfirm==1 && hasConfirm==1){
                    break;
                }
            }
            if(checkCount>0){
                if(hasUnConfirm==1 && hasConfirm==1){
                    confirmAlarm.setDisabled(true);
                    unConfirmAlarm.setDisabled(true);
                }else{
                    if(hasUnConfirm==1){
                        confirmAlarm.setDisabled(false);
                    }else{
                        confirmAlarm.setDisabled(true);
                    }
                    if(hasConfirm==1){
                        unConfirmAlarm.setDisabled(false);
                    }else{
                        unConfirmAlarm.setDisabled(true);
                    }
                }
                this.getView().getViewModel().set('realTime_more_check_disabled',false);
            }else{
                confirmAlarm.setDisabled(true);
                unConfirmAlarm.setDisabled(true);
                this.getView().getViewModel().set('realTime_more_check_disabled',true);
            }
            if(checkCount==1){
                this.getView().getViewModel().set('realTime_one_check_disabled',false);
            }else{
                this.getView().getViewModel().set('realTime_one_check_disabled',true);
            }
        },
        onExportAll:function(){
            var treepanel = this.lookupReference('realTimeCurrentAlarmTree');
            var columns = treepanel.getColumns();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.dataIndex=='flexThis'||item.dataIndex=='treecolumn'){
                    return;
                }
                if(item.hidden){
                    return;
                }
                dataIndex.push(item.dataIndex);                              
            });
            treepanel.lookupController().exportAllExcel(dataIndex,'');
        },
        onExportCurrentPage:function(){
            var treepanel = this.lookupReference('realTimeCurrentAlarmTree');
            var columns = treepanel.getColumns();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.dataIndex=='flexThis'||item.dataIndex=='treecolumn'){
                    return;
                }
                if(item.hidden){
                    return;
                }
                dataIndex.push(item.dataIndex);                              
            });
            var store = treepanel.getStore();
            var values = new Array();
            store.each(function(record){
                values.push(record.get('iRCAlarmLogID'));                                                      
            });
            treepanel.lookupController().exportExcel(dataIndex,values);
        },
        onExportSelected:function(){
            var treepanel = this.lookupReference('realTimeCurrentAlarmTree');
            var columns = treepanel.getColumns();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.dataIndex=='flexThis'||item.dataIndex=='treecolumn'){
                    return;
                }
                if(item.hidden){
                    return;
                }
                dataIndex.push(item.dataIndex);                              
            });
            var values = new Array();
            var checkedDate = treepanel.getSelection();//getChecked();
            checkedDate.forEach(function(record){
                values.push(record.get('iRCAlarmLogID'));
            });
            treepanel.lookupController().exportExcel(dataIndex,values);
        },
        onTabChange:function( tabPanel, newCard, oldCard, eOpts ){
            console.log('====tabchange');
            Ext.TaskManager.stop(oldCard.task);//停止任务
            var me = this.getView();
            var realTimeAlarmBtns = newCard.down('realTimeAlarmDockedItem');
            var checkLinkageBtn = realTimeAlarmBtns.down('checkboxfield');
            //判断是否为告警联动状态
            if(checkLinkageBtn.checked){
                var topoMainView = me.up('topoMainView');
                var topoTree = topoMainView.lookupReference('topoTree');
                var selectedtopo = topoTree.getSelection();
                var ary = [];
                for (var i in selectedtopo){
                    ary.push(selectedtopo[i].get('symbol_id'));
                }
                var symolids = ary.join(',');
                this.onGetAlarmSecSymbolid(symolids);
            }else{
                this.onGetAlarmSecSymbolid('0');
            }
        }
    },
    items : [{
        tabIndex:0,
        title:'Alarm',
        xtype: 'currentAlarmTreeView',
        reference: 'realTimeCurrentAlarmTree',
        header: false,
        bind:{
            store: '{storeTree}'
        },
        dockedItems : [{
            dock: 'top',
            xtype : 'realTimeAlarmDockedItem' 
        }]
    },{
        tabIndex:1,
        title:'Event',
        xtype: 'currentAlarmTreeView',
        reference: 'realTimeAlarmEventTree',
        header: false,
        bind:{
            store: '{storeEvent}'
        },
        dockedItems : [{
            dock: 'top',
            xtype : 'realTimeAlarmDockedItem' 
        }]
    }],
    listeners:{
        afterrender :'onAfterRender',
        beforedestroy:'onBeforeDestroy',
        tabchange:'onTabChange' 
        //activate:'onActivate'
    }
});