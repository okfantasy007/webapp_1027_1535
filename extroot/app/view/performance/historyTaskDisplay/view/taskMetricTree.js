Ext.define('Admin.view.performance.historyTaskDisplay.view.taskMetricTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'taskMetricTree',
	controller: {
		onExpandAll: function () {
			card = this.getView().up();
			resourceTree = card.down('#taskMetricTree');
			resourceTree.expandAll();
			console.info(hisMetricTree);
		},
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up().up();
			hisMetricTree = card.down('#taskMetricTree');
			records = hisMetricTree.getChecked();
			var parentNodeId = null;
			for (i = 0; i < records.length; i++) {
				parentNodeId = records[0].parentNode.id;
				if (i > 0 && parentNodeId != records[i].parentNode.id) {
					node.set('checked', false);
					Ext.Msg.alert(_("Can not cross domain selection"));
				}
				if (records.length > 10) {
					Ext.Msg.alert(_("Can not exceed 10 indicators!"));
					node.set('checked', false);
				};
			}
		}
	},
	rootVisible: true,
	itemId: 'hisMetricTree',
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
			url: '/pmManagement/api/pmmng/pmTaskDetai/findHistoryMetricByTaskId',
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