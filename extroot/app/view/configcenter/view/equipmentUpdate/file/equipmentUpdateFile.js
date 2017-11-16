Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.equipmentUpdateFile', {
	extend: 'Ext.container.Container',
	xtype: 'equipmentUpdateFile',
	requires: [
		'Admin.view.configcenter.controller.equipmentUpdateFileController',
		'Admin.view.configcenter.controller.equipmentUpdateFileTab2Controller',
		'Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentUpdateFileVisible',
		'Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentInputNEBackupFile',
		'Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentUpdateFileMainFormWindow',
		'Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentInputNElocalFile',
		'Admin.view.configcenter.view.equipmentUpdate.file.equipment.backupFileChooseWindow',
		'Admin.view.configcenter.view.equipmentUpdate.file.veneer.veneerInputNEBackupFile',
		'Admin.view.configcenter.view.equipmentUpdate.file.veneer.visiblePanel',
	],
	cls: 'shadow',
	items: [{
		xtype: 'tabpanel',
		layout: 'fit',
		bodyPadding: 10,
		items: [{
			title: _('NeSoft'),
			xtype: 'container',
			controller: 'equipmentUpdateFileController',
			layout: 'card',
			viewModel: {
				data: {
					btns: []
				}
			},
			items: [{

				xtype: 'equipmentUpdateFileVisible',
				itemId: 'equipmentUpdateFileVisible'
			},
			{
				xtype: 'equipmentInputNEBackupFile',
				itemId: 'inputNEBackupFile'
			}, {
				xtype: 'equipmentInputNElocalFile',
				itemId: 'localWindow',
			}, {
				xtype: 'equipmentUpdateFileMainFormWindow',
				itemId: 'equipmentUpdateFileMainFormWindow',
			}, {
				xtype: 'backupFileChooseWindow',
				itemId: 'backupFileChooseWindow',
			}

			]
		}, {
			title: _('CardSoft'),
			xtype: 'container',
			itemId: 'veneerContainer',
			controller: 'equipmentUpdateFileTab2Controller',
			layout: 'card',
			viewModel: {
				data: {
					btns: []
				}
			},
			items: [{
				xtype: 'visiblePanel',
				itemId: 'visiblePanel'
			}, {
				xtype: 'veneerInputNEBackupFile',
				itemId: 'veneerInputNEBackupFile'
			}, {
				xtype: 'veneerInputNElocalFile',
				itemId: 'veneerLocalWindow',
			}, {
				xtype: 'veneerMainFormWindow',
				itemId: 'veneerMainFormWindow',
			}, {
				xtype: 'backupFileChoose',
				itemId: 'backupFileChooseWindow',
			}
			]
		}]
	}]

});










