Ext.define('Admin.view.system.systemManage.viewModel.perDataDump.dataRestoreGrid', {
	 extend: 'Ext.app.ViewModel',
	 alias: 'viewmodel.dataRestoreGrid',
	 stores: {
    	dataRestoreListStore: {
            model: 'Admin.view.system.systemManage.model.perDataDump.dataRestoreGrid',
            autoLoad: true,
        }
	 }
});