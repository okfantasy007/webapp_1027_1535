Ext.define('Admin.view.system.syslog.model.runlog.runLogGrid', {
    extend: 'Ext.data.Model',
    //fields: ['process_name', 'subsys_name', 'port','rstatus','mstatus'],
    proxy: {
        type: 'ajax',
        url: '/syslog/api/log/v1/runlog?level=all',
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