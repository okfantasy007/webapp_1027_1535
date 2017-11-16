Ext.define('Admin.view.performance.historyTaskDisplay.view.historyChart1', {
	xtype: 'historyChart1',
	extend: 'Ext.panel.Panel',
	requires: [
		'Admin.view.performance.historyTaskDisplay.controller.historyChart1',
		'Admin.view.performance.historyTaskDisplay.model.chartStoreModel',
		'Admin.view.performance.historyTaskDisplay.viewModel.chartStoreViewModel',
	],
	viewModel: 'chartStoreViewModel',
	controller: 'historyChart1',
	items: [
		{
			xtype: 'panel',
			itemId: 'chart1View',
			layout: {
				type: 'vbox'
			},
			items: [
				{
					xtype: 'cartesian',
					reference: 'chart1',
					itemId: 'chart1',
					height: 340,
					width: 640,
					iconCls: 'pictos pictos-chart2',
					//margin:2,
					frame: true,
					Interval: 10,
					IntervalOffset: 5,
					bind: {
						store: '{chartStore}',
					},
					interactions: [
						{
							type: 'panzoom',
							enabled: false,
							zoomOnPanGesture: false,
							axes: {
								left: {
									allowPan: true,
									allowZoom: true
								},
								bottom: {
									allowPan: true,
									allowZoom: true
								}
							}
						},
						{
							type: 'crosshair',
							axes: {
								label: {
									fillStyle: 'white'
								},
								rect: {
									fillStyle: '#344459',
									opacity: 0.7,
									radius: 5
								}
							}
						},

					],
					insetPadding: 20,
					axes: [
						{
							type: 'numeric',
							// fields: ['data1', 'data2', 'data3', 'data4', 'data5' ],
							position: 'left',
							grid: true,
							title: '%',
							minimum: 5,
							renderer: 'onAxisLabelRender',
							listeners: {
								rangechange: 'onAxisRangeChange'
							}
						},
						{
							type: 'numeric',
							//fields:'xValue',
							position: 'bottom',
							visibleRange: [0, 1],
							grid: true,
							MarkerSize: 5,
							//renderer: 'onAxisLabelRender',
							label: {
								rotate: {
									degrees: -45
								},
							},
						}
					],
					series: [
						{
							type: 'line',
							xField: '',
							yField: '',
							marker: {
								type: 'circle',
								radius: 2,
								fx: {
									duration: 200,
									easing: 'backOut'
								}
							},
							highlightCfg: {
								scaling: 0.2
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin1'
							}
						},
						{
							type: 'line',
							// title: 'Firefox',
							xField: 'month',
							yField: 'data2',
							marker: {
								type: 'circle',
								radius: 2,
								fx: {
									duration: 200,
									easing: 'backOut'
								}
							},
							highlightCfg: {
								scaling: 0.2
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin2'
							}
						},
						{
							type: 'line',
							title: 'Chrome',
							xField: 'month',
							yField: 'data3',
							marker: {
								type: 'circle',
								radius: 2,
								fx: {
									duration: 200,
									easing: 'backOut'
								}
							},
							highlightCfg: {
								scaling: 0.2
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin3'
							}
						},
						{
							type: 'line',
							title: 'Safari',
							xField: 'month',
							yField: 'data4',
							marker: {
								type: 'circle',
								radius: 2,
								fx: {
									duration: 200,
									easing: 'backOut'
								}
							},
							highlightCfg: {
								scaling: 0.2
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin4'
							}
						},
						{
							type: 'line',
							title: 'Safari5',
							xField: 'month',
							yField: 'data5',
							marker: {
								type: 'circle',
								radius: 2,
								fx: {
									duration: 200,
									easing: 'backOut'
								}
							},
							highlightCfg: {
								scaling: 0.2
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin5'
							}
						},
						{
							type: 'line',
							title: _('L_1_threshold'),
							xField: '',
							yField: '',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin6'
							}
						},
						{
							type: 'line',
							title: _('L_2_threshold'),
							xField: 'xValue',
							yField: 'e2',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineWidth: 1,
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin7'
							}
						},
						{
							type: 'line',
							title: _('L_3_threshold'),
							xField: 'xValue',
							yField: 'e3',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineWidth: 1,
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin8'
							}
						},
						{
							type: 'line',
							title: _('L_4_threshold'),
							xField: 'xValue',
							yField: 'e4',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineWidth: 1,
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin9'
							}
						},
						{
							type: 'line',
							title: _('H_1_threshold'),
							xField: 'xValue',
							yField: 'e5',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin10'
							}
						},
						{
							type: 'line',
							title: _('H_2_threshold'),
							xField: 'xValue',
							yField: 'e6',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineWidth: 1,
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin11'
							}
						},
						{
							type: 'line',
							title: _('H_3_threshold'),
							xField: 'xValue',
							yField: 'e7',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineWidth: 1,
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin12'
							}
						},
						{
							type: 'line',
							title: _('H_4_threshold'),
							xField: 'xValue',
							yField: 'e8',
							highlightCfg: {
								scaling: 0.2
							},
							style: {
								lineWidth: 1,
								lineDash: [10, 10]
							},
							tooltip: {
								trackMouse: true,
								renderer: 'onlin13'
							}
						},
					],
					tools: [
						{
							xtype: 'toolbar',
							reference: 'toolbar1',
							hight: 5,
							items: [
								{
									iconCls: 'x-fa fa-warning',
									handler: 'onThreshold'
								},
								{
									iconCls: 'x-fa panZoomReset',
									handler: 'onPanZoomReset1'
								},
								{
									xtype: 'segmentedbutton',
									width: 150,
									defaults: {
										ui: 'default-toolbar'
									},
									items: [
										{
											iconCls: 'x-fa pan',
											pressed: true
										},
										{
											iconCls: 'x-fa leverLine'
										},
										{
											iconCls: 'x-fa taskZoom'
										}
									],
									listeners: {
										toggle: 'onModeToggle1'
									}
								},
								{
									//text: 'Save Chart',
									iconCls: 'x-fa fa-download',
									handler: 'export'
								},
							]
						}
					],
				},
				{
					//性能任务表
					xtype: 'grid',
					itemId: 'hisGrid1',
					reference: 'hisGrid1',
					collapsible: true,//可折叠表格
					collapsed:  true,//默认折叠状态
					frame: true,
					height: 300,
					width: 640,
					bind: {
						store: '{chartStore}',
					},
					// grid显示字段
					columns: [
						{ text: _('time'), dataIndex: 'month', width: 106 },
						{ text: _('10001'), dataIndex: '10001', width: 106 },
						{ text: _('xValue'), dataIndex: 'xValue', width: 106 },
						{ text: _('data3'), dataIndex: 'data3', width: 106 },
						{ text: _('data4'), dataIndex: 'data4', width: 106 },
						{ text: _('data5'), dataIndex: 'data5', width: 110 },
					],
					dockedItems: [
						{
							xtype: 'pagingtoolbar',
							dock: 'bottom',
							itemId: 'pagingtoolbar',
							inputItemWidth: 60,
							displayInfo: true,
							displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
							items: [
								'-',
								{
									fieldLabel: _('Page Size'),
									xtype: 'combobox',
									width: 145,
									padding: '0 0 0 5',
									displayField: 'val',
									valueField: 'val',
									multiSelect: false,
									editable: false,
									labelWidth: 60,
									store: Ext.create('Ext.data.Store', {
										fields: [{ name: 'val', type: 'int' }],
										data: [
											{ val: 50 },
											{ val: 100 },
											{ val: 150 },
										]
									}),
									value: 50,
									listeners: {
										change: function (me, newValue, oldValue, ops) {
											var grid = this.up('grid');
											Ext.apply(grid.store, { pageSize: newValue });
											var chart = this.up().up().up().down('#chart1');
											Ext.apply(chart.store, { pageSize: newValue });
											this.up('pagingtoolbar').moveFirst();

										}
									}
								}]
						},
						/* {
							 xtype: 'toolbar',
							 dock: 'top',
							 items: [
								 '->',
								 {
								 xtype: 'combo',
								 itemId: 'exportType',
								 width: 105,
								 editable: false,
								 triggerCls: 'x-fa   fa-copy ',
								 name: 'exportTypeName',
								 queryMosde: 'local',
								 store: {
										xtype: 'store',
										fields: ['exportTypeId', 'exportTypeName'],
									 data: [
											 {exportTypeName:_("All"), exportTypeId: 0 },
											 {exportTypeName:_("current page"), exportTypeId:1 },
										   ]
								   },
								 emptyText: _('exportList'),
								 displayField: 'exportTypeName',
								 valueField: 'exportTypeId',
								 // value: -1,
								 listeners: {
									 'select': 'onDataExport'
								 }
							 }
							 ]
						 }*/
					],
					tools: [
						{
							iconCls: 'topo_export_menu_icon',
							handler: 'onDataExport'
						}
					]
				},
			]
		}
	],


});