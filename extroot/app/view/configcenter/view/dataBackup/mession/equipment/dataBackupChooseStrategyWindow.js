Ext.define('Admin.view.configcenter.view.dataBackup.mession.equipment.dataBackupChooseStrategyWindow', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.configcenter.store.whetherDefault',
    ],
    xtype: 'choosePolicy',
    layout: 'fit',
    items: [{
        xtype: 'PagedGrid',
        title: _('Backup Policy Grid'),
        levelId: 1,
        itemId: 'policyGrid',
        columnLines: true,
        selType: 'checkboxmodel',
        store: {
            autoLoad: true,
            // 每页显示记录数
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
            select: 'policySelect',
            deselect: 'policyDeselect',
            // load: 'softLoad'
            afterrender: 'renderGrid',
            //itemclick: 'onPolicyGridClick'
        },
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
                    text: _('Back'),
                    iconCls: 'x-fa  fa-reply',
                    handler: 'onBack',
                }, {
                    xtype: 'checkbox',
                    margin: '0 10 0 10',
                    itemId: 'showSelectedPolicy',
                    //fieldLabel: _('Selected'),
                    boxLabel: _('Selected'),
                    listeners: {
                        change: 'onShowChoosedPolicy',

                    }
                }, {
                    text: _('Import'),
                    itemId: 'theImport',
                    handler: 'onImportSelectedPolicy'
                },
                '->',
                {
                    text: _('Search Policy'),
                    iconCls: 'x-fa fa-search',
                    handler: 'showForm',
                }, {
                    text: _('Refresh'),
                    iconCls: 'x-fa fa-refresh',
                    handler: 'gridRefresh',
                }
            ]

        }, {
            xtype: 'form',
            itemId: 'chooseYesPopWindowForm',
            hidden: true,
            fieldDefaults: {
                labelAlign: 'right'
            },
            items: [{
                xtype: 'fieldset',
                title: _('Search Policy'),
                defaultType: 'textfield',
                layout: 'anchor',
                margin: 20,
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('policyName'),
                        name: 'policyName',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        flex: 1,
                        fieldLabel: _('fileType'),
                        store: {
                            type: 'fileType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'fileTypeName',
                        name: 'fileTypeName',
                        valueField: 'fileTypeName',
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('policyStatus'),
                        name: 'policyStatus',
                        flex: 1,
                        queryMosde: 'local',
                        store: {
                            type: 'failedOpt'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'datetimefield',
                        fieldLabel: _('policyTime'),
                        name: 'policyTimeMin',
                        flex: 1
                    }, {
                        xtype: 'datetimefield',
                        fieldLabel: _('policyTime'),
                        name: 'policyTimeMax',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('whether default'),
                        name: 'isDefault',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'whetherDefault'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('username'),
                        name: 'username',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('policyPeriod'),
                        name: 'policyPeriod',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'cycle'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
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
        }]
    }]
});