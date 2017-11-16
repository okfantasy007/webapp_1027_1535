Ext.define('Admin.view.performance.historyTask.view.detailequipTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'detailequipTree',
	controller: {
	},
	rootVisible: true,
	useArrows: true,
	bufferedRenderer: false,
	//checkPropagation: 'both',
	animate: true,
	store: {
		autoLoad: false,
		root: {
			text: _('All equipment'),
			expanded: true,
			leaf: 'false',
		},
		type: 'tree',
		proxy: {
			type: 'ajax',
			url: '/pmManagement/api/pmmng/pmTaskDetai/findDeviceByTaskId',
			reader: {
				type: 'json',
			},
		}
	},
});