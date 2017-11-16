Ext.define('Admin.view.configcenter.store.cycle', {
	extend: 'Ext.data.Store',
	alias: 'store.cycle',
	fields: ['id', 'name'],
	data: [{
			"id": -1,
			"name": "所有选项"
		},
		{
			"id": 1,
			"name": "每天"
		},
		{
			"id": 2,
			"name": "每周"
		},
		{
			"id": 3,
			"name": "每月"
		},
	]
});