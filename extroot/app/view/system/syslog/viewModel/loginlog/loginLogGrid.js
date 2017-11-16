Ext.define('Admin.view.system.syslog.viewModel.loginlog.loginLogGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.loginLogGrid',
    stores: {
    	safeLogGridStore: {
            model: 'Admin.view.system.syslog.model.loginlog.loginLogGrid',
            autoLoad: true,
			pageSize: Ext.create('syslogConfig').defaultConfig.logPageSize
        }
    }
});