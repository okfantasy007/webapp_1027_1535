Ext.define('Admin.view.performance.historyTask.model.performanceStoreModel', {
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
