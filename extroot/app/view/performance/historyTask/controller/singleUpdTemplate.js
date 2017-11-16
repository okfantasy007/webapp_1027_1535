Ext.define('Admin.view.performance.historyTask.controller.singleUpdTemplate', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.singleUpdTemplate',

	onFilterthresholdTemp: function () {
		var form = this.lookupReference('singleUpdThresholdTempSerchForm');
		form.setHidden(!form.isHidden())
	},

	onQuerythreshold: function () {
		var card = this.getView().up();
		form = card.down('#singleUpdTemplate').down('#singleUpdThresholdTempSerchForm');
		values = form.getForm().getValues();
		var paging = card.down('#singleUpdTemplate').down('#singleUpdThresholdGrid').down('#singleUpdThresholdToobar');
		paging.moveFirst();
		var store = card.down('#singleUpdTemplate').down('#singleUpdThresholdGrid').getStore();
		store.proxy.url = "/pmManagement/api/pmmng/thresholdTmpl/queryThresholdTmpl",
			store.proxy.extraParams = { tmplName: values.tcaTmplName };
		paging.reset();
		store.reload();
	},

	onConfirm: function () {
		var card = this.getView().up();
		var form = card.down('#singleUpd');
		var quotaGrid = card.down('#singleUpdQuotaTemplateGrid');
		var thresholdGrid = card.down('#singleUpdThresholdGrid');
		var recordQuota = quotaGrid.getSelectionModel().getSelection()[0];
		var recordThreshold = thresholdGrid.getSelectionModel().getSelection()[0];
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
		form = card.down('#singleUpd');
		card.setActiveItem(form);
	},

	onReset: function () {
		var card = this.getView().up();
		form = card.down('#singleUpdTemplate').down('#singleUpdThresholdTempSerchForm');
		form.getForm().reset();
	},
	onRefreshthresholdTemp: function () {
		var card = this.getView().up();
		var grid = card.down('#singleUpdThresholdGrid');
		grid.getStore().getProxy().setExtraParams();
		grid.getStore().reload();

	},
})