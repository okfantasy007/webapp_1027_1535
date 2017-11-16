Ext.define('Admin.view.configcenter.view.equipmentUpdate.file.equipment.equipmentUpdateFileMainFormWindow', {
	extend: 'Ext.container.Container',
	xtype: 'equipmentUpdateFileMainFormWindow',
	items: [{
		xtype: 'form',
		itemId: 'editForm',
		levelId: 0,
		items: [{
			xtype: 'fieldset',
			title: _("Update Nefile Remark"),
			defaults: {
				anchor: '100%',
				padding: '20 10 10 10'
			},
			margin: 20,
			items: [
				{
					xtype: 'textfield',
					fieldLabel: _('neType'),
					disabled: true,
					name: 'neTypeName',
				}, {
					xtype: 'textfield',
					disabled: true,
					fieldLabel: _('fileType'),
					name: 'fileTypeName'
				},
				{
					xtype: 'textfield',
					disabled: true,
					fieldLabel: _('fileversion'),
					name: 'fileVersion',

				},
				{
					xtype: 'textareafield',
					fieldLabel: _('remark'),
					itemId: 'discription',
					name: 'remark',
				}]

		}],
		buttons: [{
			text: _('Ok'),
			handler: 'onEditSub'
		}, {
			text: _('Cancle'),
			handler: 'onFormCancle'
		}]
	}]
});
