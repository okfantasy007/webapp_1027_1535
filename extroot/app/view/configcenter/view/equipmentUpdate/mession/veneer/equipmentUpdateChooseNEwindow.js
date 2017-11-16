Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.veneer.equipmentUpdateChooseNEwindow', {
    extend: 'Ext.container.Container',
    xtype: 'upgradeChooseCard',
    layout: 'fit',
    items: [{
        xtype: 'PagedGrid',
        title: _('Card List'),
        itemId: 'neGrid',
        levelId: 1,
        columnLines: true,
        selType: 'checkboxmodel',
        store: {
            autoLoad: true,
            // 每页显示记录数
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/res/card/list',
                reader: {
                    type: 'json',
                    rootProperty: 'cards',
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
            text: _("cardName"),
            dataIndex: 'cardName',
            flex: 1
        }, {
            text: _("cardType"),
            dataIndex: 'cardTypeName',
            flex: 1
        }, {
            text: _("neName"),
            dataIndex: 'hostname',
            flex: 1
        }, {
            text: _("neIpAddr"),
            dataIndex: 'neIpAddr',
            flex: 1
        }, {
            text: _("isexisting"),
            dataIndex: 'isexisting',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === '在位') {
                    return '<span style="color:green;">' + '在位' + '</span>';
                } else if (value === '离位') {
                    return '<span style="color:#FF0000;">' + '离位' + '</span>';
                }
            }
        }, {
            text: _("softVersion"),
            dataIndex: 'softwareVer',
            flex: 1
        }],
        pagingbarDock: 'top',
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
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                    text: _('Back'),
                    iconCls: 'x-fa  fa-reply',
                    handler: 'onBack',
                }, {
                    xtype: 'checkbox',
                    margin: '0 10 0 10',
                    //fieldLabel: _('Selected'),
                    itemId: 'showSelectedNe',
                    boxLabel: _('Selected'),
                    listeners: {
                        change: 'showChoosedNe'
                    }
                }, {
                    text: _('Import'),
                    handler: 'onImportSelectedNe'
                },
                '->',
                {
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
                // title: '选择网元',
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
                        fieldLabel: _('cardName'),
                        name: 'cardName',
                        flex: 1
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

                    }, {
                        xtype: 'textfield',
                        fieldLabel: _('neIpAddr'),
                        name: 'neIpAddr',
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
                            fieldLabel: _('onlineStatus'),
                            name: 'isexisting',
                            flex: 1,
                            queryMosde: 'local',
                            store: {
                                type: 'onlineState'
                            },
                            emptyText: _('please choose'),
                            displayField: 'name',
                            valueField: 'id',
                            value: -1
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: _('fileversion'),
                            name: 'softwareVer',
                            flex: 1
                        }, {
                            xtype: 'panel',
                            flex: 1
                        }
                    ]
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