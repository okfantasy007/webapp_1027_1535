Ext.define('Admin.view.performance.historyTask.view.singleResourceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'singleResourceTree',
	controller: {
		onExpandAll: function () {
			var card = this.getView().up();
			var resourceTree = card.down('#singResourceTree');
			resourceTree.expandAll();
		},
		onSelect: function () {
			var card = this.getView().up();
			var singleResourceTree = card.down('#singleResourceTree');
			var records = singleResourceTree.getChecked();
			var templateForm = this.getView().up().up().up().up().down('#singTemplateSettings');
			console.info(templateForm);
			if (records.length < 1) {
				Ext.Msg.alert(_('please select resource'));
			} else {
				id = records[0].data.id;
				Ext.Ajax.request({
					url: '/pmManagement/api/pmmng/pmTask/findMetricTmpl',
					method: "get",
					params: { metypeId: id, flag: '1' },
					success: function (response, options) {
						var  resu  = JSON.parse(response.responseText);
						var tmplName = resu.result[0].metricTmplName;
						templateForm.form.findField("metricTmplName").setValue(tmplName);
					}
				});
			}
		},
		onSelectChange: function (thi, rowIndex, checked, eOpts) {
			var singleResourceTree = this.getView().up().down('#singleResourceTree');
			var record = singleResourceTree.getChecked();
			var singAddTempButton = this.getView().up().up().up().down('#singAddTempButton');
			singAddTempButton.setDisabled(record.length == 0);
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
		beforeshow: 'onExpandAll',
		itemclick: 'onSelect',
		checkchange: 'onSelectChange'

	},
})