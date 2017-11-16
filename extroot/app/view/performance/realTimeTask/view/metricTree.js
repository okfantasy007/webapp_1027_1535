Ext.define('Admin.view.performance.realTimeTask.view.metricTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'metricTree',
	controller: {
		onExpandAll: function () {
			var card = this.getView().up();
			var resourceTree = card.down('#metricTree');
			resourceTree.expandAll();
			console.info(metricTree);
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up();
			var metricTree = card.down('#metricTree');
			var records = metricTree.getChecked();
			var parentNodeId = null;
			for (var i = 0; i < records.length; i++) {
				parentNodeId = records[0].parentNode.id;
				if (i > 0 && parentNodeId != records[i].parentNode.id) {
					node.set('checked', false);
					Ext.Msg.alert(_('Can not cross domain selection!'));
				}
				if (records.length > 5) {
					Ext.Msg.alert(_('Can not exceed 10 indicators!'));
					node.set('checked', false);
				};
			}
		}
	},
	rootVisible: true,
	itemId: 'metricTree',
	useArrows: true,
	bufferedRenderer: false,
	//checkPropagation: 'both',
	onlyLeafCheckable: true,
	animate: true,
	store: {
		autoLoad: false,
		root: {
			text: _('metric group'),
			icon: '/stylesheets/icons/resource/icon/16x16/deviceview.png',
			//"checked":false,
			expanded: true,
		},
		type: 'tree',
		proxy: {
			type: 'ajax',
			url: '/pmManagement/api/pmmng/metricTmpl/findMetricByResource',
			reader: {
				type: 'json',
				rootProperty: 'children',// 根节点
			},
		}
	},
	listeners: {
		beforeshow: 'onExpandAll',
		checkchange: 'onVerification'
	},
})