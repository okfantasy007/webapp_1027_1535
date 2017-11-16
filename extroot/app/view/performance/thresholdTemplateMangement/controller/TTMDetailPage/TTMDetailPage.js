Ext.define('Admin.view.performance.thresholdTemplateMangement.controller.TTMDetailPage.TTMDetailPage', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.TTMDetailPage',

	onCancel: function () {
		this.getView().getForm().reset();
		this.getView().up().setActiveItem(0);
	},

	beforeshow: function () {
		var grid = this.getView().up().up().down('#TTMDetailPage').down('#detailPageGrid').down('#basicInfoGrid');
		var id = grid.getValues()['tcaTmplId'];
		var symbolGrid = this.getView().up().up().down('#TTMDetailPage').down('#detailPageGrid').down('#templateInfo').down('#thresholdSymbol');
		var newProxy = new Ext.data.proxy.Ajax({
			type: 'ajax',
			url: '/pmManagement/api/pmmng/thresholdTmpl/queryThresholdDefine',
			reader: {
				type: 'json',
				rootProperty: 'result'
			}
		});
		symbolGrid.getStore().setProxy(newProxy);
		symbolGrid.getStore().getProxy().setExtraParam('tcaTmplId', id);
		symbolGrid.store.reload();
	}
});