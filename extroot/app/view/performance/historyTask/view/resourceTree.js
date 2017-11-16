Ext.define('Admin.view.performance.historyTask.view.resourceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'resourceTree',
	controller: {
		onExpandAll: function () {
			var card = this.getView().up();
			var resourceTree = card.down('#resourceTree');
			resourceTree.expandAll();
		},
		onClick: function () {
			var card = this.getView().up();
			console.info(card);
			var resourceTree = card.down('#resourceTree');
			var grid = card.down('#addSourceGrid');
			var store = grid.getStore();
			var id = resourceTree.getSelection()[0].id;
			var ids = {
				metricId: id,
			};
			store.proxy.url = "/pmManagement/api/pmmng/pmTaskDetai/findResource",
				store.proxy.extraParams = ids;
			store.reload();
		},

	},
	rootVisible: true,
	itemId: 'resourceTree',
	useArrows: true,
	bufferedRenderer: false,
	//checkPropagation: 'both',
	onlyLeafCheckable: true,
	animate: true,
	store: {
		autoLoad: false,
		root: {
			text: _('Resources'),
			icon: '/stylesheets/icons/resource/icon/16x16/deviceview.png',
			//"checked":false,
			expanded: true,
		},
		type: 'tree',
		proxy: {
			type: 'ajax',
			url: '/pmManagement/api/pmmng/pmTaskDetai/findMetricTree',
			reader: {
				type: 'json',
			},
		}
	},
	listeners: {
		beforeshow: 'onExpandAll',
		itemclick: 'onClick',
	},
})