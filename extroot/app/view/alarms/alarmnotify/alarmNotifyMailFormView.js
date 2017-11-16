Ext.define('Admin.view.alarms.alarmnotify.alarmNotifyMailFormView', {
    extend:'Ext.window.Window',
	xtype:'alarmNotifyMailFormView',
	
	 requires: [
       // 'Admin.view.base.PagedGrid'
    ],
    title: _('templateEdit'),
    closable: true,
    modal:true,
    border: false,  
    closeAction: 'hide',
    width: 400,
    height: 500,
	resizable:false,
    cls: 'shadow',
    viewModel: {
      
    },

    controller: {  
	
	onMailAdd:function(){
		
		var form = this.getView().down('form');
		if(!form.isValid()){
			 Ext.Msg.alert(_('Tips'), _('Input Legal MailAddress'));
			 return;
		}
		var mailAddress =form.down('textfield').value;
		
		var grid= form.down('grid');

		var rec = {'mailAddress': mailAddress};
		grid.getStore().insert(grid.store.getCount(),rec);
	},
	onMailDelete:function(){
			var form = this.getView().down('form');
			var grid = form.down('grid');
			var records = grid.getSelectionModel().getSelection();
			 for(var i=0 ;i<records.length;i++){
             grid.getStore().remove(records[i]);
            }
	},
	onOK:function(){
                  
					
			var listView = this.getView().initialConfig.alarmNotifyListGridView;
					 
			var grid= this.getView().down('grid');
			var store =grid.getStore();
			var mail='';
			for(var i=0;i<store.data.length;i++){
				var record = store.getAt(i); 
				var mailAddress = record.get('mailAddress');
				mail=mail+mailAddress+',';
				}
				mail=mail.substring(0,mail.length-1);
					 
			    listView.down('form').getForm().findField('mailAddress').setValue(mail);
			
            this.getView().close();

     
	}
	
    },

	items: [
    {
          reference: 'mailEditForm',
          header: false,
          
          layout: {
                 type: 'table',
                 columns: 1,
             },
		  fieldDefaults : {
		  textAlign: "left",
		  labelAlign : "left",
		  //margin: '0 0 15 0',
		},
		xtype:'form',
		
		 items: [
				{
				xtype: 'fieldset',
				title: _('Mail Info'),
				width:400,
					items:[
				
                {
				 xtype:'textfield',
				 allowBlank:false,
	        	 fieldLabel: _('Email Address'),
				 vtype:'email',
		         name: 'mailAddress'
	        },
               	{
  	           	 xtype:'grid',
				 height: 300,
				 header:false,
				 width:'100%',
				 border:true,
				 store:{
                        fields: [{
                            name: 'mailAddress',
                            type: 'string'
                        }
						],
                        data: []
                    },
				 tbar:[ 
            	{  
                		text:_('Add'),
                		tooltip:_('Add'),
						iconCls:'x-fa fa-plus',
                	    handler:'onMailAdd'
                		
                	},{
                		text:_('Delete'),
                		tooltip:_('Delete'),
						iconCls:'x-fa fa-trash',
                	    handler:'onMailDelete'
                	} 					
                ],
				 columns: [
				{ text:_('Email Address'), dataIndex: 'mailAddress', width:'100%',menuDisabled:true},
				], 
				
  	        }
			]
				}
				]
				}],
		      buttons: [{
                    xtype: "button",
                    text: _("Ok"),
                    handler:'onOK'
                },
                {
                    xtype: "button",
                    text: _("Cancel"),
                    handler: function() {
                      this.up('window').close();
                    }
                }]


});
