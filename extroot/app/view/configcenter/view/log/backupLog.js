Ext.define('Admin.view.configcenter.view.log.backupLog', {
    extend: 'Ext.container.Container',
    xtype: 'backupLog',
    requires: [ //mession/equipment
        'Admin.view.configcenter.controller.backupLogController',
    ],
    layout: 'anchor',
    controller: 'backupLogController',
    cls: 'shadow',
    bodyPadding: 10,
    items: [{
        xtype: 'PagedGrid',
        itemId: 'logGrid',
        title: _('Backup Log List'),
        columnLines: true,
        store: {
            autoLoad: true,
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/ccd/configcenter/backup/log/infos',
                extraParams: {},
                reader: {
                    type: 'json',
                    rootProperty: 'BackupLogs',
                    totalProperty: 'totalCount'
                }
            }
        },
        selType: 'checkboxmodel',
        columns: [{
                text: _("neName"),
                dataIndex: 'hostname',
                renderer: 'showToolTip'
            }, {
                text: _("neType"),
                dataIndex: 'neTypeName',
                renderer: 'showToolTip'

            }, {
                text: _("neIpAddr"),
                dataIndex: 'ipaddress',
                renderer: 'showToolTip'
            }, {
                text: _("cardType"),
                dataIndex: 'cardTypeName',

            }, {
                text: _("cardName"),
                dataIndex: 'cardName',

            },
            //  {
            //     text: _("operType"),
            //     dataIndex: 'operType',

            // },
            {
                text: _("Result"),
                dataIndex: 'result',
                renderer: function (value, meta, record) {
                    if (value === 1) {
                        return '<span  style="color:green;">' + '成功' + '</span>';
                    } else if (value === 2) {
                        return '<span style="color:#FF0000;">' + '失败' + '</span>';
                    }

                }
            }, {
                text: _("remark"),
                dataIndex: 'remark',
                renderer: 'showToolTip'
            }, {
                text: _("startTime"),
                dataIndex: 'startTime',
                renderer: 'showToolTip'
            }, {
                text: _("endTime"),
                dataIndex: 'endTime',
                renderer: 'showToolTip'
            }, {
                text: _("fileType"),
                dataIndex: 'fileTypeName',

            }, {
                text: _("filename"),
                dataIndex: 'backupFilename',

            }
            // , {
            //     text: _("sourceVersion"),
            //     dataIndex: 'sourceVersion',

            // }
            , {
                text: _("targetVersion"),
                dataIndex: 'fileVersion',

            }, {
                text: _("username"),
                dataIndex: 'username',
                renderer: 'showToolTip'
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
                        'select': 'onBackupLogExport'
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
            hidden: true,
            fieldDefaults: {
                labelAlign: 'right'
            },
            backupLog: true,
            items: [{
                xtype: 'fieldset',
                title: _('Search Backup Log'),
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
                        fieldLabel: _('neName'),
                        name: 'hostname',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('neSeries'),
                        name: 'categoryid',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'neSeries'
                        },
                        emptyText: _('please choose'),
                        displayField: 'categoryid',
                        listeners: {
                            change: 'showNeType',
                            afterrender: 'firstSelect'
                        }

                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('neType'),
                        name: 'neTypeId',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'backupNeType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'netypename',
                        valueField: 'netypeid',
                        listeners: {
                            change: 'showCardType',
                            // focus: 'selectSeriesFirst',

                        }

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('neIpAddr'),
                        name: 'ipaddress',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('cardType'),
                        name: 'cardTypeId',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'backupCardType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'cardTypeName',
                        valueField: 'cardTypeId',
                        // value: -1,
                        listeners: {
                            change: 'backupShowFileType',
                        }
                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('cardName'),
                        name: 'cardName',
                        flex: 1
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('Result'),
                        name: 'result',
                        flex: 1,
                        queryMosde: 'local',
                        store: {
                            type: 'result'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
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

                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('backup file name'),
                        name: 'backupFilename',
                        flex: 1
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('fileversion'),
                        name: 'fileVersion',
                        flex: 1
                    }, {
                        xtype: 'panel',
                        flex: 1,
                    }, {
                        xtype: 'panel',
                        flex: 1,
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