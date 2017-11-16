Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.veneer.visiblePanel', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.configcenter.store.veneer',
    ],
    xtype: 'visiblePanel',
    items: [{
        title: _('Upgrade SoftList'),
        xtype: 'PagedGrid',
        itemId: 'fileGrid',
        reference: 'veneerMainGrid',
        columnLines: true,
        autoLoad: true,
        store: {
            // 每页显示记录数
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/card/file/list',
                reader: {
                    type: 'json',
                    rootProperty: 'cardUpgradeSofts',
                    //: 'totalCount'
                    totalProperty: 'totalCount'
                },
            }
        },
        listeners: {
            select: 'onItemClick'
        },
        selType: 'checkboxmodel',
        columns: [{
            text: _('neType'),
            dataIndex: 'neTypeName',

            flex: 1

        }, {
            text: _('cardType'),
            dataIndex: 'cardTypeName',

            flex: 1

        }, {
            text: _('fileType'),
            dataIndex: 'fileTypeName',

            flex: 1

        }, {
            text: _('fileversion'),
            dataIndex: 'fileVersion',

            flex: 2.2

        }, {
            text: _('filename'),
            dataIndex: 'filename',

            flex: 1

        }, {
            text: _('remark'),
            dataIndex: 'remark',

            flex: 1
        }, {
            text: _('username'),
            dataIndex: 'username',

            flex: 1
        }, {
            text: _('importTime'),
            dataIndex: 'importTime',

            flex: 1
        }, {
            xtype: 'widgetcolumn',
            text: _('Operation'),
            width: 100,
            widget: {
                xtype: 'button',
                text: _('Download'),
                iconCls: 'x-fa fa-download',
                style: {
                    padding: '5px',
                    background: '#5FA4CC',
                    marginTop: '2px',
                },
                handler: 'onFileDownload',
                listeners: {
                    render: 'renderer',
                }
            },

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
                    text: _('Import BackupFile'),
                    handler: 'importBackupFile',
                    disabled: SEC.disable('080101')
                },
                //  {
                //     text: _('Import LocalFile'),
                //     handler: 'onVeneerInputLocalFile'
                // }
                , {
                    text: _('Update Remark'),
                    iconCls: 'x-fa fa-edit',
                    handler: 'onEdit',
                    itemId: 'theEditBtn',
                    bind: {
                        disabled: '{!veneerMainGrid.selection}'
                    },
                    disabled: SEC.disable('080103')
                },
                {
                    text: _('Delete'),
                    iconCls: 'x-fa fa-trash',
                    handler: 'onDeleteFile',
                    bind: {
                        disabled: '{!veneerMainGrid.selection}'
                    },
                    disabled: SEC.disable('080102')

                },
                //  {
                //     text: _('Download'),
                //     iconCls: 'x-fa fa-download',
                //     handler: 'onFileDownload',
                //     itemId: 'theDownloadBtn',
                //     bind: {
                //         disabled: '{!veneerMainGrid.selection}'
                //     }
                // },
                {
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

                    listeners: {
                        select: 'onFileExport'
                    }
                },

                '->',
                {
                    text: _('search file'),
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
            hidden: true,
            itemId: 'veneerMainForm',
            fieldDefaults: {
                labelAlign: 'right'
            },
            items: [{
                xtype: 'fieldset',
                defaultType: 'textfield',
                title: _('Search UpgradeSoft'),
                layout: 'anchor',
                margin: "00 20 20 20",
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('neSeries'),
                        name: 'categoryid',
                        queryMode: 'local',
                        flex: 1,
                        emptyText: _('please choose'),
                        store: {
                            type: 'neSeries'
                        },
                        displayField: 'categoryid',
                        listeners: {
                            change: 'showNeType',
                            afterrender: 'firstSelect'
                        }
                    }, {
                        xtype: 'combo',
                        // editable: false,
                        fieldLabel: _('neType'),
                        name: 'neTypeId',
                        flex: 1,
                        queryMode: 'local',
                        emptyText: _('please choose'),
                        store: {
                            type: 'neType'
                        },
                        displayField: 'netypename',
                        valueField: 'netypeid',
                        listeners: {
                            change: 'showCardType',
                            focus: 'selectSeriesFirst',

                        }
                    }, {
                        xtype: 'combo',
                        editable: false,
                        queryMode: 'local',
                        fieldLabel: _('cardType'),
                        name: 'cardTypeId',
                        flex: 1,
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
                        xtype: 'combo',
                        // editable: false,
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
                        // listeners: {
                        //     afterrender: 'firstSoftSelect',

                        // }

                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('fileversion'),
                        name: 'fileVersion',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('username'),
                        name: 'username',
                        flex: 1,
                        //queryMode: 'local',
                        store: {
                            type: 'adminName'
                        },
                        //emptyText: _('please choose'),
                        displayField: 'userName',
                        valueField: 'userName',

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'datetimefield',
                        flex: 1,
                        name: 'startTime',
                        fieldLabel: _('search StartTime'),



                    }, {
                        xtype: 'datetimefield',
                        flex: 1,
                        name: 'endTime',
                        fieldLabel: _('search EndTime'),



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
                iconCls: 'x-fa  fa-search',
                handler: 'onFormSubmit'
            }, ]
        }]
    }]
});