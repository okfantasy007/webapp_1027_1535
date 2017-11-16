Ext.define('Admin.view.performance.historyTaskDisplay.view.equipTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'equipTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up();
			var equipTree = card.down('#equipTree');
			var hisResourceTree = card.down('#hisResourceTree');
			var hisMetricTree = card.down('#hisMetricTree');
			//清除选中行
			var recordHisMetricTree = hisMetricTree.getSelection();
			//hisMetricTree.getSelectionModel().deselect(recordHisMetricTree);
			hisMetricTree.getStore().remove(recordHisMetricTree);
			//清除选中
			var recordHisMetric = hisMetricTree.getChecked();
			hisMetricTree.getStore().remove(recordHisMetric);
			var store = hisResourceTree.getStore();
			var id = equipTree.getSelection()[0].id;
			var ids = { neId: id };
			store.proxy.url = '/pmManagement/api/pmmng/pmTask/findResourceByDevice',
				store.proxy.extraParams = ids;
			store.reload();
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up();
			var equipTree = card.down('#equipTree');
			var records = equipTree.getChecked();
			var parentNodeId = null;
			for (i = 0; i < records.length; i++) {
				parentNodeId = records[0].parentNode.id;
				if (i > 0 && parentNodeId != records[i].parentNode.id) {
					node.set('checked', false);
					Ext.Msg.alert(_("Can not cross domain selection"));
				}
				if (records.length > 5) {
					Ext.Msg.alert(_("Tip: The number of resources can not exceed five"));
					node.set('checked', false);
				};
			}
		}
	},
	rootVisible: true,
	itemId: 'equipTree',
	useArrows: true,
	bufferedRenderer: false,
	//checkPropagation: 'both',
	onlyLeafCheckable: true,
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
		// checkchange:'onVerification'
	},
})