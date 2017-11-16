Ext.define('Admin.view.performance.realTimeTask.view.realTimeDetail', {
	xtype: 'realTimeDetail',
	extend: 'Ext.form.Panel',
	requires: [
		'Admin.view.performance.realTimeTask.controller.realTimeDetail',
		'Admin.view.performance.realTimeTask.view.resourcesTree',
		'Admin.view.performance.realTimeTask.view.metricTree',
		'Admin.view.performance.realTimeTask.view.deviceTree',
	],
	controller: 'realTimeDetail',
	itemId: 'realTimeDetail',
	items: [
		{
			xtype: 'container',
			layout: 'border',
			margin: 3,
			height: 600,
			items: [
				{
					xtype: 'form',
					region: 'north',
					itemId: 'realTask',
					layout: 'anchor',
					defaults: {
						anchor: '100%'
					},
					items: [
						{
							xtype: 'fieldset',
							title: _('taskInformation'),
							defaultType: 'displayfield',
							layout: 'column',
							items: [
								{
									fieldLabel: _('protocolType'),
									columnWidth: 0.2,
									xtype: 'displayfield',
									name: 'protocolType',
									labelAlign: "right",
								},

								{
									xtype: 'displayfield',
									fieldLabel: _('createUser'),
									name: 'createUser',
									columnWidth: 0.2,
									labelAlign: "right",
									hidden: true
								},

								{
									xtype: 'displayfield',
									fieldLabel: _('collectPeriod'),
									name: 'collectPeriod',
									columnWidth: 0.2,
									renderer: function (val) {
										if (val <= 60) return val + _('Seconds');
										if (60 < val < 60 * 60) return val / 60 + _('Minutes');
										if (60 * 60 <= val < 60 * 60 * 24) return val / 60 / 60 + _('Hours');
										if (val >= 60 * 60 * 24) return val / 60 / 60 / 24 + _('Days')
									},

									labelAlign: "right",
									itemId: 'collectPeriod',
								},
								{
									xtype: 'displayfield',
									fieldLabel: _('collectType'),
									columnWidth: 0.2,
									renderer: function (val) { if (val == 1) return _("initiative"); if (val == 2) return _("passive"); },
									name: 'collectType'
								},

							]
						},//任务信息

						//采集时长form
						{
							xtype: 'fieldset',
							title: _('collect config'),
							layout: 'anchor',
							defaults: {
								anchor: '100%'
							},
							items: [
								{
									xtype: 'container',
									layout: 'column',
									reference: 'collectForm',
									itemId: 'addTime',
									items: [
										{
											xtype: 'fieldcontainer',
											//fieldLabel :_('collect config'),
											defaultType: 'radiofield',
											columnWidth: 0.3,
											//margin:3,
											defaults: {
												flex: 1
											},
											layout: 'hbox',
											items: [
												{
													xtype: 'radiogroup',
													reference: 'radio',
													itemId: 'realTimeRadiogroup',
													layout: {
														autoFlex: false
													},
													defaults: {
														name: 'ccType',
													},
													items: [
														{
															itemId: 'realTimecontinu',
															fieldLabel: _('continuousCollection'),
															inputValue: 0,
															name: 'custom',
															labelAlign: "right",

														},
														{
															boxLabel: _('customCollection'),
															checked: true,
															itemId: 'realTimecustom',
															name: 'custom',
															inputValue: 1,
															labelAlign: "right",
															hideEmptyLabel: false

														}
													]
												},
											],
										},
										{
											xtype: 'displayfield',
											fieldLabel: _('endTime'),
											name: 'endTime',
											columnWidth: 0.25,
											labelAlign: "right",
											editable: false,
											itemId: 'realEndTime',
											margin: 5,
										},
									],
								}
							]
						},
					]
				},
				{
					xtype: 'deviceTree',
					//height: 430,
					itemId: 'deviceTreeDetail',
					frame: true,
					width: 433,
					region: 'west',
					title: _('Device'),
				},
				{
					xtype: 'resourcesTree',
					itemId: 'resourcesTreeDetail',
					//height: 430,
					frame: true,
					//width:250,
					region: 'center',
					title: _('Resources'),
				},
				{
					xtype: 'metricTree',
					itemId: 'metricTreeDetail',
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
							text: _('Cancel'),
							iconCls: 'x-fa fa-close',
							handler: 'onCancel',
						}],
				}]
		},
	]
})