Ext.define('Admin.view.system.systemManage.viewModel.dbBackup.dbBackupListGrid', {
	 extend: 'Ext.app.ViewModel',
	 alias: 'viewmodel.dbBackupListGrid',
	    stores: {
	    	dbBackupListStore: {
	            model: 'Admin.view.system.systemManage.model.dbBackup.dbBackupListGrid',
	            autoLoad: true,
	            pageSize: 10,
	        }
	    }
	});