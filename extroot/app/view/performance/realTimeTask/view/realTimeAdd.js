Ext.define('Admin.view.performance.realTimeTask.view.realTimeAdd', {
	xtype: 'realTimeAdd',
	extend: 'Ext.form.Panel',
	requires: [
		'Admin.view.performance.realTimeTask.controller.realTimeAdd',
		'Admin.view.performance.realTimeTask.view.resourcesTree',
		'Admin.view.performance.realTimeTask.view.metricTree',
		'Admin.view.performance.realTimeTask.view.deviceTree',
		'Admin.view.performance.realTimeTask.view.realTimeChartView',
		'Admin.view.performance.realTimeTask.viewModel.realTimeAddViewModel',
		'Admin.view.performance.realTimeTask.model.collectStoreModel',
		'Admin.view.performance.realTimeTask.model.protocolTypeModel',
	],
	controller: 'realTimeAdd',
	viewModel: 'realTimeAddViewModel',
	layout: 'card',
	itemId: 'realTimeAdd',
	items: [
		{
			xtype: 'container',
			layout: 'border',
			height: 600,
			items: [
				{
					xtype: 'form',
					region: 'north',
					itemId: 'realTask',
					layout: 'anchor',
					defaults: {
						anchor: '100%'
					},
					items: [
						{
							xtype: 'fieldset',
							title: _('taskInformation'),
							defaultType: 'textfield',
							layout: 'column',
							items: [
								{
									xtype: 'combo',
									fieldLabel: _('protocolType'),
									columnWidth: 0.2,
									name: 'protocolType',
									editable: false,
									labelAlign: "right",
									allowBlank: false,
									emptyText: _('Please select'),
									bind: {
										store: '{protocolStore}',
									},
									valueField: 'addr',
									// blankText:'协议类型不可为空!',  
									displayField: 'name',
									queryMode: 'local',
								},

								{
									xtype: 'textfield',
									fieldLabel: _('createUser'),
									name: 'createUser',
									columnWidth: 0.2,
									labelAlign: "right",
									hidden: true
								},

								{
									xtype: 'combo',
									fieldLabel: _('collectPeriod'),
									name: 'collectPeriod',
									editable: false,
									columnWidth: 0.2,
									labelAlign: "right",
									allowBlank: false,
									itemId: 'realTimeCollectPeriod',
									emptyText: _('Please select'),
									bind: {
										store: '{collectStore}',
									},
									// blankText:'采集周期不可为空!',  
									valueField: 'addr',
									displayField: 'name',
									queryMode: 'local',
								},


								{
									xtype: 'combo',
									fieldLabel: _('collectType'),
									editable: false,
									emptyText: _('Please select'),
									columnWidth: 0.2,
									name: 'collectType',
									allowBlank: false,
									//blankText:'采集类型不可为空!',  
									labelAlign: "right",
									displayField: 'name',
									valueField: 'abbr',
									queryModel: 'local',
									store: {
										xtype: 'store',
										fields: ['name', 'abbr'],
										data: [
											{ name: _("initiative"), abbr: 1 },
											{ name: _("passive"), abbr: 2 }
										]
									},
								},

							]
						},//任务信息

						//采集时长form
						{
							xtype: 'fieldset',
							title: _('collectDuration'),
							layout: 'anchor',
							defaults: {
								anchor: '100%'
							},
							items: [{
								xtype: 'radiogroup',
								reference: 'radio',
								layout: {
									autoFlex: false
								},
								defaults: {
									name: 'ccType',
								},
								items: [
									{
										fieldLabel: _('continuousCollection'),
										inputValue: _('continuousCollection'),
										labelAlign: "right",
										checked: true,
									},
									{
										boxLabel: _('customCollection'),
										labelAlign: "right",
										itemId: 'addCollection',
										hideEmptyLabel: false,
										listeners: {
											change: 'addLock'
										}
									},
									{
										xtype: 'datetimefield',
										fieldLabel: _('endTime'),
										name: 'endTime',
										width: 400,
										// margin:2,
										labelAlign: "right",
										labelWidth: 150,
										hidden: true,
										editable: false,
										id: 'realEndTime',
										minValue: new Date(new Date() + 1 * 24 * 60 * 60 * 1000),
										itemId: 'realEndTime',
										listeners: {
											"select": function () {
												var ed = Ext.getCmp('realEndTime').getValue();
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
												if (edd <= xdd) {
													var config = {
														title: _('Notice'),
														msg: _('time info')
													}
													Ext.Msg.alert(config);
													var bd = Ext.getCmp("realEndTime");
													bd.setValue(" ");
													return false;
												} else {
													return true;
												};

											}
										}
									},
								]
							}]
						},
					]
				},
				{
					xtype: 'deviceTree',
					//height: 430,
					itemId: 'deviceTree',
					frame: true,
					width: 433,
					region: 'west',
					title: _('All equipment'),
				},
				{
					xtype: 'resourcesTree',
					itemId: 'resourcesTree',
					//height: 430,
					frame: true,
					//width:250,
					region: 'center',
					title: _('Resources'),
				},
				{
					xtype: 'metricTree',
					itemId: 'metricTree',
					//height: 430,
					frame: true,
					width: 433,
					region: 'east',
					title: _('metric group'),
				},
				{
					xtype: 'panel',
					region: 'south',
					height: 60,
					buttons: [
						'->',
						{
							xtype: 'button',
							text: _('Confirm'),
							iconCls: 'x-fa fa-plus',
							handler: 'onConfirm'
						},
						{
							text: _('Cancel'),
							iconCls: 'x-fa fa-close',
							handler: 'onCancel',
						}],
				}]
		},
		{
			xtype: 'realTimeChartView'
		}
	]
})