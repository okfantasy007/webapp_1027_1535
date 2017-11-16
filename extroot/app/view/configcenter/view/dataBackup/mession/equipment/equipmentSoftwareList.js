Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.equipment.equipmentSoftwareList', {
    extend: 'Ext.window.Window',
    xtype: 'equipmentSoftwareList',
    reference: 'equipmentSoftwareList1',
    title: "设备软件列表",
    width: 400,
    height: 500,
    layout: 'fit',
    scrollable: true,
    modal: true,
    resizable: true,
    items: [{
        xtype: 'container',
        layout: 'anchor',
        bodyPadding: 10,
        // hidden:true,
        items: [
            {
                xtype: 'grid',
                itemId: 'equipmentSoftwareListGrid',
                columnLines: true,
                store: {
                    autoLoad: true,
                    // 每页显示记录数
                    pageSize: 15,
                    proxy: {
                        type: 'ajax',
                        url: '/rest/redis/lsj/mainForm/grid',
                        reader: {
                            type: 'json',
                            rootProperty: 'data',
                            //: 'totalCount'
                            totalProperty: 'totalCount'
                        },
                    }
                },
                // collapsible: false,
                // titleCollapse:true,
                // collapsed: true,
                titleAlign: 'center',
                columns: [{
                    text: "文件类型",
                    dataIndex: 'fileType',
                    flex: 1
                }, {
                    text: "版本",
                    dataIndex: 'version',
                    flex: 1
                }, {
                    text: "状态",
                    dataIndex: 'state',
                    flex: 1
                }, {
                    text: "激活时间",
                    dataIndex: 'activeTime',
                    flex: 1
                }]

            }]

    }]
});
