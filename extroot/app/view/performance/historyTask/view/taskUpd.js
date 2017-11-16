Ext.define('Admin.view.performance.historyTask.view.taskUpd', {
	extend: 'Ext.form.Panel',
	xtype: 'taskUpd',
	requires: [
		'Admin.view.performance.historyTask.controller.updControl',
		'Admin.view.performance.historyTask.viewModel.updViewModel',
		'Admin.view.performance.historyTask.model.collectPeriodStoreModel',
		'Admin.view.performance.historyTask.model.interactPeriodStoreModel',
		'Admin.view.base.DateTimeField.field.DateTime',
		'Admin.view.performance.historyTask.model.protocolTypeStoreModel',
	],
	controller: 'updControl',
	viewModel: 'updViewModel',
	itemId: 'upd',
	layout: 'card',
	items: [
		{
			xtype: 'panel',
			tittle: '任务修改',
			bodyPadding: 5,
			border: false,
			fieldDefaults: {
				labelAlign: 'right',
				msgTarget: 'side'
			},
			lableWidth: 40,
			itemId: 'updTask',
			items: [
				//任务信息form
				{
					xtype: 'fieldset',
					title: _('taskInformation'),
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
											margin: 5
										},
										{
											xtype: 'combo',
											fieldLabel: _('protocolType'),
											name: 'protocolType',
											editable: false,
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
													itemId: 'taskUpdCollectPeriod',
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
											itemId: 'taskUpdInteractPeriod',
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
										{
											xtype: 'textfield',
											fieldLabel: _('taskCreateMethod'),
											name: 'taskCreateMethod',
											labelAlign: "right",
											lableWidth: 20,
											value: '2',
											margin: 5,
											hidden: true,
										},
										{
											xtype: 'datetimefield',
											name: 'createTime',
											itemId: 'createTime',
											labelAlign: "right",
											fieldLabel: _('createTime'),
											editable: false,
											value: new Date(),
											//allowBlank: false,
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
					title: _('collectDuration'),
					layout: 'anchor',
					defaults: {
						anchor: '100%'
					},

					items: [
						{
							xtype: 'radiogroup',
							reference: 'radio',
							itemId: 'updRadiogroup',
							layout: {
								autoFlex: false
							},
							defaults: {
								name: 'ccType',
							},
							listeners: {
								change: 'taskUpdLock'
							},
							items: [
								{
									itemId: 'updRadio',
									fieldLabel: _('continuousCollection'),
									inputValue: 0,
									name: 'continu',
									labelAlign: "right",

								},
								{
									boxLabel: _('customCollection'),
									checked: true,
									name: 'continu',
									inputValue: 1,
									labelAlign: "right",
									hideEmptyLabel: false

								}
							]
						},
						{
							xtype: 'container',
							layout: 'hbox',
							reference: 'collectForm',
							itemId: 'updTime',
							items: [
								{
									xtype: 'datetimefield',
									fieldLabel: _('executeTime'),
									name: 'executeTime',
									//columnWidth:0.2,
									labelAlign: "right",
									itemId: 'updBegin',
									id: 'updBegin',
									editable: false,
									minValue: new Date(),
									listeners: {
										"select": function () {
											var bd = Ext.getCmp('updBegin').getValue();
											var bdd = Date.parse(bd); //Date.parse的处理很关键 
											var ed = Ext.getCmp('updEnd').getValue();
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
												var bd = Ext.getCmp("updEnd");
												bd.setValue(" ");
												return false;
											} else {
												if (bdd <= xdd || bdd >= edd) {
													var config = {
														title: _('Notice'),
														msg: _('startTime no less than now')
													}
													Ext.Msg.show(config);
													var bd = Ext.getCmp("updBegin");
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
									id: 'updEnd',
									//columnWidth:0.25,
									editable: false,
									minValue: new Date(),
									itemId: 'taskEndTime',
									maxLength: '20',
									anchor: '90%',
									listeners: {
										"select": function () {
											var bd = Ext.getCmp('updBegin').getValue();
											var ed = Ext.getCmp('updEnd').getValue();
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
												var bd = Ext.getCmp("updEnd");
												bd.setValue(" ");
												return false;
											} else {
												if (edd <= xdd) {
													var config = {
														title: _('Notice'),
														msg: _('time info')
													}
													Ext.Msg.show(config);
													var bd = Ext.getCmp("updEnd");
													bd.setValue(" ");
													return false;
												};
												if (bdd >= edd) {
													var config = {
														title: _('Notice'),
														msg: _('endTime no less than startTime！')
													}
													Ext.Msg.show(config);
													var bd = Ext.getCmp("updBegin");
													bd.setValue(" ");
													var bd = Ext.getCmp("updEnd");
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
				},
				//资源表 
				{
					xtype: 'panel',
					layout: {
						type: 'vbox',
						align: 'stretch',
						pack: 'start'
					},
					reference: 'mainView',
					itemId: 'resource',
					items: [
						{
							title: _('resourceSettings'),
							xtype: 'grid',
							reference: 'updResourceGrid',
							itemId: 'updResourceGrid',
							height: 300,
							width: 1000,
							defaults: {
								anchor: '100%'
							},
							autoScroll: true,//滚动条
							// 绑定到viewModel的属性
							bind: {
								store: '{resourceStore}',
							},
							// grid显示字段
							columns: [
								{ text: _('serialNumber'), xtype: 'rownumberer', width: 80, sortable: false, align: 'center' },
								{ text: _('rsName'), dataIndex: 'rsName', width: 300 },
								{ text: _('rsType'), dataIndex: 'rsType', width: 300 },
								{ text: _('neIp'), dataIndex: 'neIp', width: 300 },
								{ text: _('NE Name'), dataIndex: 'neName', width: 400 },
								{ text: _('metypeName'), dataIndex: 'metypeName', width: 150, hidden: true },
								{ text: _('rsStatus'), dataIndex: 'rsStatus', width: 150, hidden: true },
								{ text: _('metypeId'), dataIndex: 'metypeId', width: 150, hidden: true },
								{ text: _('neId'), dataIndex: 'neId', width: 150, hidden: true },
								{ text: _('rsIndex'), dataIndex: 'rsIndex', width: 150, hidden: true },
								{ text: _('rsUrl'), dataIndex: 'rsUrl', width: 150, hidden: true },
							],
							selModel: {
								selType: 'checkboxmodel', // XTYPE
								//mode: 'SINGLE',
								multiSelect: true,
								toggleOnClick: true,
								allowDeselect: true,
								listeners: {
									//点击记录时触发
									selectionchange: 'updButton',
								}
							},
							// 自定义工具条
							dockedItems: [
								{
									xtype: 'toolbar',
									dock: 'top',//工具条位置
									items: [
										{
											text: _('Add'),
											iconCls: 'x-fa fa-plus',
											handler: 'updResources'
										},

										{
											text: _('Remove'),
											iconCls: 'x-fa fa-trash',
											handler: 'onRemove',
											bind: {
												disabled: '{!resourceGrid.selection}'
											}
										}],
								}]
						}//grid
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
							defaultType: 'textfield',
							// margin: '0 0 5 0',
							labelWidth: 60,
							items: [
								{
									xtype: 'textfield',
									fieldLabel: _('metricTemplate'),
									name: 'metricTmplName',
									editable: false,
									margin: 10,
								},
								{
									xtype: 'textfield',
									fieldLabel: _('thresholdTemplate'),
									name: 'tcaTmplName',
									editable: false,
									margin: 10,
								},

								{
									xtype: 'button',
									text: _('Add'),
									iconCls: 'x-fa fa-plus',
									disabled: 'true',
									itemId: 'updTempButton',
									margin: 10,
									handler: 'updTempButton'
								}]
						},
					],
				},//templateSettings
			],
			buttons: [
				{
					text: _('Submit'),
					iconCls: 'x-fa fa-plus',
					handler: 'onUpd'
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



