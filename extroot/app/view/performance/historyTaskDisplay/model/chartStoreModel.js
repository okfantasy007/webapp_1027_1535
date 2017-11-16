Ext.define('Admin.view.performance.historyTaskDisplay.model.chartStoreModel', {
	extend: 'Ext.data.Model',
	proxy: {
		type: 'ajax',
		url: '/pmManagement/api/pmcalc/pmdata/historydata',
		reader: {
			type: 'json',
			rootProperty: 'data',// 根节点
		},
		actionMethods: {
			create: 'POST',
			read: 'POST', // by default GET  
			update: 'POST',
			destroy: 'POST'
		}
	}

});
