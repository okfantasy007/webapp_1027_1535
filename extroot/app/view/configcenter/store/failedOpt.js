Ext.define('Admin.view.configcenter.store.failedOpt', {
	extend: 'Ext.data.Store',
	alias: 'store.failedOpt',
	fields: ['id', 'name'],
	data: [{
			"id": -1,
			"name": "所有选项"
		},
		{
			"id": 1,
			"name": "启用"
		},
		{
			"id": 2,
			"name": "禁用"
		}
	]
});