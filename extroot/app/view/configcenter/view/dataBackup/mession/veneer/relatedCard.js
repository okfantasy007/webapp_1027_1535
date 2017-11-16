Ext.define('Admin.view.configcenter.view.dataBackup.mession.veneer.relatedCard', {
    extend: 'Ext.container.Container',
    xtype: 'backupRelatedCard',
    layout: 'fit',
    listeners: {
        activate: 'nePolling',
        deActivate: function (grid) {
            var obj = grid.up('backupMession');
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
        title: _('Related Ne'),
        itemId: 'relatedNe',
        reference: 'tab2MainVeneerGrid',
        columnLines: true,
        store: {
            // 每页显示记录数
            pageSize: 15,
            proxy: {
                type: 'ajax',
                url: '/ccd/configcenter/backup/task2card/infos',
                reader: {
                    type: 'json',
                    rootProperty: 'BackupOperationCardVo',
                    //: 'totalCount'
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
            dataIndex: 'cardTypeDisplayName',
            flex: 1
        }, {
            text: _("neName"),
            dataIndex: 'hostname',
            flex: 1
        }, {
            text: _("neIpAddr"),
            dataIndex: 'ipaddressV4',
            flex: 1
        }, {
            text: _("onlineStatus"),
            dataIndex: 'isexisting',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === '在线') {
                    return '<span style="color:green;">' + value + '</span>';
                } else if (value === '离线') {
                    return '<span style="color:red;">' + value + '</span>';
                }

            }
        }, {
            text: _("softVersion"),
            dataIndex: 'softwareVer',
            flex: 1
        }, {
            text: _("operType"),
            dataIndex: 'operType',
            flex: 1
        }, {
            text: _("operStatus"),
            dataIndex: 'operStatus',
            flex: 1,
            renderer: function (value, meta, record) {


                if (value === 1) {
                    return '<span style="color:red;">' + '未操作' + '</span>';
                } else if (value === 2) {
                    return '<span style="color:#87CEEB;">' + '进行中' + '</span>';
                } else if (value === 3) {
                    return '<span style="color:green;">' + '已完成' + '</span>';
                }

            }
        }, {
            text: _("operDesc"),
            dataIndex: 'softwareVer',
            flex: 1
        }, {
            text: _("operTime"),
            dataIndex: 'operTime',
            flex: 1
        }],
        pagingbarDock: 'top',
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                    text: _('Back'),
                    tooltip: _('Back To TaskList'),
                    iconCls: 'x-fa  fa-reply',
                    handler: 'onCloseRelatedNe',
                }, {
                    text: _('Remove'),
                    iconCls: 'x-fa fa-trash',
                    handler: 'onRemoveRelatedNe',
                    bind: {
                        disabled: '{!tab2MainVeneerGrid.selection}'
                    }
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
                        'select': 'onRelatedNeExport'
                    }
                },
                '->',
                {
                    text: _('Refresh'),
                    iconCls: 'x-fa fa-refresh',
                    handler: 'gridRefresh',
                }
            ]
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
        }
    }]
});