Ext.define('Admin.view.performance.historyTask.view.detailSingleResouTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'detailSingleResouTree',
	controller: {
		onExpandAll: function () {
			var card = this.getView().up();
			var resourceTree = card.down('#detailSingleResouTree');
			resourceTree.expandAll();
		}
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
			expanded: true,
		},
		type: 'tree',
		proxy: {
			type: 'ajax',
			url: '/pmManagement/api/pmmng/pmTaskDetai/findResourceByTaskId',
			reader: {
				type: 'json',
			},
		}
	},
	listeners: {
		beforeshow: 'onExpandAll',
	},
})