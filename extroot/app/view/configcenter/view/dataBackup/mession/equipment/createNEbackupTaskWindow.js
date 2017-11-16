Ext.define('Admin.view.configcenter.view.dataBackup.mession.equipment.createNEbackupTaskWindow', {
	extend: 'Ext.container.Container',
	xtype: 'createNEbackupTask',
	items: [{
		xtype: 'form',
		levelId: 0,
		itemId: 'createTaskForm',
		ftpType: 'backup',
		layout: 'anchor',
		items: [{
			xtype: 'fieldset',
			title: _('Add Backup Task'),
			fieldDefaults: {
				labelAlign: 'right',
				labelWidth: 110,
			},
			margin: 20,
			items: [{
					xtype: 'textfield',
					name: 'resTypeId',
					hidden: true,
					value: 1
				},
				{
					xtype: 'fieldcontainer',
					layout: 'hbox',
					margin: '0 15 15 15',
					items: [{
						xtype: 'textfield',
						flex: 1,
						fieldLabel: _('taskName'),
						name: 'taskName',
						allowBlank: false
					}, {
						xtype: 'panel',
						flex: 1,
					}]
				},
				{
					xtype: 'fieldcontainer',
					defaultType: 'checkbox',
					layout: 'hbox',
					margin: '0 15 15 15',
					items: [{
						fieldLabel: _('whether choose backup policy'),
						boxLabel: _('Yes'),
						flex: 1,
						checked: true,
						name: 'isUsePolicy',
						inputValue: 1,
						itemId: 'whetherChooseFromFileStoreYes',
						listeners: {
							change: 'onChooseSelectChg'
						}
					}, {
						xtype: 'panel',

						flex: 1,

					}, {
						xtype: 'panel',

						flex: 1,

					}]
				}, {
					xtype: 'textfield',
					fieldLabel: '存储策略信息',
					itemId: 'policyStorage',
					hidden: true,
					name: 'policyIds',
					flex: 1
				}, {
					xtype: 'textfield',
					fieldLabel: '存储网元信息信息',
					itemId: 'NEstorage',
					hidden: true,
					name: 'neIds',
					flex: 1
				}, {
					xtype: 'fieldcontainer',
					itemId: 'container0',
					//hidden: true,
					margin: '0 15 15 15',
					layout: {
						type: 'vbox',
						align: 'stretch',
					},
					items: [{
						fieldLabel: ' ',
						labelSeparator: ' ',
						xtype: 'fieldcontainer',
						items: [{
							xtype: 'button',
							width: 100,
							text: '选择策略...',
							handler: 'chooseFromPolicy'
						}]
					}, {
						fieldLabel: '已选策略',
						xtype: 'textarea',
						name: 'selectedPolicy',
					}]
				}, {
					xtype: 'fieldcontainer',
					margin: 0,
					hidden: true,
					itemId: 'container1',
					layout: 'fit',
					items: [{
						xtype: 'fieldcontainer',
						layout: 'hbox',
						margin: '0 15 15 15',
						items: [{
							xtype: 'combo',
							flex: 1,
							fieldLabel: _('fileType'),
							store: {
								type: 'fileType'
							},
							emptyText: _('please choose'),
							displayField: 'fileTypeName',
							name: 'fileTypeName',
							valueField: 'fileTypeName',
							listeners: {
								afterrender: 'firstSoftSelect'
							}
						}, {
							xtype: 'panel',
							flex: 1,
						}]
					}, , {
						xtype: 'fieldcontainer',
						margin: 0,
						//hidden: true,
						itemId: 'container2',
						layout: 'fit',
						items: [{
							xtype: 'radiogroup',
							labelWidth: 110,
							margin: '0 15 15 15',
							fieldLabel: _('choose file transferProtocol'),
							defaultType: 'radiofield',
							layout: 'hbox',
							name: 'fileTransferProtocol',
							items: [{
								boxLabel: 'FTP',
								inputValue: 1,
								flex: 1.5,
								itemId: 'FTP',
								checked: true,
							}, {
								boxLabel: 'TFTP',
								inputValue: 2,
								flex: 1.5,
							}, {
								boxLabel: 'HTTP',
								inputValue: 3,
								flex: 5,
							}],
							// listeners: {
							// 	change: 'choosePact',
							// 	afterrender: 'defaultConf'
							// }
							listeners: {
								change: 'choosePact',
								afterrender: 'defaultConf'
							}
						}, {
							xtype: 'fieldcontainer',
							layout: 'hbox',
							margin: '0 15 15 15',
							items: [{
								xtype: 'combo',
								flex: 1,
								fieldLabel: _('file serverIPadr'),
								queryMode: 'local',
								//name: 'fileTypeId',
								flex: 1,
								store: {
									type: 'ftpIp'
								},
								emptyText: _('please choose'),
								displayField: 'ip',
								valueField: 'ip',
								regex: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/,
								allowBlank: false,
								regexText: _('Please enter the right IPv4 or IPv6 address'),
								name: 'ftpIp',
								itemId: 'fileServerIPadr',
								listeners: {
									change: 'selectFtpIp'
								}
							}, {
								xtype: 'textfield',
								allowBlank: false,
								flex: 1,
								fieldLabel: _('file serverPort'),
								name: 'ftpPort',
								regex: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
								regexText: _('Please enter integer between 0 and 65535'),
								itemId: 'fileServerPort',
							}]
						}, {
							xtype: 'fieldcontainer',
							layout: 'hbox',
							margin: '0 15 15 15',
							items: [{
								xtype: 'combo',
								flex: 1,
								fieldLabel: _('username'),
								queryMode: 'local',
								//name: 'fileTypeId',
								flex: 1,
								store: {
									type: 'ftpUsers'
								},
								emptyText: _('please choose'),
								displayField: 'username',
								valueField: 'username',
								name: 'ftpUsername',
								itemId: 'username',
								listeners: {
									change: 'selectFtpUser'
								}
							}, {
								xtype: 'textfield',
								flex: 1,
								fieldLabel: _('password'),
								name: 'ftpPassword',
								itemId: 'password',
							}]
						}]
					}]
				}, {
					xtype: 'fieldcontainer',
					margin: '0 15 15 15',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: [{
						xtype: 'fieldcontainer',
						fieldLabel: ' ',
						labelSeparator: ' ',
						items: [{
							xtype: 'button',
							width: 100,
							text: _('Choose Ne') + '...',
							handler: 'onChooseNe'
						}]
					}, {
						fieldLabel: '已选网元',
						xtype: 'textarea',
						name: 'selectedNe',
					}]
				}
			]
		}],
		buttons: [{
			text: _('Reset'),
			handler: 'ResetForm'
		}, {
			text: _('Add'),
			handler: 'onCreateTaskSubmit'
		}, {
			text: _('Cancle'),
			handler: 'onFormCancle'
		}]
	}]

});