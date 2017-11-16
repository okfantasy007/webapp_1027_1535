Ext.define('Admin.view.system.syslog.model.devoperatelog.devOpLogGrid', {
    extend: 'Ext.data.Model',
    //fields: ['process_name', 'subsys_name', 'port','rstatus','mstatus'],
    proxy: {
        type: 'ajax',
        url: '/syslog/api/log/v1/syslog',
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