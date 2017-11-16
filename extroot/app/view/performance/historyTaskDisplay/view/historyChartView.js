Ext.define('Admin.view.performance.historyTaskDisplay.view.historyChartView', {
	xtype: 'historyChartView',
	extend: 'Ext.panel.Panel',
	requires: [
		'Admin.view.performance.historyTaskDisplay.controller.historyChartView',
		'Admin.view.performance.historyTaskDisplay.view.historyChart1',
		'Admin.view.performance.historyTaskDisplay.view.historyChart2',
		'Admin.view.performance.historyTaskDisplay.view.historyChart3',
		'Admin.view.performance.historyTaskDisplay.view.historyChart4',
		'Admin.view.performance.historyTaskDisplay.view.historyChart5',
		'Admin.view.performance.historyTaskDisplay.view.historyChart6',
		'Admin.view.performance.historyTaskDisplay.view.historyChart7',
		'Admin.view.performance.historyTaskDisplay.view.historyChart8',
		'Admin.view.performance.historyTaskDisplay.view.historyChart9',
		'Admin.view.performance.historyTaskDisplay.view.historyChart10',

	],
	// viewModel: 'displayStoreViewModel',
	controller: 'historyChartView',
	itemId: 'historyChartView',
	//height : 800,
	bodyPadding: "3 10 3 3",
	defaults: {
		padding: 1,
		margin: 2,
	},
	layout: {
		type: 'table',
		columns: 2,
	},
	autoScroll: true,
	items: [
		{
			xtype: 'historyChart1',
		},
		{
			xtype: 'historyChart2',
		},
		{
			xtype: 'historyChart3',
		},
		{
			xtype: 'historyChart4',
		},
		{
			xtype: 'historyChart5',
		},
		{
			xtype: 'historyChart6',
		},
		{
			xtype: 'historyChart7',
		},
		{
			xtype: 'historyChart8',
		},
		{
			xtype: 'historyChart9',
		},
		{
			xtype: 'historyChart10',
		}],
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'top',
		items: [
			{
				xtype: 'container',
				layout: 'hbox',
				defaultType: 'textfield',
				margin: '0 0 5 0',
				labelWidth: 80,
				labelAlign: "right",
				items: [
					{
						xtype: 'datetimefield',
						name: 'satrtTime',
						itemId: 'startTime',
						labelAlign: "right",
						fieldLabel: _('startTime'),
						id: 'start',
						editable: false,
						value: new Date(),
						allowBlank: false,
						margin: 10,
						listeners: {
							"select": function () {
								var bd = Ext.getCmp('start').getValue();
								var ed = Ext.getCmp('end').getValue();
								var edd = Date.parse(ed);
								var bdd = Date.parse(bd); //Date.parse的处理很关键   
								var myDate = new Date();
								var year = myDate.getFullYear();
								var month = myDate.getMonth() + 1;
								if (month < 10) {
									month = "0" + (myDate.getMonth() + 1);
								}
								var day = myDate.getDate();
								if (day < 10) {
									day = "0" + myDate.getDate();
								}
								var hours = myDate.getHours();
								if (hours < 10) {
									hours = "0" + myDate.getHours();
								}
								var minutes = myDate.getMinutes();
								if (minutes < 10) {
									minutes = "0" + myDate.getMinutes();
								}
								var seconds = myDate.getSeconds()
								if (seconds < 10) {
									seconds = "0" + myDate.getSeconds();
								}
								var now = year + "-" + month + "-" + day + "-" + hours + ":" + minutes + ":" + seconds;
								var xdd = myDate.getTime();
								if (bd == "" || bdd == "NaN") {
									var config = {
										title: _('Notice'),
										msg: _('please select startTime！')
									}
									Ext.Msg.show(config);
									return false;
								} else {
									if (bdd >= xdd || bdd >= edd) {
										var config = {
											title: _('Notice'),
											msg: _('startTime no more now no more endTime')
										}
										Ext.Msg.show(config);
										var bd = Ext.getCmp("start");
										bd.setValue(" ");
										return false;
									}
									else {
										return true;
									};
								}
							}
						}
					},
					{
						xtype: 'datetimefield',
						fieldLabel: _('To'),
						labelAlign: "right",
						name: 'endTime',
						id: 'end',
						editable: false,
						margin: 10,
						itemId: 'endTime',
						value: new Date(),
						allowBlank: false,
						listeners: {
							"select": function () {
								var bd = Ext.getCmp('start').getValue();
								var ed = Ext.getCmp('end').getValue();
								var bdd = Date.parse(bd); //Date.parse的处理很关键   
								var edd = Date.parse(ed);
								var myDate = new Date();
								var year = myDate.getFullYear();
								var month = myDate.getMonth() + 1;
								if (month < 10) {
									month = "0" + (myDate.getMonth() + 1);
								}
								var day = myDate.getDate();
								if (day < 10) {
									day = "0" + myDate.getDate();
								}
								var hours = myDate.getHours();
								if (hours < 10) {
									hours = "0" + myDate.getHours();
								}
								var minutes = myDate.getMinutes();
								if (minutes < 10) {
									minutes = "0" + myDate.getMinutes();
								}
								var seconds = myDate.getSeconds()
								if (seconds < 10) {
									seconds = "0" + myDate.getSeconds();
								}
								var now = year + "-" + month + "-" + day + "-" + hours + ":" + minutes + ":" + seconds;
								var xdd = myDate.getTime();
								if (bd == "" || bdd == "NaN") {
									var config = {
										title: _('Notice'),
										msg: _('please select startTime！')
									}
									Ext.Msg.show(config);
									var bd = Ext.getCmp("end");
									bd.setValue(" ");
									return false;
								} else {
									if (bdd >= edd || edd > xdd) {
										var config = {
											title: _('Notice'),
											msg: _('time msg')
										}
										Ext.Msg.show(config);
										var bd = Ext.getCmp("start");
										bd.setValue(" ");
										var bd = Ext.getCmp("end");
										bd.setValue(" ");
										return false;
									} else {
										return true;
									};

								}
							}
						}
					},
					{
						xtype: 'combo',
						labelAlign: "right",
						fieldLabel: _('Number of rows per line'),
						editable: false,
						itemId: 'selectColumns',
						//emptyText: '请选择',
						value: '2',
						name: 'columns',
						margin: 10,
						allowBlank: false,
						displayField: 'name',
						valueField: 'abbr',
						queryModel: 'local',
						store: {
							xtype: 'store',
							fields: ['name', 'abbr'],
							data: [
								{ name: _("1"), abbr: 1 },
								{ name: _("2"), abbr: 2 },
								{ name: _("3"), abbr: 3 },
								{ name: _("4"), abbr: 4 },
								{ name: _("5"), abbr: 5 },
								{ name: _("6"), abbr: 6 },
								{ name: _("7"), abbr: 7 },
								{ name: _("8"), abbr: 8 },
								{ name: _("9"), abbr: 9 },
								{ name: _("10"), abbr: 10 },
							]
						},
						listeners: {
							change: 'onColumns',
						}
					},
					{
						xtype: 'button',
						text: _('Query'),
						iconCls: 'x-fa fa-search',
						itemId: 'query',
						handler: 'onQuery',
						margin: 10,
					},
					{
						xtype: 'button',
						text: _('Back'),
						iconCls: 'x-fa fa-close',
						handler: 'onCancel',
						margin: 10,
					}],
			}],
	}],
});