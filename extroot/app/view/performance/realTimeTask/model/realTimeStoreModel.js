Ext.define('Admin.view.performance.realTimeTask.model.realTimeStoreModel', {
	extend: 'Ext.data.Model',

	proxy: {
		type: 'ajax',
		url: '/pmManagement/api/pmmng/pmTask/queryTask?taskType=1',

		reader: {
			type: 'json',
			rootProperty: 'rows',// 根节点
		},
	}

});
