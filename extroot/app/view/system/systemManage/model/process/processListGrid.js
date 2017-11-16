Ext.define('Admin.view.system.systemManage.model.process.processListGrid', {
    extend: 'Ext.data.Model',
    fields: ['process_name', 'subsys_name', 'port','rstatus','mstatus'],
    proxy: {
        type: 'ajax',
        url: '/sysmanage/sysmng/process',
        reader: {
            type: 'json',
            rootProperty: 'process_instance',
            totalProperty: 'total_count'
        }
    }
});