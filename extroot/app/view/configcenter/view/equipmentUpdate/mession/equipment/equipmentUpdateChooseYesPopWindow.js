Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentUpdateChooseYesPopWindow', {
    extend: 'Ext.container.Container',
    xtype: 'neChooseYes',
    layout: 'fit',
    items: [{
        xtype: 'PagedGrid',
        itemId: 'softGrid',
        levelId: 1,
        title: _('File List'),
        columnLines: true,
        selType: 'checkboxmodel',
        store: {
            autoLoad: true,
            // 每页显示记录数
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/ne/file/list',
                reader: {
                    type: 'json',
                    rootProperty: 'neUpgradeSofts',
                    //: 'totalCount'
                    totalProperty: 'totalCount'
                },
            },
        },
        listeners: {
            select: 'softSelect',
            deselect: 'softDeselect',
            // load: 'softLoad'
            afterrender: 'renderGrid'
        },
        columns: [{
            text: _("neType"),
            dataIndex: 'neTypeName',
            flex: 1
        }, {
            text: _("fileType"),
            dataIndex: 'fileTypeName',
            flex: 1
        }, {
            text: _("filename"),
            dataIndex: 'filename',
            flex: 1
        }, {
            text: _("fileSize"),
            dataIndex: 'fileSize',
            flex: 1
        }, {
            text: _("remark"),
            dataIndex: 'remark',
            flex: 1
        }, {
            text: _("username"),
            dataIndex: 'username',
            flex: 1
        }, {
            text: _("backupTime"),
            dataIndex: 'backupTime',
            flex: 1
        }],
        pagingbarDock: 'top',
        pagingbarDefaultValue: 15,
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
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                    text: _('Back'),
                    iconCls: 'x-fa  fa-reply',
                    handler: 'onBack',
                },
                // {
                //     text: _('Add'),
                //     iconCls: 'x-fa fa-plus',
                //     handler: 'onChooseYesPopwindowGridAdd',
                //     bind: {
                //         disabled: '{!chooseYesPopWindowGrida.selection}'
                //     }
                // },
                {
                    xtype: 'checkbox',
                    margin: '0 10 0 10',
                    itemId: 'showSelectedSoft',
                    //fieldLabel: _('Selected'),
                    boxLabel: _('Selected'),
                    listeners: {
                        change: 'onShowChoosedSoft'
                    }
                },
                {
                    text: _('Import'),
                    handler: 'onImportSelectedSoft'
                },

                '->',
                {
                    text: _('Search File'),
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
            itemId: 'chooseYesPopWindowForm',
            hidden: true,
            fieldDefaults: {
                labelAlign: 'right'
            },
            items: [{
                xtype: 'fieldset',
                title: _('Choose File'),
                defaultType: 'textfield',
                layout: 'anchor',
                margin: 20,
                items: [{
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,

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
                        },

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
                            //afterrender: 'firstSoftSelect'
                        }
                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    defaultType: 'textfield',
                    margin: '0 20 20 20',
                    items: [{
                        fieldLabel: _('fileversion'),
                        name: 'fileVersion',
                        flex: 1
                    }, {
                        xtype: 'datetimefield',
                        fieldLabel: _('startTime'),
                        name: 'startTime',
                        flex: 1
                    }, {
                        xtype: 'datetimefield',
                        flex: 1,
                        name: 'endTime',
                        fieldLabel: _('endTime'),
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