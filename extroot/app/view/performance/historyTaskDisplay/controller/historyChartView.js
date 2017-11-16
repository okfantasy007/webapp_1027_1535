Ext.define('Admin.view.performance.historyTaskDisplay.controller.historyChartView', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.historyChartView',
	onCancel: function () {
		var card = this.getView().up();
		//view = card.down('#performanceMainView');
		card.setActiveItem(0);
	},
	//动态设置每行显示多少个chart
	onColumns: function () {
		var comboValue = this.getView().down('#selectColumns').getValue();
		var card = this.getView().up();
		chartPanel = card.down('#historyChartView');
		chart1 = card.down('#chart1');
		chart1.setConfig({

		})
		chartPanel.setConfig({
			layout: {
				type: 'table',
				columns: comboValue,
			}
		})
	},
	//获取资源id,作为表格的dataindex
	setYfields: function () {
		var card = this.getView().up();
		var hisResourceTree = card.down('#hisResourceTree');
		var taskResourceTree = card.down('#taskResourceTree');
		var resourceRecord = hisResourceTree.getChecked();
		var taskResourceRecord = taskResourceTree.getChecked();
		var resourceIds = [];
		if (resourceRecord.length > 0) {

			for (var i = 0; i < resourceRecord.length; i++) {
				resourceIds.push(resourceRecord[i].data.id);
			};
			return resourceIds;
		} else {
			for (var i = 0; i < taskResourceRecord.length; i++) {
				resourceIds.push(taskResourceRecord[i].data.id);
			};
			return resourceIds;
		}
	},
	//获取资源名称,作为表格的列名
	gridFields: function () {
		var card = this.getView().up();
		var hisResourceTree = card.down('#hisResourceTree');
		var taskResourceTree = card.down('#taskResourceTree');
		var resourceRecord = hisResourceTree.getChecked();
		var taskResourceRecord = taskResourceTree.getChecked();
		var resourcetext = [];
		if (resourceRecord.length > 0) {

			for (var i = 0; i < resourceRecord.length; i++) {
				resourcetext.push(resourceRecord[i].data.text);
			};
			return resourcetext;
		} else {
			for (var i = 0; i < taskResourceRecord.length; i++) {
				resourcetext.push(taskResourceRecord[i].data.text);
			};
			return resourcetext;
		}

	},
	//动态设置表格Columns属性
	setGridFields: function (grid) {
		texts = this.gridFields();
		texts1 = texts[0];
		texts2 = texts[1];
		texts3 = texts[2];
		texts4 = texts[3];
		texts5 = texts[4];
		indexs = this.setYfields();
		indexs1 = indexs[0];
		indexs2 = indexs[1];
		indexs3 = indexs[2];
		indexs4 = indexs[3];
		indexs5 = indexs[4];
		var columns = grid.getColumns();
		columns[0].setText("time");
		columns[0].dataIndex = "time";
		columns[1].setText(texts1);
		columns[1].dataIndex = indexs1;
		columns[2].setText(texts2);
		columns[2].dataIndex = indexs2;
		columns[3].setText(texts3);
		columns[3].dataIndex = indexs3;
		columns[4].setText(texts4);
		columns[4].dataIndex = indexs4;
		columns[5].setText(texts5);
		columns[5].dataIndex = indexs5;
	},
	//设置chart点数，显示50个点
	visibleRange: function (chart) {
		axes = chart.getAxes();
		lines = chart.getSeries();
		axes[0].setVisibleRange([0, 1]);
		store = chart.getStore();
		console.info(store.getFields());
		console.info(store);
		var count = store.getTotalCount();
		axes[1].setVisibleRange([0, 50 / count]);
	},
	//动态设置chart YField,节点id为store的field值
	setYline1: function (chart) {
		var lines = chart.getSeries();
		lines[0].setYField(this.setYfields()[0]);
		lines[0].setXField('xValue');
		lines[1].setYField(this.setYfields()[1]);
		lines[1].setXField('xValue');
		lines[2].setYField(this.setYfields()[2]);
		lines[2].setXField('xValue');
		lines[3].setYField(this.setYfields()[3]);
		lines[3].setXField('xValue');
		lines[4].setYField(this.setYfields()[4]);
		lines[4].setXField('xValue');
		chart.setSeries(lines);
		console.info(chart);
	},
	//动态设置chart单位
	setChartYtitle: function (chart) {
		store = chart.getStore();
		//获取store_资源id fields
		var fields1 = this.setYfields();
		//x轴数据及单位fileds
		fields2 = ['xValue', 'H_1_threshold', 'H_2_threshold', 'H_3_threshold', 'H_4_threshold', 'L_1_threshold', 'L_2_threshold', 'L_3_threshold', 'L_4_threshold', 'unit']
		//fields合并，设置store fields
		store.config.fields = fields1.concat(fields2);
		//获取第一行单位对应的值
		var units = store.data.items[0].data.unit;
		axes = chart.getAxes();
		var title = axes[0].getTitle();
		title.text = units;
		axes[0].setTitle(title);
	},
	onQuery: function () {
		var card = this.getView().up();
		var controller = this;
		var chart1 = card.down('#historyChartView').down('#chart1View').down('#chart1');
		var chart2 = card.down('#chart2');
		var chart3 = card.down('#chart3');
		var chart4 = card.down('#chart4');
		var chart5 = card.down('#chart5');
		var chart6 = card.down('#chart6');
		var chart7 = card.down('#chart7');
		var chart8 = card.down('#chart8');
		var chart9 = card.down('#chart9');
		var chart10 = card.down('#chart10');
		var historyTaskGrid = card.down('#historyTaskGrid');
		var hisMetricTree = card.down('#hisMetricTree');
		var equipmentTree = card.down('#equipTree');
		var hisResourceTree = card.down('#hisResourceTree');

		var startTime = card.down('#startTime').getValue();
		var endTime = card.down('#endTime').getValue();
		var resourceIds = []; var names = []; var ids = []; var num = [''];
		var recordTask = historyTaskGrid.getSelectionModel().getSelection()[0];
		if (recordTask == undefined) {
			//按设备展示，指标名称+id
			var records = hisMetricTree.getChecked();
			for (var i = 0; i < records.length; i++) {
				names.push(records[i].data.text);
				ids.push(records[i].data.id);
			};
			//按设备展示，资源名称+id
			var resourceRecord = hisResourceTree.getChecked();
			for (var i = 0; i < resourceRecord.length; i++) {
				resourceIds.push(resourceRecord[i].data.id);
				var resourceIds = num.concat(resourceIds)
			};
			//按设备展示，设备id
			var equipmentId = equipmentTree.getSelection()[0].id;
		} else {
			//按任务展示，任务Id
			var taskId = recordTask.get('taskId');
			//按任务展示，指标名称,id
			var recordMetric = card.down('#taskMetricTree').getChecked();
			for (var i = 0; i < recordMetric.length; i++) {
				names.push(recordMetric[i].data.text);
				ids.push(recordMetric[i].data.id);
			};
			//按任务展示，资源id
			var taskResourceRecord = card.down('#taskResourceTree').getChecked();
			for (var i = 0; i < taskResourceRecord.length; i++) {
				resourceIds.push(taskResourceRecord[i].data.id);
				var resourceIds = num.concat(resourceIds)
			};
		};
		for (var i = 0; i < names.length; i++) {
			switch (i) {
				case 0: var store = chart1.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[0],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[0],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "/t1/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param,
						store.load(function (records, operation, success) {
							if (success) {
								if ((store.data.items).length >= 1) {
									grid1 = card.down('#hisGrid1');
									controller.setGridFields(grid1);
									controller.setYline1(chart1);
									controller.setChartYtitle(chart1);
									controller.visibleRange(chart1);
									chart1.update(chart1.getStore());
									chart1.setTitle(names[0]);
									if (chart1.getTitle() != null) {
										chart1View = card.down('#chart1View'),
											chart1View.setHidden(false);
									};
								}
							}
						});
					break;
				case 1: var store = chart2.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[1],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[1],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "/pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid2');
								controller.setGridFields(grid);
								controller.setYline1(chart2);
								controller.setChartYtitle(chart2);
								controller.visibleRange(chart2);
								chart2.setTitle(names[1]);
								if (chart2.getTitle() != null) {
									chart2View = card.down('#chart2View'),
										chart2View.setHidden(false);
								};
							}
						}
					});
					break;
				case 2: var store = chart3.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[2],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[2],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = {
						taskId: taskId,
						resourceIds: resourceIds,
						metricId: ids[2],
						startTime: startTime,
						endTime: endTime,
					};
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid3');
								controller.setGridFields(grid);
								controller.setYline1(chart3);
								controller.setChartYtitle(chart3);
								controller.visibleRange(chart3);
								chart3.setTitle(names[2]);
								if (chart3.getTitle() != null) {
									chart3View = card.down('#chart3View'),
										chart3View.setHidden(false);
								};
							}
						}
					});
					break;
				case 3: var store = chart4.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[3],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[3],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid4');
								controller.setGridFields(grid);
								controller.setYline1(chart4);
								controller.setChartYtitle(chart4);
								controller.visibleRange(chart4);
								chart4.setTitle(names[3]);
								if (chart4.getTitle() != null) {
									chart4View = card.down('#chart4View'),
										chart4View.setHidden(false);
								};
							}
						}
					});
					break;
				case 4: var store = chart5.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[4],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[4],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid5');
								controller.setGridFields(grid);
								controller.setYline1(chart5);
								controller.setChartYtitle(chart5);
								controller.visibleRange(chart5);
								chart5.setTitle(names[4]);
								if (chart5.getTitle() != null) {
									chart5View = card.down('#chart5View'),
										chart5View.setHidden(false);
								};
							}
						}
					});
					break;
				case 5: var store = chart6.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[5],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[5],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid6');
								controller.setGridFields(grid);
								controller.setYline1(chart6);
								controller.setChartYtitle(chart6);
								controller.visibleRange(chart6);
								chart6.setTitle(names[5]);
								if (chart6.getTitle() != null) {
									chart6View = card.down('#chart6View'),
										chart6View.setHidden(false);
								};
							}
						}
					});
					break;
				case 6: var store = chart7.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[6],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[6],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid7');
								controller.setGridFields(grid);
								controller.setYline1(chart7);
								controller.setChartYtitle(chart7);
								controller.visibleRange(chart7);
								chart7.setTitle(names[6]);
								if (chart7.getTitle() != null) {
									chart7View = card.down('#chart7View'),
										chart7View.setHidden(false);
								};
							}
						}
					});
					break;

				case 7: var store = chart8.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[7],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[7],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid8');
								controller.setGridFields(grid);
								controller.setYline1(chart8);
								controller.setChartYtitle(chart8);
								controller.visibleRange(chart8);
								chart8.setTitle(names[7]);
								if (chart8.getTitle() != null) {
									chart8View = card.down('#chart8View'),
										chart8View.setHidden(false);
								};
							}
						}
					});
					break;
				case 8: var store = chart9.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[8],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[8],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid9');
								controller.setGridFields(grid);
								controller.setYline1(chart9);
								controller.setChartYtitle(chart9);
								controller.visibleRange(chart9);
								chart9.setTitle(names[8]);
								if (chart9.getTitle() != null) {
									var chart9View = card.down('#chart9View');
									chart9View.setHidden(false);
								};
							}
						}
					});
					break;
				case 9: var store = chart10.getStore();
					if (recordTask == undefined) {
						var param = {
							equipmentId: equipmentId,
							resourceIds: resourceIds,
							metricId: ids[9],
							startTime: startTime,
							endTime: endTime,
						};
					} else {
						var param = {
							taskId: taskId,
							metricId: ids[9],
							resourceIds: resourceIds,
							startTime: startTime,
							endTime: endTime,
						};
					};
					store.proxy.url = "pmManagement/api/pmcalc/pmdata/historydata"
					store.proxy.extraParams = param;
					store.load(function (records, operation, success) {
						if (success) {
							if ((store.data.items).length >= 1) {
								grid = card.down('#hisGrid10');
								controller.setGridFields(grid);
								controller.setYline1(chart10);
								controller.setChartYtitle(chart10);
								controller.visibleRange(chart10);
								chart10.setTitle(names[9]);
								if (chart10.getTitle() != null) {
									var chart10View = card.down('#chart10View');
									chart10View.setHidden(false);
								};
							}
						}
					});
				default:
					break;
			};
		};
	},
});