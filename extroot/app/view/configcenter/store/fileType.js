Ext.define('Admin.view.configcenter.store.fileType', {
	extend: 'Ext.data.Store',
	alias: 'store.fileType',
	fields: [
		{ name: 'fileTypeName' }, { name: 'fileTypeId' }],
	proxy: {
		type: 'ajax',
		// extraParams:{
		//    id:m.getValue() 
		// },

		autoLoad: true,
		url: '/confcenter/configcenter/res/fileType/ne/upgrade/list',
		reader: {
			type: 'json',
			rootProperty: 'fileTypes',
		},
	}

});