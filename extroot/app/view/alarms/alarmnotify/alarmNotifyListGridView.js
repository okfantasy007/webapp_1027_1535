Ext.define('Admin.view.alarms.alarmnotify.alarmNotifyListGridView', {
    extend:'Ext.panel.Panel',
	xtype:'alarmNotifyListGridView',
	
	 requires: [
        'Admin.view.base.PagedGrid',
		'Admin.view.alarms.alarmnotify.alarmNotifySmsFormView',
		'Admin.view.alarms.alarmnotify.alarmNotifyMailFormView'
    ],
	layout:'card',
	mark:false,
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTargetBasicInfo',
					actionMethods : {  
					 read   : 'POST',
					},  
                    reader: {
                        type: 'json',
                         rootProperty: 'data',
                    }
                }

            },
			nelist_remote: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTargetNeInfo',
					extraParams: {condition: ''},
					actionMethods : {  
					 read   : 'POST',
					},  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
			alarmlist_remote: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getTargetAlarmInfo',
					extraParams: {condition: ''},
					actionMethods : {  
					 read   : 'POST',
					},  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
			neAlllist_remote: {
					autoLoad: true,
					pageSize: 15,
					proxy: {
					type: "ajax",
					actionMethods : {  
					 read   : 'POST',
					},  
					url: "/alarm/alarmResource/getAllNeResource",
					reader: {
					type: 'json',
					rootProperty: 'data',
					}
					}

            },
			alarmAlllist_remote: {
					autoLoad: true,
				    pageSize: 15,
					proxy: {
					type: "ajax",
					actionMethods : {  
					 read   : 'POST', 
					},  
					url: "/alarm/alarmResource/getalarmType",
					reader: {
					type: 'json',
					rootProperty: 'data',
					}
					}

            }
			
			
        }
    },

    controller: {  
		onMailEdit:function(){
			
			var mailAddress= this.getView().down('form').getForm().findField('mailAddress').getValue();
			  //var phoneNum ='132455,1223344';
			  var mailEditWin = Ext.create('Admin.view.alarms.alarmnotify.alarmNotifyMailFormView',{alarmNotifyListGridView: this.getView()});
              mailEditWin.show();
			  var form = mailEditWin.down('form');
			  var grid= form.down('grid');
			  grid.getStore().removeAll();
			  if(mailAddress==''){
				  return;
			  }else{
		   
			
			var mailArray = mailAddress.split(',');
			var len =mailArray.length;
			if(len==0){
				var rec = {'mailAddress': mailAddress};
				grid.getStore().insert(grid.store.getCount(),rec);
			}else{
				for(var i=0;i<len;i++){
				var mailAddress =mailArray[i];
				var rec = {'mailAddress': mailAddress};
			    grid.getStore().insert(grid.store.getCount(),rec);
				}
			}
			
			
			  }
		},
	
		onPhoneEdit:function(){
			  var phoneNum= this.getView().down('form').getForm().findField('phone').getValue();
			  //var phoneNum ='132455,1223344';
			  var phoneEditWin = Ext.create('Admin.view.alarms.alarmnotify.alarmNotifySmsFormView',{alarmNotifyListGridView: this.getView()});
              phoneEditWin.show();
			  var form = phoneEditWin.down('form');
			  var grid= form.down('grid');
			  grid.getStore().removeAll();
			  if(phoneNum==''){
				  return;
			  }else{
		   
			
			var phoneArray = phoneNum.split(',');
			var len =phoneArray.length;
			if(len==0){
				var rec = {'phoneNum': phoneNum};
				grid.getStore().insert(grid.store.getCount(),rec);
			}else{
				for(var i=0;i<len;i++){
				var phoneNum =phoneArray[i];
				var rec = {'phoneNum': phoneNum};
			    grid.getStore().insert(grid.store.getCount(),rec);
				}
			}
			
			
			  }
		},
	
		onNeAdd: function(){
			 var neQueryPanel =  this.lookupReference('NeQueryPanel');
			 var negrid = neQueryPanel.down('PagedGrid');
			 negrid.getSelectionModel().clearSelections();
			 negrid.getView().refresh();
			 this.getView().setActiveItem( neQueryPanel );
		},
		onNeDelete:function(){
			 var negrid =  this.lookupReference('neInfo');
			 var records = negrid.getSelectionModel().getSelection();
			 for(var i=0 ;i<records.length;i++){
             negrid.getStore().remove(records[i]);
            }
			 
			
		},
		onNeQuery:function(){
			var neQueryPanel =  this.lookupReference('NeQueryPanel');
			var neName = neQueryPanel.down('textfield').getValue();
			var neGrid = neQueryPanel.down('PagedGrid');
			neGrid.getStore().proxy.url = '/alarm/alarmResource/getAllNeResource';
			neGrid.getStore().proxy.extraParams = {condition:neName};
			neGrid.getStore().reload();
			 
		},
		onNeConfirm:function(){
			var neNotifyInfogrid = this.lookupReference('neInfo');
			
			 var nePagedGrid =  this.lookupReference('nePagedGrid');
			 var records = nePagedGrid.getSelectionModel().getSelection();
			 
			for(var i=0 ;i<records.length;i++){
             neNotifyInfogrid.getStore().insert(0,records[i]);  
            }
			 var  tabPanel = this.getView().down('tabpanel');
			this.getView().setActiveItem( tabPanel );
			
		},
		onNeCancel:function(){
			 var  tabPanel = this.getView().down('tabpanel');
			this.getView().setActiveItem( tabPanel);
		},
		onAlarmAdd: function(){
			 var alarmQueryPanel =  this.lookupReference('alarmQueryPanel');
			 var alarmgrid = alarmQueryPanel.down('PagedGrid');
			 alarmgrid.getSelectionModel().clearSelections();
			 alarmgrid.getView().refresh();
			 this.getView().setActiveItem( alarmQueryPanel );
		},
		onAlarmDelete:function(){
			 var alarmgrid =  this.lookupReference('alarmNotifyInfo');
			 var records = alarmgrid.getSelectionModel().getSelection();
			 for(var i=0 ;i<records.length;i++){
             alarmgrid.getStore().remove(records[i]);
            }
			// negrid.getStore().reload();
			 
			
		},
		onAlarmQuery:function(){
			var alarmQueryPanel =  this.lookupReference('alarmQueryPanel');
			var alarmName = alarmQueryPanel.down('textfield').getValue();
			var alarmGrid = alarmQueryPanel.down('PagedGrid');
			alarmGrid.getStore().proxy.url = '/alarm/alarmResource/getalarmType';
			alarmGrid.getStore().proxy.extraParams = {alarmName:alarmName};
			alarmGrid.getStore().reload();
			
			
		},
		
		onAlarmConfirm: function(){
			var alarmNotifyInfogrid = this.lookupReference('alarmNotifyInfo');
			
			 var alarmPagedGrid =  this.lookupReference('alarmPagedGrid');
			 var records = alarmPagedGrid.getSelectionModel().getSelection();
			 
			for(var i=0 ;i<records.length;i++){
             alarmNotifyInfogrid.getStore().insert(0,records[i]);  
            }
		    var  tabPanel = this.getView().down('tabpanel');
			this.getView().setActiveItem( tabPanel );
		},
		onModify:function(){
			
			var  alarmNotifyListGrid = this.getView().down('PagedGrid');
			var records = alarmNotifyListGrid.getSelectionModel().getSelection();
			if(records.length==0){
				Ext.Msg.alert(_('Tips'),  _('Please Choose One Record'));
				return;
			}
			var  tabPanel = this.getView().down('tabpanel');
            this.getView().setActiveItem( tabPanel );
			var targetId =records[0].get('targetId');
			var form = this.getView().down('form');
			var neGrid = tabPanel.down('grid');
			var alarmGrid=  tabPanel.down('grid').nextSibling();
			form.getForm().loadRecord(records[0]);
			neGrid.getStore().proxy.url = '/alarm/alarmResource/getTargetNeInfo';
			neGrid.getStore().proxy.extraParams = {condition:targetId};
			neGrid.getStore().reload();
			alarmGrid.getStore().proxy.url = '/alarm/alarmResource/getTargetAlarmInfo';
			alarmGrid.getStore().proxy.extraParams = {condition:targetId};
			alarmGrid.getStore().reload();
			mark =true;
	
			
		},
        onAdd: function() {
		    var  tabPanel = this.getView().down('tabpanel');
            this.getView().setActiveItem( tabPanel );
			var form = this.getView().down('form');
			var neGrid = tabPanel.down('grid');
			var alarmGrid=  tabPanel.down('grid').nextSibling();
			form.getForm().reset();
			neGrid.getStore().removeAll();
			alarmGrid.getStore().removeAll();
			mark =false;
        },
		onDelete:function(){
			
			var targetGrid =  this.getView().down('PagedGrid');
			var records = targetGrid.getSelectionModel().getSelection();
			if(records.length==0){
				Ext.Msg.alert(_('Tips'),  _('Please Choose One Record'));
				return;
			}
			
			var targetId=records[0].get('targetId');	
			Ext.Msg.confirm(_('Confirmation'), _('deleteFromDB'), function (btn) {			
			if(btn=='yes'){
						Ext.Ajax.request({
							url : '/alarm/alarmResource/deleteTargetBasicInfo',
							method:'post',
							params:{targetId:targetId},
							success : function(response) {							
					
							var r =  Ext.decode(response.responseText);
							Ext.Msg.alert(_('Success'), _('Delete Success'));
							targetGrid.getStore().reload();
							
								},
							failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'), _('Delete unsuccessfully'));
                            }
			});
			
			}
			});
	
			
		},

        onRefresh: function() {
			
			var  grid = this.getView().down('PagedGrid');
			grid.getStore().reload();
          
        },

       
        onSubmit: function() {
			var  alarmNotifyListGrid = this.getView().down('PagedGrid');
			var  tabPanel = this.getView().down('tabpanel');
			var view =  this.getView();
			var form = this.getView().down('form');
			var neGrid = tabPanel.down('grid');
			var neStore = neGrid.getStore();
			var targetName =form.getForm().findField('targetName').getValue();
			var nejson="[" ;
			if(neStore.data.length ==0){
				nejson ='[]';
			}else{
				for(var i=0;i<neStore.data.length;i++){
			nejson= nejson+'{';
				var record = neStore.getAt(i); 
				var resId = "'"+record.get('resId')+"'";
				var nename ="'"+record.get('name')+"'";
				var resTypeName ="'"+record.get('resTypeName')+"'";
				var symbolId ="'"+record.get('symbolId')+"'";
			
			nejson= nejson  +"resTypeName :"+resTypeName+"," +"symbolId :"+symbolId+"," +"resId :"+resId+","+" nename:"+nename +"},"
				
			}
			nejson=nejson.substring(0,nejson.length-1)+"]";
			}
			
			var alarmGrid=  tabPanel.down('grid').nextSibling();
			var alarmStore =  alarmGrid.getStore();
			var alarmjson="[" ;
			if(alarmStore.data.length==0){
				alarmjson='[]';
			}else{
				for(var i=0;i<alarmStore.data.length;i++){
			alarmjson= alarmjson+'{';
				var record = alarmStore.getAt(i); 
				var id = "'"+record.get('id')+"'";
				var alarmLevel ="'"+record.get('alarmLevel')+"'";
			alarmjson= alarmjson  +"id :"+id+","+" alarmLevel:"+alarmLevel +"},"
				
			}
			alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";
			}
		
			var url='';
			if(mark){
				url ='/alarm/alarmResource/modifyTargetBasicInfo';
			}else{
				url ='/alarm/alarmResource/addTargetBasicInfo';
			}
			form.getForm().submit({
                            url: url,
                            params:{nejson:nejson,alarmjson:alarmjson},
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {							
								Ext.Msg.alert(_('Success'), _('save successfully'));
								view.setActiveItem(alarmNotifyListGrid);
                                alarmNotifyListGrid.getStore().reload();
								
                            },
                            failure: function(form, action) {						
								if(action.result=='5000'){
									 Ext.Msg.alert(_('Tips'), _('target Exist'));
								}else{
									 Ext.Msg.alert(_('Tips'), _('save unsuccessfully'));
								}
                               
                            }
                        }); // form
						
			mark =false;
							
			
			
         
        },

        onCancel: function() {
		   var  alarmNotifyListGrid = this.getView().down('PagedGrid');
           this.getView().setActiveItem( alarmNotifyListGrid );
		   mark =false;
        },
		 onAlarmCancel: function() {
			 
			var  tabPanel = this.getView().down('tabpanel');
			this.getView().setActiveItem( tabPanel);
        }
    },

	items: [
    {
        title: _('Alarm Notify List'),
		iconCls: 'x-fa fa-circle-o',
		margin:10,
		xtype:'PagedGrid',
		selModel: {
		selection: "rowmodel",
		mode: "SINGLE"
		},
		reference:'alarmNotifyListGrid',
        bind: {
            store: '{userlist_remote}',
        },
       
        selType: 'checkboxmodel',

        // grid显示字段
        columns: [
            { xtype: 'rownumberer', width: 60, sortable: false, align: 'center' }, 
			{ text: 'targetId', dataIndex: 'targetId', hidden:true },
            { text: _('target Name'), dataIndex: 'targetName',width:150},
            { text: _('telephone Number'), dataIndex: 'phone' ,width:150},
            { text: _('Email Address'), dataIndex: 'mailAddress',width:150},
            { text: _('Sms Notify'), dataIndex: 'smsnotify',
			 renderer: function(value, m, r) {
                if (value == 1) {
                    return _('enabled');
                }
				 if (value == 2) {
                    return _('Not Enabled');
                }
				return value;
			  }
			},
            { text: _('Mail Notify'), dataIndex: 'mailnotify',
			 renderer: function(value, m, r) {
                 if (value == 1) {
                    return _('enabled');
                }
				 if (value == 2) {
                    return _('Not Enabled');
                }
				return value;
			  }
			},
			{ text: _('Socket Notify'), dataIndex: 'socketServer',flex : 1,  	
			 renderer: function(value, m, r) {
                 if (value == 1) {
                    return _('enabled');
                }
				 if (value == 2) {
                    return _('Not Enabled');
                }
				return value;
			  }
			}
			
			
        ],
        // 分页工具条位置
        //pagingbarDock: 'bottom',
        pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 15,
        // 分页策略
        pagingbarConfig: {
            fields: [{name: 'val', type: 'int'}],
            data: [
                {val: 15},
                {val: 30},
                {val: 60},
                {val: 100},
                {val: 200},
                {val: 500},
                {val: 1000},
                {val: 2000},
            ]
        },

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
                    text: _('edit-modify'),
                    iconCls:'x-fa fa-edit',
                    handler: 'onModify'
                },
                {
                    text: _('Delete'),
                    iconCls:'x-fa fa-trash',
                    handler: 'onDelete',
                                   
                },
				'->',
                {
                    text: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onRefresh'
                },
                
            ]
        }],
		  listeners: {
           // itemdblclick: 'onItemDoubleClick',
            itemcontextmenu: 'onItemRightClick'
        }
	},
		{
			xtype:'tabpanel',
			margin:10,
			reference:'alarmNotifyListtabPanel',
			items:[
			
			{
			title:_('Basic Info'),
			header:false,
			xtype:'form',
			height:350,
			fieldDefaults : {
			labelWidth : 90,
			labelAlign : "right",
			//margin: '15 0 15 5',
 
			},
			items: [
			{
				xtype: 'fieldset',
				title: _('Basic Info'),
				defaults: {
				// anchor: '100%',
				 width:500

				},
			items:[
			{
				 xtype:'textfield',
	            fieldLabel: 'targetId',
	            name: 'targetId',
				hidden:true
	        },
			
	        {
				xtype:'textfield',
	            fieldLabel: _('target Name'),
				allowBlank:false,
	            name: 'targetName'
	        },
			{
            xtype: 'fieldcontainer',
            layout: 'hbox',
			combineErrors: true,
            msgTarget: 'side',
			items:[
			{
				 xtype:'textfield',
	            fieldLabel: _('telephone Number'),
	            name: 'phone',
				readOnly:true,
				//regex: /^((\d{3,4}-)*\d{7,8}(-\d{3,4})*|13\d{9})$/
	        },
			{
				xtype:'button',
				 text:_('Edit'),
				 handler:'onPhoneEdit'
        
			}
			]
			},
			{
            xtype: 'fieldcontainer',
            layout: 'hbox',
			combineErrors: true,
            msgTarget: 'side',
			items:[
			{
				 xtype:'textfield',
	        	 fieldLabel: _('Email Address'),
				// vtype:'email',
				readOnly:true,
		         name: 'mailAddress'
	        },
			{
				xtype:'button',
				 text:_('Edit'),
				 handler:'onMailEdit'
             
        
			}
			]
			}	
	        
			
			]
			},
			{
				 xtype:'form',
				 items:[
				 	{
				xtype: 'fieldset',
				title: _('Notify Info'),
				layout:'hbox',
				defaults: {
				labelWidth: 90,
				margin: '0 0 10 50',
				},
				items:[
				 {
				xtype: 'checkboxfield',
				name: 'smsnotify',
				boxLabel: _('Sms Notify'),
				//  boxLabel: "游泳"
				},
			
			{
				xtype: 'checkboxfield',
				name: 'mailnotify',
				boxLabel: _('Mail Notify'),
			//  boxLabel: "游泳"
			},
			
				{
				xtype: 'checkboxfield',
				name: 'socketServer',
				boxLabel: _('Socket Notify'),
			//  boxLabel: "游泳"
				}
					]}
				 
				 ]	
			}
			]
			},
			{
				title:_('Ne Info'),
				xtype: 'grid',
				height:350,
				reference:'neInfo',
				tbar:[
				{  
             		text:_('Add'),
             		tooltip:_('Add'),
					iconCls:'x-fa fa-plus',
             	    handler:'onNeAdd',
	
             	},{  
             		text:_('Delete'),
					iconCls:'x-fa fa-trash',
             		tooltip:_('Delete'),
             	    handler:'onNeDelete',
             		
             	}
				],
                columns: [ 
				{
					text: _('neId'),  
					dataIndex: 'resId' ,
					flex:2
                },  
				{
					text: 'resTypeName',  
					dataIndex: 'resTypeName' ,
					width:150,
					hidden : true,
				}, 
				{
					text: 'symbolId',  
					dataIndex: 'symbolId' ,
					hidden:true,					
				}, 
				{  
					text: _('neName'),  
					sortable : false,  
					dataIndex: 'name' ,
					flex:2
                },
				{  
					text: _('IP Address'),  
					sortable : false,  
					dataIndex: 'ipaddress',
					flex:2
                } ,
				{  
					text: _('MAC Address'),  
					sortable : false,  
					dataIndex: 'macaddress',
					flex:2
                },
				{  
					text: _('Host name'),  
					sortable : false,  
					dataIndex: 'hostname',
					flex:2
                } 
				],  
				bind: {
					store: '{nelist_remote}',
				}
				
			},
			{
				title:_('Alarm Notify Policy'),
				xtype: 'grid',
				height:350,
				reference:'alarmNotifyInfo',
				tbar:[
				{  
             		text:_('Add'),
             		tooltip:_('Add'),
				    iconCls:'x-fa fa-plus',
             	    handler:'onAlarmAdd',
             	},{  
             		text:_('Delete'),
             		tooltip:_('Delete'),
					iconCls:'x-fa fa-trash',
             	    handler:'onAlarmDelete',
             		
             	}
				],
                columns: [ 
				{  text: _('Alarm ID'),  
					dataIndex: 'id',
					hidden:true,
                }, 
				{  text: _('Alarm Name'),  
					flex: 1,
					dataIndex: 'alarmName'  
                }, 
				{  text:_('Alarm Level'),  
					width:150,
					sortable : false,  
					dataIndex: 'alarmLevel',
					renderer: function(value, m, r) {
					m.tdCls = 'alarm_bk_' + value;
					 if (value == 0) {
                    return _('All Alarm Type');
					}
					if (value == 1) {
                    return _('Critical');
					}
					if (value == 2) {
                    return _('Major');
					}
					if (value == 3) {
                    return _('Minor');
					}
					if (value == 4) {
                    return _('Prompt');
					}
					if (value == 5) {
                    return _('Unknown Alarm');
					}
					return value;
				}
                },
				{  text: _('Alarm Category'),  
					dataIndex: 'alarmCategory' ,
					  renderer: function(value) {
					 if (value == 0) {
                    return _('All Category');
					}
					if (value == 1) {
                    return _('Device Alarm');
					}
					if (value == 2) {
                    return _('Service Quality Alarm');
					}
					if (value == 3) {
                    return _('Communication Alarm');
					}
					if (value == 4) {
                    return _('Environment Alarm');
					}
					if (value == 5) {
                    return _('Dispose failure Alarm');
					}


					return value;
				}	
                },
				{  text: _('Solution'),  
					flex: 1,
					dataIndex: 'howToDesc'  
                },
				
				 ],                 // One header just for show. There's no data,
               bind: {
					store: '{alarmlist_remote}',
				}
			}
			],
			 buttons: [
			 {
            text: _('Save'),
           // iconCls:'x-fa fa-save',
            handler: 'onSubmit',
			},
			{
            text: _('Cancel'),
           // iconCls:'x-fa fa-close',
            handler: 'onCancel',
			}
			]
		
		},
		{
			xtype :'panel',
			reference:'alarmQueryPanel',
			items:[
				{
					xtype: 'panel',
					//layout:'hbox',
					items:[
					{
					xtype: 'fieldset',
					title: _('Ne Name Search'),
					layout:{
						type: 'hbox'
					},
					items:[
					{
						 xtype:'textfield',
						 fieldLabel: _('Alarm Name'),
						 name: 'neName'
					},
					{
						 xtype:'button',
						 text: _('Query'),
						 iconCls: 'x-fa fa-search',
						 handler:'onAlarmQuery'
					}
					]
					}
					]
						
					},
					{
                    xtype: 'PagedGrid',
					reference:'alarmPagedGrid',
                    border: true,
					autoHeight:true,
					selType: 'checkboxmodel',
					columns: [ 
				    { xtype: 'rownumberer', width: 60, sortable: false, align: 'center' }, 
					{  
					text: _('Alarm Name'),  
					flex     : 1,  
					sortable : false,  
					width:200,
					dataIndex: 'alarmName'  
					}, 
					{  
					text: _('Alarm Level'),  
					width:250,
					sortable : false,  
					dataIndex: 'alarmLevel' ,
					 renderer: function(value, m, r) {
					m.tdCls = 'alarm_bk_' + value;
					if (value == 0) {
                    return _('All Alarm Type');
					}
					if (value == 1) {
                    return _('Critical');
					}
					if (value == 2) {
                    return _('Major');
					}
					if (value == 3) {
                    return _('Minor');
					}
					if (value == 4) {
                    return _('Prompt');
					}
					if (value == 5) {
                    return _('Unknown Alarm');
					}
					return value;
					}
					},
					{  
					text: _('Alarm Category'),  
					sortable : false,  
					dataIndex: 'alarmCategory' ,
					renderer: function(value) {
					 if (value == 0) {
                    return _('All Category');
					}
					if (value == 1) {
					return _('Device Alarm');
					}
					if (value == 2) {
                    return _('Service Quality Alarm');
					}
					if (value == 3) {
                    return _('Communication Alarm');
					}
					if (value == 4) {
                    return _('Environment Alarm');
					}
					if (value == 5) {
                    return _('Dispose failure Alarm');
					}

					return value;
					}
					},
					{  
					text: _('Solution'),  
					sortable : false,  
					dataIndex: 'howToDesc'  
					},
					], 
					 bind: {
					store: '{alarmAlllist_remote}',
					},
					     // 分页工具条位置
					//pagingbarDock: 'bottom',
					pagingbarDock: 'top',
					// 默认每页记录数
					pagingbarDefaultValue: 15,
					// 分页策略
					pagingbarConfig: {
					fields: [{
						name: 'val',
					type: 'int'
					}],
					data: [{
					val: 15
					},
				{
                val: 30
				},
				{
                val: 60
				},
				{
                val: 100
				},
				{
                val: 200
				},
				{
                val: 500
				},
				{
                val: 1000
				},
				{
                val: 2000
				},
				]
			},
                
					}
				
		],
		bbar:[ 
                 '->',
                	{
						 xtype:'button',
						 text: _('Ok'),
						 handler:'onAlarmConfirm'
					},
					{
						 xtype:'button',
						 text: _('Canceled'),
						 handler:'onAlarmCancel',
					},
                 ],
	
		},
			{
			xtype :'panel',
			reference:'NeQueryPanel',
			items:[
				{
					xtype: 'panel',
					//layout:'hbox',
					items:[
					
					{
					xtype: 'fieldset',
					title: _('Ne Name Search'),
					layout:{
						type: 'hbox'
					},
					items:[
					{
						 xtype:'textfield',
						 fieldLabel: _('neName'),
						 name: 'neName'
					},
					{
						 xtype:'button',
						 text: _('Query'),
						 iconCls: 'x-fa fa-search',
						 handler:'onNeQuery'
					}
					]
					}
					]
						
					},
					{
                    xtype: 'PagedGrid',
					reference:'nePagedGrid',
                    border: true,
					autoHeight:true,
					selType: 'checkboxmodel',
					columns: [ 
					{text: _('neId'),  
					sortable : false, 
					flex : 1,  					
					dataIndex: 'resId'  
					},  
					{text: 'resTypeName',  
					sortable : false,  
					hidden : true,
					dataIndex: 'resTypeName'  
					}, 
					{text: 'symbolId',  
					sortable : false,  
					hidden : true,
					dataIndex: 'symbolId'  
					}, 
					{  
					text     : _('neName'),  
					sortable : false, 
					flex : 1,  	
					dataIndex: 'name'  
					},
					{  
					text: _('IP Address'),  
					sortable : false,  
					dataIndex: 'ipaddress',
					flex:2
					} ,
					{  
					text: _('MAC Address'),  
					sortable : false,  
					dataIndex: 'macaddress',
					flex:2
					},
					{  
					text: _('Host name'),  
					sortable : false,  
					dataIndex: 'hostname',
					flex:2
					} 

					],              
                    bind: {
					store: '{neAlllist_remote}',
					},
					     // 分页工具条位置
			//pagingbarDock: 'bottom',
			pagingbarDock: 'top',
			// 默认每页记录数
			pagingbarDefaultValue: 15,
			// 分页策略
			pagingbarConfig: {
            fields: [{
                name: 'val',
                type: 'int'
				}],
				data: [{
                val: 15
				},
				{
                val: 30
				},
				{
                val: 60
				},
				{
                val: 100
				},
				{
                val: 200
				},
				{
                val: 500
				},
				{
                val: 1000
				},
				{
                val: 2000
				},
            ]
        },
                
					}
				
	],
		bbar:[ 
                 '->',
                	{
						 xtype:'button',
						 text: _('Ok'),
						 handler:'onNeConfirm'
					},
					{
						 xtype:'button',
						 text: _('Canceled'),
						 handler:'onNeCancel',
					},
                 ],
	
		}
		]


});
