Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentInputNElocalFile', {
	extend: 'Ext.container.Container',
	xtype: 'equipmentInputNElocalFile',
	items: [{
		xtype: 'form',
		itemId: 'inputNElocalFileForm',
		levelId: 0,
		items: [{
			xtype: 'fieldset',
			title: _('import localFile'),
			defaults: {
				anchor: '100%',
				padding: '20 10 10 10'
			},
			margin: "00 20 20 20",
			items: [
				{
					xtype: 'combo',
					editable: false,
					fieldLabel: _('neSeries'),
					name: 'categoryid',
					flex: 1,
					emptyText: _('please choose'),
					queryMode: 'local',
					store: { type: 'neSeries' },
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
					store: { type: 'neType' },
					displayField: 'netypename',
					valueField: 'netypeid',
					listeners: {
						focus: 'selectSeriesFirst'
					}
				}, {
					xtype: 'filefield',
					name: 'path',
					fieldLabel: _('file'),
					msgTarget: 'side',
					buttonText: _('choose file...'),
				},
				{
					xtype: 'combo',
					editable: false,
					fieldLabel: _('fileType'),
					name: 'fileTypeId',
					queryMode: 'local',
					store: { type: 'fileType' },
					emptyText: _('please choose'),
					displayField: 'fileTypeName',
					valueField: 'fileTypeId',
					listeners: {
						afterrender: 'firstSoftSelect',

					}
				},
				{
					xtype: 'textareafield',
					fieldLabel: _('remark'),
					name: 'remark',
				}]
		}],
		buttons: [{
			text: _('Add'),
			handler: 'onLocalFormSubmit'
		}, {
			text: _('Cancle'),
			handler: 'onFormCancle'
		}]
	}]
});
