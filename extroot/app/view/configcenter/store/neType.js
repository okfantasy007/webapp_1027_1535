Ext.define('Admin.view.configcenter.store.neType', {
	extend: 'Ext.data.Store',
	alias: 'store.neType',
	fields: [
		{ name: 'netypeid' }, { name: 'netypename' }],
	proxy: {
		type: 'ajax',
		autoLoad: true,
		url: '/confcenter/configcenter/res/neType/upgrade/list',
		reader: {
			type: 'json',
			rootProperty: 'neTypes',
		},
	}
});	