Ext.define('Admin.view.resource.discovery.task.discoveryTaskGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'discoveryTaskGrid',
    reference: 'taskViewGrid',

    viewModel: {
        stores: {
            task_list: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/resource/discovery_task',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    },
                }
            }
        }
    },

    controller: {

        onAdd: function() {
            var grid = this.getView(),
                card = grid.up().up(),
                form = card.down('discoveryTaskForm'),
                formContainer = form.up();
            form.lookupController().clearForm();
            card.setActiveItem( formContainer );
        },

        onEdit: function() {
            var grid = this.getView(),
                record = grid.getSelectionModel().getSelection()[0],
                card = grid.up().up(),
                form = card.down('discoveryTaskForm'),
                formContainer = form.up();
            form.lookupController().onReset();
            form.lookupController().loadFormRecord(record);
            card.setActiveItem( formContainer );
        },

        onDelete: function() {
            var grid = this.getView(),
                records = grid.getSelectionModel().getSelection(),
                names = [], ids=[];

            for (var i in records) {
                console.log('delete... ', records[i].get('display'));
                names.push(records[i].get('display'));
                ids.push(records[i].get('id'));
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
                            url: '/resource/discovery_task/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                grid.store.reload();
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

        onStartTask: function() {
            var grid = this.getView(),
                card = grid.up().up(),
                records = grid.getSelectionModel().getSelection(),
                task_store = grid.getStore(),
                report_grid = grid.up().down('discoveryTaskReportGrid'),
                report_store = report_grid.getStore(),
                names = [], ids=[],
                me = this,
                model = this.getViewModel();

            for (var i in records) {
                console.log('start... ', records[i].get('display'));
                names.push(records[i].get('display'));
                ids.push(records[i].get('id'));
            }

            console.log('report_store.removeAll()');
            report_store.removeAll();
            console.log('report_store.reload()');
            report_store.reload();

            card.taskStarted();

            Ext.create('Ext.form.Panel', {
                items: [ 
                    {xtype: 'hidden', name: 'ids', value:  ids.join(',')},
                    {xtype: 'hidden', name: 'names', value:  names.join(',')}
                ]
            }).getForm().submit({
                url: '/resource/discovery_task/start',
                waitTitle : _('Please wait...'), 
                waitMsg : _('Please wait...'), 
                success: function(form, action) {
                    var tb = grid.down('toolbar');
                    var editBtn = tb.getComponent('theEditBtn');
                    var deleteBtn = tb.getComponent('theDeleteBtn');
                    var startDetectBtn = tb.getComponent('theStartDetectBtn');
                    var stopDetectBtn = tb.getComponent('theStopDetectBtn');

                    editBtn.setDisabled(true);
                    deleteBtn.setDisabled(true);
                    startDetectBtn.setDisabled(true);
                    stopDetectBtn.setDisabled(false);

                    var mqttws_timer = Ext.TaskManager.start({
                        run: function() {
                            if(this.taskRunCount > 300) {
                                Ext.TaskManager.stop(mqttws_timer);
                                card.taskEnded();
                                return;
                            }
                            console.log('taskRunCount', this.taskRunCount);

                            Ext.Ajax.request({
                                url: '/resource/discovery_task/update',

                                success: function(response, opts) {
                                    var recs = Ext.decode(response.responseText);
                                    var task_finish = true;
                                    for (var i in records) {
                                        var taskid = records[i].id;
                                        if(ids.indexOf(taskid) == -1) {
                                            continue;
                                        }
                                        // console.log('consider taskid', taskid);
                                        var record = task_store.getById ( taskid );

                                        record.set( recs[ taskid ], {dirty: false});

                                        if (recs[ taskid ].task_status != 'scaned') {
                                            task_finish = false;
                                        }
                                    }

                                    if (task_finish) {
                                        // grid.getSelectionModel().clearSelections();
                                        editBtn.setDisabled(false);
                                        deleteBtn.setDisabled(false);
                                        startDetectBtn.setDisabled(false);
                                        stopDetectBtn.setDisabled(true);

                                        Ext.TaskManager.stop(mqttws_timer);
                                        card.taskEnded();
                                    }

                                },
                                failure: function(response, opts) {
                                    console.log('/discovery_task/update failure', response.statusText);
                                }
                            });

                        },
                        interval: 1000
                    });
                    me.mqttws_timer = mqttws_timer;

                    Ext.Msg.alert(_('Success'), action.result.msg);
                },

                failure: function(form, action) {
                    Ext.Msg.alert(_('Failed'), action.result.msg);
                }
            });
        },

        onStopTask: function() {
            var grid = this.getView(),
                card = grid.up().up(),
                records = grid.getSelectionModel().getSelection(),
                task_store = grid.getStore();

            var tb = grid.down('toolbar');
            tb.getComponent('theEditBtn').setDisabled(false);
            tb.getComponent('theDeleteBtn').setDisabled(false);
            tb.getComponent('theStartDetectBtn').setDisabled(false);
            tb.getComponent('theStopDetectBtn').setDisabled(true);

            try {
                if(this.mqttws_timer) {
                    Ext.TaskManager.stop(this.mqttws_timer);
                    card.taskEnded();                
                }
            } catch(err) {
                console.log(err);
            }

            var names = [], ids=[];
            for (var i in records) {
                console.log('stop... ', records[i].get('display'));
                names.push(records[i].get('display'));
                ids.push(records[i].get('id'));
            }

            Ext.MessageBox.confirm(_('Confirmation'), _('Confirm to stop ') + '<br />' +  names.join('<br />'),
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'ids', value:  ids.join(',')},
                                {xtype: 'hidden', name: 'names', value:  names.join(',')}
                            ]
                        }).getForm().submit({
                            url: '/resource/discovery_task/stop',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                grid.store.reload();
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

        onRefresh: function() {
            var grid = this.getView();
            grid.getStore().reload();
        },

        onItemDoubleClick: function( me , record , item , index , e , eOpts ) {
            var grid = this.getView(),
                card = grid.up().up(),
                form = card.down('discoveryTaskForm'),
                formContainer = form.up();
            form.lookupController().loadFormRecord(record);
            card.setActiveItem( formContainer );
        },

        onSelectionchange: function(me, selected, eOpts) {
            var tb = this.getView().down('toolbar');
            var editBtn = tb.getComponent('theEditBtn');
            var deleteBtn = tb.getComponent('theDeleteBtn');
            var startDetectBtn = tb.getComponent('theStartDetectBtn');
            var stopDetectBtn = tb.getComponent('theStopDetectBtn');

            if(!selected.length) {
                editBtn.setDisabled(true);
                deleteBtn.setDisabled(true);
                startDetectBtn.setDisabled(true);
                stopDetectBtn.setDisabled(true);
                return;
            }

            if(selected.length > 1) {
                editBtn.setDisabled(true);
            } else {
                if(selected[0].data.task_status == 'scanning') {
                    editBtn.setDisabled(true);
                } else {
                    editBtn.setDisabled(false);
                }
            }

            var isAnyRunningTask = false;
            for(var i in selected) {
                if(selected[i].data.task_status == 'scanning') {
                    isAnyRunningTask = true;
                    break;
                }
            }
            deleteBtn.setDisabled(isAnyRunningTask);
            startDetectBtn.setDisabled(isAnyRunningTask);
            
            var isAnyTaskNotRunning = false;
            for(var i in selected) {
                if(selected[i].data.task_status != 'scanning') {
                    isAnyTaskNotRunning = true;
                    break;
                }
            }
            stopDetectBtn.setDisabled(isAnyTaskNotRunning);
        },
    },

    bind: {
        store: '{task_list}',
    },

    selModel: {
        type: 'checkboxmodel'
    },

    columns: [
        { xtype: 'rownumberer', width: 60, sortable: false, align: 'center' }, 
        { text: _('detect param'), dataIndex: 'display', flex: 3 },
        { text: _('device discovery template'), dataIndex: 'templates_names', flex: 2 },
        { text: _('detect type'), dataIndex: 'scan_type_display', flex: 1 },
        { text: _('detect number'), dataIndex: 'ip_numbers', flex: 1 },
        { text: _('detect start time'), dataIndex: 'start_time_str', flex: 2 },
        { text: _('detect time taken (s)'), dataIndex: 'duration_time', flex: 2 },
        { text: _('detect progress'), dataIndex: 'progress', flex: 2 },
        { 
            text: _('taskStatus'), dataIndex: 'task_status', flex: 1,
            renderer: function(value) { return _(value) }
        },
    ],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [
            {
                text: _('Add'),
                iconCls:'x-fa fa-plus',
                hidden: SEC.hidden('01030101'),
                handler: 'onAdd'
            },
            {
                text: _('Edit'),
                iconCls:'x-fa fa-edit',
                hidden: SEC.hidden('01030102'),
                handler: 'onEdit',
                itemId: 'theEditBtn',
                disabled: true
            },
            {
                text: _('Delete'),
                iconCls:'x-fa fa-trash',
                hidden: SEC.hidden('01030103'),
                handler: 'onDelete',
                itemId: 'theDeleteBtn',
                disabled: true
            },
            '-',
            {
                text: _('start detect'),
                iconCls:'x-fa fa-play',
                hidden: SEC.hidden('01030104'),
                handler: 'onStartTask',
                itemId: 'theStartDetectBtn',
                disabled: true
            },
            {
                text: _('stop detect'),
                iconCls:'x-fa fa-stop',
                hidden: SEC.hidden('01030105'),
                handler: 'onStopTask',
                itemId: 'theStopDetectBtn',
                disabled: true
            },            // {
            //     xtype: 'checkbox',
            //     boxLabel: _('只发现SNMP设备'),
            //     bind: {
            //         value: '{ne_snmp}',
            //     }
            // },

            '->',
            {
                text: _('Refresh'),
                iconCls:'x-fa fa-refresh',
                handler: 'onRefresh'
            }
        ]
    }],

    listeners: {
        itemdblclick: 'onItemDoubleClick',
        selectionchange: 'onSelectionchange'
    }

});
