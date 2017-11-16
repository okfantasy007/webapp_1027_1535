Ext.define('Admin.view.system.syslog.viewModel.systemoperatelog.sysOpLogGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.sysOpLogGrid',
    stores: {
    	safeLogGridStore: {
            model: 'Admin.view.system.syslog.model.systemoperatelog.sysOpLogGrid',
            autoLoad: true,
			pageSize: Ext.create('syslogConfig').defaultConfig.logPageSize
        }
    }
});