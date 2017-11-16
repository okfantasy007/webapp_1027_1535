Ext.define('Admin.view.performance.historyTask.view.singUpdEquipmentTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'singUpdEquipmentTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up();
			var equipmentTree = card.down('#singUpdEquipmentTree');
			var id = equipmentTree.getSelection()[0].id;
			var store = card.down('#singleUpdResourceTree').getStore();
			// leaf=equipmentTree.getSelection()[0].get('leaf');
			var ids = { neId: id };
			store.proxy.url = '/pmManagement/api/pmmng/pmTask/findResourceByDevice',
				store.proxy.extraParams = ids;
			store.reload();
		},
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
			url: '/pmManagement/api/pmmng/pmTask/findRealTaskDevice',
			reader: {
				type: 'json',
			},
		}
	},
	listeners: {
		itemclick: 'onSelect',
	},
});