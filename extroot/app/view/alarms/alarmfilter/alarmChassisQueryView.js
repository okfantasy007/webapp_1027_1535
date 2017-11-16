Ext.define('Admin.view.alarms.alarmfilter.alarmChassisQueryView', {
    extend: 'Ext.form.Panel',
    xtype: 'alarmChassisQueryView',
    requires: ['Admin.view.base.PagedGrid',
    //'Admin.view.alarms.alarmTypeMenu'
    ],
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            chassislist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAllChassises',
                    actionMethods: {
                        read: 'POST',
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
				 alarmlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAllAlarmsByChassis',
					extraParams:{condition:''},
                    actionMethods: {
                        read: 'POST',  
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
		
		isShow: function(obj, ischecked) {
            if (ischecked) {
				this.getView().down('fieldset').setVisible(true);
            } else {
               this.getView().down('fieldset').setVisible(false);
            }
        },
		
		onSubmit:function(){
			var treepanel =	this.getView().up().down('treepanel');
			var negrid = this.getView().down('PagedGrid');
		    var alarmgrid = this.getView().down('PagedGrid').nextSibling().down('grid');
			var view =this.getView().up();	
			var checkbox_panel =this.getView().down('PagedGrid').nextSibling().nextSibling();
			var isUsed = checkbox_panel.down('checkboxfield').getValue();
			var isCorbaFilter = checkbox_panel.down('checkboxfield').nextSibling().getValue();
			var isSaved =checkbox_panel.down('checkboxfield').nextSibling().nextSibling().getValue();
					
			var records = negrid.getSelectionModel().getSelection();
			var nejson="[" ;
			if(records.length==0){
		 	nejson = "[]";
			Ext.Msg.alert(_('Tips'), _('Please Choose One Alarm Source'));
			return;
			}else{
			for(var i=0;i<records.length;i++){
			nejson= nejson+'{';
		    var record = records[i]; 
			var chassisid ="'"+ record.get('chassisid')+"'";
			var ipAddress = "'"+record.get('ipAddress')+"'";
			var hostName = "'"+record.get('hostName')+"'";
			var chassisName = "'"+record.get('chassisName')+"'";
			var chassisType = "'"+record.get('chassisType')+"'";
			var neId = "'"+record.get('neId')+"'";
			var neType = "'"+record.get('neType')+"'";

			nejson= nejson +"chassisid :"+chassisid+","+"chassisType :"+chassisType+","+"chassisName :"+chassisName+","+"neId :"+neId+","+" neType:"+neType+","+" hostName:"+hostName+","+" ipAddress:"+ipAddress +"},"
				}
		    nejson=nejson.substring(0,nejson.length-1)+"]";
			}
						
			var alarmRecords = alarmgrid.getSelectionModel().getSelection();  
			var alarmjson="[" ;
			if(alarmRecords.length==0){
				alarmjson ="[]";
				alarmjson ="[{"+"id :"+"'-1000'"+","+" alarmName:"+"'"+_('All Alarm Type')+"'" +"}]";
			}else{
				for(var i=0;i<alarmRecords.length;i++){
				alarmjson= alarmjson+'{';
				var record = alarmRecords[i]; 
				var alarmTypeId ="'"+ record.get('id')+"'";
				var alarmName = "'"+record.get('alarmName')+"'";
				var alarmLevel = "'"+record.get('alarmLevel')+"'";
				var isAfectService = "'"+record.get('isAfectService')+"'";
				alarmjson= alarmjson  +"alarmLevel :"+alarmLevel+","+"isAfectService :"+isAfectService+","+"id :"+alarmTypeId+","+" alarmName:"+alarmName +"},"
					}
				alarmjson=alarmjson.substring(0,alarmjson.length-1)+"]";
					 }

				 Ext.Ajax.request({
                               url: 'alarm/alarmResource/checkAlarmChassisFilter',
                               method: 'post',
                               params: {
                                    isCorbaFilter:isCorbaFilter,
									isUsed:isUsed,
									isSaved:isSaved,
                                    alarmjson: alarmjson,
									nejson:nejson,
									//creator:creator
                                },
                               success: function(response) {
							   if(response.responseText=='true'){
								   Ext.Msg.confirm(_("Confirm"), _("Filter Operation Tips"), function (btn) {
									if(btn=='yes'){
									Ext.Ajax.request({
                                    url: 'alarm/alarmResource/addAlarmsByChassis',
                                    method: 'post',
                                    params: {
										isCorbaFilter:isCorbaFilter,
										isUsed:isUsed,
										isSaved:isSaved,
                                        alarmjson: alarmjson,
										nejson:nejson,
										//creator:creator
                                    },
                                    success: function(response) {              
                                        if (response.responseText) {
                                            //alert('success');
										   view.setActiveItem(treepanel);
                                           treepanel.getStore().reload();
                                        }

                                    },
									 failure: function(form, action) {
									
									 Ext.Msg.alert(_('Tips'), _('save unsuccessfully'));
							
								}
                                });
										
									}
									});
							   }else{
								   
								   Ext.Ajax.request({
                                    url: 'alarm/alarmResource/addAlarmsByChassis',
                                    method: 'post',
                                    params: {
										isCorbaFilter:isCorbaFilter,
										isUsed:isUsed,
										isSaved:isSaved,
                                        alarmjson: alarmjson,
										nejson:nejson,
										//creator:creator
                                    },
                                    success: function(response) {
                                        if (response.responseText) {
                                           view.setActiveItem(treepanel);
                                           treepanel.getStore().reload();
                                        }

                                    },
									 failure: function(form, action) {
									
									 Ext.Msg.alert(_('Tips'), _('save unsuccessfully'));
							
								}
                                });
								     
							   }
					
                              
                                 },
							  failure: function(form, action) {
								Ext.Msg.alert(_('Tips'), _('Check failure'));
						
                               
                           }
                        });	

		
		},
		onCancel:function(){
			var treepanel =	this.getView().up().down('treepanel');
			this.getView().up().setActiveItem(treepanel);
		},
		
		onChecked:function(){
			
			 var grid =  this.getView().down('PagedGrid');
			 var targetGrid =grid.nextSibling().down('grid');
			 var checkValue =grid.nextSibling().down('checkboxfield');			 
			 if(!checkValue.checked){
		     var records = grid.getSelectionModel().getSelection();
			 var neType="(";
			 if(0==records.length){
				neType = neType+ "'')";
			 }else{
			  for(var i=0;i<records.length;i++){
			 neType =neType+"'"+ records[i].get('neType')+"'"+",";
			 }
			 neType=neType.substring(0,neType.length-1)+")";	 
			 }
			 
			targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAllAlarmsByChassis';
            targetGrid.getStore().proxy.extraParams = {condition:neType};
            targetGrid.getStore().reload(); 
			 }else{
				targetGrid.getStore().removeAll(); 
			 }
			 
			
		},

        onQuery: function() {

			var chasssisgrid = this.getView().down('PagedGrid');	
			var chassisName = this.getView().down('textfield').getValue();
            chasssisgrid.getStore().proxy.url = 'alarm/alarmResource/getAllChassises';
            chasssisgrid.getStore().proxy.extraParams = {chassisName:chassisName};
            chasssisgrid.getStore().reload();

        },

        onRefresh: function() {
            this.lookupReference('alarmGrid').getStore().reload();
        },
        
        onReset:function(){
			var form = this.getView().down('form');
            form.getForm().reset();
		}

    },

    items: [
	{
         title:_('Chassis Filter'),
         xtype: 'panel',
         iconCls: 'x-fa fa-circle-o',
         titleAlign:'left',
         dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
			style: {
				background: '#E0E0E0',//'#D8D8D8',//'#FFCC66',
				bodyStyle: 'border-width:0 0 3px 0;'
			},
            items: ['->', {
                xtype: 'checkbox',
                boxLabel: _('Show Conditions'),
                tooltip: _('Show Conditions'),
                checked: false,
                handler: 'isShow'
            }
            
            ]
        }]
    },
	{
			xtype: 'fieldset',
			title: _('Query Condition'),
			hidden:true,
			defaults: {
            labelWidth: 90,
            anchor: '100%',
			},
			items: [
				{
				xtype: 'form',
				bodyStyle: {
				background: '#f6f6f6'
				},
				fieldDefaults : {
				labelAlign : 'right',
				},
				items: [
				{
				xtype: 'textfield',
				fieldLabel: _('Chassis Name'),
				name: 'chassisName'
				}
				],
				  buttons:
				[
				{
				text: _('Query'),
                iconCls: 'x-fa fa-search',
                handler: 'onQuery'
				},
				{
                text: _('Reset'),
                iconCls:'x-fa fa-undo',
				handler: 'onReset'
				}
				]
				}
			]
	
		
	},
	
    {
        title: _('Chassis Filter'),
		header:false,
        xtype: 'PagedGrid',
		autoHeight: true,
		autoWidth:true,
		height:250,
        reference: 'chassisGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{chassislist_remote}',
        },

        selType: 'checkboxmodel',

        // grid显示字段
        columns: [{
            xtype: 'rownumberer',
            width: 60,
            sortable: false,
            align: 'center'
        },
		 {
            text: _('Chassis Name'),
            dataIndex: 'chassisName',
			width:150
        },
        {
            text: 'chassisid',
            dataIndex: 'chassisid',
			hidden:true
			
        },
        {
            text: _('IP Address'),
            dataIndex: 'ipAddress',
			width:150
        },
		 {
            text: _('Host Name'),
            dataIndex: 'hostName',
			width:150
        },
		
        {
            text: _('Chassis Type'),
            dataIndex: 'chassisType',
			width:150
          
        },
		{
            text: _('neId'),
            dataIndex: 'neId',
			
        },
        {
            text: _('neType'),
            dataIndex: 'neType',
			width:200
           
        }],
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
        }

    },
{
		title:_('Alarm Type'),
		xtype:'panel',
		margin:5,
		height:200,
		autoScroll:true,
		items:[
		{
			xtype:'grid',
			selType: 'checkboxmodel',
			bind: {
            store: '{alarmlist_remote}',
        },
			columns: [
			{
            xtype: 'rownumberer',
            width: 60,
            sortable: false,
            align: 'center'
        },
        {
            text: 'ID',
            dataIndex: 'id',
			
        },
        {
            text: _('Alarm Name'),
            dataIndex: 'alarmName',
			width:150
        },
        {
            text: _('Alarm Level'),
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
        {
            text: _('Service Affection'),
            dataIndex: 'isAfectService',
			 renderer: function(value) {
                if (value == 0) {
                    return _('No Effect');
                }
                if (value == 1) {
                    return _('Service Deterioration');
                }
                if (value == 2) {
                    return _('Service Interruption');
                }

                return value;
            }
            
        }
       ],
		
		        // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
			{
                fieldLabel: _('All Alarm Type'),
                iconCls: 'x-fa fa-plus',
                xtype:'checkboxfield',
				checked:true,
				handler:'onChecked'
            },
			 
		
            ]
        }],
		}
		]
		
	},
	{
			xtype:'panel',
		     items: [
			 {
				xtype: 'fieldset',
				width:'100%',
				layout: 'hbox',
			 items: [
			 {
                boxLabel: _('Enable Filter Rules'),
                xtype:'checkboxfield'
            },
			 {
                boxLabel: _('Enable Corba Filter'),
                 xtype:'checkboxfield'
            },
			 {
                boxLabel: _('Save History'),
                 xtype:'checkboxfield'
            }
			
			]}
	
            ]
	}
	
	],
	 buttons: [
			{
                text:_('Confirm'),
				handler:'onSubmit'
            },
			{
                text:_('Cancel'),
				handler:'onCancel'
            }
		 ]

});