
Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSynTaskForm', {
    extend: 'Ext.container.Container',
    cls: 'shadow',
    xtype: 'AlarmSynTaskForm',
    action: 'add',
    oldTaskName: '',
    requires: [
        'Admin.view.alarms.AlarmSynMgt.AlarmSynDevicePanel',
        'Admin.view.alarms.AlarmSynMgt.AlarmSynTaskGroup'
    ],

    controller:{
        onReset:function(){
            var taskForm = this.getView();
            if(taskForm.action=='add'){
                this.lookupReference('baseForm').getForm().reset();
                var task_expiry_start_time = this.lookupReference('task_expiry_start_time');
                task_expiry_start_time.setMaxValue(null);
                var task_expiry_end_time = this.lookupReference('task_expiry_end_time');
                task_expiry_end_time.setMinValue(null);
            }else if(taskForm.action=='edit'){
                var AlarmSyncTaskGrid = this.getView().up().down('AlarmSyncTaskGrid');
                AlarmSyncTaskGrid.getController().onEdit();
            }
        },
        onTaskGroup:function(){
            // var baseForm = this.lookupReference('baseForm');
            var taskGroup = Ext.create('Admin.view.alarms.AlarmSynMgt.AlarmSynTaskGroup',{AlarmSynTaskForm: this.getView()});
            taskGroup.startPanel = 'form';
            taskGroup.show();
        },
        onRefresh(){
            var treepanel =this.getView().up('AlarmSyncTaskMainView').down('AlarmSynTaskTree').lookupReference('treepanel');
            treepanel.getStore().reload();
            this.getView().up().down('AlarmSyncTaskGrid').lookupReference('taskGrid').getStore().reload();
        },
        onStartTimeSelected: function(field, value) {
            var task_expiry_end_time = this.lookupReference('task_expiry_end_time');
            task_expiry_end_time.setMinValue(value);
        },
        onEndTimeSelected: function(field, value) {
            var task_expiry_start_time = this.lookupReference('task_expiry_start_time');
            task_expiry_start_time.setMaxValue(value);
        },
        checkMatch: function(node,taskname,controller,oldTaskName){
            var match = false;
            node.eachChild(function(childNode){
                if(childNode.getDepth()==3){
                    if(taskname==childNode.get('text')){
                        if(oldTaskName!=taskname){
                            match = true;
                            Ext.MessageBox.alert(_('input error'), '任务名称重复！');
                            return false;
                        } 
                    }
                }else if(childNode.hasChildNodes()){
                    match = controller.checkMatch(childNode,taskname,controller,oldTaskName);
                    if(match){
                        return false;
                    }
                }
            });
            return match;
        },
        onSubmit:function(){
            var form = this.lookupReference('baseForm');
            var values = form.getValues();
            var controller = this;
            var action = this.getView().action;
            var oldTaskName = this.getView().oldTaskName;
            var taskname_textfield = this.lookupReference('taskname_textfield');
            var AlarmSynDevicePanel = this.lookupReference('AlarmSynDevicePanel');
            var taskname = taskname_textfield.getValue();
            var treepanel = controller.getView().up('AlarmSyncTaskMainView').down('AlarmSynTaskTree').lookupReference('treepanel');
            var rootNode = treepanel.getStore().getData().items[0];
            var match = this.checkMatch(rootNode,taskname,controller,oldTaskName);
            var symbolID = AlarmSynDevicePanel.getController().getAllSymbolID();
            var info = AlarmSynDevicePanel.getController().getAllInfo();
            if(action=='edit'&&(!AlarmSynDevicePanel.getController().hasEdited())){
                info=null;
            }
            if(match){
                return;
            }
            if(form.getForm().isValid()){
                if(action=='add'){
                    controller.lookupReference('create_time_textfield').setValue(Ext.Date.format(new Date(), 'Y-m-d H:i:s'));
                    controller.lookupReference('execute_time_textfield').setValue(Ext.Date.format(new Date(), 'Y-m-d H:i:s'));
                    var task_start_type = values['task_start_type'];
                    var instantStart = values['instantStart'];
                    var start = false;
                    if(task_start_type=='2'){
                        start = true;
                    }
                    form.getForm().submit({
                        url: '/alarm/AlarmSynMgt/addSynTask',
                        params: {'info':Ext.JSON.encode(info)},
                        waitTitle : _('Please wait...'), 
                        waitMsg : _('Please wait...'),  
                        success: function(form, action) {
                            var messageBox = Ext.create('Ext.window.MessageBox', {
                                alwaysOnTop: true,
                                closeAction: 'destroy'
                            }).show({
                                buttons: Ext.Msg.YES,
                                icon: Ext.Msg.INFO,//不放在这里不认
                                title: _('Success'),
                                message: _('Add Successfully')
                            });
                            if(task_start_type=='2'){
                                console.log("@@action.result['msg']:",action.result['msg']);
                                var AlarmSyncTaskGrid = controller.getView().up().down('AlarmSyncTaskGrid');
                                AlarmSyncTaskGrid.getController().startSingleJob(action.result['msg'],instantStart);
                            }else if(task_start_type=='1'&&instantStart=='on'){
                                var AlarmSyncTaskGrid = controller.getView().up().down('AlarmSyncTaskGrid');
                                AlarmSyncTaskGrid.getController().executeSingleJob(action.result['msg']);
                            }else{
                                controller.onRefresh();
                            }
                        },
                        failure: function(form, action) {
                            Ext.MessageBox.alert(_('operation failed'), _('Add unsuccessfully'));
                        }
                    });
                }else if(action=='edit'){
                    var task_status = values['task_status'];
                    var task_start_type = values['task_start_type'];
                    var syn_task_id = values['syn_task_id'];
                    var stop = false;
                    if(task_status=="1"&&task_start_type=="3"){
                        stop = true;
                    }
                    form.getForm().submit({
                        url: '/alarm/AlarmSynMgt/editSynTask',
                        params: {'info':Ext.JSON.encode(info)},
                        waitTitle : _('Please wait...'), 
                        waitMsg : _('Please wait...'),  
                        success: function(form, action) {
                            Ext.Msg.alert(_('Success'), _('Modify Successfully'));
                            if(stop){
                                var AlarmSyncTaskGrid = controller.getView().up().down('AlarmSyncTaskGrid');
                                AlarmSyncTaskGrid.getController().stopSingleJob(syn_task_id);
                            }else{
                                controller.onRefresh();
                            }
                        },
                        failure: function(form, action) {
                            Ext.MessageBox.alert(_('operation failed'), _('Modify unsuccessfully'));
                        }
                    });
                }
                
            }
            
        }

    },

    items:[
    {
        xtype:'form',

        layout:'hbox',
        defaults: {
            anchor: '100%',
            margin: 10,
        },
        items:[
        {
            xtype:'panel',
            flex:1,
             
            items:[
            {
                title: '任务基本信息',
                xtype: 'form',
                reference:'baseForm',
                fieldDefaults: {
                    labelAlign: 'right',
                    labelWidth: 115,
                    msgTarget: 'side'
                },
                items:[
                    {
                        xtype: 'fieldset',
                        title: '任务基本信息',
                        defaults: {
                            anchor: '100%'
                        },
                        items:[
                        {
                            reference:'taskid_textfield',
                            xtype:'textfield',
                            name :'syn_task_id',
                            hidden:true
                        },
                        {
                            xtype:'textfield',
                            name :'task_status',
                            hidden:true
                        },
                        {
                            xtype: 'textfield',
                            name: 'create_user',
                            value: APP.user,
                            hidden:true
                        },
                        {
                            xtype: 'textfield',
                            name: 'create_time',
                            reference:'create_time_textfield',
                            value: Ext.Date.format(new Date(), 'Y-m-d H:i:s'),
                            hidden:true
                        },
                        {
                            xtype: 'textfield',
                            name: 'execute_time',
                            reference:'execute_time_textfield',
                            value: Ext.Date.format(new Date(), 'H:i:s'),
                            hidden:true
                        },
                        {
                            xtype: 'textfield',
                            reference:'taskname_textfield',
                            name: 'task_name',
                            fieldLabel: '任务名称',
                            msgTarget: 'side',
                            allowBlank: false
                        },
                        {
                            xtype: 'combo',
                            name:'task_start_type',
                            editable:false ,
                            fieldLabel: '启动类型',
                            store: {
                                type: 'array',
                                fields: [ 'value', 'task_status' ],
                                data: [
                                    [1,'手动'],
                                    [2,'自动'],
                                    [3,'禁止']
                                ]
                            },
                            valueField:'value',
                            displayField: 'task_status',
                            value: 2,
                            queryMode: 'local',
                            selectOnTab: false,
                        },
                        {
                            xtype : 'fieldcontainer',
                            layout:'hbox',
                            combineErrors: true,
                            msgTarget: 'side',

                            fieldLabel: '任务分组',
                            items:[
                                {
                                    reference:'group_textfield',
                                    xtype:'textfield',
                                    allowBlank: false,
                                    // emptyText: '默认组',
                                    editable:false ,
                                    value: '默认组',
                                    name :'group_name'
                                },
                                {
                                    reference:'groupid_textfield',
                                    xtype:'textfield',
                                    name :'syn_task_group_id',
                                    value: 1,
                                    hidden:true
                                },
                                {
                                    xtype:'button',
                                    text:'选择',
                                    margin: '0 0 0 5',
                                    listeners:{
                                        click:'onTaskGroup'
                                    }
                                }
                            ]
                        },
                        {
                            xtype:'textfield',
                            fieldLabel:'任务说明',
                            name :'remark'
                        }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: '任务周期',
                        collapsible: true,
                        defaults: {
                            anchor: '100%'
                        },
                        items:[{
                            xtype: 'combo',
                            margin: '5 0 10 0',
                            fieldLabel: '任务周期',
                            reference:'cycle',
                            name:'task_period',
                            editable:false,
                            store: {
                                type: 'array',
                                fields: [ 'value','task_cycle' ],
                                data: [
                                    [1,'每天'],
                                    [4,'每2小时'], 
                                    [5,'每4小时'],
                                    [6,'每6小时'],
                                    [7,'每8小时']
                                ]
                            },
                            valueField:'value',
                            displayField: 'task_cycle',
                            value: 4,
                            queryMode: 'local'
                        }                   
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: '任务起止时间',
                        collapsible: true,
                        defaults: {
                            anchor: '100%'
                        },
                        items:[
                            {
                                xtype: 'checkbox',
                                boxLabel: '持续同步',
                                name:'is_continual_syn',
                                reference: 'isContinul',
                                checked: true              
                            },
                            {
                                xtype: 'datefield',
                                format:'Y-m-d',
                                editable:false ,
                                name: 'task_expiry_start_time',
                                reference: 'task_expiry_start_time',
                                fieldLabel: '开始时间',
                                bind:{
                                     readOnly : '{isContinul.checked}'
                                },
                                listeners: {
                                    select: 'onStartTimeSelected'
                                }
                            },
                            {
                                xtype: 'datefield',
                                format:'Y-m-d',
                                editable:false ,
                                name: 'task_expiry_end_time',
                                reference: 'task_expiry_end_time',
                                fieldLabel: '结束时间',
                                bind:{
                                     readOnly: '{isContinul.checked}'
                                },
                                listeners: {
                                    select: 'onEndTimeSelected'
                                }
                            },
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: '任务相关信息',
                        collapsible: true,
                        reference: 'taskInfoItem',
                        defaults: {
                            anchor: '100%',
                            disabled:'true',
                        },

                        items:[
                            {
                                xtype: 'combo',
                                name:'task_status',
                                fieldLabel: '任务状态',
                                store: {
                                    type: 'array',
                                    fields: [ 'value', 'task_status' ],
                                    data: [
                                        [1,'已启动'],
                                        [2,'已停止'],
                                        [3,'失效']
                                    ]
                                },

                                valueField:'value',
                                displayField: 'task_status',
                                queryMode: 'local',
                                selectOnTab: false,
                            },
                            {
                                xtype: 'textfield',
                                fieldLabel:'创建人',
                                name: 'create_user1',
                            },
                            {
                                xtype: 'textfield',
                                fieldLabel:'创建时间',
                                name: 'create_time1',
                            }
                        ]
                    },
                    {
                        xtype: 'checkbox',
                        boxLabel: '立即执行',
                        name:'instantStart',
                        reference: 'instantStart',
                        // hidden:true,
                        checked: true              
                    }
                ]
            }
            ]
        },
        {   
            xtype:'AlarmSynDevicePanel',
            height: '100%',
            flex:1,
            scrollable: true,
            title:'任务资源范围',
            reference: 'AlarmSynDevicePanel'
        }
        ],
        buttons: [
        {
            text: _('Save'),
            iconCls:'x-fa fa-save',
            handler: 'onSubmit',
        },
        {
            text: _('Reset'),
            iconCls:'x-fa fa-undo',
            handler: 'onReset',
        }
        ]
    }

    ],
  

});
