Ext.define('Admin.view.alarms.alarmnotify.alarmNotifySmsFormView', {
    extend:'Ext.window.Window',
	xtype:'alarmNotifySmsFormView',
	
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
	
	onPhoneAdd:function(){
		
		var form = this.getView().down('form');
		
		if(!form.isValid()){
			 Ext.Msg.alert(_('Tips'), _('Input Legal PhoneNum'));
			 return;
		}
		var phoneNum =form.down('textfield').value;
		
		var grid= form.down('grid');

		var rec = {'phoneNum': phoneNum};
		grid.getStore().insert(grid.store.getCount(),rec);
	},
	onPhoneDelete:function(){
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
			var phone='';
			for(var i=0;i<store.data.length;i++){
				var record = store.getAt(i); 
				var phoneNum = record.get('phoneNum');
				phone=phone+phoneNum+',';
				}
				phone=phone.substring(0,phone.length-1);
					 
			    listView.down('form').getForm().findField('phone').setValue(phone);
			
            this.getView().close();

     
	}
	
    },

	items: [
    {
          reference: 'phoneEditForm',
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
				title: _('Tel Info'),
				width:400,
					items:[
				
                {
                    xtype: 'textfield',
                    fieldLabel: _('telephone Number'),
                    name: 'phoneNum',
					allowBlank:false,
					regex: /^[1]\d{10}$/
                },
               	{
  	           	 xtype:'grid',
				 height: 300,
				 header:false,
				 width:'100%',
				 border:true,
				 store:{
                        fields: [{
                            name: 'phoneNum',
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
                	    handler:'onPhoneAdd'
                		
                	},{
                		text:_('Delete'),
                		tooltip:_('Delete'),
						iconCls:'x-fa fa-trash',
                	    handler:'onPhoneDelete'
                	} 					
                ],
				 columns: [
				{ text:_('telephone Number'), dataIndex: 'phoneNum', width:'100%',menuDisabled:true },
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
