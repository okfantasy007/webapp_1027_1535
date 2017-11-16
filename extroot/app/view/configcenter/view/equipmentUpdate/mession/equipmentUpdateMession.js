Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.equipmentUpdateMession', {
    extend: 'Ext.container.Container',
    xtype: 'equipmentUpdateMession',
    requires: [
        'Admin.view.configcenter.controller.equipmentUpdateMessionTab1Controller',
        'Admin.view.configcenter.store.execute_state',
        'Admin.view.configcenter.store.user_name',
        'Admin.view.configcenter.store.onlineState',
        'Admin.view.configcenter.controller.equipmentUpdateMessionTab2Controller',

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
            var tab1 = obj.down('#neUpgradeTask');
            var tab1_activeId = tab1.activeId;
            var me = tab1.lookupController();
            var tab2 = obj.down('#cardUpgradeTask');
            var tab2_activeId = tab1.activeId;
            //var taskGrid_activeId = tab1.down('#taskGrid').activeId;
            // console.log(taskGrid_activeId);
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
                var obj = tabPanel.up('equipmentUpdateMession');
                var task = obj.lookupController().getViewModel().get('task');
                Ext.TaskManager.stop(task);
                obj.lookupController().getViewModel().set('task', 'task');
                //console.log(newCard);
                var activeItem = newCard.getLayout().getActiveItem(Number);
                console.log(activeItem);
                if (activeItem.itemId == 'taskGrid') {
                    me.taskPolling();
                } else if (activeItem.itemId == 'relatedNeView') {
                    me.nePolling();
                }

            }
        },
        items: [{
            //设备文件tab页
            title: _('NeUpdate'),
            xtype: 'container',
            layout: 'card',
            itemId: 'neUpgradeTask',
            controller: 'equipmentUpdateMessionTab1Controller',
            viewModel: {
                data: {
                    task_status: 1,
                    selectedSoft: [],
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
                    itemId: 'taskGrid',
                    title: _('Update Task List'),
                    reference: 'tab1MessionGridReference',
                    columnLines: true,
                    activeId: true,
                    store: {
                        autoLoad: true,
                        // 每页显示记录数
                        pageSize: 15,
                        proxy: {
                            type: 'ajax',
                            url: '/confcenter/configcenter/upgrade/ne/task/list',
                            extraParams: {},
                            reader: {
                                type: 'json',
                                rootProperty: 'neUpgradeTasks',
                                totalProperty: 'totalCount'
                            },
                        },
                        data: {
                            task_status: 1
                        },

                    },
                    listeners: {
                        selectionchange: "onItemClick",
                        activate: 'taskPolling',
                        deActivate: function (grid) {
                            var obj = grid.up('equipmentUpdateMession');
                            var task = obj.lookupController().getViewModel().get('task');
                            console.log(task);
                            if (task != 'task') {
                                console.log(grid);
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
                                bind: '{record.taskProcess}',
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

                        },
                        // {
                        //     text: _('fileType'),
                        //     dataIndex: 'fileTypeName',
                        //     flex: 1
                        // }, 
                        {
                            text: _('username'),
                            dataIndex: 'username',
                            flex: 1,
                            // renderer: function (value) {
                            //     return Ext.String.format('<a style="color:pink; text-align:center">{0},{1},,,,,,,{2}*{3}</a>', value, '111', 2, 3, 4);
                            // }
                        }, {
                            text: _('createTime'),
                            dataIndex: 'createTime',
                            flex: 1,
                            renderer: 'showToolTip'
                        },
                        {
                            xtype: 'widgetcolumn',
                            text: _('Operation'),
                            width: 100,
                            widget: {
                                xtype: 'button',
                                ui: 'configcenter-button',
                                text: '开始',
                                iconCls: 'x-fa fa-play',
                                handler: 'onTaskStart',
                                disabled: SEC.disable('080203')
                            },
                            onWidgetAttach: 'startBtn'
                        },
                    ],
                    pagingbarDefaultValue: 15,
                    // 分页策略
                    pagingbarConfig: {
                        fields: [{
                            name: 'val',
                            type: 'int'
                        }],
                        data: [{
                                val: 1
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
                                text: _('New Update Task'),
                                handler: 'onCreateTask',
                                disabled: SEC.disable('080201')
                                // iconCls: 'x-fa fa-book fa-spin fa-fw',
                                //iconCls: 'x-fa btn btn-danger'
                            }, {
                                text: _('Look Over Related Ne'),
                                iconCls: 'x-fa fa-search',
                                handler: 'onShowRelatedNe',
                                itemId: 'theRelateBtn',
                                // bind: {
                                //     disabled: '{!tab1MessionGridReference.selection}'
                                // }
                                disabled: true
                            }, {
                                text: _('Delete'),
                                iconCls: 'x-fa fa-trash',
                                handler: 'onTaskDelete',
                                bind: {
                                    disabled: '{!tab1MessionGridReference.selection}'
                                },
                                disabled: SEC.disable('080202')
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
                                // value: -1,
                                listeners: {
                                    'select': 'onTaskExport'
                                }
                            },
                            '->',
                            {
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
                        //主表单
                        xtype: 'form',
                        itemId: 'tab1MainForm',
                        hidden: true,
                        fieldDefaults: {
                            labelAlign: 'right'
                        },
                        items: [{
                            xtype: 'fieldset',
                            layout: 'anchor',
                            title: _('Search Task'),
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
                                        queryMode: 'local',
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
                                        valueField: 'userName',

                                    }]
                                }, {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    labelWidth: 60,
                                    margin: '0 15 15 15',
                                    items: [
                                        //     {
                                        //     xtype: 'combo',
                                        //     editable: false,
                                        //     fieldLabel: _('fileType'),
                                        //     queryMode: 'local',
                                        //     name: 'fileTypeId',
                                        //     flex: 1,
                                        //     store: {
                                        //         type: 'fileType'
                                        //     },
                                        //     emptyText: _('please choose'),
                                        //     displayField: 'fileTypeName',
                                        //     valueField: 'fileTypeId',
                                        //     listeners: {
                                        //         afterrender: 'firstSoftSelect'
                                        //     }
                                        // }, 
                                        {
                                            xtype: 'datetimefield',
                                            // editable: false,
                                            fieldLabel: _('startTime'),
                                            labelSeparator: '<font color="black">>=</font>',
                                            name: 'startTime1',
                                            flex: 1
                                        }, {
                                            xtype: 'datetimefield',
                                            editable: false,
                                            flex: 1,
                                            labelSeparator: '<font color="black"><=</font>',
                                            name: 'startTime2',
                                            fieldLabel: _('startTime'),
                                        },
                                        {
                                            xtype: 'datetimefield',
                                            editable: false,
                                            flex: 1,
                                            name: 'endTime1',
                                            labelSeparator: '<font color="black">>=</font>',
                                            fieldLabel: _('endTime'),
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    labelWidth: 60,
                                    margin: '0 15 15 15',
                                    items: [, {
                                            xtype: 'datetimefield',
                                            editable: false,
                                            flex: 1,
                                            name: 'endTime2',
                                            labelSeparator: '<font color="black"><=</font>',
                                            fieldLabel: _('endTime'),
                                        }, {
                                            xtype: 'datetimefield',
                                            flex: 1,
                                            name: 'createTime1',
                                            labelSeparator: '<font color="black">>=</font>',
                                            editable: false,
                                            fieldLabel: _('createTime'),
                                        },
                                        {
                                            xtype: 'datetimefield',
                                            flex: 1,
                                            editable: false,
                                            name: 'createTime2',
                                            labelSeparator: '<font color="black"><=</font>',
                                            fieldLabel: _('createTime'),
                                        }
                                    ]
                                }
                                // , {
                                //     xtype: 'container',
                                //     layout: 'hbox',
                                //     labelWidth: 60,
                                //     margin: '0 15 15 15',
                                //     items: [, {
                                //         xtype: 'panel', //设置空白
                                //         flex: 1
                                //     }, {
                                //         xtype: 'panel', //设置空白
                                //         flex: 1
                                //     }]
                                // }
                            ]
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
                    xtype: 'createNEupgradeTaskWindow',
                    itemId: 'createNEupgradeTaskView'
                },
                {
                    xtype: 'neChooseYes',
                    itemId: 'neChooseYes',
                }, {
                    xtype: 'chooseNe',
                    itemId: 'chooseNe',
                }, {
                    xtype: 'relatedNe',
                    itemId: 'relatedNeView'

                }
            ]
        }, {
            title: _('Card Update Task'),
            xtype: 'container',
            layout: 'card',
            itemId: 'cardUpgradeTask',
            controller: 'equipmentUpdateMessionTab2Controller',
            viewModel: {
                data: {
                    task_status: 1,
                    selectedSoft: [],
                    selectedNe: [],
                    ftpValue: '',
                    progress: [],
                    menus: [],
                    startBtn: []
                }
            },
            activeId: false,
            // listeners: {
            //     activate: function (me) {
            //         me.activeId = true;
            //     },
            //     deActivate: function (me) {
            //         me.activeId = false;
            //     }
            // },
            items: [{
                xtype: 'PagedGrid',
                title: _('Update Task List'),
                itemId: 'taskGrid',
                reference: 'tab2MessionGridReference',
                columnLines: true,
                activeId: true,
                store: {
                    autoLoad: true,
                    // 每页显示记录数
                    pageSize: 15,
                    proxy: {
                        type: 'ajax',
                        url: '/confcenter/configcenter/upgrade/card/task/list',
                        extraParams: {},
                        reader: {
                            type: 'json',
                            rootProperty: 'cardUpgradeTasks',
                            //: 'totalCount'
                            totalProperty: 'totalCount'
                        }
                    }
                },
                listeners: {
                    selectionchange: "onItemClick",
                    activate: 'taskPolling',
                    deActivate: function (grid) {
                        var obj = grid.up('equipmentUpdateMession');
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
                        xtype: 'widgetcolumn',
                        text: _('taskProcess'),
                        width: 180,
                        widget: {
                            xtype: 'progress',
                            ui: 'progress',
                            //s cls: 'custom',
                            bind: '{record.taskProcess}',
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
                        flex: 1
                    }, {
                        text: _("createTime"),
                        dataIndex: 'createTime',
                        flex: 1,
                        renderer: 'showToolTip'
                    },
                    {
                        xtype: 'widgetcolumn',
                        text: _('Operation'),
                        width: 100,
                        widget: {
                            xtype: 'button',
                            ui: 'configcenter-button',
                            text: '开始',
                            iconCls: 'x-fa fa-play',
                            handler: 'onTaskStart',
                            disabled: SEC.disable('080203')

                        },
                        onWidgetAttach: "startBtn"
                    }
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
                            text: _('New Card Upgrate Task'),
                            handler: 'onCreateTask',
                            disabled: SEC.disable('080402')
                        }, {
                            text: _('Look Over Related Card'),
                            iconCls: 'x-fa fa-search',
                            itemId: 'theRelateBtn',
                            handler: 'onShowRelatedNe',
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
                            disabled: SEC.disable('080202')
                        }, {
                            xtype: 'combo',
                            itemId: 'exportType',
                            width: 105,
                            editable: false,
                            triggerCls: 'x-fa   fa-copy ',
                            name: 'exportTypeName',
                            queryMode: 'local',
                            store: {
                                type: 'exportType'
                            },
                            emptyText: _('exportList'),
                            displayField: 'exportTypeName',
                            valueField: 'exportTypeId',
                            // value: -1,
                            listeners: {
                                select: 'onTaskExport'
                            }
                        },
                        '->',
                        {
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
                    itemId: 'tab2MainForm',
                    fieldDefaults: {
                        labelAlign: 'right'
                    },
                    hidden: true,
                    items: [{
                        xtype: 'fieldset',
                        layout: 'anchor',
                        title: _('Search Task'),
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
                                queryMode: 'local',
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
                                valueField: 'userName',

                            }]
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            margin: '0 15 15 15',
                            items: [{
                                xtype: 'combo',
                                editable: false,
                                fieldLabel: _('fileType'),
                                queryMode: 'local',
                                name: 'fileTypeId',
                                flex: 1,
                                store: {
                                    type: 'fileType'
                                },
                                emptyText: _('please choose'),
                                displayField: 'fileTypeName',
                                valueField: 'fileTypeId',
                                listeners: {
                                    afterrender: 'firstSoftSelect'
                                }
                            }, {
                                xtype: 'datetimefield',
                                fieldLabel: _('startTime'),
                                name: 'startTime1',
                                labelSeparator: '<font color="black">>=</font>',
                                flex: 1
                            }, {
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'startTime2',
                                labelSeparator: '<font color="black"><=</font>',
                                fieldLabel: _('startTime'),
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            margin: '0 15 15 15',
                            items: [{
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'endTime1',
                                fieldLabel: _('endTime'),
                                labelSeparator: '<font color="black">=></font>',
                            }, {
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'endTime2',
                                labelSeparator: '<font color="black"><=</font>',
                                fieldLabel: _('endTime'),
                            }, {
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'createTime1',
                                labelSeparator: '<font color="black">>=</font>',
                                fieldLabel: _('createTime'),
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            margin: '0 15 15 15',
                            items: [{
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'createTime2',
                                labelSeparator: '<font color="black"><=</font>',
                                fieldLabel: _('createTime'),
                            }, {
                                xtype: 'panel', //设置空白
                                flex: 1
                            }, {
                                xtype: 'panel', //设置空白
                                flex: 1
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
            }, {
                xtype: 'newCardTask',
                itemId: 'newCardTask'
            }, {
                xtype: 'cardChooseYes',
                itemId: 'chooseYes'
            }, {
                xtype: 'upgradeChooseCard',
                itemId: 'chooseCard'
            }, {
                xtype: 'relatedCard',

            }]
        }]
    }]
});