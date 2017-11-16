Ext.define('Admin.view.configcenter.store.adminName', {
	extend: 'Ext.data.Store',
	alias: 'store.adminName',
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