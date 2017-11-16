Ext.define('Admin.view.performance.estimate.model.basicStoreModel', {
	extend: 'Ext.data.Model',
	proxy: {
		type: 'ajax',
		url: '/pmCollect/api/estimate/findEstimate',
		reader: {
			type: 'json',
			rootProperty: 'data',// 根节点
			totalProperty: 'total'
		},
	}

});
