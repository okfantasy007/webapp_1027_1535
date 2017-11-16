Ext.define('Admin.view.alarms.alarmfilter.alarmPortQueryView', {
    extend: 'Ext.form.Panel',
    xtype: 'alarmPortQueryView',
    requires: ['Admin.view.base.PagedGrid',
    //'Admin.view.alarms.alarmTypeMenu'
    ],
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
                portlist_remote: {
                autoLoad: true,
				pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAllPorts',
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
                    url: '/alarm/alarmResource/getAllAlarmsByPort',
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
			var checkbox_panel =this.getView().down('PagedGrid').nextSibling().nextSibling();
			var isUsed =checkbox_panel.down('checkboxfield').getValue();
			var isCorbaFilter = checkbox_panel.down('checkboxfield').nextSibling().getValue();
			var isSaved =checkbox_panel.down('checkboxfield').nextSibling().nextSibling().getValue();
			var view =this.getView().up();
			var records = negrid.getSelectionModel().getSelection();
			//var creator =  APP.user;
			var nejson="[" ;
			if(records.length==0){
			nejson = "[]";
			Ext.Msg.alert(_('Tips'), _('Please Choose One Alarm Source'));
			return;
			}else{
			for(var i=0;i<records.length;i++){
			nejson= nejson+'{';
		    var record = records[i]; 
			var portid ="'"+ record.get('portid')+"'";
			var portIndex = "'"+record.get('portIndex')+"'";
			var hostName = "'"+record.get('hostName')+"'";
			var portName = "'"+record.get('portName')+"'";
			var ipAddress = "'"+record.get('ipAddress')+"'";
			var neType = "'"+record.get('neType')+"'";
			var neId = "'"+record.get('neId')+"'";
						
			nejson= nejson +"neId :"+neId+","+"portid :"+portid+","+"portIndex :"+portIndex+","+"hostName :"+hostName+","+" portName:"+portName+","+" neType:"+neType+","+" ipAddress:"+ipAddress +"},"
				}
		    nejson=nejson.substring(0,nejson.length-1)+"]";
			}
						
			var alarmRecords = alarmgrid.getSelectionModel().getSelection();  
			var alarmjson="[" ;
			if(alarmRecords.length==0){
				alarmjson ="[]";
				//測試所有告警類型
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
                               url: 'alarm/alarmResource/checkAlarmPortFilter',
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
                                    url: 'alarm/alarmResource/addAlarmsByPort',
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
                                    url: 'alarm/alarmResource/addAlarmsByPort',
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
			 
			targetGrid.getStore().proxy.url = 'alarm/alarmResource/getAllAlarmsByPort';
            targetGrid.getStore().proxy.extraParams = {condition:neType};
            targetGrid.getStore().reload(); 
			 }else{
				targetGrid.getStore().removeAll(); 
			 }
			 
			
		},

        onQuery: function() {

			var portgrid = this.getView().down('PagedGrid');	
			var portName = this.getView().down('textfield').getValue();
            portgrid.getStore().proxy.url = 'alarm/alarmResource/getAllPorts';
            portgrid.getStore().proxy.extraParams = {portName:portName};
            portgrid.getStore().reload();

        },

        onRefresh: function() {
            this.lookupReference('alarmGrid').getStore().reload();
        },
        
        onReset: function() {
             var form = this.getView().down('form');
            form.getForm().reset();
        }

    },

    items: [
{
         title:_('Port Filter'),
         xtype: 'panel',
         iconCls: 'x-fa fa-circle-o',
         titleAlign:'left',
		 		 // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
			style: {
				background: '#E0E0E0',//'#D8D8D8',//'#FFCC66',
				bodyStyle: 'border-width:0 0 3px 0;'
			},
            items: ['->', {
                xtype: 'checkbox',
                boxLabel: _('Display Query Condition'),
                tooltip: _('Display Query Condition'),
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
				fieldLabel: _('Port Name'),
				name: 'portName'
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
        title: _('Port Filter'),
		header:false,
        xtype: 'PagedGrid',
		autoHeight: true,
		autoWidth:true,
		height:250,
        reference: 'alarmGrid',

        // 绑定到viewModel的属性
        bind: {
            store: '{portlist_remote}',
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
            text: 'portid',
            dataIndex: 'portid',
			hidden:true
			
        },
        {
            text: _('Port Index'),
            dataIndex: 'portIndex',
			
        },
		 {
            text: _('Host Name'),
            dataIndex: 'hostName',
			width:150
        },
        {
            text: _('Port Name'),
            dataIndex: 'portName',
			width:150
        },
        {
            text: _('IP Adress'),
            dataIndex: 'ipAddress',
			width:150
          
        },
		{
            text: _('neId'),
            dataIndex: 'neId',
			width:150
          
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
		columns: [{
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
            
        },
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
                text:_('Ok'),
				handler:'onSubmit'
            },
			{
                text:_('Cancel'),
				handler:'onCancel'
            }
		 ]

});