Ext.define('Admin.view.performance.historyTask.controller.taskMainControl', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.taskMainControl',

	onSuspend: function () {
		this.setTaskStatus(3)
	},

	onStart: function () {
		this.setTaskStatus(2)
	},

	onStop: function () {
		this.setTaskStatus(4)
	},

	setTaskStatus: function (status) {
		var card = this.getView(),
			grid = card.down('#performanceGrid'),
			records = grid.getSelectionModel().getSelection();
		ids = [];
		for (var i in records) {
			records[i]
			ids.push(records[i].get('taskId'));
		};
		var params = {
			taskStatus: status,
			taskId: ids,
		};
		Ext.Ajax.request({
			url: '/pmManagement/api/pmmng/pmTask/updateStatus',
			method: 'POST',
			jsonData: JSON.stringify(params),
			success: function () {
				Ext.Msg.alert(_('Operation Success!')),
					grid.store.reload();
			},
			failure: function (form, action) {

			}
		});
	},

	onQueryCondition: function () {
		var card = this.getView(),
			form = card.down('#serchForm'),
			values = form.getForm().getValues();
		var paging = card.down('#mainView').down('#performanceGrid').down('#Pagingbar');
		paging.moveFirst();
		var store = card.down('#performanceGrid').getStore();
		store.proxy.url = "/pmManagement/api/pmmng/pmTask/queryTask"
		store.proxy.extraParams = values;
		paging.reset();
		store.reload();
	},

	onResetSerchForm: function () {
		this.lookupReference('serchForm').getForm().reset();
	},

	onFilter: function () {
		var form = this.lookupReference('serchForm');
		form.setHidden(!form.isHidden())
	},

	onAdd: function () {
		var card = this.getView();
		var resourceGrid = card.down('#resourceGrid');
		//清除表格所有数据
		resourceGrid.getStore('resourceStore').removeAll();
		var form = card.down('#add');
		var user = APP.user;
		form.getForm().reset();
		form.form.findField("createUser").setValue(user);
		form.setTitle(_('createTask'));
		card.setActiveItem(form);
	},
	onAddOne: function () {
		var card = this.getView().up(),
			form = card.down('#singleAdd');
		var user = APP.user;
		form.getForm().reset();
		//清除tree行选中数据
		var equipmentTree = card.down('#singleAdd').down('#singAddTask').down('#equipment').down('#singTre').down('#equipmentTree');
		var recordEquipment = equipmentTree.getSelection();
		equipmentTree.getSelectionModel().deselect(recordEquipment);
		//清除 tree 选中数据
		var singleResourceTree = card.down('#singleResourceTree');
		var records = singleResourceTree.getChecked();
		if (records.length > 0) {
			var node = records[0].parentNode;
			singleResourceTree.getStore().remove(node);
			singleResourceTree.getStore().remove(records);
		}
		form.form.findField("createUser").setValue(user);
		form.setTitle(_('createTask'));
		card.setActiveItem(form);
	},
	iteratorNodes: function (nodes, id) {
		var id = id;
		if (nodes.childNodes.length == 0) {
			for (var j = 0; j < id.length; j++) {
				if (nodes.id == (id[j]).toString()) {
					nodes.set('checked', true);
					nodes.parentNode.expand();
				}
			}
		} else {
			for (var i = 0; i < nodes.childNodes.length; i++) {
				var node = nodes.childNodes[i];
				this.iteratorNodes(node, id)
			}
		}
	},
	iteratorDviceNodes: function (nodes, id, tree) {
		var id = id;
		if (nodes.childNodes.length == 0) {
			if (nodes.id == (id.toString())) {
				tree.selModel.select(nodes)
				//tree.getSelectionModel().select(nodes)
				nodes.parentNode.expand();
			}
		} else {
			for (var i = 0; i < nodes.childNodes.length; i++) {
				var node = nodes.childNodes[i];
				this.iteratorDviceNodes(node, id, tree)
			}
		}
	},

	onEdit: function () {
		//1.判断单点任务/批量任务
		//2.if（单）,a.查询所有设备  b.taskId.查询任务下设备id+资源id  c.递归遍历设备node选中
		//d.通过设备id,查询资源树， e.递归遍历资源node
		//3.if(批），taskId，，查当前任务下资源
		var card = this.getView();
		var controller = this;
		var grid = card.down('#performanceGrid');
		var updForm = card.down('#upd');
		var singleUpd = card.down('#singleUpd');
		var store = card.down('#upd').down('#updResourceGrid').store;
		var record = grid.getSelectionModel().getSelection()[0];
		var taskId = record.get('taskId');
		var executeTime = record.get('executeTime');
		var endTime = record.get('endTime');
		var taskCreateMethod = record.get('taskCreateMethod');
		if (taskCreateMethod == "1") {
			if (executeTime == '' || endTime == '') {
				singleUpd.down('#singleRadiogroup').setValue({ custom: 0 });
			} else {
				singleUpd.down('#singleRadiogroup').setValue({ custom: 1 });
			};
			Ext.Ajax.request({
				url: '/pmManagement/api/pmmng/pmTaskDetai/findChoosedByTaskId',
				method: 'get',
				params: { taskId: taskId },
				success: function (response, options) {
					var  resu  = JSON.parse(response.responseText);
					var resourceIds = resu.resourceIdList;
					var equipmentIds = (resu.deviceIdList)[0];
					var ids = { neId: equipmentIds };
					//递归设备
					var equipmentTree = card.down("#singleUpd").down("#addTask").down('#equipment').down('#eqTree').down('singUpdEquipmentTree');
					var equipmentTreeNodes = equipmentTree.getRootNode();
					controller.iteratorDviceNodes(equipmentTreeNodes, equipmentIds, equipmentTree);

					singleUpdResourceTree = card.down('#singleUpdResourceTree');
					var store = singleUpdResourceTree.getStore();
					store.proxy.url = '/pmManagement/api/pmmng/pmTask/findResourceByDevice',
						store.proxy.extraParams = ids;

					store.load(function (records, operation, success) {
						if (success) {
							rec = singleUpdResourceTree.getChecked();
							singUpdTempButton = card.down("#singleUpd").down("#addTask").down('#updTemplateSettings').down('#templateContainer').down('#singUpdTempButton');
							singUpdTempButton.setDisabled(record.length == 0);
							var resourceTreeNodes = card.down('singleUpdResourceTree').getRootNode();
							controller.iteratorNodes(resourceTreeNodes, resourceIds);
							singleUpd.loadRecord(record);
							singleUpd.down('#singEndTime').setValue(endTime);
							singleUpd.down('#singleExecuteTime').setValue(executeTime);
							card.setActiveItem(singleUpd);
						}
					});
				},
				failure: function (form, action) {
					console.info('');
				}
			});
		} else {
			store.on("beforeload", function () {
				Ext.apply(store.proxy.extraParams, {
					taskId: taskId
				})
			});
			store.reload();
			updForm.loadRecord(record);
			if (executeTime == '' || endTime == '') {
				updForm.down('#updRadiogroup').setValue({ continu: 0 });
			} else {
				updForm.down('#updRadiogroup').setValue({ continu: 1 });
			};
			updForm.down('#taskEndTime').setValue(endTime);
			updForm.down('#updBegin').setValue(executeTime);
			card.setActiveItem(updForm);
		}

	},

	//详细查询
	detailedQuery: function () {
		var card = this.getView().up();
		var grid = card.down('#performanceGrid');
		var detailedQueryform = card.down('#detail');
		var detailedSingleTask = card.down('#detailedSingleTask');
		var record = grid.getSelectionModel().getSelection()[0];
		var taskId = record.get('taskId');
		var taskType = record.get('taskType');
		if (taskType == 2) {
			taskType = "未运行"
		};
		var params = { taskId: taskId };
		var taskCreateMethod = record.get('taskCreateMethod');
		if (taskCreateMethod == "1") {
			//1.查询此任务下  设备（返回树结构，包括其父节点）
			var deviceStore = card.down('#detailequipTree').getStore();
			deviceStore.proxy.url = '/pmManagement/api/pmmng/pmTaskDetai/findDeviceByTaskId',
				deviceStore.proxy.extraParams = params;
			deviceStore.reload();
			//2.查询此任务下  资源（返回树结构，包括其父节点）
			var singleResourceStore = card.down('#detailSingleResouTree').getStore();
			singleResourceStore.proxy.url = '/pmManagement/api/pmmng/pmTaskDetai/findResourceByTaskId',
				singleResourceStore.proxy.extraParams = params;
			singleResourceStore.reload();
			//3.loadrecord

			detailedSingleTask.loadRecord(record);
			detailedQueryform.form.findField("taskType").setValue(taskType);
			card.setActiveItem(detailedSingleTask);

		} else {
			var store = card.down('#detail').down('#resourceGrid').store;
			store.proxy.url = '/pmManagement/api/pmmng/pmTaskDetai/queryResource',
				store.proxy.extraParams = params;
			store.reload();
			detailedQueryform.loadRecord(record);
			card.setActiveItem(detailedQueryform);
		};

	},
	onDelete: function () {
		var card = this.getView().up();
		var grid = card.down('#performanceGrid');
		var records = grid.getSelectionModel().getSelection();
		var ids = []; var resources = []; var taskTypes = [];
		for (var i in records) {
			ids.push(records[i].get('taskId'));
			taskTypes.push(records[i].get('taskType'))
			resources.push(records[i].data);
		};
		var params = { taskId: ids, taskTypeList: taskTypes };
		Ext.MessageBox.confirm(_('Confirmation'), _('Do you confirm deletion?'),
			function (btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						url: '/pmManagement/api/pmmng/pmTask/delete',
						method: 'POST',
						jsonData: JSON.stringify(params),
						success: function () {
							Ext.Msg.alert(_('Operation Success!')),
								grid.getStore().reload();
						},
						failure: function (form, action) {

						}
					})
				}
			})
	},
	onRefresh: function () {
		var card = this.getView().up();
		grid = card.down('#performanceGrid');
		grid.getStore().reload();

	},

	onReset: function () {
		this.lookupReference('demoForm').getForm().reset();
	},

	// load记录到form
	loadFormRecord: function (form, record) {
		this.saveOriginalValues(form);
		form.getForm().loadRecord(record);
		this.setResetRecord(form);
		this.getView().setActiveItem(form);
	},
	// 保存form初始变量
	saveOriginalValues: function (form) {
		if (!form.orgValues) {
			form.orgValues = Ext.clone(form.getForm().getValues());
		}
	},
	onSelect: function (thisModel, selRecords) {
		//选中记录数数为!=1时需要做的操作，例如按钮置灰，按钮隐藏等
		this.getView().down('#Edit').setDisabled(selRecords.length != 1);
		this.getView().down('#query').setDisabled(selRecords.length != 1);
		this.getView().down('#Add').setDisabled(selRecords.length != 0);
		this.getView().down('#AddOne').setDisabled(selRecords.length != 0);
	},

})
var ids; 