Ext.define('Admin.view.performance.historyTaskDisplay.view.taskResourceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'taskResourceTree',
	controller: {
		onVerification: function (node, checked, e, eOpts) {
			var card = this.getView().up().up();
			var taskResourceTree = card.down('#taskResourceTree');
			var records = taskResourceTree.getChecked();
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
		},
	},
	rootVisible: true,
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
			//"checked":false,
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
		// itemclick :'onSelect',
		checkchange: 'onVerification'
	},
})