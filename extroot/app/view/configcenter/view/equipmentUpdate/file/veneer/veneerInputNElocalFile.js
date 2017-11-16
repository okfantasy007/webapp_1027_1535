Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.veneer.veneerInputNElocalFile', {
	extend: 'Ext.container.Container',
	xtype: 'veneerInputNElocalFile',
	items: [{
		xtype: 'form',
		itemId: 'veneerInputNElocalFileForm',
		levelId: 0,
		items: [{
			xtype: 'fieldset',
			title: _('import localFile'),
			defaults: {
				anchor: '100%',
				padding: '20 10 10 10'
			},
			margin: 20,
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
						change: 'showCardType',
						focus: 'selectSeriesFirst',

					}
				}, {
					xtype: 'combo',
					editable: false,
					fieldLabel: _('cardType'),
					queryMode: 'local',
					store: { type: 'veneer' },
					emptyText: _('please choose'),
					displayField: 'cardTypeName',
					name: 'cardTypeId',
					valueField: 'cardTypeId',
				}, {
					xtype: 'combo',
					editable: false,
					fieldLabel: _('fileType'),
					store: { type: 'fileType' },
					emptyText: _('please choose'),
					displayField: 'fileTypeName',
					name: 'fileTypeId',
					valueField: 'fileTypeId',
					value: 9
				}, {
					xtype: 'fileuploadfield',
					name: 'path',
					fieldLabel: _('file'),
					msgTarget: 'side',

					buttonText: _('choose file...'),
				}, {
					xtype: 'textfield',
					fieldLabel: _('remark'),
					name: 'remark',

				}
			]
		}],
		buttons: [{
			text: _('Add'),
			handler: 'onVeneerLocalFormSubmit'
		}, {
			text: _('Cancle'),
			handler: 'onFormCancle'
		}]
	}]
});
