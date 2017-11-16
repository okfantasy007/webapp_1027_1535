Ext.define('Admin.view.performance.thresholdTemplateMangement.controller.TTMAddPage.TTMAddPage', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.TTMAddPage',
	beforeshow: function () {

		var grid = this.getView();
		grid.down('#templateInfo').down('#thresholdSymbol').store.reload();
	},
	onRowclick: function (record, element, rowIndex, e, eOpts) {
		var grid = this.getView().up().up().down('#TTMAddPage').down('#addPageGrid').down('#basicInfoGrid');
		var newValue = element.get('metricTmplName');
		var id = element.get('tmplId');
		console.info(id);
		grid.getForm().findField('belongToTemplate').setValue(newValue);
		grid.getForm().findField('tmplId').setValue(id);
		var symbolGrid = this.getView().up().up().down('#TTMAddPage').down('#addPageGrid').down('#templateInfo').down('#thresholdSymbol');
		symbolGrid.getStore().getProxy().setExtraParam('tmplId', id);
		symbolGrid.store.reload();
	},
	//对左侧指标名称模糊查询的方法
	onNameFilterKeyup: function () {
		var grid = this.getView(),
			filterField = this.lookupReference('nameFilterField'),
			Field = this.lookupReference('symbolInfo'),
			filters = Field.store.getFilters();
		if (filterField.value) {
			this.nameFilter = filters.add({
				id: 'nameFilter',
				property: 'metricTmplName',
				value: filterField.value,
				anyMatch: true,
				caseSensitive: false
			});
		} else if (this.nameFilter) {
			filters.remove(this.nameFilter);
			this.nameFilter = null;
		}
	},
	onSubmit: function () {
		//获取阈值列表的的view以及数据值
		var grid = this.getView(),
			form = grid.down('#basicInfoGrid');
		var thresholdSymbolData = grid.down('#templateInfo').down('#thresholdSymbol').getStore().data.items;
		//对view的数据值进行规则校验
		for (var i = 0; i < thresholdSymbolData.length; i++) {
			if (!this.validateData(thresholdSymbolData[i].data)) {
				console.info(this.validateData(thresholdSymbolData[i].data));
				return null;
			}
		}
		//将数据拼装到数组以及map中向后台
		var tmplDefine = new Array();
		for (var i = 0; i < thresholdSymbolData.length; i++) {
			tmplDefine[i] = thresholdSymbolData[i].data;
		}
		var formdata = form.getValues();
		console.info(formdata);
		var view = this.getView().up();
		var TTMMainPageGrid = view.down('#TTMMainPageGrid');
		if (form.getValues()["tcaTmplName"].trim() == '') {

			Ext.Msg.alert(_('Prompt information'), _('The template name is required'), Ext.emptyFn);
			return null;
		}
		var conditonData = {};
		conditonData.tmplName = formdata["tcaTmplName"];
		conditonData.tmplDesc = formdata["tmplDesc"];
		conditonData.tcaTmplId = formdata["tcaTmplId"];
		conditonData.metricTmplId = formdata["tmplId"];
		conditonData.tmplDefine = tmplDefine;
		var symbolGrid = this.getView().up().up().down('#TTMAddPage').down('#addPageGrid').down('#templateInfo').down('#thresholdSymbol');
		Ext.Ajax.request({
			url: '/pmManagement/api/pmmng/thresholdTmpl/insert',
			method: "POST",
			jsonData: JSON.stringify(conditonData),
			success: function (response, options) {
				Ext.toast({
					html: _('Successful operation'),
					title: _('Prompt information'),
					width: 200,
					align: 't'
				});
				view.setActiveItem(0);
				TTMMainPageGrid.getStore().reload();
				symbolGrid.getStore().getProxy().setExtraParams({
					'includes': ''
				})
				symbolGrid.getStore().load();

			},
			failure: function (response, options) {
				Ext.toast({
					html: _('operation failed'),
					title: _('Prompt information'),
					width: 200,
				});
			}
		});
		this.getView().getForm().reset();
	},
	onCancel: function () {
		this.getView().getForm().reset();
		var symbolGrid = this.getView().up().up().down('#TTMAddPage').down('#addPageGrid').down('#templateInfo').down('#thresholdSymbol');
		symbolGrid.getStore().getProxy().setExtraParams({
			'includes': ''
		})
		symbolGrid.getStore().load();
		this.getView().up().setActiveItem(0);
	},

	onReset: function () {
		var symbolGrid = this.getView().up().up().down('#TTMAddPage').down('#addPageGrid').down('#templateInfo').down('#thresholdSymbol');
		symbolGrid.getStore().getProxy().setExtraParams({
			'includes': ''
		})
		symbolGrid.getStore().load();
		this.getView().getForm().reset();
	},

	validateData: function (data) {
		var h1 = data.high1Threshold != "" ? data.high1Threshold : undefined;
		var h2 = data.high2Threshold != "" ? data.high2Threshold : undefined;
		var h3 = data.high3Threshold != "" ? data.high3Threshold : undefined;
		var h4 = data.high4Threshold != "" ? data.high4Threshold : undefined;
		var l4 = data.low1Threshold != "" ? data.low1Threshold : undefined;
		var l3 = data.low2Threshold != "" ? data.low2Threshold : undefined;
		var l2 = data.low3Threshold != "" ? data.low3Threshold : undefined;
		var l1 = data.low4Threshold != "" ? data.low4Threshold : undefined;

		var a = [h1, h2, h3, h4, l1, l2, l3, l4];
		for (var i = 0; i < a.length; i++) {
			for (var j = i + 1; j < a.length; j++) {
				if ((a[i] != undefined) && (a[j] != undefined)) {
					if (!(a[i] > a[j])) {
						Ext.Msg.alert(_('Threshold fill in error'), _('Metric name:') + data.metricName + "</br>" + _('Cause: The high threshold is greater than the lower threshold:'), Ext.emptyFn);
						return false;
					}
				}
			}
		}

		return true;
	}
});