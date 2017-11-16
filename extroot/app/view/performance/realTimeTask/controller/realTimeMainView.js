Ext.define('Admin.view.performance.realTimeTask.controller.realTimeMainView', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.realTimeMainView',
	onStop: function () {
		var card = this.getView(),
			grid = card.down('#realTimeTaskGrid'),
			records = grid.getSelectionModel().getSelection();
		var ids = [];
		for (var i in records) {
			records[i]
			ids.push(records[i].get('taskId'));
		};
		var params = {
			taskStatus: 4,
			taskId: ids,
			taskType: 1
		};
		Ext.Ajax.request({
			url: '/pmManagement/api/pmmng/pmTask/updateStatus',
			method: 'POST',
			jsonData: JSON.stringify(params),
			success: function () {
				Ext.Msg.alert({
					title: _('Notice'),
					msg: _('Operation Success!')
				});
				grid.getStore().reload();
			},
			failure: function (form, action) {

			}
		});
	},
	onAdd: function () {
		var card = this.getView(),
			form = card.down('#realTimeAdd');
		var user = APP.user;
		form.getForm().reset();
		form.form.findField("createUser").setValue(user);
		var deviceId = card.down('#deviceForm').getForm().getValues();
		form.setTitle(_('Add real-time performance tasks'));
		var deviceTree = card.down('#deviceTree');
		//清除设备选中行状态
		var recordDevice = deviceTree.getSelection();
		deviceTree.getSelectionModel().deselect(recordDevice);
		//清除资源选中状态
		var resourcesTree = card.down('#resourcesTree');
		var recordsResource = resourcesTree.getChecked();
		if (recordsResource.length > 0) {
			var node = recordsResource[0].parentNode;
			resourcesTree.getStore().remove(node);
			resourcesTree.getStore().remove(recordsResource);
		}
		//清除指标选中状态
		var metricTree = card.down('#metricTree');
		var recordsMetric = metricTree.getChecked();
		if (recordsMetric.length > 0) {
			var node = recordsMetric[0].parentNode;
			metricTree.getStore().remove(node);
			metricTree.getStore().remove(recordsMetric);
		}

		card.setActiveItem(form);
		/* ids={deviceId:deviceId};
		 if(deviceId==''){
			 card.setActiveItem(form); 
		 }else{
			var deviceStore = card.down('#deviceTree').getStore();
				deviceStore.proxy.url= '/pmManagement/api/pmmng/pmTaskDetai/findDeviceByTaskId',
				deviceStore.proxy.extraParams = ids;
				deviceStore.reload(); 
				card.setActiveItem(form);
				card.down('#deviceForm').reset();
			    
		 }*/
	},
	iteratorNodes: function (nodes, id) {
		var id = id;
		if (nodes.childNodes.length == 0) {
			for (var j = 0; j < id.length; j++) {
				if (nodes.id == (id[j]).toString()) {
					nodes.set('checked', true);
					nodes.parentNode.expand();
				}
			}
		} else {
			for (var i = 0; i < nodes.childNodes.length; i++) {
				var node = nodes.childNodes[i];
				this.iteratorNodes(node, id)
			}
		}
	},

	select: function (thisModel, selRecords) {
		//选中记录数数为!=1时需要做的操作，例如按钮置灰，按钮隐藏等
		this.getView().down('#realQuery').setDisabled(selRecords.length != 1);
		this.getView().down('#realAdd').setDisabled(selRecords.length != 0);
		this.getView().down('#display').setDisabled(selRecords.length != 1);
		this.getView().down('#realStop').setDisabled(selRecords.length != 1);

	},
	onBeforedSelect: function (ths, record, index, eOpts) {
		var grid = this.getView().down('#realTimeTaskGrid');
		var records = grid.getSelectionModel().getSelection();
		if (records.length > 30) {
			Ext.Msg.alert({
				title: _('Notice'),
				msg: _('Tip: You can not run more than 30 tasks at the same time')
			});
			return false;
		}
	},
	//获取按设备创建的任务采集周期
	onCollect: function () {
		var card = this.getView();
		var grid = card.down('#realTimeTaskGrid');
		var record = grid.getSelectionModel().getSelection()[0];
		var collectPeriod = record.get('collectPeriod');
		var collect = collectPeriod * 1000;
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

	onDisplay: function () {
		var card = this.getView();
		var controller = this;
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

		var form = card.down('realTimeChartView');
		var grid = card.down('#realTimeTaskGrid');
		var record = grid.getSelectionModel().getSelection()[0];
		var taskId = record.get('taskId');
		var endTime = record.get('endTime');
		var taskStatus=record.get('taskStatus');
		var end= new Date(endTime);
		var longEnd = end.getTime();
		var now = new Date();
		var longNow = now.getTime();
		if (endTime != '' && longNow >= longEnd||taskStatus==4) {
			grid.getStore().reload();
			Ext.Msg.alert('任务运行已结束，请重新创建任务！')
		} else {
			Ext.Ajax.request({
				url: '/t5/api/pmmng/realTask/findRealDetail',
				method: 'get',
				params: { taskId: taskId },
				success: function (response, options) {
					var  resu  = JSON.parse(response.responseText);
					//获取此任务下的资源id+资源名称
					var resourceIds = resu.rsUrls;
					var resourceNames = resu.rsNames;
					var metricIds = resu.metricIds;
					var metricNames = resu.metricNames;
					//把资源，指标，id+name,传展示界面
					var resourceForm = card.down('#resourceForm');
					resourceForm.form.findField("resourceNames").setValue(resourceNames);
					resourceForm.form.findField("resourceIds").setValue(resourceIds);
					resourceForm.form.findField("metricIds").setValue(metricIds);
					resourceForm.form.findField("taskId").setValue(taskId);

					//通过指标名称给chart 设置标题
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
						}
					};
					//动态显示与隐藏
					if (chart10.getTitle() == null) {
						chart10View.setHidden(true);
					} else {
						//设置表格列名称
						this.setGridFields(grid10, resourceNames);
						this.setMajorTick(chart10)
					};
					if (chart9.getTitle() == null) {
						chart9View.setHidden(true);
					} else {
						this.setGridFields(grid9, resourceNames);
						this.setMajorTick(chart9)
					};
					if (chart8.getTitle() == null) {
						chart8View.setHidden(true);
					} else {
						this.setGridFields(grid8, resourceNames);
						this.setMajorTick(chart8)
					};
					if (chart7.getTitle() == null) {
						chart7View.setHidden(true);
					} else {
						this.setGridFields(grid7, resourceNames);
						this.setMajorTick(chart7)
					};
					if (chart6.getTitle() == null) {
						chart6View.setHidden(true);
					} else {
						this.setGridFields(grid6, resourceNames);
						this.setMajorTick(chart6)
					};
					if (chart5.getTitle() == null) {
						chart5View.setHidden(true);
					} else {
						this.setGridFields(grid5, resourceNames);
						this.setMajorTick(chart5)
					};
					if (chart4.getTitle() == null) {
						chart4View.setHidden(true);
					} else {
						this.setGridFields(grid4, resourceNames);
						this.setMajorTick(chart4)
					};
					if (chart3.getTitle() == null) {
						chart3View.setHidden(true);
					} else {
						this.setGridFields(grid3, resourceNames);
						this.setMajorTick(chart3)
					};
					if (chart2.getTitle() == null) {
						chart2View.setHidden(true);
					} else {
						controller.setGridFields(grid2, resourceNames);
						controller.setMajorTick(chart2)
					};
					if (chart1.getTitle() == null) {
						chart1View.setHidden(true);
					} else {
						controller.setGridFields(grid1, resourceNames);
						controller.setMajorTick(chart1)
					};
					card.setActiveItem(form);
				},

				failure: function () {
					Ext.Msg.alert('展示失败！');
					card.setActiveItem(form);
				}
			});
		}

	},
	//动态设置表格Columns属性
	setGridFields: function (grid, resourceNames) {
		//表格列text取资源名称
		var texts = resourceNames;
		var texts1 = texts[0];
		var texts2 = texts[1];
		var texts3 = texts[2];
		var texts4 = texts[3];
		var texts5 = texts[4];
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
	},
	onDelete: function () {
		var card = this.getView();
		var grid = card.down('#realTimeTaskGrid');
		var records = grid.getSelectionModel().getSelection();
		var ids = []; var taskTypes = [];
		for (var i in records) {
			ids.push(records[i].get('taskId'));
			taskTypes.push(records[i].get('taskType'))
		};
		var params = { taskId: ids, taskTypeList: taskTypes }
		Ext.MessageBox.confirm(_('Confirmation'), _('Do you confirm deletion?'),
			function (btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						url: '/pmManagement/api/pmmng/pmTask/delete',
						method: 'POST',
						jsonData: JSON.stringify(params),
						success: function () {
							Ext.Msg.alert({
								title: _('Notice'),
								msg: _('Operation Success!')
							});
							grid.getStore().reload();
						},
						failure: function (form, action) {

						}
					})
				}
			})
	},
	onRefresh: function () {
		var card = this.getView().up();
		var grid = card.down('#realTimeTaskGrid');
		grid.getStore().reload();

	},
	//详细查询
	queryDetail: function () {
		var card = this.getView().up();
		var grid = card.down('#realTimeTaskGrid');
		var form = card.down('#realTimeDetail');
		var record = grid.getSelectionModel().getSelection()[0];
		var taskId = record.get('taskId');
		var endTime = record.get('endTime');
		if (endTime == "") {
			card.down('#realTimeRadiogroup').setValue({ custom: 0 });
			card.down('#realEndTime').setHidden(true);
			card.down('#realTimecontinu').setHidden(false);
			card.down('#realTimecustom').setHidden(true);
		} else {
			card.down('#realTimeRadiogroup').setValue({ custom: 1 });
			card.down('#realTimecustom').setHidden(false);
			card.down('#realTimecontinu').setHidden(true);
		};
		var ids = { taskId: taskId };
		//通过任务id查询设备。。返回树结构
		var deviceStore = card.down('#realTimeDetail').down('#deviceTreeDetail').getStore();
		deviceStore.proxy.url = '/pmManagement/api/pmmng/pmTaskDetai/findDeviceByTaskId',
			deviceStore.proxy.extraParams = ids;
		deviceStore.reload();
		//通过任务id查询资源。。返回树结构
		var resourcesStore = card.down('#realTimeDetail').down('#resourcesTreeDetail').getStore();
		resourcesStore.proxy.url = '/pmManagement/api/pmmng/pmTaskDetai/findResourceByTaskId',
			resourcesStore.proxy.extraParams = ids;
		resourcesStore.reload();
		//通过任务id查询指标。。返回树结构
		var metricStore = card.down('#realTimeDetail').down('#metricTreeDetail').getStore();
		metricStore.proxy.url = '/pmManagement/api/pmmng/pmTaskDetai/findMetricByTaskId',
			metricStore.proxy.extraParams = ids;
		metricStore.reload();
		form.loadRecord(record);
		card.setActiveItem(form);
	},

});
var resourceIds; var resourceNames; var metricIds; var metricNames;