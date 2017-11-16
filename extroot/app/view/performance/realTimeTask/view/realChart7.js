Ext.define('Admin.view.performance.realTimeTask.view.realChart7', {
	xtype: 'realChart7',
	extend: 'Ext.panel.Panel',
	requires: [
		'Admin.view.performance.realTimeTask.controller.realChart7',
		'Ext.grid.plugin.Exporter',
		'Ext.exporter.text.CSV',
	],
	controller: 'realChart7',
	items: [
		{
			xtype: 'panel',
			itemId: 'chart7View',
			layout: {
				type: 'vbox'
			},
			items: [
				{
					xtype: 'cartesian',
					reference: 'realChart7',
					itemId: 'realChart7',
					frame: true,
					insetPadding: '40 40 20 20',
					height: 340,
					width: 640,
					iconCls: 'pictos pictos-chart2',
					store: Ext.create('Ext.data.JsonStore', {
					}),
					axes: [{
						type: 'numeric',
						minimum: 0,
						maximum: 100,
						grid: true,
						position: 'left',
					}, {
						type: 'time',
						dateFormat: 'G:i:s',
						segmenter: {
							type: 'time',
							step: {
								unit: Ext.Date.SECOND,
								step: 5//每各1秒一个x轴文本显示
							}
						},
						label: {
							fontSize: 10
						},
						grid: true,
						position: 'bottom',
						// title: 'Seconds',
						fields: ['time'],
						majorTickSteps: 250//
					}],
					series: [{
						type: 'line',
						title: 'Metric 1',
						marker: {
							type: 'circle',
							radius: 2,
						},
						style: {
							miterLimit: 0
						},
						tooltip: {
							trackMouse: true,
							renderer: 'onlin1'
						},
						xField: 'time',
						yField: 'y1'
					}, {
						type: 'line',
						title: 'Metric 2',
						marker: {
							type: 'circle',
							radius: 2,
						},
						style: {
							miterLimit: 0
						},
						tooltip: {
							trackMouse: true,
							renderer: 'onlin2'
						},
						xField: 'time',
						yField: 'y2'
					},
					{
						type: 'line',
						title: 'Metric 3',
						marker: {
							type: 'circle',
							radius: 2,
						},
						style: {
							miterLimit: 0
						},
						tooltip: {
							trackMouse: true,
							renderer: 'onlin3'
						},
						xField: 'time',
						yField: 'y3'
					},
					{
						type: 'line',
						title: 'Metric 4',
						marker: {
							type: 'circle',
							radius: 2,
						},
						style: {
							miterLimit: 0
						},
						tooltip: {
							trackMouse: true,
							renderer: 'onlin4'
						},
						xField: 'time',
						yField: 'y4'
					},
					{
						type: 'line',
						title: 'Metric 5',
						marker: {
							type: 'circle',
							radius: 2,
						},
						style: {
							miterLimit: 0
						},
						tooltip: {
							trackMouse: true,
							renderer: 'onlin5'
						},
						xField: 'time',
						yField: 'y5'
					}
					],
					tools: [
						{
							//text: 'Save Chart',
							iconCls: 'x-fa fa-download',
							handler: 'export'
						}
					]
				},
				{
					//性能任务表
					xtype: 'gridpanel',
					itemId: 'displayGrid7',
					reference: 'displayGrid7',
					collapsible: true,//可折叠表格
					collapsed:  true,//默认折叠状态
					frame: true,
					height: 300,
					width: 640,
					store: Ext.create('Ext.data.JsonStore', {}),
					listeners: {
						documentsave: 'onDocumentSave',
						beforedocumentsave: 'onBeforeDocumentSave'
					},
					plugins: 'gridexporter',
					// grid显示字段
					columns: [
						{ text: _('time'), dataIndex: 'time', width: 106 },
						{ text: _('y1'), dataIndex: 'y1', width: 106 },
						{ text: _('y2'), dataIndex: 'y2', width: 106 },
						{ text: _('y3'), dataIndex: 'y3', width: 106 },
						{ text: _('y4'), dataIndex: 'y4', width: 106 },
						{ text: _('y5'), dataIndex: 'y5', width: 110 },
					],
					tools: [
						{
							iconCls: 'topo_export_menu_icon',
							handler: 'exportToCSV'
						}
					]
				},
			],
		}
	]
});