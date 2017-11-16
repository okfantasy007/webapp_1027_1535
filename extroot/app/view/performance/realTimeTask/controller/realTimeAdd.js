Ext.define('Admin.view.performance.realTimeTask.controller.realTimeAdd', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.realTimeAdd',
	onConfirm: function () {
		var card = this.getView().up();
		var form = card.down('realTimeChartView');
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

		var chart1 = card.down('#realChart1');
		var chart2 = card.down('#realChart2');
		var chart3 = card.down('#realChart3');
		var chart4 = card.down('#realChart4');
		var chart5 = card.down('#realChart5');
		var chart6 = card.down('#realChart6');
		var chart7 = card.down('#realChart7');
		var chart8 = card.down('#realChart8');
		var chart9 = card.down('#realChart9');
		var chart10 = card.down('#realChart10');

		var grid1 = card.down('#displayGrid1');
		var grid2 = card.down('#displayGrid2');
		var grid3 = card.down('#displayGrid3');
		var grid4 = card.down('#displayGrid4');
		var grid5 = card.down('#displayGrid5');
		var grid6 = card.down('#displayGrid6');
		var grid7 = card.down('#displayGrid7');
		var grid8 = card.down('#displayGrid8');
		var grid9 = card.down('#displayGrid9');
		var grid10 = card.down('#displayGrid10');
		var deviceTree = card.down('#deviceTree');
		var devicerRecord = deviceTree.getSelection()[0];
		if (devicerRecord == undefined) {
			Ext.Msg.alert(_('please select Device'));
		} else {
			var deviceTreeId = devicerRecord.id;
		};
		var resourcesTree = card.down('#resourcesTree');
		var metricTree = card.down('#metricTree');
		var metric = metricTree.getChecked();

		var resourceRecords = resourcesTree.getChecked();

		var metricNames = []; var metricIds = []; var resourceIds = []; var resourceNames = [];
		//指标id和指标名称
		for (var i = 0; i < metric.length; i++) {
			metricNames.push(metric[i].data.text);
			metricIds.push(metric[i].data.id);
		};
		//资源id和资源名称
		for (var i = 0; i < resourceRecords.length; i++) {
			resourceIds.push(resourceRecords[i].data.id);
			resourceNames.push(resourceRecords[i].data.text);

		};
		//把资源，指标，id+name,传展示界面
		var resourceForm = card.down('#resourceForm');
		resourceForm.form.findField("resourceNames").setValue(resourceNames);
		resourceForm.form.findField("resourceIds").setValue(resourceIds);
		resourceForm.form.findField("metricIds").setValue(metricIds);


		for (var i = 0; i < metricNames.length; i++) {
			switch (i) {
				case 0: chart1.setTitle(metricNames[0]);
					break;
				case 1: chart2.setTitle(metricNames[1]);
					break;
				case 2: chart3.setTitle(metricNames[2]);
					break;
				case 3: chart4.setTitle(metricNames[3]);
					break;
				case 4: chart5.setTitle(metricNames[4]);
					break;
				case 5: chart6.setTitle(metricNames[5]);
					break;
				case 6: chart7.setTitle(metricNames[6]);
					break;
				case 7: chart8.setTitle(metricNames[7]);
					break;
				case 8: chart9.setTitle(metricNames[8]);
					break;
				case 9: chart10.setTitle(metricNames[9]);
					break;
			};
		};
		if (chart10.getTitle() == null) {
			chart10View.setHidden(true);
		} else {
			this.setGridFields(grid10);
			this.setMajorTick(chart10)
		};
		if (chart9.getTitle() == null) {
			chart9View.setHidden(true);
		} else {
			this.setGridFields(grid9);
			this.setMajorTick(chart9)
		};
		if (chart8.getTitle() == null) {
			chart8View.setHidden(true);
		} else {
			this.setGridFields(grid8);
			this.setMajorTick(chart8)
		};
		if (chart7.getTitle() == null) {
			chart7View.setHidden(true);
		} else {
			this.setGridFields(grid7);
			this.setMajorTick(chart7)
		};
		if (chart6.getTitle() == null) {
			chart6View.setHidden(true);
		} else {
			this.setGridFields(grid6);
			this.setMajorTick(chart6)
		};
		if (chart5.getTitle() == null) {
			chart5View.setHidden(true);
		} else {
			this.setGridFields(grid5);
			this.setMajorTick(chart5)
		};
		if (chart4.getTitle() == null) {
			chart4View.setHidden(true);
		} else {
			this.setGridFields(grid4);
			this.setMajorTick(chart4)
		};
		if (chart3.getTitle() == null) {
			chart3View.setHidden(true);
		} else {
			this.setGridFields(grid3);
			this.setMajorTick(chart3)
		};
		if (chart2.getTitle() == null) {
			chart2View.setHidden(true);
		} else {
			this.setGridFields(grid2);
			this.setMajorTick(chart2)
			//this.onTimeChartRendered1(chart2);
		};
		if (chart1.getTitle() == null) {
			chart1View.setHidden(true);
		} else {
			this.setGridFields(grid1);
			this.setMajorTick(chart1)
		};
		var realTaskForm = card.down('#realTask');
		var collectPeriod = card.down('#realTimeCollectPeriod').value;
		if (realTaskForm.getForm().isValid()) {
			var formValues = realTaskForm.getForm().getValues();
			var params = {
				endTime: formValues.endTime,
				collectPeriod: collectPeriod,
				protocolType: formValues.protocolType,
				createUser: formValues.createUser,
				collectType: formValues.collectType,
				resourceIds: resourceIds,
				metricIds: metricIds,
				neId: deviceTreeId
			}
			var grid = card.down('#realTimeTaskGrid');
			var endTime = formValues.endTime;
			var ccType = formValues.ccType;
			//获取当前时间
			var currentTime = new Date().getTime();
			if (ccType == "on" && endTime == "") {
				Ext.Msg.alert(_('endTime not null'));
			} else {
				var end = Date.parse(endTime);
				if (end <= currentTime) {
					Ext.Msg.alert({
						title: _('Notice'),
						msg: _('The deadline time cannot be later than the current time')
					});
					return;
				}
				Ext.Ajax.request({
					url: '/pmManagement/api/pmmng/realTask/insert',
					method: "POST",
					jsonData: JSON.stringify(params),
					success: function (response, options) {
						var  resu  = JSON.parse(response.responseText);
						if (resu) {
							if (resu.result == 0) {
								Ext.Msg.alert(_('Notice:add task Success!'));
								var taskId = resu.taskId;
								console.info('添加成功')
								resourceForm.form.findField("taskId").setValue(taskId);
								grid.getStore().reload();
								card.setActiveItem(form);
							} else if (resu.result == 1) {

								Ext.Msg.alert(_('Notice not null'));
							} else if (resu.result == 2) {

								Ext.Msg.alert(_('Notice reType'));
							} else if (resu.result == 3) {

								Ext.Msg.alert(_('Notice reName'));
							}
						}
					 },
					failure: function () {
						Ext.Msg.alert(_("Notice addFailure"));
					}
				})
			};
		}
		// card.setActiveItem(form); 
	},
	addLock: function () {
		var checkfieldValue = this.getView().down('#addCollection').getValue();
		var collection = this.getView().down('#realEndTime');
		collection.setVisible(checkfieldValue);
		if (!checkfieldValue) {
			this.getView().down('#realEndTime').setValue(' ');
		}
	},

	onSelect: function () {
		var card = this.getView().up();
		console.info(card);
		grid = card.down('#realTimeGrid'),
			resourcesTree = card.down('#resourcesTree'),
			store = resourcesTree.getStore();
		record = grid.getSelectionModel().getSelection()[0];
		taskName = record.get('taskId');
		var ids = { taskId: taskId };
		store.proxy.url = "/pmManagement/api/pmmng/pmTaskDetai/findResource",
			store.proxy.extraParams = ids;
		store.reload();
	},
	//获取资源名称,作为表格的列名
	gridFields: function () {
		var card = this.getView().up();
		resourcesTree = card.down('#resourcesTree'),
			resourceRecords = resourcesTree.getChecked(),
			resourceText = [];
		for (var i = 0; i < resourceRecords.length; i++) {
			resourceText.push(resourceRecords[i].data.text);
		};
		return resourceText;
	},
	//动态设置表格Columns属性
	setGridFields: function (grid) {
		//表格列text取资源名称
		texts = this.gridFields();
		texts1 = texts[0];
		texts2 = texts[1];
		texts3 = texts[2];
		texts4 = texts[3];
		texts5 = texts[4];
		/* //表格index取store_key,即资源id,映射对应
		 indexs=this.setYfields();
		 indexs1=indexs[0];
		 indexs2=indexs[1];
		 indexs3=indexs[2];
		 indexs4=indexs[3];
		 indexs5=indexs[4];*/
		var columns = grid.getColumns();
		columns[0].setText("time");
		columns[0].dataIndex = "time";
		columns[1].setText(texts1);
		// columns[1].dataIndex=indexs1;
		columns[2].setText(texts2);
		// columns[2].dataIndex=indexs2;
		columns[3].setText(texts3);
		//columns[3].dataIndex=indexs3;
		columns[4].setText(texts4);
		// columns[4].dataIndex=indexs4;
		columns[5].setText(texts5);
		// columns[5].dataIndex=indexs5;
		console.info(grid);
	},

	//获取按设备创建的任务采集周期
	onCollect: function () {
		var card = this.getView().up();
		var realTaskForm = card.down('#realTask');
		var collect = realTaskForm.getForm().getValues().collectPeriod * 1000;
		return collect;
	},
	// 按设备 根据采集周期，动态设置每格的秒数，采集周期*点数（50）/格数
	setMajorTick: function (chart) {
		var intervalTime = this.onCollect();
		axes = chart.getAxes();
		var step = axes[1].getSegmenter().getStep();
		step.step = intervalTime / 1000 * 50 / 18;
		axes[1].getSegmenter().setStep(step)
	},
	onCancel: function () {
		var card = this.getView().up();
		card.setActiveItem(0);
	},

});