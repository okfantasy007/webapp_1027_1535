Ext.define('Admin.view.alarms.alarmfilter.alarmTypeFilterView', {
    extend:'Ext.panel.Panel',
	xtype:'alarmTypeFilterView',
	requires: [
        'Admin.view.base.PagedGrid',
		'Admin.view.alarms.alarmfilter.alarmTypeQueryView'
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
                    url: '/alarm/alarmResource/getAlarmTypeFilter',
				
					actionMethods : { 
					 read   : 'POST',
					}, 
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
	
		
        }
    },

    controller: {  
		onDelete:function(){
			
			var targetGrid =  this.getView().down('grid');
			var records = targetGrid.getSelectionModel().getSelection();
			var len =records.length;
			Ext.Msg.confirm(_("Confirm"), _("deleteFromDB"), function (btn) {
			if(btn=='yes'){
			
			for(var i=0;i<len;i++){
			var	record = records[i];
			var alarmId = record.get('alarmId');
			var alarmUrl = record.get('alarmUrl');
			var alarmLevel = record.get('alarmLevel');
			var isUsed = record.get('isUsed');
			var isCorbaFilter = record.get('isCorbaFilter');
			var isSaved = record.get('isSaved');
			
			Ext.Ajax.request({
                                    url: 'alarm/alarmResource/deleteAlarmTypeFilter',
                                    method: 'post',
                                    params: {
                                        alarmId: alarmId,
										alarmUrl:alarmUrl,
										alarmLevel:alarmLevel,
										isUsed:isUsed,
										isCorbaFilter:isCorbaFilter,
										isSaved:isSaved
                                    },
                                    success: function(response) {
                                        if (response.responseText) {
										targetGrid.getStore().reload();
                                            
                                        }

                                    }
                                });	
					
				
			}
			
			}
			});	
			
		
		},
	
		onQuery:function(){
			//var creater =APP.user;
			var targetGrid =  this.getView().down('grid');
			var keywords = this.getView().down('textfield').getValue();
            targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAlarmTypeFilter';
            targetGrid.getStore().proxy.extraParams ={keywords:keywords};
            targetGrid.getStore().reload();
		},
	
		onRemoveClick:function(view, recIndex, cellIndex, item, e, record){
			var targetGrid =  this.getView().down('grid');
			var alarmId = record.get('alarmId');
			var alarmUrl = record.get('alarmUrl');
			var alarmLevel = record.get('alarmLevel');
			var isUsed = record.get('isUsed');
			var isCorbaFilter = record.get('isCorbaFilter');
			var isSaved = record.get('isSaved');
			//var json= "{"+"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+","  +"alarmLevel :"+alarmLevel+"}";
			
			Ext.Msg.confirm(_("Confirm"), _("deleteFromDB"), function (btn) {
			if(btn=='yes'){
				Ext.Ajax.request({
                                    url: 'alarm/alarmResource/deleteAlarmTypeFilter',
                                    method: 'post',
                                    params: {
                                        alarmId: alarmId,
										alarmUrl:alarmUrl,
										alarmLevel:alarmLevel,
										isUsed:isUsed,
										isCorbaFilter:isCorbaFilter,
										isSaved:isSaved
                                    },
                                    success: function(response) {

                                        if (response.responseText) {
            
                                            targetGrid.getStore().reload();
                                        }

                                    }
                                });		
				 }
				
			});
			
			
			
			
		},
	
        onAdd: function() {
			
	      var alarmTypeQueryView =  this.getView().down('alarmTypeQueryView');
	      this.getView().setActiveItem(alarmTypeQueryView);
		  alarmTypeQueryView.reset();
		  var pageGrid =alarmTypeQueryView.down('PagedGrid');
		  pageGrid.getSelectionModel().clearSelections();
		  pageGrid.getView().refresh();
		  
        },
		onSave:function(){
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
				var alarmId = "'"+record.get('alarmId')+"'";
				var alarmUrl = "'"+record.get('alarmUrl')+"'";
				var alarmLocation = "'"+record.get('alarmLocation')+"'";
				
			alarmjson= alarmjson +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+"," +"alarmLocation :"+alarmLocation+"," +"alarmLevel :"+alarmLevel+"," +"isUsed :"+isUsed+","+" isCorbaFilter:"+isCorbaFilter +","+" isSaved:"+isSaved+"},"
				
			}
			alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";

		
			Ext.Ajax.request({
							url : 'alarm/alarmResource/modifyAlarmTypeFilter',
							method:'post',
							params:{condition:alarmjson},
							success : function(response) {			
					
							var r =  Ext.decode(response.responseText);
							Ext.Msg.alert(_('Success'), _('save successfully'));
							targetGrid.getStore().reload();
							
								}
		});
			
		},

        onRefresh: function() {
			//var creater =APP.user;
			var targetGrid =  this.getView().down('grid');
			var keywords = this.getView().down('textfield').getValue();
            targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAlarmTypeFilter';
            targetGrid.getStore().proxy.extraParams ={keywords:keywords};
            targetGrid.getStore().reload();
        },

        
        onReset: function() {
           var targetGrid =  this.getView().down('grid');
		   this.getView().down('textfield').reset();
			targetGrid.getStore().reload();
        },

       
    },

	items: [
    {
        title: _('Alarm Type Filter'),
        header:true,
		margin:10,
        iconCls: 'x-fa fa-circle-o',
		xtype:'grid',
		selType: 'checkboxmodel',
		reference:'alarmLevelFilterGrid',
        bind: {
            store: '{levelFilterlist_remote}',
        },
        // grid显示字段
        columns: [
			{ text: _('Name'),width:300, dataIndex: 'strName',flex:1,menuDisabled:true},
            { text: _('Description'), width:250,dataIndex: 'desc',flex:3,menuDisabled:true},
			{ text: _('Alarm Level'),dataIndex: 'alarmLevel',hidden:true},
			{ text: _('Alarm ID'),dataIndex: 'alarmId',hidden:true},
			{ text: _('Alarm URL'),dataIndex: 'alarmUrl',hidden:true},
			{ text: _('Alarm Location'),dataIndex: 'alarmLocation',hidden:true},
			{ text: _('enabled'), dataIndex: 'isUsed', xtype: 'checkcolumn',menuDisabled:true},
			{ text: _('Corba Filter'), dataIndex: 'isCorbaFilter', xtype: 'checkcolumn',menuDisabled:true},
			{ text: _('Save History'), dataIndex: 'isSaved', xtype: 'checkcolumn',menuDisabled:true},
			{ xtype: 'actioncolumn',width:50, text: _('Delete'),menuDisabled:true,items: [{ iconCls: 'x-fa fa-trash-o',  tooltip: 'Delete',  handler: 'onRemoveClick' }]
			
			},
			
        ],

      // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
               {
                    text: _('Add'),
                    iconCls:'x-fa fa-plus',
                    handler: 'onAdd'
                },
                   {
                    text: _('Save'),
                    iconCls:'x-fa fa-save',
                    handler: 'onSave'
                },
				 {
                    text: _('Delete'),
                    iconCls:'x-fa fa-trash',
                    handler: 'onDelete'
                },
                {
                    text: _('Reset'),
                    iconCls:'x-fa fa-undo',
                    handler: 'onReset',
                                   
                },
				 {
                   xtype: 'textfield',
				    fieldLabel: _('Keyword'),
					labelAlign : 'right',
					labelWidth : 50,
					name: 'keyWords'
                                   
                },
				 {
                    text: _('Query'),
                    iconCls: 'x-fa fa-search',
                    handler: 'onQuery',
                                   
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
	{
		xtype:'alarmTypeQueryView',
		margin:10
	
	}

		]


});
