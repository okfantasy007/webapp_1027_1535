Ext.define('Admin.view.configcenter.view.dataBackup.file.backupFile', {
    extend: 'Ext.container.Container',
    xtype: 'backupFile',
    requires: [
        'Admin.view.configcenter.controller.dataBackupFileTab1Controller',
        'Admin.view.configcenter.controller.dataBackupFileTab2Controller',
        // 'Ext.grid.plugin.Exporter'
    ],
    cls: 'shadow',
    items: [{
        //tab页
        xtype: 'tabpanel',
        layout: 'fit',
        bodyPadding: 10,
        items: [{
            //设备文件tab页
            title: _('NeSoft'),
            xtype: 'container',
            layout: 'anchor',
            controller: 'dataBackupFileTab1Controller',
            viewModel: {
                data: {
                    task_status: 1,
                    flag1: 1,
                    flag2: 1,
                    selectedSoft: [],
                    selectedNe: [],
                    ftpValue: '',
                    btns: []
                }
            },
            items: [{
                xtype: 'PagedGrid',
                title: _('Backup Soft List'),
                itemId: 'softGrid',
                reference: 'tab1MessionGridReference',
                columnLines: true,
                store: {
                    // 每页显示记录数
                    autoLoad: true,
                    pageSize: 15,
                    proxy: {
                        type: 'ajax',
                        url: '/ccd/configcenter/backup/soft/ne/infos',
                        reader: {
                            type: 'json',
                            rootProperty: 'NeBackupSofts',
                            //: 'totalCount'
                            totalProperty: 'totalCount'
                        },
                    },
                },
                selType: 'checkboxmodel',
                columns: [{
                    text: _("neName"),
                    dataIndex: 'hostname',
                    flex: 1

                }, {
                    text: _("neType"),
                    dataIndex: 'netypename',
                    flex: 1
                }, {
                    text: _("neIpAddr"),
                    dataIndex: 'ipaddress',
                    flex: 1
                }, {
                    text: _("fileType"),
                    dataIndex: 'fileTypeName',
                    flex: 1
                }, {
                    text: _("fileversion"),
                    dataIndex: 'fileVersion',
                    flex: 1
                }, {
                    text: _("filename"),
                    dataIndex: 'backupFilename',
                    flex: 1
                }, {
                    text: _("backupTime"),
                    dataIndex: 'backupTime',
                    flex: 1,

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
                        handler: 'onDownload',
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
                            text: _('Delete'),
                            iconCls: 'x-fa fa-trash',
                            handler: 'onSoftDelete',
                            bind: {
                                disabled: '{!tab1MessionGridReference.selection}'
                            },
                            disabled: SEC.disable('080501')
                        }, {
                            xtype: 'combo',
                            itemId: 'exportType',
                            width: 105,
                            editable: false,
                            triggerCls: 'x-fa   fa-copy',
                            name: 'exportTypeName',
                            queryMode: 'local',
                            store: {
                                type: 'exportType'
                            },
                            emptyText: _('exportList'),
                            displayField: 'exportTypeName',
                            valueField: 'exportTypeId',
                            listeners: {
                                select: 'onSoftExport'
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
                    itemId: 'tab1MainForm',
                    hidden: true,
                    fieldDefaults: {
                        labelAlign: 'right'
                    },
                    items: [{
                        xtype: 'fieldset',
                        layout: 'anchor',
                        title: _('Search Backup Soft'),
                        margin: "00 20 20 20",
                        items: [{
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            defaultType: 'textfield',
                            margin: '0 15 15 15',
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
                                queryMode: 'local',
                                store: {
                                    type: 'backupNeType'
                                },
                                emptyText: _('please choose'),
                                displayField: 'netypename',
                                valueField: 'netypeid',
                                listeners: {
                                    // focus: 'selectSeriesFirst'
                                    change: 'backupShowFileType'
                                }

                            }]
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            margin: '0 15 15 15',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _("neIpAddr"),
                                flex: 1,
                                name: 'ipAddress'
                            }, {
                                xtype: 'datetimefield',
                                fieldLabel: _('backupTime'),
                                name: 'backupTimeMin',
                                labelSeparator: '<font color="black">>=</font>',
                                flex: 1
                            }, {
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'backupTimeMax',
                                labelSeparator: '<font color="black"><=</font>',
                                fieldLabel: _('backupTime'),
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
                                name: 'fileTypeName',
                                flex: 1,
                                queryMosde: 'local',
                                store: {
                                    type: 'fileType'
                                },
                                emptyText: _('please choose'),
                                displayField: 'fileTypeName',
                                valueField: 'fileTypeName',
                                // value: ''
                            }, {
                                xtype: 'textfield',
                                fieldLabel: _('fileversion'),
                                flex: 1,
                                name: 'fileVersion'
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
                        iconCls: 'x-fa  fa-search',
                        handler: 'onFormSubmit'
                    }]
                }]
            }]
        }, {
            title: _('CardSoft'),
            xtype: 'container',
            layout: 'anchor',
            cls: 'shadow',
            controller: 'dataBackupFileTab2Controller',
            viewModel: {
                data: {
                    task_status: 1,
                    flag1: 1,
                    flag2: 1,
                    selectedSoft: [],
                    selectedNe: [],
                    ftpValue: '',
                    btns: []
                }
            },
            items: [{
                xtype: 'PagedGrid',
                title: _('Backup Soft List'),
                autoLoad: true,
                itemId: 'softGrid',
                reference: 'tab2MessionGridReference',
                columnLines: true,
                store: {

                    // 每页显示记录数
                    pageSize: 15,
                    proxy: {
                        type: 'ajax',
                        url: '/ccd/configcenter/backup/soft/card/infos',
                        extraParams: {},
                        reader: {
                            type: 'json',
                            rootProperty: 'CardBackupSoft',
                            //: 'totalCount'
                            totalProperty: 'totalCount'
                        },
                    }
                },
                selType: 'checkboxmodel',
                columns: [{
                    text: _("neName"),
                    dataIndex: 'hostname',
                    flex: 1

                }, {
                    text: _('neType'),
                    dataIndex: 'netypename',
                    flex: 1
                }, {
                    text: _("neIpAddr"),
                    dataIndex: 'ipaddress',
                    flex: 1
                }, {
                    text: _("cardName"),
                    dataIndex: 'cardDisplayName',
                    flex: 1
                }, {
                    text: _('cardType'),
                    dataIndex: 'cardTypeDisplayName',
                    flex: 1
                }, {
                    text: _('fileType'),
                    dataIndex: 'fileTypeName',
                    flex: 1
                }, {
                    text: _('fileversion'),
                    dataIndex: 'fileVersion',
                    flex: 1
                }, {
                    text: _('filename'),
                    dataIndex: 'backupFilename',
                    flex: 1
                }, {
                    text: _("backupTime"),
                    dataIndex: 'backupTime',
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
                        handler: 'onDownload',
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
                            text: _('Delete'),
                            iconCls: 'x-fa fa-trash',
                            handler: 'onSoftDelete',
                            bind: {
                                disabled: '{!tab2MessionGridReference.selection}'
                            },
                            disabled: SEC.disable('080501')
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
                                select: 'onSoftExport'
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
                }, {
                    xtype: 'form',
                    itemId: 'tab2MainForm',
                    hidden: true,
                    fieldDefaults: {
                        labelAlign: 'right'
                    },
                    items: [{
                        xtype: 'fieldset',
                        defaultType: 'textfield',
                        title: _('Search Backup Soft'),
                        layout: 'anchor',
                        margin: "00 20 20 20",
                        items: [{
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            defaultType: 'textfield',
                            margin: '0 15 15 15',
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
                                emptyText: _('please choose'),
                                queryMode: 'local',
                                store: {
                                    type: 'backupNeType'
                                },
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
                            margin: '0 15 15 15',
                            items: [{
                                xtype: 'textfield',
                                fieldLabel: _('cardName'),
                                flex: 1,
                                name: 'cardDisplayName'
                            }, {
                                xtype: 'textfield',
                                fieldLabel: _("neIpAddr"),
                                flex: 1,
                                name: 'ipAddress'
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
                                listeners: {
                                    change: 'backupShowFileType',
                                }
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
                                name: 'fileTypeName',
                                flex: 1,
                                queryMosde: 'local',
                                store: {
                                    type: 'fileType'
                                },
                                emptyText: _('please choose'),
                                displayField: 'fileTypeName',
                                valueField: 'fileTypeName',
                                value: ''
                            }, {
                                xtype: 'textfield',
                                fieldLabel: _('fileversion'),
                                flex: 1,
                                name: 'fileVersion'
                            }, {
                                xtype: 'datetimefield',
                                fieldLabel: _('operTime'),
                                name: 'backupTimeMin',
                                labelSeparator: '<font color="black">>=</font>',
                                flex: 1
                            }]
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            labelWidth: 60,
                            margin: '0 15 15 15',
                            items: [{
                                xtype: 'datetimefield',
                                flex: 1,
                                name: 'backupTimeMax',
                                labelSeparator: '<font color="black"><=</font>',
                                fieldLabel: _('operTime'),
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
                        iconCls: 'x-fa  fa-search',
                        handler: 'onFormSubmit'
                    }]
                }]
            }]
        }]
    }]

});