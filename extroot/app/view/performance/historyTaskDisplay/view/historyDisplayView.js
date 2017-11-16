Ext.define('Admin.view.performance.historyTaskDisplay.view.historyDisplayView', {
	xtype: 'historyDisplayView',
	extend: 'Ext.container.Container',
	requires: [
		'Admin.view.performance.historyTaskDisplay.model.taskStoreModel',
		'Admin.view.performance.historyTaskDisplay.viewModel.taskViewModel',
		'Admin.view.performance.historyTaskDisplay.controller.historyDisplay',
		'Admin.view.performance.historyTaskDisplay.view.hisResourceTree',
		'Admin.view.performance.historyTaskDisplay.view.hisMetricTree',
		'Admin.view.performance.historyTaskDisplay.view.taskMetricTree',
		'Admin.view.performance.historyTaskDisplay.view.taskResourceTree',
		'Admin.view.performance.historyTaskDisplay.view.equipTree',
		'Admin.view.performance.historyTaskDisplay.view.historyChartView',
	],
	controller: 'historyDisplay',
	viewModel: 'taskViewModel',
	layout: 'card',
	itemId: 'historyDisplayView',
	defaults: {
		bodyPadding: 3
	},
	items: [
		{
			xtype: 'tabpanel',
			items: [
				{
					xtype: 'container',
					layout: 'border',
					title: _('Show by task performance'),
					margin: 3,
					height: 600,
					items: [
						{
							xtype: 'taskMetricTree',
							itemId: 'taskMetricTree',
							frame: true,
							width: 433,
							region: 'east',
							title: _('metric group'),
						},
						{
							xtype: 'taskResourceTree',
							itemId: 'taskResourceTree',
							frame: true,
							region: 'center',
							title: _('Resources'),
						},
						{
							//性能任务表
							xtype: 'gridpanel',
							itemId: 'historyTaskGrid',
							reference: 'historyTaskGrid',
							region: 'west',
							frame: true,
							title: _('Historical performance tasks'),
							//height: 600,
							width: 500,
							bind: {
								store: '{taskStore}',
							},

							// grid显示字段
							columns: [
								{ text: _('taskId'), dataIndex: 'taskId', width: 100 },
								{ text: _('taskName'), dataIndex: 'taskName', width: 130 },
								{ text: _('collectPeriod'), dataIndex: 'collectPeriod', width: 130 },
								{
									text: _('taskStatus'), dataIndex: 'taskStatus', width: 130,
									renderer: function getRstatus(value) {
										if (value == 1) {
											return _('Not running');
										} else if (value == 2) {
											return _('Running');
										} else if (value == 3) {
											return _('Hang');
										} else if (value == 4) {
											return _('Stop');
										} else {
											return _('Failed');
										}
									}
								},
							],
							dockedItems: [
								{
									xtype: 'pagingtoolbar',
									dock: 'bottom',
									itemId: 'Pagingbar',
									inputItemWidth: 50,
									displayInfo: true,
									displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
									//emptyMsg: _("Empty"),
									items: [
										'-',
										{
											fieldLabel: _('Page Size'),
											xtype: 'combobox',
											width: 140,
											padding: '0 0 0 5',
											displayField: 'val',
											valueField: 'val',
											multiSelect: false,
											editable: false,
											labelWidth: 60,
											store: Ext.create('Ext.data.Store', {
												fields: [{ name: 'val', type: 'int' }],
												data: [
													{ val: 15 },
													{ val: 30 },
													{ val: 50 },
												]
											}),
											value: 15,
											listeners: {
												change: function (me, newValue, oldValue, ops) {
													var grid = this.up('grid');
													Ext.apply(grid.store, { pageSize: newValue });
													this.up('pagingtoolbar').moveFirst();
												}
											}
										}
									]
								},
							],
							listeners: {
								itemclick: 'onSelect',
							}
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
							]
						}
					]
				},
				{
					xtype: 'container',
					layout: 'border',
					title: _('Display by device performance'),
					margin: 5,
					height: 600,
					items: [{
						xtype: 'equipTree',
						//height: 430,
						itemId: 'equipTree',
						frame: true,
						width: 433,
						region: 'west',
						title: _('Device'),
					},
					{
						xtype: 'hisResourceTree',
						itemId: 'hisResourceTree',
						//height: 430,
						frame: true,
						//width:250,
						region: 'center',
						title: _('Resources'),
					},
					{
						xtype: 'hisMetricTree',
						itemId: 'hisMetricTree',
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
						]
					}]
				}
			],
			//
			listeners: {
				tabchange: function () {
					var card = this.up().up();
					console.info(card);
					console.info('qiehuan');
					var grid = card.down('#historyTaskGrid');
					var taskMetricTree = card.down('#taskMetricTree');
					var taskResourceTree = card.down('#taskResourceTree');
					var equipTree = card.down('#equipTree');
					var hisResourceTree = card.down('#hisResourceTree');
					var hisMetricTree = card.down('#hisMetricTree');
					var gridRecord = grid.getSelectionModel().getSelection()[0];
					grid.getSelectionModel().deselect(gridRecord);
					//清除tree行选中数据
					var recordEquip = equipTree.getSelection();
					equipTree.getSelectionModel().deselect(recordEquip);
					//清除 tree 选中数据
					var recordTaskMetric = taskMetricTree.getChecked();
					taskMetricTree.getStore().remove(recordTaskMetric);

					var recordTaskResource = taskResourceTree.getChecked();
					taskResourceTree.getStore().remove(recordTaskResource);

					var recordHisResource = hisResourceTree.getChecked();
					hisResourceTree.getStore().remove(recordHisResource);

					var recordHisMetric = hisMetricTree.getChecked();
					hisMetricTree.getStore().remove(recordHisMetric);
				}

			}
		},
		{
			xtype: 'historyChartView'
		}
	]
})