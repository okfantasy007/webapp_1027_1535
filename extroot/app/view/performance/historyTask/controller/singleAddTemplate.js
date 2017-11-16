Ext.define('Admin.view.performance.historyTask.controller.singleAddTemplate', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.singleAddTemplate',

	onFilterThresholdTemp: function () {
		var form = this.lookupReference('singleAddThresholdTempSerchForm');
		form.setHidden(!form.isHidden())
	},

	onQuerysingleAddThreshold: function () {
		var card = this.getView().up();
		form = card.down('#singleAddTemplate').down('#singleAddThresholdTempSerchForm');
		var values = form.getForm().getValues();
		var paging = card.down('#singleAddTemplate').down('#singleAddThresholdGrid').down('#singleAddThresholdToobar');
		paging.moveFirst();
		var store = card.down('#singleAddTemplate').down('#singleAddThresholdGrid').getStore();
		store.proxy.url = "/pmManagement/api/pmmng/thresholdTmpl/queryThresholdTmpl",
			store.proxy.extraParams = { tmplName: values.tcaTmplName };
		paging.reset();
		store.reload();
	},

	onConfirm: function () {
		var card = this.getView().up();
		var form = card.down('#singleAdd');
		var quotaGrid = card.down('#singleAddQuotaTemplateGrid');
		var thresholdGrid = card.down('#singleAddThresholdGrid');
		var recordQuota = quotaGrid.getSelectionModel().getSelection()[0];
		var recordThreshold = thresholdGrid.getSelectionModel().getSelection()[0];
		if (recordQuota == undefined) {
			Ext.Msg.alert(_('metric templ not null'))
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
		form = card.down('#singleAdd');
		card.setActiveItem(form);
	},
	onReset: function () {
		var card = this.getView().up();
		form = card.down('#singleAddTemplate').down('#singleAddThresholdTempSerchForm');
		form.getForm().reset();
	},
	onRefreshThresholdTemp: function () {
		var card = this.getView().up();
		grid = card.down('#singleAddThresholdGrid');
		grid.getStore().getProxy().setExtraParams();
		grid.getStore().reload();

	},
})