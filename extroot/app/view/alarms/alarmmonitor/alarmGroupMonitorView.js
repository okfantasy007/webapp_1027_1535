/***
*分组监控模块展示部分
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmmonitor.alarmGroupMonitorView', {
    extend: 'Ext.container.Container',
    xtype: 'alarmGroupMonitorView',
    requires: [
        'Admin.view.alarms.alarmcurrent.currentAlarmTreeView',
        'Admin.view.alarms.alarmmonitor.alarmMonitorDockedItems',
        'Admin.view.alarms.alarmcurrent.currentAlarmTreeToolBar'
    ],
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    layout: 'border',
    width: 500,
    height: 550,
    initComponent:function(){
        this.callParent();
        var dockitem = this.down('currentAlarmTreeView').down('alarmMonitorDockedItems');
        this.delaytask=new Ext.util.DelayedTask(function(){
            console.info('delay: get monitor alarm count.....');
            dockitem.lookupController().onAlarmIlevelCount('');
        });
    },
    viewModel: {
        stores: {
            allRuleStore : {
                type: 'tree',
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/Monitor/getMonitorRules',
                    //extraParams:{username:APP.user},
                    actionMethods: {
                        read: 'GET'
                    },
                    reader: {
                        type: 'json',
                        rootProperty : 'children'
                    }
                }
            },
            storePaging: {
                autoLoad : true,
                type:'json',
                pageSize : 15,
                proxy : {
                    type : 'ajax',
                    url : 'alarm/Monitor/getAlarmCountByRule',
                    actionMethods : {  
                        read   : 'POST'
                    },
                    reader : {
                        type : 'json',
                        totalProperty : 'totalCount',
                        rootProperty : 'children'
                    }
                },
                listeners:{
                    beforeload:'onStoreBeforeLoad'
                }
            },
            storeTree : {
                autoLoad : true,
                //pageSize : 15,
                type:'tree',
                proxy : {
                    type : 'ajax',
                    url : 'alarm/Monitor/getAlarmByRule?limit=15&start=0',
                    actionMethods : {  
                        read   : 'POST'
                    }
                },
                reader : {
                     type : 'json',
                     totalProperty : 'totalCount',
                     rootProperty : 'children'
                },
                listeners:{
                    beforeload:'onStoreBeforeLoad'
                }
            }
        },
        data:{
            monitorAlarm_lv1_count:0,
            monitorAlarm_lv2_count:0,
            monitorAlarm_lv3_count:0,
            monitorAlarm_lv4_count:0,
            monitorAlarm_lv5_count:0,
            oneChecked_disabled:true,
            moreChecked_disabled:true,
            monitor_alarm_update_time:0
        },
        formulas:{
            monitorAlarm_total_count: function (get) {
                return get('monitorAlarm_lv1_count')
                    +get('monitorAlarm_lv2_count')
                    +get('monitorAlarm_lv3_count')
                    +get('monitorAlarm_lv4_count')
                    +get('monitorAlarm_lv5_count')
            }
        }
    },
    controller: {
        onStoreBeforeLoad:function(me,re,ope){
            //var alarmview = this.getView().up('alarmsView');
            //var sec_filter = alarmview.getViewModel().get('alarm_sec_filter');
           // me.proxy.extraParams.secFilter = sec_filter;
           var treepanel = this.lookupReference('monitorAlarmTree');
           me.proxy.extraParams.subneid = treepanel.subNeID;
        },
        onAfterRender:function(){
            //alert('----afterrender-----');
            var alarmMonitorDockedItems = this.lookupReference('monitorAlarmTree').down('alarmMonitorDockedItems');
            alarmMonitorDockedItems.lookupController().onAlarmIlevelCount("");
        },
        onBeforeDestroy:function(){
           // alert('----stop  Times-----');
            var monitorAlarmTree = this.lookupReference('monitorAlarmTree');
            Ext.TaskManager.stop(monitorAlarmTree.task);//停止任务
        },
        onItemClick:function(view, record, item, index, e, obj){
            var ruleSql = record.get("am_rule_sql");
            if(ruleSql==null){
                ruleSql="";
            }
            var ruleid = record.get("am_rule_id");
            var treepanel = this.lookupReference('monitorAlarmTree');
            var pagingToolBar = treepanel.lookupReference('monitorPagingToolBar');
            
            if(ruleid==2){
                pagingToolBar.setDisabled(true);
                pagingToolBar.setHidden(true);
                this.onGetAlarmSecFilterLevel();
                //Ext.TaskManager.start(treepanel.task);//启动任务
                treepanel.getStore().proxy.url='alarm/Monitor/getAlarmByRule?limit=100&start=0';
                treepanel.getStore().proxy.extraParams={condition:ruleSql};
                treepanel.getStore().reload();
            }else{
                pagingToolBar.setDisabled(false);
                pagingToolBar.setHidden(false);
                Ext.TaskManager.stop(treepanel.task);//停止任务
                console.log('---stop monitor task----');
                pagingToolBar.alarm_page_isqurey=1;
                pagingToolBar.alarm_page_start=0;
                var combobox = pagingToolBar.down('combobox');
                pagingToolBar.alarm_page_limit=combobox.value;
                treepanel.getStore().proxy.url='alarm/Monitor/getAlarmByRule?limit=' + pagingToolBar.alarm_page_limit + '&start=' + pagingToolBar.alarm_page_start;
                treepanel.getStore().proxy.extraParams={condition:ruleSql};
                //pagingToolBar.getStore().proxy.url = 'alarm/Monitor/getAlarmCountByRule';
                pagingToolBar.getStore().proxy.extraParams = {condition:ruleSql};
                pagingToolBar.getStore().reload();
            }

            alarmMonitorDockedItems = treepanel.down('alarmMonitorDockedItems');
            alarmMonitorDockedItems.lookupController().onAlarmIlevelCount(ruleSql);
             
            var userRuleEdit = this.lookupReference('userRuleEdit');
            var userRuleRemove = this.lookupReference('userRuleRemove');
            if(record.get("rule_type")=="0" ){
                userRuleEdit.setDisabled(true);
                userRuleRemove.setDisabled(true);
            }else{
                userRuleEdit.setDisabled(false);
                userRuleRemove.setDisabled(false);
            }
        },
        //获取当前用户下对于告警的安全限制,subneid---->symbolid
        onGetAlarmSecFilterLevel:function(){
            var monitorAlarmTree = this.lookupReference('monitorAlarmTree');
            //var subneid = monitorAlarmTree.subNeID;
            if(monitorAlarmTree.alarm_sec_symbols==''){
                Ext.Ajax.request({
                    method:'post',
                    url:'/rest/security/securityManagerCenter/getDomainAllSymbolIDString',
                    params:{
                        user: APP.user
                        //subnetID:subneid
                    },
                    success:function(response){
                        var r = Ext.decode(response.responseText);
                        if(r.success){
                            var secSymbolIds= r.symbolIds;
                            if(secSymbolIds!='none'){
                                monitorAlarmTree.alarm_sec_symbols=secSymbolIds;
                                Ext.TaskManager.start(monitorAlarmTree.task);//启动任务
                                console.log('---start monitor task----');
                            }else{
                                monitorAlarmTree.alarm_sec_symbols='';
                                Ext.TaskManager.stop(monitorAlarmTree.task);//停止任务
                            }    
                        }else{
                            monitorAlarmTree.alarm_sec_symbols='';
                            Ext.TaskManager.stop(monitorAlarmTree.task);//停止任务
                        }
                        console.log('---alarm_sec_symbols:'+monitorAlarmTree.alarm_sec_symbols);
                    },
                    failure: function(response) {
                        monitorAlarmTree.alarm_sec_symbols='';
                        Ext.TaskManager.stop(monitorAlarmTree.task);//停止任务
                    }
                });
            }else{
                Ext.TaskManager.start(monitorAlarmTree.task);//启动任务
                console.log('---start monitor task----');
            }
            
        },
        onTreeCheckChage:function(){
            var monitorAlarmTree = this.lookupReference('monitorAlarmTree');
            var alarmMonitorDockedItems = monitorAlarmTree.down('alarmMonitorDockedItems');
            var checkeddata = monitorAlarmTree.getSelection();//getChecked();
            var checkLength = checkeddata.length;
            var confirmedBtn = alarmMonitorDockedItems.lookupReference('confirmAlarmBtn');
            //查看选择的告警是否都是未确定的告警
            var hasUnConfirm=0;
            for(var i=0;i<checkLength;i++){
                var alarmStaus = checkeddata[i].get("admin_status");
                if(alarmStaus==1){
                    //当包含已确认的告警列时，
                    hasUnConfirm=1;
                    break;
                }
            }
            if(checkLength>0){
                
                if(hasUnConfirm==0){
                    confirmedBtn.setDisabled(false);
                }else{
                    confirmedBtn.setDisabled(true);
                }
                this.getView().getViewModel().set('moreChecked_disabled',false);
            }else{
                confirmedBtn.setDisabled(true);
                this.getView().getViewModel().set('moreChecked_disabled',true);
            }
            if(checkLength==1){
                this.getView().getViewModel().set('oneChecked_disabled',false);
            }else{
                this.getView().getViewModel().set('oneChecked_disabled',true);
            }
        },

        onUserRuleAdd: function(){

            var alarmMonitorMainPanel = this.getView().up('alarmMonitorMainPanel');
            var amRuleOperView = alarmMonitorMainPanel.lookupReference('amRuleOperView');
            alarmMonitorMainPanel.setActiveItem(1);
           /*var view = Ext.create('Admin.view.alarms.alarmmonitor.amRuleOperView');
           var InfoWin = Ext.create("Ext.window.Window", {
                //title:"",
                closable: true,
                scrollable: true,
                border: false,
                layout: 'auto',
                //bodyStyle: "padding:20px;",
                items: view,
                closeAction: 'hide',
                width: 700,
                height: 400,
                maximizable: true,
                minimizable: true,
            });
           //return 
           InfoWin.show();*/
        },
        onUserRuleEdit: function(){
            var alarmMonitorMainPanel = this.getView().up('alarmMonitorMainPanel');
            var amRuleOperView = alarmMonitorMainPanel.lookupReference('amRuleOperView');
            alarmMonitorMainPanel.setActiveItem(1);
        },
        onUserRuleRemove:function(){
            var treelist = this.lookupReference('treelist');
            var selectRecode = treelist.getSelection();
            if(selectRecode.length==1){
                var ruleId = selectRecode[0].get("am_rule_id");
                var ruleName= selectRecode[0].get("am_rule_name");

                var treelist = this.lookupReference('treelist');
                var treepanel = this.lookupReference('monitorAlarmTree');
                var pagingToolBar = treepanel.lookupReference('monitorPagingToolBar');
                pagingToolBar.alarm_page_isqurey=1;
                pagingToolBar.alarm_page_start=0;
                var combobox = pagingToolBar.down('combobox');
                pagingToolBar.alarm_page_limit=combobox.value;
                var alarmMonitorDockedItems = treepanel.down('alarmMonitorDockedItems');

                Ext.MessageBox.confirm(_('Confirmation'), _('Delete')+ruleName, function(btn) {
                    if (btn == 'yes') {
                        Ext.Ajax.request({
                            url : 'alarm/Monitor/DeleteRule',
                            params : {
                                id : ruleId
                            },
                            method : 'delete',
                            success : function(response) {
                                var r = Ext.decode(response.responseText);
                                if (r.success) {
                                    var ruleSql="";
                                    treepanel.getStore().proxy.url='alarm/Monitor/getAlarmByRule?limit=' + pagingToolBar.alarm_page_limit + '&start=' + pagingToolBar.alarm_page_start;
                                    treepanel.getStore().proxy.extraParams={condition:ruleSql};
                                    
                                    if(pagingToolBar!=null){
                                        pagingToolBar.getStore().proxy.url = 'alarm/Monitor/getAlarmCountByRule';
                                        pagingToolBar.getStore().proxy.extraParams = {condition:ruleSql};
                                        pagingToolBar.getStore().reload();
                                    }else{
                                        treepanel.getStore().reload();
                                    }
                                    alarmMonitorDockedItems.lookupController().onAlarmIlevelCount(ruleSql);
                                    
                                    treelist.getStore().reload();
                                }else{
                                    Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                                }
                            }
                        });
                    }
                });
            }
            
        },
        onUserRuleRefresh:function(){
           var treelist = this.lookupReference('treelist');
           treelist.getStore().reload();
        },
        onExportAll:function(){
            var treepanel = this.lookupReference('monitorAlarmTree');
            var columns = treepanel.getColumns();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.dataIndex==null || item.dataIndex=='flexThis'||item.dataIndex=='treecolumn'){
                    return;
                }
                if(item.hidden){
                    return;
                }
                dataIndex.push(item.dataIndex);                              
            });
            var ruleList = this.lookupReference('treelist');
            var selectRecode = ruleList.getSelection();
            var ruleSql = '';
            if(selectRecode.length!=0){
                ruleSql = selectRecode[0].get("am_rule_sql");
            }
            treepanel.lookupController().exportAllExcelByMonitor(dataIndex,ruleSql);
        },
        onExportCurrentPage:function(){
            var treepanel = this.lookupReference('monitorAlarmTree');
            var columns = treepanel.getColumns();
            //var fields = new Array();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.dataIndex==null || item.dataIndex=='flexThis'||item.dataIndex=='treecolumn'){
                    return;
                }
                if(item.hidden){
                    return;
                }
                //fields.push(item.text); 
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
            var treepanel = this.lookupReference('monitorAlarmTree');
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkedlenght = checkedDate.length;
            if(checkedlenght<=0){
                return;
            }
            var columns = treepanel.getColumns();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.dataIndex==null || item.dataIndex=='flexThis'||item.dataIndex=='treecolumn'){
                    return;
                }
                if(item.hidden){
                    return;
                } 
                dataIndex.push(item.dataIndex);                              
            });
            var values = new Array();
            checkedDate.forEach(function(record){
                values.push(record.get('iRCAlarmLogID'));
            });
            treepanel.lookupController().exportExcel(dataIndex,values);
        },
        onPagingChange: function(me, pagedata, ops) { 
           
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
                var currenTreepanel = this.lookupReference('monitorAlarmTree');
                if(currenTreepanel!=null){
                    currenTreepanel.getStore().proxy.url='alarm/Monitor/getAlarmByRule?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start;
                    currenTreepanel.getStore().reload();
                }
            }
        }
    },
    items: [{
        title:_('Alarm Group Monitor'),
        region: 'north',
        xtype: 'panel',
        iconCls: 'x-fa fa-circle-o',
        titleAlign:'left'
    },{
        region: 'west',
        width: 200,
        split: true,
        reference: 'ruleTree',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        border: false,
        scrollable: 'y',
        collapseDirection:'left',
        collapsible:true,
        header:false,
        rootVisible : false,
        tbar: {
            reference: 'tbarForRulelist',
            items:[{
                iconCls:'x-fa  fa-plus-square',//'add',
                tooltip : _('Add'),
                reference:'userRuleAdd',
                handler: 'onUserRuleAdd'
            },{
                iconCls:'x-fa fa-edit',//'edit_task',
                tooltip : _('Edit'),//'编辑',
                reference:'userRuleEdit',
                disabled:true,
                handler: 'onUserRuleEdit'
            },{
                iconCls:'x-fa fa-remove',//'remove ',
                reference:'userRuleRemove',
                tooltip : _('Delete'),
                disabled:true,
                handler: 'onUserRuleRemove'
            },{
                iconCls:'x-fa fa-refresh',//'remove ',
                reference:'userRuleRefresh',
                tooltip : _('Refresh'),
                handler: 'onUserRuleRefresh'
            }]
        },
        items: [{
            xtype: 'treepanel',
            height: 700,
            useArrows: true,
            rootVisible: false,
            reference: 'treelist',
            bind: '{allRuleStore}',
            emptyText : _('Empty'),
            listeners: {
                itemclick: 'onItemClick',
            }
        }]
    },{
        region: 'center',
        xtype: 'currentAlarmTreeView',
        reference: 'monitorAlarmTree',
        //title: '当前告警列表',
        header: false,
        bind:{
            store: '{storeTree}'
        },
        tbar : {
            bind: {
                store: '{storePaging}'
            },
            xtype:'currentAlarmTreeToolBar',
            reference: 'monitorPagingToolBar',
            hidden:false,
            listeners : {
                change : 'onPagingChange'
            }
        },
        dockedItems : [{
            dock: 'top',
            xtype : 'alarmMonitorDockedItems',
            reference: 'alarmMonitorDockedItems'
        }]
    }],
    listeners:{
        afterrender:'onAfterRender',
        beforedestroy:'onBeforeDestroy'
    }
});