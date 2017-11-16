Ext.define('Admin.view.performance.realTimeTask.view.realTimeMainView', {
    extend: 'Ext.container.Container',
    xtype: 'realTimeMainView',
    requires: [
        'Admin.view.performance.realTimeTask.viewModel.realTimeStoreViewModel',
        'Admin.view.performance.realTimeTask.model.realTimeStoreModel',
        'Admin.view.performance.realTimeTask.controller.realTimeMainView',
        'Admin.view.performance.realTimeTask.view.realTimeAdd',
        'Admin.view.performance.realTimeTask.view.realTimeDetail',
    ],
    controller: 'realTimeMainView',
    viewModel: 'realTimeStoreViewModel',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',
    // id: 'performanceMianId',
    items: [
        {
            //性能任务管理主界面
            title: _('Real-time performance task management'),
            xtyp: 'panel',
            itemId: 'realTimeMainView',
            items: [
                {
                    xtype: 'form',
                    itemId: 'deviceForm',
                    hidden: true,
                    items: [
                        {
                            xtype: 'textfield',
                            itemId: 'deviceId',
                            fieldLabel: _('deviceId'),
                            name: 'deviceId'
                        },

                    ],
                },
                {
                    //性能任务表
                    xtype: 'grid',
                    itemId: 'realTimeTaskGrid',
                    reference: 'realTimeTaskGrid',
                    // region: 'center',
                    height: 600,
                    // 绑定到viewModel的属性
                    bind: {
                        store: '{realTimeStore}',
                    },
                    // grid显示字段
                    columns: [
                        { text: _('taskId'), dataIndex: 'taskId', width: 200, },
                        {
                            text: _('collectPeriod'), dataIndex: 'collectPeriod', width: 200,
                            renderer: function (val) {
                                if (val <= 60) return val + _('Seconds');
                                if (60 < val < 60 * 60) return val / 60 + _('Minutes');
                                if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
                                if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
                            },
                        },
                        {
                            text: _('taskStatus'), dataIndex: 'taskStatus', width: 200,
                            renderer: function getRstatus(value) {
                                if (value == 1) {
                                    return _('Not running');
                                } else if (value == 2) {
                                    return _('Running');
                                } else if (value == 3) {
                                    return _('Hang');
                                } else if (value == 4) {
                                    return _('stopped');
                                } else {
                                    return _('failure');
                                }
                            }
                        },
                        {
                            text: _('taskType'), dataIndex: 'taskType', width: 180,
                            renderer: function getRstatus(value) {
                                if (value == 1) {
                                    return _('realTimeTask');
                                }
                            }
                        },
                        { text: _('protocolType'), dataIndex: 'protocolType', width: 180 },
                        {
                            text: _('collectType'), dataIndex: 'collectType', width: 180,
                            renderer: function getRstatus(value) {
                                if (value == 1) {
                                    return _("initiative");
                                } else {
                                    return _("passive");
                                }
                            }
                        },
                        { text: _('endTime'), dataIndex: 'endTime', width: 300 }
                    ],
                    selModel: {
                        selType: 'checkboxmodel', // XTYPE
                        //mode: 'SINGLE',
                        multiSelect: true,
                        toggleOnClick: true,
                        allowDeselect: true,
                        listeners: {
                            //点击记录时触发
                            selectionchange: 'select',
                            beforedeselect: 'onBeforedSelect',
                        }
                    },
                    dockedItems: [
                        {
                            xtype: 'toolbar',
                            dock: 'top',
                            items: [
                                {
                                    text: _('Stop'),
                                    iconCls: 'x-fa fa-stop',
                                    itemId: 'realStop',
                                    hidden: SEC.hidden('05020101'),
                                    handler: 'onStop',
                                    bind: {
                                        disabled: '{!realTimeTaskGrid.selection}'
                                    },
                                },
                                '->',
                                {
                                    text: _('Display'),
                                    iconCls: 'pictos pictos-chart2',
                                    itemId: 'display',
                                    hidden: SEC.hidden('05020102'),
                                    handler: 'onDisplay',
                                    bind: {
                                        disabled: '{!realTimeTaskGrid.selection}'
                                    },
                                },
                                {
                                    text: _('Add'),
                                    hidden: SEC.hidden('05020103'),
                                    iconCls: 'x-fa fa-plus',
                                    itemId: 'realAdd',
                                    handler: 'onAdd'
                                },
                                {
                                    text: _('Delete'),
                                    iconCls: 'x-fa fa-trash',
                                    itemId: 'realDelete',
                                    hidden: SEC.hidden('05020104'),
                                    handler: 'onDelete',
                                    bind: {
                                        disabled: '{!realTimeTaskGrid.selection}'
                                    }
                                },
                                {
                                    text: _('Detail'),
                                    iconCls: 'x-fa fa-search',
                                    itemId: 'realQuery',
                                    hidden: SEC.hidden('05020105'),
                                    handler: 'queryDetail',
                                    bind: {
                                        disabled: '{!realTimeTaskGrid.selection}'
                                    }
                                },
                                {
                                    text: _('Refresh'),
                                    iconCls: 'x-fa fa-refresh',
                                    handler: 'onRefresh'
                                }
                            ]
                        }],
                }],
        },

        {
            xtype: 'realTimeAdd',
        },

        {
            xtype: 'realTimeDetail',
        },
    ]
});

