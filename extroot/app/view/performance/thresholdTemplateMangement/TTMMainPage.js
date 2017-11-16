Ext.define('Admin.view.performance.thresholdTemplateMangement.TTMMainPage', {
	extend: 'Admin.view.base.PagedGrid',
	xtype: 'TTMMainPage',
	viewModel: {
		stores: {
			templateInit: {
				autoLoad: true,

				// 每页显示记录数
				pageSize: 10,
				proxy: {
					type: 'ajax',
					url: '/pmManagement/api/pmmng/thresholdTmpl/queryThresholdTmpl',
					reader: {
						type: 'json',
						rootProperty: 'rows'
					}
				}

			},
		}
	},

	controller: {
		detailedQuery: function () {
			var grid = this.getView(),
				card = grid.up().up(),
				form = card.down('#TTMDetailPage');

			record = grid.getSelectionModel().getSelection()[0];
			form.getForm().loadRecord(record);
			var formGrid = card.down('#TTMDetailPage').down('#detailPageGrid').down('#basicInfoGrid');
			formGrid.loadRecord(record);
			card.setActiveItem(form);
		},
		onQueryCondition: function () {
			var queryInfo = this.lookupReference('serchForm').getForm();
			if (queryInfo.getValues()["tcaTmplName"].trim() == '' && queryInfo.getValues()["tmplDesc"].trim() == '') {
				Ext.Msg.alert(_('Prompt information'), _('Please enter the content to query'), Ext.emptyFn);
				return null;
			}
			store = this.getStore('templateInit');
			Ext.apply(store.proxy.extraParams, {
				tcaTmplName: queryInfo.getValues()["tcaTmplName"].trim(),
				tmplDesc: queryInfo.getValues()["tmplDesc"].trim(),
			})
			store.reload();

		},
		onReset: function () {
			this.lookupReference('serchForm').getForm().reset();
		},

		onFilter: function () {
			this.lookupReference('serchForm').getForm().reset();
			var form = this.lookupReference('serchForm');
			form.setHidden(!form.isHidden())
			if (form.isHidden()) {
				store = this.getStore('templateInit');
				store.getProxy().setExtraParams({
					'includes': ''
				})
				store.reload();
			}
		},
		onAdd: function () {
			var grid = this.getView(),
				card = grid.up().up(),
				form = card.down('TTMAddPage');
			card.setActiveItem(form);
		},

		onEdit: function () {
			var grid = this.getView(),
				card = grid.up().up(),
				form = card.down('#TTMEditPage');
			record = grid.getSelectionModel().getSelection()[0];
			var formGrid = card.down('#TTMEditPage').down('#editPageGrid').down('#basicInfoGrid');
			formGrid.loadRecord(record);
			card.setActiveItem(form);

		},
		onDelete: function () {
			var grid = this.getView(),
				records = grid.getSelectionModel().getSelection(),
				names = [],
				ids = [];
			var view = this.getView().up();
			var TTMMainPageGrid = view.down('#TTMMainPageGrid');
			for (var i in records) {
				records[i]
				names.push(records[i].get('tcaTmplName'));
				ids.push(records[i].get('tcaTmplId'));
			}
			var tcaTmplId = {};
			tcaTmplId.tcaTmplId = ids
			console.info(JSON.stringify(tcaTmplId));
			Ext.MessageBox.confirm(_('Prompt information'), names.join('<br />'),
				function (btn) {
					if (btn == 'yes') {
						Ext.Ajax.request({
							url: '/pmManagement/api/pmmng/thresholdTmpl/delete',
							method: "POST",
							jsonData: JSON.stringify(tcaTmplId),
							success: function (response, options) {
								Ext.toast({
									html: _('Successful operation'),
									title: _('Prompt information'),
									width: 200,
									align: 't'
								});
								console.info(TTMMainPageGrid);
								TTMMainPageGrid.getStore().reload();

							},
							failure: function (response, options) {
								Ext.toast({
									html: _('operation failed'),
									title: _('Prompt information'),
									width: 200,
								});
							}
						});

					} // if 
				}
			);
		},
		onRefresh: function () {
			var grid = this.getView();
			grid.getStore().reload();
		},
		onSelectChange: function (thisModel, selRecords) {
			var serverListGrid = this.getView();
			serverListGrid.down('#edit').setDisabled(selRecords.length != 1);
			serverListGrid.down('#detail').setDisabled(selRecords.length != 1);
			serverListGrid.down('#delete').setDisabled(selRecords.length == 0);
		},
	},

	// 绑定到viewModel的属性
	bind: {
		store: '{templateInit}',
	},
	selModel: {
		selType: 'checkboxmodel',
		listeners: {
			selectionchange: 'onSelectChange'
		}
	},
	reference: 'ttmPageGrid',
	//selType: 'checkboxmodel',
	itemId: 'TTMMainPageGrid',
	// grid显示字段
	columns: [{
			header: _('Serial number'),
			xtype: 'rownumberer',
			width: 60,
			align: 'center',
			sortable: false
		},
		{
			dataIndex: 'tcaTmplId',
			hidden: true,
		},
		{
			dataIndex: 'metricTmplId',
			hidden: true,
		},
		{
			text: _('Template name'),
			dataIndex: 'tcaTmplName',
			align: 'center',
			width: 260
		},
		{
			text: _('Affiliated Group'),
			dataIndex: 'metricTmplName',
			align: 'center',
			width: 312
		},
		{
			text: _('tmplDesc'),
			dataIndex: 'tmplDesc',
			align: 'center',
			width: 650
		},

	],

	// 分页工具条位置top/bottom
	pagingbarDock: 'bottom',

	// 默认每页记录数
	pagingbarDefaultValue: 10,

	// 分页策略
	pagingbarConfig: {
		fields: [{
			name: 'val',
			type: 'int'
		}],
		data: [{
			val: 10
		}, {
			val: 15
		}, {
			val: 25
		}, {
			val: 50
		}]
	},
	// 自定义工具条
	dockedItems: [{
			xtype: 'toolbar',


			dock: 'top', //工具条位置
			items: [{
					text: _('templateAdd'),
					width: 100,
					iconCls: 'x-fa fa-plus',
					hidden: SEC.hidden('05040201'),
					handler: 'onAdd'
				}, {
					text: _('templateEdit'),
					width: 100,
					iconCls: 'x-fa fa-edit',
					hidden: SEC.hidden('05040202'),
					itemId: 'edit',
					disabled: true,
					handler: 'onEdit',

				}, {
					text: _('templateDelete'),
					width: 100,
					iconCls: 'x-fa fa-trash',
					hidden: SEC.hidden('05040203'),
					itemId: 'delete',
					disabled: true,
					handler: 'onDelete',

				}, {

					text: _('templateDetailsQuery'),
					width: 100,
					iconCls: 'x-fa fa-search',
					hidden: SEC.hidden('05040204'),
					disabled: true,
					itemId: 'detail',
					handler: 'detailedQuery',

				},

				'->', {
					text: _('Filter Template'),
					width: 100,
					iconCls: 'x-fa fa-filter',
					hidden: SEC.hidden('05040205'),
					handler: 'onFilter'
				}, {
					tooltip: _('Refresh'),
					width: 50,
					iconCls: 'x-fa fa-refresh',
					handler: 'onRefresh'
				}
			]
		},
		{

			xtype: 'form',
			layout: 'column',
			hidden: true,
			height: 50,
			reference: 'serchForm',
			defaultType: 'textfield',
			items: [{
					fieldLabel: _('Template name'),
					margin: 10,
					name: 'tcaTmplName'
				},
				{
					xtype: 'textfield',
					margin: 10,
					width: 500,
					fieldLabel: _('tmplDesc'),
					name: 'tmplDesc'
				},
				{
					xtype: 'button',
					margin: 10,
					align: 'right',
					text: _('Reset'),
					iconCls: 'x-fa fa-undo',
					handler: 'onReset'
				},
				{
					xtype: 'button',
					margin: 10,
					text: _('Ok'),
					iconCls: 'x-fa fa-search',
					handler: 'onQueryCondition'
				},
			],
		}
	],


});