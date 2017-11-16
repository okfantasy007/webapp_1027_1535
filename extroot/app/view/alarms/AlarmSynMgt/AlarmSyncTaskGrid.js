
Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSyncTaskGrid', {
    extend: 'Ext.container.Container',

    requires: [
        'Admin.view.base.PagedGrid',
        'Ext.selection.CheckboxModel'
        // 'Admin.view.alarms.AlarmSynMgt.Numtimepicker',
        // 'Admin.view.alarms.AlarmSynMgt.Timefield'
    ],
    xtype: 'AlarmSyncTaskGrid',
    // width: 300,
    // layout: 'card',
    cls: 'shadow',
    // scrollable: true,
    viewModel: {
        stores: {
            // 远程store
            task_grid_store: {
                // autoLoad: true,
                // 每页显示记录数
                autoLoad: true,
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: 'alarm/AlarmSynMgt/getSynTask',
                    extraParams: {'syn_task_group_id' : 0},
                    actionMethods : {  
                        create : 'POST',
                        read   : 'POST',
                        update : 'POST',
                        destroy: 'POST'   
                        },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty : 'resultSize'
                    },
                }
            },
            comboStore1: {
                fields : ['value', 'text'],
                data : [
                ['=', '='],
                ['<>', '<>'],
                ['LIKE', 'LIKE'],
                ['IS NULL', '为空'],
                ['IS NOT NULL', '不为空']
                ]
            },
            comboStore2: {
                fields : ['value', 'text'],
                data : [
                ['=', '='],
                ['<>', '<>'],
                ['IS NULL', '为空'],
                ['IS NOT NULL', '不为空']
                ]
            },
            comboStore3: {
                fields : ['value', 'text'],
                data : [
                ['=', '='],
                ['>', '>'],
                ['<', '<'],
                ['>=', '>='],
                ['<=', '<='],
                ['<>', '<>'],
                ['BETWEEN', 'BETWEEN'],
                ['IS NULL', '为空'],
                ['IS NOT NULL', '不为空']
                ]
            },
            comboStore4: {
                fields : ['value', 'text'],
                data : [
                ['1', _('未同步')],
                ['2', _('同步中')],
                ['3', _('同步完成')],
                ['4', _('失败')]
                ]
            },
            comboStore5: {
                fields : ['value', 'text'],
                data : [
                ['0', _('用户操作')],
                ['1', _('周期同步任务')],
                ['2', _('管理通道周期恢复')],
                ['3', _('新增网元同步')],
                ['4', _('服务器启动后同步')]
                ]
            },
            task_start_type_store: {
                fields : ['value', 'text'],
                data : [
                ['1', _('手动')],
                ['2', _('自动')],
                ['3', _('已禁用')]
                ]
            },
            task_status_store: {
                fields : ['value', 'text'],
                data : [
                ['1', _('已启动')],
                ['2', _('已停止')],
                ['3', _('失效')]
                ]
            },
            task_period_store: {
                fields : ['value', 'text'],
                data : [
                ['1', _('每天')],
                ['4', _('每2小时')],
                ['5', _('每4小时')],
                ['6', _('每6小时')],
                ['7', _('每8小时')]
                ]
            },
            is_continual_syn_store: {
                fields : ['value', 'text'],
                data : [
                ['0', _('否')],
                ['1', _('是')]
                ]
            }
        },
        data:{
            status:'stop'
        }
        
    },

    controller: {
        onRefresh: function() {
            this.lookupReference('taskGrid').getStore().reload();
            var tree =this.getView().up('AlarmSyncTaskMainView').down('AlarmSynTaskTree').lookupReference('treepanel');
            tree.getStore().reload();
        },
        onExecute_timeComboChange: function( me, newValue, oldValue, eOpts ) {
            var execute_timeField = this.lookupReference('execute_timeField');
            var execute_timeContainer = this.lookupReference('execute_timeContainer');
            if(newValue=='BETWEEN'){
                execute_timeContainer.setHidden(false);
                execute_timeField.setHidden(true);
            }else{
                execute_timeContainer.setHidden(true);
                execute_timeField.setHidden(false);
            }
        },
        onExecute_timeMinSelected: function(field, value, eOpts) {
            var execute_timeMax = this.lookupReference('execute_timeMax');
            execute_timeMax.setMinValue(value);
        },
        onExecute_timeMaxSelected: function(field, value, eOpts) {
            var execute_timeMin = this.lookupReference('execute_timeMin');
            execute_timeMin.setMaxValue(value);
        },
        onLast_execute_timeComboChange: function( me, newValue, oldValue, eOpts ) {
            var last_execute_timeField = this.lookupReference('last_execute_timeField');
            var last_execute_timeContainer = this.lookupReference('last_execute_timeContainer');
            if(newValue=='BETWEEN'){
                last_execute_timeContainer.setHidden(false);
                last_execute_timeField.setHidden(true);
            }else{
                last_execute_timeContainer.setHidden(true);
                last_execute_timeField.setHidden(false);
            }
        },
        onLast_execute_timeMinSelected: function(field, value, eOpts) {
            var last_execute_timeMax = this.lookupReference('last_execute_timeMax');
            last_execute_timeMax.setMinValue(value);
        },
        onLast_execute_timeMaxSelected: function(field, value, eOpts) {
            var last_execute_timeMin = this.lookupReference('last_execute_timeMin');
            last_execute_timeMin.setMaxValue(value);
        },
        onCreate_timeComboChange: function( me, newValue, oldValue, eOpts ) {
            var create_timeField = this.lookupReference('create_timeField');
            var create_timeContainer = this.lookupReference('create_timeContainer');
            if(newValue=='BETWEEN'){
                create_timeContainer.setHidden(false);
                create_timeField.setHidden(true);
            }else{
                create_timeContainer.setHidden(true);
                create_timeField.setHidden(false);
            }
        },
        onCreate_timeMinSelected: function(field, value, eOpts) {
            var create_timeMax = this.lookupReference('create_timeMax');
            create_timeMax.setMinValue(value);
        },
        onCreate_timeMaxSelected: function(field, value, eOpts) {
            var create_timeMin = this.lookupReference('create_timeMin');
            create_timeMin.setMaxValue(value);
        },//task_expiry_start_time
        onTask_expiry_start_timeComboChange: function( me, newValue, oldValue, eOpts ) {
            var task_expiry_start_timeField = this.lookupReference('task_expiry_start_timeField');
            var task_expiry_start_timeContainer = this.lookupReference('task_expiry_start_timeContainer');
            if(newValue=='BETWEEN'){
                task_expiry_start_timeContainer.setHidden(false);
                task_expiry_start_timeField.setHidden(true);
            }else{
                task_expiry_start_timeContainer.setHidden(true);
                task_expiry_start_timeField.setHidden(false);
            }
        },
        onTask_expiry_start_timeMinSelected: function(field, value, eOpts) {
            var task_expiry_start_timeMax = this.lookupReference('task_expiry_start_timeMax');
            task_expiry_start_timeMax.setMinValue(value);
        },
        onTask_expiry_start_timeMaxSelected: function(field, value, eOpts) {
            var task_expiry_start_timeMin = this.lookupReference('task_expiry_start_timeMin');
            task_expiry_start_timeMin.setMaxValue(value);
        },
        onTask_expiry_end_timeComboChange: function( me, newValue, oldValue, eOpts ) {
            var task_expiry_end_timeField = this.lookupReference('task_expiry_end_timeField');
            var task_expiry_end_timeContainer = this.lookupReference('task_expiry_end_timeContainer');
            if(newValue=='BETWEEN'){
                task_expiry_end_timeContainer.setHidden(false);
                task_expiry_end_timeField.setHidden(true);
            }else{
                task_expiry_end_timeContainer.setHidden(true);
                task_expiry_end_timeField.setHidden(false);
            }
        },
        onTask_expiry_end_timeMinSelected: function(field, value, eOpts) {
            var task_expiry_end_timeMax = this.lookupReference('task_expiry_end_timeMax');
            task_expiry_end_timeMax.setMinValue(value);
        },
        onTask_expiry_end_timeMaxSelected: function(field, value, eOpts) {
            var task_expiry_end_timeMin = this.lookupReference('task_expiry_end_timeMin');
            task_expiry_end_timeMin.setMaxValue(value);
        },
        isShow:function(obj,ischecked){
            if(ischecked){
            this.lookupReference('queryTaskForm').setVisible(true); 
            }else{
            this.lookupReference('queryTaskForm').setVisible(false);
            }
        },
        onQuery: function(){
            var grid = this.lookupReference('taskGrid');   
            var form =this.lookupReference('queryTaskForm');
            grid.getStore().proxy.extraParams = form.getForm().getValues();
            grid.getStore().proxy.url='/alarm/AlarmSynMgt/querySynTask';
            grid.getStore().reload();   
        },
        onReset: function() {
            this.lookupReference('queryTaskForm').getForm().reset();
            this.lookupReference('execute_timeMin').setMaxValue(null);
            this.lookupReference('execute_timeMax').setMinValue(null);
            this.lookupReference('last_execute_timeMin').setMaxValue(null);
            this.lookupReference('last_execute_timeMax').setMinValue(null);
            this.lookupReference('create_timeMin').setMaxValue(null);
            this.lookupReference('create_timeMax').setMinValue(null);
            this.lookupReference('task_expiry_start_timeMin').setMaxValue(null);
            this.lookupReference('task_expiry_start_timeMax').setMinValue(null);
            this.lookupReference('task_expiry_end_timeMin').setMaxValue(null);
            this.lookupReference('task_expiry_end_timeMax').setMinValue(null);
        },
        onItemContextMenu: function( self, record, item, index, e, eOpts ) {
            var controller = this;
            var taskGrid = this.lookupReference('taskGrid');
            var selections = taskGrid.getSelection();
            var records = [];
            e.preventDefault();  
            e.stopEvent();
            
            if (index < 0) {
                return;
            }
            var hiddenEdit = true;
            var hiddenStartSynTask = true;
            var hiddenStopSynTask = true;
            var hiddenExecuteNow = true;
            if(selections.length>1){
                records = selections;
                selections.forEach(function(element){
                    if(element.get('task_start_type')!='3'&&element.get('task_status')==1){
                        hiddenStopSynTask = false;
                    }
                    if(element.get('task_start_type')!='3'&&element.get('task_status')==2){
                        hiddenStartSynTask = false;
                    }
                    if(element.get('task_status')!=3){
                        hiddenExecuteNow = false;
                    }
                });
            }else{
                hiddenEdit = false;//task_start_type
                if(record.get('task_start_type')!='3'&&record.get('task_status')==1){
                    hiddenStopSynTask = false;
                }
                if(record.get('task_start_type')!='3'&&record.get('task_status')==2){
                    hiddenStartSynTask = false;
                }
                if(record.get('task_status')!=3){
                    hiddenExecuteNow = false;
                }
                records.push(record);
            }
            var menu = new Ext.menu.Menu();
            menu.add(
            {
                text: _('Refresh'),
                handler: function() {
                    controller.onRefresh();
                }
            },
            {
                text: _("Add"),
                handler: function() {
                    controller.onAdd();
                }
            }, 
            {
                itemId: 'editItem',
                // text: _("edit-modify"),
                text: _('Edit'),
                hidden: hiddenEdit,
                handler: function() {
                    controller.onEdit(record,true);
                }
            },
            {
                text: _("Delete"),
                handler: function() {
                    controller.onDelete(records,true);
                }
            },
            {
                text: _("立即执行"),
                hidden: hiddenExecuteNow,
                handler: function() {
                    controller.onExecuteNow();
                }
            },
            {   
                itemId: 'startSynTaskItem',
                text: _("启动同步任务"),
                hidden: hiddenStartSynTask,
                handler: function() {
                    controller.onStart();
                }
            },
            {
                itemId: 'stopSynTaskItem',
                text: _("停止同步任务"),
                hidden: hiddenStopSynTask,
                handler: function() {
                    controller.onStop();
                }
            });
            
            menu.showAt(e.getPoint());
        },
        onAdd: function() {
            var taskForm = this.getView().up().down('AlarmSynTaskForm');
            taskForm.action = 'add';
            taskForm.oldTaskName = '';
            var form = taskForm.lookupReference('baseForm');
            var taskInfoItem = taskForm.lookupReference('taskInfoItem');
            var instantStart = taskForm.lookupReference('instantStart');
            var AlarmSynDevicePanel = taskForm.lookupReference('AlarmSynDevicePanel');
            AlarmSynDevicePanel.getController().initAdd();
            form.getForm().reset();
            taskInfoItem.setHidden(true);
            instantStart.setHidden(false);
            this.getView().up().setActiveItem(1);  
        },
        onEdit: function(selection,isRightClick) {
            var record;
            if(selection!=null&&isRightClick==true){
                record = selection;
            }else{
                record = this.lookupReference('taskGrid').getSelection()[0]; 
            }
            var taskForm = this.getView().up().down('AlarmSynTaskForm');
            taskForm.action = 'edit';
            taskForm.oldTaskName = record.get('task_name');
            var form = taskForm.lookupReference('baseForm');
            form.getForm().reset();
            var taskInfoItem = taskForm.lookupReference('taskInfoItem');
            var instantStart = taskForm.lookupReference('instantStart');
            var alarmSynDevicePanel = taskForm.lookupReference('AlarmSynDevicePanel');
            alarmSynDevicePanel.getController().initEdit(record.get('syn_task_id'),record.get('create_user'),'alarm_syn_task_area');
            instantStart.setHidden(true);
            taskInfoItem.setHidden(false);
            form.getForm().setValues(record.getData());
            this.getView().up().setActiveItem(1);   
        },
        onDelete: function(selection,isRightClick) {
            var taskGrid = this.lookupReference('taskGrid');
            var records = [];
            var names = [], ids=[];
            var controller = this;
            if(selection!=null&&isRightClick==true){
                records = selection;
            }else{
                records = taskGrid.getSelection(); 
            }
            for (var i in records) {
                if(records[i].get('syn_task_id')=='1'){
                    Ext.Msg.alert(_('Tips'), records[i].get('task_name')+'不能删除，删除失败！');
                    return;
                }
                console.log('delete... ', records[i].get('task_name'));
                names.push(records[i].get('task_name'));
                ids.push(records[i].get('syn_task_id'));
            }

            Ext.MessageBox.confirm(_('Confirmation'), "您选择的任务：<br />" + names.join('<br />') + "<br />将被彻底删除，是否继续？",
                function(btn) {
                    if (btn=='yes') {
                        Ext.Ajax.request({
                            method:'post',
                            url:"/alarm_node/alarm_sync/terminate",
                            params:{'IDs': Ext.JSON.encode(ids)},
                            success:function(response){
                                // if(response.responseText){
                                    console.log("停止任务成功");
                                    Ext.Ajax.request({
                                        method:'post',
                                        url:"/alarm/AlarmSynMgt/deleteSynTask",
                                        params:{'syn_task_id': ids},
                                        success:function(response){
                                            if(response.responseText){
                                                controller.onRefresh();
                                                Ext.Msg.alert(_('Success'), "删除成功！");
                                                console.log(response.responseText);
                                            }else{
                                                Ext.Msg.alert(_('Success'), "删除失败！");
                                            }
                                        },
                                        failure: function(response) {
                                            Ext.Msg.alert(_('Tips'), '删除失败！');
                                        }
                                    });
                                    console.log(response.responseText);
                                // }else{
                                //     controller.onRefresh();
                                //     Ext.Msg.alert(_('Success'), "停止告警同步任务失败！");
                                // }
                            },
                            failure: function(response) {
                                controller.onRefresh();
                                Ext.Msg.alert(_('Tips'), '停止告警同步任务失败yyy！');
                            }
                        });
                         
                    } 
                }
            );
        },
        onStart:function(){
            this.getViewModel().set('status', 'start');
            var controller = this;
            var taskGrid = this.lookupReference('taskGrid');
            var records = taskGrid.getSelection();
            var ids=[];
            for (var i in records) {
                ids.push(records[i].get('syn_task_id'));
            }
            console.log("***********ids:",ids);
            Ext.Ajax.request({
                method:'post',
                url:"/alarm_node/alarm_sync/resume",
                params:{'IDs': Ext.JSON.encode(ids)},
                success:function(response){
                    if(response.responseText){
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "启动告警同步任务成功！");
                        console.log(response.responseText);
                    }else{
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "启动告警同步任务失败！");
                        console.log(response.responseText);
                    }
                },
                failure: function(response) {
                    controller.onRefresh();
                    Ext.Msg.alert(_('Tips'), '启动告警同步任务失败！');
                    console.log(response.responseText);
                }
            });
        },
        startSingleJob: function(id,instantStart) {
            var controller = this;
            var ids=[];
            ids.push(id);
            Ext.Ajax.request({
                method:'post',
                url:"/alarm_node/alarm_sync/resume",
                params:{'IDs': Ext.JSON.encode(ids)},
                success:function(response){
                    if(response.responseText){
                        if(instantStart=='on'){
                            controller.executeSingleJob(ids);
                        }else{
                            controller.onRefresh();
                        }
                        // Ext.Msg.alert(_('Success'), "启动告警同步任务成功！");
                        console.log(response.responseText);
                    }else{
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "启动告警同步任务失败！");
                        console.log(response.responseText);
                    }
                },
                failure: function(response) {
                    controller.onRefresh();
                    Ext.Msg.alert(_('Tips'), '启动告警同步任务失败！');
                    console.log(response.responseText);
                }
            });
        },
        onStop: function() {
            this.getViewModel().set('status', 'stop');
            var controller = this;
            var taskGrid = this.lookupReference('taskGrid');
            var records = taskGrid.getSelection();
            var ids=[];
            for (var i in records) {
                ids.push(records[i].get('syn_task_id'));
            }
            console.log("***********ids:",ids);
            Ext.Ajax.request({
                method:'post',
                url:"/alarm_node/alarm_sync/terminate",
                params:{'IDs': Ext.JSON.encode(ids)},
                success:function(response){
                    if(response.responseText){
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "停止告警同步任务成功！");
                        console.log(response.responseText);
                    }else{
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "停止告警同步任务失败！");
                    }
                },
                failure: function(response) {
                    controller.onRefresh();
                    Ext.Msg.alert(_('Tips'), '停止告警同步任务失败！');
                }
            });
        },
        stopSingleJob: function(id) {
            var controller = this;
            var ids=[];
            ids.push(id);
            Ext.Ajax.request({
                method:'post',
                url:"/alarm_node/alarm_sync/terminate",
                params:{'IDs': Ext.JSON.encode(ids)},
                success:function(response){
                    if(response.responseText){
                        controller.onRefresh();
                        // Ext.Msg.alert(_('Success'), "停止告警同步任务成功！");
                        console.log(response.responseText);
                    }else{
                        Ext.Msg.alert(_('Success'), "停止告警同步任务失败！");
                    }
                },
                failure: function(response) {
                    // controller.onRefresh();
                    Ext.Msg.alert(_('Tips'), '停止告警同步任务失败！');
                }
            });
        },
        onSelectionchange: function(me, selected, eOpts) {
            var editButton = this.lookupReference('editButton');
            var statusTB = this.lookupReference('statusTB');
            if(selected.length!=1){
                editButton.setDisabled(true);
                statusTB.setDisabled(true);
            }else{
                editButton.setDisabled(false);
                statusTB.setDisabled(false);
                var task_status = selected[0].get('task_status');
                if(task_status==1){
                    this.getViewModel().set('status', 'start');
                }else if(task_status==2){
                    this.getViewModel().set('status', 'stop');
                }
            }
        },
        onExecuteNow: function(){
            // Ext.MessageBox.alert(_('Confirmation'),_('立即执行同步任务成功！'));
            var controller = this;
            var taskGrid = this.lookupReference('taskGrid');
            var records = taskGrid.getSelection();
            var ids=[];
            for (var i in records) {
                ids.push(records[i].get('syn_task_id'));
            }
            console.log("***********ids:",ids);
            Ext.Ajax.request({
                method:'post',
                // url:"/alarm_node/alarm_sync/neid/1769",
                url:"/alarm_node/alarm_sync/executeTask",
                params:{'IDs': Ext.JSON.encode(ids)},
                success:function(response){
                    if(response.responseText){
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "立即执行同步任务成功！");
                        console.log(response.responseText);
                    }else{
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "立即执行同步任务失败！");
                    }
                },
                failure: function(response) {
                    controller.onRefresh();
                    Ext.Msg.alert(_('Tips'), '立即执行同步任务失败！');
                }
            });
        },
        executeSingleJob: function(id){
            var controller = this;
            var ids=[];
            ids.push(id);
            Ext.Ajax.request({
                method:'post',
                url:"/alarm_node/alarm_sync/executeTask",
                params:{'IDs': Ext.JSON.encode(ids)},
                success:function(response){
                    if(response.responseText){
                        controller.onRefresh();
                        // Ext.Msg.alert(_('Success'), "立即执行同步任务成功！");
                        Ext.Msg.show({
                            title:_('Success'),
                            message: "立即执行同步任务成功！",
                            buttons: Ext.Msg.YES,
                            icon: Ext.Msg.INFO,
                        });
                        
                        console.log(response.responseText);
                    }else{
                        controller.onRefresh();
                        Ext.Msg.alert(_('Success'), "立即执行同步任务失败！");
                    }
                },
                failure: function(response) {
                    controller.onRefresh();
                    Ext.Msg.alert(_('Tips'), '立即执行同步任务失败！');
                }
            });
        },
        onRowdblclick: function( me, record, element, rowIndex, e, eOpts){
            this.onEdit(record,false);
        }
    },
    
    items: [
    { 
        title:_('Query'),
        xtype: 'form',
        reference: 'queryTaskForm',
        // region:'north',
        hidden:true,
        iconCls: 'x-fa fa-circle-o',
        //border : false,
        autoWidth : true,
        // autoHeight : true,
        height : 270,
        frame : false,
        // autoScroll : true,
        scrollable: true,
        // bodyPadding : '20 500 20 0',
        bodyPadding : '20',
        layout:{type:'table',columns:4},
        //visible:false,
        defaultType : 'container',
        fieldDefaults : {
            labelAlign : "right",
            margin : 5,
        },
        items : [
        {          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('任务名称'),
                columnWidth : .5,
                name : 'task_nameSymbol',
                bind: {
                    store: '{comboStore1}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            },{
                xtype : 'textfield',
                // reference: 'RecordTime1',
                columnWidth : .5,
                name : 'task_name'
            }
            ]
        },{          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('启动类型'),
                columnWidth : .5,
                name : 'task_start_typeSymbol',
                bind: {
                    store: '{comboStore2}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            },{
                xtype : "combo",
                bind: {
                    store: '{task_start_type_store}'
                },
                columnWidth : .5,
                name : 'task_start_type',
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }
            ]
        },{          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('任务状态'),
                columnWidth : .5,
                name : 'task_statusSymbol',
                bind: {
                    store: '{comboStore2}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            },{
                xtype : "combo",
                bind: {
                    store: '{task_status_store}'
                },
                columnWidth : .5,
                name : 'task_status',
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }
            ]
        },{          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('执行周期'),
                columnWidth : .5,
                name : 'task_periodSymbol',
                bind: {
                    store: '{comboStore2}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            },{
                xtype : "combo",
                bind: {
                    store: '{task_period_store}'
                },
                columnWidth : .5,
                name : 'task_period',
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }
            ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
            {
                xtype : "combo",
                fieldLabel : _('计划执行时间'),
                width : 220,
                rowspan: 2,
                name : 'execute_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onExecute_timeComboChange'
                }
            }, {
                xtype : 'sysclockfield',// timefield表单不会提交数据，可以用自己写的Timefield
                reference: 'execute_timeField',
                rowspan: 2,
                width : 230,
                editable : false,
                name : 'execute_time',
            }, {
                xtype : 'container',
                reference : 'execute_timeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'sysclockfield',
                    reference: 'execute_timeMin',
                    fieldLabel : _('Minimum'),
                    width : 230,
                    labelWidth: 50,
                    editable : false,
                    name : 'execute_time_min',
                    listeners: {
                        select: 'onExecute_timeMinSelected'
                    }
                }, {
                    xtype : 'sysclockfield',
                    reference: 'execute_timeMax',
                    editable : false,
                    width : 230,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'execute_time_max',
                    listeners: {
                        select: 'onExecute_timeMaxSelected'
                    }
                }
                ]
            }
            ]
        },{          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('是否持续同步'),
                columnWidth : .5,
                name : 'is_continual_synSymbol',
                bind: {
                    store: '{comboStore2}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }, {
                xtype : "combo",
                bind: {
                    store: '{is_continual_syn_store}'
                },
                columnWidth : .5,
                name : 'is_continual_syn',
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }
            ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
            {
                xtype : "combo",
                fieldLabel : _('最近一次执行时间'),
                width : 220,
                rowspan: 2,
                name : 'last_execute_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onLast_execute_timeComboChange'
                }
            }, {
                xtype : 'datetimefield',
                reference: 'last_execute_timeField',
                rowspan: 2,
                width : 230,
                editable : false,
                name : 'last_execute_time',
            }, {
                xtype : 'container',
                reference : 'last_execute_timeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'datetimefield',
                    reference: 'last_execute_timeMin',
                    fieldLabel : _('Minimum'),
                    width : 230,
                    labelWidth: 50,
                    editable : false,
                    name : 'last_execute_time_min',
                    listeners: {
                        select: 'onLast_execute_timeMinSelected'
                    }
                }, {
                    xtype : 'datetimefield',
                    reference: 'last_execute_timeMax',
                    editable : false,
                    width : 230,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'last_execute_time_max',
                    listeners: {
                        select: 'onLast_execute_timeMaxSelected'
                    }
                }
                ]
            }
            ]
        },{          
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('创建者'),
                columnWidth : .5,
                name : 'create_userSymbol',
                bind: {
                    store: '{comboStore1}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }, {
                xtype : 'textfield',
                columnWidth : .5,
                name : 'create_user'
            }
            ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
            {
                xtype : "combo",
                fieldLabel : _('创建时间'),
                width : 220,
                rowspan: 2,
                name : 'create_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onCreate_timeComboChange'
                }
            }, {
                xtype : 'datetimefield',
                reference: 'create_timeField',
                rowspan: 2,
                width : 230,
                editable : false,
                name : 'create_time',
            }, {
                xtype : 'container',
                reference : 'create_timeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'datetimefield',
                    reference: 'create_timeMin',
                    fieldLabel : _('Minimum'),
                    width : 230,
                    labelWidth: 50,
                    editable : false,
                    name : 'create_time_min',
                    listeners: {
                        select: 'onCreate_timeMinSelected'
                    }
                }, {
                    xtype : 'datetimefield',
                    reference: 'create_timeMax',
                    editable : false,
                    width : 230,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'create_time_max',
                    listeners: {
                        select: 'onCreate_timeMaxSelected'
                    }
                }
                ]
            }
            ]
        },{
            layout : 'column',
            width : 470,
            items : [
            {
                xtype : "combo",
                fieldLabel : _('任务说明'),
                columnWidth : .5,
                name : 'remarkSymbol',
                bind: {
                    store: '{comboStore1}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false
            }, {
                xtype : 'textfield',
                columnWidth : .5,
                name : 'remark'
            }
            ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
            {
                xtype : "combo",
                fieldLabel : _('有效期开始时间'),
                width : 220,
                rowspan: 2,
                name : 'task_expiry_start_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onTask_expiry_start_timeComboChange'
                }
            }, {
                xtype : 'datetimefield',
                reference: 'task_expiry_start_timeField',
                rowspan: 2,
                width : 230,
                editable : false,
                name : 'task_expiry_start_time',
            }, {
                xtype : 'container',
                reference : 'task_expiry_start_timeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'datetimefield',
                    reference: 'task_expiry_start_timeMin',
                    fieldLabel : _('Minimum'),
                    width : 230,
                    labelWidth: 50,
                    editable : false,
                    name : 'task_expiry_start_time_min',
                    listeners: {
                        select: 'onTask_expiry_start_timeMinSelected'
                    }
                }, {
                    xtype : 'datetimefield',
                    reference: 'task_expiry_start_timeMax',
                    editable : false,
                    width : 230,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'task_expiry_start_time_max',
                    listeners: {
                        select: 'onTask_expiry_start_timeMaxSelected'
                    }
                }
                ]
            }
            ]
        },{
            layout:{
                type:'table',
                columns:2
            },
            items : [
            {
                xtype : "combo",
                fieldLabel : _('有效期结束时间'),
                width : 220,
                rowspan: 2,
                name : 'task_expiry_end_timeSymbol',
                bind: {
                    store: '{comboStore3}'
                },
                displayField : 'text',
                valueField : 'value',
                emptyText: '',
                queryMode : 'local',
                editable : false,
                listeners: {
                    change: 'onTask_expiry_end_timeComboChange'
                }
            }, {
                xtype : 'datetimefield',
                reference: 'task_expiry_end_timeField',
                rowspan: 2,
                width : 230,
                editable : false,
                name : 'task_expiry_end_time',
            }, {
                xtype : 'container',
                reference : 'task_expiry_end_timeContainer',
                hidden: true,
                items : [
                {
                    xtype : 'datetimefield',
                    reference: 'task_expiry_end_timeMin',
                    fieldLabel : _('Minimum'),
                    width : 230,
                    labelWidth: 50,
                    editable : false,
                    name : 'task_expiry_end_time_min',
                    listeners: {
                        select: 'onTask_expiry_end_timeMinSelected'
                    }
                },{
                    xtype : 'datetimefield',
                    reference: 'task_expiry_end_timeMax',
                    editable : false,
                    width : 230,
                    fieldLabel : _('Maximum'),
                    labelWidth: 50,
                    name : 'task_expiry_end_time_max',
                    listeners: {
                        select: 'onTask_expiry_end_timeMaxSelected'
                    }
                }
                ]
            }
            ]
        },{
            xtype: 'radiogroup',
            fieldLabel: _('Operator'),
            name : 'queryAssociation',
            items: [
                {boxLabel: _('AND'), inputValue: 1, checked: true},
                {boxLabel: _('OR'), inputValue: 2},
            ]
        }
        ]
    },
    {
        xtype:'panel',
        title: '任务列表',
        iconCls: 'x-fa fa-circle-o',
        scrollable: true,
        items:[
        {
            xtype: 'PagedGrid',
            reference: 'taskGrid',
            // width: 860,
            columnLines : true,
            rowLines : true,
            autoWidth : true,
            autoHeight : true,
            // height: 750,
            border : false,
            multiSelect: true,
            // 绑定到viewModel的属性
            bind: {
                store: '{task_grid_store}'
            },
            // selModel: {
            //     selType: 'checkboxmodel'
            // },
            columns: [
                { xtype: 'rownumberer', width: 50, sortable: false, align: 'center'}, 
                { text: _('任务名称'),  dataIndex: 'task_name', width: 140, menuDisabled : true },
                { text: _('启动类型'),  dataIndex: 'task_start_type', width: 140, menuDisabled : true ,
                    renderer: function (v,m,r){
                        if (v == 1) {
                            return '手动';
                        }
                        if (v == 2) {
                            return  '自动';
                        }
                        if(v == 3){
                            return '已禁用';
                        }
                        
                        return v;
                    } 
                },
                { text: _('任务状态'),  dataIndex: 'task_status', width: 140, menuDisabled : true,
                renderer: function (v,m,r){
                        if (v == 1) {
                            return '已启动';
                        }
                        if (v == 2) {
                            return  '已停止';
                        }
                        if(v == 3){
                            return '失效';
                        }
                        
                        return v;
                    }  
                },
                { text: _('执行周期'),  dataIndex: 'task_period', width: 140, menuDisabled : true,
                renderer: function (v,m,r){
                        if (v == 1) {
                            return '每天';
                        }
                        if (v == 4) {
                            return  '每2小时';
                        }
                        if(v == 5){
                            return '每4小时';
                        }
                        if(v == 6){
                            return '每6小时';
                        }
                        if(v == 7){
                            return '每8小时';
                        }
                        
                        return v;
                    }  
                },
                { text: _('计划执行时间'),  dataIndex: 'execute_time', width: 140, menuDisabled : true },
                { text: _('是否持续同步'),  dataIndex: 'is_continual_syn', width: 140, menuDisabled : true, 
                renderer: function (v,m,r){
                        if (v == 0) {
                            return '否';
                        }
                        if (v == 1) {
                            return  '是';
                        }
                        return v;
                    } 
                },
                { text: _('有效期 '),  dataIndex: 'EXPIRY_TIME', width: 180, menuDisabled : true },
                { text: _('最后一次执行时间 '),  dataIndex: 'last_execute_time', width: 180, menuDisabled : true },
                { text: _('创建者'),  dataIndex: 'create_user', width: 140, menuDisabled : true },
                { text: _('创建时间'),  dataIndex: 'create_time', width: 180, menuDisabled : true },
                { text: _('任务说明'),  dataIndex: 'remark', width: 140, menuDisabled : true },
                { text: _(''),  dataIndex: 'none', flex : 1, menuDisabled : true }
            ],
            pagingbarDock: 'top',
            pagingbarDefaultValue: 15,
           // dock: 'bottom',
            pagingbarConfig: {
                fields: [{name: 'val', type: 'int'}],
                data: [
                    {val: 15},
                    {val: 20},
                    {val: 30},
                    {val: 50},
                    {val: 100}
                ]
            },
            listeners: {
                itemcontextmenu: 'onItemContextMenu',
                // itemclick: 'onItemclick',
                selectionchange: 'onSelectionchange',
                rowdblclick: 'onRowdblclick'
            },
        
        }
        ],
        // 自定义工具条
        dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {
                    text: _('Add'),
                    iconCls:'x-fa fa-plus',
                    handler: 'onAdd'
                },
                {
                    text: _('Edit'),
                    iconCls:'x-fa fa-edit',
                    handler: 'onEdit',
                    reference: 'editButton',  
                    disabled: true        
                            
                },
                {
                    text: _('Delete'),
                    iconCls:'x-fa fa-trash',
                    handler: 'onDelete',
                    bind: {
                        disabled: '{!taskGrid.selection}'
                    }                    
                },
                {
                    text: _('立即执行'),
                    iconCls:'x-fa fa-bolt',
                    handler: 'onExecuteNow'
                },
                '|',
                {
                    xtype:'checkbox',
                    boxLabel:_('Show Query'),  
                    tooltip:_('Show Query'), 
                    checked: false,
                    handler:'isShow'
                },
                {
                    text: _('Query'),
                    iconCls:'x-fa fa-search',
                    handler: 'onQuery'
                },
                {
                    text: _('Reset'),
                    iconCls:'x-fa fa-edit',
                    handler: 'onReset',       
                },
                {
                    text: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onRefresh'
                }
            ]
        },
        {
            xtype: 'toolbar',
            reference: 'statusTB',
            dock: 'top',
            items:[
                  //此处使用hidden属性，其实为两个组件，但是根据情况显示一个
                _('Running status') + ':',
                {
                    text: _('Started'),                
                    iconCls:'x-fa fa-refresh fa-spin',
                    style:{
                        backgroundColor: '#ccff99',
                        border: 'solid 0px',
                    },
                    bind: {
                        hidden: '{status=="stop"}'
                    }, 
                    //margin: '0 40 0 0'
                },   
                {
                    text: _('Stopped'),
                    iconCls:'x-fa fa-square',
                    style:{
                        backgroundColor: '#ff9999',
                        border: 'solid 0px',
                    },
                    bind: {
                        hidden: '{status=="start"}'
                    },       
                },    
                {
                    text: _('Start'),
                    iconCls:'x-fa fa-play',
                    handler: 'onStart',
                    bind: {
                        disabled: '{status=="start"}'
                    },       
                },
                {
                    text: _('Stop'),
                    iconCls:'x-fa fa-stop',
                    handler: 'onStop',
                    bind: {
                        disabled: '{status=="stop"}'
                    } ,
                },
            ]
            
        }],
    }
        
    ]
});

