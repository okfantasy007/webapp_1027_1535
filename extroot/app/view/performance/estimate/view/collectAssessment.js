Ext.define('Admin.view.performance.estimate.view.collectAssessment', {
	xtype: 'collectAssessment',
	extend: 'Ext.container.Container',
	requires: [
		'Admin.view.performance.estimate.viewModel.collectAssessmentViewModel',
		'Admin.view.performance.estimate.model.processStoreModel',
		'Admin.view.performance.estimate.view.loadChart',
		'Admin.view.performance.estimate.model.basicStoreModel',
	],
	viewModel: 'collectAssessmentViewModel',
	itemId: 'collectAssessment',
	controller: {
		onQuery: function () {
			var form = this.getView().up().down('#processForm');
			var ip = form.form.findField("process_name").value;
			var store = this.getView().up().down('#basicGrid').getStore();
			var formParams = form.getForm().getValues();
			var params = {
				ip: ip, startTime: formParams.startTime, endTime: formParams.endTime, dd: 'sdfs'
			};
			store.proxy.url = "/pmCollect/api/estimate/findEstimate";
			store.proxy.extraParams = params;
			store.reload();

			var chartStore = this.getView().down('#serverChart').getStore();
			var pageing = this.getView().up().down('#basicPageing');
			console.info(pageing.config.items[0].value);
			console.info('ooooooo')
			var currentPage = pageing.getPageData().currentPage;
			var fromRecord = pageing.getPageData().fromRecord;
			var toRecord = pageing.getPageData().toRecord;
			if (toRecord == 0) {
				var limit = pageing.config.items[0].value
			} else {
				var limit = toRecord - fromRecord + 1;
			}
			console.info(limit);
			console.info(currentPage);
			var start = (currentPage - 1) * limit;
			var page = currentPage;
			var params = {
				start: start, page: page, limit: limit, ip: ip, startTime: formParams.startTime, endTime: formParams.endTime,
			};
			chartStore.proxy.url = "/pmCollect/api/estimate/findEstimate";
			chartStore.proxy.extraParams = params;
			chartStore.reload();
		}
	},
	items: [
		{
			xtype: 'panel',
			// height:750,
			itemId: 'tabpanel',
			items: [
				{
					xtyp: 'panel',
					// title:_('Load data'),
					items: [
						{
							xtype: 'form',
							height: 50,
							layout: 'hbox',
							defaultType: 'textfield',
							margin: '0 0 5 0',
							labelWidth: 80,
							itemId: 'processForm',
							labelAlign: "right",
							items: [
								{
									xtype: 'combo',
									fieldLabel: _('Performance monitoring process'),
									itemId: 'process_name',
									id: 'process',
									name: 'process_name',
									editable: false,
									labelAlign: "right",
									allowBlank: false,
									bind: {
										store: '{processStore}',
									},
									valueField: 'text',
									displayField: 'value',
									margin: 5,
									queryMode: 'local',
								},
								{
									xtype: 'textfield',
									fieldLabel: _('processIp'),
									itemId: 'processIp',
									name: 'processIp',
									labelAlign: "right",
									lableWidth: 20,
									hidden: true
								},
								{
									xtype: 'datetimefield',
									name: 'startTime',
									itemId: 'startTime',
									labelAlign: "right",
									fieldLabel: _('startTime'),
									id: 'startT',
									editable: false,
									value: new Date(new Date() - 2 * 24 * 60 * 60 * 1000),
									allowBlank: false,
									margin: 10,
									listeners: {
										"select": function () {
											var bd = Ext.getCmp('startT').getValue();
											var ed = Ext.getCmp('endT').getValue();
											var edd = Date.parse(ed);
											var bdd = Date.parse(bd); //Date.parse的处理很关键   
											var myDate = new Date();
											var year = myDate.getFullYear();
											var month = myDate.getMonth() + 1;
											if (month < 10) {
												month = "0" + (myDate.getMonth() + 1);
											}
											var day = myDate.getDate();
											if (day < 10) {
												day = "0" + myDate.getDate();
											}
											var hours = myDate.getHours();
											if (hours < 10) {
												hours = "0" + myDate.getHours();
											}
											var minutes = myDate.getMinutes();
											if (minutes < 10) {
												minutes = "0" + myDate.getMinutes();
											}
											var seconds = myDate.getSeconds()
											if (seconds < 10) {
												seconds = "0" + myDate.getSeconds();
											}
											var now = year + "-" + month + "-" + day + "-" + hours + ":" + minutes + ":" + seconds;
											var xdd = myDate.getTime();
											if (bd == "" || bdd == "NaN") {
												var config = {
													title: _('Notice'),
													msg: _('Please select the start time！')
												}
												Ext.Msg.show(config);
												return false;
											} else {
												if (bdd >= edd) {
													var config = {
														title: _('Notice'),
														msg: _('Start time can not be greater than the end time!')
													}
													Ext.Msg.show(config);
													var bd = Ext.getCmp("startT");
													bd.setValue(" ");
													return false;
												}
												else {
													return true;
												};
											}
										}
									}
								},
								{
									xtype: 'datetimefield',
									fieldLabel: _('To'),
									labelAlign: "right",
									name: 'endTime',
									id: 'endT',
									editable: false,
									margin: 10,
									itemId: 'endTime',
									// value: new Date(),
									value: new Date(),
									allowBlank: false,
									listeners: {
										"select": function () {
											var bd = Ext.getCmp('startT').getValue();
											var ed = Ext.getCmp('endT').getValue();
											var bdd = Date.parse(bd); //Date.parse的处理很关键   
											var edd = Date.parse(ed);
											var myDate = new Date();
											var year = myDate.getFullYear();
											var month = myDate.getMonth() + 1;
											if (month < 10) {
												month = "0" + (myDate.getMonth() + 1);
											}
											var day = myDate.getDate();
											if (day < 10) {
												day = "0" + myDate.getDate();
											}
											var hours = myDate.getHours();
											if (hours < 10) {
												hours = "0" + myDate.getHours();
											}
											var minutes = myDate.getMinutes();
											if (minutes < 10) {
												minutes = "0" + myDate.getMinutes();
											}
											var seconds = myDate.getSeconds()
											if (seconds < 10) {
												seconds = "0" + myDate.getSeconds();
											}
											var now = year + "-" + month + "-" + day + "-" + hours + ":" + minutes + ":" + seconds;
											var xdd = myDate.getTime();
											if (bd == "" || bdd == "NaN") {
												var config = {
													title: _('Notice'),
													msg: _('Please select the start time！')
												}
												Ext.Msg.show(config);
												return false;
											} else {
												if (bdd >= edd || edd > xdd) {
													var config = {
														title: _('Notice'),
														msg: _('time msg')
													}
													Ext.Msg.show(config);
													var bd = Ext.getCmp("startT");
													bd.setValue(" ");
													var bd = Ext.getCmp("endT");
													bd.setValue(" ");
													return false;
												} else {
													return true;
												};

											}
										}
									}
								},
								{
									xtype: 'button',
									text: _('Query'),
									iconCls: 'x-fa fa-search',
									itemId: 'query',
									handler: 'onQuery',
									margin: 10,
								}
							],
						},
						{
							title: _('Basic Information'),
							xtype: 'grid',
							height: 400,
							itemId: 'basicGrid',
							autoScroll: true,//滚动条
							// 绑定到viewModel的属性
							bind: {
								store: '{basicStore}'
							},
							// grid显示字段
							columns: [
								{ text: _('serialNumber'), xtype: 'rownumberer', width: 110, sortable: false, align: 'center' },
								{ text: _('neCount'), dataIndex: 'neCount', width: 200 },
								{ text: _('maxSpan'), dataIndex: 'maxSpan', width: 150 },
								{ text: _('minSpan'), dataIndex: 'minSpan', width: 150 },
								{
									text: _('totalSpan'), dataIndex: 'totalSpan', width: 150,
									renderer: function getRstatus(value, m, r) {
										if (value >= 60) {
											m.tdCls = 'onu_status_' + 1;
											return value;
										} else {
											m.tdCls = 'alarm_bk_' + 6;
											return value;
										}
									}
								},
								{ text: _('Statistics start time'), dataIndex: 'startTime', width: 200 },
								{ text: _('Statistics end time'), dataIndex: 'endTime', width: 200 },
								{ text: _('loadRatio'), dataIndex: 'loadRatio', width: 200 },

							],
							selType: 'checkboxmodel',//复选框
							viewConfig: {
								forceFit: false,  //false表示不会自动按比例调整适应整个grid，true表示依据比例自动智能调整每列以适应grid的宽度，阻止水平滚动条的出现。dataCM(ColumnModel)中任意width的设置可覆盖此配置项。
								autoFill: false   //false表示按照实际设置宽度显示每列，true表示当grid创建后自动展开各列，自适应整个grid.且，还会对超出部分进行缩减，让每一列的尺寸适应grid的宽度大小，阻止水平滚动条的出现。
							},

							dockedItems: [
								{
									xtype: 'pagingtoolbar',
									//dock: 'top',
									dock: 'bottom',
									itemId: 'basicPageing',
									inputItemWidth: 50,
									displayInfo: true,
									displayMsg: _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
									emptyMsg: _("Empty"),
									items: [
										//  '-',
										{
											fieldLabel: _('Page Size'),
											xtype: 'combobox',
											width: 150,
											padding: '0 0 0 5',
											displayField: 'val',
											valueField: 'val',
											multiSelect: false,
											editable: false,
											labelWidth: 60,
											store: Ext.create('Ext.data.Store', {
												fields: [{ name: 'val', type: 'int' }],
												data: [
													{ val: 2 },
													{ val: 3 },
													{ val: 4 },
												]
											}),
											value: 2,
											listeners: {
												change: function (me, newValue, oldValue, ops) {
													var grid = this.up('grid');
													Ext.apply(grid.store, { pageSize: newValue });
													this.up('pagingtoolbar').moveFirst();
												},
											}
										}
									],
									listeners: {
										change: function (me, newValue, oldValue, ops) {
											var chart = this.up().up().up().up().down('#serverChart');
											var pageing = this.up().up().up().down('#basicPageing');
											var ip = this.up().up().up().down('#processForm').form.findField("process_name").value;
											var store = chart.getStore();
											var currentPage = pageing.getPageData().currentPage;
											var fromRecord = pageing.getPageData().fromRecord;
											var toRecord = pageing.getPageData().toRecord;
											if (toRecord == 0) {
												var limit = pageing.config.items[0].value
											} else {
												var limit = toRecord - fromRecord + 1;
											}
											var start = (currentPage - 1) * limit;
											var page = currentPage;
											var form = this.up().up().up().down('#processForm');
											var formParams = form.getForm().getValues();
											var params = {
												start: start, page: page, limit: limit, ip: ip, startTime: formParams.startTime, endTime: formParams.endTime
											};
											console.info(store);
											store.proxy.url = "/pmCollect/api/estimate/findEstimate";
											store.proxy.extraParams = params;
											store.reload();
										},
									}
								},

							],
						},//grid
						{
							xtyp: 'panel',
							itemId: 'tableChart',
							items: [
								{ xtype: 'loadChart' }
							],
						},
						{
							title: _('Failure information'),
							xtype: 'grid',
							itemId: 'resourceGrid',
							height: 250,
							//frame:true,
							autoScroll: true,//滚动条
							// 绑定到viewModel的属性
							bind: {
								// store: '{resourceStore}',
							},
							// grid显示字段
							columns: [
								{ text: _('serialNumber'), xtype: 'rownumberer', width: 80, sortable: false, align: 'center' },
								{ text: _('neId'), dataIndex: 'neId', width: 300 },
								{ text: _('neIp'), dataIndex: 'neIp', width: 300 },
								{ text: _('Cause of failure'), dataIndex: 'neName', width: 400 },
								{ text: _('number of failures'), dataIndex: 'metypeName', width: 400 },
							],
						}//grid
					]
				},//table1

			],
		},
	]
});
