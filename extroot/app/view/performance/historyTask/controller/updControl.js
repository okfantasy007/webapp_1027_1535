Ext.define('Admin.view.performance.historyTask.controller.updControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.updControl',
	//持续采集锁定
	taskUpdLock: function () {
		var checkfieldValue = this.getView().down('#updRadio').getValue();
		var collection = this.getView().down('#updTime');
		collection.setVisible(!checkfieldValue);
	},

	onUpd: function () {
		var card = this.getView().up();
		var view = card.down('#permanceMain');
		console.info(view);
		var grid = card.down('#updResourceGrid');
		var form = card.down('#upd');
		var collectPeriod = card.down('#taskUpdCollectPeriod').value;
		var interactPeriod = card.down('#taskUpdInteractPeriod').value
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
					url: '/pmManagement/api/pmmng/pmTask/update',
					method: "POST",
					jsonData: JSON.stringify(formParams),
					success: function (response, options) {
						var  resu  = JSON.parse(response.responseText);
						console.info(response.responseText);
						if (resu) {
							console.info(resu.result);
							if (resu.result == 0) {
								Ext.Msg.alert(_("Notice:upd task Success!"));
								performanceGrid.store.reload();
								card.setActiveItem(0);
							} else if (resu.result == 1) {
								Ext.Msg.alert(_("Notice not null！"));
							} else if (resu.result == 2) {
								Ext.Msg.alert(_("Notice reType"));
							} else if (resu.result == 3) {

								Ext.Msg.alert(_("Notice reName"));
							} else if (resu.result == 4) {

								Ext.Msg.alert(_("Notice upd failures"));
							}
						}
					 },
					failure: function () {
						Ext.Msg.alert(_("Notice updFailure"));
					}
				})
			};
		} else {
			Ext.Msg.alert(_('Notice verification failure'));
		}//表单验证
	},
	//添加资源界面
	updResources: function () {
		var card = this.getView().up();
		var form = card.down('#updTreeForm');
		var grid = card.down('#updResourceGrid');
		//清除树选中行状态
		var resourceTree = card.down('#updResourceTree');
		var recordTree = resourceTree.getSelection();
		resourceTree.getSelectionModel().deselect(recordTree);
		grid.getStore('resourceStore').removeAll();
		card.setActiveItem(form);
	},

	updButton: function (thisModel, selRecords) {
		//选中记录数数为!=1时需要做的操作，例如按钮置灰，按钮隐藏等
		this.getView().up().down('#updTempButton').setDisabled(selRecords.length == 0);
	},
	//添加模板
	updTempButton: function () {
		var card = this.getView().up();
		var form = card.down('#updTemplate');
		var grid = card.down('#updResourceGrid');
		var qutoRecord = card.down('#updQuotaTemplateGrid').getSelectionModel().getSelection();
		var thresholdRecord = card.down('#updThresholdGrid').getSelectionModel().getSelection();
		card.down('#updQuotaTemplateGrid').getSelectionModel().deselect(qutoRecord);
		card.down('#updThresholdGrid').getSelectionModel().deselect(thresholdRecord);
		var record = grid.getSelectionModel().getSelection()[0];
		if (record == undefined) {
			Ext.Msg.alert(_('please select resource!'))
		} else {
			var metypeId = record.get('metypeId');
			var params = { metypeId: metypeId };
			var store = card.down('#updQuotaTemplateGrid').getStore();
			store.proxy.url = "/pmManagement/api/pmmng/pmTask/findMetricTmpl"
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
		var form = this.lookupReference('updSearchConditionForm');
		form.setHidden(!form.isHidden())
	},
	onRemove: function () {
		var card = this.getView().up();
		var grid = card.down('#updResourceGrid');
		var records = grid.getSelectionModel().getSelection();
		grid.getStore('resourceStore').remove(records);
	},

	onCondition: function () {
		var card = this.getView().up();
		var form = card.down('#updSearchConditionForm');
		var values = form.getForm().getValues();
		var store = card.down('#updResourceGrid').getStore();
		store.proxy.url = "/pmManagement/api/pmmng/pmTaskDetai/queryResource"
		store.proxy.extraParams = values;
		store.reload();
	},
	onSelect: function (thisModel, selRecords) {
		//选中记录数数为!=1时需要做的操作，例如按钮置灰，按钮隐藏等
		this.getView().down('#Edit').setDisabled(selRecords.length != 1);
		this.getView().down('#query').setDisabled(selRecords.length != 1);
	},
	saveOriginalValues: function (form) {
		if (!form.orgValues) {
			form.orgValues = Ext.clone(form.getForm().getValues());
		}
	},
	onExpandAll: function () {
		var card = this.getView().up();
		var resourceTree = card.down('#resourceTree');
		resourceTree.expandAll();
		console.info(resourceTree);
	},
	onRefresh: function () {
		var card = this.getView().up();
		var grid = card.down('#updResourceGrid');
		grid.getStore().getProxy().setExtraParams()
		grid.getStore().reload();

	},

})