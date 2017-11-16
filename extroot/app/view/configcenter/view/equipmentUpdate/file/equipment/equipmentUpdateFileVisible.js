Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentUpdateFileVisible', {
    extend: 'Ext.container.Container',
    xtype: 'equipmentUpdateFileVisible',
    requires: [
        'Admin.view.configcenter.store.neType',
        'Admin.view.configcenter.store.textType',
        'Admin.view.configcenter.store.adminName',
        'Admin.view.configcenter.store.equipmentType',
        'Admin.view.configcenter.store.fileType',
        'Admin.view.base.DateTimeField.field.DateTime',
    ],
    //cls: 'shadow',
    items: [{
        xtype: 'PagedGrid',
        title: _('Upgrade SoftList'),
        border: false,
        autoLoad: true,
        itemId: 'fileGrid',
        reference: 'mainGrid',
        // border: true,
        columnLines: true,
        store: {
            // 每页显示记录数
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/ne/file/list',
                reader: {
                    type: 'json',
                    rootProperty: 'neUpgradeSofts',
                    totalProperty: 'totalCount'
                },
            }
        },

        selType: 'checkboxmodel',
        columns: [{
            text: _("neType"),
            dataIndex: 'neTypeName',

            flex: 1

        }, {
            text: _("fileType"),
            dataIndex: 'fileTypeName',

            flex: 1

        }, {
            text: _("fileversion"),
            dataIndex: 'fileVersion',

            flex: 2.2

        }, {
            text: _("filename"),
            dataIndex: 'filename',

            flex: 1

        }, {
            text: _("remark"),
            dataIndex: 'remark',

            flex: 1
        }, {
            text: _("username"),
            dataIndex: 'username',

        }, {
            text: _("importTime"),
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
        listeners: {
            select: 'onItemClick'
        },
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
                    // {
                    //     text: _('Import LocalFile'),
                    //     handler: 'inputLocalFile'
                    // },
                    {
                        text: _('Update Remark'),
                        iconCls: 'x-fa fa-edit',
                        handler: 'onEdit',
                        itemId: 'theEditBtn',
                        bind: {
                            disabled: '{!mainGrid.selection}'
                        },
                        disabled: SEC.disable('080103')
                    },
                    {
                        text: _('Delete'),
                        iconCls: 'x-fa fa-trash',
                        handler: 'onDeleteFile',
                        bind: {
                            disabled: '{!mainGrid.selection}'
                        },
                        disabled: SEC.disable('080102')

                    },
                    // {
                    //     text: _('Download'),
                    //     iconCls: 'x-fa fa-download',
                    //     handler: 'onFileDownload',
                    //     itemId: 'theDownloadBtn',
                    //     bind: {
                    //         disabled: '{!mainGrid.selection}'
                    //     }

                    // },
                    {
                        xtype: 'combo',
                        itemId: 'exportType',
                        width: 105,
                        editable: false,
                        name: 'exportTypeName',
                        queryMode: 'local',
                        store: {
                            type: 'exportType'
                        },
                        emptyText: _('exportList'),
                        //triggerCls: 'x-fa   fa-copy',
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
                    },
                    {
                        text: _('Refresh'),
                        iconCls: 'x-fa fa-refresh',
                        handler: 'gridRefresh',
                    }

                ]
            },
            {
                xtype: 'form',
                itemId: 'mainForm',
                hidden: true,
                // border: true,
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
                            flex: 1,
                            emptyText: _('please choose'),
                            queryMode: 'local',
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
                            editable: false,
                            fieldLabel: _('neType'),
                            name: 'neTypeId',
                            flex: 1,
                            emptyText: _('please choose'),
                            queryMode: 'local',
                            store: {
                                type: 'neType'
                            },
                            displayField: 'netypename',
                            valueField: 'netypeid',
                            listeners: {
                                focus: 'selectSeriesFirst',
                                change: 'showFileType',
                            }
                        }, {
                            xtype: 'combo',
                            editable: false,
                            fieldLabel: _('fileType'),
                            name: 'fileTypeId',
                            flex: 1,
                            store: {
                                type: 'fileType'
                            },
                            emptyText: _('please choose'),
                            displayField: 'fileTypeName',
                            valueField: 'fileTypeId',
                            // value: -1

                        }]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        labelWidth: 60,
                        margin: '0 20 20 20',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: _('fileversion'),
                            name: 'fileVersion',
                            flex: 1
                        }, {
                            xtype: 'datetimefield',
                            flex: 1,
                            name: 'startTime',
                            fieldLabel: _('search StartTime'),


                        }, {
                            xtype: 'datetimefield',
                            flex: 1,
                            name: 'endTime',
                            fieldLabel: _('search EndTime'),


                        }]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        labelWidth: 60,
                        margin: '0 20 20 20',
                        items: [{
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


                        }, {
                            xtype: 'panel',
                            flex: 1
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
                    handler: 'onFormSubmit',
                    iconCls: 'x-fa  fa-search'
                }]
            },




        ]
    }]

});