Ext.define('Admin.view.system.systemManage.view.process.upgradeForm', {
    extend: 'Admin.view.base.CardForm',
    xtype: 'upgradeForm',
    requires: [
        'Admin.view.system.systemManage.controller.process.upgradeForm'
    ],
    controller: 'upgradeForm',
    itemId: 'upgradeForm',
    margin: 10,
    items: [
    {
        xtype: 'form',
        title: _('Upgrade System'),
        bodyPadding: 7,
        layout: 'anchor',
        autoScroll: true,
        items: [
        	 {
				xtype: 'fileuploadfield',
				name: 'upload_file',
				itemId: 'upload',
				fieldLabel: _('Upload File'),
				msgTarget: 'side',
				buttonText: _('choose file...'),
				editable: false,
   	            allowBlank: false,
			 } 
        ],
        buttons: [
        	{
                text: _('Cancel'),
                handler: 'onCancel'
            },
            {
                text: _('Ok'),
                handler: 'onSubmit'
            }
       ]
    }]
});
