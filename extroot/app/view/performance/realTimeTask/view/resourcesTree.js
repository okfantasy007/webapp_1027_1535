Ext.define('Admin.view.performance.realTimeTask.view.resourcesTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'resourcesTree',
	controller: {
		onSelect: function () {
			var card = this.getView().up();
			var resourcesTree = card.down('#resourcesTree');
			var metricTree = card.down('#metricTree');
			var store = metricTree.getStore();
			var records = resourcesTree.getChecked();
			if (records.length < 1) {
				Ext.Msg.alert(_('please select resource'))
			} else {
				id = records[0].data.id;
				store.proxy.url = '/pmManagement/api/pmmng/metricTmpl/findMetricByResource',
					store.proxy.extraParams = { resourceId: id };
				store.reload();
			}
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up();
			var resourcesTree = card.down('#resourcesTree');
			var records = resourcesTree.getChecked();
			var parentNodeId = null;
			for (i = 0; i < records.length; i++) {
				parentNodeId = records[0].parentNode.id;
				if (i > 0 && parentNodeId != records[i].parentNode.id) {
					node.set('checked', false);
					Ext.Msg.alert(_("Can not cross domain selection"));
				}
				if (records.length > 5) {
					Ext.Msg.alert(_("Sorry, up to five resources can be added!"));
					node.set('checked', false);
				};
			}
		}
	},
	rootVisible: true,
	itemId: 'resourcesTree',
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