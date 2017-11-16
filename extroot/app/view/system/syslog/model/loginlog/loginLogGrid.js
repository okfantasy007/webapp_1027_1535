Ext.define('Admin.view.system.syslog.model.loginlog.loginLogGrid', {
    extend: 'Ext.data.Model',
    //fields: ['process_name', 'subsys_name', 'port','rstatus','mstatus'],
    proxy: {
        type: 'ajax',
        url: '/syslog/api/log/v1/loginlog?level=all&result=all',
        reader: {
            type: 'json',
			rootProperty: 'rows',
            totalProperty: 'total'
        }
    }
});