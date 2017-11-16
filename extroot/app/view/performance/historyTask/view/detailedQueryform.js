Ext.define('Admin.view.performance.historyTask.view.detailedQueryform', {
	extend: 'Ext.form.Panel',
	xtype: 'detailedQueryform',

	requires: [
		'Admin.view.performance.historyTask.controller.detailControl',
		'Admin.view.performance.historyTask.viewModel.detailedViewModel',
	],

	controller: 'detailControl',
	viewModel: 'detailedViewModel',
	reference: 'detailedQueryform',
	itemId: 'detail',
	title: _('taskDetails'),
	fieldDefaults: {
		labelAlign: 'right',
		labelWidth: 80,
		msgTarget: 'side'
	},

	items: [
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
							labelWidth: 60,
							items: [
								{
									xtype: 'displayfield',
									fieldLabel: _('taskName'),
									margin: 10,
									name: 'taskName'
								},

								{
									xtype: 'displayfield',
									fieldLabel: _('taskType'),
									margin: 10,
									renderer: function (val) { if (val == 2) return _("generalHistoricalTasks"); if (val == 3) return _("smallHistoricalTasks"); },
									name: 'taskType'
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
									xtype: 'displayfield',
									fieldLabel: _('collectPeriod'),
									margin: 10,
									renderer: function (val) {
										if (val <= 60) return val + _('Seconds');
										if (60 < val < 60 * 60) return val / 60 + _('Minutes');
										if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
										if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
									},
									name: 'collectPeriod'
								},

								{
									xtype: 'displayfield',
									fieldLabel: _('endTime'),
									margin: 10,
									labelWidth: 100,
									name: 'endTime'
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
									xtype: 'displayfield',
									fieldLabel: _('taskStatus'),
									margin: 10,
									renderer: function (val) {
										if (val == 1) return _("Not running"); if (val == 2) return _("Running"); if (val == 3) return _("Hang");
										if (val == 4) return _("completed"); if (val == 5) return _("failed");
									},
									name: 'taskStatus'
								},

								{
									xtype: 'displayfield',
									fieldLabel: _('interactPeriod'),
									margin: 10,
									renderer: function (val) {
										if (val <= 60) return val + _('Seconds');
										if (60 < val < 60 * 60) return val / 60 + _('Minutes');
										if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
										if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
									},
									name: 'interactPeriod'
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
									xtype: 'displayfield',
									fieldLabel: _('collectType'),
									margin: 10,
									renderer: function (val) { if (val == 1) return _("initiative"); if (val == 2) return _("passive"); },
									name: 'collectType'
								},
								{
									xtype: 'displayfield',
									fieldLabel: _('protocolType'),
									margin: 10,
									labelWidth: 120,
									name: 'protocolType'
								},
							]
						},
					]
				}]
		},//taskInformation

		{
			xtype: 'grid',
			title: _('resourceSettings'),
			reference: 'resourceGrid',
			itemId: 'resourceGrid',
			height: 300,
			defaults: {
				anchor: '100%'
			},
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

		},//resourceGrid

		{
			xtype: 'fieldset',
			title: _('templateSettings'),
			margin: 10,
			defaultType: 'textfield',
			defaults: {
				anchor: '100%'
			},
			items: [
				{
					xtype: 'container',
					layout: 'hbox',
					defaultType: 'textfield',
					// margin: '0 0 5 0',
					// labelWidth: 60,
					items: [
						{
							xtype: 'displayfield',
							fieldLabel: _('metricTemplate'),
							name: 'metricTmplName',
							margin: 10,
						},
						{
							xtype: 'displayfield',
							fieldLabel: _('thresholdTemplate'),
							name: 'tcaTmplName',
							margin: 10,
						},
					]
				},
			],
		}//模板
	],
	buttons: [
		{
			text: _('Cancel'),
			iconCls: 'x-fa fa-close',
			handler: 'onCancel',
		}],
})