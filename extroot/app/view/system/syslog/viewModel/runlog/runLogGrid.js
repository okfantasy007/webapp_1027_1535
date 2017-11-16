Ext.define('Admin.view.system.syslog.viewModel.runlog.runLogGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.runLogGrid',
    stores: {
    	safeLogGridStore: {
            model: 'Admin.view.system.syslog.model.runlog.runLogGrid',
            autoLoad: true,
			pageSize: Ext.create('syslogConfig').defaultConfig.logPageSize
        }
    }
});