Ext.define('Admin.view.performance.reportExport.view.reportResourcesTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'reportResourcesTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up();
			var reportResourcesTree = card.down('#reportResourcesTree');
			var metric = card.down('#metric');
			var store = metric.getStore();
			var records = reportResourcesTree.getChecked();
			if (records.length < 1) {
				Ext.Msg.alert(_('please select resource'));
			} else {
				var id = records[0].data.id;
				store.proxy.url = '/pmManagement/api/pmmng/metricTmpl/findMetricByResource',
					store.proxy.extraParams = { resourceId: id };
				store.reload();
			}
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up();
			var reportResourcesTree = card.down('#reportResourcesTree');
			var records = reportResourcesTree.getChecked();
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
	itemId: 'reportResourcesTree',
	useArrows: true,
	bufferedRenderer: false,
	animate: true,
	store: {
		autoLoad: false,
		root: {
			text: _('Resources'),
			icon: '/stylesheets/icons/resource/icon/16x16/deviceview.png',
			// "checked":false,
			expanded: true,
		},
		type: 'tree',
		proxy: {
			type: 'ajax',
			url: '/pmManagement/api/pmmng/pmTaskDetai/findResourceByDevice',
			reader: {
				type: 'json',
				rootProperty: 'children',// 根节点
			},
		}
	},
	listeners: {
		itemclick: 'onSelect',
		checkchange: 'onVerification'
	},
})