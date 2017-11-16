Ext.define('Admin.view.performance.estimate.view.basicInfo', {
	xtype: 'basicInfo',
	extend: 'Ext.form.Panel',
	requires: [
		'Admin.view.performance.estimate.viewModel.collectAssessmentViewModel',
		'Admin.view.performance.estimate.model.processStoreModel',
		'Admin.view.performance.estimate.view.loadChart',
		'Admin.view.performance.estimate.model.basicStoreModel',
	],
	viewModel: 'collectAssessmentViewModel',
	itemId: 'basicInfo',
	items: [
		{
			xtype: 'form',
			margin: 10,
			itemId: 'serverForm',
			height: 750,
			defaultType: 'displayfield',
			defaults: {
				anchor: '100%'
			},
			items: [
				{
					xtype: 'combo',
					fieldLabel: _('Performance monitoring process'),
					itemId: 'process_name',
					id: 'process',
					name: 'process_name',
					editable: false,
					emptyText: _('Please select'),
					//labelAlign: "right",
					allowBlank: false,
					bind: {
						store: '{processStore}',
					},
					valueField: 'text',
					displayField: 'value',
					queryMode: 'local',
					listeners: {
						beforeselect: function (combo, record, index, eOpts) {
							console.info('before');
							console.info(record.data.text);
							var serverForm = this.up().up().down('#serverForm');
							Ext.Ajax.request({
								url: '/pmCollect/api/estimate/queryServerDetail',
								method: "Get",
								params: { ip: record.data.text },
								success: function (response, options) {
									var  resu  = JSON.parse(response.responseText);
									var ip = resu.result.ip;
									var rstatus = resu.result.rstatus;
									if (rstatus == 0) {
										rstatus = _("Not running");
									} else {
										rstatus = "normal operation";
									}
									var processName = resu.result.process_name;
									//var Desc="提供统一的网络设备性能数据采集、计算、汇总、报表、趋势图展示等功能";
									var Desc = _("Provide unified network equipment performance data collection, calculation, summary, statements, trend display and other functions");
									console.info(serverForm);
									serverForm.form.findField('processName').setValue(processName);
									serverForm.form.findField('rstatus').setValue(rstatus);
									serverForm.form.findField('Desc').setValue(Desc);
									serverForm.form.findField('ip').setValue(ip);
								}
							});
						}
					}
				},
				{
					fieldLabel: _('Service Name'),
					xtype: 'displayfield',
					allowBlank: false,
					name: 'processName'
				},
				{
					fieldLabel: _('Service Ip'),
					xtype: 'displayfield',
					allowBlank: false,
					name: 'ip'
				},
				{
					xtype: 'textareafield',
					readOnly: true,
					fieldLabel: _('Service description'),
					name: 'Desc',
				},
				{
					xtype: 'displayfield',
					fieldLabel: _('Service Status'),
					name: 'rstatus',
				}
			],
		},

	],
	listeners: {
		// beforeactivate : 'onloadForm',
	},
})