Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentInputNEBackupFile', {
    extend: 'Ext.container.Container',
    xtype: 'equipmentInputNEBackupFile',
    // padding: '0 50 0 50',
    items: [{
        xtype: 'PagedGrid',
        itemId: 'backupGrid',
        levelId: 0,
        reference: 'backupGrid',
        title: _('BackupFileList'),
        columnLines: true,
        store: {
            // 每页显示记录数
            autoLoad: true,
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/backup/soft/ne/infos',
                reader: {
                    type: 'json',
                    rootProperty: 'NeBackupSofts',
                    //: 'totalCount'
                    totalProperty: 'totalCount'
                },
            }
        },
        listeners: {
            itemclick: 'onBackupFileGridClick'
        },
        selType: 'checkboxmodel',
        columns: [{
            text: _('neName'),
            dataIndex: 'hostname',

            flex: 1

        }, {
            text: _('neType'),
            dataIndex: 'netypename',

            flex: 1

        }, {
            text: _('neIpAddr'),
            dataIndex: 'ipaddress',

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
            text: _('backupTime'),
            dataIndex: 'backupTime',

            flex: 1
        }, {
            text: _('filename'),
            dataIndex: 'backupFilename',

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
                    text: _('choose'),
                    itemId: 'theChooseBtn',
                    iconCls: 'x-fa  fa-hand-grab-o',
                    handler: 'onChoose',
                    bind: {
                        disabled: '{!backupGrid.selection}'
                    }
                },
                '->',
                {
                    text: _('search file'),
                    iconCls: 'x-fa fa-toggle-off',
                    handler: 'showForm',
                },
                {
                    text: _('Refresh'),
                    iconCls: 'x-fa  fa-refresh',
                    handler: 'gridRefresh',

                }

            ]
        }, {
            //导入备份文件form
            xtype: 'form',
            hidden: true,
            itemId: 'inputBackupForm',
            fieldDefaults: {
                labelAlign: 'right'
            },
            items: [{
                xtype: 'fieldset',
                defaultType: 'textfield',
                layout: 'anchor',
                title: _('search backupfile'),
                margin: 20,
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
                    margin: '0 20 20 20',
                    items: [{
                            fieldLabel: _('neName'),
                            name: 'neName',
                            flex: 1,
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
                        }

                    ]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
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
                            //afterrender: 'firstSoftSelect',

                        }
                    }, {
                        xtype: 'datetimefield',
                        flex: 1,
                        name: 'startTime',
                        fieldLabel: _('search StartTime')
                    }, {
                        xtype: 'datetimefield',
                        flex: 1,
                        name: 'endTime',
                        fieldLabel: _('search EndTime')


                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('neIpAddr'),
                        name: 'neIpAddr',
                        flex: 1
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
                handler: 'onFormSubmit'
            }]
        }]
    }]
});