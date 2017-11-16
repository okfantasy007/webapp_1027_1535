Ext.define('Admin.view.performance.thresholdTemplateMangement.view.TTMEditPage.TTMEditPage', {
	extend: 'Admin.view.base.CardForm',
	requires: [
		'Ext.grid.filters.Filters',
		'Admin.view.performance.thresholdTemplateMangement.controller.TTMEditPage.TTMEditPage',
		'Admin.view.performance.thresholdTemplateMangement.model.TTMEditPage.TTMEditPage',
		'Admin.view.performance.thresholdTemplateMangement.viewModel.TTMEditPage.TTMEditPage',
	],
	xtype: 'TTMEditPage',
	viewModel: 'TTMEditPage',
	itemId: 'TTMEditPage',
	controller: 'TTMEditPage',

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
		itemId: 'editPageGrid',
		title: _('Modify threshold Template'),
		margin: 10,
		items: [{
				xtype: 'form',
				itemId: 'basicInfoGrid',
				layout: 'column',
				margin: 10,
				title: _('Basic information'),
				defaultType: 'textfield',
				items: [{
						name: 'tcaTmplId',
						hidden: true,
					},
					{
						name: 'metricTmplId',
						hidden: true,
					},
					{
						xtype: 'textfield',
						fieldLabel: _('Template name'),
						margin: 10,
						columnWidth: 0.35,
						name: 'tcaTmplName'
					},
					{
						xtype: 'textfield',
						margin: 10,
						columnWidth: 0.65,
						fieldLabel: _('Affiliated Group'),
						readOnly: true,
						name: 'metricTmplName'
					},
					{
						xtype: 'textfield',
						margin: 10,
						columnWidth: 1,
						fieldLabel: _('tmplDesc'),
						name: 'tmplDesc'
					},

				]

			},

			//所属指标组的信息
			{
				xtype: 'panel',
				layout: 'column',
				itemId: 'templateInfo',
				margin: 10,
				height: 400,
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
						}, ],
						//grid的每一列的具体定义
						columns: [{
								text: _('Serial number'),
								xtype: 'rownumberer',
								width: 50,
								align: 'center',
								sortable: false
							},
							{
								dataIndex: 'tmplId',
								width: 330,
								hidden: true
							},
							{
								text: _('Metric group name'),
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
			text: _('Cancel'),
			margin: 2,
			iconCls: 'x-fa fa-close',
			handler: 'onCancel',
		},
		{
			text: _('Save'),
			margin: 2,
			iconCls: 'x-fa fa-save',
			handler: 'onSubmit',
		}
	],
	listeners: {
		beforeshow: 'beforeshow',

	}


});