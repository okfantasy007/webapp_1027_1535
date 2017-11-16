Ext.define('Admin.view.performance.historyTask.controller.updTreeFormControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.updTreeFormControl',

	onCancelTree: function () {
		var card = this.getView().up();
		var form = card.down('#upd');
		card.setActiveItem(form);
	},
	saveOriginalValues: function (form) {
		if (!form.orgValues) {
			form.orgValues = Ext.clone(form.getForm().getValues());
		}
	},

	//数据回填  
	onSubmitTree: function () {
		var card = this.getView().up();
		console.info(card);
		var form = card.down('#upd');
		//原始表格
		var grid = card.down('#updSourceGrid');
		var records = grid.getSelectionModel().getSelection();
		var record = grid.getSelectionModel().getSelection()[0];
		var metypeId = record.get('metypeId');
		//目标表格
		var addGrid = card.down('#updResourceGrid');
		addGrid.getStore().loadData(records, true);
		Ext.Ajax.request({
			url: '/pmManagement/api/pmmng/pmTask/findMetricTmpl',
			method: "get",
			params: { metypeId: metypeId, flag: '1' },
			success: function (response, options) {
				var  resu  = JSON.parse(response.responseText);
				var tmplName = resu.result[0].metricTmplName;
				var templateForm = card.down('#updTemplateSettings');
				templateForm.form.findField("metricTmplName").setValue(tmplName);
				card.setActiveItem(form);
			}
		});

	}
})