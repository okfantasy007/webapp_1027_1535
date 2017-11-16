Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentSoftwareList', {
    extend: 'Ext.window.Window',
    xtype: 'equipmentSoftwareList',
    title: "设备软件列表--设备",
    width: 800,
    height: 470,
    layout: 'fit',
    scrollable: true,
    modal: true,
    resizable: true,
    bodyPadding: '10px',
    items: [{
        xtype: 'grid',
        itemId: 'softScan',
        columnLines: true,
        store: {
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/confcenter/configcenter/upgrade/ne/oper/getSoftInfos',
                reader: {
                    type: 'json',
                    rootProperty: 'deviceSoftInfos',
                    totalProperty: 'totalCount'
                },
            }
        },
        // titleAlign: 'center',
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
        // pagingbarDock: 'top',
    }]
});