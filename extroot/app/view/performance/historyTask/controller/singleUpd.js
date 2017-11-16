Ext.define('Admin.view.performance.historyTask.controller.singleUpd', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.singleUpd',
	//持续采集锁定
	singUpdLock: function () {
		var checkfieldValue = this.getView().down('#singleUpdCollection').getValue();
		var collection = this.getView().down('#singleUpdTime');
		collection.setVisible(!checkfieldValue);
	},

	onSubmit: function () {
		var card = this.getView().up();
		console.info(card);
		var form = card.down('#singleUpd');
		var performanceGrid = card.down('#performanceGrid');

		var singleUpdResourceTree = card.down('#singleUpdResourceTree');
		var recordResource = singleUpdResourceTree.getChecked();

		// var equipmentTree=card.down('#equipmentTree');
		var equipmentTree = card.down('#singleUpd').down('#addTask').down('#equipment').down('#eqTree').down('#singUpdEquipmentTree');

		var equipmentRecord = equipmentTree.getSelection()[0];
		var equipmentId = equipmentRecord.id;

		var resourceIds = [];
		for (var i = 0; i < recordResource.length; i++) {
			resourceIds.push(recordResource[i].data.id);
		};

		var collectPeriod = card.down('#singUpdCollectPeriod').value;
		var interactPeriod = card.down('#singUpdInteractPeriod').value
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
				neId: equipmentId,
				resourceIds: resourceIds
			};
			var executeTime = formValues.executeTime; var endTime = formValues.endTime;
			var ccType = formValues.ccType;
			if (ccType == "on" && executeTime == "" && endTime == "") {
				Ext.Msg.alert(_('Start time and end data can not be empty!'))
			} else {
				Ext.Ajax.request({
					url: '/pmManagement/api/pmmng/realTask/update',
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
	//添加模板
	singUpdTempButton: function () {
		var card = this.getView().up();
		var form = card.down('#singleUpdTemplate');
		var singleUpdResourceTree = this.getView().down('singleUpdResourceTree');
		//清除模板选中状态
		var qutoRecord = card.down('#singleUpdQuotaTemplateGrid').getSelectionModel().getSelection();
		var thresholdRecord = card.down('#singleUpdThresholdGrid').getSelectionModel().getSelection();
		card.down('#singleUpdQuotaTemplateGrid').getSelectionModel().deselect(qutoRecord);
		card.down('#singleUpdThresholdGrid').getSelectionModel().deselect(thresholdRecord);
		var records = singleUpdResourceTree.getChecked()[0];
		if (records == undefined) {
			Ext.Msg.alert(_('please select resource!'))
		} else {
			var metypeId = records.data.id;
			var params = { metypeId: metypeId };
			var store = card.down('#singleUpdQuotaTemplateGrid').getStore();
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