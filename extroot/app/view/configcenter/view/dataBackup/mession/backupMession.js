Ext.define('Admin.view.configcenter.view.dataBackup.mession.backupMession', {
    extend: 'Ext.container.Container',
    xtype: 'backupMession',
    requires: [ //mession/equipment
        'Admin.view.configcenter.controller.dataBackupMessionTab1Controller',
        'Admin.view.configcenter.controller.dataBackupMessionTab2Controller',
        'Admin.view.configcenter.store.exportType',
        'Admin.view.configcenter.view.dataBackup.mession.equipment.relatedNe',
        'Admin.view.configcenter.view.dataBackup.mession.veneer.relatedCard',
    ],
    cls: 'shadow',
    viewModel: {
        data: {
            task: 'task'
        }
    },
    controller: {

    },
    listeners: {
        // activate: "taskPolling",
        // deActivate: 'stopTaskPolling'
        activate: function (obj) {
            obj.activeId = true;
            var tab1 = obj.down('#neBackupTask');
            var tab1_activeId = tab1.activeId;
            var me = tab1.lookupController();
            var tab2 = obj.down('#cardBackupTask');
            // var taskGrid_activeId1 = tab1.down('#taskGrid').activeId;
            var tab2_activeId = tab1.activeId;
            var you = tab2.lookupController();
            var task = obj.lookupController().getViewModel().get('task');
            var taskGrid_activeId = tab1_activeId ? tab1.down('#taskGrid').activeId : tab2.down('#taskGrid').activeId;
            if (task != 'task' && taskGrid_activeId == true) {
                Ext.TaskManager.start(task);
            } else if (tab1_activeId && taskGrid_activeId == true) {

                me.getTaskGrid().store.load({
                    callback: function () {
                        me.taskPolling();
                    }
                });
            } else if (tab2_activeId && taskGrid_activeId == true) {
                you.getTaskGrid().store.load({
                    callback: function () {
                        you.taskPolling();
                    }
                });
            }

        },
        deActivate: function (obj) {
            obj.activeId = false;
            var task = obj.lookupController().getViewModel().get('task');
            Ext.TaskManager.stop(task);
            //obj.lookupController().getViewModel().set('task', 'task');
        }
    },
    activeId: true,
    items: [{
        //tab页
        xtype: 'tabpanel',
        layout: 'fit',
        bodyPadding: 10,
        listeners: {
            tabchange: function (tabPanel, newCard, oldCard, eOpts) {
                newCard.activeId = true;
                oldCard.activeId = false;
                var taskGrid = newCard.down('#taskGrid');
                var me = taskGrid.lookupController();
                var obj = tabPanel.up('backupMession');
                var task = obj.lookupController().getViewModel().get('task');
                Ext.TaskManager.stop(task);
                obj.lookupController().getViewModel().set('task', 'task');
                //console.log(newCard);
                var activeItem = newCard.getLayout().getActiveItem(Number);
                //console.log(activeItem);
                if (activeItem.itemId == 'taskGrid') {
                    me.taskPolling();
                } else {
                    me.nePolling();
                }

            }
        },
        items: [{
                //设备文件tab页
                title: _('Ne Backup Task'),
                xtype: 'container',
                layout: 'card',
                itemId: 'neBackupTask',
                controller: 'dataBackupMessionTab1Controller',
                viewModel: {
                    data: {
                        task_status: 1,
                        selectedPolicy: [],
                        selectedNe: [],
                        ftpValue: '',
                        progress: [],
                        menus: [],
                        startBtn: []
                    }
                },
                activeId: true,
                items: [{
                        xtype: 'PagedGrid',
                        title: _('List Of Ne Backup Task'),
                        itemId: 'taskGrid',
                        activeId: true,
                        reference: 'tab1MessionGridReference',
                        columnLines: true,
                        store: {
                            autoLoad: true,
                            // 每页显示记录数
                            pageSize: 15,
                            proxy: {
                                type: 'ajax',
                                //url: '/ccd/configcenter/backup/task/neTaskInfos',
                                url: '/ccd/configcenter/backup/task/neTaskInfos',
                                reader: {
                                    type: 'json',
                                    rootProperty: 'BackupTasks',
                                    //: 'totalCount'
                                    totalProperty: 'totalCount'
                                },

                            },

                        },
                        listeners: {
                            selectionchange: 'onItemClick',
                            activate: 'taskPolling',
                            deActivate: function (grid) {
                                var obj = grid.up('backupMession');
                                var task = obj.lookupController().getViewModel().get('task');
                                console.log(task);
                                if (task != 'task') {
                                    grid.activeId = false;
                                    Ext.TaskManager.stop(task);
                                    console.log('停止');
                                    obj.lookupController().getViewModel().set('task', 'task');
                                }
                            }
                        },
                        selType: 'checkboxmodel',
                        columns: [{
                                text: _('taskName'),
                                dataIndex: 'taskName',
                                flex: 1,
                                renderer: 'showToolTip'
                            }, {
                                text: _('startTime'),
                                dataIndex: 'startTime',
                                flex: 1,
                                renderer: 'showToolTip'
                            }, {
                                text: _('endTime'),
                                dataIndex: 'endTime',
                                flex: 1,
                                renderer: 'showToolTip'
                            }, {
                                xtype: 'widgetcolumn',
                                text: _('taskProcess'),
                                width: 180,
                                widget: {
                                    xtype: 'progress',
                                    ui: 'progress',
                                    //s cls: 'custom',
                                    bind: '{record.taskProcess/100}',
                                    textTpl: [
                                        '{percent:number("0")}% '
                                    ]
                                },
                                onWidgetAttach: 'attachRecord'
                            }, {
                                text: _('execStatus'),
                                dataIndex: 'execStatus',
                                flex: 1,
                                renderer: function (value, meta, record) {
                                    if (value === 5) {
                                        return '<span style="color:green;">' + '任务完成' + '</span>';
                                    } else if (value === 1) {
                                        return '<span style="color:#DAA520;">' + '等待运行' + '</span>';
                                    } else if (value === 2) {
                                        return '<span style="color:#FF0000;">' + '运行中' + '</span>';
                                    } else if (value === 3) {
                                        return '<span style="color:#DC143C	;">' + '待激活' + '</span>';
                                    } else if (value === 4) {
                                        return '<span style="color:#E066FF;">' + '正在激活' + '</span>';
                                    }
                                }
                            }, {
                                text: _('fileType'),
                                dataIndex: 'fileTypeName',
                                flex: 1
                            }, {
                                text: _('username'),
                                dataIndex: 'username',
                                flex: 1,
                                renderer: 'showToolTip'
                            }, {
                                text: _('createTime'),
                                dataIndex: 'createTime',
                                flex: 1,
                                renderer: 'showToolTip'
                            },
                            //  {
                            //     xtype: 'widgetcolumn',
                            //     text: _('Operation'),
                            //     width: 100,
                            //     widget: {
                            //         xtype: 'button',
                            //         ui: 'configcenter-button',
                            //         text: '开始',
                            //         iconCls: 'x-fa fa-play',
                            //         handler: 'onTaskStart',
                            //         disabled: SEC.disable('080403')

                            //     },
                            //     // onWidgetAttach: function (col, widget, rec) {
                            //     //     var execStatus = rec.data.execStatus;
                            //     //     if (execStatus == 5 || execStatus == 3 || execStatus == 4) {
                            //     //         widget.setIconCls('x-fa fa-check');
                            //     //         widget.setText('完成');
                            //     //         // console.log(widget);
                            //     //         widget.setDisabled(true);
                            //     //     } else if (execStatus == 1) {
                            //     //         widget.setIconCls('x-fa fa-play');
                            //     //         widget.setText('开始');
                            //     //         widget.setDisabled(false);
                            //     //     } else if (execStatus == 2) {
                            //     //         widget.setIconCls('x-fa fa-refresh fa-spin');
                            //     //         widget.setText('进行中');
                            //     //         widget.setDisabled(true);
                            //     //     }
                            //     // }
                            //     onWidgetAttach: 'startBtn'
                            // }
                        ],
                        pagingbarDefaultValue: 15,
                        // 分页策略
                        pagingbarConfig: {
                            fields: [{
                                name: 'val',
                                type: 'int'
                            }],
                            data: [{
                                    val: 15
                                },
                                {
                                    val: 30
                                },
                                {
                                    val: 60
                                },
                                {
                                    val: 100
                                },
                                {
                                    val: 200
                                },
                                {
                                    val: 500
                                },
                                {
                                    val: 1000
                                },
                                {
                                    val: 2000
                                }
                            ]
                        },
                        pagingbarDock: 'top',
                        dockedItems: [{
                            xtype: 'toolbar',
                            items: [{
                                    text: _('Caeate Ne Backup Task'),
                                    handler: 'onCreateTask',
                                    disabled: SEC.disable('080401')
                                }, {
                                    text: _('Look Over Related Ne'),
                                    iconCls: 'x-fa fa-search',
                                    handler: 'onShowRelatedNe',
                                    itemId: 'theRelateBtn',
                                    // bind: {
                                    //     disabled: '{!tab1MessionGridReference.selection}'
                                    // }
                                    disabled: true
                                },
                                {
                                    text: _('Delete'),
                                    iconCls: 'x-fa fa-trash',
                                    handler: 'onTaskDelete',
                                    bind: {
                                        disabled: '{!tab1MessionGridReference.selection}'
                                    },
                                    disabled: SEC.disable('080402')
                                }, {
                                    xtype: 'combo',
                                    itemId: 'exportType',
                                    width: 105,
                                    editable: false,
                                    triggerCls: 'x-fa   fa-copy ',
                                    name: 'exportTypeName',
                                    queryMosde: 'local',
                                    store: {
                                        type: 'exportType'
                                    },
                                    emptyText: _('exportList'),
                                    displayField: 'exportTypeName',
                                    valueField: 'exportTypeId',

                                    listeners: {
                                        select: 'onTaskExport'
                                    }
                                },
                                '->', {
                                    text: _('Search Task'),
                                    iconCls: 'x-fa fa-toggle-off',
                                    handler: 'showForm',
                                }, {
                                    text: _('Refresh'),
                                    iconCls: 'x-fa fa-refresh',
                                    handler: 'gridRefresh',
                                }
                            ]

                        }, {
                            xtype: 'form',
                            itemId: 'tab1MainForm',
                            hidden: true,
                            fieldDefaults: {
                                labelAlign: 'right'
                            },
                            items: [{
                                xtype: 'fieldset',
                                title: _('Search Task'),
                                layout: 'anchor',
                                margin: 20,
                                items: [{
                                    xtype: 'container',
                                    layout: 'hbox',
                                    labelWidth: 60,
                                    defaultType: 'textfield',
                                    margin: '0 15 15 15',
                                    items: [{
                                        xtype: 'textfield',
                                        fieldLabel: _('taskName'),
                                        name: 'taskName',
                                        flex: 1
                                    }, {
                                        xtype: 'combo',
                                        editable: false,
                                        fieldLabel: _('execStatus'),
                                        name: 'execStatus',
                                        flex: 1,
                                        queryMosde: 'local',
                                        store: {
                                            type: 'execute_state'
                                        },
                                        emptyText: _('please choose'),
                                        displayField: 'state',
                                        valueField: 'id',
                                        value: 0

                                    }, {
                                        xtype: 'combo',
                                        editable: false,
                                        fieldLabel: _('username'),
                                        name: 'username',
                                        flex: 1,
                                        // queryMode: 'local',
                                        store: {
                                            type: 'adminName'
                                        },
                                        // emptyText: _('please choose'),
                                        displayField: 'userName',
                                        // valueField: 'secUserId',
                                        valueField: 'userName',
                                    }]
                                }, {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    labelWidth: 60,
                                    margin: '0 15 15 15',
                                    items: [{
                                        xtype: 'datetimefield',
                                        fieldLabel: _('startTime'),
                                        labelSeparator: '<font color="black">>></font>',
                                        name: 'startTimeMin',
                                        flex: 1
                                    }, {
                                        xtype: 'datetimefield',
                                        flex: 1,
                                        name: 'startTimeMax',
                                        fieldLabel: _('startTime'),
                                        labelSeparator: '<font color="black"><<</font>',
                                    }, {
                                        xtype: 'datetimefield',
                                        flex: 1,
                                        name: 'endTimeMin',
                                        fieldLabel: _('endTime'),
                                        labelSeparator: '<font color="black">>=</font>',
                                    }]
                                }, {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    labelWidth: 60,
                                    margin: '0 15 15 15',
                                    items: [{
                                        xtype: 'datetimefield',
                                        flex: 1,
                                        name: 'endTimeMax',
                                        fieldLabel: _('endTime'),
                                        labelSeparator: '<font color="black"><=</font>',
                                    }, {
                                        xtype: 'datetimefield',
                                        flex: 1,
                                        name: 'createTimeMin',
                                        fieldLabel: _('createTime'),
                                        labelSeparator: '<font color="black">>=</font>',
                                    }, {
                                        xtype: 'datetimefield',
                                        flex: 1,
                                        name: 'createTimeMax',
                                        fieldLabel: _('createTime'),
                                        labelSeparator: '<font color="black"><=</font>',
                                    }]
                                }]
                            }],
                            buttons: [{
                                text: _('Reset'),
                                handler: 'ResetForm'
                            }, {
                                text: _('Search'),
                                handler: 'onFormSubmit'
                            }]
                        }],
                        // listeners: {
                        //     'select': 'onTab1MainMessionGridOutput',
                        //     afterrender: function (grid, opts) {
                        //         setInterval(function () {
                        //             grid.store.reload();
                        //         }, 60000);

                        //     }
                        // }
                    },
                    {
                        xtype: 'createNEbackupTask'
                    },
                    {
                        xtype: 'choosePolicy'
                    },
                    {
                        xtype: 'backupChooseNe'
                    },
                    {
                        xtype: 'backupRelatedNe',

                    }
                ]

            },
            {
                title: _('Card Backup Task'),
                xtype: 'container',
                layout: 'card',
                itemId: 'cardBackupTask',
                controller: 'dataBackupMessionTab2Controller',
                viewModel: {
                    data: {
                        task_status: 1,
                        selectedPolicy: [],
                        selectedNe: [],
                        ftpValue: '',
                        progress: [],
                        menus: [],
                        startBtn: []
                    }
                },
                items: [{
                    xtype: 'PagedGrid',
                    itemId: 'taskGrid',
                    title: _('Backup Task List'),
                    reference: 'tab2MessionGridReference',
                    columnLines: true,
                    store: {
                        autoLoad: true,
                        // 每页显示记录数
                        pageSize: 15,
                        proxy: {
                            type: 'ajax',
                            url: '/ccd/configcenter/backup/task/cardTaskInfos',
                            reader: {
                                type: 'json',
                                rootProperty: 'BackupTasks',
                                //: 'totalCount'
                                totalProperty: 'totalCount'
                            },
                        }
                    },
                    activeId: false,
                    listeners: {
                        selectionchange: 'onItemClick',
                        activate: 'taskPolling',
                        deActivate: function (grid) {
                            var obj = grid.up('backupMession');
                            var task = obj.lookupController().getViewModel().get('task');
                            console.log(task);
                            if (task != 'task') {
                                grid.activeId = false;
                                Ext.TaskManager.stop(task);
                                console.log('停止');
                                obj.lookupController().getViewModel().set('task', 'task');
                            }
                        }
                        // deActivate: 'stopTaskPolling'
                    },
                    selType: 'checkboxmodel',
                    columns: [{
                            text: _("taskName"),
                            dataIndex: 'taskName',
                            flex: 1,
                            renderer: 'showToolTip'

                        }, {
                            text: _("startTime"),
                            dataIndex: 'startTime',
                            flex: 1,
                            renderer: 'showToolTip'
                        }, {
                            text: _("endTime"),
                            dataIndex: 'endTime',
                            flex: 1,
                            renderer: 'showToolTip'
                        }, {
                            // xtype: 'gridcolumn',                                        //xtype: 'dvp_progresscolumn',
                            xtype: 'widgetcolumn',
                            text: _('taskProcess'),
                            width: 180,
                            widget: {
                                xtype: 'progress',
                                itemId: 'progress',
                                bind: '{record.taskProcess/100}',
                                textTpl: [
                                    '{percent:number("0")}% '
                                ]
                            },
                            onWidgetAttach: 'attachRecord'
                        }, {
                            text: _('execStatus'),
                            dataIndex: 'execStatus',
                            flex: 1,
                            renderer: function (value, meta, record) {
                                if (value === 5) {
                                    return '<span style="color:green;">' + '任务完成' + '</span>';
                                } else if (value === 1) {
                                    return '<span style="color:#DAA520;">' + '等待运行' + '</span>';
                                } else if (value === 2) {
                                    return '<span style="color:#FF0000;">' + '运行中' + '</span>';
                                } else if (value === 3) {
                                    return '<span style="color:#DC143C	;">' + '待激活' + '</span>';
                                } else if (value === 4) {
                                    return '<span style="color:#E066FF;">' + '正在激活' + '</span>';
                                }

                            }
                        }, {
                            text: _("fileType"),
                            dataIndex: 'fileTypeName',
                            flex: 1
                        }, {
                            text: _("username"),
                            dataIndex: 'username',
                            flex: 1,
                            renderer: 'showToolTip'
                        }, {
                            text: _("createTime"),
                            dataIndex: 'createTime',
                            flex: 1,
                            renderer: 'showToolTip'
                        },
                        // {
                        //     xtype: 'widgetcolumn',
                        //     text: _('Operation'),
                        //     width: 100,
                        //     widget: {
                        //         xtype: 'button',
                        //         ui: 'configcenter-button',
                        //         text: '开始',
                        //         iconCls: 'x-fa fa-play',
                        //         handler: 'onTaskStart',
                        //         disabled: SEC.disable('080403')

                        //     },
                        //     onWidgetAttach: 'startBtn'
                        //     // onWidgetAttach: function (col, widget, rec) {
                        //     //     var execStatus = rec.data.execStatus;
                        //     //     if (execStatus == 5 || execStatus == 3 || execStatus == 4) {
                        //     //         widget.setIconCls('x-fa fa-check');
                        //     //         widget.setText('完成');
                        //     //         // console.log(widget);
                        //     //         widget.setDisabled(true);
                        //     //     } else if (execStatus == 1) {
                        //     //         widget.setIconCls('x-fa fa-play');
                        //     //         widget.setText('开始');
                        //     //         widget.setDisabled(false);
                        //     //     } else if (execStatus == 2) {
                        //     //         widget.setIconCls('x-fa fa-refresh fa-spin');
                        //     //         widget.setText('进行中');
                        //     //         widget.setDisabled(true);
                        //     //     }
                        //     // }
                        // }
                    ],
                    pagingbarDefaultValue: 15,
                    // 分页策略
                    pagingbarConfig: {
                        fields: [{
                            name: 'val',
                            type: 'int'
                        }],
                        data: [{
                                val: 15
                            },
                            {
                                val: 30
                            },
                            {
                                val: 60
                            },
                            {
                                val: 100
                            },
                            {
                                val: 200
                            },
                            {
                                val: 500
                            },
                            {
                                val: 1000
                            },
                            {
                                val: 2000
                            }
                        ]
                    },
                    pagingbarDock: 'top',
                    dockedItems: [{
                        xtype: 'toolbar',
                        items: [{
                                text: _('Creat Card Backup Task'),
                                handler: 'onCreateTask',
                                disabled: SEC.disable('080401')
                            }, {
                                text: _('Look Over Related Ne'),
                                iconCls: 'x-fa fa-search',
                                handler: 'onShowRelatedNe',
                                itemId: 'theRelateBtn',
                                // bind: {
                                //     disabled: '{!tab2MessionGridReference.selection}'
                                // }
                                disabled: true
                            }, {
                                text: _('Delete'),
                                iconCls: 'x-fa fa-trash',
                                handler: 'onTaskDelete',
                                bind: {
                                    disabled: '{!tab2MessionGridReference.selection}'
                                },
                                disabled: SEC.disable('080402')
                            }, {
                                xtype: 'combo',
                                itemId: 'exportType',
                                width: 105,
                                editable: false,
                                triggerCls: 'x-fa   fa-copy',
                                name: 'exportTypeName',
                                queryMosde: 'local',
                                store: {
                                    type: 'exportType'
                                },
                                emptyText: _('exportList'),
                                displayField: 'exportTypeName',
                                valueField: 'exportTypeId',
                                listeners: {
                                    'select': 'onTaskExport'
                                }
                            },
                            '->',
                            {
                                text: _('Search Task'),
                                iconCls: 'x-fa  fa-toggle-off',
                                handler: 'showForm',
                            }, {
                                text: _('Refresh'),
                                iconCls: 'x-fa fa-refresh',
                                handler: 'gridRefresh',
                            }
                        ]
                    }, {
                        xtype: 'form',
                        itemId: 'tab2MainForm',
                        fieldDefaults: {
                            labelAlign: 'right'
                        },
                        hidden: true,
                        items: [{
                            xtype: 'fieldset',
                            layout: 'anchor',
                            title: _('Search Backup Task'),
                            margin: 20,
                            items: [{
                                xtype: 'container',
                                layout: 'hbox',
                                labelWidth: 60,
                                defaultType: 'textfield',
                                margin: '0 15 15 15',
                                items: [{
                                    xtype: 'textfield',
                                    fieldLabel: _('taskName'),
                                    name: 'taskName',
                                    flex: 1
                                }, {
                                    xtype: 'combo',
                                    editable: false,
                                    fieldLabel: _('execStatus'),
                                    name: 'execStatus',
                                    flex: 1,
                                    queryMosde: 'local',
                                    store: {
                                        type: 'execute_state'
                                    },
                                    emptyText: _('please choose'),
                                    displayField: 'state',
                                    valueField: 'id',
                                    value: 0

                                }, {
                                    xtype: 'combo',
                                    editable: false,
                                    fieldLabel: _('username'),
                                    flex: 1,
                                    name: 'username',
                                    // queryMode: 'local',
                                    store: {
                                        type: 'adminName'
                                    },
                                    // emptyText: _('please choose'),
                                    displayField: 'userName',
                                    // valueField: 'secUserId',
                                    valueField: 'userName',
                                }]
                            }, {
                                xtype: 'container',
                                layout: 'hbox',
                                labelWidth: 60,
                                margin: '0 15 15 15',
                                items: [{
                                    xtype: 'datetimefield',
                                    fieldLabel: _('startTime'),
                                    name: 'startTimeMin',
                                    flex: 1,
                                    labelSeparator: '<font color="black">>=</font>',
                                }, {
                                    xtype: 'datetimefield',
                                    flex: 1,
                                    name: 'startTimeMax',
                                    fieldLabel: _('startTime'),
                                    labelSeparator: '<font color="black"><=</font>',
                                }, {
                                    xtype: 'datetimefield',
                                    flex: 1,
                                    name: 'endTimeMin',
                                    fieldLabel: _('endTime'),
                                    labelSeparator: '<font color="black">>=</font>',
                                }]

                            }, {
                                xtype: 'container',
                                layout: 'hbox',
                                labelWidth: 60,
                                margin: '0 15 15 15',
                                items: [{
                                    xtype: 'datetimefield',
                                    flex: 1,
                                    name: 'endTimeMax',
                                    fieldLabel: _('endTime'),
                                    labelSeparator: '<font color="black"><=</font>',
                                }, {
                                    xtype: 'datetimefield',
                                    flex: 1,
                                    name: 'createTimeMin',
                                    fieldLabel: _('createTime'),
                                    labelSeparator: '<font color="black">>=</font>',
                                }, {
                                    xtype: 'datetimefield',
                                    flex: 1,
                                    name: 'createTimeMax',
                                    fieldLabel: _('createTime'),
                                    labelSeparator: '<font color="black"><=</font>',
                                }]
                            }]
                        }],
                        buttons: [{
                            text: _('Reset'),
                            handler: 'ResetForm'
                        }, {
                            text: _('Search'),
                            iconCls: 'x-fa  fa-search',

                            handler: 'onFormSubmit'
                        }]
                    }],

                }, {
                    xtype: 'createCardbackupTask'
                }, {
                    xtype: 'choosePolicy'
                }, {
                    xtype: 'backupChooseCard'
                }, {
                    xtype: 'backupRelatedCard',

                }]
            }
        ]
    }]
});