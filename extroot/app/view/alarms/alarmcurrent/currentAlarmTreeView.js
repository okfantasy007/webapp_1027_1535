/***
*当前告警的树形展示视图
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmTreeView', {
    extend: 'Ext.tree.Panel',
    xtype: 'currentAlarmTreeView',
    requires:[
        'Admin.view.alarms.alarmproperty.propertyAlarmExperienceView',
        'Admin.view.alarms.alarmproperty.alarmPropertyWindow',
        'Admin.view.alarms.alarmcurrent.currentAlarmClearSelectWin',
        'Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin'
    ],
    initComponent:function(){
        this.callParent();
        this.subNeID = 0;
        this.alarm_sec_filter='';
        this.alarm_sec_level='';
        this.alarm_sec_symbols = '';
        this.alarm_update_time=0;
        //定时获取上报的告警
        this.buffer=new Array();
        this.bufferSize=200;
        var me = this;
        this.task={
            interval: 100,      // 100毫秒
            run: function () {
                //console.log('定时100毫秒');
                if(me.buffer.length>0){
                    var node = me.buffer.shift();//拿出数据
                    if(node.symbol_id!=null && (me.alarm_sec_symbols!=null && me.alarm_sec_symbols!='')){
                        var booleanSec = false;
                        if(me.alarm_sec_symbols=='all'){
                            booleanSec=true;
                        }else{
                            var symbolsArray = me.alarm_sec_symbols.split(',');
                            Ext.Array.forEach(symbolsArray,function(str,index,array){ //遍历衍生告警数组
                                if(str==node.symbol_id){
                                    booleanSec=true;
                                }
                            });
                        }
                        if(booleanSec){
                            //对数据及衍生告警进行编辑
                            node.id = node.iRCAlarmLogID;
                            node.text = node.iRCAlarmLogID;
                            node.expanded = true;
                            node.iconCls = 'alarm_main_icon';
                            //告警源位置为告警源名称[]中括号后面的内容
                            if(node.strDeviceName!=null && node.strDeviceName!=''){
                                var zstart = node.strDeviceName.indexOf(']');
                                var location = '';
                                if(zstart>=0){
                                    location = node.strDeviceName.substring(zstart+1);
                                }else{
                                    location = node.strDeviceName;
                                }
                                node.strLocation = location;
                            }
                            if(node.children!=null && node.children.length>0){
                                node.leaf = false;
                                Ext.Array.forEach(node.children,function(str,index,array){ //遍历衍生告警数组
                                    str.id = str.iRCAlarmLogID;
                                    str.text = str.iRCAlarmLogID;
                                    str.iconCls = 'alarm_relation_icon';
                                    //告警源位置
                                    if(str.strDeviceName!=null && str.strDeviceName!=''){
                                        var Locstart = str.strDeviceName.indexOf(']');
                                        var strlocation = '';
                                        if(Locstart>=0){
                                            strlocation = str.strDeviceName.substring(Locstart+1);
                                        }else{
                                            strlocation = str.strDeviceName;
                                        }
                                        str.strLocation = strlocation;
                                    }
                                    str.leaf = true;
                                });
                            }else{
                                node.leaf = true;
                            }
                            //拿到当前告警树的store
                            var currentStore = me.getStore();
                            var root = currentStore.getRootNode();
                            var childnodes = root.childNodes;   
                            if(node.iStatus == 2){//新产生告警
                                //判断实时告警模块中是否已经存在相同的告警,如果存在，则去掉重新添加，可能是主告警延时等待衍生告警后重新的发送；
                                var index = currentStore.findBy(function(record, id) {  
                                    return record.get('iRCAlarmLogID') == node.iRCAlarmLogID;//record.get('strLocation') == node.strLocation && record.get('strName') == node.strName&& record.get('url') == node.url;
                                });
                                var samenode = currentStore.getAt(index);
                                if(samenode!=null){
                                    root.removeChild(samenode);
                                }
                                //topo中实时告警界面
                                if(me.up('realTimeAlarmView')!=null){
                                    var realTimeAlarmView = me.up('realTimeAlarmView');
                                    var topoalarmvview = realTimeAlarmView.getActiveTab();
                                    var dockeditem = topoalarmvview.down('realTimeAlarmDockedItem');
                                    var showlatestalarm = dockeditem.down('checkboxfield').nextSibling();
                                    if(showlatestalarm.checked){
                                        root.insertChild( 0, node);
                                        if(childnodes.length > me.bufferSize){
                                            root.removeChild( root.lastChild );
                                        }
                                    }else{
                                        if(childnodes.length > me.bufferSize){
                                            root.removeChild( root.firstChild );
                                        }
                                        root.appendChild(node);
                                    }
                                    
                                    
                                }//分组中实时告警界面
                                else if(me.up('alarmGroupMonitorView')!=null){
                                    root.insertChild( 0, node);
                                    var pagingbar = me.down('currentAlarmTreeToolBar');
                                    var comtext = pagingbar.down('combobox').value;
                                    if(childnodes.length > comtext){
                                        root.removeChild( root.lastChild );
                                    }
                                }
                                //声音播放：告警声音提示
                                me.lookupController().onSetAlarmSound(node.iLevel,node.iStatus);

                                me.collapseAll();
                            }else if(node.iStatus == 1){//恢复告警
                                var alarmID = node.iRCAlarmLogID;
                                //查找告警
                                var childnode = root.findChild('iRCAlarmLogID' ,alarmID );
                                if(childnode==null && root.hasChildNodes()){
                                    var rootchilds = root.childNodes;
                                    for(var i=0;i<rootchilds.length;i++){

                                        if(rootchilds[i].hasChildNodes()){
                                            childnode = rootchilds[i].findChild('iRCAlarmLogID', alarmID );
                                            if(childnode==null){
                                                continue;
                                            }else{
                                                break;
                                            }
                                        }
                                    }
                                }
                                //清除已恢复的告警
                                if(childnode!=null){
                                    if(node.relation_flag==0){//恢复告警时，衍生告警转为了一般告警
                                        var parentnode = childnode.parentNode;
                                        parentnode.removeChild(childnode);
                                        if(parentnode != root){
                                            if(!parentnode.hasChildNodes()){
                                                parentnode.leaf = true;
                                            }
                                        }
                                    }else{
                                        if(childnode.hasChildNodes()){
                                            var childs = childnode.childNodes;
                                            if(childs!=null && childs.length>0){
                                                for(var i = childs.length - 1; i >= 0; i--) {
                                                    console.log('删除主告警下的衍生告警，id:'+childs[i].iRCAlarmLogID); 
                                                    childnode.removeChild(childs[i]); 
                                                } 
                                            }
                                            root.removeChild(childnode);
                                        }
                                    }
                                }   
                            }

                            //告警统计
                            if(me.up('alarmGroupMonitorView')!=null){
                                var nowdate = new Date(); 
                                if((nowdate.getTime()-me.alarm_update_time)>200){
                                    me.alarm_update_time = nowdate.getTime();
                                    me.down('alarmMonitorDockedItems').lookupController().onAlarmIlevelCount('');
                                }
                                me.up('alarmGroupMonitorView').delaytask.delay(1500);
                            }      
                        }
                    }
                }
            }
        };
    },
    controller: {
        //设置告警声音
        onSetAlarmSound:function(level,iStatus){
            var viewport = this.getView().findParentByType('viewport');
            var model = viewport.lookupViewModel();
            var alarm_sound = model.get('alarm_sound');
            if (alarm_sound && iStatus == 2) {//声音按钮打开，且是新产生告警
                var toolbar = viewport.down('mainHeader').down('toolbar');
                var playButton = toolbar.down('button').nextSibling().nextSibling().nextSibling();
                if (level != "" && level != null) {
                    playButton.setHtml('<audio autoplay name="media" src="audio/Level' + level + '.MP3"></audio>');
                }
            }
        },
        onQuery: function(){
            //var currentView = this.getView();
            var treepanel = this.getView();//this.lookupReference('currentAlarmTree');
            var alarmCheckForm = this.lookupReference('alarmCheckForm');//this.lookupReference('alarmCheckForm');
            var pagingToolBar = this.lookupReference('pagingToolBar');
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
        //重置查询panel中的所有value
        onReset: function() {
            //var treepanel = this.lookupReference('currentAlarmTree');
            var alarmCheckForm = this.lookupReference('alarmCheckForm');
            alarmCheckForm.getForm().reset();
        },
        //打开查询界面
        isShow:function(obj,ischecked){
            var alarmCheckForm = this.lookupReference('alarmCheckForm');
            if(ischecked){
                alarmCheckForm.setHidden(false);
            }else{
                alarmCheckForm.setHidden(true);
            }
        },
        //选中项发生变化时，操作
        onSelectionChange:function( me, selected, eOpts){
            var treepanel = this.getView();
            var currentView = treepanel.up();
            if(currentView!=null){
                currentView.lookupController().onTreeCheckChage();
            }
        },
         //属性窗体
        createPropertyWin: function(rowRecord) {
            //var subneid = this.getView().subNeID;
            var alarmPropertyWin = Ext.create("Admin.view.alarms.alarmproperty.alarmPropertyWindow", {});
            //alarmPropertyWin.lookupController().loadData(rowRecord.data,subneid,'rcalarmlog');
            var treepanel = this.getView();
            var treedata = treepanel.getStore().data;
            var treeroot  = treepanel.getRootNode();

            if(rowRecord.parentNode==treeroot){
                alarmPropertyWin.lookupController().loadCurrentData(rowRecord,treedata.items);
            }else{
                var recodes = rowRecord.parentNode.childNodes;
                alarmPropertyWin.lookupController().loadCurrentData(rowRecord,recodes);
            }
            return alarmPropertyWin;
        },
        //属性按钮
        onProperyTool:function() {
            var treepanel = this.getView();
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
        onItemRightClick: function(view,record,item,index,e) {
            e.preventDefault();  
            e.stopEvent(); 
            var mainMenu = this.getmainMenu(record, view);
            mainMenu.showAt(e.getXY());    
        },
        //导出
        exportExcel:function(dataIndex,values){

            Ext.Ajax.request({
                method:'post',
                url:'alarm/currentAlarm/ExportSelected',
                params:{
                    columns: dataIndex.join(','),
                    ids: values.join(',')
                },
                success:function(response){
                    location.href = "/alarm/currentAlarm/downLoadCsv";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
                }
            });
        },
        //全部导出
        exportAllExcel:function(dataIndex,conditionString){
            var subneid = this.getView().subNeID;
            Ext.Ajax.request({
                method:'post',
                url:'alarm/currentAlarm/ExportAll',
                params:{
                    columns:dataIndex.join(','),
                    condition:conditionString,
                    subneid:subneid
                },
                success:function(response){
                    location.href = "/alarm/currentAlarm/downLoadCsv";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
                }
            });
        },
        //分组全部导出
        exportAllExcelByMonitor:function(dataIndex,conditionString){
            var subneid = this.getView().subNeID;
            Ext.Ajax.request({
                method:'post',
                url:'alarm/Monitor/ExportAll',
                params:{
                    columns:dataIndex.join(','),
                    condition:conditionString,
                    subneid:subneid
                },
                success:function(response){
                    location.href = "/alarm/currentAlarm/downLoadCsv";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
                }
            });
        },
        
        onExportAll:function(){
            var mainview = this.getView().up();
            mainview.lookupController().onExportAll();
        },
        onExportCurrentPage:function(){
            var mainview = this.getView().up();
            mainview.lookupController().onExportCurrentPage();
        },
        onExportSelected:function(){
            var mainview = this.getView().up();
            mainview.lookupController().onExportSelected();
        },
        onExpandAll:function(){
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.expandAll();
        },
        onCloseAll: function() {
            var treepanel = this.lookupReference('currentAlarmTree');
            treepanel.collapseAll();
        },
        //右键菜单
        getmainMenu: function(rowRecord, grid) {
            var controller = this;
            var treepanel = controller.getView();
            var checkeddate = treepanel.getSelection();//getChecked();
            var checkCount = checkeddate.length;
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var mainMenu = Ext.create('Ext.menu.Menu', {
                reference: "alarmMainMenu",
                items: [{
                    name: 'confirmAlarm',
                    itemId:'confirmAlarm',
                    text: _('Confirm Alarm'),
                    iconCls : 'x-fa fa-check-circle',
                    disabled : true,
                    handler: function(){
                        controller.onConfirmAlarm();
                    } 
                },{
                    name: 'unConfirmAlarm',
                    itemId:'unConfirmAlarm',
                    text: _('Cancel Confirm'),
                    iconCls : 'x-fa fa-circle',
                    disabled : true,
                    handler: function(){
                        controller.onUnconfirmAlarm();
                    }
                },{
                    itemId:'clear',
                    name: 'clear',
                    iconCls : 'x-fa fa-minus-circle', //图标文件
                    text: _('Clear'),
                    menu: {   
                        items: [{
                            text : _('Selected Items'),
                            reference : 'alarmSelectClear',
                            itemId: "alarmSelectClear",
                            handler: function(){
                                controller.onClearSelected();
                            },
                            disabled : true
                        },{
                            //'所有同类型',
                            text : _('Same Type'),
                            itemId:'clearSameTypeBtn',
                            handler: function(){
                                controller.onClearSameType();
                            },
                            disabled: true
                        },{
                            //'所有同位置',
                            itemId:'clearSameLocationBtn',
                            text : _('Same Position'),
                            handler: function(){
                                controller.onClearSameLocation();
                            },
                            disabled: true               
                        },{
                            //'所有已确定',
                            itemId:'clearConfirmedBtn',
                            text : _('Confirmed'),
                            handler: function(){
                                controller.onClearConfirmed();
                            }    
                        },{
                            //'全部清除',
                            itemId:'clearAllBtn',
                            text : _('Clear All'),
                            handler: function(){
                                controller.onClearAllAlarm();
                            }
                        },{
                            //'按查询条件清除',
                            itemId:'clearCheckedBtn',
                            text : _('Clear Queried Items'),
                            handler: function(){
                                controller.onClearChecked();
                            }    
                        }]
                    }
                },{
                    name: 'repair',
                    itemId:'repair',
                    text: _('Troubleshooting'),
                    iconCls : 'x-fa fa-wrench',
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
                },{
                    text: _('Filter settings'),
                    disabled : true,
                    itemId:'filterBtn',
                    iconCls: 'x-fa fa-external-link',
                    menu:{
                        items:[{
                            text:_('Level Filtering'),
                            itemId:'filerLevelBtn',
                            disabled: true,
                            handler:function(){
                                controller.onFilteriLevel();
                            }
                        },{
                            text:_('Type Filtering'),
                            itemId:'filterTypeBtn',
                            disabled: true,
                            handler:function(){
                                controller.onFilterType();
                            }
                        },{
                            text:_('Position Filtering'),
                            itemId:'filterLocationBtn',
                            disabled: true,
                            handler:function(){
                                controller.onFilterLocation();
                            }
                        },{
                            text:_('Position & Type'),
                            itemId:'filterTypeLocBtn',
                            disabled: true,
                            handler:function(){
                                controller.onFilterTypeLoc();
                            }
                        }]
                    }
                    
                },/*{
                    text: _('Affection'),
                    disabled : true,
                    itemId:'effectBtn',
                    iconCls: 'toolbar-overflow-list',
                    menu:{
                        items:[{
                            text:'Tunnel',
                            itemId:'tunnelBtn',
                            iconCls: 'x-fa fa-undo',
                            handler: function(){
                                controller.onEffectTunnel();
                            },
                            disabled: true
                        },{
                            text:'pw',
                            itemId:'pwBtn',
                            iconCls: 'x-fa fa-undo',
                            handler: function(){
                                controller.onEffectPw();
                            },
                            disabled: true
                        },{
                            text:_('Business'),
                            itemId:'businessBtn',
                            iconCls: 'x-fa fa-undo',
                            handler: function(){
                                controller.onEffectBusiness();
                            },
                            disabled: true
                        }]
                    }  
                },*/{
                    name: 'property',
                    itemId: "property",
                    iconCls:'x-fa fa-file-text-o', //图标文件
                    handler: function(){
                        controller.onProperyTool();
                    },
                    text: _('Properties'),
                    disabled : true
                },{
                    itemId: "positionBtn",
                    name: 'position',
                    iconCls: 'x-fa fa-map-marker', //图标文件
                    text: _('Localization'),
                    disabled : true,
                    menu: {   
                        items: [{
                            itemId: "topologyLocation",
                            name: 'topologyLocation',
                            text : _('Topological Localization'),
                            disabled : true,
                            handler:function(){
                                controller.onTopologicalLocalization();
                            }
                        },{
                            itemId: "deviceLocation",
                            name: 'deviceLocation',
                            text : _('device Localization'),
                            disabled : true
                        }]
                    } 
                },{
                    itemId:"exportbtn",
                    text: _('Export'),
                    iconCls:'x-fa fa-download',
                    menu: {
                        items: [{
                            name: 'exportAll',
                            text: _('All'),
                            handler:function(){
                                controller.onExportAll();
                            }
                        },{
                            name: 'exportCurrent',
                            text: _('current page'),
                            handler:function(){
                                controller.onExportCurrentPage();
                            }
                        },{
                            name: 'exportSelect',
                            itemId: "exportSelect",
                            text: _('selected'),
                            disabled : true,
                            handler:function(){
                                controller.onExportSelected();
                            }
                        }]
                    }
                }],
            });
            var confirmAlarm = mainMenu.getComponent('confirmAlarm');
            var unConfirmAlarm = mainMenu.getComponent('unConfirmAlarm');
            var repair = mainMenu.getComponent('repair');
            var property = mainMenu.getComponent('property');

            var clear = mainMenu.getComponent('clear');
            var clearItems = clear.getRefItems(''); //alarmSelectClear
            var alarmSelectClear = clearItems[1];
            var clearSameTypeBtn = clearItems[2]; 
            var clearCheckedBtn = clearItems[6]; 
            var clearSameLocationBtn = clearItems[3];
  
            var filterBtn = mainMenu.getComponent('filterBtn');
            var filterItems = filterBtn.getRefItems('');
            var filerLevelBtn = filterItems[1];
            var filterTypeBtn = filterItems[2];
            var filterLocationBtn = filterItems[3];
            var filterTypeLocBtn = filterItems[4];

            //var effectBtn = mainMenu.getComponent('effectBtn');
            //var effectItems = effectBtn.getRefItems('');
            //var tunnelBtn = effectItems[1];
            //var pwBtn = effectItems[2];
            //var businessBtn = effectItems[3];
                        
            var positionBtn = mainMenu.getComponent('positionBtn');
            var positionItems = positionBtn.getRefItems('');
            var topologyLocation = positionItems[1];
            var deviceLocation = positionItems[2];
                        
            var exportbtn = mainMenu.getComponent('exportbtn');
            var exportItems = exportbtn.getRefItems('');
            var exportSelect = exportItems[3];

            var hasUnConfirm=0;
            var hasConfirm = 0;
            for(var i=0;i<checkCount;i++){
                var aStatus = checkeddate[i].get("admin_status");
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
                alarmSelectClear.setDisabled(false);
                filterBtn.setDisabled(false);
                filerLevelBtn.setDisabled(false);
                filterTypeBtn.setDisabled(false);
                filterLocationBtn.setDisabled(false);
                filterTypeLocBtn.setDisabled(false);
                exportSelect.setDisabled(false);
            }else{
                alarmSelectClear.setDisabled(true);
                filterBtn.setDisabled(true);
                filerLevelBtn.setDisabled(true);
                filterTypeBtn.setDisabled(true);
                filterLocationBtn.setDisabled(true);
                filterTypeLocBtn.setDisabled(true);
                exportSelect.setDisabled(true);
                confirmAlarm.setDisabled(true);
                unConfirmAlarm.setDisabled(true);
            }
            if(checkCount==1){
                clearSameTypeBtn.setDisabled(false);
                clearSameLocationBtn.setDisabled(false);
                repair.setDisabled(false);
                //effectBtn.setDisabled(false);
                //tunnelBtn.setDisabled(false);
                //pwBtn.setDisabled(false);
                //businessBtn.setDisabled(false);
                property.setDisabled(false);
                positionBtn.setDisabled(false);
                topologyLocation.setDisabled(false);
                deviceLocation.setDisabled(false);
            }else{
                clearSameTypeBtn.setDisabled(true);
                clearSameLocationBtn.setDisabled(true);
                repair.setDisabled(true);
                //effectBtn.setDisabled(true);
                //tunnelBtn.setDisabled(true);
                //pwBtn.setDisabled(true);
                //businessBtn.setDisabled(true);
                property.setDisabled(true);
                positionBtn.setDisabled(true);
                topologyLocation.setDisabled(true);
                deviceLocation.setDisabled(true);
            }
            
            //在分组监控中不能显示的部分
            var currentView = treepanel.up();
            var alarmGroupMonitorView = treepanel.up('alarmGroupMonitorView');
            var realTimeAlarmView = treepanel.up('realTimeAlarmView');
            if(alarmGroupMonitorView!=null || realTimeAlarmView!=null){
                clearCheckedBtn.setHidden(true);
                //effectBtn.setHidden(true);
            }
            return mainMenu;
        },
        //确认告警
        onConfirmAlarm: function(){
            var treepanel = this.getView();
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            var ids=[];
            var hasUnConfirm=0;
            for(var i=0;i<checkLength;i++){
                var alarmid = checkedDate[i].get("iRCAlarmLogID");
                var adminStatus = checkedDate[i].get("admin_status");
                if(adminStatus==1){
                    hasUnConfirm = 1;
                    break;
                }
                ids.push(alarmid);
            }
            if(hasUnConfirm==0){
            	// Ext.MessageBox.show({ 
            	// 	title: '确认告警',
            	// 	msg: '要显示的内容', 
             //        width: 300,
             //        buttons: Ext.MessageBox.OKCANCEL,
             //        // icon:Ext.MessageBox.INFO,//显示图标
             //        icon: "ic",
             //        multiline: true, //多行情况
             //        fn: callback//这个是Ext专属属性，用来指示处理函数名 
             //    });
                Ext.MessageBox.prompt(_('Confirmation'), _('Ack Log'), callback);
                function callback(id,text) {
                    if (id == 'ok') {
                        Ext.Ajax.request({
                            url : 'alarm/currentAlarm/confirmAlarm',
                            params : {
                                ids : ids.join(','),
                                strAckLog : text
                            },
                            method : 'post',
                            success : function(response) {
                                var r = Ext.decode(response.responseText);
                                if (r.success) {
                                    if(pagingToolBar!=null){
                                        pagingToolBar.getStore().reload();
                                    }else{
                                        treepanel.getStore().reload();
                                    }
                                }else{
                                    Ext.MessageBox.alert('Message', _('Operation Failure!'));
                                }
                            },
                            failure:function(response) {
                                Ext.MessageBox.alert('Message', _('Operation Failure!'));
                            }
                        });
                    }
                }
            }
        },
        //取消确认
        onUnconfirmAlarm: function(){
            var treepanel = this.getView();
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            var ids=[];
            var hasConfirm=0;
            for(var i=0;i<checkLength;i++){
                var alarmid = checkedDate[i].get("iRCAlarmLogID");
                var adminStatus = checkedDate[i].get("admin_status");
                if(adminStatus!=1){
                    hasConfirm = 1;
                    break;
                }
                ids.push(alarmid);
            }
            if(hasConfirm==0){
                Ext.Ajax.request({
                    url : 'alarm/currentAlarm/canUnConfirm',
                    params : {
                        ids : ids.join(',')
                    },
                    method : 'post',
                    success : function(response) {
                        var r = Ext.decode(response.responseText);
                        if (r.success) {
                            var idsData = r.data;
                            Ext.MessageBox.confirm(_('Confirmation'), _('Cancel Confirm'), function(btn) {
                                if (btn == 'yes') {
                                    Ext.Ajax.request({
                                        url : 'alarm/currentAlarm/unconfirmAlarm',
                                        params : {
                                            ids : idsData,
                                        },
                                        method : 'post',
                                        success : function(response) {
                                            var r = Ext.decode(response.responseText);
                                            if (r.success) {
                                                if(pagingToolBar!=null){
                                                    pagingToolBar.getStore().reload();
                                                }else{
                                                    treepanel.getStore().reload();
                                                }
                                            }else{
                                                Ext.MessageBox.alert('Message', _('Operation Failure!'));
                                            }
                                        },
                                        failure:function(response){
                                            Ext.MessageBox.alert('Message', _('Operation Failure!'));
                                        }
                                    });
                                }
                            });
                        }else{
                            Ext.MessageBox.alert('Message', _('Partial alarms do not have permission to cancel confirmation'));
                        }
                    },
                    failure:function(response){
                        Ext.MessageBox.alert('Message', _('Partial alarms do not have permission to cancel confirmation'));
                    }
                });
            }
        },
        //刷新主框架头上的告警统计数
        onSetHeaderAlarmCount:function(){
            var viewport = this.getView().findParentByType('viewport');
            viewport.lookupController().getAlarmCounter();
        },
        //在告警分组时，获取告警统计数，一般在清除后调用
        onSetMonitorAlarmCount:function(){
            var me = this.getView();
            var monitorview = me.up('alarmGroupMonitorView');
            if(monitorview!=null){
                var ruletree = monitorview.down('treepanel');
                var selects = ruletree.getSelection();
                var ruleSql="";
                if(selects.length>0){
                    ruleSql = selects[0].get("am_rule_sql");
                }
                if(ruleSql==null){
                    ruleSql="";
                }
                var monitordockeditems = me.down('alarmMonitorDockedItems');
                monitordockeditems.lookupController().onAlarmIlevelCount(ruleSql);
            }
        },
        //清除选择项
        onClearSelected: function(){
        	var treepanel = this.getView();
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            
            var checkedDate = treepanel.getSelection();
            var checkLength = checkedDate.length;
            var ids=[];
            for(var i=0;i<checkLength;i++){  
               var alarmid = checkedDate[i].get("iRCAlarmLogID");
               ids.push(alarmid);
            }
            var clearSelectedWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearSelectWin');
            clearSelectedWin.lookupController().onLoadData(ids,treepanel,pagingToolBar);
            clearSelectedWin.show();
        },
        //清除同类型
        onClearSameType: function(){
            var subneid = this.getView().subNeID;

        	var treepanel = this.getView();
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;

            if(checkLength==1){
                var alarmtypeID = checkedDate[0].get('alarm_type_id');
                var clearOtherWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin');
                clearOtherWin.lookupController().onLoadData(alarmtypeID,"clearSameType",treepanel,pagingToolBar,subneid);
                clearOtherWin.show();
            }
        },
        //清除同位置
        onClearSameLocation: function(){
            var subneid = this.getView().subNeID;
        	var treepanel = this.getView();
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;

            if(checkLength==1){
                var url = checkedDate[0].get('url');
                var clearOtherWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin');
                clearOtherWin.lookupController().onLoadData(url,"clearSameLocation",treepanel,pagingToolBar,subneid);
                clearOtherWin.show();
            }
        },
        //清除已确定
        onClearConfirmed: function(){
            var subneid = this.getView().subNeID;
            var treepanel = this.getView();
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var clearOtherWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin');
            clearOtherWin.lookupController().onLoadData("","clearConfirmed",treepanel,pagingToolBar,subneid);
            clearOtherWin.show();
        },
        //清除所有
        onClearAllAlarm:function(){
            var subneid = this.getView().subNeID;
            var treepanel = this.getView();
            var controller = this;
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var currentAlarmView = treepanel.up('currentAlarmView');
            var alarmGroupMonitorView = treepanel.up('alarmGroupMonitorView');
    
            if(alarmGroupMonitorView!=null){
                //分组监控中的清除所有是指清除目前规则下的所有告警
                var ruleTreeList = alarmGroupMonitorView.down('treepanel');
                var selectRecode = ruleTreeList.getSelection();
                if(selectRecode.length==0){
                    //当没有选择分组监控的规则时，清除所有
                    var clearOtherWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin');
                    clearOtherWin.lookupController().onLoadData("","clearAllAlarm",treepanel,pagingToolBar,subneid);
                    clearOtherWin.show();
                }else{
                    var ruleId = selectRecode[0].get("am_rule_id");
                    var ruleName= selectRecode[0].get("am_rule_name");
                    var ruleSql = selectRecode[0].get("am_rule_sql");
                    if(ruleSql==null){
                        ruleSql="";
                    }
                    Ext.MessageBox.prompt(_('Confirmation'), _('Please input the clearing log'), callback);
                    function callback(id,text) {
                        if (id == 'ok') {
                            Ext.Ajax.request({
                                url : 'alarm/currentAlarm/clearAlarm?clearType=clearByMonitorRule',
                                params : {
                                    condition : ruleSql,
                                    strClearLog : text,
                                    subneid : subneid
                                },
                                method : 'post',
                                success : function(response) {
                                    var r = Ext.decode(response.responseText);
                                    if (r.success) {
                                        Ext.MessageBox.alert('Message', _('Operation Success!'));
                                        
                                        if(pagingToolBar!=null){
                                            pagingToolBar.getStore().reload();
                                        }else{
                                            treepanel.getStore().reload();
                                        }
                                        controller.onSetHeaderAlarmCount();
                                        controller.onSetMonitorAlarmCount();
                                    }else{
                                        Ext.MessageBox.alert('Message', _('Operation Failure!'));
                                    }
                                }
                            });
                        }
                    }
                }
            }else{
               //当前告警中的清除所有，表示为清除所有
               var clearOtherWin = Ext.create('Admin.view.alarms.alarmcurrent.currentAlarmClearOtherWin');
               clearOtherWin.lookupController().onLoadData("","clearAllAlarm",treepanel,pagingToolBar,subneid);
               clearOtherWin.show();
            }
        },
        //按查询条件清除
        onClearChecked: function(){
            var subneid = this.getView().subNeID;
        	var treepanel = this.getView();
            var controller = this;
            var currentView = treepanel.up(); 
            var pagingToolBar = treepanel.down('currentAlarmTreeToolBar');
            var alarmCheckForm = treepanel.lookupReference('alarmCheckForm');
            var formvalues = JSON.stringify(alarmCheckForm.getForm().getValues());
            Ext.MessageBox.prompt(_('Confirmation'), _('Please input the clearing log:'), callback);
            function callback(id,text) {
                if (id == 'ok') {
                    Ext.Ajax.request({
                        url : 'alarm/currentAlarm/clearAlarm?clearType=clearChecked',
                        params : {
                            condition :formvalues,
                            strClearLog : text,
                            subneid : subneid
                        },
                        method : 'post',
                        success : function(response) {
                            var r = Ext.decode(response.responseText);
                            if (r.success) {
                                Ext.MessageBox.alert('Message', _('Operation Success!'));
                                
                                if(pagingToolBar!=null){
                                    pagingToolBar.getStore().reload();
                                }else{
                                    treepanel.getStore().reload();
                                }
                                controller.onSetHeaderAlarmCount();
                                controller.onSetMonitorAlarmCount();
                            }else{
                                Ext.MessageBox.alert('Message', _('Operation Failure!'));
                            }
                        },
                        failure:function(response){
                            Ext.MessageBox.alert('Message', _('Operation Failure!'));
                        }
                    });
                }
            }
        },
        //查看影响：TUNNEL
        onEffectTunnel: function(){
            
        },
        //查看影响：pw
        onEffectPw: function(){
        	
        },
        //查看影响：业务
        onEffectBusiness: function(){
        	
        },
        //过滤设置-----------------
        //级别过滤
        onFilteriLevel: function(){
            var treepanel = this.getView();
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            var alarmjson="[" ;
            var count = 0;
            var iLevels = new Array("0", "0", "0", "0","0");

            for(var i in checkedDate){
                var alarmLevel = checkedDate[i].get("iLevel");
                if(iLevels[alarmLevel-1]==0){
                    iLevels[alarmLevel-1]=1;
                    alarmjson= alarmjson +"{ alarmLevel:"+alarmLevel+",isUsed:'true', isCorbaFilter:'false', isSaved:'false'},";
                    count=count+1;
                }     
            }
            alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";
            Ext.Ajax.request({
                url : 'alarm/alarmResource/modifyAlarmLevelFilter',
                method:'post',
                params:{condition:alarmjson},
                success : function(response) {
                    var r =  Ext.decode(response.responseText);
                    if(r){
                        Ext.Msg.alert(_('Success'), _('Successfully set up')+count+_('levels of filtering rules'));      
                    }else{
                        Ext.MessageBox.alert(_('Tips'), _('Operation Failure!'));
                    }
                }
            });
        },
        //类型过滤
        onFilterType: function(){
            var treepanel = this.getView();
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            var typeids =[];
            var json="" ;
            var checkfilter="";
            if(checkLength>0){
                for(var i in checkedDate){
                    var alarmLevel = checkedDate[i].get("iLevel");
                    var alarmTypeId = checkedDate[i].get("alarm_type_id");
                    var alarmName = checkedDate[i].get("strName");
                    var alarmUrl = checkedDate[i].get("url");
                    var hasTypeId=0;
                    for(var j in typeids){
                        if(typeids[j]==alarmTypeId){
                            hasTypeId==1;
                            break;
                        }
                    }
                    if(hasTypeId==0){
                        typeids.push(alarmTypeId);
                        json= json  +"{alarmLevel :"+alarmLevel+","+"isUsed :'true', alarmId :"+alarmTypeId+","+" strName:'"+alarmName +"'},"
                        checkfilter = checkfilter+"{iLevel :"+alarmLevel+", alarmTypeId :"+alarmTypeId+", url:'*'},"
                    }
                }
                if(checkfilter!=""){
                    checkfilter="["+checkfilter.substring(0,checkfilter.length-1)+"]";
                }
                if(json!=""){
                    json="["+json.substring(0,json.length-1)+"]";
                }
                
                //判断是否已经存在
                Ext.Ajax.request({
                    url: 'alarm/currentAlarm/checkAlarmLocationTypeFilter',
                    method: 'post',
                    params: {
                        condition: checkfilter
                    },
                    success: function(response) {
                        console.log("112", response.responseText);
                        var r = Ext.decode(response.responseText);
                        if (r.success) {
                            var filterLength = r.data.length;
                            if(filterLength==0){
                                 Ext.Msg.alert(_('Success'), _('already exist'));
                            }else{
                                Ext.Ajax.request({
                                    url: 'alarm/alarmResource/addAlarmTypeFilter',
                                    method: 'post',
                                    params: {
                                        condition: json
                                    },
                                    success: function(response) {
                                        console.log("112", response.responseText);
                                        if (response.responseText) {
                                            Ext.Msg.alert(_('Success'), _('Successfully set up')+filterLength+_('types of filtering rules'));
                                        }else{
                                            Ext.Msg.alert(_('Tips'),_('Operation Failure!'));
                                        }
                                    },
                                    failure: function(response) {
                                        Ext.Msg.alert(_('Tips'),_('Operation Failure!'));
                                    }
                                });  
                            }
                        }else{
                           Ext.Msg.alert(_('Success'), _('already exist')); 
                        }    
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert(_('Tips'), _('Check failure'));    
                    }
                });
            }else{
                Ext.Msg.alert(_('Tips'), _('Please select one item at least for operate!'));
            }
        },
        //位置过滤
        onFilterLocation: function(){
            var treepanel = this.getView();
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            var urls =[];
            if(checkLength>0){
                var alarmFiltCondition="[";
                for(var i in checkedDate){
                    var alarmUrl = checkedDate[i].get("url");
                    var alarmiLevel = checkedDate[i].get("iLevel");
                    var alarmCheckInfo = "{url:'"+alarmUrl+"', alarmTypeId:'-1000', iLevel:'"+alarmiLevel+"'}";
                    var hasTypeId=0;
                    for(var j in urls){
                        if(urls[j]==alarmUrl){
                            hasTypeId==1;
                            break;
                        }
                    }
                    if(hasTypeId==0){
                        urls.push(alarmUrl);
                        alarmFiltCondition=alarmFiltCondition+alarmCheckInfo+",";
                    }
                }
                alarmFiltCondition=alarmFiltCondition.substring(0,alarmFiltCondition.length-1)+"]";
                
                //判断是否已经存在
                Ext.Ajax.request({
                    url: 'alarm/currentAlarm/checkAlarmLocationTypeFilter',
                    method: 'post',
                    params: {
                        condition: alarmFiltCondition//urls.join(','),
                    },
                    success: function(response) {
                        var r = Ext.decode(response.responseText);
                        if (r.success) {
                            var filterLength = r.data.length;
                            if(filterLength==0){
                                 Ext.Msg.alert(_('Success'), _('already exist'));
                            }else{
                                var filtercondition="";
                                for(var il in r.data){
                                    var filterinfo = r.data[il];
                                    if(il==filterLength-1){
                                        filtercondition = filtercondition+"{url:'"+filterinfo.url+"', alarmTypeId:'"+filterinfo.alarmTypeId+"', iLevel:'"+filterinfo.iLevel+"'}";
                                    }else{
                                        filtercondition = filtercondition+"{url:'"+filterinfo.url+"', alarmTypeId:'"+filterinfo.alarmTypeId+"', iLevel:'"+filterinfo.iLevel+"'},";
                                    }
                                }
                                filtercondition = '['+filtercondition+']';
                                //过滤
                                Ext.Ajax.request({
                                    url: 'alarm/currentAlarm/alarmLocationTypeFilter',
                                    method: 'post',
                                    params: {
                                        condition: filtercondition//alarmFiltCondition
                                    },
                                    success: function(response) {
                                        var r = Ext.decode(response.responseText);
                                        if (r.success) {
                                            var rData = r.data;
                                            if(rData!=null){
                                                Ext.Msg.alert(_('Success'), _('Successfully set up')+rData+_('position filter rules'));
                                            }else{
                                                Ext.Msg.alert(_('Success'), _('Successfully set up')+filterLength+_('position filter rules'));
                                            }
                                        }else{
                                            Ext.Msg.alert(_('With Errors'), _('Operation Failure!'));
                                        }
                                    },
                                    failure:function(response){
                                        Ext.Msg.alert(_('With Errors'), _('Operation Failure!'));
                                    }
                                });
                            }
                        }else{ 
                            Ext.Msg.alert(_('Success'), _('already exist'));
                        }
                    },
                    failure:function(response){
                        Ext.Msg.alert(_('Tips'), _('Check failure'));
                    }
                });
            }else{
                 Ext.Msg.alert(_('With Errors'), _('Please select one item at least for operate!') );
            }
        },

        //类型与位置过滤
        onFilterTypeLoc:function(){
            var treepanel = this.getView();
            var checkedDate = treepanel.getSelection();//getChecked();
            var checkLength = checkedDate.length;
            var urls =[];
            if(checkLength>0){
                var alarmFiltCondition="[";
                for(var i in checkedDate){
                    var alarmUrl = checkedDate[i].get("url");
                    var alarmTypeid = checkedDate[i].get("alarm_type_id");
                    var alarmiLevel = checkedDate[i].get("iLevel");
                    var alarmCheckInfo = "{url:'"+alarmUrl+"', alarmTypeId:'"+alarmTypeid+"', iLevel:'"+alarmiLevel+"'}";
                    var hasTypeId=0;
                    for(var j in urls){
                        if(urls[j]==alarmCheckInfo){
                            hasTypeId==1;
                            break;
                        }
                    }
                    if(hasTypeId==0){
                        urls.push(alarmCheckInfo);
                        alarmFiltCondition=alarmFiltCondition+alarmCheckInfo+",";
                    }
                }
                alarmFiltCondition=alarmFiltCondition.substring(0,alarmFiltCondition.length-1)+"]";
                
               //判断是否已经存在
                Ext.Ajax.request({
                    url: 'alarm/currentAlarm/checkAlarmLocationTypeFilter',
                    method: 'post',
                    params: {
                        condition: alarmFiltCondition//urls.join(','),
                    },
                    success: function(response) {
                        var r = Ext.decode(response.responseText);
                        if (r.success) {
                            var filterLength = r.data.length;
                            if(filterLength==0){
                                 Ext.Msg.alert(_('Success'), _('already exist'));
                            }else{
                                var filtercondition="";
                                for(var il in r.data){
                                    var filterinfo = r.data[il];
                                    if(il==filterLength-1){
                                        filtercondition = filtercondition+"{url:'"+filterinfo.url+"', alarmTypeId:'"+filterinfo.alarmTypeId+"', iLevel:'"+filterinfo.iLevel+"'}";
                                    }else{
                                        filtercondition = filtercondition+"{url:'"+filterinfo.url+"', alarmTypeId:'"+filterinfo.alarmTypeId+"', iLevel:'"+filterinfo.iLevel+"'},";
                                    }
                                }
                                filtercondition = '['+filtercondition+']';
                                //过滤
                                Ext.Ajax.request({
                                    url: 'alarm/currentAlarm/alarmLocationTypeFilter',
                                    method: 'post',
                                    params: {
                                        condition: filtercondition//alarmFiltCondition
                                    },
                                    success: function(response) {
                                        var r = Ext.decode(response.responseText);
                                        if (r.success) {
                                            var rData = r.data;
                                            if(rData!=null){
                                                Ext.Msg.alert(_('Success'), _('Successfully set up')+rData+_('position filter rules'));
                                            }else{
                                                Ext.Msg.alert(_('Success'), _('Successfully set up')+filterLength+_('position filter rules'));
                                            }
                                        }else{
                                            Ext.Msg.alert(_('With Errors'), _('Operation Failure!'));
                                        }
                                    },
                                    failure:function(response){
                                        Ext.Msg.alert(_('With Errors'), _('Operation Failure!'));
                                    }
                                });
                            }
                        }else{ 
                            Ext.Msg.alert(_('Success'), _('already exist'));
                        }
                    },
                    failure:function(response){
                        Ext.Msg.alert(_('Tips'), _('Check failure'));
                    }
                });
            }else{
                 Ext.Msg.alert(_('With Errors'), _('Please select one item at least for operate!'));
            }
        },
        onPagingChange: function(me, pagedata, ops) {
            this.getView().up('').lookupController().onPagingChange(me, pagedata, ops);
        },
        //拓扑定位
        onTopologicalLocalization:function(){
            var treepanel = this.getView();
            var checkeddate = treepanel.getSelection();//getChecked();
            var checkCount = checkeddate.length; 
            if(checkCount==1){
                var symbolid = checkeddate[0].get('symbol_id');
                //checkeddate[0].set('checked',false);
                window.location = "#topology/home/" + symbolid;
            }else{
                Ext.MessageBox.alert('Message', _('Can only select one item'));
            }
        },
        onSelect:function( treemodel, record, index, eOpts ){//选中时,显示颜色-浅黄
            if(record.get('admin_status') == 1){
                treemodel.view.getRow(index).style.backgroundColor="#FFEFBB";
            }
        },
        onDeselect:function( treemodel, record, index, eOpts ) {//不选后，显示原色
            if(record.get('admin_status') == 1){
                treemodel.view.getRow(index).style.backgroundColor='#b0b0b0';
            }
        }
    },
    rootVisible : false,
    store:{},
    autoWidth : true,
    autoHeight : true,
    frame : false,
    autoScroll : true,
    lines : true,
    columnLines : true,//是否显示列分割线，默认为false
    rowLines : true,
    disableSelection:false,//是否禁止行选择
    flex : 1,
    split : false,
    animate : true,// 动画效果
    containerScroll : true,
    emptyText : _('Empty'),
    loadMask:true,//加载时有加载的图标
    //checkPropagation: 'down',//树形选择是，down表示选择父节点，子节点也被选，还有both、none、up
    //selType: 'checkboxmodel',
    multiColumnSort:true,
    multiSelect : true,
    viewConfig : {
        forceFit: true,//列宽度自适应
        scrollOffset: 0,//去除最右边空白
        getRowClass : function(record) {
            if (record.get('admin_status') == 1) {
                return 'alarm_col_1';
            }
            return null;
        }
    },
    columns : [{   
        xtype: 'treecolumn',
        dataIndex : 'treecolumn', 
        width: 70, 
        sortable: true, 
        align: 'center', 
        headerCheckbox: true 
    },{
        text : _('Alarm ID'),
        dataIndex : 'iRCAlarmLogID',
        width : 75,
        align: 'center',
        menuDisabled : true
    },{
        text : _('Alarm Level'),
        dataIndex : 'iLevel',
        width : 95,
        menuDisabled : true,
        align: 'center',
        renderer: function getColor(v,m,r){
            //if (r.get('admin_status') != 1) {
                m.tdCls = 'alarm_bk_'+ r.get('iLevel');
            //}
            if (v == 1) {
                return  _('Critical');
            }else if (v == 2) {
                return  _('Major');
            }else if (v == 3) {
                return  _('Minor');
            }else if (v == 4) {
                return  _('Warning Alarm');
            }else if (v == 5) {
                return  _('Unknown Alarm');
            }else{
                return v;
            }
            
        }
    }, {
        text : _('Alarm Name'),
        dataIndex : 'strName',
        width : 180,
        menuDisabled : true
    }, {
        text : _('Alarm Description'),
        dataIndex : 'strDesc',
        width : 100,
        menuDisabled : true
    },{
        text : _('First Report Time'),
        dataIndex : 'strUptime',
        width : 150,
        menuDisabled : true
    },{
        //最近一次上报时间
        text : _('Last Report Time'),
        dataIndex : 'strLastTime',
        width : 150,
        menuDisabled : true,
        hidden: true
    },{
        text : _('Alarm Source Name'),
        dataIndex : 'strDeviceName',
        width : 120,
        menuDisabled : true
    }, {
        text : _('Alarm Src Location'),
        dataIndex : 'strLocation',
        width : 120,
        menuDisabled : true
    },{
        text : _('Alarm Source Type'),
        dataIndex : 'alarm_source_type',
        width : 150,
        menuDisabled : true,
        hidden: true,
        renderer: function getalarmSourceType(v){
            if(v==1){
                return _(' NE');
            }else if (v==2) {
                return _('Chassis');
            }else if(v==3){
                return _('Card');
            }else if (v==4) {
                return _('Port');
            }else if(v==5){
                return _('TimeSlot');
            }else if (v==6) {
                return _('Power');
            }else if (v==7) {
                return _('Fan');
            }else{
                return v; 
            }
        }
    }, {
        text : _('IP Address'),
        dataIndex : 'strIPAddress',
        width : 100,
        menuDisabled : true
    }, {
        text : _('Device Type'),
        dataIndex : 'netype_display_name',
        width : 100,
        menuDisabled : true
    },{
        text : _('Alarm Category'),
        dataIndex : 'alarm_event_type',
        width : 150,
        menuDisabled : true,
        hidden: true,
        renderer: function getIstatus(v){
            if(v==0){
                return _('unknown');
            }else if (v==1) {
                return _('Revertive');
            }else if (v==2) {
                return _('Fault');
            }else if (v==3) {
                return _('Notify');
            }else{
                return v;
            }
        }
    }, {
        text : _('Alarm Status'),
        dataIndex : 'iStatus',
        width : 100,
        menuDisabled : true,
        renderer: function getIstatus(v){
            if(v==1){
                return _('Recovered');
            }else if (v==2) {
                return _('New Come');
            }else{
                return v;
            }
            
        }
    }, {
        text : _('Operation Status'),
        dataIndex : 'admin_status',
        width : 110,
        menuDisabled : true,
        renderer: function getIstatus(v){
            if(v==1){
                return _('Acknowledged');//Confirmation
            }else if (v==0) {
                return _('Not Acknowledged');
            }else{
                return v;
            }
        }
    },/*{
        text : 'alarmtypeID',
        dataIndex : 'alarm_type_id',
        width : 150,
        menuDisabled : true,
        hidden: true
    },*/{
        text : _('Alarm URL'),
        dataIndex : 'url',
        width : 150,
        menuDisabled : true,
        hidden: true
    },{
        //'告警历时'
        text : _('Lasting Time'),
        dataIndex : 'lasting_time',
        width : 150,
        menuDisabled : true,
        hidden: true,
    },{   
        text : _('Alarm Count'),
        dataIndex : 'iObject',
        width : 150,
        menuDisabled : true,
        hidden: true
    },{
        text : _('Local Alarm'),
        dataIndex : 'is_local',
        width : 150,
        menuDisabled : true,
        hidden: true,
        renderer: function getIslocal(v){
            if(v==0){
                return _('Remote');//"远端";
            }else if(v==1){
                 return _('Local');//"局端";
            }else{
                return v;
            }
        }
    },{
        text : _('Is Affect Service'),
        dataIndex : 'is_affect_service',
        width : 150,
        menuDisabled : true,
        hidden: true,
        renderer: function getIsAffectService(v){
            if(v==0){
                return _('Not affect');
            }else if(v==1){
                return _('Affect');
            }else if(v==2){
                return _('Lead to service interruption');
            }else{
                return v;
            }
        }
    },{
        text : _('Ack User'),//告警确认人员，操作者
        dataIndex : 'strUserName',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Ack Host'),//告警确认主机
        dataIndex : 'strackhost',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Ack Log'),//告警确认日志
        dataIndex : 'strAckLog',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Ack Time'),//告警确认时间
        dataIndex : 'strAckTime',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Clear Operator'),//告警清除人员
        dataIndex : 'clear_user',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Clearing Log'),//告警清除日志
        dataIndex : 'strClearLog',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Clearing Time'),//告警清除时间
        dataIndex : 'strClearTime',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Tenant'),//客户，目前是租户
        dataIndex : 'cus_name',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Response Time'),//响应时间
        dataIndex : 'responding_time',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true,
    },{
        text : _('Processing Time'),//处理时长
        dataIndex : 'processing_time',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true,
    },{
        text : _('Fault Cause'),//故障原因
        dataIndex : 'fault_reason_name',
        width : 150,
        menuDisabled : true,
        flex : 1,
        hidden: true
    },{
        text : _('Gateway Name'),
        dataIndex : 'gateway_name',
        width : 150,
        menuDisabled : true,
        flex:1
    }],
    listeners: {
        itemcontextmenu: 'onItemRightClick',
        selectionchange:'onSelectionChange',
        select:'onSelect',
        deselect:'onDeselect'
    }
});