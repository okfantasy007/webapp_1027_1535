Ext.define('Admin.view.performance.historyTask.view.singleUpd', {
	extend: 'Ext.form.Panel',
	xtype: 'singleUpd',
	requires: [
		'Admin.view.performance.historyTask.controller.singleUpd',
		'Admin.view.performance.historyTask.viewModel.addViewModel',
		'Admin.view.performance.historyTask.model.collectPeriodStoreModel',
		'Admin.view.performance.historyTask.model.interactPeriodStoreModel',
		'Admin.view.base.DateTimeField.field.DateTime',
		'Admin.view.performance.historyTask.view.singleUpdResourceTree',
		'Admin.view.performance.historyTask.view.singUpdEquipmentTree',
		'Admin.view.performance.historyTask.model.protocolTypeStoreModel',
	],
	controller: 'singleUpd',
	viewModel: 'addViewModel',
	itemId: 'singleUpd',
	items: [
		{
			xtype: 'panel',
			tittle: _('updateTask'),
			bodyPadding: 5,
			border: false,
			fieldDefaults: {
				labelAlign: 'right',
				msgTarget: 'side'
			},
			lableWidth: 40,
			itemId: 'addTask',
			items: [
				//任务信息form
				{
					xtype: 'fieldset',
					title: _('taskInformation'),
					//margin: 10,
					defaultType: 'textfield',
					defaults: {
						anchor: '100%'
					},
					items: [
						{
							xtype: "container",
							layout: "hbox",
							items: [
								{
									xtype: 'container',
									layout: 'vbox',
									defaultType: 'textfield',
									margin: '0 0 5 0',
									items: [
										{
											xtype: 'textfield',
											fieldLabel: _('taskId'),
											labelAlign: "right",
											name: 'taskId',
											margin: 5,
											hidden: true
										},
										{
											xtype: 'textfield',
											fieldLabel: _('taskName'),
											name: 'taskName',
											labelAlign: "right",
											lableWidth: 20,
											allowBlank: false,
											margin: 5
										},
										{
											xtype: 'combo',
											fieldLabel: _('protocolType'),
											name: 'protocolType',
											//editable: false,
											labelAlign: "right",
											allowBlank: false,
											emptyText: _('Please select'),
											bind: {
												store: '{protocolTypeStore}',
											},
											valueField: 'addr',
											margin: 5,
											displayField: 'name',
											queryMode: 'local',
										},
									]
								},
								{
									xtype: 'container',
									layout: 'vbox',
									defaultType: 'textfield',
									margin: '0 0 5 0',
									items: [
										{
											xtype: 'textfield',
											fieldLabel: _('createUser'),
											name: 'createUser',
											labelAlign: "right",
											margin: 10,
											hidden: true
										},

										{
											xtype: 'combo',
											fieldLabel: _('taskType'),
											editable: false,
											emptyText: _('Please select'),
											name: 'taskType',
											margin: 5,
											allowBlank: false,
											labelAlign: "right",
											displayField: 'name',
											valueField: 'abbr',
											queryModel: 'local',
											store: {
												xtype: 'store',
												fields: ['name', 'abbr'],
												data: [
													{ name: _("smallHistoricalTasks"), abbr: 3 },
													{ name: _("generalHistoricalTasks"), abbr: 2 }
												]
											},
										},

										{
											xtype: 'container',
											layout: 'hbox',
											margin: '0 0 5 0',
											items: [
												{
													xtype: 'combo',
													fieldLabel: _('collectPeriod'),
													name: 'collectPeriod',
													editable: false,
													labelAlign: "right",
													allowBlank: false,
													itemId: 'singUpdCollectPeriod',
													emptyText: _('Please select'),
													bind: {
														store: '{collectPeriodStore}',
													},
													valueField: 'addr',
													margin: 5,
													displayField: 'name',
													queryMode: 'local',
												},
											]
										},
									]
								},

								{
									xtype: 'container',
									layout: 'vbox',
									defaultType: 'textfield',
									margin: '0 0 5 0',
									items: [
										{
											xtype: 'textfield',
											fieldLabel: _('taskStatus'),
											itemId: 'status',
											labelAlign: "right",
											name: 'taskStatus',
											hidden: true,
											value: _(1),
											margin: 5,
										},
										{
											xtype: 'combo',
											fieldLabel: _('interactPeriod'),
											name: 'interactPeriod',
											editable: false,
											labelAlign: "right",
											itemId: 'singUpdInteractPeriod',
											allowBlank: false,
											emptyText: _('Please select'),
											bind: {
												store: '{interactPeriodStore}',
											},
											valueField: 'addr',
											displayField: 'name',
											margin: 5,
											queryMode: 'local',
										},
										{
											xtype: 'combo',
											itemId: 'selectType',
											fieldLabel: _('collectType'),
											editable: false,
											emptyText: _('Please select'),
											name: 'collectType',
											margin: 5,
											allowBlank: false,
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
								},
								{
									xtype: 'container',
									layout: 'vbox',
									defaultType: 'textfield',
									margin: '0 0 5 0',
									items: [

										{
											xtype: 'textfield',
											fieldLabel: _('taskCreateMethod'),
											name: 'taskCreateMethod',
											labelAlign: "right",
											margin: 10,
											value: '1',
											hidden: true
										},
										{
											xtype: 'datetimefield',
											name: 'createTime',
											itemId: 'createTime',
											labelAlign: "right",
											fieldLabel: _('createTime'),
											editable: false,
											value: new Date(),
											hidden: true,
										},
									]
								},
							]
						}
					]
				},//任务信息

				//采集时长form
				{
					xtype: 'fieldset',
					layout: 'anchor',
					defaults: {
						anchor: '100%'
					},
					items: [{
						xtype: 'radiogroup',
						reference: 'radio',
						itemId: 'singleRadiogroup',
						layout: {
							autoFlex: false
						},
						defaults: {
							name: 'ccType',
						},
						listeners: {
							change: 'singUpdLock'
						},
						items: [
							{
								itemId: 'singleUpdCollection',
								fieldLabel: _('continuousCollection'),
								inputValue: 0,
								name: 'custom',
								labelAlign: "right",

							},
							{
								boxLabel: _('customCollection'),
								checked: true,
								name: 'custom',
								labelWidth: 120,
								inputValue: 1,
								labelAlign: "right",
								hideEmptyLabel: false

							}
						]
					},
					{
						xtype: 'container',
						layout: 'column',
						reference: 'collectForm',
						itemId: 'singleUpdTime',
						items: [
							{
								xtype: 'datetimefield',
								fieldLabel: _('executeTime'),
								name: 'executeTime',
								columnWidth: 0.25,
								itemId: 'singleExecuteTime',
								labelAlign: "right",
								id: 'singUpdStart',
								editable: false,
								minValue: new Date(),
								listeners: {
									"select": function () {
										var bd = Ext.getCmp('singUpdStart').getValue();
										var bdd = Date.parse(bd); //Date.parse的处理很关键 
										var ed = Ext.getCmp('singleUpdEnd').getValue();
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
											var bd = Ext.getCmp("singleUpdEnd");
											bd.setValue(" ");
											return false;
										} else {
											if (bdd <= xdd || bdd >= edd) {
												var config = {
													title: _('Notice'),
													msg: _('startTime no less than now')
												}
												Ext.Msg.show(config);
												var bd = Ext.getCmp("singUpdStart");
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
								xtype: 'datetimefield',
								fieldLabel: _('endTime'),
								labelAlign: "right",
								name: 'endTime',
								columnWidth: 0.25,
								editable: false,
								minValue: new Date(),
								itemId: 'singEndTime',
								id: 'singleUpdEnd',
								maxLength: '20',
								anchor: '90%',
								listeners: {
									"select": function () {
										var bd = Ext.getCmp('singUpdStart').getValue();
										var ed = Ext.getCmp('singleUpdEnd').getValue();
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
											var bd = Ext.getCmp("singleUpdEnd");
											bd.setValue(" ");
											return false;
										} else {
											if (edd <= xdd) {
												var config = {
													title: _('Notice'),
													msg: _('time info！')
												}
												Ext.Msg.show(config);
												var bd = Ext.getCmp("singleUpdEnd");
												bd.setValue(" ");
												return false;
											};
											if (bdd >= edd) {
												var config = {
													title: _('Notice'),
													msg: _('endTime no less than startTime！')
												}
												Ext.Msg.show(config);
												var bd = Ext.getCmp("singUpdStart");
												bd.setValue(" ");
												var bd = Ext.getCmp("singleUpdEnd");
												bd.setValue(" ");
												return false;
											} else {
												return true;
											};

										}
									}
								}
							}
						]
					}
					]
				},//采集时长

				//资源表 
				{
					xtype: 'panel',
					//title:_('添加资源'),
					margin: 10,
					itemId: 'equipment',
					defaults: {
						anchor: '100%'
					},
					items: [
						{
							xtype: 'container',
							itemId: 'eqTree',
							layout: 'column',
							items: [
								{

									xtype: 'singUpdEquipmentTree',
									itemId: 'singUpdEquipmentTree',
									//height: 430,
									//frame:true,
									columnWidth: .50,
									title: _('Device'),
								},
								{
									xtype: 'singleUpdResourceTree',
									//height: 430,
									itemId: 'singleUpdResourceTree',
									//frame:true,
									columnWidth: .50,
									title: _('Resources'),
								},

							]
						},
					],
				},
				//模板设置form
				{
					xtype: 'form',
					title: _('templateSettings'),
					margin: 10,
					defaultType: 'textfield',
					itemId: 'updTemplateSettings',
					defaults: {
						anchor: '100%'
					},
					items: [
						{
							xtype: 'container',
							layout: 'hbox',
							itemId: 'templateContainer',
							defaultType: 'textfield',
							labelWidth: 60,
							items: [
								{
									xtype: 'textfield',
									fieldLabel: _('metricTemplate'),
									labelAlign: "right",
									name: 'metricTmplName',
									editable: false,
									allowBlank: false,
									margin: 10,
								},
								{
									xtype: 'textfield',
									fieldLabel: _('thresholdTemplate'),
									labelAlign: "right",
									name: 'tcaTmplName',
									editable: false,
									margin: 10,
								},

								{
									xtype: 'button',
									text: _('Add'),
									iconCls: 'x-fa fa-plus',
									margin: 10,
									disabled: 'true',
									disabled: 'true',
									margin: 10,
									id: 'singUpdTempButton',
									handler: 'singUpdTempButton'
								}]
						},
					],
				},//templateSettings
			],

			buttons: [
				{
					text: _('Submit'),
					iconCls: 'x-fa fa-plus',
					handler: 'onSubmit'
				},

				{
					text: _('Cancel'),
					iconCls: 'x-fa fa-close',
					handler: 'onCancel',
				}
			],
		}
	],
})



