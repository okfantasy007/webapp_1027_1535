Ext.define('Admin.view.performance.historyTaskDisplay.controller.historyChart1', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.historyChart1',
	onAxisLabelRender: function (axis, label, layoutContext) {
		return label.toFixed(label < 10 ? 1 : 0);
	},
	//图形导出
	export: function () {
		var chart = this.getView().up().up().down('#chart1');
		var title = chart.getTitle();
		Ext.MessageBox.confirm(_('Confirm Download'), _('Would you like to download the chart as an image'), function (choice) {
			if (choice == 'yes') {
				chart.download({
					    url: '/pmManagement/api/export/image',
	                    format: "jpeg",
	                    filename: encodeURI(title),
				});
			}
		});
	},
	//数据导出
	onDataExport: function () {
		var card = this.getView().up().up().up();
		var historyTaskGrid = card.down('#historyTaskGrid');
		var resourceIds = []; var metricIds = [];
		var gridRecord = historyTaskGrid.getSelectionModel().getSelection()[0];
		var startTime = card.down('#startTime').getValue();
		var endTime = card.down('#endTime').getValue();
		var num = [' '];
		if (gridRecord == undefined) {
			var resourceRecords = card.down('#hisResourceTree').getChecked();
			for (var i = 0; i < resourceRecords.length; i++) {
				resourceIds.push(resourceRecords[i].data.id);
				var resourceIds = num.concat(resourceIds)
			};
			var metricRecords = card.down('#hisMetricTree').getChecked();
			for (var i = 0; i < metricRecords.length; i++) {
				metricIds.push(metricRecords[i].data.id);
			};
			var equipmentId = card.down('#equipTree').getSelection()[0].id;
			var params = {
				startTime: startTime,
				endTime: endTime,
				equipmentId: equipmentId,
				metricId: metricIds[0],
				resourceIds: resourceIds
			}
		} else {
			var taskResourceRecords = card.down('#taskResourceTree').getChecked();
			for (var i = 0; i < taskResourceRecords.length; i++) {
				resourceIds.push(taskResourceRecords[i].data.id);
				var resourceIds = num.concat(resourceIds)
			};
			var taskMetricRecords = card.down('#taskMetricTree').getChecked();
			for (var i = 0; i < taskMetricRecords.length; i++) {
				metricIds.push(taskMetricRecords[i].data.id);
			};
			var taskId = gridRecord.get('taskId');
			var params = {
				startTime: startTime,
				endTime: endTime,
				taskId: taskId,
				metricId: metricIds[0],
				resourceIds: resourceIds
			}
		};
		Ext.Ajax.request({
			url: '/t1/api/Pm/export/doc/csv',
			method: "POST",
			params: params,
			success: function (res) {
				var obj = Ext.decode(res.responseText);
				window.location.href = '/t1/api/Pm/export/doc/csv/download?filename=' + obj.filename;
			}
		});
	},

	setTitleY: function () {
		var card = this.getView().up().up();
		var hisMetricTree = card.down('#hisMetricTree');
		var recordsQutoType = hisMetricTree.getChecked();

		var taskMetricTree = card.down('#taskMetricTree');
		var recordTaskMetricTree = taskMetricTree.getChecked();
		var qutoTypeTitles = [];
		if (recordsQutoType.length > 0) {
			for (var i = 0; i < recordsQutoType.length; i++) {
				qutoTypeTitles.push(recordsQutoType[i].data.text);
			};
			return qutoTypeTitles;
		} else {
			for (var i = 0; i < recordTaskMetricTree.length; i++) {
				qutoTypeTitles.push(recordTaskMetricTree[i].data.text);
			};
			return qutoTypeTitles;
		}
	},
	onlin1: function (tooltip, record, item) {
		var item1 = item;
		item1.series.setTitle(this.setTitleY()[0]);
		console.info(item1.series.getYField());
		var title = item1.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item1.series.getYField()));
	},

	onlin2: function (tooltip, record, item) {
		var item2 = item;
		item2.series.setTitle(this.setTitleY()[1]);
		var title = item2.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item2.series.getYField()));
	},
	onlin3: function (tooltip, record, item) {
		var item3 = item;
		item3.series.setTitle(this.setTitleY()[2]);
		var title = item3.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item3.series.getYField()));
	},
	onlin4: function (tooltip, record, item) {
		var item4 = item;
		item4.series.setTitle(this.setTitleY()[3]);
		var title = item4.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item4.series.getYField()));
	},
	onlin5: function (tooltip, record, item) {
		var item5 = item;
		item5.series.setTitle(this.setTitleY()[4]);
		var title = item5.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item5.series.getYField()));
	},
	onlin6: function (tooltip, record, item) {
		var item6 = item;
		var title = item6.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item6.series.getYField()));
	},
	onlin7: function (tooltip, record, item) {
		var item7 = item;
		var title = item7.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item7.series.getYField()));
	},
	onlin8: function (tooltip, record, item) {
		var item8 = item;
		var title = item8.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item8.series.getYField()));
	},
	onlin9: function (tooltip, record, item) {
		var item9 = item;
		var title = item9.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item9.series.getYField()));
	},
	onlin10: function (tooltip, record, item) {
		var item10 = item;
		var title = item10.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item10.series.getYField()));
	},
	onlin11: function (tooltip, record, item) {
		var item11 = item;
		var title = item11.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item11.series.getYField()));
	},
	onlin12: function (tooltip, record, item) {
		var item12 = item;
		var title = item12.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item12.series.getYField()));
	},
	onlin13: function (tooltip, record, item) {
		var item13 = item;
		var title = item13.series.getTitle();
		tooltip.setHtml(title + ' on ' + record.get('time') + ': ' +
			record.get(item13.series.getYField()));
	},
	onColumnRender: function (v) {
		return v;
	},
	onToggleMarkers: function () {
		var chart = this.lookupReference('chart1'),
			seriesList = chart.getSeries(),
			ln = seriesList.length,
			i = 0,
			series;

		for (; i < ln; i++) {
			series = seriesList[i];
			series.setShowMarkers(!series.getShowMarkers());
		}

		chart.redraw();
	},
	onPanZoomReset1: function () {
		var chart = this.lookupReference('chart1');
		this.visibleRange(chart)
		chart.redraw();
	},
	onAxisRangeChange: function (axis, range) {
		if (!range) {
			return;
		}
		// expand the range slightly to make sure markers aren't clipped
		var max = range[1];
		if (max >= 1000) {
			range[1] = max - max % 100 + 100;
		} else {
			range[1] = max - max % 50 + 50;
		}
	},
	visibleRange: function (chart) {
		var card = this.getView().up().up();
		var axes = chart.getAxes();
		var store = chart.getStore();
		store.getFields();
		var count = store.getTotalCount();
		axes[1].setVisibleRange([0, 50 / count]);
	},
	onModeToggle1: function (segmentedButton, button, pressed) {
		var chart = this.lookupReference('chart1'),
			interactions = chart.getInteractions(),
			panzoom = interactions[0],
			crosshair = interactions[1],
			value = segmentedButton.getValue(),
			isCrosshair = value === 0;

		crosshair.setEnabled(isCrosshair);
		panzoom.setEnabled(!isCrosshair);
		panzoom.setZoomOnPanGesture(value === 2);
	},
	/* onRender10: function () {
		 var chart = this.lookupReference('chart10'),
			 toolbar = this.lookupReference('toolbar10'),
			 panzoom = chart.getInteractions()[0];
			toolbar.add(panzoom.getModeToggleButton());
			panzoom.getModeToggleButton().width=50,
			panzoom.getModeToggleButton().items.items[0].width=30;
			panzoom.getModeToggleButton().items.items[1].width=30;
			panzoom.getModeToggleButton().items.items[0].text=null;
			panzoom.getModeToggleButton().items.items[1].text=null;
			panzoom.getModeToggleButton().items.items[1].iconCls='x-fa add_resource_icon';
			panzoom.getModeToggleButton().items.items[0].iconCls='x-fa green_home';
	 },*/
	onAutoRefresh: function (chart) {
		this.timeChartTask = Ext.TaskManager.start({
			run: this.onRefresh,
			interval: 5 * 1000,
			repeat: 120,
			scope: this
		});
	},
	//动态设置阈值线显示问题
	onThreshold: function () {
		var card = this.getView().up().up();
		var chart = card.down('#chart1');
		var lines = chart.getSeries();
		if (lines[5].getYField() == 'L_1_threshold') {
			lines[5].setYField('e');
			lines[5].setXField('xValue');
		} else {
			lines[5].setYField('L_1_threshold');
			lines[5].setXField('xValue');
		};
		if (lines[6].getYField() == 'L_2_threshold') {
			lines[6].setYField('e');
			lines[6].setXField('xValue');
		} else {
			lines[6].setYField('L_2_threshold');
			lines[6].setXField('xValue');
		};
		if (lines[7].getYField() == 'L_3_threshold') {
			lines[7].setYField('e');
			lines[7].setXField('xValue');
		} else {
			lines[7].setYField('L_3_threshold');
			lines[7].setXField('xValue');
		};
		if (lines[8].getYField() == 'L_4_threshold') {
			lines[8].setYField('e');
			lines[8].setXField('xValue');
		} else {
			lines[8].setYField('L_4_threshold');
			lines[8].setXField('xValue');
		};
		if (lines[9].getYField() == 'H_1_threshold') {
			lines[9].setYField('e');
			lines[9].setXField('xValue');
		} else {
			lines[9].setYField('H_1_threshold');
			lines[9].setXField('xValue');
		};
		if (lines[10].getYField() == 'H_2_threshold') {
			lines[10].setYField('e');
			lines[10].setXField('xValue');
		} else {
			lines[10].setYField('H_2_threshold');
			lines[10].setXField('xValue');
		};
		if (lines[11].getYField() == 'H_3_threshold') {
			lines[11].setYField('e');
			lines[11].setXField('xValue');
		} else {
			lines[11].setYField('H_3_threshold');
			lines[11].setXField('xValue');
		};
		if (lines[12].getYField() == 'H_4_threshold') {
			lines[12].setYField('e');
			lines[12].setXField('xValue');
		} else {
			lines[12].setYField('H_4_threshold');
			lines[12].setXField('xValue');
		};
		chart.getStore().reload();
	},
});