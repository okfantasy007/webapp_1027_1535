Ext.define('Admin.view.system.syslog.viewModel.safelog.safeLogGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.safeLogGrid',
    stores: {
    	safeLogGridStore: {
            model: 'Admin.view.system.syslog.model.safelog.safeLogGrid',
            autoLoad: true,
			pageSize: Ext.create('syslogConfig').defaultConfig.logPageSize
        }
    }
});