/***
*历史告警模块
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmhistory.historyAlarmView', {
    extend: 'Ext.container.Container',
    xtype: 'historyAlarmView',
    requires: [
        'Admin.view.alarms.alarmhistory.historyAlarmTreeView',
        'Admin.view.alarms.alarmhistory.alarmTreePagingToolBar',
        'Admin.view.alarms.alarmhistory.alarmCheckFormView',
        'Admin.view.alarms.alarmhistory.historyAlarmDockedItems'
    ],
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    layout:'fit',
    initComponent:function(){
        this.callParent();
        this.history_subNeID=0;
        this.scanCount=0;
    },
    viewModel: {
        stores: {
            storej:{
                autoLoad : true,
                pageSize : 15,
                proxy : {
                    type : 'ajax',
                    url : 'alarm/historyAlarm/getHistoryAlarmCount',
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
                    beforeload: 'onHistoryAlarmLoad'
                }
            },
            store : {
                autoLoad : true,
                //pageSize : 15,
                type:'tree',
                proxy : {
                    type : 'ajax',
                    url : 'alarm/historyAlarm/getMainAlarmByParam?limit=15&start=0',
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
                    beforeload: 'onHistoryAlarmLoad'
                }
            }
        }
    },
    controller: {
        onHistoryAlarmLoad: function(me,re,ope){
            me.proxy.extraParams.subneid = this.getView().history_subNeID;
        },
        onActivate:function(){
            if(this.getView().scanCount==0){
                this.getView().scanCount=1;
            }else{
                console.log('--load history view--')
                var treepanel = this.lookupReference('historyAlarmTree'); 
                var pagingToolBar = treepanel.down('alarmTreePagingToolBar');
                pagingToolBar.alarm_page_isqurey=1;
                treepanel.store.proxy.extraParams={};
                pagingToolBar.store.proxy.extraParams={};
                //treepanel.store.load();
                pagingToolBar.store.load();
            }
        },
        onQuery: function(){
            var controller = this;
            var treepanel = this.lookupReference('historyAlarmTree'); 
            var alarmCheckForm = this.lookupReference('alarmCheckForm');
            var pagingToolBar = this.lookupReference('pagingToolBar');
            pagingToolBar.alarm_page_isqurey=1;
            pagingToolBar.alarm_page_start=0;
            var combobox = pagingToolBar.down('combobox');
            pagingToolBar.alarm_page_limit=combobox.value;
            treepanel.getStore().proxy.url='alarm/historyAlarm/getMainAlarmByParam?limit=' + pagingToolBar.alarm_page_limit + '&start=' + pagingToolBar.alarm_page_start;
            treepanel.getStore().proxy.extraParams=alarmCheckForm.getForm().getValues();
            //treepanel.getStore().reload();

            pagingToolBar.getStore().proxy.extraParams = alarmCheckForm.getForm().getValues();
            pagingToolBar.getStore().proxy.url = 'alarm/historyAlarm/getHistoryAlarmCount';
            pagingToolBar.getStore().reload();
        },

        onItemRightClick: function(view,record,item,index,e) {
            e.preventDefault();  
            e.stopEvent(); 
            var mainMenu = this.getmainMenu(record, view);
            mainMenu.showAt(e.getXY());    
        },
        //打开查询界面
        isShow:function(obj,ischecked){
            if(ischecked){
                this.lookupReference('alarmCheckForm').setHidden(false);//setVisible(true); 
            }else{
                this.lookupReference('alarmCheckForm').setHidden(true);//setVisible(false);
            }
        },
        //重置查询panel中的所有value
        onReset: function() {
            this.lookupReference('alarmCheckForm').getForm().reset();
        },
        onExpandAll:function(){
            var treepanel = this.lookupReference('historyAlarmTree');
            treepanel.expandAll();

        },
        onCloseAll: function() {
            var treepanel = this.lookupReference('historyAlarmTree');
            treepanel.collapseAll();
            
        },
        onSelectionChange:function(me, selected, eOpts){
            console.log('onSelectionChange');

            var selectedLenght = selected.length;
            var addExperienceBtn = this.lookupReference('addExperienceBtn');
            var removeSelectedBtn = this.lookupReference('removeSelectedBtn');
            var locationBtn = this.lookupReference('locationBtn');
            var topoLocationBtn = this.lookupReference('topoLocationBtn');
            var devLocationBtn = this.lookupReference('devLocationBtn');
            var propertyBtn = this.lookupReference('propertyBtn');
            var selectExportBtn = this.lookupReference('selectExportBtn');
            
            if(selectedLenght>0){
                removeSelectedBtn.setDisabled(false);
                addExperienceBtn.setDisabled(false);
                selectExportBtn.setDisabled(false);
            }else{
                removeSelectedBtn.setDisabled(true);
                addExperienceBtn.setDisabled(true);
                selectExportBtn.setDisabled(true);
            }
            if(selectedLenght==1){
                propertyBtn.setDisabled(false);
                locationBtn.setDisabled(false);
                topoLocationBtn.setDisabled(false);
                devLocationBtn.setDisabled(false);
            }else{
                propertyBtn.setDisabled(true);
                locationBtn.setDisabled(true);
                topoLocationBtn.setDisabled(true);
                devLocationBtn.setDisabled(true);
            }
        },
        //删除选择项 
        onRemoveSelected: function() {
            var ids=[];
            var pagingToolBar = this.lookupReference('pagingToolBar');
            var treepanel = this.lookupReference('historyAlarmTree');
            var checkedDate = treepanel.getSelection();//treepanel.getChecked();
            var checkLength = checkedDate.length;
            
            for(var i=0;i<checkLength;i++){  
               var alarmid = checkedDate[i].get("iRCAlarmLogID");
               ids.push(alarmid);
            }
            Ext.MessageBox.confirm(_('Confirmation'), _('Delete Selected Items'), function(btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url : 'alarm/historyAlarm/deleteSelectedHistoryAlarm',
                        params : {
                            ids : ids.join(',')
                        },
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                                if(pagingToolBar!=null){
                                    pagingToolBar.getStore().reload();
                                }else{
                                    treepanel.getStore().reload();
                                }
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        }
                    });
                }
            });
        },
        //删除查询项
        onRemoveChecked: function() {
            var historysubneid = this.getView().history_subNeID;
            var treepanel = this.lookupReference('historyAlarmTree'); 
            var alarmCheckForm = this.lookupReference('alarmCheckForm');
            var pagingToolBar = this.lookupReference('pagingToolBar');
            var conditions = JSON.stringify(alarmCheckForm.getForm().getValues());
            Ext.MessageBox.confirm(_('Confirmation'), _('Delete Query results'), function(btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url : 'alarm/historyAlarm/deleteCheckedHistoryAlarm',
                        params : {
                            condition:conditions,
                            subneid:historysubneid
                        },
                        method :'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                                if(pagingToolBar!=null){
                                    pagingToolBar.getStore().reload();
                                }else{
                                    treepanel.getStore().reload();
                                }
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        }
                    });
                }
            });
        },
        //删除当前用户下的所有历史告警
        onRemoveAllHistory: function() {

            var historysubneid = this.getView().history_subNeID;
            var treepanel = this.lookupReference('historyAlarmTree'); 
            var pagingToolBar = this.lookupReference('pagingToolBar');
            Ext.MessageBox.confirm(_('Confirmation'), _('Delete All'), function(btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url : 'alarm/historyAlarm/deleteAllHistoryAlarm',
                        params : {subneid:historysubneid},
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert(_('Tips'), _('Operation Success!'));
                                if(pagingToolBar!=null){
                                    pagingToolBar.getStore().reload();
                                }else{
                                    treepanel.getStore().reload();
                                }
                            }else{
                                Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                            }
                        }
                    });
                }
            });
        },
        //添加排障经验
        onAddExperience: function(){
            var treepanel = this.lookupReference('historyAlarmTree');
            var addForm = Ext.create("Admin.view.alarms.AlarmReparExp.addForm");
            var grid = addForm.down('gridpanel');
            var checkedDate = treepanel.getSelection();//treepanel.getChecked();
            var checkLength = checkedDate.length;
            if(checkLength>0){
                var gridStore = grid.getStore();
                gridStore.add(checkedDate);

                var alarmPropertyWin = Ext.create("Ext.window.Window", {
                    title: _('Add Troubleshooting'),
                    closable: true,
                    autowidth: true,
                    autoheight: true,
                    border: false,
                    layout: 'auto',
                    items: addForm,
                    maximizable: true,
                    minimizable: true,
                    autoScroll : true,
                    buttons: [{
                        xtype: "button",
                        text: _('OK'),
                        handler: function() {
                            var isEmpty = false;
                            if(grid.getStore().getData().length==0){
                                isEmpty = true;
                                Ext.Msg.alert(_('With Errors'), _('Alarm list can not be empty!') );
                            }
                            if(!isEmpty){
                                var gridStore = grid.getStore();
                                var addSymptoms = gridStore.getData();
                                var form = addForm.down('form');
                                var newValues = form.getForm().getValues();
                                var formFields = form.items.items;
                                var valid = true;
                                for(var i in form.items.items){
                                    if(!formFields[i].validate()){
                                        valid = false;
                                        break;
                                    }
                                }
                                if(valid){
                                    var symptomsMap =Ext.create("Ext.util.HashMap");
                                    var keyArray = new Array("url" ,"strName" ,"strUptime" ,"strLocation" ,"iRCNETypeID" ,"iRCAlarmID" ,"strDeviceName" ,"iRCNetNodeID");
                                    for(var i in keyArray){
                                        symptomsMap.add(keyArray[i],new Array());
                                    }
                                    for(var i in addSymptoms.items){
                                        symptomsMap.each(function(key,value,length){
                                        var array = this.get(key);
                                        array.push(addSymptoms.items[i].get(key));
                                        });
                                    }
                                    var passValues = Ext.apply(newValues,symptomsMap.map);                                        
                                    Ext.Ajax.request({
                                        url: '/alarm/AlarmRepairExp/addRepairExp',
                                        method: 'post',
                                        params: passValues,
                                        success: function(response) {
                                            if (response.responseText) {
                                                Ext.Msg.alert(_('Success'), _('Add Successfully')); 
                                            }else{
                                                Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
                                            }
                                        },
                                        failure : function () {
                                            Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
                                        }
                                    }); 
                                }
                                alarmPropertyWin.close();
                            }
                        }
                    },{
                        xtype: "button",
                        text: _('Cancel'),
                        handler: function() {
                            alarmPropertyWin.close();
                        }
                    }]
                });
                alarmPropertyWin.show();
            }else{

            }
        },
        //属性窗体
        createPropertyWin: function(rowRecord) {
            var subNeID = this.getView().history_subNeID;
            var alarmPropertyWin = Ext.create("Admin.view.alarms.alarmproperty.alarmPropertyWindow", {});
            //alarmPropertyWin.lookupController().loadData(rowRecord.data,subNeID,'rcalarmhistory');
            var treepanel = this.lookupReference('historyAlarmTree');
            var treedata = treepanel.getStore().data;
            alarmPropertyWin.lookupController().loadCurrentData(rowRecord,treedata.items);
            return alarmPropertyWin;
        },
        //属性按钮
        onProperyTool:function() {
            var treepanel = this.lookupReference('historyAlarmTree');
            var checkeddate = treepanel.getSelection();//getChecked();
            var checkCount = checkeddate.length; 
            if(checkCount==1){
                var record = checkeddate[0];
                var alarmPropertyWin = this.createPropertyWin(record);
                alarmPropertyWin.show();
            }else{
                Ext.MessageBox.alert(_('Tips'), _('Can only select one item'));
            }
        },
        //右键菜单
        /*getmainMenu: function(rowRecord, grid) {
            var alarmCheckForm = this.lookupReference('alarmCheckForm');
            var pagingToolBar = this.lookupReference('pagingToolBar');
            var treepanel = this.lookupReference('historyAlarmTree');
            
            var mainMenu = Ext.create('Admin.view.alarms.alarmhistory.historyRightClickMenu', {
                reference: "alarmMainMenu",
            });
            mainMenu.lookupController().loadData(treepanel,alarmCheckForm,pagingToolBar);
            return mainMenu;
        },*/
        //右键菜单
        getmainMenu: function(rowRecord, grid) {
            var controller = this;
            var treepanel = this.lookupReference('historyAlarmTree');
            var checkeddate = treepanel.getSelection();//getChecked();
            var checkCount = checkeddate.length;
            var pagingToolBar = this.lookupReference('pagingToolBar');
            var mainMenu = Ext.create('Ext.menu.Menu', {
                reference: "alarmMainMenu",
                items: [{
                    name: 'repair',
                    reference:'repair',
                    iconCls : 'x-fa fa-wrench', //图标文件 
                    text: _('Troubleshooting'),
                    menu: {
                        items: [{
                            name: 'addRepair',
                            reference: "addRepair",
                            text: _('Add Troubleshooting'),
                            disabled : true,
                            handler: function() {
                                controller.onAddExperience();
                            }
                        },{
                            name: 'sameTypeRepair',
                            reference: "sameTypeRepair",
                            text: _('With Same Alarm Type'),
                            disabled : true,
                            handler: function(){
                                if(checkCount==1){
                                    var PropertyWin = controller.createPropertyWin(checkeddate[0]);
                                    var alarmPropertyView = PropertyWin.down('alarmPropertyView');
                                    alarmPropertyView.setActiveTab(3);
                                    PropertyWin.show();
                                }else{
                                    Ext.MessageBox.alert(_('Tips'), _('Can only select one item'));
                                } 
                            }
                        }]
                    }  
                },{
                    name: 'delete',
                    iconCls : 'x-fa fa-times', //图标文件
                    text: _('Delete'),
                    menu: {   
                        items: [{
                            itemId : 'alarmSelectDelete',
                            reference: "alarmSelectDelete",
                            name: 'DeleteSelectedItems',
                            text : _('Delete Selected Items'),
                            handler: function(){
                                controller.onRemoveSelected();
                            },
                            disabled : true
                        },{
                            itemId : 'alarmQueryDelete',
                            name: 'DeleteQueryresults',
                            text : _('Delete Query results'),
                            handler: function(){
                                controller.onRemoveChecked();
                            }  
                        },{
                            itemId : 'alarmAllDelete',
                            name: 'DeleteAll',
                            text : _('Delete All'),
                            handler:function(){
                                controller.onRemoveAllHistory();
                            }
                        }]
                    }
                },{
                    name: 'property',
                    reference: "property",
                    iconCls:'x-fa fa-file-text-o', //图标文件
                    handler: function(){
                        controller.onProperyTool();
                    },
                    text: _('Properties'),
                    disabled : true
                },{
                    reference: "location",
                    name: 'location',
                    iconCls: 'x-fa fa-map-marker', //图标文件
                    text: _('Localization'),
                    disabled : true,
                    menu: {   
                        items: [{
                            reference: "topologyLocation",
                            name: 'topologyLocation',
                            text : _('Topological Localization'),
                            disabled : true,
                            handler:function(){
                                controller.onTopologicalLocalization();
                            }
                        },{
                            reference: "deviceLocation",
                            name: 'deviceLocation',
                            text : _('device Localization'),
                            disabled : true
                        }]
                    } 
                },{
                    name: 'export',
                    text: _('Export'),
                    iconCls:'x-fa fa-download',
                    menu:[{
                        text:_('All'),
                        handler:function(){
                            controller.onExportAll();
                        }
                    },{
                        text:_('current page'),
                        handler:function(){
                            controller.onExportCurrentPage();
                        }
                    },{
                        text:_('selected'),
                        reference: 'exportSelect',
                        disabled: true,
                        handler:function(){
                            controller.onExportSelected();
                        }
                    }]
                }]
            });
            var rightMenuController = mainMenu.lookupController();
            var addRepair = rightMenuController.lookupReference('addRepair');
            var sameTypeRepair = rightMenuController.lookupReference('sameTypeRepair');
            var alarmSelectDelete = rightMenuController.lookupReference('alarmSelectDelete');
            var property = rightMenuController.lookupReference('property');
            var location = rightMenuController.lookupReference('location');
            var topologyLocation = rightMenuController.lookupReference('topologyLocation');
            var deviceLocation = rightMenuController.lookupReference('deviceLocation');
            var exportSelect = rightMenuController.lookupReference('exportSelect');

            if(checkCount>0){
                alarmSelectDelete.setDisabled(false);
                addRepair.setDisabled(false);
                exportSelect.setDisabled(false);
            }else{
                alarmSelectDelete.setDisabled(true);
                addRepair.setDisabled(true);
                exportSelect.setDisabled(true);
            }
            if(checkCount==1){
                property.setDisabled(false);
                location.setDisabled(false);
                topologyLocation.setDisabled(false);
                deviceLocation.setDisabled(false);
                sameTypeRepair.setDisabled(false);
            }else{
                property.setDisabled(true);
                location.setDisabled(true);
                topologyLocation.setDisabled(true);
                deviceLocation.setDisabled(true);
                sameTypeRepair.setDisabled(true);
            }

            return mainMenu;
        },
        //拓扑定位
        onTopologicalLocalization:function(){
            var treepanel = this.lookupReference('historyAlarmTree');
            var checkeddate = treepanel.getSelection();//getChecked();
            var checkCount = checkeddate.length; 
            if(checkCount==1){
                var symbolid = checkeddate[0].get('symbol_id');
                window.location = "#topology/home/" + symbolid;
            }else{
                Ext.MessageBox.alert(_('Tips'), _('Can only select one item'));
            }
        },
        //导出------------------
        exportExcel:function(dataIndex,values){

            Ext.Ajax.request({
                method:'post',
                url:'alarm/historyAlarm/ExportSelected',
                params:{
                    columns: dataIndex.join(','),
                    ids: values.join(',')
                },
                success:function(response){
                    location.href = "/alarm/historyAlarm/downLoadCsv";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
                }
            });
        },
        //全部导出
        exportAllExcel:function(dataIndex,conditionString){
            var historysubneid = this.getView().history_subNeID;
            Ext.Ajax.request({
                method:'post',
                url:'alarm/historyAlarm/ExportAll',
                params:{
                    columns:dataIndex.join(','),
                    condition:conditionString,
                    subneid:historysubneid
                },
                success:function(response){
                    location.href = "/alarm/historyAlarm/downLoadCsv";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
                }
            });
        },
        //导出全部
        onExportAll:function(){
            var treepanel = this.lookupReference('historyAlarmTree');
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
            var alarmCheckForm = this.lookupReference('alarmCheckForm');
            var formvalues = alarmCheckForm.getForm().getValues();
            formvalues = JSON.stringify(formvalues);
            this.exportAllExcel(dataIndex,formvalues);
        },
        //导出当前页
        onExportCurrentPage:function(){
            var treepanel = this.lookupReference('historyAlarmTree');
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
            this.exportExcel(dataIndex,values);
        },
        //导出选择项
        onExportSelected:function(){
            var treepanel = this.lookupReference('historyAlarmTree');
            var columns = treepanel.getColumns();
            var dataIndex = new Array();
            //var fields = new Array();
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
            var values = new Array();
            var checkedDate = treepanel.getSelection();//getChecked();
            checkedDate.forEach(function(record){
                values.push(record.get('iRCAlarmLogID'));
            });
            this.exportExcel(dataIndex,values);
        },
        onPagingChange: function(me, pagedata, ops) { 

            /*if(me.pagedata==pagedata){
                
            }else{
                me.pagedata = pagedata;*/
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
                    var historyTreepanel = this.lookupReference('historyAlarmTree');//me.up("treepanel");
                    if(historyTreepanel!=null){
                        historyTreepanel.getStore().proxy.url='alarm/historyAlarm/getMainAlarmByParam?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start;
                        historyTreepanel.getStore().reload(); 
                    }
                }
           // }
        },
        onSelect:function( treemodel, record, index, eOpts ){//选中时,显示颜色-浅黄
            if(record.get('iStatus') == 1){
                treemodel.view.getRow(index).style.backgroundColor="#FFEFBB";
            }
        },
        onDeselect:function( treemodel, record, index, eOpts ) {//不选后，显示原色
            if(record.get('iStatus') == 1){
                treemodel.view.getRow(index).style.backgroundColor='#90ee90';
            }
        }
    },

    items: [/*{
         title:_('Historical Alarms'),
         xtype: 'panel',
         iconCls: 'x-fa fa-circle-o',
         titleAlign:'left'
    },{
        xtype : 'historyAlarmDockedItems',
    },{
        xtype:'alarmCheckFormView',
        reference: 'alarmCheckForm',
        hidden:true
    },*/{
        xtype:'historyAlarmTreeView',
        reference: 'historyAlarmTree',
        title:_('Historical Alarms'),
        iconCls: 'x-fa fa-circle-o',
        bind: {
            store: '{store}'
        },
        dockedItems: [{
            xtype : 'historyAlarmDockedItems',
            dock: 'top'
        },{
            xtype:'alarmCheckFormView',
            reference: 'alarmCheckForm',
            hidden:'true'
        }],
        // 分页
        tbar : {
                bind: {
                    store: '{storej}'
                },
                xtype:'alarmTreePagingToolBar',
                reference: 'pagingToolBar',
                listeners : {
                    change : 'onPagingChange'
                }
            },   
        // end 分页
        listeners: {
            itemcontextmenu: 'onItemRightClick',
            selectionchange:'onSelectionChange',
            select:'onSelect',
            deselect:'onDeselect'
        }
    }],
    listeners:{
        activate:'onActivate'
    }
});