Ext.define('Admin.view.performance.historyTask.view.detailedSingleTask', {
	extend: 'Ext.form.Panel',
	xtype: 'detailedSingleTask',

	requires: [
		'Admin.view.performance.historyTask.controller.detailControl',
		'Admin.view.performance.historyTask.view.detailSingleResouTree',
		'Admin.view.performance.historyTask.view.detailequipTree',
	],

	controller: 'detailControl',
	reference: 'detailedSingleTask',
	itemId: 'detailedSingleTask',
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
									fieldLabel: _('collectType'),
									margin: 10,
									renderer: function (val) { if (val == 1) return _("initiative"); if (val == 2) return _("passive"); },
									name: 'collectType'
								},
							]
						},

						{
							xtype: 'container',
							layout: 'vbox',
							defaultType: 'textfield',
							// margin: '0 0 5 0',
							items: [
								{
									xtype: 'displayfield',
									fieldLabel: _('collectPeriod'),
									renderer: function (val) {
										if (val <= 60) return val + _('Seconds');
										if (60 < val < 60 * 60) return val / 60 + _('Minutes');
										if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
										if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
									},
									margin: 10,
									//labelWidth:120,
									name: 'collectPeriod'
								},
								{
									xtype: 'displayfield',
									fieldLabel: _('protocolType'),
									margin: 10,
									name: 'protocolType'
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
									renderer: function (val) {
										if (val <= 60) return val + _('Seconds');
										if (60 < val < 60 * 60) return val / 60 + _('Minutes');
										if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
										if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
									},
									margin: 10,
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
									fieldLabel: _('taskType'),
									margin: 10,
									name: 'taskType',
									renderer: function (val) { if (val == 2) return _("generalHistoricalTasks"); if (val == 3) return _("smallHistoricalTasks"); }
								},
								{
									xtype: 'displayfield',
									fieldLabel: _('endTime'),
									margin: 10,
									labelWidth: 120,
									name: 'endTime'
								},
							]
						},
					]
				}]
		},//taskInformation
		{
			xtype: 'panel',
			margin: 10,
			itemId: 'equipment',
			defaults: {
				anchor: '100%'
			},
			items: [
				{
					xtype: 'container',
					layout: 'column',
					items: [
						{

							xtype: 'detailequipTree',
							itemId: 'detailequipTree',
							columnWidth: .50,
							title: _('Device'),
						},
						{
							xtype: 'detailSingleResouTree',
							//height: 430,
							itemId: 'detailSingleResouTree',
							//frame:true,
							columnWidth: .50,
							title: _('Resources'),
						},

					]
				},
			],
		},
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
							fieldLabel: _('quotaTemplate'),
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