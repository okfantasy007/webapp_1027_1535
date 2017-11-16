Ext.define('Admin.view.configcenter.view.dataBackup.mession.equipment.relatedNe', {
    extend: 'Ext.container.Container',
    xtype: 'backupRelatedNe',
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
        reference: 'tab1NEgridReference',
        columnLines: true,
        store: {
            // 每页显示记录数
            pageSize: 15,
            // field: [
            //     { name: 'hostname', mapping: 'backupOperationNesVo.neid' },
            //     { name: 'netypename', mapping: 'backupOperationNesVo.netypename' },
            //     { name: 'ipaddressV4', mapping: 'backupOperationNesVo.ipaddressV4' },
            //     { name: 'operStatus', mapping: 'backupOperationNesVo.operStatus' },
            //     { name: 'softwareVer', mapping: 'backupOperationNesVo.softwareVer' },
            //     { name: 'operStatus', mapping: 'backupOperationNesVo.operStatus' },
            //     { name: 'operDesc', mapping: 'backupOperationNesVo.operDesc' },
            //     { name: 'operTime', mapping: 'backupOperationNesVo.operTime' }

            // ],
            proxy: {
                type: 'ajax',
                //url: '/ccd/configcenter/backup/task/ne/infos',
                url: '/ccd/configcenter/backup/task2ne/infos',
                reader: {
                    type: 'json',
                    rootProperty: 'BackupOperationNeVo', //: 'totalCount'
                    totalProperty: 'totalCount'
                }
            }
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
            text: _('onlineStatus'),
            dataIndex: 'resourcestate',
            flex: 1,
            renderer: function (value, meta, record) {
                if (value === 1) {
                    return '<span style="color:green;">' + '在线' + '</span>';
                } else if (value === 2) {
                    return '<span style="color:red;">' + '离线' + '</span>';
                }

            }
        }, {
            text: _('softVersion'),
            dataIndex: 'softwareVer',
            flex: 1
        }, {
            text: _('operStatus'),
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
            text: _('operDesc'),
            dataIndex: 'operDesc',
            flex: 1
        }, {
            text: _('operTime'),
            dataIndex: 'operTime',
            flex: 1
        }],
        pagingbarDock: 'top',
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                    text: _('Back'),
                    iconCls: 'x-fa  fa-reply',
                    handler: 'closeNeGrid',
                }, {
                    text: _('Remove'),
                    iconCls: 'x-fa fa-trash',
                    handler: 'onRemoveRelatedNe',
                    bind: {
                        disabled: '{!tab1MessionGridReference.selection}'
                    },

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