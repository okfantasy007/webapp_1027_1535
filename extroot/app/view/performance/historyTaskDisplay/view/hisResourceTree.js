Ext.define('Admin.view.performance.historyTaskDisplay.view.hisResourceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'hisResourceTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up();
			hisResourceTree = card.down('#hisResourceTree'),
				hisMetricTree = card.down('#hisMetricTree'),
				store = hisMetricTree.getStore();
			id = hisResourceTree.getSelection()[0].id;
			var ids = { resourceId: id };
			store.proxy.url = '/pmManagement/api/pmmng/metricTmpl/findMetricByResource',
				store.proxy.extraParams = ids;
			store.reload();
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up().up();
			hisResourceTree = card.down('#hisResourceTree');
			records = hisResourceTree.getChecked();
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
	itemId: 'hisResourceTree',
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
			//  "checked":false,
			expanded: true,
		},
		type: 'tree',
		proxy: {
			type: 'ajax',
			url: '/pmManagement/api/pmmng/pmTask/findResourceByDevice',
			reader: {
				type: 'json',
			},
		}
	},
	listeners: {
		itemclick: 'onSelect',
		checkchange: 'onVerification'
	},
})