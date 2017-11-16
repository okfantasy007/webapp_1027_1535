Ext.define('Admin.view.performance.historyTask.controller.templateControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.templateControl',

	/* onCancel: function() {
		  this.getView().up().setActiveItem(0);
	 },*/

	onFilterThresholdTemp: function () {
		var form = this.lookupReference('thresholdTempSerchForm');
		form.setHidden(!form.isHidden())
	},
	onQueryThreshold: function () {
		var card = this.getView().up();
		form = card.down('#template').down('#thresholdTempSerchForm');
		values = form.getForm().getValues();
		var paging = card.down('#template').down('#thresholdGrid').down('#thresholdToobar');
		paging.moveFirst();
		var store = card.down('#template').down('#thresholdGrid').getStore();
		store.proxy.url = "/pmManagement/api/pmmng/thresholdTmpl/queryThresholdTmpl",
			store.proxy.extraParams = { tmplName: values.tcaTmplName };
		paging.reset();
		store.reload();
	},

	onConfirm: function () {
		var card = this.getView().up();
		form = card.down('#add'),
			quotaGrid = card.down('#quotaTemplateGrid'),
			thresholdGrid = card.down('#thresholdGrid'),
			recordQuota = quotaGrid.getSelectionModel().getSelection()[0];
		recordThreshold = thresholdGrid.getSelectionModel().getSelection()[0];
		if (recordQuota == undefined) {
			Ext.Msg.alert(_('metric templ not null'));
		};
		if (recordThreshold == undefined) {
			form.loadRecord(recordQuota);
		} else {
			form.loadRecord(recordThreshold);
			form.loadRecord(recordQuota);
		}
		card.setActiveItem(form);
	},

	onCancel: function () {
		var card = this.getView().up();
		form = card.down('#add');
		card.setActiveItem(form);
	},

	onReset: function () {
		var card = this.getView().up();
		form = card.down('#template').down('#thresholdTempSerchForm');
		form.getForm().reset();
	},
	onRefreshThresholdTemp: function () {
		var card = this.getView().up();
		grid = card.down('#thresholdGrid');
		grid.getStore().getProxy().setExtraParams();
		grid.getStore().reload();

	},
})