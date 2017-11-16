Ext.define('Admin.view.performance.historyTask.view.updTemplate', {
	extend: 'Ext.form.Panel',
	xtype: 'updTemplate',
	requires: [
		'Admin.view.performance.historyTask.viewModel.updTemplateViewModel',
		'Admin.view.performance.historyTask.model.quotaTemplateModel',
		'Admin.view.performance.historyTask.model.thresholdTemplateModel',
		'Admin.view.performance.historyTask.controller.updTemplateControl',
	],
	controller: 'updTemplateControl',
	viewModel: 'updTemplateViewModel',
	reference: 'updTemplate',
	itemId: 'updTemplate',
	layout: 'card',
	cls: 'shadow',
	items: [
		{
			title: _('templateSettings'),
			xtype: 'fieldset',
			layout: 'border',
			height: 1000,
			reference: 'taskViewCard',
			items: [
				{
					title: _('quotaTemplateSettings'),
					height: 400,
					xtype: 'grid',
					region: 'north',
					reference: 'updQuotaTemplateGrid',
					itemId: 'updQuotaTemplateGrid',
					// 绑定到viewModel的属性
					bind: {
						store: '{quotaTemplateStore}',
					},
					// grid显示字段tmpl_name
					columns: [
						{ text: _('metricTmplName'), dataIndex: 'metricTmplName', width: 438 },
						{ text: _('tmplDesc'), dataIndex: 'tmplDesc', width: 500 },
						{ text: _('isDefault'), dataIndex: 'isDefault', width: 300 }
					],
				}, // grid

				{
					title: _('thresholdTemplateSettings'),
					xtype: 'grid',
					region: 'center',
					//height : 200,
					itemId: 'updThresholdGrid',
					// 绑定到viewModel的属性
					bind: {
						store: '{thresholdTemplateStore}',
					},
					selModel: {
						selType: 'checkboxmodel', // XTYPE
						mode: 'SINGLE',
						checkOnly: 'true',
						toggleOnClick: true,
						allowDeselect: true
					},
					// grid显示字段
					columns: [
						{ text: _('tcaTmplName'), dataIndex: 'tcaTmplName', width: 438 },
						{ text: _('tmplDesc'), dataIndex: 'tmplDesc', width: 438 },
						//{ text :_('metricTmplId'), dataIndex : 'metricTmplId', width : 330 }
					],
					// 自定义工具条
					dockedItems: [
						{
							xtype: 'pagingtoolbar',
							//dock: 'top',
							dock: 'bottom',
							itemId: 'updThresholdToobar',
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
											{ val: 25 },
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
							dock: 'top',//工具条位置
							items: [
								'->',
								{
									text: _('filterTemplate'),
									width: 100,
									iconCls: 'x-fa fa-filter',
									handler: 'onFilterThresholdTemp'
								},

								{
									tooltip: _('Refresh'),
									width: 50,
									iconCls: 'x-fa fa-refresh',
									handler: 'onRefreshThresholdTemp'
								}]
						},
						{
							xtype: 'form',
							layout: 'column',
							hidden: true,
							height: 50,
							itemId: 'updThresholdTempSerchForm',
							reference: 'updThresholdTempSerchForm',
							defaultType: 'textfield',
							items: [
								{ fieldLabel: _('tcaTmplName'), xtype: 'textfield', margin: 10, name: 'tcaTmplName' },
								{ xtype: 'button', margin: 10, align: 'right', text: _('Reset'), iconCls: 'x-fa fa-undo', handler: 'onReset' },
								{ xtype: 'button', margin: 10, text: _('Query'), iconCls: 'x-fa fa-search', handler: 'onQueryThreshold' },
							],
						}
					]
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
							xtype: 'button',
							text: _('Cancel'),
							iconCls: 'x-fa fa-close',
							handler: 'onCancel',
						}]
				}
			],
		},
	]
});