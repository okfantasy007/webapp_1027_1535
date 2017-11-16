Ext.define('Admin.view.performance.reportExport.view.reportDeviceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'reportDeviceTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up().up();
			var reportDeviceTree = card.down('#reportDeviceTree');
			var reportResourcesTree = card.down('#reportResourcesTree');
			var metric = card.down('#metric');
			//清除选中行
			var recordMetric = metric.getSelection();
			//metricTree.getSelectionModel().deselect(recordMetricTree);
			metric.getStore().remove(recordMetric);
			//清除选中
			var record = metric.getChecked();
			metric.getStore().remove(record);
			var store = reportResourcesTree.getStore();
			var id = reportDeviceTree.getSelection()[0].id;
			var ids = { neId: id };
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
	selModel: {
		selType: 'checkboxmodel'
	},
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