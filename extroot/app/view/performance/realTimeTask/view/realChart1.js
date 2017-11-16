Ext.define('Admin.view.performance.realTimeTask.view.realChart1', {
	xtype: 'realChart1',
	extend: 'Ext.panel.Panel',
	requires: [
		'Admin.view.performance.realTimeTask.controller.realChart1',
		'Ext.grid.plugin.Exporter',
		'Ext.exporter.text.CSV',
	],
	controller: 'realChart1',
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
					reference: 'realChart1',
					itemId: 'realChart1',
					frame: true,
					insetPadding: '40 40 20 20',
					height: 340,
					//resoure:"sds",
					width: 640,
					iconCls: 'pictos pictos-chart2',
					store: Ext.create('Ext.data.JsonStore', {}),
					axes: [{
						type: 'numeric',
						minimum: 0,
						// maximum: 100,
						grid: true,
						position: 'left',
					}, {
						type: 'time',
						dateFormat: 'G:i:s',
						segmenter: {
							type: 'time',
							step: {
								unit: Ext.Date.SECOND,
								step: 20//每各5秒一个x轴格
							}
						},
						label: {
							fontSize: 10
						},
						grid: true,
						position: 'bottom',
						// title: 'Seconds',
						fields: ['time'],
						majorTickSteps: 750,
						minorTickSteps: 5
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
					],
				},
				{
					//性能任务表
					xtype: 'gridpanel',
					itemId: 'displayGrid1',
					reference: 'displayGrid1',
					collapsible: true,//可折叠表格
					collapsed:  true,//默认折叠状态
					frame: true,
					height: 300,
					width: 640,
					store: Ext.create('Ext.data.JsonStore', {}),
					// grid显示字段
					listeners: {
						documentsave: 'onDocumentSave',
						beforedocumentsave: 'onBeforeDocumentSave'
					},
					plugins: 'gridexporter',
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
	],
});