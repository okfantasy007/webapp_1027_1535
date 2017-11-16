Ext.define('Admin.view.configcenter.store.veneer', {
	extend: 'Ext.data.Store',
	alias: 'store.veneer',
	// fields: [
	// 	{ name: 'cardTypeId' }, { name: 'cardTypeName' }],
	proxy: {
		type: 'ajax',
		autoLoad: true,
		url: '/confcenter/configcenter/res/cardType/upgrade/list',
		reader: {
			type: 'json',
			rootProperty: 'cardTypes',
			//: 'totalCount'
			totalProperty: 'totalCount'

		},
	}
});