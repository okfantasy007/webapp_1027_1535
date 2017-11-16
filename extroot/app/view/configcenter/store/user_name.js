Ext.define('Admin.view.configcenter.store.user_name', {
	extend: 'Ext.data.Store',
	alias: 'store.user_name',
	fields: ['id', 'name'],
	// data: [{
	// 		"id": "0",
	// 		"name": "全部"
	// 	},
	// 	{
	// 		"id": "1",
	// 		"name": "Administory"
	// 	}

	// ],
	proxy: {
		type: 'ajax',
		autoLoad: true,
		url: '/confcenter/configcenter/res/users',
		reader: {
			type: 'json',
			rootProperty: 'users',
		},
	}
});