Ext.define('Admin.view.system.syslog.model.systemoperatelog.sysOpLogGrid', {
    extend: 'Ext.data.Model',
    //fields: ['process_name', 'subsys_name', 'port','rstatus','mstatus'],
    proxy: {
        type: 'ajax',
        url: '/syslog/api/log/v1/oplog?result=all&level=all',
        reader: {
            type: 'json',
			rootProperty: 'rows',
            totalProperty: 'total'
        }
    }
    /*proxy: {
        type: 'ajax',
        url: '/sysmanage/sysmng/processes',
        reader: {
            type: 'json',
            rootProperty: 'process_instance'
        }
    }*/
});