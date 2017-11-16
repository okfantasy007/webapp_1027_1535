Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.veneer.cardSoftwareList', {
    extend: 'Ext.window.Window',
    xtype: 'cardSoftwareList',
    title: "设备软件列表--单板",
    width: 800,
    height: 470,
    layout: 'fit',
    scrollable: true,
    modal: true,
    resizable: true,
    items: [{
        xtype: 'grid',
        itemId: 'softScan',
        columnLines: true,
        store: {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/card/oper/getSoftInfos',
                reader: {
                    type: 'json',
                    rootProperty: 'deviceSoftInfos',
                    //: 'totalCount'
                    totalProperty: 'totalCount'
                },
            }
        },
        columns: [{
            text: "文件类型",
            dataIndex: 'fileTypeName',
            flex: 1
        }, {
            text: "版本",
            dataIndex: 'fileVersion',
            flex: 1
        }, {
            text: "状态",
            dataIndex: 'activateStatus',
            flex: 1
        }, {
            text: "激活时间",
            dataIndex: 'activateTime',
            flex: 1
        }],
        pagingbarDock: 'top',
    }]
});