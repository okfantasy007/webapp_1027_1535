Ext.define('Admin.view.performance.historyTask.controller.updTemplateControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.updTemplateControl',

	onFilterthresholdTemp: function () {
		var form = this.lookupReference('updThresholdTempSerchForm');
		form.setHidden(!form.isHidden())
	},

	onQueryThreshold: function () {
		var card = this.getView().up();
		var form = card.down('#updTemplate').down('#updThresholdTempSerchForm');
		var values = form.getForm().getValues();
		console.info("values:", values);
		var paging = card.down('#updTemplate').down('#updThresholdGrid').down('#updThresholdToobar');
		paging.moveFirst();
		var store = card.down('#updTemplate').down('#updThresholdGrid').getStore();
		store.proxy.url = "/pmManagement/api/pmmng/thresholdTmpl/queryThresholdTmpl";
		store.proxy.extraParams = { tmplName: values.tcaTmplName };
		paging.reset();
		store.reload();
	},

	onConfirm: function () {
		var card = this.getView().up();
		var form = card.down('#upd');
		var quotaGrid = card.down('#updQuotaTemplateGrid');
		var thresholdGrid = card.down('#updThresholdGrid');
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
		var form = card.down('#upd');
		card.setActiveItem(form);
	},
	onReset: function () {
		var card = this.getView().up();
		var form = card.down('#updTemplate').down('#updThresholdTempSerchForm');
		form.getForm().reset();
	},
	onRefreshThresholdTemp: function () {
		var card = this.getView().up();
		var grid = card.down('#updThresholdGrid');
		grid.getStore().getProxy().setExtraParams()
		grid.getStore().reload();

	},
})