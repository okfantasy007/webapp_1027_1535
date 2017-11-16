Ext.define('Admin.view.performance.historyTask.controller.treeFormControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.treeFormControl',

	onCancelTree: function () {
		// this.getView().up().setActiveItem(0);
		var card = this.getView().up();
		form = card.down('#add');
		card.setActiveItem(form);
	},
	onSelectChange: function (thi, selected, eOpts) {
		var card = this.getView().up();
		var grid = card.down('#addSourceGrid');
		var record = grid.getSelectionModel().getSelection()[0];
		var rsName = record.get('metypeName');
		var rsName2 = selected.get('metypeName');
		if (rsName2 != rsName) {
			Ext.Msg.alert(_('Tip: can only choose the same type of resources'));
		}

	},
	//数据回填  
	onSubmitTree: function () {
		var card = this.getView().up();
		console.info(card);
		form = card.down('#add');
		//原始表格
		var grid = card.down('#addSourceGrid');
		var records = grid.getSelectionModel().getSelection();
		var record = grid.getSelectionModel().getSelection()[0];
		var metypeId = record.get('metypeId');
		//目标表格
		var addGrid = card.down('#resourceGrid');
		addGrid.getStore().loadData(records, true);
		Ext.Ajax.request({
			url: '/pmManagement/api/pmmng/pmTask/findMetricTmpl',
			method: "get",
			params: { metypeId: metypeId, flag: '1' },
			success: function (response, options) {
				var  resu  = JSON.parse(response.responseText);
				var tmplName = resu.result[0].metricTmplName;
				var templateForm = card.down('#templateSettings');
				templateForm.form.findField("metricTmplName").setValue(tmplName);
				card.setActiveItem(form);
			}
		});

	}
})