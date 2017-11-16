Ext.define('Admin.view.performance.thresholdTemplateMangement.viewModel.TTMDetailPage.TTMDetailPage', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.TTMDetailPage',
	stores: {

		//主页初始化加载数据
		templateInit: {
			autoLoad: true,

			// 每页显示记录数
			pageSize: 10000,

			model: 'Admin.view.performance.thresholdTemplateMangement.model.TTMDetailPage.TTMDetailPage',


		},
	}
});