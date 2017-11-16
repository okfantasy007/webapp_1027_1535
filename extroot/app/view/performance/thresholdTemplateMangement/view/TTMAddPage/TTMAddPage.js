Ext.define('Admin.view.performance.thresholdTemplateMangement.view.TTMAddPage.TTMAddPage', {
	extend: 'Admin.view.base.CardForm',
	requires: [
		'Ext.grid.filters.Filters',
		'Admin.view.performance.thresholdTemplateMangement.controller.TTMAddPage.TTMAddPage',
		'Admin.view.performance.thresholdTemplateMangement.model.TTMAddPage.TTMAddPage',
		'Admin.view.performance.thresholdTemplateMangement.viewModel.TTMAddPage.TTMAddPage',
		'Admin.view.performance.thresholdTemplateMangement.model.TTMAddPage.thresholdSymbolModel',
	],
	xtype: 'TTMAddPage',
	viewModel: 'TTMAddPage',
	itemId: 'TTMAddPage',
	controller: 'TTMAddPage',

	// 指定布局
	layout: 'card',

	// 指定panel边缘的阴影效果
	cls: 'shadow',

	// margin: 10,
	fieldDefaults: {
		labelWidth: 140
	},
	items: [{
		xtype: 'form',
		itemId: 'addPageGrid',
		title: _('Template Add Page'),
		margin: 10,
		items: [{
			xtype: 'form',
			itemId: 'basicInfoGrid',
			margin: 2,
			layout: 'column',
			title: _('Basic information'),
			defaultType: 'textfield',
			items: [{
				xtype: 'textfield',
				fieldLabel: _('Template name'),
				margin: 10,
				columnWidth: 0.35,
				name: 'tcaTmplName'
			},
			{
				xtype: 'textfield',
				margin: 10,
				columnWidth: 0.35,
				itemId: 'belongToTemplate',
				fieldLabel: _('Affiliated Group'),
				value: _('Please select a template from the list on the left'),
				readOnly: true,
				name: 'belongToTemplate'
			},
			{
				xtype: 'textfield',
				margin: 10,
				columnWidth: 0.70,
				columnHeight: 2,
				fieldLabel: _('tmplDesc'),
				name: 'tmplDesc'
			},
			{
				xtype: 'textfield',
				itemId: 'tmplId',
				name: 'tmplId',
				hidden: true
			},
			]

		},

		//所属指标组的信息
		{
			xtype: 'panel',
			//layout: 'border',
			layout: 'column',
			itemId: 'templateInfo',
			//height: 600,
			items: [{
				xtype: 'grid',
				//region: 'west',
				columnWidth: 0.36,
				margin: 2,
				height: 470,
				reference: 'symbolInfo',
				itemId: 'editPageGrid',
				title: _('Metric group information'),
				plugins: [{
					ptype: 'gridfilters'
				},],
				//grid的每一列的具体定义
				columns: [{
					text: _('Serial number'),
					xtype: 'rownumberer',
					width: 50,
					align: 'center',
					sortable: false
				},
				{
					dataIndex: 'metricTmplId',
					width: 330,
					hidden: true
				},
				{
					text: _('Template name'),
					dataIndex: 'metricTmplName',
					sortable: true,
					width: 150,
					layout: 'hbox',
					filter: {},
					sorter: {
						sorterFn: 'nameSorter'
					},
					editor: {
						xtype: 'textfield'
					},
					items: {
						xtype: 'textfield',
						reference: 'nameFilterField',
						flex: 1,
						margin: 2,
						enableKeyEvents: true,
						listeners: {
							keyup: 'onNameFilterKeyup',
							buffer: 500
						}
					}
				},
				{
					text: _('tmplDesc'),
					dataIndex: 'tmplDesc',
					width: 200
				},
				],
				bind: {
					store: '{allTemplate}',
				},
				listeners: {
					rowclick: 'onRowclick',
					beforerender: 'beforeshow',
				}
			},
			{
				xtype: 'grid',
				//region: 'center',
				columnWidth: 0.64,
				margin: 2,
				height: 470,
				itemId: 'thresholdSymbol',
				title: _('Metric threshold information'),
				plugins: [{
					ptype: 'cellediting',
					clicksToEdit: 1
				}],
				requires: ['Ext.grid.feature.Grouping'],
				features: [{
					ftype: 'grouping',
					groupHeaderTpl: '{[values.children[0].data["metricGroupName"]]}',
					collapsible: true,
					expandTip: '',
					collapseTip: ''
				}],
				columns: [{
					text: _('Metric group name'),
					dataIndex: 'metricGroupName',
					hidden: true,
					headerCheckbox: true,
					width: 180
				},
				{
					text: _('Template name'),
					dataIndex: 'metricName',
					headerCheckbox: false,
					width: 180
				},
				{
					dataIndex: 'metricId',
					hidden: true,
				},
				{
					text: _('H_urgent'),
					dataIndex: 'high1Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('H_severe'),
					dataIndex: 'high2Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('H_general'),
					dataIndex: 'high3Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('H_prompt'),
					dataIndex: 'high4Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('L_prompt'),
					dataIndex: 'low4Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('L_general'),
					dataIndex: 'low3Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('L_severe'),
					dataIndex: 'low2Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},
				{
					text: _('L_urgent'),
					dataIndex: 'low1Threshold',
					width: 180,
					flex: 1,
					editor: {
						completeOnEnter: true,
						field: {
							xtype: 'numberfield',
						}
					}
				},

				],
				bind: {
					store: '{thresholdSymbol}',
				},

			},


			]
		},
		]
	}],

	buttons: [{
		text: _('Reset'),
		iconCls: 'x-fa fa-undo',
		handler: 'onReset',
	},
	{
		text: _('Cancel'),
		iconCls: 'x-fa fa-close',
		handler: 'onCancel',
	},
	{
		text: _('Save'),
		iconCls: 'x-fa fa-save',
		handler: 'onSubmit',
	}
	],
	listeners: {

		beforeshow: 'beforeshow',
	}
});