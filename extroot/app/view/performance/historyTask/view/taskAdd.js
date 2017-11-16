Ext.define('Admin.view.performance.historyTask.view.taskAdd', {
	extend: 'Ext.form.Panel',
	xtype: 'taskAdd',
	requires: [
		'Admin.view.performance.historyTask.controller.addControl',
		'Admin.view.performance.historyTask.viewModel.addViewModel',
		'Admin.view.performance.historyTask.model.collectPeriodStoreModel',
		'Admin.view.performance.historyTask.model.interactPeriodStoreModel',
		'Admin.view.base.DateTimeField.field.DateTime',
		'Admin.view.performance.historyTask.model.protocolTypeStoreModel',
	],
	controller: 'addControl',
	viewModel: 'addViewModel',
	reference: 'addFormsss',
	itemId: 'add',
	items: [
		{
			xtype: 'panel',
			// tittle:'立即创建任务',
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
											allowBlank: false,
											lableWidth: 20,
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
											// blankText:'协议类型不可为空!',  
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
											// blankText:'任务类型不可为空!',  
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
													// allowBlank: false,
													itemId: 'tasksCollectPeriod',
													emptyText: _('Please select'),
													bind: {
														store: '{collectPeriodStore}',
													},
													// blankText:'采集周期不可为空!',  
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
											itemId: 'tasksInteractPeriod',
											//allowBlank: false,
											emptyText: _('Please select'),
											bind: {
												store: '{interactPeriodStore}',
											},
											valueField: 'addr',
											displayField: 'name',
											//blankText:'交互周期不可为空!',  
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
								//checked: true,
								labelAlign: "right",
								itemId: 'addCollection',
								hideEmptyLabel: false,
								listeners: {
									change: 'addLock'
								}
							},
						]
					},
					{
						xtype: 'container',
						layout: 'column',
						reference: 'collectForm',
						itemId: 'addTime',
						hidden: true,
						items: [
							{
								xtype: 'datetimefield',
								fieldLabel: _('startTime'),
								name: 'executeTime',
								columnWidth: 0.25,
								labelAlign: "right",
								id: 'begindate',
								itemId: 'begindate',
								editable: false,
								minValue: new Date(),
								listeners: {
									"select": function () {
										var bd = Ext.getCmp('begindate').getValue();
										var ed = Ext.getCmp('enddate').getValue();
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
											Ext.Msg.alert(config);
											var bd = Ext.getCmp("enddate");
											bd.setValue(" ");
											return false;
										} else {
											if (bdd <= xdd || bdd >= edd) {
												var config = {
													title: _('Notice'),
													msg: _('startTime no less than now')
												}
												Ext.Msg.alert(config);
												var bd = Ext.getCmp("begindate");
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
								fieldLabel: _('endTime'),
								labelAlign: "right",
								name: 'endTime',
								id: 'enddate',
								columnWidth: 0.25,
								editable: false,
								minValue: new Date(),
								itemId: 'enddate',
								maxLength: '20',
								anchor: '90%',
								listeners: {
									"select": function () {
										var bd = Ext.getCmp('begindate').getValue();
										var ed = Ext.getCmp('enddate').getValue();
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
											var bd = Ext.getCmp("enddate");
											bd.setValue(" ");
											return false;
										} else {
											if (edd <= xdd) {
												var config = {
													title: _('Notice'),
													msg: _('time info')
												}
												Ext.Msg.show(config);
												var bd = Ext.getCmp("enddate");
												bd.setValue(" ");
												return false;
											};
											if (bdd >= edd) {
												var config = {
													title: _('Notice'),
													msg: _('endTime no less than startTime！')
												}
												Ext.Msg.show(config);
												var bd = Ext.getCmp("begindate");
												bd.setValue(" ");
												var bd = Ext.getCmp("enddate");
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
				//采集时长
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
							reference: 'resourceGrid',
							itemId: 'resourceGrid',
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
								{ text: _('neName'), dataIndex: 'neName', width: 400 },
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
									selectionchange: 'tempButton',
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
											handler: 'addResources'
										},

										{
											text: _('Remove'),
											iconCls: 'x-fa fa-trash',
											handler: 'onRemove',
											bind: {
												disabled: '{!resourceGrid.selection}'
											}
										},
									]
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
					itemId: 'templateSettings',
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
									labelAlign: "right",
									name: 'metricTmplName',
									// blankText:'指标模板不可为空!',  
									itemId: 'metricTmplName',
									allowBlank: false,
									editable: false,
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
									itemId: 'addTempButton',
									disabled: 'true',
									margin: 10,
									handler: 'addTempButton'
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



