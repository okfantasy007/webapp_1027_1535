Ext.define('Admin.view.performance.templateMangement.PMTMainPage', {
	extend: 'Admin.view.base.PagedGrid',
	xtype: 'PMTMainPage',
	viewModel: {
		stores: {
			templateInit: {
				autoLoad: true,

				// 每页显示记录数
				pageSize: 10,
				proxy: {
					type: 'ajax',
					url: '/pmManagement/api/pmmng/metricTmpl/queryMetricTmpl',
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
				form = card.down('#detailPage');
			record = grid.getSelectionModel().getSelection()[0];
			form.getForm().loadRecord(record);
			card.setActiveItem(form);
			var treeStoreR = this.getView().up().up().down('#detailPage').down('#PMTTsymbol').down('#PMTTreeright');
			treeStoreR.getStore().getProxy().setExtraParam('tmplId', record.get('tmplId'));
			treeStoreR.getStore().reload();

		},
		//条件过滤模板
		onQueryCondition: function () {
			var queryInfo = this.lookupReference('serchForm').getForm();
			if (queryInfo.getValues()["metricTmplName"].trim() == '' && queryInfo.getValues()["tmplDesc"].trim() == '') {
				Ext.Msg.alert(_('Prompt information'), _('Please enter the content to query'), Ext.emptyFn);
				return null;
			}
			store = this.getStore('templateInit');
			Ext.apply(store.proxy.extraParams, {
				metricTmplName: queryInfo.getValues()["metricTmplName"].trim(),
				tmplDesc: queryInfo.getValues()["tmplDesc"].trim(),
			})
			store.reload();

		},
		onReset: function () {
			this.lookupReference('serchForm').getForm().reset();
		},
		//过滤模板的方法
		onFilter: function () {
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
				form = card.down('PMTAddPage');
			form.lookupController().clearForm();
			card.setActiveItem(form);
		},

		onEdit: function () {
			var grid = this.getView(),
				card = grid.up().up(),
				form = card.down('#editPage');
			record = grid.getSelectionModel().getSelection()[0];
			form.getForm().loadRecord(record);
			if (record.get('isDefault') == 1) {
				Ext.Msg.alert(_('Error prompt'), _('This operation is not allowed by the system default'), Ext.emptyFn);
				return null;
			}
			card.setActiveItem(form);
			var treeStoreR = this.getView().up().up().down('#editPage').down('#editPageItems').down('#PMTTreeright');
			treeStoreR.getStore().getProxy().setExtraParam('tmplId', record.get('tmplId'));
			treeStoreR.getStore().reload();
		},
		onDelete: function () {
			var grid = this.getView(),
				records = grid.getSelectionModel().getSelection();
			console.info(records.length);
			var view = this.getView().up();
			var mainPageGrid = view.down('#mainPageGrid');
			var msg = '';
			var metricTmplIDs = [];
			for (var i = 0; i < records.length; i++) {
				if (records[i].get('isDefault') == 1) {
					Ext.Msg.alert(_('Prompt information'), _('This operation is not allowed by the system default'));
					return null;
				}
				metricTmplIDs.push(records[i].get('tmplId'));
				var map = {};
				map.metricTmplIDs = metricTmplIDs;
				msg += records[i].get('metricTmplName') + '<br/>';

			}
			Ext.MessageBox.confirm(_('Prompt information'), _('The following record will be deleted') + '<br/>' + msg, function (btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						url: '/pmManagement/api/pmmng/metricTmpl/delete',
						method: "POST",
						jsonData: JSON.stringify(map),
						success: function (response, options) {
							Ext.toast({
								html: _('Successful operation'),
								title: _('Prompt information'),
								width: 200
							});
							mainPageGrid.getStore().reload();

						},
						failure: function () {
							Ext.toast({
								html: _('operation failed'),
								title: _('Prompt information'),
								width: 200,
							});
						}
					});
				}

			});


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
	//仅允许单选代码
	/*selModel: {
	    selType: 'checkboxmodel', // XTYPE
	    mode: 'SINGLE',
	    checkOnly: 'true',
	    toggleOnClick: true,
	    allowDeselect: true
	},*/
	selModel: {
		selType: 'checkboxmodel',
		listeners: {
			selectionchange: 'onSelectChange'
		}
	},
	reference: 'mainPageGrid',
	//selType: 'checkboxmodel',
	itemId: 'mainPageGrid',
	// grid显示字段
	columns: [{
			dataIndex: 'tmplId',
			width: 330,
			hidden: true
		},
		{
			text: _('Serial number'),
			xtype: 'rownumberer',
			width: 60,
			align: 'center',
			sortable: false
		},
		{
			text: _('Template name'),
			dataIndex: 'metricTmplName',
			width: 438
		},
		{
			text: _('tmplDesc'),
			dataIndex: 'tmplDesc',
			width: 438
		},
		{
			text: _('System defaults'),
			dataIndex: 'isDefault',
			width: 375,
			renderer: function (val) {
				if (val == 1) return _('yes');
				else return _('no')
			}
		}
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
		}, {
			val: 100
		}]
	},
	// 自定义工具条
	dockedItems: [{
			xtype: 'toolbar',
			dock: 'top', //工具条位置
			items: [{
					text: _('tempAdd'),
					width: 100,
					iconCls: 'x-fa fa-plus',
					hidden: SEC.hidden('05040101'),
					handler: 'onAdd'
				}, {
					text: _('tempEdit'),
					width: 100,
					iconCls: 'x-fa fa-edit',
					hidden: SEC.hidden('05040105'),
					itemId: 'edit',
					disabled: true,
					handler: 'onEdit',

				}, {
					text: _('tempDel'),
					width: 100,
					iconCls: 'x-fa fa-trash',
					hidden: SEC.hidden('05040102'),
					disabled: true,
					itemId: 'delete',
					handler: 'onDelete',
				}, {

					text: _('Details'),
					width: 100,
					iconCls: 'x-fa fa-search',
					hidden: SEC.hidden('05040103'),
					itemId: 'detail',
					handler: 'detailedQuery',
					disabled: true,
				},

				'->', {
					text: _('Filter Template'), //Filter
					width: 100,
					iconCls: 'x-fa fa-filter',
					hidden: SEC.hidden('05040104'),
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
					name: 'metricTmplName'
				},
				{
					xtype: 'textfield',
					margin: 10,
					width: 500,
					fieldLabel: _('Template desc'),
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
					text: _('Query'),
					iconCls: 'x-fa fa-search',
					handler: 'onQueryCondition'
				},
			],
		}
	],


});