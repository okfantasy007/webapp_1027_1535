Ext.define('Admin.view.performance.reportExport.view.reportMainView', {
	extend: 'Ext.form.Panel',
	xtype: 'reportMainView',
	requires: [
		'Admin.view.performance.reportExport.view.reportResourcesTree',
		'Admin.view.performance.reportExport.view.reportDeviceTree',
		'Admin.view.performance.reportExport.view.metric',
	],
	controller: {
		onConfirmParams: function(){
			var pm_report_panel = this.lookupReference('pm_report_panel');
			var reportDeviceTree = pm_report_panel.items.items[1];
			var neId = "";
			if(reportDeviceTree.getSelection() && reportDeviceTree.getSelection()[0]){
				neId = reportDeviceTree.getSelection()[0].id;
				if(neId == "root"){
					Ext.Msg.alert(_('Tip'), _('请选择某一台设备'));
					return;
				}
			}
			var reportResourcesTree = pm_report_panel.items.items[2];
			var resourceId = "";
			if(reportResourcesTree.getSelection()){
				var arr = [];
				var nodes = reportResourcesTree.getSelection();
				for (var i = 0; i < nodes.length; i++) {
					arr.push(nodes[i].id);
				}
				if(arr.indexOf("root") !== -1){
					Ext.Msg.alert(_('Tip'), _('您选择了根节点，请重新选择资源'));
					return;
				}
				resourceId = arr.join(",");
			}
			var metric = pm_report_panel.items.items[3];
			var metricId = "";
			if(metric.getSelection() && metric.getSelection()[0]){
				resourceId = metric.getSelection()[0].id;
				if(metricId == "root"){
					Ext.Msg.alert(_('Tip'), _('请选择某一个指标'));
					return;
				}
			}

			var card = this.getView().up();
			var add_task_panel = card.lookupReference('add_task_panel');
			add_task_panel.form.findField('params_identify_id').setValue(Ext.encode({
				neId: neId,
				rsUrls: resourceId,
				metricId: metricId
			}));
			card.setActiveItem(add_task_panel);
		},
		// onConfirm: function(){
		// 	var pm_report_panel = this.lookupReference('pm_report_panel');
		// 	var reportDeviceTree = pm_report_panel.items.items[1];
		// 	var neId = "";
		// 	if(reportDeviceTree.getSelection() && reportDeviceTree.getSelection()[0]){
		// 		neId = reportDeviceTree.getSelection()[0].id;
		// 		if(neId == "root"){
		// 			Ext.Msg.alert(_('Tip'), _('请选择某一台设备'));
		// 			return;
		// 		}
		// 	}
		// 	var reportResourcesTree = pm_report_panel.items.items[2];
		// 	var resourceId = "";
		// 	if(reportResourcesTree.getSelection() && reportResourcesTree.getSelection()[0]){
		// 		resourceId = reportResourcesTree.getSelection()[0].id;
		// 		if(resourceId == "root"){
		// 			Ext.Msg.alert(_('Tip'), _('请选择某一个资源'));
		// 			return;
		// 		}
		// 	}
		// 	var metric = pm_report_panel.items.items[3];
		// 	var metricId = "";
		// 	if(metric.getSelection() && metric.getSelection()[0]){
		// 		resourceId = metric.getSelection()[0].id;
		// 		if(metricId == "root"){
		// 			Ext.Msg.alert(_('Tip'), _('请选择某一个指标'));
		// 			return;
		// 		}
		// 	}

		// 	var card = this.getView().up();
		// 	var add_task_panel = card.lookupReference('add_task_panel');
		// 	add_task_panel.form.findField('params_identify_id').setValue(Ext.encode({
		// 		neId: neId,
		// 		resouceId: resourceId,
		// 		metricId: metricId
		// 	}));
		// 	card.setActiveItem(add_task_panel);
		// },
		backToAddTaskPage: function(){
			var card = this.getView().up();
			var controller = card.controller;
			controller.backToAddTaskPage();
		}
	},
	layout: 'card',
	itemId: 'reportMainView',
	items: [
		{
			xtype: 'panel',
			layout: 'border',
			title: _('Performance data report export'),
			reference: 'pm_report_panel',
			height: 600,
			items: [
				{
					xtype: 'form',
					region: 'north',
					itemId: 'realTask',
					layout: 'hbox',
					items: [
						{
							xtype: 'datetimefield',
							name: 'satrtTime',
							itemId: 'startTime',
							labelAlign: "right",
							fieldLabel: _('startTime'),
							id: 'startReport',
							editable: false,
							value: new Date(),
							allowBlank: false,
							margin: 10,
							listeners: {
								"select": function () {
									var bd = Ext.getCmp('startReport').getValue();
									var ed = Ext.getCmp('endReport').getValue();
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
											msg: _('please select startTime！')
										}
										Ext.Msg.show(config);
										var bd = Ext.getCmp("startReport");
										bd.setValue(" ");
										return false;
									} else {
										if (bdd >= edd) {
											var config = {
												title: _('Notice'),
												msg: _('The start time must not be greater than the end time')
											}
											Ext.Msg.show(config);
											var bd = Ext.getCmp("startReport");
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
							id: 'endReport',
							editable: false,
							margin: 10,
							itemId: 'endTime',
							value: new Date(),
							allowBlank: false,
							listeners: {
								"select": function () {
									var bd = Ext.getCmp('startReport').getValue();
									var ed = Ext.getCmp('endReport').getValue();
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
											msg: _('please select startTime！')
										}
										Ext.Msg.show(config);
										var bd = Ext.getCmp("endReport");
										bd.setValue(" ");
										return false;
									} else {
										if (bdd >= edd || edd > xdd) {
											var config = {
												title: _('Notice'),
												msg: _('time msg')
											}
											Ext.Msg.show(config);
											var bd = Ext.getCmp("startReport");
											bd.setValue(" ");
											var ed = Ext.getCmp("endReport");
											ed.setValue(" ");
											return false;
										} else {
											return true;
										};

									}
								}
							}
						},//endTime
					]
				},//任务信息
				{
					xtype: 'reportDeviceTree',
					//height: 430,
					itemId: 'reportDeviceTree',
					frame: true,
					width: 433,
					region: 'west',
					title: _('Device'),
				},
				{
					xtype: 'reportResourcesTree',
					itemId: 'reportResourcesTree',
					//height: 430,
					frame: true,
					//width:250,
					region: 'center',
					title: _('Resources'),
				},
				{
					xtype: 'metric',
					itemId: 'metric',
					//height: 430,
					frame: true,
					width: 433,
					region: 'east',
					title: _('metric group'),
				},
/*				{
					xtype: 'panel',
					region: 'south',
					height: 60,
					buttons: [
						'->',
						{
							xtype: 'button',
							text: _('Confirm'),
							iconCls: 'x-fa fa-plus',
							handler: 'onConfirm'
						}
					],
				}*/]
		},
	]
})