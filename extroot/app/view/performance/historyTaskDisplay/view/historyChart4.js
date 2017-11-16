Ext.define('Admin.view.performance.historyTaskDisplay.view.historyChart4', {
	xtype: 'historyChart4',
	extend: 'Ext.panel.Panel',
	requires: [
		'Admin.view.performance.historyTaskDisplay.controller.historyChart4',
		'Admin.view.performance.historyTaskDisplay.model.chartStoreModel',
		'Admin.view.performance.historyTaskDisplay.viewModel.chartStoreViewModel',
	],
	viewModel: 'chartStoreViewModel',
	controller: 'historyChart4',
	items: [
		{
			xtype: 'panel',
			itemId: 'chart4View',
			layout: {
				type: 'vbox'
			},
			items: [
				{
					xtype: 'cartesian',
					reference: 'chart4',
					itemId: 'chart4',
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
						}
					],
					insetPadding: 20,
					axes: [{
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
					}, {
						type: 'numeric',
						position: 'bottom',
						// visibleRange:[0,1],
						grid: true,
						MarkerSize: 5,
						label: {
							rotate: {
								degrees: -45
							},
						},
					}],
					series: [
						{
							type: 'line',
							//title: 'IE',
							xField: 'time',
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
							xField: 'time',
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
							xField: 'time',
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
							xField: 'time',
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
							xField: 'time',
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
							hight: 10,
							items: [
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
											//text: 'Pan'
											iconCls: 'x-fa leverLine'
										},
										{
											// text: 'Zoom'
											iconCls: 'x-fa taskZoom'
										}
									],
									listeners: {
										toggle: 'onModeToggle1'
									}
								},
								{
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
					itemId: 'hisGrid4',
					reference: 'hisGrid4',
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
						{ text: _('time'), dataIndex: 'time', width: 106 },
						{ text: _('data1'), dataIndex: 'data1', width: 106 },
						{ text: _('data2'), dataIndex: 'data2', width: 106 },
						{ text: _('data3'), dataIndex: 'data3', width: 106 },
						{ text: _('data4'), dataIndex: 'data4', width: 106 },
						{ text: _('data5'), dataIndex: 'data5', width: 110 },
					],
					dockedItems: [
						{
							xtype: 'pagingtoolbar',
							dock: 'bottom',

							itemId: 'pagingtoolbar',
							inputItemWidth: 80,
							displayInfo: true,
							displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
							// emptyMsg: _("Empty"),
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
											var chart = this.up().up().up().down('#chart4');
											Ext.apply(chart.store, { pageSize: newValue });
											this.up('pagingtoolbar').moveFirst();
										}
									}
								}]
						},
					],
					tools: [
						{
							iconCls: 'topo_export_menu_icon',
							handler: 'onDataExport'
						}
					]
				},
			]
		}]
});