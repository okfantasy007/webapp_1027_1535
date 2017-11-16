Ext.define('Admin.view.alarms.alarmfilter.alarmTypeQueryView', {
    extend: 'Ext.form.Panel',
    xtype: 'alarmTypeQueryView',
    requires: ['Admin.view.base.PagedGrid',
    //'Admin.view.alarms.alarmTypeMenu'
    ],
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
                    url: '/alarm/alarmResource/getalarmType',
            
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
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
		
		
		onReset:function(){
			var form = this.getView().down('form');
            form.getForm().reset();
		},
		
        onQuery: function() {

            var alarmGrid = this.getView().down('PagedGrid');
            var view = this.getView();
			var alarmName = this.getView().down('form').down('textfield').getValue();
            alarmGrid.getStore().proxy.url = 'alarm/alarmResource/getalarmType';
            alarmGrid.getStore().proxy.extraParams = {alarmName:alarmName};
            alarmGrid.getStore().reload();

        },
		onCancel:function(){
			var grid =	this.getView().up().down('grid');
			console.log('tt',grid);
			this.getView().up().setActiveItem(grid);
		},
        onSubmit: function(){
					var view =this.getView().up();
					var targetGrid =this.getView().up().down('grid');
					var grid = this.getView().down('PagedGrid');
						//console.log.
					var checkbox_panel =grid.nextSibling();
					console.log('aa',checkbox_panel);
				//	var tt = checkbox_panel.down('checkboxfield').getValue();
					var isUsed = "'"+checkbox_panel.down('checkboxfield').getValue()+"'";
					var isCorbaFilter = "'"+checkbox_panel.down('checkboxfield').nextSibling().getValue()+"'";
					var isSaved ="'"+checkbox_panel.down('checkboxfield').nextSibling().nextSibling().getValue()+"'";
				//	console.log('111a',alarmTypeWin.down('checkboxfield'));
					console.log('111',isCorbaFilter);
					console.log('112',isUsed);
					console.log('113',isSaved);
					var records = grid.getSelectionModel().getSelection();
					console.log('aa',records);
					console.log('aa',records.length);
					var len =records.length;
					var json ='';
					if(len==0){
						json ="[]";
						Ext.Msg.alert(_('Tips'), _('Please Choose One Alarm Source'));
						return;
					}else{
					 json="[" ;
					for(var i=0;i<records.length;i++){
						json= json+'{';
						var record = records[i]; 
						var alarmTypeId ="'"+ record.get('id')+"'";
						var alarmName = "'"+record.get('alarmName')+"'";
						var alarmLevel = "'"+record.get('alarmLevel')+"'";
						//var creator =  "'"+APP.user+"'";
						console.log('acca',alarmName +""+alarmTypeId);
						json= json +"alarmLevel :"+alarmLevel+","+"isUsed :"+isUsed+","+"isCorbaFilter :"+isCorbaFilter+","+"isSaved :"+isSaved+","+"alarmId :"+alarmTypeId+","+" strName:"+alarmName +"},"
					}
					json=json.substring(0,json.length-1)+"]";	
					}
					 Ext.Ajax.request({
                               url: '/alarm/alarmResource/checkAlarmTypeFilter',
                               method: 'post',
                               params: {
                                     condition: json
                                },
                               success: function(response) {
                               console.log("112", response.responseText);
							   if(response.responseText=='true'){
								   Ext.Msg.confirm(_("Confirm"), _("Filter Operation Tips"), function (btn) {
									console.log('tt',btn);
									if(btn=='yes'){
								  Ext.Ajax.request({
                                  url: '/alarm/alarmResource/addAlarmTypeFilter',
                                  method: 'post',
                                  params: {
                                        condition: json
                                    },
                                  success: function(response) {
                                      console.log("112", response.responseText);
                                   if (response.responseText) {
                                           	Ext.Msg.alert(_('Success'), _('save successfully'));
                                            targetGrid.getStore().reload();
											view.setActiveItem(targetGrid);
                                     }else{
										 	Ext.Msg.alert(_('Tips'),_('save unsuccessfully'));
									 }

                                   },
								    failure: function(form, action) {
									console.log('aam1m',action.result);
									
									 Ext.Msg.alert(_('Tips'),_('save unsuccessfully'));
							
                               
                            }
                           });
										
									}
									});
							   }else{
								  Ext.Ajax.request({
                                  url: '/alarm/alarmResource/addAlarmTypeFilter',
                                  method: 'post',
                                  params: {
                                        condition: json
                                    },
                                  success: function(response) {
                                      console.log("112", response.responseText);
                                   if (response.responseText) {
                                           	Ext.Msg.alert(_('Success'), _('save successfully'));
                                            targetGrid.getStore().reload();
											view.setActiveItem(targetGrid);
                                     }else{
										 	Ext.Msg.alert(_('Tips'), _('save unsuccessfully'));
									 }

                                   },
								    failure: function(form, action) {
									console.log('aam1m',action.result);
									
									 Ext.Msg.alert(_('Tips'), _('save unsuccessfully'));
							
                               
                            }
                           });  
							   }
					
                              
                                 },
							  failure: function(form, action) {
								Ext.Msg.alert(_('Tips'), _('Check failure'));
						
                               
                           }
                        });
					
					
        }

    },

    items: [
	{
         title:_('Type Filter'),
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
				fieldLabel: _('Alarm Name'),
				name: 'alarmName'
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
        title: _('Type Filter'),
		header:false,
        xtype: 'PagedGrid',
		height:400,
        reference: 'alarmGrid',
        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}',
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
            text: 'ID',
            dataIndex: 'id',
			hidden:true
			
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
            text: _('EventType'),
            dataIndex: 'eventType',
            renderer: function(value) {
                 if (value == 0) {
                    return _('Unknown');
                }
                if (value == 1) {
                    return _('Revertive');
                }
                if (value == 2) {
                    return _('Fault');
                }
				if (value == 3) {
                    return _('Notify');
                }

                return value;
            }
        },
        {
            text: _('Alarm Category'),
            dataIndex: 'alarmCategory',
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
        {
            text: _('Fault Description'),
            dataIndex: 'errorDesc',
			flex:1
          
        },
        ],
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
                text:_('Cancle'),
				handler:'onCancel'
            }
		 ]

});