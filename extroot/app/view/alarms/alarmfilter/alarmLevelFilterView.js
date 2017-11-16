Ext.define('Admin.view.alarms.alarmfilter.alarmLevelFilterView', {
    extend:'Ext.panel.Panel',
	xtype:'alarmLevelFilterView',
	
	 requires: [
        'Admin.view.base.PagedGrid'
        // 'Admin.vtype.IPAddress'
    ],
	layout:'card',
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            levelFilterlist_remote: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAlarmLevelFilter',
					actionMethods : { 
					 read   : 'POST',
					},  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            }
        }
    },

    controller: {  
	
        onSave: function() {
           var targetGrid =  this.getView().down('grid');
		   var store = targetGrid.getStore();
          
		   var len =store.getModifiedRecords().length;
		   if(len==0){
			   return;
		   }
		    var alarmjson="[" ;
			for(var i=0;i<len;i++){
			alarmjson= alarmjson+'{';
				var record = store.getModifiedRecords()[i]; 
				var isUsed = "'"+record.get('isUsed')+"'";
				var isCorbaFilter ="'"+record.get('isCorbaFilter')+"'";
				var isSaved ="'"+record.get('isSaved')+"'";
				var alarmLevel ="'"+record.get('alarmLevel')+"'";
			alarmjson= alarmjson +"alarmLevel :"+alarmLevel+"," +"isUsed :"+isUsed+","+" isCorbaFilter:"+isCorbaFilter +","+" isSaved:"+isSaved+"},"
				
			}
			alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";
		
			Ext.Ajax.request({
							url : 'alarm/alarmResource/modifyAlarmLevelFilter',
							method:'post',
							params:{condition:alarmjson},
							success : function(response) {
							var r =  Ext.decode(response.responseText);
							Ext.Msg.alert(_('Success'), _('save successfully'));
							targetGrid.getStore().reload();
							
								}
		});
        },
		onReset:function(){
			
			var targetGrid =  this.getView().down('grid');
			targetGrid.getStore().reload();
			
			
		},

        onRefresh: function() {
			
           var targetGrid =  this.getView().down('grid');
			targetGrid.getStore().reload();
        }

     
       
    },

	items: [
    {
        title: _('Alarm Level Filter'),
        header:true,
		margin:10,
		iconCls: 'x-fa fa-circle-o',
		xtype:'grid',
		reference:'alarmLevelFilterGrid',
        bind: {
            store: '{levelFilterlist_remote}',
        },
        // grid显示字段
        columns: [
			{ text: _('Name'), dataIndex: 'strName',flex:1,menuDisabled:true},
			{ text: _('Alarm Level'), width:300,dataIndex: 'alarmLevel',hidden:true},
            { text: _('Description'), width:300,dataIndex: 'desc',flex:3,menuDisabled:true},
			{ text: _('enabled'), dataIndex: 'isUsed', xtype: 'checkcolumn' ,menuDisabled:true},
			{ text: _('Corba Filter'), dataIndex: 'isCorbaFilter', xtype: 'checkcolumn',menuDisabled:true},
			{ text: _('Save History'), dataIndex: 'isSaved', xtype: 'checkcolumn',menuDisabled:true}
			
        ],

      // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                 {
                    text: _('Save'),
                    iconCls:'x-fa fa-save',
                    handler: 'onSave'
                },
                {
                    text: _('Reset'),
                    iconCls:'x-fa fa-undo',
                    handler: 'onReset',
                                   
                },
				'->',
                {
                    text: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onRefresh'
                },
                
            ]
        }]
		 
	},

		]


});
