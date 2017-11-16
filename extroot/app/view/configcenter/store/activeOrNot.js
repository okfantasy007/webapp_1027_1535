Ext.define('Admin.view.configcenter.store.activeOrNot', {
	extend: 'Ext.data.Store',
	alias: 'store.activeOrNot',
	fields: ['id', 'name'],
	data:
	[{ "id": "1", "name": "是" },
	{ "id": "2", "name": "否" }]
});	