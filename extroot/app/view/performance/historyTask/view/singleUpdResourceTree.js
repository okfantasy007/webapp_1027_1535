Ext.define('Admin.view.performance.historyTask.view.singleUpdResourceTree', {
	extend: 'Ext.tree.Panel',
	xtype: 'singleUpdResourceTree',
	controller: {
		onExpandAll: function () {
			var card = this.getView().up();
			var resourceTree = card.down('#singleUpdResourceTree');
			resourceTree.expandAll();
		},
		onSelect: function () {
			var card = this.getView().up();
			var singleUpdResourceTree = card.down('#singleUpdResourceTree');
			var records = singleUpdResourceTree.getChecked();
			var templateForm = this.getView().up().up().up().up().down('#updTemplateSettings');
			if (records.lengh > 0) {
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
			var singleUpdResourceTree = this.getView().up().down('#singleUpdResourceTree');
			var record = singleUpdResourceTree.getChecked();
			var singUpdTempButton = this.getView().up().up().up().down('#singUpdTempButton');
			singUpdTempButton.setDisabled(record.length == 0);
		}
	},
	rootVisible: true,
	itemId: 'resourceTree',
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
		beforeshow: 'onExpandAll',
		itemclick: 'onSelect',
		checkchange: 'onSelectChange'

	},
})