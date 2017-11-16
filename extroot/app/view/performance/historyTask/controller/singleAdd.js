Ext.define('Admin.view.performance.historyTask.controller.singleAdd', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.singleAdd',
	//持续采集锁定
	addLock: function () {
		var checkfieldValue = this.getView().down('#singleAddCollection').getValue();
		var collection = this.getView().down('#singleAddTime');
		collection.setVisible(checkfieldValue);
		if (!checkfieldValue) {
			this.getView().down('#singleStart').setValue(' ');
			this.getView().down('#singleEnd').setValue(' ');
		}
	},

	onSubmit: function () {
		var card = this.getView().up();
		var form = this.getView().up().down('#singleAdd');
		var performanceGrid = this.getView().up().down('#performanceGrid');
		var equipmentTree = this.getView().down('#equipmentTree');
		var singleResourceTree = this.getView().down('#singleResourceTree');
		var equipmentId = equipmentTree.getSelection()[0].id;
		var recordResource = singleResourceTree.getChecked();
		var resourceIds = [];
		for (var i = 0; i < recordResource.length; i++) {
			resourceIds.push(recordResource[i].data.id);
		};
		var collectPeriod = card.down('#singAddCollectPeriod').value;
		var interactPeriod = card.down('#singAddInteractPeriod').value
		if (form.getForm().isValid()) {
			var formValues = form.getForm().getValues();
			console.info(formValues);
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
				neId: equipmentId,
				resourceIds: resourceIds
			};
			var executeTime = formValues.executeTime; var endTime = formValues.endTime;
			var ccType = formValues.ccType;
			if (ccType == "on" && executeTime == "" && endTime == "") {
				Ext.Msg.alert(_('Start time and end data can not be empty!'))
			} else {
				Ext.Ajax.request({
					url: '/pmManagement/api/pmmng/realTask/insert',
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
	//添加模板
	singAddTempButton: function () {
		var card = this.getView().up();
		var form = card.down('#singleAddTemplate');
		var singleResourceTree = this.getView().down('singleResourceTree');
		//清除模板选中状态
		var qutoRecord = card.down('#singleAddQuotaTemplateGrid').getSelectionModel().getSelection();
		var thresholdRecord = card.down('#singleAddThresholdGrid').getSelectionModel().getSelection();
		card.down('#singleAddQuotaTemplateGrid').getSelectionModel().deselect(qutoRecord);
		card.down('#singleAddThresholdGrid').getSelectionModel().deselect(thresholdRecord);
		var records = singleResourceTree.getChecked()[0];
		if (records == undefined) {
			Ext.Msg.alert(_('please select resource!'))
		} else {
			var metypeId = records.data.id;
			var params = { metypeId: metypeId };
			var store = this.getView().up().down('#singleAddQuotaTemplateGrid').getStore();
			console.info(store);
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
})