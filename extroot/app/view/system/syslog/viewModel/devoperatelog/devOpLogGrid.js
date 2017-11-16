Ext.define('Admin.view.system.syslog.viewModel.devoperatelog.devOpLogGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.devOpLogGrid',
    stores: {
    	safeLogGridStore: {
            model: 'Admin.view.system.syslog.model.devoperatelog.devOpLogGrid',
            autoLoad: true,
			pageSize: Ext.create('syslogConfig').defaultConfig.logPageSize
        }
    }
});