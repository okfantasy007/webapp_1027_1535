Ext.define('Admin.view.performance.templateMangement.PMTAddPage', {
	extend: 'Admin.view.base.CardForm',
	xtype: 'PMTAddPage',
	// 指定布局
	layout: 'card',
	itemId: 'PMTAddPage',
	// 指定panel边缘的阴影效果
	cls: 'shadow',

	controller: {

		onSubmit: function () {
			var grid = this.getView(),
				card = grid.up().up(),
				form = card.down('#addPageForm');
			var formdata = form.getValues();
			var view = this.getView().up();
			var mainPageGrid = view.down('#mainPageGrid');
			if (form.getValues()["metricTmplName"].trim() == '') {
				Ext.Msg.alert(_('Prompt information'), _('The template name is required'), Ext.emptyFn);
				return null;
			}
			this.getView().down('#PMTTreeright').expandAll();
			var records = this.getView().down('#PMTTreeright').getStore().data.items;
			var nodesIdArray = [];

			for (var i = 0; i < records.length; i++) {
				if (records[i].id == 'root') {
					continue;
				}
				if (records[i].childNodes.length != 0) {
					for (var j = 0; j < records[i].childNodes.length; j++) {
						nodesIdArray.push(records[i].childNodes[j].id);
					}
				}
			}
			var conditonData = {};
			conditonData.metricId = nodesIdArray;
			conditonData.tmplName = formdata["metricTmplName"];
			conditonData.tmplDesc = formdata["tmplDesc"];
			Ext.MessageBox.wait(_('Processing'), _('Please wait ....'));
			Ext.Ajax.request({
				url: '/pmManagement/api/pmmng/metricTmpl/insert',
				method: "POST",
				jsonData: JSON.stringify(conditonData),
				success: function (response, options) {
					Ext.MessageBox.hide();
					var result = JSON.parse(response.responseText);
					if (result.result == 0) {
						Ext.Msg.alert(_('Prompt information'), _('Successful operation'), Ext.emptyFn);
						view.setActiveItem(0);
						mainPageGrid.getStore().reload();
					} else {

						Ext.Msg.alert(_('Prompt information'), _('operation failed'), Ext.emptyFn);
					}
				},
				failure: function (response, action) {
					Ext.MessageBox.hide();
					if (response.status != 200) {
						Ext.Msg.alert(_('Prompt information'), _('operation failed'), Ext.emptyFn);
					}
				}
			});

		},

		onCancel: function () {
			this.getView().down('#PMTTreeright').getStore().reload();
			this.getView().down('#PMTTreeLeft').getStore().reload();
			this.getView().up().setActiveItem(0);
			this.getView().getForm().reset();

		},

		onReset: function () {
			this.getView().getForm().reset();
			this.getView().down('#PMTTreeright').getStore().reload();
			this.getView().down('#PMTTreeLeft').getStore().reload();
		},
		//左边向右边添加节点
		AddTreeNode: function () {
			var records = this.getView().down('#PMTTreeLeft').getChecked(),
				selectTree = this.getView().down('#PMTTreeright'),
				PMTTreeright = this.getView().down('#PMTTreeLeft'),
				controller = this;
			for (var i in records) {
				controller.pushNodeChanToTree(selectTree,
					records[i]);
			};
			for (var i in records) {
				if (records[i].get('depth') > 0) {
					records[i].remove();
				} else {
					records[i].set("checked", false);
				}
			}
		},
		pushNodeChanToTree: function (tree, node) {
			var chan = [];
			this.getTreeUpNodeChan(node, chan);
			chan = chan.reverse();
			for (var i in chan) {
				var existNode = tree.store.getNodeById(chan[i]
					.get('id'));
				if (existNode == null) {
					var parentNode = tree.store
						.getNodeById(chan[i].parentNode
							.get('id'));
					var n = chan[i].copy();
					n.data.checked = false;
					var index = chan[i].get('index');
					parentNode.insertChild(index, n);
				}
			}
		},

		getTreeUpNodeChan: function (node, chan) {
			if (node.get('depth') == 0) {
				return;
			}
			chan.push(node)
			this.getTreeUpNodeChan(node.parentNode, chan);
		},
		//右边删除节点到左边
		deleteTreeNode: function () {
			var records = this.getView().down('#PMTTreeright').getChecked(),
				selectTree = this.getView().down('#PMTTreeLeft'),
				PMTTreeright = this.getView().down('#PMTTreeright'),
				controller = this;
			for (var i in records) {
				controller.pushNodeChanToTree(selectTree,
					records[i]);
			};
			for (var i in records) {
				if (records[i].get('depth') > 0) {
					records[i].remove();
				} else {
					records[i].set("checked", false);
				}
			}
			console.info(this.getView().down('#PMTTreeLeft').getStore());
			console.info(this.getView().down('#PMTTreeright').getStore());
		},
	},

	items: [{
		xtype: 'fieldset',
		title: _('Template Add Page'),
		items: [{
				xtype: 'form',
				margin: 2,
				itemId: 'addPageForm',
				layout: 'column',
				defaultType: 'textfield',
				items: [{
					fieldLabel: _('Template name'),
					margin: 2,
					columnWidth: 0.36,
					name: 'metricTmplName',
					allowBlank: false, //不允许为空
					blankText: _('Can not be empty!')
				}, {
					fieldLabel: _('System defaults'),
					xtype: 'textfield',
					margin: 2,
					columnWidth: 0.35,
					value: _('no'),
					readOnly: true,
					name: 'isDefault'
				}, {
					xtype: 'textarea',
					columnWidth: 0.72,
					fieldLabel: _('tmplDesc'),
					margin: 2,
					name: 'tmplDesc'
				}]

			},

			//指标组的树的布局
			{
				xtype: 'container',
				layout: 'column',
				//height: 400,
				items: [{
					//查询
					xtype: 'panel',
					title: _('Metric Group'),
					margin: 2,
					columnWidth: 0.44,
					buttonAlign: 'center',
					//height: 430,
					items: [{
						xtype: 'userPMLeftTree',
						itemId: 'PMTTreeLeft',
						reference: 'leftTree',
						height: 430,

					}]
				}, {
					//操作中心
					xtype: 'panel',
					title: _('Operation'),
					margin: 2,
					//height: 430,
					columnWidth: 0.12,
					buttonAlign: 'center',
					items: [{
						//纵坐标为距父容器上边缘10像素的位置 	
						margin: '132 25 0 25',
						xtype: 'button',
						text: _('>>>>>'),
						height: 30,
						width: 100,
						//iconCls : 'x-fa arrow-right',
						handler: 'AddTreeNode',
					}, {
						//纵坐标为距父容器上边缘10像素的位置
						margin: '100 0 132 25',
						xtype: 'button',
						text: _('<<<<<'),
						height: 30,
						width: 100,
						//iconCls : 'x-fa arrow-left',
						handler: 'deleteTreeNode',
					}]
				}, {
					//东边树的定义
					title: _('Selected Metric'),
					xtype: 'userRightTree',
					itemId: 'PMTTreeright',
					reference: 'PMTTreeright',
					margin: 2,
					//height: 430,
					columnWidth: 0.44,


				}]
			},
		]
	}],

	buttons: [{
		text: _('Reset'),
		iconCls: 'x-fa fa-undo',
		handler: 'onReset',
	}, {
		text: _('Cancel'),
		iconCls: 'x-fa fa-close',
		handler: 'onCancel',
	}, {
		text: _('Save'),
		iconCls: 'x-fa fa-save',
		handler: 'onSubmit',
	}]

});