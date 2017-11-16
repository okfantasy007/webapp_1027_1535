Ext.define('Admin.view.performance.reportExport.view.metric', {
	extend: 'Ext.tree.Panel',
	xtype: 'metric',
	controller: {
		onExpandAll: function () {
			var card = this.getView().up();
			var metric = card.down('#metric');
			metric.expandAll();
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up();
			var metric = card.down('#metric');
			var records = metric.getChecked();
			var parentNodeId = null;
			for (var i = 0; i < records.length; i++) {
				parentNodeId = records[0].parentNode.id;
				if (i > 0 && parentNodeId != records[i].parentNode.id) {
					node.set('checked', false);
					Ext.Msg.alert(_("Can not cross domain selection"));
				}
			}
		}
	},
	rootVisible: true,
	itemId: 'metric',
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
			// "checked":false,
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