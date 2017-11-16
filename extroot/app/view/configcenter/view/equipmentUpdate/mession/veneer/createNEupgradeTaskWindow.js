Ext.define('Admin.view.configcenter.view.equipmentUpdate.mession.veneer.createNEupgradeTaskWindow', {
	extend: 'Ext.container.Container',
	xtype: 'newCardTask',
	items: [{
		xtype: 'form',
		levelId: 0,
		ftpType: 'upgrade',
		itemId: 'createTaskForm',
		items: [{
			xtype: 'fieldset',
			title: _("Add Update Policy"),
			fieldDefaults: {
				labelAlign: 'right',
				labelWidth: 110,
			},
			margin: 20,
			items: [{
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
						xtype: 'datetimefield',
						name: 'startTime',
						flex: 1,
						fieldLabel: _('execute time'),
					}]
				}, {
					xtype: 'fieldcontainer',
					layout: 'hbox',
					margin: '0 15 15 15',
					items: [{
						xtype: 'textfield',
						fieldLabel: _('remark'),
						flex: 1,
						name: 'taskDesc',
					}, {
						xtype: 'panel',
						flex: 1
					}]
				}, {
					xtype: 'fieldcontainer',
					margin: '0 15 15 15',
					defaultType: 'checkbox',
					layout: 'hbox',
					items: [{
						fieldLabel: _('whether select from fileStore'),
						boxLabel: _('Yes'),
						name: 'selectSofts',
						flex: 1,
						inputValue: 'true',
						itemId: 'whetherChooseFromFileStoreYes',
						listeners: {
							change: 'onChooseSelectChg'
						}
					}]
				}, {
					xtype: 'fieldcontainer',
					hidden: true,
					itemId: 'container0',
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
							text: '选择文件...',
							handler: 'chooseFromSoft'
						}]
					}, {
						fieldLabel: '已选文件',
						xtype: 'textarea',
						name: 'selectedSoft',
					}]
				}, {
					xtype: 'textfield',
					fieldLabel: '任务所关联的单板升级文件列表',
					itemId: 'versionStorage',
					hidden: true,
					name: 'cardUpgradeSoftIds',
					flex: 1
				}, {
					xtype: 'textfield',
					fieldLabel: '任务所关联的单板列表',
					itemId: 'NEstorage',
					hidden: true,
					name: 'cardIds',
					flex: 1
				}, {
					xtype: 'fieldcontainer',
					margin: 0,
					///hidden: true,
					itemId: 'container1',
					layout: 'fit',
					items: [{
						xtype: 'fieldcontainer',
						layout: 'hbox',
						//itemId: 'container1',
						margin: '0 15 15 15',
						items: [{
							xtype: 'combo',
							editable: false,
							fieldLabel: _('neSeries'),
							name: 'categoryid',
							flex: 1,
							emptyText: _('please choose'),
							queryMode: 'local',
							store: {
								type: 'neSeries'
							},
							displayField: 'categoryid',
							listeners: {
								change: 'showNeType',
								afterrender: 'firstSelect'
							}
						}, {
							xtype: 'combo',
							editable: false,
							fieldLabel: _('neType'),
							name: 'neTypeId',
							flex: 1,
							emptyText: _('please choose'),
							queryMode: 'local',
							store: {
								type: 'neType'
							},
							displayField: 'netypename',
							valueField: 'netypeid',
							listeners: {
								change: 'showCardType',
								focus: 'selectSeriesFirst',
							}
						}]
					}, {
						xtype: 'fieldcontainer',
						layout: 'hbox',
						//itemId: 'container2',
						margin: '0 15 15 15',
						items: [{
							xtype: 'combo',
							editable: false,
							fieldLabel: _('cardType'),
							// hidden: true,
							name: 'cardTypeId',
							flex: 1,
							queryMode: 'local',
							store: {
								type: 'veneer'
							},
							emptyText: _('please choose'),
							displayField: 'cardTypeName',
							valueField: 'cardTypeId',
							listeners: {
								change: 'showFileType',

							}

						}, {
							xtype: 'filefield',
							itemId: 'path',
							flex: 1,
							//hidden: true,
							fieldLabel: _('path'),
							name: 'path'
						}]
					}, {
						xtype: 'fieldcontainer',
						layout: 'hbox',
						margin: '0 15 15 15',
						items: [{
							xtype: 'combo',
							editable: false,
							fieldLabel: _('fileType'),
							queryMode: 'local',
							name: 'fileTypeId',
							flex: 1,
							store: {
								type: 'fileType'
							},
							emptyText: _('please choose'),
							displayField: 'fileTypeName',
							valueField: 'fileTypeId',
							listeners: {
								afterrender: 'firstSoftSelect'
							}
						}, {
							xtype: 'panel',
							flex: 1
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
							text: _('Choose Card') + '...',
							handler: 'onChooseNe'
						}]
					}, {
						fieldLabel: '已选单板',
						xtype: 'textarea',
						name: 'selectedNe',
					}]
				}, {
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
				},

				{
					xtype: 'fieldcontainer',
					margin: '0 15 15 15',
					defaultType: 'checkbox',
					layout: 'hbox',
					items: [{
						// fieldLabel: '<font color="red">' + _('whether Active') + '</font>',
						fieldLabel: _('whether Active'),
						boxLabel: _('Yes'),
						name: 'activate',
						inputValue: 'yes',
						itemId: 'whetherActiveRadio1'
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