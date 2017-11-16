Ext.define('Admin.view.configcenter.view.log.log', {
    extend: 'Ext.container.Container',
    xtype: 'upgradeLog',
    requires: [ //mession/equipment
        'Admin.view.configcenter.store.optType',
        'Admin.view.configcenter.store.result',
        'Admin.view.configcenter.controller.backupLogController',
    ],
    layout: 'anchor',
    controller: 'backupLogController',
    cls: 'shadow',
    bodyPadding: 10,
    items: [{
        xtype: 'PagedGrid',
        title: _('Upgrade Log List'),
        itemId: 'logGrid',
        columnLines: true,
        store: {
            // 每页显示记录数
            autoLoad: true,
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/log/list',
                extraParams: {},
                reader: {
                    type: 'json',
                    rootProperty: 'upgradeLogVos',

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
            // renderer: 'showToolTip'

        }, {
            text: _("operType"),
            dataIndex: 'operType',


        }, {
            text: _("Result"),
            dataIndex: 'result',
            renderer: function (value, meta, record) {
                console.log(value);
                if (value === '成功') {
                    return '<span  style="color:green;">' + '成功' + '</span>';
                } else if (value === '失败') {
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
            dataIndex: 'filename',

        }, {
            text: _("sourceVersion"),
            dataIndex: 'sourceVersion',
            renderer: 'showToolTip'
        }, {
            text: _("targetVersion"),
            dataIndex: 'targetVersion',
            renderer: 'showToolTip'
        }, {
            text: _("username"),
            dataIndex: 'username',
            renderer: 'showToolTip'
        }],
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
                    val: 2
                },
                {
                    val: 3
                },
                {
                    val: 4
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
                        'select': 'onUpdateLogExport'
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
            items: [{
                xtype: 'fieldset',
                title: _('Search Upgrade Log'),
                defaultType: 'textfield',
                layout: 'anchor',
                margin: 20,
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
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
                            type: 'neType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'netypename',
                        valueField: 'netypeid',
                        listeners: {
                            change: 'showCardType',
                            focus: 'selectSeriesFirst',

                        }

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _("neIpAddr"),
                        name: 'ipaddress',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('fileType'),
                        name: 'fileTypeId',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'fileType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'fileTypeName',
                        valueField: 'fileTypeId',
                        // value: 0

                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('cardType'),
                        name: 'cardTypeId',
                        flex: 1,
                        queryMode: 'local',
                        store: {
                            type: 'veneer'
                        },
                        emptyText: _('please choose'),
                        displayField: 'cardTypeName',
                        valueField: 'cardTypeId',
                        listeners: {
                            change: 'showFileType',
                        }

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('cardName'),
                        name: 'cardName',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('operType'),
                        name: 'operType',
                        flex: 1,
                        queryMosde: 'local',
                        store: {
                            type: 'optType'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: 0
                    }, {
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
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('sourceVersion'),
                        name: 'sourceVersion',
                        flex: 1
                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('targetVersion'),
                        name: 'targetVersion',
                        flex: 1
                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('username'),
                        name: 'username',
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