Ext.define('Admin.view.performance.historyTaskDisplay.controller.historyDisplay', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.historyDisplay',
	onConfirm: function () {
		var card = this.getView();
		var form = card.down('historyChartView');
		var chart1View = card.down('#chart1View');
		var chart2View = card.down('#chart2View');
		var chart3View = card.down('#chart3View');
		var chart4View = card.down('#chart4View');
		var chart5View = card.down('#chart5View');
		var chart6View = card.down('#chart6View');
		var chart7View = card.down('#chart7View');
		var chart8View = card.down('#chart8View');
		var chart9View = card.down('#chart9View');
		var chart10View = card.down('#chart10View');
		chart10View.setHidden(true);
		chart9View.setHidden(true);
		chart8View.setHidden(true);
		chart7View.setHidden(true);
		chart6View.setHidden(true);
		chart5View.setHidden(true);
		chart4View.setHidden(true);
		chart3View.setHidden(true);
		chart2View.setHidden(true);
		chart1View.setHidden(true);
		var historyTaskGrid = card.down('#historyTaskGrid');
		var gridRecord = historyTaskGrid.getSelectionModel().getSelection()[0];
		var equipmentRecord = card.down('#equipTree').getSelection()[0];
		var recordMetric = card.down('#taskMetricTree').getChecked();
		var taskResourceRecord = card.down('#taskResourceTree').getChecked();
		if (equipmentRecord == undefined && gridRecord == undefined) {
			Ext.Msg.alert(_('please select device or task'));
		} else if (recordMetric.length == 0) {
			Ext.Msg.alert(_('please select metric'));
		} else if (taskResourceRecord.length == 0) {
			Ext.Msg.alert(_('please select resource'));
		} else {
			card.setActiveItem(form);
		}
	},
	onSelect: function () {
		var card = this.getView().up();
		var grid = card.down('#historyTaskGrid');
		var taskResourceTree = card.down('#taskResourceTree');
		var taskMetricTree = card.down('#taskMetricTree');
		var metricStore = taskMetricTree.getStore();
		var store = taskResourceTree.getStore();
		var record = grid.getSelectionModel().getSelection()[0];
		var tid = record.get('taskId');
		var ids = { taskId: tid };
		store.proxy.url = "/pmManagement/api/pmmng/pmTaskDetai/findResourceByTaskId",
			store.proxy.extraParams = ids;
		store.reload();

		metricStore.proxy.url = "/pmManagement/api/pmmng/pmTaskDetai/findHistoryMetricByTaskId",
			metricStore.proxy.extraParams = ids;
		metricStore.reload();

	},
});