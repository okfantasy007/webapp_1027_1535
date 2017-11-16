Ext.define('Admin.view.alarms.alarmfilter.alarmTimeFilterView', {
    extend:'Ext.panel.Panel',
	xtype:'alarmTimeFilterView',
	
	 requires: [
        'Admin.view.base.PagedGrid',
		'Admin.view.alarms.alarmfilter.alarmTimeQueryView',
        // 'Admin.vtype.IPAddress'
    ],
	layout:'card',
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            TimeFilterlist_remote: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAlarmTimeFilter',
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
		
		onQuery:function(){
			
			var targetGrid =  this.getView().down('grid');
			var keywords = this.getView().down('textfield').getValue();
            targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAlarmTimeFilter';
            targetGrid.getStore().proxy.extraParams ={keywords:keywords};
            targetGrid.getStore().reload();
			
		},
		onRemoveClick:function(view, recIndex, cellIndex, item, e, record){
			var targetGrid =  this.getView().down('grid');
			var ruleId = record.get('ruleId');
				Ext.Msg.confirm(_("Confirm"), _("deleteFromDB"), function (btn) {
			if(btn=='yes'){
						Ext.Ajax.request({
                                    url: 'alarm/alarmResource/deleteAlarmTimeFilter',
                                    method: 'post',
                                    params: {
                                        ruleId: ruleId,
                                    },
                                    success: function(response) {
                                        if (response.responseText) {
                                            //alert('success');
                                            targetGrid.getStore().reload();
                                        }

                                    }
                                });	
				
			}
			});
			
	
			
		},
	
        onAdd: function() {
         
		   var alarmTimeQueryView =  this.getView().down('alarmTimeQueryView');
		   var alarmTime_form_1 =  this.getView().down('alarmTimeQueryView').down('form');
		   var alarmTime_grid= alarmTimeQueryView.down('panel').nextSibling().down('grid');
		   var alarmTime_form_2 =  alarmTimeQueryView.down('panel').nextSibling().nextSibling();
		   alarmTime_form_1.reset();
		   alarmTime_grid.getStore().removeAll();
		   alarmTime_form_2.reset();
		  
			this.getView().setActiveItem(alarmTimeQueryView);
			
		  
		  
		  
        },
		onModify:function(){
			var targetGrid =  this.getView().down('grid');
			var store = targetGrid.getStore();
			 var alarmTimeQueryView =  this.getView().down('alarmTimeQueryView');
			var alarmTime_form_2 =  alarmTimeQueryView.down('panel').nextSibling().nextSibling();
			var alarmTime_grid= alarmTimeQueryView.down('panel').nextSibling().down('grid');
			var records =targetGrid.getSelectionModel().getSelection()
			var len = targetGrid.getSelectionModel().getSelection().length;
			if(len==0)return;
			
			var rec =records[0];
			alarmTime_form_2.getForm().loadRecord(records[0]);
			var ruleId=rec.get('ruleId');
			var target = rec.get('alarmSourceMode');
			if('0'==target){
			
				var grid  =alarmTimeQueryView.down('panel').nextSibling().down('grid');
				var panel = alarmTimeQueryView.down('form').nextSibling();
				var radio_1 = alarmTimeQueryView.down('form').down('radiofield');
				var radio_2 = alarmTimeQueryView.down('form').down('radiofield').nextSibling();
				var form = alarmTimeQueryView.down('form'); 
				radio_1.setValue(false);
				radio_2.setValue(true);
				panel.setDisabled(false);
				grid.getStore().proxy.url = 'alarm/alarmResource/getTimeFilterResource';
				grid.getStore().proxy.extraParams = {condition:ruleId};
				grid.getStore().reload();
			
			}else{
					 
			var grid  =alarmTimeQueryView.down('panel').nextSibling().down('grid');
			var panel = alarmTimeQueryView.down('form').nextSibling();
			var radio_1 = alarmTimeQueryView.down('form').down('radiofield');
			var radio_2 = alarmTimeQueryView.down('form').down('radiofield').nextSibling();
			radio_2.setValue(false);
			radio_1.setValue(true);
			panel.setDisabled(true);
			grid.getStore().removeAll();
			grid.getView().refresh();	
			
			}
			
		    this.getView().setActiveItem(alarmTimeQueryView);
								
			
		   
		   
		   
		   
		},
		onSave:function(){
		   var targetGrid =  this.getView().down('grid');

		   var store = targetGrid.getStore();
           var alarmjson="[" ;

		   var len =store.getModifiedRecords().length;
		   if(len==0){
			  alarmjson="[]"; 
		   }else{
			 for(var i=0;i<len;i++){
			alarmjson= alarmjson+'{';
				var record = store.getModifiedRecords()[i]; 
				var filterEnable = "'"+record.get('filterEnable')+"'";
				var isCorbaFilter ="'"+record.get('isCorbaFilter')+"'";
				var isSaved ="'"+record.get('isSaved')+"'";
				var ruleId ="'"+record.get('ruleId')+"'";
				var days ="'"+record.get('days')+"'";
				var startTime ="'"+record.get('startTime')+"'";
				var endTime ="'"+record.get('endTime')+"'";
				var comments ="'"+record.get('comments')+"'";
				var alarmSourceMode ="'"+record.get('alarmSourceMode')+"'";
				

			alarmjson= alarmjson +"days :"+days+","+"startTime :"+startTime+","+"endTime :"+endTime+","+"comments :"+comments+","+"alarmSourceMode :"+alarmSourceMode+","+"ruleId :"+ruleId+","+"filterEnable :"+filterEnable+","+" isCorbaFilter:"+isCorbaFilter +","+" isSaved:"+isSaved+"},"
				
			}
			alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";  
		   }
			
		
			Ext.Ajax.request({
							url : 'alarm/alarmResource/saveAlarmTimeFilter',
							method:'post',
							params:{condition:alarmjson},
							success : function(response) {
							
							var r =  Ext.decode(response.responseText);
							Ext.Msg.alert(_('Success'), r.msg);
							targetGrid.getStore().reload();
							
								}
		});
			
			
		},
		onDelete:function(){
			
			var targetGrid =  this.getView().down('grid');
			
			var records = targetGrid.getSelectionModel().getSelection();
			var len =records.length;
			Ext.Msg.confirm(_("Confirm"), _("deleteFromDB"), function (btn) {
			if(btn=='yes'){
				for(var i=0;i<len;i++){
					var	record = records[i];
					var ruleId = record.get('ruleId');
						Ext.Ajax.request({
                                    url: 'alarm/alarmResource/deleteAlarmTimeFilter',
                                    method: 'post',
                                    params: {
                                        ruleId: ruleId,
                                    },
                                    success: function(response) {
                                        if (response.responseText) {
                                            //alert('success');
                                            targetGrid.getStore().reload();
                                        }

                                    }
                                });	
					
				}
				
			}
			});
			
			
			
		},

        onRefresh: function() {
			
           var targetGrid =  this.getView().down('grid');
		   var keywords = this.getView().down('textfield').getValue();
            targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAlarmTimeFilter';
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
        title: _('Alarm Time Filter'),
		margin:10,
        header:true,
        iconCls: 'x-fa fa-circle-o',
		xtype:'grid',
		selType: 'checkboxmodel',
		reference:'alarmLevelFilterGrid',
        bind: {
            store: '{TimeFilterlist_remote}',
        },
		
        // grid显示字段
        columns: [
			{ text: _('Shielding condition'), dataIndex: 'condition',flex:2,menuDisabled:true},
			{ text: 'ruleId', dataIndex: 'ruleId',hidden:true},
			{ text: 'alarmSourceMode', dataIndex: 'alarmSourceMode',hidden:true},
			{ text: 'one', dataIndex: 'one',hidden:true},
			{ text: 'two', dataIndex: 'two',hidden:true},
			{ text: 'three', dataIndex: 'three',hidden:true},
			{ text: 'four', dataIndex: 'four',hidden:true},
			{ text: 'five', dataIndex: 'five',hidden:true},
			{ text: 'six', dataIndex: 'six',hidden:true},
			{ text: 'seven', dataIndex: 'seven',hidden:true},
            { text: _('Remark'), dataIndex: 'comments',flex:1,menuDisabled:true},
			{ text: _('nweek'), dataIndex: 'days',menuDisabled:true,
			 renderer: function(value) {
				var result=_('nweek');
				var len = value.length;
				for (var i=0;i<len;i++){
				var v=  value.charAt(i);
		
				if(v==1){
					switch (i){ 
				case 0:
					result=result+_('One');
					break;
				case 1:
					result=result+_('Two');
				    break;
				case 2:
					result=result+_('Three');
				    break;
				case 3:
					result=result+_('Four');
				    break;
				case 4:
					result=result+_('Five');
				    break;
				case 5:
					result=result+_('Six');
				    break;
				case 6:
					result=result+_('Seven');
				    break;
				default:
					result=result+'';
					} 
				}		  
						  
			}
			return result;
		 }

			},
			{ text: _('Start Time') ,dataIndex: 'startTime',menuDisabled:true },
			{ text: _('End Time'),dataIndex: 'endTime' ,menuDisabled:true},
			{ text: _('enabled'), dataIndex: 'filterEnable', xtype: 'checkcolumn',menuDisabled:true},
			{ text: _('Corba Filter'), dataIndex: 'isCorbaFilter', xtype: 'checkcolumn',menuDisabled:true},
			{ text: _('Save History'), dataIndex: 'isSaved', xtype: 'checkcolumn',menuDisabled:true},
			{ xtype: 'actioncolumn',width:50, text: _('Delete'),menuDisabled:true,items: [{  iconCls: 'x-fa fa-trash-o',  tooltip: 'Delete',  handler: 'onRemoveClick' }]
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
                    text: _('Modify'),
                    iconCls:'x-fa fa-edit',
                    handler: 'onModify'
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
        }],
		
	},
	{
		xtype:'alarmTimeQueryView',
		
	}

		]


});
