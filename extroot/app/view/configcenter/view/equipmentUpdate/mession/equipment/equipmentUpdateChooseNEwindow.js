Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentUpdateChooseNEwindow', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.configcenter.store.neSeries',
    ],
    xtype: 'chooseNe',
    layout: 'fit',
    items: [{
        xtype: 'PagedGrid',
        itemId: 'neGrid',
        levelId: 1,
        columnLines: true,
        title: _('Ne List'),
        selType: 'checkboxmodel',
        store: {
            // 每页显示记录数
            autoLoad: true,
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/res/ne/list',
                reader: {
                    type: 'json',
                    rootProperty: 'nes',
                    //: 'totalCount'
                    totalProperty: 'totalCount'
                },
            }
        },
        listeners: {
            select: 'neSelect',
            deselect: 'neDeselect',
            afterrender: 'renderNeGrid'
        },
        columns: [{
            text: _("neName"),
            dataIndex: 'hostname',
            flex: 1
        }, {
            text: _("neType"),
            dataIndex: 'neTypeName',
            flex: 1
        }, {
            text: _("neIpAddr"),
            dataIndex: 'neIpAddr',
            flex: 1
        }, {
            text: _("onlineStatus"),
            dataIndex: 'resourcestate',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === '在线') {
                    return '<span style="color:green;">' + '在线' + '</span>';
                } else if (value === '离线') {
                    return '<span style="color:#FF0000;">' + '离线' + '</span>';
                }
            }
        }, {
            text: _("fileversion"),
            dataIndex: 'softwareVer',
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
                    val: 1
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
                },
                {
                    xtype: 'checkbox',
                    margin: '0 10 0 10',
                    //fieldLabel: _('Selected'),
                    itemId: 'showSelectedNe',
                    boxLabel: _('Selected'),
                    listeners: {
                        change: 'showChoosedNe'
                    }
                },
                {
                    text: _('Import'),
                    handler: 'onImportSelectedNe'
                },
                '->', {
                    text: _('Search Ne'),
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
            itemId: 'chooseNEwindowForm',
            hidden: true,
            fieldDefaults: {
                labelAlign: 'right'
            },
            items: [{
                xtype: 'fieldset',
                title: _('Choose Ne'),
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
                            focus: 'selectSeriesFirst'
                        }

                    }]
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    labelWidth: 60,
                    margin: '0 20 20 20',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: _('fileversion'),
                        name: 'softwareVer',
                        flex: 1
                    }, {
                        xtype: 'combo',
                        editable: false,
                        fieldLabel: _('onlineStatus'),
                        name: 'resourcestate',
                        flex: 1,
                        queryMosde: 'local',
                        store: {
                            type: 'onlineState'
                        },
                        emptyText: _('please choose'),
                        displayField: 'name',
                        valueField: 'id',
                        value: -1
                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('neIpAddr'),
                        name: 'neIpAddr',
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