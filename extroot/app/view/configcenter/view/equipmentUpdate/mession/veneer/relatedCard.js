Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.veneer.relatedCard', {
    extend: 'Ext.container.Container',
    xtype: 'relatedCard',
    layout: 'fit',
    listeners: {
        activate: 'nePolling',
        deActivate: function (grid) {
            var obj = grid.up('equipmentUpdateMession');
            var task = obj.lookupController().getViewModel().get('task');
            console.log(task);
            if (task != 'task') {
                Ext.TaskManager.stop(task);
                console.log('停止');
                obj.lookupController().getViewModel().set('task', 'task');
            }
        }
    },
    items: [{
        xtype: 'PagedGrid',
        itemId: 'relatedNe',
        reference: 'tab2NEgridReference',
        columnLines: true,
        store: {
            autoLoad: true,
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/card/oper/list',
                reader: {
                    type: 'json',
                    rootProperty: 'cardOperations',
                    totalProperty: 'totalCount'
                },
            }
        },

        selType: 'checkboxmodel',
        columns: [{
            text: _("cardName"),
            dataIndex: 'cardDisplayName',
            flex: 1
        }, {
            text: _("cardType"),
            dataIndex: 'cardTypeName',
            flex: 1
        }, {
            text: _("neName"),
            dataIndex: 'neHostname',
            flex: 1
        }, {
            text: _("neIpAddr"),
            dataIndex: 'neIpaddr',
            flex: 1
        }, {
            text: _('onlineStatus'),
            dataIndex: 'onlineStatus',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === '在位') {
                    return '<span style="color:green;">' + value + '</span>';
                } else if (value === '离位') {
                    return '<span style="color:red;">' + value + '</span>';
                }

            }
        }, {
            text: _("fileversion"),
            dataIndex: 'softVersion',
            flex: 1
        }, {
            text: _("operType"),
            dataIndex: 'operType',
            flex: 1
        }, {
            text: _('operStatus'),
            dataIndex: 'operStatus',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === '未操作') {
                    return '<span style="color:red;">' + value + '</span>';
                } else if (value === '已完成') {
                    return '<span style="color:green;">' + value + '</span>';
                } else if (value === '进行中') {
                    return '<span style="color:#87CEEB;">' + value + '</span>';
                }

            }
        }, {
            text: _("operDesc"),
            dataIndex: 'operDesc',
            flex: 1
        }, {
            text: _("operTime"),
            dataIndex: 'operTime',
            flex: 1
        }, {

            xtype: 'widgetcolumn',
            text: _('Operation'),
            width: 110,

            widget: {
                xtype: 'button',
                text: '操作菜单',
                style: {
                    padding: '5px',
                    //background: '#00868B',
                    marginTop: '2px',
                },
                menu: [{
                    iconCls: 'x-fa fa-smile-o ',
                    text: _('Active Task'),
                    handler: 'onNeActive',
                    itemId: 'activeId',
                    disabled: SEC.disable('080204')

                }, {
                    iconCls: 'x-fa fa-git-square',
                    text: _('Get Version'),
                    handler: 'ongetVersion',

                }, {
                    iconCls: 'x-fa fa-search',
                    text: _('Scan Soft'),

                    handler: 'onSoftScan',
                }]
            },
            onWidgetAttach: 'weitherActive'
        }, ],
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
                    itemId: 'closeNe',
                    flag: 0,
                    handler: 'onCloseRelatedNe',
                    listeners: {
                        click: function (me) {
                            me.flag = 1;
                            console.log('@#$%');
                        }
                    }
                }, {
                    text: _('Remove'),
                    iconCls: 'x-fa fa-remove',
                    handler: 'onTab2MainGridRemove',
                    bind: {
                        disabled: '{!tab2NEgridReference.selection}'
                    }
                },
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
                    // value: -1,
                    listeners: {
                        select: 'onRelatedNeExport'
                    }
                },
                '->',
                {
                    text: _('Refresh'),
                    iconCls: 'x-fa fa-refresh',
                    handler: 'gridRefresh',
                }
            ]
        }]
    }]
});