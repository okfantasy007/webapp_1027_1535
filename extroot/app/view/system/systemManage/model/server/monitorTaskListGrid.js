Ext.define('Admin.view.system.systemManage.model.server.monitorTaskListGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/sysmanage/sysmng/monitor/task',
        reader: {
            type: 'json',
            rootProperty: 'task',
            totalProperty: 'total_count'
        }
    }
});