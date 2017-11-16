Ext.define('Admin.view.performance.historyTask.controller.addControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.addControl',
	//持续采集锁定
	addLock: function () {
		var checkfieldValue = this.getView().down('#addCollection').getValue();
		var collection = this.getView().down('#addTime');
		collection.setVisible(checkfieldValue);
		if (!checkfieldValue) {
			this.getView().down('#begindate').setValue(' ');
			this.getView().down('#enddate').setValue(' ');
		}
	},
	onSubmit: function () {
		var card = this.getView().up();
		var grid = card.down('#resourceGrid');
		var form = card.down('#add');
		var collectPeriod = card.down('#tasksCollectPeriod').value;
		var interactPeriod = card.down('#tasksInteractPeriod').value
		var performanceGrid = card.down('#performanceGrid');
		var records = grid.getSelectionModel().getSelection();
		var resources = [];
		for (var i = 0; i < records.length; i++) {
			resources.push(records[i].data);
		}
		if (form.getForm().isValid()) {
			var formValues = form.getForm().getValues();
			var formParams = {
				taskId: formValues.taskId,
				taskName: formValues.taskName,
				taskType: formValues.taskType,
				taskStatus: formValues.taskStatus,
				createTime: formValues.createTime,
				createUser: formValues.createUser,
				collectPeriod: collectPeriod,
				interactPeriod: interactPeriod,
				endTime: formValues.endTime,
				metricTmpl: formValues.metricTmplName,
				thresholdTmpl: formValues.tcaTmplName,
				executeTime: formValues.executeTime,
				collectType: formValues.collectType,
				protocolType: formValues.protocolType,
				taskCreateMethod: formValues.taskCreateMethod,
				resource: resources
			};
			var executeTime = formValues.executeTime; var endTime = formValues.endTime;
			var ccType = formValues.ccType;
			if (ccType == "on" && executeTime == "" && endTime == "") {
				Ext.Msg.alert(_('Start time and end data can not be empty!'))
			} else {
				Ext.Ajax.request({
					url: '/pmManagement/api/pmmng/pmTask/insert',
					method: "POST",
					jsonData: JSON.stringify(formParams),
					success: function (response, options) {
						var  resu  = JSON.parse(response.responseText);
						console.info(response.responseText);
						if (resu) {
							console.info(resu.result);
							if (resu.result == 0) {
								Ext.Msg.alert(_("Notice:add task Success!"));
								performanceGrid.getStore().reload();
								card.setActiveItem(0);
							} else if (resu.result == 1) {

								Ext.Msg.alert(_("Notice not null"));
							} else if (resu.result == 2) {
								Ext.Msg.alert(_("Notice reType"));
							} else if (resu.result == 3) {

								Ext.Msg.alert(_("Notice reName"));
							} else if (resu.result == 4) {

								Ext.Msg.alert(_("Notice failures"));
							}
						}
					 },
					failure: function () {
						Ext.Msg.alert(_("Notice addFailure"));
					}
				})
			};
		} else {
			Ext.Msg.alert(_('Notice verification failure'));
		}//表单验证
	},
	//添加资源界面
	addResources: function () {
		var card = this.getView().up();
		var form = card.down('#treeForm');
		var grid = card.down('#addSourceGrid');
		var resourceTree = card.down('#resourceTree');
		var recordTree = resourceTree.getSelection();
		resourceTree.getSelectionModel().deselect(recordTree);
		grid.getStore('reStore').removeAll();
		card.setActiveItem(form);
	},
	tempButton: function (thisModel, selRecords) {
		//选中记录数数为!=1时需要做的操作，例如按钮置灰，按钮隐藏等
		this.getView().up().down('#addTempButton').setDisabled(selRecords.length == 0);
	},

	//添加模板
	addTempButton: function () {
		var card = this.getView().up();
		var form = card.down('#template');
		var grid = card.down('#resourceGrid');
		var qutoRecord = card.down('#quotaTemplateGrid').getSelectionModel().getSelection();
		var thresholdRecord = card.down('#thresholdGrid').getSelectionModel().getSelection();
		card.down('#quotaTemplateGrid').getSelectionModel().deselect(qutoRecord);
		card.down('#thresholdGrid').getSelectionModel().deselect(thresholdRecord);
		var record = grid.getSelectionModel().getSelection()[0];
		if (record == undefined) {
			Ext.Msg.alert(_('please select resource!'))
		} else {
			var metypeId = record.get('metypeId');
			var params = { metypeId: metypeId };
			var store = card.down('#quotaTemplateGrid').getStore();
			store.proxy.url = "/pmManagement/api/pmmng/pmTask/findMetricTmpl";
			store.proxy.extraParams = params;
			store.reload();
			card.setActiveItem(form);
		}
	},


	onCancel: function () {
		var card = this.getView().up();
		//view = card.down('#performanceMainView');
		card.setActiveItem(0);
	},

	//模糊查询
	onFilter: function () {
		var form = this.lookupReference('searchConditionForm');
		form.setHidden(!form.isHidden())
	},
	onRemove: function () {
		var card = this.getView().up();
		var grid = card.down('#resourceGrid');
		var records = grid.getSelectionModel().getSelection();
		grid.getStore('resourceStore').remove(records);
	},
})