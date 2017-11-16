Ext.define('Admin.view.performance.historyTask.view.performanceMainView', {
	extend: 'Ext.container.Container',
	xtype: 'performanceMainView',
	requires: [
		'Admin.view.performance.historyTask.model.resourceStoreModel',
		'Admin.view.performance.historyTask.model.performanceStoreModel',
		'Admin.view.performance.historyTask.viewModel.mainViewModel',
		'Admin.view.performance.historyTask.controller.taskMainControl',
		'Admin.view.performance.historyTask.view.detailedQueryform',
		'Admin.view.performance.historyTask.view.taskAdd',
		'Admin.view.performance.historyTask.view.singleAdd',
		'Admin.view.performance.historyTask.view.taskUpd',
		'Admin.view.performance.historyTask.view.singleUpd',
		'Admin.view.performance.historyTask.view.treeForm',
		'Admin.view.performance.historyTask.view.template',
		'Admin.view.performance.historyTask.view.updTreeForm',
		'Admin.view.performance.historyTask.view.updTemplate',
		'Admin.view.performance.historyTask.view.singleAddTemplate',
		'Admin.view.performance.historyTask.view.singleUpdTemplate',
		'Admin.view.performance.historyTask.view.detailedSingleTask',
	],
	controller: 'taskMainControl',
	viewModel: 'mainViewModel',
	itemId: 'performanceMainView',
	// 指定布局
	layout: 'card',
	// 指定panel边缘的阴影效果
	cls: 'shadow',
	activeItem: 0,
	// id: 'performanceMianId',
	items: [
		{

			//性能任务管理主界面
			title: _('performanceManagement'),
			xtyp: 'panel',
			layout: {
				type: 'vbox',
				align: 'stretch',
				pack: 'start'
			},
			reference: 'mainView',
			itemId: 'mainView',

			items: [
				{
					xtype: 'form',
					reference: 'serchForm',
					itemId: 'serchForm',
					bodyPadding: 5,
					border: false,
					hidden: true,
					fieldDefaults: {
						labelAlign: 'right',
						labelWidth: 80,
						msgTarget: 'side'
					},

					items: [
						{
							xtype: 'container',
							layout: 'hbox',
							defaultType: 'textfield',
							items: [

								{
									xtype: 'textfield',
									fieldLabel: _('taskName'),
									margin: 4,
									name: 'taskName'
								},

								{
									xtype: 'textfield',
									fieldLabel: _('taskStatus'),
									labelAlign: "right",
									name: 'taskStatus',
									margin: 4,
								},

								{
									xtype: 'combo',
									fieldLabel: _('taskType'),
									editable: false,
									emptyText: _('Please select'),
									name: 'taskType',
									margin: 4,
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
									xtype: 'textfield',
									fieldLabel: _('createUser'),
									name: 'createUser',
									labelAlign: "right",
									margin: 4,
								},
								{
									xtype: 'button',
									text: _('Reset'),//'重置查询',
									iconCls: 'search_reset_bnt',
									margin: 4,
									handler: function () {
										this.up('form').getForm().reset();

									}
								},
								{
									xtype: 'button',
									iconCls: 'search_with_condition',
									text: _('Search'),
									margin: 4,
									handler: 'onQueryCondition',
								}
							]
						},
					],
				},

				{
					//性能任务表
					xtype: 'grid',
					itemId: 'performanceGrid',
					reference: 'performanceGrid',
					// region: 'center',
					height: 600,
					// 绑定到viewModel的属性
					bind: {
						store: '{performanceStore}',
					},
					// grid显示字段
					columns: [
						{ text: _('taskId'), dataIndex: 'taskId', width: 150 },
						{ text: _('taskName'), dataIndex: 'taskName', width: 180 },
						{
							text: _('taskStatus'), dataIndex: 'taskStatus', width: 140,
							renderer: function getRstatus(value, m, r) {
								if (value == 1) {
									return _('Not running');
								} else if (value == 2) {
									return _('Running');
								} else if (value == 3) {
									return _('Hang');
								} else if (value == 4) {
									return _('stopped');
								} else {
									return _('failure');
								}
							}
						},
						{ text: _('createUser'), dataIndex: 'createUser', width: 140 },
						{
							text: _('taskType'), dataIndex: 'taskType', width: 140,
							renderer: function getRstatus(value) {
								if (value == 3) {
									return _('smallHistoricalTasks');
								} else if (value == 2) {
									return _('generalHistoricalTasks');
								}
							}
						},
						{ text: _('createTime'), dataIndex: 'createTime', width: 180 },
						{ text: _('endTime'), dataIndex: 'endTime', width: 180 },
						{
							text: _('collectPeriod'), dataIndex: 'collectPeriod', width: 100, hidden: false,
							renderer: function (val) {
								if (val <= 60) return val + _('Seconds');
								if (60 < val < 60 * 60) return val / 60 + _('Minutes');
								if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
								if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
							},
						},
						{
							text: _('interactPeriod'), dataIndex: 'interactPeriod', width: 100, hidden: true,
							renderer: function (val) {
								if (val <= 60) return val + _('Seconds');
								if (60 < val < 60 * 60) return val / 60 + _('Minutes');
								if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
								if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
							},
						},
						{ text: _('quotaTemplate'), dataIndex: 'metricTmplName', width: 100, hidden: true },
						{ text: _('thresholdTemplate'), dataIndex: 'tcaTmplName', width: 100, hidden: true },
						{ text: _('executeTime'), dataIndex: 'executeTime', width: 100, hidden: true },
						{ text: _('taskCreateMethod'), dataIndex: 'taskCreateMethod', width: 100, hidden: true },
						{ text: _('protocolType'), dataIndex: 'protocolType', width: 100, hidden: true },
						{ text: _('collectType'), dataIndex: 'collectType', width: 100, hidden: true },
					],
					//复选框
					selModel: {
						selType: 'checkboxmodel', // XTYPE
						//mode: 'SINGLE',
						multiSelect: true,
						toggleOnClick: true,
						allowDeselect: true,
						listeners: {
							//点击记录时触发
							selectionchange: 'onSelect',
						}
					},
					listeners: {
						itemcontextmenu: 'onclick',
						render: 'onRender',
					},
					dockedItems: [
						{
							xtype: 'pagingtoolbar',
							dock: 'bottom',
							itemId: 'Pagingbar',
							inputItemWidth: 80,
							displayInfo: true,
							displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
							emptyMsg: _("Empty"),
							items: [
								'-',
								{
									fieldLabel: _('Page Size'),
									xtype: 'combobox',
									width: 170,
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
						{
							xtype: 'toolbar',
							dock: 'top',
							items: [
								{
									text: _('Start'),
									iconCls: 'x-fa fa-play-circle-o',
									hidden: SEC.hidden('05010101'),
									handler: 'onStart',
									bind: {
										disabled: '{!performanceGrid.selection}'
									},
								},
								{
									text: _('suspend'),
									iconCls: 'x-fa fa-pause',
									hidden: SEC.hidden('05010102'),
									itemId: 'suspend',
									handler: 'onSuspend',
									bind: {
										disabled: '{!performanceGrid.selection}'
									},

								},
								{
									text: _('Stop'),
									iconCls: 'x-fa fa-stop',
									itemId: 'Stop',
									hidden: SEC.hidden('05010103'),
									handler: 'onStop',
									bind: {
										disabled: '{!performanceGrid.selection}'
									},
								},
								'->',
								{
									text: _('singleAdd'),
									iconCls: 'x-fa fa-plus',
									itemId: 'AddOne',
									hidden: SEC.hidden('05010104'),
									handler: 'onAddOne'
								},
								{
									text: _('batchAdd'),
									iconCls: 'x-fa fa-plus',
									itemId: 'Add',
									hidden: SEC.hidden('05010105'),
									handler: 'onAdd'
								},
								{
									text: _('Edit'),
									itemId: 'Edit',
									iconCls: 'x-fa fa-edit',
									hidden: SEC.hidden('05010106'),
									handler: 'onEdit',
									bind: {
										disabled: '{!performanceGrid.selection}'
									}
								},
								{
									text: _('Delete'),
									id: 'delete',
									iconCls: 'x-fa fa-trash',
									itemId: 'Delete',
									hidden: SEC.hidden('05010107'),
									handler: 'onDelete',
									bind: {
										disabled: '{!performanceGrid.selection}'
									}
								},
								{
									text: _('Detail'),
									iconCls: 'x-fa fa-eye',
									itemId: 'query',
									hidden: SEC.hidden('05010108'),
									handler: 'detailedQuery',
									bind: {
										disabled: '{!performanceGrid.selection}'
									}
								},
								{
									tooltip: _('Filter'),
									iconCls: 'x-fa fa-filter',
									hidden: SEC.hidden('05010109'),
									handler: 'onFilter'

								},

								{
									text: _('Refresh'),
									iconCls: 'x-fa fa-refresh',
									handler: 'onRefresh'
								},
							]
						}],
					listeners: {
						itemdblclick: 'onItemDoubleClick',
						activate: 'onActive',
					},
				}],
		},

		{
			xtype: 'taskAdd',
		},
		{
			xtype: 'taskUpd',
		},
		{
			xtype: 'detailedQueryform',
		},

		{
			xtype: 'treeForm',
		},
		{
			xtype: 'updTreeForm',
		},

		{
			xtype: 'template',
		},
		{
			xtype: 'updTemplate',
		},
		{
			xtype: 'singleAdd',
		},
		{
			xtype: 'singleUpd',
		},
		{
			xtype: 'singleAddTemplate',
		},
		{
			xtype: 'singleUpdTemplate',
		},
		{
			xtype: 'detailedSingleTask',
		}
	]
});
