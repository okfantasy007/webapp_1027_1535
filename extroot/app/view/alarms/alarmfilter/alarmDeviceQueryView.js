Ext.define('Admin.view.alarms.alarmfilter.alarmDeviceQueryView', {
    extend: 'Ext.form.Panel',
    xtype: 'alarmDeviceQueryView',
    requires: ['Admin.view.base.PagedGrid',
    //'Admin.view.alarms.alarmTypeMenu'
    ],
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            devicelist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAllDevices',
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
                    url: '/alarm/alarmResource/getAllAlarmsByDevice',
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
			var neId ="'"+ record.get('neId')+"'";
			var neName = "'"+record.get('neName')+"'";
			var neType = "'"+record.get('neType')+"'";
			var ipAddress = "'"+record.get('ipAddress')+"'";
			nejson= nejson +"neId :"+neId+","+" neName:"+neName+","+" neType:"+neType+","+" ipAddress:"+ipAddress +"},"
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
                               url: 'alarm/alarmResource/checkAlarmDeviceFilter',
                               method: 'post',
                               params: {
                                     isCorbaFilter:isCorbaFilter,
									 isUsed:isUsed,
									 isSaved:isSaved,
                                     alarmjson: alarmjson,
									 nejson:nejson,
									// creator:creator
                                },
                               success: function(response) {
							   if(response.responseText=='true'){
								   Ext.Msg.confirm(_("Confirm"), _("Filter Operation Tips"), function (btn) {
									if(btn=='yes'){
									Ext.Ajax.request({
                                    url: 'alarm/alarmResource/addAlarmDeviceFilter',
                                    method: 'post',
                                    params: {
										isCorbaFilter:isCorbaFilter,
										isUsed:isUsed,
										isSaved:isSaved,
                                        alarmjson: alarmjson,
										nejson:nejson,
									//	creator:creator
                                    },
                                    success: function(response) {
                                        if (response.responseText) {
                                            view.setActiveItem(treepanel);
                                            treepanel.getStore().reload();
                                        }

                                    },
									 failure: function(response) {
									
									 Ext.Msg.alert(_('Tips'), _('save unsuccessfully'));
							
                               
								}
                                });
										
									}
									});
							   }else{
						  		Ext.Ajax.request({
                                    url: 'alarm/alarmResource/addAlarmDeviceFilter',
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
									 failure: function(response) {
									
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
			 
			targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAllAlarmsByDevice';
            targetGrid.getStore().proxy.extraParams = {condition:neType};
            targetGrid.getStore().reload(); 
			 }else{
				targetGrid.getStore().removeAll(); 
			 }
			 
			
		},

        onQuery: function() {
			
			var devicegrid = this.getView().down('PagedGrid');
			var deviceValue = this.getView().down('textfield').getValue();
            devicegrid.getStore().proxy.url = 'alarm/alarmResource/getAllDevices';
            devicegrid.getStore().proxy.extraParams = {condition:deviceValue};
            devicegrid.getStore().reload();

        },

        onRefresh: function() {
			
            this.lookupReference('alarmGrid').getStore().reload();
        },
        
        onReset: function() {
			var form = this.getView().down('form');
           form.getForm().reset();
        },

    },

    items: [
	{
        title:_('Device Filter'),
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
        }],
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
				fieldLabel: _('Device Name'),
				name: 'deviceName'
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
        xtype: 'PagedGrid',
		autoHeight:true,
		height:250,
        // 绑定到viewModel的属性
        bind: {
            store: '{devicelist_remote}',
        },

        selType: 'checkboxmodel',

        // grid显示字段
        columns: [{
            xtype: 'rownumberer',
            width: 60,
            sortable: true,
            align: 'center'
        },
        {
            text: _('neId'),
            dataIndex: 'neId',
			
        },
        {
            text: _('NE Name'),
            dataIndex: 'neName',
			width:200
        },
   
        {
            text: _('neType'),
            dataIndex: 'neType',
			width:200
          
        },
        {
            text: _('IP Adress'),
            dataIndex: 'ipAddress',
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
		margin:5,
		xtype:'panel',
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
          
            align: 'center'
        },
        {
            text: 'ID',
            dataIndex: 'id',
			
        },
        {
            text: _('Alarm Name'),
            dataIndex: 'alarmName',
			flex:2
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
			flex:1,
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