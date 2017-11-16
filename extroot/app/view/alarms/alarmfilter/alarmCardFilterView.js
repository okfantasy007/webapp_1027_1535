Ext.define('Admin.view.alarms.alarmfilter.alarmCardFilterView', {
    extend:'Ext.panel.Panel',
	xtype:'alarmCardFilterView',
	initComponent: function () {
		 this.cardmodifiedRecoreds= new Ext.util.MixedCollection();
		 this.callParent();
	 },
	 requires: [
		'Admin.view.alarms.alarmfilter.alarmCardQueryView'
    ],
	layout:'card',
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            filterlist_remote: {
                autoLoad: true,
				type: 'tree',
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAlarmCardFilter',
					actionMethods : { 
					 read   : 'POST',
					},  
					
                }

            }
		
        }
    },

    controller: {  
	onDelete:function(){
		     var targetGrid =  this.getView().down('treepanel');
		     var store = targetGrid.getStore();
			 var records =targetGrid.getSelectionModel().getSelection();
			 var len = records.length;
			 Ext.Msg.confirm(_("Confirm"), _("deleteFromDB"), function (btn) {
		 	 if(btn=='yes'){
				 
				 for(var i=0;i<len;i++){
				var record = records[i];
				var json ='';
			var length = record.childNodes.length;
			if(length>0){
				json =json+ "[";
				for(var j=0;j<length;j++){
					var rec =record.childNodes[j];
					var alarmId = "'"+ rec.get('alarmId')+ "'";
					var neid = "'"+ rec.get('ircnenodeId')+ "'";
					var alarmUrl = "'"+rec.get('alarmUrl')+ "'";
					var alarmLevel =  "'"+rec.get('alarmLevel')+ "'";
					var isUsed = "'"+rec.get('isUsed')+ "'";
					var isCorbaFilter = "'"+rec.get('isCorbaFilter')+ "'";
					var isSaved = "'"+rec.get('isSaved')+ "'";					
					json = json+"{"+"ircnenodeId :"+neid+"," +"isUsed :"+isUsed+"," +"isCorbaFilter :"+isCorbaFilter+"," +"isSaved :"+isSaved+"," +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+","  +"alarmLevel :"+alarmLevel+"},"
				}
				json=json.substring(0,json.length-1)+"]";
			}else{
			var alarmId = "'"+record.get('alarmId')+ "'";
			var neid = "'"+ record.get('ircnenodeId')+ "'";
			var alarmUrl = "'"+record.get('alarmUrl')+ "'";
			var alarmLevel ="'"+ record.get('alarmLevel')+ "'";
			var isUsed = "'"+record.get('isUsed')+ "'";
			var isCorbaFilter = "'"+record.get('isCorbaFilter')+ "'";
			var isSaved = "'"+record.get('isSaved')+ "'";
				var json= "[{"+"ircnenodeId :"+neid+"," +"isUsed :"+isUsed+"," +"isCorbaFilter :"+isCorbaFilter+"," +"isSaved :"+isSaved+"," +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+","  +"alarmLevel :"+alarmLevel+"}]";
			}
				Ext.Ajax.request({
                                    url: 'alarm/alarmResource/deleteAlarmsByCard',
                                    method: 'post',
                                    params: {
                                       condition:json
                                    },
                                    success: function(response) {                                     
                                        if (response.responseText) {
                                            //alert('success');
                                          
                                        }

                                    }
                                });	
			
				  }
				    targetGrid.getStore().reload();
				 
			 }
			 });
		
	},
	onQuery:function(){
			var targetGrid =  this.getView().down('treepanel');
			var keywords = this.getView().down('textfield').getValue();
            targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAlarmCardFilter';
            targetGrid.getStore().proxy.extraParams ={keywords:keywords}
            targetGrid.getStore().reload();
		},
		
	onUsedChecked:function( me , rowIndex , checked , record , e , eOpts ) {
						this.getView().cardmodifiedRecoreds.add(rowIndex,record);
						var length = record.childNodes.length;						
						for(var i=0;i<length;i++){
							var child  =record.childNodes[i];
							child.data.isUsed =checked;
						}
						var rootCheckValue = false;
						var parentNode = record.parentNode;
						if(parentNode!=null){
							var length = parentNode.childNodes.length;
							for(var i=0;i<length;i++){
							 var child  =parentNode.childNodes[i];
							if(child.data.isUsed){	
								parentNode.data.isUsed =true;
								rootCheckValue =true;
								break;
							}
						}
						if(!rootCheckValue){
							parentNode.data.isUsed =false;
						}
						
							
						}

						me.up('treepanel').getView().refresh();
						
					},
					
		onCorbaChecked:function( me , rowIndex , checked , record , e , eOpts ) {
						this.getView().cardmodifiedRecoreds.add(rowIndex,record);
						var length = record.childNodes.length;
						for(var i=0;i<length;i++){
							var child  =record.childNodes[i];
							child.data.isCorbaFilter =checked;
						}
						var rootCheckValue = false;
						var parentNode = record.parentNode;
						if(parentNode!=null){
							var length = parentNode.childNodes.length;

							for(var i=0;i<length;i++){
							 var child  =parentNode.childNodes[i];							
							if(child.data.isCorbaFilter){
								
								parentNode.data.isCorbaFilter =true;
								rootCheckValue =true;
								break;
							}
						}
						if(!rootCheckValue){
							parentNode.data.isCorbaFilter =false;
						}
						
						}
						
						me.up('treepanel').getView().refresh();
						
					},
			onSaveChecked:function( me , rowIndex , checked , record , e , eOpts ) {
						this.getView().cardmodifiedRecoreds.add(rowIndex,record);
						var length = record.childNodes.length;
						for(var i=0;i<length;i++){
							var child  =record.childNodes[i];
							child.data.isSaved =checked;
						}
						var rootCheckValue = false;
						var parentNode = record.parentNode;
						if(parentNode!=null){
							var length = parentNode.childNodes.length;
							for(var i=0;i<length;i++){
							 var child  =parentNode.childNodes[i];
							if(child.data.isSaved){
								
								parentNode.data.isSaved =true;
								rootCheckValue =true;
								break;
							}
						}
						if(!rootCheckValue){
							parentNode.data.isSaved =false;
						}
						
							
						}
						me.up('treepanel').getView().refresh();
						
					},
       onRemoveClick:function(view, recIndex, cellIndex, item, e, record){
			var targetGrid =  this.getView().down('treepanel');
			var json ='';
			var length = record.childNodes.length;
			if(length>0){
				json =json+ "[";
				for(var i=0;i<length;i++){
					var rec =record.childNodes[i];
					var alarmId = "'"+ rec.get('alarmId')+ "'";
					var neid = "'"+ rec.get('ircnenodeId')+ "'";
					var alarmUrl = "'"+rec.get('alarmUrl')+ "'";
					var alarmLevel =  "'"+rec.get('alarmLevel')+ "'";
					var isUsed = "'"+rec.get('isUsed')+ "'";
					var isCorbaFilter = "'"+rec.get('isCorbaFilter')+ "'";
					var isSaved = "'"+rec.get('isSaved')+ "'";
					json = json+"{"+"ircnenodeId :"+neid+"," +"isUsed :"+isUsed+"," +"isCorbaFilter :"+isCorbaFilter+"," +"isSaved :"+isSaved+"," +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+","  +"alarmLevel :"+alarmLevel+"},"
				}
				json=json.substring(0,json.length-1)+"]";
			}else{
			var alarmId = "'"+record.get('alarmId')+ "'";
			var neid = "'"+ record.get('ircnenodeId')+ "'";
			var alarmUrl = "'"+record.get('alarmUrl')+ "'";
			var alarmLevel ="'"+ record.get('alarmLevel')+ "'";
			var isUsed = "'"+record.get('isUsed')+ "'";
			var isCorbaFilter = "'"+record.get('isCorbaFilter')+ "'";
			var isSaved = "'"+record.get('isSaved')+ "'";
				var json= "[{"+"ircnenodeId :"+neid+"," +"isUsed :"+isUsed+"," +"isCorbaFilter :"+isCorbaFilter+"," +"isSaved :"+isSaved+"," +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+","  +"alarmLevel :"+alarmLevel+"}]";
			}
			Ext.Msg.confirm(_("Confirm"), _("deleteFromDB"), function (btn) {
			if(btn=='yes'){
				Ext.Ajax.request({
                                    url: 'alarm/alarmResource/deleteAlarmsByCard',
                                    method: 'post',
                                    params: {
                                       condition:json
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
            var targetGrid =  this.getView().down('treepanel');
			var alarmCardQueryView =  this.getView().down('alarmCardQueryView');
			this.getView().setActiveItem(alarmCardQueryView);
			var  pageGrid =alarmCardQueryView.down('PagedGrid');
			var alarmCheckbox = alarmCardQueryView.down('panel').down('checkboxfield');
			var alarmgrid = pageGrid.nextSibling().down('grid'); 
			alarmCardQueryView.reset();
			pageGrid.getSelectionModel().clearSelections();
			alarmgrid.getStore().removeAll();
		    alarmgrid.getView().refresh();
		    pageGrid.getView().refresh();
        },
		

		onSave:function(){
		    var targetGrid =  this.getView().down('treepanel');
		    var store = targetGrid.getStore();
			var view =this.getView();
		    var len = view.cardmodifiedRecoreds.items.length;
		  	 if(len==0){
				alarmjson ="[]";
				return;
			}else{
			var alarmjson="[" ;
		   	for(var i=0;i<len;i++){
			
				var record = view.cardmodifiedRecoreds.items[i];
				if(record.childNodes.length>0){
				for(var j=0;j<record.childNodes.length;j++){
				var rec =record.childNodes[j];
				alarmjson= alarmjson+'{';
				var isUsed = "'"+rec.get('isUsed')+"'";
				var isCorbaFilter ="'"+rec.get('isCorbaFilter')+"'";
				var isSaved ="'"+rec.get('isSaved')+"'";
				var alarmLevel ="'"+rec.get('alarmLevel')+"'";
				var alarmId = "'"+rec.get('alarmId')+"'";
				var alarmUrl = "'"+rec.get('alarmUrl')+"'";
				var alarmLocation = "'"+rec.get('alarmLocation')+"'";
				
				alarmjson= alarmjson +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+"," +"alarmLocation :"+alarmLocation+"," +"alarmLevel :"+alarmLevel+","+"isUsed :"+isUsed+","+" isCorbaFilter:"+isCorbaFilter +","+" isSaved:"+isSaved+"},"	
				}	
				}else{
				alarmjson= alarmjson+'{';
				var isUsed = "'"+record.get('isUsed')+"'";
				var isCorbaFilter ="'"+record.get('isCorbaFilter')+"'";
				var isSaved ="'"+record.get('isSaved')+"'";
				var alarmLevel ="'"+record.get('alarmLevel')+"'";
				var alarmId = "'"+record.get('alarmId')+"'";
				var alarmUrl = "'"+record.get('alarmUrl')+"'";
				var alarmLocation = "'"+record.get('alarmLocation')+"'";
				
				alarmjson= alarmjson +"alarmId :"+alarmId+"," +"alarmUrl :"+alarmUrl+"," +"alarmLocation :"+alarmLocation+"," +"alarmLevel :"+alarmLevel+","+"isUsed :"+isUsed+","+" isCorbaFilter:"+isCorbaFilter +","+" isSaved:"+isSaved+"},"
				
				}
				
			}
				
			}
			alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";
			
			Ext.Ajax.request({
							url : 'alarm/alarmResource/modifyAlarmsByCard',
							method:'post',
							params:{condition:alarmjson},
							success : function(response) {
							var r =  Ext.decode(response.responseText);
							Ext.Msg.alert(_('Success'), _('save successfully'));
							targetGrid.getStore().reload();
							view.cardmodifiedRecoreds.clear();
								}
		});
		},

        onRefresh: function() {
			var view =this.getView();
            var targetTreepanel =  this.getView().down('treepanel');
			var keywords = this.getView().down('textfield').getValue();
            targetTreepanel.getStore().proxy.url = 'alarm/alarmResource/getAlarmCardFilter';
            targetTreepanel.getStore().proxy.extraParams ={keywords:keywords}
            targetTreepanel.getStore().reload();
			view.cardmodifiedRecoreds.clear();
        },

        onReset: function() {
			  var view =this.getView();
              var targetTreepanel =  this.getView().down('treepanel');
			  this.getView().down('textfield').reset();
			  targetTreepanel.getStore().reload();
			  view.cardmodifiedRecoreds.clear();
        }
    },

	items: [
    {
        title: _('Alarm Card Filter'),
        header:true,
		margin:10,
        iconCls: 'x-fa fa-circle-o',
		xtype:'treepanel',
		reference:'alarmLevelFilterGrid',
		reserveScrollbar: true,
		useArrows: true,
		rootVisible: false,
		multiSelect: true,
	    checkPropagation: 'both',
        bind: {
            store: '{filterlist_remote}',
        },
        columns: [
			{ xtype: 'treecolumn',text: _('Name'), dataIndex: 'strName',flex:1,menuDisabled:true},
            { text: _('Description'), width:300,dataIndex: 'desc',flex:3,menuDisabled:true},
			{ text: _('Alarm Level'),dataIndex: 'alarmLevel',hidden:true},
			{ text: _('Alarm ID'), dataIndex: 'alarmId',hidden:true},
			{ text: 'ircnenodeId',dataIndex: 'ircnenodeId',hidden:true},
			{ text: _('Alarm URL'), dataIndex: 'alarmUrl',hidden:true},
			{ text: _('Alarm Location'), dataIndex: 'alarmLocation',hidden:true},
			{ text: _('enabled'), dataIndex: 'isUsed',xtype: 'checkcolumn',menuDisabled:true,
			 listeners: {
					checkchange: 'onUsedChecked'
				}
			 },
			 { text: _('Corba Filter'), dataIndex: 'isCorbaFilter', xtype: 'checkcolumn', menuDisabled:true,
				listeners: {
					checkchange: 'onCorbaChecked'
				}
			 },
			 { text: _('Save History'), dataIndex: 'isSaved',xtype: 'checkcolumn',menuDisabled:true,
			 listeners: {
					checkchange: 'onSaveChecked'
				}

			 },
			{ xtype: 'actioncolumn',width:50, text: _('Delete'),menuDisabled:true,items: [{  iconCls: 'x-fa fa-trash-o',  tooltip: 'Delete',  handler: 'onRemoveClick' }]
			
			},
			
        ],
		tbar:{
		 items: [
               {
                    text:  _('Add'),
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
				    fieldLabel:  _('Keyword'),
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
                }
                
            ]
		
		}
		
	},
	{
		xtype:'alarmCardQueryView',
		margin:10
	}

		]


});
