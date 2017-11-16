Ext.define('Admin.view.performance.historyTaskDisplay.model.taskStoreModel', {
	extend: 'Ext.data.Model',
	proxy: {
		type: 'ajax',
		url: '/pmManagement/api/pmmng/pmTask/queryTask',
		reader: {
			type: 'json',
			rootProperty: 'rows',// 根节点
			totalProperty: 'total'
		},
	}
});