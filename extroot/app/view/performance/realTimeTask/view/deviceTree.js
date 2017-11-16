Ext.define('Admin.view.performance.realTimeTask.view.deviceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'deviceTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up().up();
			console.info(card);
			var deviceTree = card.down('#deviceTree');
			var resourcesTree = card.down('#resourcesTree');
			var metricTree = card.down('#metricTree');
			//清除选中行
			var recordMetricTree = metricTree.getSelection();
			//metricTree.getSelectionModel().deselect(recordMetricTree);
			metricTree.getStore().remove(recordMetricTree);
			//清除选中
			var recordMetric = metricTree.getChecked();
			metricTree.getStore().remove(recordMetric);

			var id = deviceTree.getSelection()[0].id;
			var ids = { neId: id };
			var store = resourcesTree.getStore();
			store.proxy.url = '/pmManagement/api/pmmng/pmTask/findResourceByDevice',
				store.proxy.extraParams = ids;
			store.reload();
		}
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
			// "checked":false,
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