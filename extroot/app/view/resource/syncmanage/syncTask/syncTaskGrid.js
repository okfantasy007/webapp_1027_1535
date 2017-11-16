Ext.define('Admin.view.resource.syncmanage.syncTask.syncTaskGrid', {
    extend: 'Ext.form.Panel',
    requires: [
        'Admin.view.base.PagedGrid',
        'Ext.selection.CheckboxModel'
    ],
    xtype: 'syncTaskGrid',
    
    id:'ressyncTaskGrid',
    viewModel: {
        stores: {
            task_grid_store: {
                autoLoad: true,
                pageSize: 50,
                proxy: {
                    type: 'ajax',
                    url: '/resource/syn_task',
                    extraParams: {
                        group_id: 'root'
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty : 'total'
                    },
                }
            },
        }
    },

    controller: {
        refreshGlobalSetting: function() {
            console.log('refreshGlobalSetting');
            var theForm = this.getView().down('form');
            Ext.Ajax.request({
                async:false,
                url:'/resource/syn_task/sync_service_status',
                success: function(response){
                    var r=Ext.decode(response.responseText);
                    if(r.success){
                        theForm.getComponent('p_is_syn_cycle').getComponent('is_syn_cycle')
                        .setValue(r.data[0].res_sync_service_status == 1);
                        theForm.getComponent('p_count').getComponent('res_sync_max_execute_task_count')
                        .setValue(r.data[0].res_sync_max_execute_task_count);
                    }
                },
                failure: function(response, opts) {
                    console.log('syncTaskGrid /sync_service_status failure', response.statusText);
                }
            });
        },

        refreshGrid: function() {
            var syncTaskTree = this.getView().up().up().down('syncTaskTree');
            var treeSelections = syncTaskTree.down('treepanel').getSelection();
            var thePagedGrid = this.getView().down('PagedGrid');

            if(treeSelections.length > 0 && (treeSelections[0].data.id=='root'||treeSelections[0].data.parentId=='root')) {
                console.log('treeSelections[0].data.id', treeSelections[0].data.id);
                thePagedGrid.getStore().proxy.extraParams = {group_id: treeSelections[0].data.id};
            }
            thePagedGrid.getStore().reload();
        },

        onRefresh: function() {
            this.refreshGrid();
            this.refreshGlobalSetting();
        },

        onItemContextMenu: function( self, record, item, index, e, eOpts ) {
            if (index < 0) { return; }

            e.preventDefault();  
            e.stopEvent();
            
            var selections = this.getView().down('PagedGrid').getSelection();
            var hiddenEdit = this.shouldDisableEdit(selections);
            var hiddenDelete = this.isAnyRunningTask(selections);
            var hiddenStartSynTask = hiddenDelete || this.isAnyTaskInvalidOrDisabled(selections);
            var hiddenStopSynTask = this.isAnyTaskNotRunning(selections);
            
            var controller = this;
            Ext.Ajax.request({
                url: 'rest/security/securityManagerCenter/getResAuthorizeOpertion',
                method: 'POST',
                params : {
                    jsonObject: {res_type: record.data.res_type_name, res_id: record.data.res_id, map_hierarchy: record.data.map_hierarchy, create_user: record.data.create_user},
                    funids: ['01040101', '01040102', '01040103', '01040104', '01040105', '01040106'],
                    user: APP.user
                },
                success: function(response){
                    var r = Ext.decode(response.responseText);
                    var result = r.result;
                    if (r.error) {
                        Ext.MessageBox.alert('Message', r.msg);
                    }
                    if (r.success) {
                        var menu = new Ext.menu.Menu();
                        menu.add({
                            text: _("Add"),
                            iconCls:'x-fa fa-plus',
                            disabled: !result['01040101'],
                            handler: function() {
                                controller.onAdd();
                            }
                        }, 
                        {
                            text: _("edit-modify"),
                            iconCls:'x-fa fa-edit',
                            disabled: !result['01040102'],
                            hidden: hiddenEdit,
                            handler: function() {
                                controller.onEdit(record,true);
                            }
                        },
                        {
                            text: _("Delete"),
                            iconCls:'x-fa fa-trash',
                            disabled: !result['01040103'],
                            hidden: hiddenDelete,
                            handler: function() {
                                controller.onDelete();
                            }
                        },
                        {
                            text: _("Start Task Now"),
                            iconCls:'x-fa fa-bolt',
                            disabled: !result['01040104'],
                            handler: function() {
                                controller.onExecTaskNowOnce();
                            }
                        },
                        {   
                            text: _("Start Task"),
                            iconCls:'x-fa fa-play',
                            disabled: !result['01040105'],
                            hidden: hiddenStartSynTask,
                            handler: function() {
                                controller.onStartTask();
                            }
                        },
                        {
                            text: _("Stop Task"),
                            iconCls:'x-fa fa-stop',
                            disabled: !result['01040106'],
                            hidden: hiddenStopSynTask,
                            handler: function() {
                                controller.onStopTask();
                            }
                        });
                        
                        menu.showAt(e.getPoint());
                    }
                },
                failure: function(response, opts) {
                    console.log('syncTaskGrid /getResAuthorizeOpertion failure', response.statusText);
                }
            });
        },

        onAdd: function() { 
            var taskForm = this.getView().up().down('baseTask');
            taskForm.lookupReference('baseForm').getForm().reset();
            taskForm.lookupReference('AlarmSynDevicePanel').getController().initAdd();
            this.getView().up().setActiveItem(taskForm);
        },

        onEdit: function() {
            var taskForm = this.getView().up().down('baseTask');
            taskForm.lookupReference('baseForm').getForm().reset();

            var record = this.getView().down('PagedGrid').getSelectionModel().getSelection()[0];
            taskForm.lookupReference('baseForm').getForm().loadRecord(record);

            var thePI = record.data.TASK_PERIOD_INFO;
            if(thePI == null) { thePI = '';}
            var days = thePI.split(",").map(function(oneDay) {
                return parseInt(oneDay);
            });
            taskForm.lookupReference('res_sync_execute_time_by_week').setValue(days);
            taskForm.lookupReference('isResSyncManagePersist').setValue(record.data.IS_CONTINUAL_SYN==1);

            taskForm.lookupReference('AlarmSynDevicePanel').getController().initEdit(record.get('SYN_TASK_ID'), 
                record.get('CREATE_USER'), 'res_syn_task_area');

            this.getView().up().setActiveItem(taskForm);
        },

        onDelete: function() {
            var grid = this.getView().down('PagedGrid'),
                records = grid.getSelectionModel().getSelection(),
                names = [], ids=[];
                controller = this;

            for (var i in records) {
                console.log('delete... ', records[i].get('TASK_NAME'));
                names.push(records[i].get('TASK_NAME'));
                ids.push(records[i].get('SYN_TASK_ID'));
            }

            Ext.MessageBox.confirm(_('Confirmation'), _('Confirm to delete ') + '<br />' +  names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'ids', value:  ids.join(',')},
                                {xtype: 'hidden', name: 'names', value:  names.join(',')}
                            ]
                        }).getForm().submit({
                            url: '/resource/syn_task/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                controller.refreshGrid();
                                Ext.Msg.alert(_('Success'), action.result.msg);
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Failed'), action.result.msg);
                            }
                        }); 
                    } 
                }
            );
        },
        
        shouldDisableEdit: function(selected) {
            if(selected.length > 1) {
                return true;
            } else {
                console.log('selected[0].data.TASK_STATUS', selected[0].data.TASK_STATUS);
                if(selected[0].data.TASK_STATUS == 1) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        isAnyRunningTask: function(selected) {
            var isAnyRunningTask = false;
            for(var i in selected) {
                if(selected[i].data.TASK_STATUS == 1) {
                    isAnyRunningTask = true;
                    break;
                }
            }
            return isAnyRunningTask;
        },

        isAnyTaskNotRunning: function(selected) {
            var isAnyTaskNotRunning = false;
            for(var i in selected) {
                if(selected[i].data.TASK_STATUS != 1) {
                    isAnyTaskNotRunning = true;
                    break;
                }
            }
            return isAnyTaskNotRunning;
        },

        isAnyTaskInvalidOrDisabled: function(selected) {
            //如果任务状态为 无效，或启动类型为 已禁用，则不能启动
            var flag = false;
            for(var i in selected) {
                if(selected[i].data.TASK_STATUS == 3 || selected[i].data.TASK_START_TYPE == 3) {
                    flag = true;
                    break;
                }
            }
            return flag;
        },

        onSelectionchange: function(me, selected, eOpts) {
            var tb = this.getView().down('toolbar');
            var editBtn = tb.getComponent('theEditBtn');
            var deleteBtn = tb.getComponent('theDeleteBtn');

            if(!selected.length) {
                editBtn.setDisabled(true);
                deleteBtn.setDisabled(true);
                return;
            }

            editBtn.setDisabled(this.shouldDisableEdit(selected));

            deleteBtn.setDisabled(this.isAnyRunningTask(selected));
        },

        onExecTaskNowOnce: function() {
            var records = this.getView().down('PagedGrid').getSelectionModel().getSelection();
            let ids = [], names = [];
            for(let rec of records) {
                ids.push(rec.get('SYN_TASK_ID'));
                names.push(rec.get('TASK_NAME'));
            }

            Ext.create('Ext.form.Panel').getForm().submit({
                url: '/resource/syn_task/execTaskNowOnce',
                params: {
                    taskIDs: ids.join(','),
                    taskNames: names.join(',')
                },
                waitTitle : _('Please wait...'), 
                waitMsg : _('Please wait...'), 
                success: function(form, action) {
                    Ext.Msg.alert(_('Success'), action.result.msg);
                },
                failure: function(form, action) {
                    Ext.Msg.alert(_('Failed'), action.result.msg);
                }
            });
        },

        onStartTask: function(){
            var records = this.getView().down('PagedGrid').getSelectionModel().getSelection();
            let ids = [], names = [];
            for(let rec of records) {
                ids.push(rec.get('SYN_TASK_ID'));
                names.push(rec.get('TASK_NAME'));
            }

            var me = this;
            Ext.create('Ext.form.Panel').getForm().submit({
                url: '/resource/syn_task/startSyncTask',
                params: {
                    taskIDs: ids.join(','),
                    taskNames: names.join(',')
                },
                waitTitle : _('Please wait...'), 
                waitMsg : _('Please wait...'), 
                success: function(form, action) {
                    me.refreshGrid();
                    Ext.Msg.alert(_('Success'), action.result.msg);
                },
                failure: function(form, action) {
                    Ext.Msg.alert(_('Failed'), action.result.msg);
                }
            });
        },

        onStopTask: function(){
            var records = this.getView().down('PagedGrid').getSelectionModel().getSelection();
            let ids = [], names = [];
            for(let rec of records) {
                ids.push(rec.get('SYN_TASK_ID'));
                names.push(rec.get('TASK_NAME'));
            }
            
            var me = this;
            Ext.create('Ext.form.Panel').getForm().submit({
                url: '/resource/syn_task/stopSyncTask',
                params: {
                    taskIDs: ids.join(','),
                    taskNames: names.join(',')
                },
                waitTitle : _('Please wait...'), 
                waitMsg : _('Please wait...'), 
                success: function(form, action) {
                    me.refreshGrid();
                    Ext.Msg.alert(_('Success'), action.result.msg);
                },
                failure: function(form, action) {
                    Ext.Msg.alert(_('Failed'), action.result.msg);
                }
            });
        }    
    },
    
    items:[
    {
        xtype: 'form',
        padding: 5,
        reference: 'startCycleForm',
        visible:false,
        hidden:true,
        layout: 'hbox',
        fieldDefaults: {
            labelWidth: 110,
            anchor: '100%',
            bodyPadding: 10,
        },
       
        items: [{
            xtype: "container",
            flex: 1,
            layout: "fit",
            itemId: 'p_is_syn_cycle',
            items: [{
                xtype: "checkboxfield",
                name:'res_sync_service_status',
                boxLabel: _('Start Period Synchro Service'),
                itemId: 'is_syn_cycle',
                checked : true,
            }]
        }, 
        {
            xtype: "container",
            hidden: true,
            flex: 1,
            layout: "fit",
            itemId: 'p_count',
            items: [{
                xtype:'numberfield',
                name:'res_sync_max_execute_task_count',
                fieldLabel: _('Concurrency Ne Count'),
                itemId:'res_sync_max_execute_task_count',
                minValue: 5,
                maxValue: 20
            }]
        }, 
        {
            xtype: "container",
            layout: "hbox",
            flex: 1,
            items: [
                {
                    xtype: "container",
                    flex: 1
                },
                {
                    xtype: "button",
                    text: _('Save'),
                    iconCls:'x-fa fa-save',
                    handler: function(){
                        var form = this.up('form')
                        if(form.getForm().isValid()){
                            form.getForm().submit({
                                url: '/resource/syn_task/sync_service_status',
                                waitTitle : _('Please wait...'), 
                                waitMsg : _('Please wait...'),  
                                success: function(form, action) {
                                    Ext.Msg.alert(_('success'), _('Successful operation'));                               
                                },
                                failure: function(form, action) {
                                    Ext.MessageBox.alert(_('failure'), _('operation failed'));
                                }
                            });
                        }
                    },
                }]
        }
        ],
        listeners:{
            beforerender:'refreshGlobalSetting'
        }
    },
    {
        xtype: 'PagedGrid',
        columnLines : true,
        multiSelect: true,
        rowLines : true,
        bind: {
            store: '{task_grid_store}',
        },
        columns: [
            { xtype: 'rownumberer', width: 40, sortable: false, align: 'center' }, 
            { text: _('Task name'),  dataIndex: 'TASK_NAME',  width: 100, },
            { text: _('Start type'),  dataIndex: 'TASK_START_TYPE', width: 100, menuDisabled : true ,
                renderer: function (v,m,r){
                    if (v == 1) {
                        return _('Manual');
                    }
                    if (v == 2) {
                        return  _('Automatic');
                    }
                    if(v = 3){
                        return _('Disabled');
                    }
                    
                    return v;
                } 
            },
            { text: _('Task status'),  dataIndex: 'TASK_STATUS', width: 100, menuDisabled : true,
             renderer: function (v,m,r){
                    if (v == 1) {
                       return '<span style="color:green;">' + _('Started') + '</span>';
                    }
                    if (v == 2) {
                        return '<span style="color:red;">' + _('stopped task') + '</span>';
                    }
                    if(v == 3){
                       return '<span style="color:#DAA520;">' + _('Invalid') + '</span>';
                    }
                    
                    return v;
                }  
            },
            { text: _('Task period'),  dataIndex: 'TASK_PERIOD', width: 100, menuDisabled : true ,
                 renderer: function (v,m,r){
                    if (v == 1) {
                        return _('EveryDay');
                    }
                    if (v == 2) {
                        return  _('EveryWeek');
                    }
                    
                    return v;
                }  
            },
            { text: _('Plan run time'),  dataIndex: 'EXECUTE_TIME', width: 100, menuDisabled : true },
            { text: _('Is continue syn'),  dataIndex: 'IS_CONTINUAL_SYN', width: 100, menuDisabled : true,
                 renderer: function (v,m,r){
                    if (v == 0) {
                        return _('No');
                    }
                    if (v == 1) {
                        return  _('Yes');
                    }
                    return v;
                }  
             },
            { text: _('Last execute time'),  dataIndex: 'LAST_EXECUTE_TIME', width: 100, menuDisabled : true },
            { text: _('Create User task'),  dataIndex: 'CREATE_USER', width: 100, menuDisabled : true },
            { text: _('Create time'),  dataIndex: 'CREATE_TIME', width: 100, menuDisabled : true },
            { text: _('Remark task'),  dataIndex: 'REMARK', width: 100, menuDisabled : true },
            // {
            //         xtype: 'actioncolumn',
            //         width: 80,
            //         //flex:1,
            //         text: _('Operation'),
            //         itemId: 'optColumn',
            //         menuDisabled: true,
            //         items: [{
            //             xtype: 'button',
            //             reference:'siglestart',
            //             iconCls: 'x-fa fa-play',
            //             tooltip: _('Start Task'),
            //             // disabled: true,
            //             handler:'onStartSigleTask',
            //             getClass: function(v, meta, rec) {
            //                 if (rec.get('TASK_STATUS') == 1 || rec.get('TASK_STATUS') == 3) {
            //                     return 'x-item-disabled x-fa fa-play';
            //                 } else {
            //                     return 'x-fa fa-play';
            //                 }
            //             },
                        
                        
            //         },
            //         {
            //              iconCls: '',
            //              disabled: true
            //         }, 
            //         {
            //             xtype: 'button',
            //             text: '停止',
            //             iconCls:'x-fa fa-stop',
            //             tooltip: _('Stop Task'),
            //             reference:'siglestop',
            //             // handler:'onStopSigleTask',
            //             handler: function(){
            //                 console.log(111);
            //             },
            //             getClass: function(v, meta, rec) {
            //                 if (rec.get('TASK_STATUS') == 2 || rec.get('TASK_STATUS') == 3) {
            //                     return 'x-item-disabled x-fa fa-stop';
            //                 } else {
            //                     return 'x-fa fa-stop';
            //                 }
            //             },
            //         }
            //         ]
            //     }
            
        ],         
        pagingbarDock: 'top',
        pagingbarDefaultValue: 15,
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
            selectionchange: 'onSelectionchange'
        },

        viewConfig: {
        //Return CSS class to apply to rows depending upon data values
            getRowClass: function (record) {
                if (record.get('SYN_TASK_ID') == 1){
                    return 'syslog_level_' + 3;
                }
            }
        }
    }
    ],
            
    tbar: [
        {

            text: _('Add'),
            iconCls:'x-fa fa-plus',
            hidden: SEC.hidden('01040101'),
            handler: 'onAdd'
        },
        {
            text: _('Edit'),
            reference: 'editButton',  
            iconCls:'x-fa fa-edit',
            hidden: SEC.hidden('01040102'),
            handler: 'onEdit',
            itemId: 'theEditBtn',
            disabled: true
        },
        {
            text: _('Delete'),
            iconCls:'x-fa fa-trash',
            hidden: SEC.hidden('01040103'),
            handler: 'onDelete',
            itemId: 'theDeleteBtn',
            disabled: true
        },
        '->',
        {
            xtype : 'checkboxfield',
            boxLabel : _('Global Parameter Config'),
            hidden: SEC.hidden('01040107'),
            padding : '0 6 0 0',
            listeners : {
                change : function(me, newValue, oldValue, eOpts) {
                    var searchCondationForm = this.up("panel").down("form")
                    searchCondationForm.setVisible(newValue);
                }
            }
        },
        {
            text: _('Refresh'),
            iconCls:'x-fa fa-refresh',
            handler: 'onRefresh'
        },
    ]

});

