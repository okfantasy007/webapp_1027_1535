Ext.define('Admin.view.alarms.AlarmReparExp.AlarmReparExp', {
    // extend: 'Ext.grid.Panel',
    extend: 'Ext.container.Container',
    xtype: 'AlarmReparExp',
    
    requires: [
        'Admin.view.base.PagedGrid',
        'Admin.view.alarms.queryBookMark.BookMarkButton',
        'Admin.view.alarms.AlarmReparExp.addForm',
        'Admin.view.alarms.AlarmReparExp.editForm',
        'Admin.view.alarms.AlarmReparExp.propertyForm'
    ],
    formValues: {},
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/AlarmRepairExp/getRepairExp',
					          extraParams: {condition: '15'},
					          actionMethods : {  
					              create : 'POST',
					              read   : 'POST',
					              update : 'POST',
					              destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
					          },  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'resultSize'
                    }
                }

            },
            uptime2store: {
                fields : ['value', 'text'],
                data : [['0', '<=']]
            },
            uptime1store:{
                fields : ['value', 'text'],
                data : [['0', '>=']]
            }
        }
    },

    controller: {
        onAfterrender: function(){
            var controller = this;
            var grid = this.lookupReference('repairExpGrid');
            document.oncontextmenu = function (event) {
                if(window.location.hash.split('/').length>1&&window.location.hash.split('/')[1]=='exp'&&grid.getPosition()[0]<event.clientX&&grid.getPosition()[1]<event.clientY){
                    event.preventDefault();
                    controller.onItemRightClick("outrange",null,null,null,event);
                }
            }
        },
        onQuery: function(){
			    var grid = this.lookupReference('repairExpGrid');
			    var	form =this.lookupReference('neQueryForm');
                this.getView().formValues = form.getForm().getValues();
                grid.getStore().proxy.extraParams = form.getForm().getValues();
                grid.getStore().proxy.url='/alarm/AlarmRepairExp/queryRepairExp';
			    grid.getStore().reload();  	
        },
        onAdd: function () {
            var alarmReparExp = this.getView();
            var addForm = Ext.create("Admin.view.alarms.AlarmReparExp.addForm",{
                'AlarmReparExp' : alarmReparExp
            });
            addForm.getController().lookupReference('timeTextfield').setValue(Ext.Date.format(new Date(), 'Y-m-d H:i:s'));
            var popWin = this.createPopWindow(addForm);            
            var grid = addForm.down('gridpanel');
            popWin.show();               
        },
        onEdit: function (record,isRightClick) {            
            var editForm = Ext.create("Admin.view.alarms.AlarmReparExp.editForm");
            var grid = editForm.down('gridpanel');
            if(record!=null&&isRightClick==true){
                editForm.down('form').getForm().setValues(record.getData());
                grid.getStore().proxy.extraParams = record.getData();
            }else{
                var selection = this.lookupReference('repairExpGrid').getSelection();
                var record = selection[0];
                editForm.down('form').getForm().setValues(record.getData());
                grid.getStore().proxy.extraParams = record.getData();  
            }           
            var popWin = this.createPopWindow(editForm);
            popWin.show();               
        },
        onSelectionchange: function( me, selected, eOpts ){            
            var selections = this.lookupReference('repairExpGrid').getSelection();
            if(selections.length==0){
                this.lookupReference('removeButton').setDisabled(true);
            }else{
                this.lookupReference('removeButton').setDisabled(false);
            }
            if(selections.length==1){
                this.lookupReference('editButton').setDisabled(false);
                this.lookupReference('propertyButton').setDisabled(false);
            }else{
                this.lookupReference('editButton').setDisabled(true);
                this.lookupReference('propertyButton').setDisabled(true);
            }
        },
        onItemRightClick: function(me, record, tr, index, e, eOpts ) {
            var selections = this.lookupReference('repairExpGrid').getSelection();
            if(me==="outrange"){
                var mainMenu = this.getmainMenu("outrange");
                mainMenu.showAt([e.clientX,e.clientY]);
            }else{
                e.preventDefault();
                e.stopEvent();
                if(selections.length==1){
                    selections[0] = record;
                }
                var mainMenu = this.getmainMenu(selections);
                mainMenu.showAt(e.getXY());
            }//todo
        },
        isShow:function(obj,ischecked){
             if(ischecked){
               this.lookupReference('neQueryForm').setVisible(true); 
                 }else{
               this.lookupReference('neQueryForm').setVisible(false);
                }
        },
        exportExcel:function(fields,values){
            Ext.Ajax.request({
                method:'post',
                url:"alarm_node/export/currentPage?fields=" + Ext.JSON.encode(fields),
                params:{'data': Ext.JSON.encode(values)},
                success:function(response){
                    location.href = "/alarm_node/export/getCurrentPageExcel";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Export Failed'));
                }
            });
        },
        exportAllExcel:function(dataIndex,fields,conditionString){
            Ext.Ajax.request({
                method:'post',
                url:"alarm_node/export/all?fields=" + Ext.JSON.encode(fields) + "&dataIndex=" + Ext.JSON.encode(dataIndex),
                params:{'conditionString':conditionString},
                success:function(response){
                    location.href = "/alarm_node/export/getAllExcel";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Export Failed'));
                }
            });
        },
        getmainMenu: function(selections) {
            var controller = this;
            var disa = false;
            if(selections==="outrange"){
                disa = true;
            }else{
                disa = false;
            }
            var mainMenu = Ext.create('Ext.menu.Menu', {
                //reference: "alarmMainMenu",
                items: [
                {
                    name: 'add',
                    //  icon: 'images/write.gif', //图标文件
                    text: _('Add'),
                    handler: function() {
                        controller.onAdd();
                    }
                },
                {
                    name: 'edit',
                    itemId: 'editItem',
                    disabled: disa,
                    // icon: 'images/write2.gif', //图标文件
                    handler: function() {
                        controller.onEdit(selections[0],true);
                    },
                    text: _('Edit')
                },
                {
                    name: 'delete',
                    disabled: disa,
                    // icon: 'images/write2.gif', //图标文件
                    handler: function() {
                        controller.onRemove(selections,true);
                    },
                    text: _('Delete')
                },
                {
                    name: 'property',
                    disabled: disa,
                    itemId: 'propertyItem',
                    // icon: 'images/write2.gif', //图标文件
                    handler: function() {
                        controller.showProperty(selections[0],true);
                    },
                    text: _('Properties')
                },
                {
                    name: 'export',
                    // icon: 'images/write2.gif', //图标文件
                    // handler: fnDelGoods,
                    text: _('Export'),
                    menu: {
                        //reference: "alarmExport",
                        items: [
                        {                            
                            name: 'exportAll',
                            text: _('exportAll'),
                            handler: function(){
                                controller.onExportAll();
                            }
                        },
                        {
                            name: 'exportCurrent',
                            text: _('exportCurrent'),
                            handler : function() {
                                controller.onExportCurrent();
                            } 
                        },
                        {
                            name: 'exportSelect',
                            text: _('exportSelect'),
                            disabled: disa,
                            handler : function() {
                                controller.onExportSelect();
                            }
                        },
                        ]

                    }
                }]
            });
            if(selections.length>1){
                mainMenu.remove('propertyItem');
                mainMenu.remove('editItem');
            }
            return mainMenu;

        },
        onExportAll:function() {
            var controller = this;
            var repairExpGrid = controller.lookupReference('repairExpGrid');
            var columns = repairExpGrid.getColumns();
            var fields = new Array();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.xtype=='rownumberer'){
                    return;
                }
                fields.push(item.text); 
                dataIndex.push(item.dataIndex);                              
            });
            var form = controller.lookupReference('neQueryForm');
            var values = controller.getView().formValues;
            Ext.Ajax.request({
                method:'post',
                url:"/alarm/AlarmRepairExp/getConditionString",
                params:values,
                success:function(response){
                    controller.exportAllExcel(dataIndex,fields,response.responseText);
                    // location.href = "/alarm_node/export/getCurrentPageExcel";
                    console.log(response.responseText);
                },
                failure: function(response) {
                    Ext.Msg.alert(_('Tips'), _('Export Failed'));
                }
            });
        },
        onExportCurrent:function() {
            var controller = this;
            var repairExpGrid = controller.lookupReference('repairExpGrid');
            var columns = repairExpGrid.getColumns();
            var fields = new Array();
            var dataIndex = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.xtype=='rownumberer'){
                    return;
                }
                fields.push(item.text); 
                dataIndex.push(item.dataIndex);                              
            });
            var store = repairExpGrid.getStore();
            var values = new Array();
            store.each(function(record){
                var value = new Array();
                dataIndex.forEach(function(element){                            
                    value.push(record.get(element));
                });
                values.push(value);                                                      
            });
            controller.exportExcel(fields,values);
        },
        onExportSelect:function() {
            var controller = this;
            var repairExpGrid = controller.lookupReference('repairExpGrid');
            var columns = repairExpGrid.getColumns();
            var dataIndex = new Array();
            var fields = new Array();
            Ext.Array.each(columns,function(item,index,columns){
                if(item.xtype=='rownumberer'){
                    return;
                }
                fields.push(item.text); 
                dataIndex.push(item.dataIndex);                              
            });
            var values = new Array();
            var selections = repairExpGrid.getSelection();
            selections.forEach(function(record){
                var value = new Array();
                dataIndex.forEach(function(element){                            
                    value.push(record.get(element));
                });
                values.push(value);
            });
            controller.exportExcel(fields,values);
        },
        onReset: function() {
            this.lookupReference('neQueryForm').getForm().reset();
            var onRecordTime1 = this.lookupReference('RecordTime1');
            onRecordTime1.setMaxValue(null);
            var onRecordTime2 = this.lookupReference('RecordTime2');
            onRecordTime2.setMinValue(null);
        },

        createPopWindow: function(popItem) {
            var repairExpGrid = this.lookupReference('repairExpGrid');
            var itemName = null;
            var myTitle;
            if(popItem.getId().indexOf('addForm')>=0){
                itemName = 'addForm';
                myTitle = _('Add');
            }else if(popItem.getId().indexOf('editForm')>=0){
                itemName = 'editForm';
                myTitle = _('Edit');
            }else if(popItem.getId().indexOf('propertyForm')>=0){
                itemName = 'propertyForm';
                myTitle = _('Properties');
            }
            var oldValues;
            if(itemName=='editForm'){
                oldValues = popItem.down('form').getValues();
            }
            var popWindow = Ext.create("Ext.window.Window", {
                title: myTitle,
                closable: true,
                autowidth: true,
                autoheight: true,
                border: false,
                layout: 'auto',
                bodyStyle: "padding:20px;",
                items: popItem,
                closeAction: 'hide',
                width: 800,
                height: 600,
                modal:true,
                maximizable: true,
                // minimizable: true,
                buttons: [{
                    xtype: "button",
                    text: _('Confirm'),
                    handler: function() {
                        // var qq = popWindow.containsFocus;
                        if(itemName=='propertyForm'){
                            popWindow.close();
                        }else{
                            var grid = popItem.down('gridpanel');
                            var isEmpty = false;
                            if(grid.getStore().getData().length==0){
                                isEmpty = true;
                                Ext.Msg.alert(_('Error Message'), _('Alarm list can not be empty!') );
                            }
                            if(!isEmpty){
                                if(itemName=='editForm'){
                                    //判断form是否被修改
                                    var deleteSymptoms = popItem.sel2delete;
                                    var addSymptoms = popItem.sel2add;
                                    var form = popItem.down('form');
                                    var formEdited = false;
                                    var newValues = form.getForm().getValues();
                                    for(var i in newValues){
                                        if(newValues[i]!=oldValues[i]){
                                            formEdited = true;
                                            break;
                                        }
                                    }
                                    if(formEdited||deleteSymptoms.length!=0||addSymptoms.length!=0){
                                        var selection = repairExpGrid.getSelection();
                                        var selData = selection[0].getData();
                                        var experienceid = selData.experienceid;
                                        var passValues = newValues;
                                        if(formEdited||deleteSymptoms.length!=0){
                                            var arraySYMPTOMID = new Array();                              
                                            for(var i in deleteSymptoms){
                                                arraySYMPTOMID.push(deleteSymptoms[i].getData().symptomid);
                                            }
                                            passValues = Ext.apply(passValues, {'experienceid': experienceid}, {'symptomid': arraySYMPTOMID});
                                            if(addSymptoms.length==0){
                                                Ext.Ajax.request({
                                                url: '/alarm/AlarmRepairExp/editRepairExp',
                                                method: 'post',
                                                params: passValues,
                                                success: function(response) {
                                                    if (response.responseText) {
                                                        Ext.Msg.alert(_('Success'), _('Modify Successfully'));
                                                        repairExpGrid.getStore().reload();
                                                    }else{
                                                        Ext.Msg.alert(_('Tips'), _('Modify unsuccessfully'));
                                                        repairExpGrid.getStore().reload();
                                                    }
                                                },
                                                    failure : function () {
                                                        Ext.Msg.alert(_('Tips'), _('Modify unsuccessfully'));
                                                        repairExpGrid.getStore().reload();
                                                    }
                                                });                                        
                                                
                                            }

                                        } 
                                        if(addSymptoms.length!=0){
                                            var symptomsMap =Ext.create("Ext.util.HashMap");
                                            var keyArray = new Array("url" ,"strName" ,"strUptime" ,"strLocation" ,"iRCNETypeID" ,"iRCAlarmID" ,"strDeviceName" ,"iRCNetNodeID");
                                            for(var i in keyArray){
                                                symptomsMap.add(keyArray[i],new Array());
                                            }
                                            for(var i in addSymptoms){
                                                symptomsMap.each(function(key,value,length){
                                                var array = this.get(key);
                                                array.push(addSymptoms[i].get(key));
                                                });
                                            }
                                          
                                            passValues = Ext.apply(passValues,symptomsMap.map, {'experienceid': experienceid});
                                            Ext.Ajax.request({
                                                url: '/alarm/AlarmRepairExp/editRepairExp',
                                                method: 'post',
                                                params: passValues,
                                                success: function(response) {
                                                    if (response.responseText) {
                                                    Ext.Msg.alert(_('Success'), _('Modify Successfully'));
                                                        repairExpGrid.getStore().reload();
                                                    }else{
                                                    Ext.Msg.alert(_('Tips'), _('Modify unsuccessfully'));
                                                        repairExpGrid.getStore().reload();
                                                    }
                                                },
                                                failure : function () {
                                                    Ext.Msg.alert(_('Tips'), _('Modify unsuccessfully'));
                                                    repairExpGrid.getStore().reload();
                                                }
                                            });                                                                                       
                                        }
                                    }
                                    popWindow.close();
                                }else if(itemName=='addForm'){
                                    var gridStore = grid.getStore();
                                    var addSymptoms = gridStore.getData();
                                    var form = popItem.down('form');
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
                                                    repairExpGrid.getStore().reload(); 
                                                    }else{
                                                    Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
                                                    repairExpGrid.getStore().reload(); 
                                                    }
                                                },
                                                failure : function () {
                                                    Ext.Msg.alert(_('Tips'), _('Add unsuccessfully'));
                                                    repairExpGrid.getStore().reload();
                                                }
                                            }); 
                                        popWindow.close();
                                    }

                                }
                            }
                        }   
                    }
                },
                {
                    xtype: "button",
                    text: _('Cancel'),
                    handler: function() {
                        popWindow.close();
                    }
                }]
            });
         
            return popWindow;
        },

        showProperty: function(record,isRightClick) {           
            var propertyForm = Ext.create("Admin.view.alarms.AlarmReparExp.propertyForm");
            var grid = propertyForm.down('gridpanel');
            if(record!=null&&isRightClick==true){
                propertyForm.down('form').getForm().setValues(record.getData());
                grid.getStore().proxy.extraParams = record.getData();
            }else{
                var selection = this.lookupReference('repairExpGrid').getSelection();
                var record = selection[0];
                propertyForm.down('form').getForm().setValues(record.getData());
                grid.getStore().proxy.extraParams = record.getData();
            }   
            var alarmPropertyWin = this.createPopWindow(propertyForm);                        
            alarmPropertyWin.show();
        },

        onRemove: function(records,isRightClick) {
            var grid = this.lookupReference('repairExpGrid');
            var selections;
            var array = new Array()
            if(records!=null&&isRightClick==true){
                selections = records;
            }else{
                selections = grid.getSelection();
            }
            for(var i in selections){
                array.push(selections[i].get('experienceid'));
            }
            Ext.Ajax.request({
                url: '/alarm/AlarmRepairExp/deleteRepairExp',
                method: 'post',
                params: {'experienceid': array},
                success: function(response) {
                    if (response.responseText) {
                        Ext.Msg.alert(_('Success'), _('Delete Successfully'));
                        grid.getStore().reload(); 
                    }else{
                        Ext.Msg.alert(_('Tips'), _('Delete unsuccessfully'));
                        grid.getStore().reload(); 
                    }
                },
                failure : function () {
                    Ext.Msg.alert(_('Tips'), _('Delete unsuccessfully'));
                    grid.getStore().reload(); 
                }
            });                        
        },
        
        onRecordTime1: function() {
            this.lookupReference('RecordTime1').reset();
            var onRecordTime2 = this.lookupReference('RecordTime2');
            onRecordTime2.setMinValue(null);
        },
        onRecordTime2: function() {
            this.lookupReference('RecordTime2').reset();
            var onRecordTime1 = this.lookupReference('RecordTime1');
            onRecordTime1.setMaxValue(null);
        },
        onRecordTime1Selected: function(field, value) {
            var onRecordTime2 = this.lookupReference('RecordTime2');
            onRecordTime2.setMinValue(value);
        },
        onRecordTime2Selected: function(field, value) {
            var onRecordTime1 = this.lookupReference('RecordTime1');
            onRecordTime1.setMaxValue(value);
        },
    },

    items: [
	    { 
        title:_('Query Troubleshooting'),
        xtype: 'form',
        reference: 'neQueryForm',
        region:'north',
        iconCls: 'x-fa fa-circle-o',
        //border : false,
        autoWidth : true,
        //autoHeight : true,
        height : 180,
        frame : false,
        autoScroll : true,
        bodyPadding : 20,
        layout:{type:'table',columns:4},

        //visible:false,
        labelAlign : 'right',
        defaultType : 'textfield',
        fieldDefaults : {
            width : 250,
            labelWidth : 90,
            labelAlign : "right",
            margin : 5,
        },
        items : [
        {          
            xtype : 'textfield',
            fieldLabel : _('Fault Cause'),
            name : 'fm_experience.reason'
        },{          
            xtype : 'textfield',
            fieldLabel : _('Solution'),
            name : 'fm_experience.resolve_result'
        },{          
            xtype : 'container',
            layout : 'column',
            width : 400,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('Recording Time'),
                columnWidth : .44,
                name : 'strUptime1',
                bind: {
                    store: '{uptime1store}'
                },
                displayField : 'text',
                valueField : 'value',
                value : '0',
                mode : 'local',
                editable : false
            }, {
                xtype : 'datetimefield',
                reference: 'RecordTime1',
                columnWidth : .49,
                editable : false,
                name : 'fm_experience.record_timeMin',
                listeners: {
                    select: 'onRecordTime1Selected'
                }
            }, {
                xtype: 'button',
                tooltip : _('Reset'),
                columnWidth : .07,
                margin : '5 0 5 0',
                //style :'margin-top:2px;',
                iconCls:'search_reset_bnt',
                handler: 'onRecordTime1'
            }]
        },{
            xtype : 'container',
            layout : 'column',
            width : 400,
            items : [{
                xtype : "combo",
                fieldLabel : _('Recording Time'),
                columnWidth : .44,
                name : 'strUptime2',
                bind: {
                    store: '{uptime2store}'
                },
                displayField : 'text',
                valueField : 'value',
                value : '0',
                mode : 'local',
                editable : false
            }, {
                xtype : 'datetimefield',
                reference: 'RecordTime2',
                columnWidth : .49,
                editable : false,
                name : 'fm_experience.record_timeMax',
                listeners: {
                    select: 'onRecordTime2Selected'
                }
            }, {
                xtype: 'button',
                tooltip : _('Reset'),
                columnWidth : .07,
                margin : '5 0 5 0',
                //style :'margin-top:2px;',
                iconCls:'search_reset_bnt',
                handler: 'onRecordTime2'
            }]
        },{
            xtype : 'textfield',
            fieldLabel : _('Recorder'),
            name : 'fm_experience.recorder'
        },{
            xtype : 'textfield',
            fieldLabel : _('Alarm Name'),
            name : 'fm_symptom.strName'
        },{
            xtype : 'textfield',
            fieldLabel : _('Alarm Source'),
            name : 'fm_symptom.strDeviceName'
        }]
    },
	{
        // title: '网元反转模式',
        header: false,
        xtype: 'PagedGrid',
        iconCls: 'x-fa fa-circle-o',
        reference: 'repairExpGrid',
        autoScroll : true,
        multiSelect: true,
        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}'
        },
        // grid显示字段
        columns: [
                {   xtype: 'rownumberer', width: 60, sortable: true, align: 'center' },
                {
                    text : _('Fault Cause'),
                    dataIndex : 'reason',
                    width : 240,
                    align: 'center',
                    menuDisabled : false
                },{
                    text : _('Solution'),
                    dataIndex : 'resolve_result',
                    width : 240,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Recording Time'),
                    dataIndex : 'record_time',
                    width : 240,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Recorder'),
                    dataIndex : 'recorder',
                    width : 240,
                    align: 'center',
                    menuDisabled : true,
                    flex:1
                }
                ],
        // 分页工具条位置
        //pagingbarDock: 'bottom',
        pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 15,
        // 分页策略
        pagingbarConfig: {
            fields: [{name: 'val', type: 'int'}],
            data: [
                {val: 15},
                {val: 30},
                {val: 60},
                {val: 100},
                {val: 200},
                {val: 500},
                {val: 1000},
                {val: 2000},
            ]
        },

      // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {  
                    xtype:'checkbox',
                    boxLabel:_('Show Query'),  
                    tooltip:_('Show Query'), 
                    checked: true,                      
                    handler:'isShow'
                },{
                    text: _('Query'),
                    iconCls:'x-fa fa-search',
                    handler: 'onQuery',
                    style: {
                        backgroundColor: '#CCFFFF'
                    }
                },{
                    text: _('Reset'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onReset',
                    style: {
                        backgroundColor: '#CCFFFF'
                    }
                },{
                    xtype:'BookMarkButton',
                    iconCls:'x-fa fa-clipboard',
                    containerType: 'AlarmReparExp',
                    formReference: 'neQueryForm',
                    module:'AlarmReparExp',
                    defaultName: _('Troubleshooting--Query')
                },
                '|',
                {  
                    text: _('Export'),
                    iconCls:'x-fa  fa-mail-forward',
                    menu:{
                        items: [
                        {                            
                            name: 'exportAll',
                            text: _('exportAll'),
                            handler: 'onExportAll'
                        },
                        {
                            name: 'exportCurrent',
                            text: _('exportCurrent'),
                            handler : 'onExportCurrent'
                        },
                        {
                            name: 'exportSelect',
                            text: _('exportSelect'),
                            bind: {
                                disabled: '{!repairExpGrid.selection}'
                            },
                            handler : 'onExportSelect'
                        },
                        ]

                    }
                },
                '->',{  
                    text: _('Add'),
                    iconCls:'x-fa  fa-plus-square',
                    handler: 'onAdd',
                },{
                    text: _('Edit'),
                    reference:'editButton',
                    iconCls:'x-fa fa-edit',
                    handler: 'onEdit',
                    disabled: true
                },{
                    text: _('Delete'),
                    reference:'removeButton',
                    iconCls:'x-fa fa-remove',
                    handler: 'onRemove',
                    disabled: true
                },{
                    text: _('Properties'),
                    reference:'propertyButton',
                    iconCls:'x-fa fa-file-text-o',
                    handler: 'showProperty',
                    disabled: true
                }
            ]
        }],

        listeners: {
            selectionchange: 'onSelectionchange',
            rowcontextmenu: 'onItemRightClick',
            afterrender: 'onAfterrender'
        }

    }
]

});



    
    
    
     
    
    
     
