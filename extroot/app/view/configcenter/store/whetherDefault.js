Ext.define('Admin.view.configcenter.store.whetherDefault', {
	extend: 'Ext.data.Store',
	alias: 'store.whetherDefault',
	fields: ['id', 'name'],
	data: [{
			"id": -1,
			"name": "所有选项"
		},
		{
			"id": 1,
			"name": "是"
		},
		{
			"id": 2,
			"name": "否"
		}
	]
});