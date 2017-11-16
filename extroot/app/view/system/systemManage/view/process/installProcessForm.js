Ext.define('Admin.view.system.systemManage.view.process.installProcessForm', {
	extend: 'Admin.view.base.CardForm',
    xtype: 'installProcessForm',
    requires: [
        'Admin.view.system.systemManage.controller.process.installProcessForm'
    ],
    controller: 'installProcessForm',
    itemId: 'installProcessForm',
    items: [
    	{
            xtype: 'form',
            title:  _('Install'),
            bodyPadding: 7,
            layout: 'anchor',
            autoScroll: true,
            items: [
        	 {
     			xtype: 'container',
     	        labelWidth: 60,
     	        layout: 'hbox',
     		    items: [
     		    	{
     	               fieldLabel:  _('IP Adress'),
     	               xtype: 'textfield',
     	               padding: '5px',
     			       name: "ip",
     			       allowBlank: false,
     			       margin: 10,
     			       vtype: 'IPAddress',
     	            },
    	            {
 		     		   xtype: 'button',
 		     		   text:_('Add'),
 		     		   margin: 10,
 		     		   iconCls:'x-fa fa-plus',
 		     		   padding: '5px',
 		     		   handler: 'onQueryServer' 
 		     	    },
 		     	    {
		 			   xtype: 'fileuploadfield',
		 			   name: 'upload_file',
		 			   itemId: 'upload',
		 			   margin: 10,
		 			   fieldLabel: _('Upload File'),
		 			   msgTarget: 'side',
		 			   buttonText:  _('choose file...'),
		 			   editable: false,
		    	       allowBlank: false,
		 		    } 
                ]
     		}
          ],
          buttons: [
            	{
                  text:  _('Canceled'),
                  handler: 'onCancel',
              },
              {
                  text: _('Ok'),
                  handler: 'onInstallProcess',
              }
          ]
      }
    ]          
});