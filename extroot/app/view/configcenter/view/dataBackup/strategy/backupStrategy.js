Ext.define('Admin.view.configcenter.view.dataBackup.strategy.backupStrategy', {
    extend: 'Ext.container.Container',
    xtype: 'backupStrategy',
    requires: [
        //strategy
        'Admin.view.configcenter.controller.dataBackupStrategyController',
        'Admin.view.configcenter.view.dataBackup.strategy.editDataBackupStrategy',
        'Admin.view.configcenter.view.dataBackup.strategy.newPolicy',
        'Admin.view.configcenter.store.activeOrNot',
        'Admin.view.configcenter.store.failedOpt',
        'Admin.view.configcenter.store.cycle',
        'Admin.view.configcenter.store.mainTypeOfNE',
        'Admin.view.base.SysClockField.field.DateTime',

    ],
    controller: 'dataBackupStrategyController',
    layout: 'card',
    cls: 'shadow',
    bodyPadding: 10,
    items: [{
        xtype: 'PagedGrid',
        title: _('Backup Policy Grid'),
        itemId: 'policyGrid',
        reference: 'strategyGrid',
        columnLines: true,
        store: {
            // 每页显示记录数
            autoLoad: true,
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/ccd/configcenter/backup/policy/infos',
                reader: {
                    type: 'json',
                    rootProperty: 'BackupPolicys',
                    //: 'totalCount'
                    totalProperty: 'totalCount'
                },
            }
        },
        listeners: {
            itemclick: 'onItemClick'
        },
        selType: 'checkboxmodel',
        columns: [{
            text: _("policyName"),
            dataIndex: 'policyName',
            flex: 1

        }, {
            text: _("fileType"),
            dataIndex: 'fileTypeName',
            flex: 1
        }, {
            text: _("policyStatus"),
            dataIndex: 'policyStatus',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === 1) {
                    return '<span style="color:green;">' + '启用' + '</span>';
                } else if (value === 2) {
                    return '<span style="color:#FF0000;">' + '禁用' + '</span>';
                }

            }
        }, {
            text: _("policyPeriod"),
            dataIndex: 'policyPeriod',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === 2) {
                    return '<span>' + '每周' + '</span>';
                } else if (value === 3) {
                    return '<span>' + '每月' + '</span>';
                } else if (value === 1) {
                    return '<span>' + '每天' + '</span>';
                }

            }
        }, {
            text: _("policyDate"),
            dataIndex: 'policyDate',
            flex: 1,
            renderer: function (value, meta, record) {
                var policyPeriod = record.get('policyPeriod');
                if (policyPeriod == 2) {
                    switch (value) {
                        case 1:
                            return '<span>' + '周一' + '</span>';
                        case 2:
                            return '<span>' + '周二' + '</span>';
                        case 3:
                            return '<span>' + '周三' + '</span>';
                        case 4:
                            return '<span>' + '周四' + '</span>';
                        case 5:
                            return '<span>' + '周五' + '</span>';
                        case 6:
                            return '<span>' + '周六' + '</span>';
                        case 7:
                            return '<span>' + '周日' + '</span>';
                            break;
                    }
                } else if (policyPeriod == 3) {
                    return '<span>' + value + '号' + '</span>';
                } else if (policyPeriod == 1) {
                    return '<span>' + '每天' + '</span>';
                }

            }
        }, {
            text: _("policyTime"),
            dataIndex: 'policyTime',
            flex: 1
        }, {
            text: _("whether default"),
            dataIndex: 'isDefault',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === 1) {
                    return '<span>' + '是' + '</span>';
                } else if (value === 2) {
                    return '<span>' + '否' + '</span>';
                }

            }
        }, {
            text: _("username"),
            dataIndex: 'username',
            flex: 1
        }],
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
                    text: _('Add Backup Policy'),
                    handler: 'onCreatePolicy',
                    disabled: SEC.disable('080301')
                },
                {
                    text: _('Delete'),
                    iconCls: 'x-fa fa-trash',
                    handler: 'onDelete',
                    bind: {
                        disabled: '{!strategyGrid.selection}'
                    },
                    disabled: SEC.disable('080302')
                }, {
                    text: _('Edit'),
                    iconCls: 'x-fa fa-edit',
                    handler: 'onEdit',
                    itemId: 'theEditBtn',
                    bind: {
                        disabled: '{!strategyGrid.selection}'
                    },
                    disabled: SEC.disable('080303')
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
                        select: 'onPolicyExport'
                    }
                },
                '->', {
                    text: _('Search Policy'),
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
            itemId: 'mainForm',
            hidden: true,
            fieldDefaults: {
                labelAlign: 'right'
            },
            items: [{
                xtype: 'fieldset',
                defaultType: 'textfield',
                title: _('Search Policy'),
                layout: 'anchor',
                margin: 20,
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
                    margin: '0 20 20 20',
                    items: [{
                        fieldLabel: _('policyName'),
                        name: 'policyName',
                        flex: 1
                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('username'),
                        name: 'username',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('fileType'),
                        name: 'fileTypeName',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'fileType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'fileTypeName',
                        valueField: 'fileTypeName',
                        value: 'All Files',
                        listeners: {
                            beforerender: 'firstSoftSelect'
                        }

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'combo',
                        editable: false,
                        flex: 1,
                        name: 'isDefault',
                        fieldLabel: _('whether default'),
                        queryMode: 'local',
                        store: {
                            type: 'whetherDefault'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        flex: 1,
                        name: 'policyStatus',
                        fieldLabel: _('policyStatus'),
                        queryMode: 'local',
                        store: {
                            type: 'failedOpt'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
                    }, {
                        xtype: 'sysclockfield',
                        flex: 1,
                        name: 'policyTimeMin',
                        labelSeparator: '<font color="black">>=</font>',
                        fieldLabel: _('policyTime'),

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'sysclockfield',
                        flex: 1,
                        name: 'policyTimeMax',
                        labelSeparator: '<font color="black"><=</font>',
                        fieldLabel: _('policyTime'),

                    }, {
                        xtype: 'combo',
                        editable: false,
                        flex: 1,
                        fieldLabel: _('policyPeriod'),
                        name: 'policyPeriod',
                        queryMode: 'local',
                        store: {
                            type: 'cycle'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
                    }, {
                        xtype: 'panel',
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
        }]
    }, {
        xtype: 'editDataBackupStrategy',
        itemId: 'editPolicy'
    }, {
        xtype: 'newPolicy',
        itemId: 'newPolicy'
    }]
});