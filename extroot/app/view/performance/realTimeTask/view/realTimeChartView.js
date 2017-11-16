Ext.define('Admin.view.performance.realTimeTask.view.realTimeChartView', {
	extend: 'Ext.panel.Panel',
	xtype: 'realTimeChartView',
	requires: [
		'Admin.view.performance.realTimeTask.controller.realTimeChartControl',
		'Admin.view.performance.realTimeTask.view.realChart1',
		'Admin.view.performance.realTimeTask.view.realChart2',
		'Admin.view.performance.realTimeTask.view.realChart3',
		'Admin.view.performance.realTimeTask.view.realChart4',
		'Admin.view.performance.realTimeTask.view.realChart5',
		'Admin.view.performance.realTimeTask.view.realChart6',
		'Admin.view.performance.realTimeTask.view.realChart7',
		'Admin.view.performance.realTimeTask.view.realChart8',
		'Admin.view.performance.realTimeTask.view.realChart9',
		'Admin.view.performance.realTimeTask.view.realChart10',


	],
	// viewModel: 'displayStoreViewModel',
	controller: 'realTimeChartControl',
	itemId: 'realTimeChartView',
	bodyPadding: "3 20 3 3",
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
			xtype: 'form',
			reference: 'resourceForm',
			itemId: 'resourceForm',
			height: 150,
			bodyPadding: 5,
			border: false,
			hidden: true,
			fieldDefaults: {
				labelAlign: 'right',
				labelWidth: 100,
				msgTarget: 'side'
			},
			items: [
				{
					xtype: 'textfield',
					fieldLabel: _('resourceNames'),
					margin: 15,
					hidden: true,
					name: 'resourceNames'
				},
				{
					xtype: 'textfield',
					fieldLabel: _('resourceIds'),
					margin: 15,
					hidden: true,
					name: 'resourceIds'
				},
				{
					xtype: 'textfield',
					fieldLabel: _('metricIds'),
					margin: 15,
					hidden: true,
					name: 'metricIds'
				},
				{
					xtype: 'textfield',
					fieldLabel: _('taskId'),
					margin: 15,
					hidden: true,
					name: 'taskId'
				},
			]
		},
		{
			xtype: 'realChart1',
		},
		{
			xtype: 'realChart2',
		},
		{
			xtype: 'realChart3',
		},
		{
			xtype: 'realChart4',
		},
		{
			xtype: 'realChart5',
		},
		{
			xtype: 'realChart6',
		},
		{
			xtype: 'realChart7',
		},
		{
			xtype: 'realChart8',
		},
		{
			xtype: 'realChart9',
		},
		{
			xtype: 'realChart10',
		},
	],
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'top',
		items: [
			{
				xtype: 'container',
				layout: 'column',
				defaultType: 'textfield',
				margin: '0 0 5 0',
				labelWidth: 80,
				labelAlign: "right",
				items: [
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
							change: 'onColumns'
						}
					},
					{
						xtype: 'button',
						text: _('Stop'),
						margin: 10,
						iconCls: 'x-fa fa-stop',
						itemId: 'Stop',
						handler: 'onStop',
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
	listeners: {
		beforeshow: 'beforeshow',
		// activate: 'onActivate',
	},
});