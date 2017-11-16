Ext.define('Admin.view.system.systemManage.view.server.addServerForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'addServerForm',
    requires: [
        'Admin.view.system.systemManage.controller.server.addServerForm'
    ],
    controller: 'addServerForm',
    itemId: 'addServerForm',
    margin: 10,
    items: [
    	{
            xtype: 'form',
            title: _('Add Servers'),
            bodyPadding: 7,
            autoScroll: true,
            items: [
            	{
		            fieldLabel: _('Host Name'),
		            xtype: 'textfield',
		            padding: '5px',
			        name: "host_name",
			        allowBlank: false,
			        maxLength: 20,
			        maxLengthText: _('The server name cannot exceed 20 characters'),

	            }, {
	               fieldLabel: _('IP Adress'),
	               xtype: 'textfield',
	               padding: '5px',
			       name: "ip",
			       allowBlank: false,
			       vtype: 'IPAddress'
	            }, {
	               fieldLabel: _('Login User'),
	               xtype: 'textfield',
	               padding: '5px',
	               name: 'login_user',
				   allowBlank: false,
				   maxLength: 20,
				   maxLengthText: _('The user name cannot exceed 20 characters'),
	            }, {
	               xtype: 'textfield',
				   fieldLabel: _('Login Password'),
				   name: 'password',
				   inputType:'password',
				   padding: '5px',
				   allowBlank: false,
				   maxLength: 20,
				   maxLengthText: _('Passwords cannot exceed 20 characters'),
	            }
           ]
        }
    ],
    fbar: [
        {
        	text: _('Cancel'),
            handler: 'onCancel',
        },
        {
        	text: _('Ok'),
            handler: 'onSave',
        }
    ]
});
