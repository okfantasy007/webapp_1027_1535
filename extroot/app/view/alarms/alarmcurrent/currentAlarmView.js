/***
*当前告警模块
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmView', {
    extend: 'Ext.container.Container',
    xtype: 'currentAlarmView',
    requires: [
        'Admin.view.alarms.alarmcurrent.currentAlarmTreeView',
        'Admin.view.alarms.alarmhistory.alarmCheckFormView',
        'Admin.view.alarms.alarmcurrent.currentAlarmDockedItems',
        'Admin.view.alarms.alarmcurrent.currentAlarmTreeToolBar'
    ],
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    layout:'fit',
    initComponent:function(){
        this.callParent();
        this.scanCount=0;
    },
    viewModel: {
        stores: {
            storePaging: {
                autoLoad : true,
                type:'json',
                pageSize : 15,
                proxy : {
                    type : 'ajax',
                    url : 'alarm/currentAlarm/getCurrentAlarmCount',
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
                    beforeload:'onCurrentBeforeLoad'
                }
            },
            storeTree : {
                autoLoad : true,
                //pageSize : 15,
                type:'tree',
                proxy : {
                    type : 'ajax',
                    url : 'alarm/currentAlarm/getMainAlarmByParam?limit=15&start=0',
                    actionMethods : {  
                        read   : 'POST'
                    }
                },
                reader : {
                     type : 'json',
                     //totalProperty : 'totalCount',
                     rootProperty : 'children'
                },
                listeners:{
                    beforeload:'onCurrentBeforeLoad'
                }
            }
        },
        data: {
            oneCheckedDisabled :true,
            moreCheckedDisabled :true
        }
    },
    controller: { 
        routes: {
            ':v1/:v2/:v3': 'oniLevelChange',
        },
        oniLevelChange:function(v1,v2,v3){
            console.log('L3 onRouteChange', v1,v2,v3);
            var lvindex = (v3+'').indexOf("lv");
            if( v1=='alarms'&& v2=='current' &&(lvindex>=0 || v3=='all')){//alarms/current/lv1
                var routeView = this.getView();
                var activateView = this.getView().up('').getLayout().getActiveItem();
                if (activateView === routeView) {
                    //跳转到当前告警，显示各级别的告警
                    var lvindex = (v3+'').indexOf("lv");
                    this.onAlarmQueryByiLevel(v3);
                }
            }
        },
        onAlarmQueryByiLevel:function(iLevel){
            var lVindex=iLevel.indexOf('lv')
            if(lVindex>=0){
                iLevel=iLevel.substring(2);
            }
            if(iLevel=='all'){
                iLevel='';
            }
            var treepanel = this.lookupReference('currentAlarmTree');
            var pagingToolBar = treepanel.lookupReference('pagingToolBar');
            pagingToolBar.alarm_page_isqurey=1;
            pagingToolBar.alarm_page_limit=15;
            pagingToolBar.alarm_page_start =0;
            treepanel.getStore().proxy.url='alarm/currentAlarm/getMainAlarmByParam?limit=' + pagingToolBar.alarm_page_limit + '&start=' + pagingToolBar.alarm_page_start;
            treepanel.getStore().proxy.extraParams={iLevel:iLevel};
            //treepanel.getStore().reload();

            pagingToolBar.getStore().proxy.extraParams = {iLevel:iLevel};
            pagingToolBar.getStore().proxy.url = 'alarm/currentAlarm/getCurrentAlarmCount';
            pagingToolBar.getStore().reload();
        },
        onCurrentBeforeLoad:function(_s,_e,_ops){
            var treepanel = this.lookupReference('currentAlarmTree');
            _s.proxy.extraParams.subneid = treepanel.subNeID;
        },
        onActivate: function(){
            if(this.getView().scanCount==0){
                this.getView().scanCount=1;
            }else{
                console.log('--load current view--')
                var treepanel = this.lookupReference('currentAlarmTree');
                var pagingToolBar = treepanel.lookupReference('pagingToolBar');
                pagingToolBar.alarm_page_isqurey=1;
                treepanel.store.proxy.extraParams={};
                //treepanel.store.load();
                pagingToolBar.store.proxy.extraParams={};
                pagingToolBar.store.load(); 
            }
        },
        /*onQuery: function(){
            var currentView = this.getView();
            var treepanel = this.lookupReference('currentAlarmTree');
            var alarmCheckForm = treepanel.lookupReference('alarmCheckForm');//this.lookupReference('alarmCheckForm');
            var pagingToolBar = treepanel.lookupReference('pagingToolBar');
            pagingToolBar.alarm_page_isqurey=1;
            var combobox = pagingToolBar.down('combobox');
            pagingToolBar.alarm_page_limit=combobox.value;
            pagingToolBar.alarm_page_start =0;
            treepanel.getStore().proxy.url='alarm/currentAlarm/getMainAlarmByParam?limit=' + pagingToolBar.alarm_page_limit + '&start=' + pagingToolBar.alarm_page_start;
            treepanel.getStore().proxy.extraParams=alarmCheckForm.getForm().getValues();
            //treepanel.getStore().reload();

            pagingToolBar.getStore().proxy.extraParams = alarmCheckForm.getForm().getValues();
            pagingToolBar.getStore().proxy.url = 'alarm/currentAlarm/getCurrentAlarmCount';
            pagingToolBar.getStore().reload();
        },
        onExpandAll:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.expandAll();
        },
        onCloseAll: function() {
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.collapseAll();
        },*/
        onTreeCheckChage: function(){
            //判断是否有选中项，如果有选中项则将菜单栏中需要选中行才可用的按钮，设为enable
            var treepanel = this.lookupReference('currentAlarmTree');
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            
            var clearSelectedBtn = treepanel.lookupReference('clearSelectedBtn');
            var confirmAlarmBtn = treepanel.lookupReference('confirmAlarmBtn');
            //查看选择的告警是否都是未确定的告警
            var hasUnConfirm=0;
            for(var i=0;i<checkLength;i++){
                var alarmStaus = checkedDate[i].get("admin_status");
                if(alarmStaus==1){
                    //当包含已确认的告警列时，
                    hasUnConfirm=1;
                    break;
                }
            }
            //设置按钮是否可用
            if(checkLength>0){
                if(hasUnConfirm==0){
                    confirmAlarmBtn.setDisabled(false);
                }else{
                    confirmAlarmBtn.setDisabled(true);
                }
                clearSelectedBtn.setDisabled(false);
                this.getView().getViewModel().set('moreCheckedDisabled',false);
            }else{
                clearSelectedBtn.setDisabled(true);
                confirmAlarmBtn.setDisabled(true);
                this.getView().getViewModel().set('moreCheckedDisabled',true);
            }
            if(checkLength==1){
                this.getView().getViewModel().set('oneCheckedDisabled',false);
            }else{
                this.getView().getViewModel().set('oneCheckedDisabled',true);
            }
        },
        //属性按钮
        /*onProperyTool:function() {
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onProperyTool();
        },
        //重置查询panel中的所有value
        onReset: function() {
            var treepanel = this.lookupReference('currentAlarmTree');
            var alarmCheckForm = treepanel.lookupReference('alarmCheckForm');
            alarmCheckForm.getForm().reset();
        },
        //确认告警
        onConfirmAlarm: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onConfirmAlarm();
        },
        //取消确认
        onUnconfirmAlarm: function(){
           var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onUnconfirmAlarm();
        },
        //清除选择项
        onClearSelected: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onClearSelected();
        },
        //清除同类型
        onClearSameType: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onClearSameType(); 
        },
        //清除同位置
        onClearSameLocation: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onClearSameLocation();
        },
        //清除已确定
        onClearConfirmed: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onClearConfirmed();
        },
        //清除所有
        onClearAllAlarm:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onClearAllAlarm();
        },
        //按查询条件清除
        onClearChecked: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onClearChecked();
        },
        //查看影响：TUNNEL
        onEffectTunnel: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onEffectTunnel();
        },
        //查看影响：pw
        onEffectPw: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onEffectPw();
        },
        //查看影响：业务
        onEffectBusiness: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onEffectBusiness();
        },
        //过滤设置
        //级别过滤
        onFilteriLevel: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onFilteriLevel();
        },
        //类型过滤
        onFilterType: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onFilterType();
        },
        //位置过滤
        onFilterLocation: function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onFilterLocation();
        },

        //类型与位置过滤
        onFilterTypeLoc:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onFilterTypeLoc();
        },

        //拓扑定位
        onTopologicalLocalization:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.lookupController().onTopologicalLocalization();
        },*/

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
                    
                var currenTreepanel =this.lookupReference('currentAlarmTree');
                if(currenTreepanel!=null){
                    currenTreepanel.getStore().proxy.url='alarm/currentAlarm/getMainAlarmByParam?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start; 
                    currenTreepanel.getStore().reload();
                }
            }
        },

        onExportAll:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
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
            var alarmCheckForm = treepanel.lookupReference('alarmCheckForm');
            var formvalues = alarmCheckForm.getForm().getValues();
            formvalues = JSON.stringify(formvalues);
            treepanel.lookupController().exportAllExcel(dataIndex,formvalues);
        },
        onExportCurrentPage:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
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
            var store = treepanel.getStore();
            var values = new Array();
            store.each(function(record){
                values.push(record.get('iRCAlarmLogID'));                                                      
            });
            treepanel.lookupController().exportExcel(dataIndex,values);
        },
        onExportSelected:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
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
            var checkedDate = treepanel.getSelection();//getChecked();
            checkedDate.forEach(function(record){
                values.push(record.get('iRCAlarmLogID'));
            });
            treepanel.lookupController().exportExcel(dataIndex,values);
        }
        
    },
    items : [/*{
        title:_('Current Alarms'),
        xtype: 'panel',
        iconCls: 'x-fa fa-circle-o',
        titleAlign:'left',
    },{
        xtype : 'currentAlarmDockedItems',
    },{ 
        xtype:'alarmCheckFormView',
        reference: 'alarmCheckForm',
        hidden:'true',
    },*/{
        xtype: 'currentAlarmTreeView',
        reference: 'currentAlarmTree',
        title:_('Current Alarms'),
        iconCls: 'x-fa fa-circle-o',
        //header: false,
        bind:{
            store: '{storeTree}'
        },
        dockedItems: [{
            xtype : 'currentAlarmDockedItems',
            dock: 'top'
        },{
            xtype:'alarmCheckFormView',
            reference: 'alarmCheckForm',
            hidden:'true'
        }],
        tbar : {
            bind: {
                store: '{storePaging}'
            },
            xtype:'currentAlarmTreeToolBar',
            reference: 'pagingToolBar',
            listeners : {
                change : 'onPagingChange'
            }
        }
    }],
    listeners:{
        activate:'onActivate'
    }
});