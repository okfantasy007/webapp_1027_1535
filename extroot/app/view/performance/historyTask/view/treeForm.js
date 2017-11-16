Ext.define('Admin.view.performance.historyTask.view.treeForm', {
	//extend: 'Admin.view.base.CardForm',
	extend: 'Ext.container.Container',
	xtype: 'treeForm',
	requires: [
		'Admin.view.performance.historyTask.model.reStoreModel',
		'Admin.view.performance.historyTask.viewModel.treeFormViewModel',
		'Admin.view.performance.historyTask.controller.treeFormControl',
		'Admin.view.performance.historyTask.view.resourceTree',
		// 'Admin.view.performance.historyTask.view.managementDomainTree',
	],
	controller: 'treeFormControl',
	viewModel: 'treeFormViewModel',
	reference: 'treeForm',
	itemId: 'treeForm',
	margin: 10,
	items: [
		{
			xtype: 'panel',
			layout: 'border',
			reference: 'addResourceView',
			itemId: 'resourceView',

			height: 666,
			items: [
				{
					xtype: 'resourceTree',
					//height: 430,
					itemId: 'resourceTree',
					frame: true,
					width: 250,
					region: 'center',
					title: _('chooseCollectResources'),
				},
				{
					title: _('selectMeasurementObject'),
					xtype: 'grid',
					reference: 'addSourceGrid',
					region: 'east',
					frame: true,
					itemId: 'addSourceGrid',
					//height: 2000,
					width: 900,
					autoScroll: true,//滚动条
					// 绑定到viewModel的属性
					bind: {
						store: '{reStore}'
					},
					// grid显示字段
					columns: [
						{ text: _('serialNumber'), xtype: 'rownumberer', width: 60, sortable: false, align: 'center' },
						{ text: _('neName'), dataIndex: 'neName', width: 100 },
						{ text: _('neIp'), dataIndex: 'neIp', width: 100 },
						{ text: _('rsName'), dataIndex: 'rsName', width: 100 },
						{ text: _('metypeName'), dataIndex: 'metypeName', width: 100 },
						{ text: _('rsType'), dataIndex: 'rsType', width: 100 },
						{ text: _('rsStatus'), dataIndex: 'rsStatus', width: 100 },
						{ text: _('metypeId'), dataIndex: 'metypeId', width: 30, hidden: true },
						{ text: _('neId'), dataIndex: 'neId', width: 30, hidden: true },
						{ text: _('rsIndex'), dataIndex: 'rsIndex', width: 30, hidden: true },
						{ text: _('rsUrl'), dataIndex: 'rsUrl', width: 30, hidden: true },

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
											{ val: 15 },
											{ val: 25 },
											{ val: 50 },
										]
									}),
									value: 15,
									listeners: {
										change: function (me, newValue, oldValue, ops) {
											var grid = this.up('grid');
											Ext.apply(grid.store, { pageSize: newValue });
											this.up('pagingtoolbar').moveFirst();
										}
									}
								}
							]
						}],

					listeners: {
						itemdblclick: 'onItemDoubleClick',
						activate: 'onActive',
						select: 'onSelectChange'
					}
				}
			],
			buttons: [
				{
					text: _('Submit'),
					iconCls: 'x-fa fa-plus',
					handler: 'onSubmitTree'
				},
				{
					text: _('Cancel'),
					iconCls: 'x-fa fa-close',
					handler: 'onCancelTree',
				}
			],
		},
	],


})