Ext.define('Admin.view.alarms.alarmtype.alarmTypeView', {
    extend: 'Ext.container.Container',
    xtype: 'alarmTypeView',
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
                    extraParams: {
                        condition: '15'
                    },
                    actionMethods: {
                        read: 'POST',
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                    }
                }

            },
            levellist_remote: {
                autoLoad: true,
                fields: ["value", "text"],
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getalarmLevel',
                    reader: 'json'
                }

            },
            eventType_list_remote: {
                autoLoad: true,
                fields: ["value", "text"],
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getalarmEventType',
                    reader: 'json'
                }

            },
            alarmCategory_list_remote: {
                autoLoad: true,
                fields: ["value", "text"],
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAlarmTypeCategory',
                    reader: 'json'
                }

            },
            afectService_list_remote: {
                autoLoad: true,
                fields: ["value", "text"],
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarmResource/getAlarmAfectService',
                    reader: 'json'
                }

            },
        }
    },

    controller: {

        createRepairExperienceWin: function(rowRecord) {
            var alarmRepairExperienceWin = Ext.create("Ext.window.Window", {
                reference: 'alarmRepairExperienceWin',
                title: _('Troubleshooting'),
                closable: true,
                //这里要注意不要写成 closeable（多一个e）
                border: false,
                layout: {
                    type: 'border',
                    align: 'center'
                },
                bodyStyle: "padding:5px;",
				modal:true,
				resizable:false,
                items: [{
                    xtype: 'grid',
                    title: _('Troubleshooting'),
					header:false,
                    border: true,
                    width: '100%',
                    height: '50%',
                    region: 'north',
                    columns: [{
                        text: _('Fault Cause'),
                        dataIndex: 'reson',
						flex:1
                    },
                    {
                        text: _('Solution'),
                        dataIndex: 'resolveResult',
						flex:2
                    },
                    {
                        text: _('Recording Time'),
                        dataIndex: 'recorder',
						flex:1
                    },
                    {
                        text: _('Noter'),
                        width: 75,
                        dataIndex: 'recorderTime',
						flex:1
                    },
                    {
                        text: 'experienceId',
                        width: 75,
                        dataIndex: 'experienceId',
                        hidden: true,
                    }],
                    // One header just for show. There's no data,
                    store: Ext.create("Ext.data.Store", {
                        fields: [{
                            name: 'reson',
                            type: 'string'
                        },
                        {
                            name: 'resolveResult',
                            type: 'string'
                        },
                        {
                            name: 'recorder',
                            type: 'string'
                        },
                        {
                            name: 'recorderTime',
                            type: 'string'
                        },
                        {
                            name: 'experienceId',
                            type: 'string'
                        },
                        ],
                        autoLoad: true,
                        proxy: {
                            type: "ajax",
                            url: "/alarm/alarmResource/getRepairExperience",
                            extraParams: {
                                condition: rowRecord.get('alarmName')
                            },
                            actionMethods: {
                                read: 'POST',
                            },
                            reader: {
                                type: 'json',
                                rootProperty: 'data',
                            }
                        }
                    }),
                    listeners: {
                        rowclick: function(grid, idnex, e) {

                            var records = this.getSelectionModel().getSelection();
                            var experienceId = records[0].get('experienceId');
                            var grid2 = this.nextSibling();
                            
                            Ext.Ajax.request({
                                url: '/alarm/alarmResource/getHistoryAlarm',
                                method: 'post',
                                params: {
                                    condition: experienceId
                                },
                                success: function(response) {
                                    grid2.getStore().removeAll();
                                    var value = Ext.decode(response.responseText);
                                    for (var i = 0; i < value.length; i++) {
                                        grid2.getStore().insert(i, value[i]);
                                    }

                                }
                            });

                        }
                    }

                },
                {

                    xtype: 'grid',
                    reference: 'historyAlarm',
                    title: _('Relation History Alarm'),
                    border: true,
                    width: '100%',
                    height: '50%',
                    region: 'south',
                    columns: [{
                        text:  _('Alarm Name'),
                        dataIndex: 'alarmName',
						flex:2
                    },
                    {
                        text:  _('Alarm Source'),
                        dataIndex: 'alarmSource',
						flex:1
                    },
                    {
                        text: _('Specific Location'),
                        dataIndex: 'alarmLoction',
						flex:1
                    },
                    {
                        text: _('Generate Time'),
                        width: 75,
                        dataIndex: 'alarmStartTime',
						flex:1
                    },
                    {
                        text: _('Device Type'),
                        dataIndex: 'neType',
						flex:1
                    },
                    {
                        text: _('Alarm ID'),
                        dataIndex: 'alarmId',
						flex:1
                    }],
                    // One header just for show. There's no data,
                    store: Ext.create('Ext.data.Store', {
                        fields: [{
                            name: 'alarmName',
                            type: 'string'
                        },
                        {
                            name: 'alarmSource',
                            type: 'string'
                        },
                        {
                            name: 'alarmLoction',
                            type: 'string'
                        },
                        {
                            name: 'alarmStartTime',
                            type: 'string'
                        },
                        {
                            name: 'neType',
                            type: 'string'
                        },
                        {
                            name: 'alarmId',
                            type: 'string'
                        }],
                        data: []
                    })

                }],
                closeAction: 'hide',
                width: '50%',
                height: '70%',
                buttons: [{
                    xtype: "button",
                    text: _('Confirm'),
                    handler: function() {
                        alarmRepairExperienceWin.close();
                    }
                },
                {
                    xtype: "button",
                    text: _('Cancel'),
                    handler: function() {
                        alarmRepairExperienceWin.close();
                    }
                }]
            });

            return alarmRepairExperienceWin;
        },
        createEditForm: function(rowRecord) {
            var alarmEditForm = Ext.create('Ext.form.Panel', {
                reference: 'alarmEditForm',
                title: _('Basic Info'),
                header: false,
                border: false,
                collapsible:true,
                layout: {
                    type: 'table',
                    columns: 1
                },
				fieldDefaults : {
				labelAlign : "right",
				margin: '0 0 15 0',
				},
                items: [
				{
				xtype: 'fieldset',
				title: _('Alarm Type Info'),
				items:[
				{
                    xtype: 'textfield',
                    fieldLabel: _('Alarm ID'),
                    name: 'id',
                    hidden: true,
                },
                {
                    xtype: 'textfield',
                    fieldLabel: _('Alarm Name'),
                    name: 'alarmName',
					editable:false
                },
                {
                    xtype: 'combo',
                    fieldLabel: _('Alarm Level'),
                    name: 'alarmLevel',
                    //   allowBlank:false,
                    emptyText:  _("--Please select--"),
                    store: Ext.create('Ext.data.Store', {
                        fields: ["value", "text"],
                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: '/alarm/alarmResource/getEditalarmLevel',
                            reader: {
                                type: 'json',
                            }
                        }

                    }),
                    displayField: 'text',
                    valueField: 'value',
					editable:false

                },

                {
                    xtype: 'combo',
                    fieldLabel: _('Alarm Category'),
                    name: 'alarmCategory',
                    allowBlank: false,
                    emptyText: _("--Please select--"),
                    //  queryMode:'local',
                    store: Ext.create('Ext.data.Store', {
                        fields: ["value", "text"],

                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: '/alarm/alarmResource/getEditAlarmTypeCategory',
                            reader: {
                                type: 'json',
                            }
                        }

                    }),
                    displayField: "text",
                    valueField: 'value',
					editable:false

                },
                {
                    xtype: 'combo',
                    fieldLabel: _('Service Affection'),
                    name: 'isAfectService',
                    allowBlank: false,
                    emptyText: _("--Please select--"),
                    store: Ext.create('Ext.data.Store', {
                        fields: ["value", "text"],
                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: '/alarm/alarmResource/getEditAlarmAfectService',
                            reader: {
                                type: 'json',
                            }
                        }

                    }),
                    displayField: "text",
                    valueField: 'value',
					editable:false

                },
                {
                    xtype: 'textfield',
                    fieldLabel: _('Fault Description'),
                    name: 'errorDesc'
                },
                {
                    xtype: 'textarea',
                    fieldLabel: _('Solution'),
                    name: 'howToDesc'

                }
				]
				}
				],
            });
            return alarmEditForm;
        },
        createEditWin: function(rowRecord, grid) {

            var alarmEditForm = this.createEditForm(rowRecord);

            var alarmEditWin = Ext.create("Ext.window.Window", {
                reference: 'alarmEditWin',
                title: _('templateEdit'),
                closable: true,
                modal:true,
                autowidth: true,
                autoheight: true,
                border: false,
				//layout:'fit',
                //bodyStyle: "padding:20px;",
				layout: {
                    type: 'vbox',
                    align: 'center'
                }, 
                items: alarmEditForm,
                closeAction: 'hide',
                width: 400,
                height: 500,
				resizable:false,
                buttons: [{
                    xtype: "button",
                    text: _("Ok"),
                    handler: function() {
                        alarmEditForm.getForm().submit({
                            url: '/alarm/alarmResource/modifyAlarmType',
                            waitTitle: _('Please wait...'),
                            waitMsg: _('Please wait...'),
                            success: function(form, action) {
                                if (action.result.with_err) {
                                    Ext.Msg.alert(_('Tips'),  _('Set unsuccessfully'));
									
                                } else {
                                    Ext.Msg.alert(_('Success'), _('Set successfully'));
									  

                                }
								grid.getStore().reload();

                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Tips'),  _('Set unsuccessfully'));
								  
                            }

                        });
                        alarmEditWin.close();

                    }
                },
                {
                    xtype: "button",
                    text: _("Cancel"),
                    handler: function() {
                        alarmEditWin.close();
                    }
                }]
            });
            return alarmEditWin;
        },
        createPropertyForm: function(rowRecord) {
            var alarmPropertyForm = Ext.create('Ext.form.Panel', {
                reference: 'alarmPropertyForm',
                title: _('Basic Information'),
                header: false,
                border: false,
                collapsible: true,
                layout: {
                    type: 'table',
                    columns: 1
                },
				fieldDefaults : {
				labelAlign : "right",
				margin: '0 0 15 0',
				},
                items: [
				{
				xtype: 'fieldset',
				title: _('Alarm Type Info'),
				 items: [

                {
                    xtype: 'textfield',
                    fieldLabel: _('Alarm Name'),
                    name: 'alarmName',
                    readOnly: true
                },
                {
                    xtype: 'combobox',
                    fieldLabel: _('Alarm Level'),
                    name: 'alarmLevel',
                    allowBlank: false,
                    emptyText: _("--Please select--"),
                    //queryMode:'local',
                    store: Ext.create('Ext.data.Store', {
                        fields: ["value", "text"],

                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: '/alarm/alarmResource/getalarmLevel',
                            reader: {
                                type: 'json',
                            }
                        }

                    }),
                    displayField: "text",
                    valueField: 'value',
                    readOnly: true

                },

                {
                    xtype: 'combobox',
                    fieldLabel: _('Alarm Category'),
                    name: 'alarmCategory',
                    allowBlank: false,
                    emptyText: _("--Please select--"),
                    store: Ext.create('Ext.data.Store', {
                        fields: ["value", "text"],

                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: '/alarm/alarmResource/getAlarmTypeCategory',
                            reader: {
                                type: 'json',
                            }
                        }

                    }),
                    displayField: "text",
                    valueField: 'value',
                    readOnly: true

                },
                {
                    xtype: 'combobox',
                    fieldLabel: _('Service Affection'),
                    name: 'isAfectService',
                    allowBlank: false,
                    emptyText: _("--Please select--"),
                    //  queryMode:'local',
                    store: Ext.create('Ext.data.Store', {
                        fields: ["value", "text"],

                        autoLoad: true,
                        proxy: {
                            type: 'ajax',
                            url: '/alarm/alarmResource/getAlarmAfectService',
                            reader: {
                                type: 'json',
                            }
                        }

                    }),
                    displayField: "text",
                    valueField: 'value',
                    readOnly: true

                },
                {
                    xtype: 'textfield',
                    fieldLabel: _('Fault Description'),
                    name: 'errorDesc',
                    readOnly: true
                },
                {
                    xtype: 'textarea',
                    fieldLabel: _('Solution'),
                    name: 'howToDesc',
                    readOnly: true

                }]
				}
				]
               
            });
            return alarmPropertyForm;

        },
        createPropertyWin: function(rowRecord) {
            var alarmPropertyForm = this.createPropertyForm(rowRecord);
            var alarmPropertyWin = Ext.create("Ext.window.Window", {
                reference: 'alarmPropertyWin',
                title: _('Properties'),
                closable: true,
                autowidth: true,
                autoheight: true,
				modal:true,
                border: false,
				resizable:false,
				layout: {
                    type: 'vbox',
                    align: 'center'
                }, 
                items: alarmPropertyForm,
                closeAction: 'hide',
                width: 400,
                height: 500,
                buttons: [{
                    xtype: "button",
                    text: _("OK"),
                    handler: function() {
                        alarmPropertyWin.close();
                    }
                },
                {
                    xtype: "button",
                    text: _("Cancle"),
                    handler: function() {
                        alarmPropertyWin.close();
                    }
                }]
            });

            return alarmPropertyWin;
        },

        getmainMenu: function(rowRecord, grid) {

            var alarmRepairExperienceWin = this.createRepairExperienceWin(rowRecord);
            var alarmEditWin = this.createEditWin(rowRecord, grid);
            var alarmPropertyWin = this.createPropertyWin(rowRecord);
			var form = this.lookupReference('alarmTypeForm');
			var alarmGrid = this.lookupReference('alarmGrid');
            var mainMenu = Ext.create('Ext.menu.Menu', {
                reference: "alarmMainMenu",
                items: [{
                    text: _('Level Set'),
					iconCls:'x-fa fa-exclamation-triangle',
                    menu: {
                        reference: "alarmLevel",
                        items: [{
                            name: 'critical',
                            text: _('Critical'),
							iconCls:'x-fa fa-exclamation-triangle',
                            handler: function() {
                                var alarmTypeId = rowRecord.get('id');
                                Ext.Ajax.request({
                                    url: '/alarm/alarmResource/modifyAlarmLevel',
                                    method: 'post',
                                    params: {
                                        id: alarmTypeId,
                                        alarmLevel: '1'
                                    },
                                    success: function(response) {                                
                                        if (response.responseText) {
                                            Ext.Msg.alert(_('Success'), _('Set successfully'));
                                            grid.getStore().reload();
                                        }else{
											 Ext.Msg.alert(_('Tips'),  _('Set unsuccessfully'));
                                            grid.getStore().reload();
										}

                                    }
                                });
                            }
                            ////发起ajax请求；
                        },
                        {
                            name: 'major',
                            text: _('Major'),
							iconCls:'x-fa fa-exclamation-triangle',
                            handler: function() {
                                var alarmTypeId = rowRecord.get('id');
                                Ext.Ajax.request({
                                    url: '/alarm/alarmResource/modifyAlarmLevel',
                                    method: 'post',
                                    params: {
                                        id: alarmTypeId,
                                        alarmLevel: '2'
                                    },
                                    success: function(response) {                                      
                                         if (response.responseText) {
                                            Ext.Msg.alert(_('Success'), _('Set successfully'));
                                            grid.getStore().reload();
                                        }else{
											 Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
                                            grid.getStore().reload();
										}

                                    }
                                });

                            }
                        },
                        {
                            name: 'minor',
                            text: _('Minor'),
							iconCls:'x-fa fa-exclamation-triangle',
                            handler: function() {
                                var alarmTypeId = rowRecord.get('id');
                                Ext.Ajax.request({
                                    url: '/alarm/alarmResource/modifyAlarmLevel',
                                    method: 'post',
                                    params: {
                                        id: alarmTypeId,
                                        alarmLevel: '3'
                                    },
                                    success: function(response) {                                      
                                         if (response.responseText) {
                                            Ext.Msg.alert(_('Success'), _('Set successfully'));
                                            grid.getStore().reload();
                                        }else{
											Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
                                            grid.getStore().reload();
										}

                                    }
                                });

                            }
                        },
                        {
                            name: 'warning',
                            text: _('Prompt'),
							iconCls:'x-fa fa-exclamation-triangle',
                            handler: function() {
                                var alarmTypeId = rowRecord.get('id');
                                Ext.Ajax.request({
                                    url: '/alarm/alarmResource/modifyAlarmLevel',
                                    method: 'post',
                                    params: {
                                        id: alarmTypeId,
                                        alarmLevel: '4'
                                    },
                                    success: function(response) {                                   
                                         if (response.responseText) {
                                            Ext.Msg.alert(_('Success'), _('Set successfully'));
                                            grid.getStore().reload();
                                        }else{
											Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
                                            grid.getStore().reload();
										}

                                    }
                                });

                            }
                        },
                        {
                            name: 'indeterminate',
                            text: _('Unknown Alarm'),
							iconCls:'x-fa fa-exclamation-triangle',
                            handler: function() {
                                var alarmTypeId = rowRecord.get('id');
                                Ext.Ajax.request({
                                    url: '/alarm/alarmResource/modifyAlarmLevel',
                                    method: 'post',
                                    params: {
                                        id: alarmTypeId,
                                        alarmLevel: '5'
                                    },
                                    success: function(response) {                                    
                                        if (response.responseText) {
                                             Ext.Msg.alert(_('Success'), _('Set successfully'));
                                            grid.getStore().reload();
                                        }else{
											 Ext.Msg.alert(_('Tips'), _('Set unsuccessfully'));
                                            grid.getStore().reload();
										}

                                    }
                                });

                            }
                        },

                        ]

                    }
                },
                {
                    name: 'repair',
                    iconCls: 'x-fa fa-file-text-o',
                    text: _('Troubleshooting'),
                    handler: function() {
                        alarmRepairExperienceWin.show();
                    }
                },
                {
                    name: 'edit',
					text: _('templateEdit'),
                    iconCls:'x-fa fa-edit',
                    handler: function() {

                        alarmEditWin.show();                    
                        alarmEditWin.items.first().getForm().loadRecord(rowRecord);

                    }
                    
                },
                {
                    name: 'property',
					iconCls:'x-fa fa-align-justify',
					text: _('Properties'),
                    handler: function() {

                        alarmPropertyWin.show();

                        alarmPropertyWin.items.first().getForm().loadRecord(rowRecord);

                    },
                   
                },
                {
                    name: 'export',
                    iconCls:'x-fa fa-file-excel-o',
                    text: _('Export'),
					
                    menu: {
                        reference: "alarmExport",
                        items: [{
                            name: 'exportAll',
							iconCls:'x-fa fa-file-excel-o',
                            text: _('exportAll'),
							handler:function(){
								Ext.MessageBox.confirm(_('Tips'),_('Export Data'),function(btn){
								if(btn=="yes"){ 
								Ext.Ajax.request({
								method:'post',
									url:"/alarm/alarmResource/exportAllExcel",
									params:form.getForm().getValues(),
									success:function(response){								
									location.href = "/alarm/alarmResource/getexportExcel";
								},
								failure: function(response) {
                                Ext.Msg.alert(_('Tips'), _('Export Faliure'));
                            }
							});
								}
								});
								
							}
                            ////发起ajax请求；
                        },
                        {
                            name: 'exportCurrent',
							iconCls:'x-fa fa-file-excel-o',
                            text: _('exportCurrent'),
							handler:function(){
								Ext.MessageBox.confirm(_('Tips'),_('Export Data'),function(btn){
								if(btn=="yes"){ 
								var pageSize =alarmGrid.getStore().pageSize;
								var currentPage =alarmGrid.getStore().currentPage;

								form.getForm().submit({
								url : "/alarm/alarmResource/exportCurrentExcel",
								params : {
									pageSize:pageSize,
									currentPage:currentPage
								},
								success : function(form, action) {
								
									location.href = "/alarm/alarmResource/getexportExcel";
								},
								failure : function(form, action) {
									return;
								}
							});
									
								}
								});
								
							}
                        },
                        {
                            name: 'exportSelect',
							iconCls:'x-fa fa-file-excel-o',
                            text: _('exportSelect'),
								handler:function(){
								Ext.MessageBox.confirm(_('Tips'),_('Export Data'),function(btn){
								if(btn=="yes"){ 
								var pageSize =alarmGrid.getStore().pageSize;
								var currentPage =alarmGrid.getStore().currentPage;					
								var records = alarmGrid.getSelectionModel().getSelection();
								var json ='';
								if(records.length==0){
									json='[]';
									
								}else{
									json =json+ "[";
									for(var i=0;i<records.length;i++){
										var record =records[i];
										var id =record.get('id');
										json = json+"{"+"id :"+id+"},"
									}
									json=json.substring(0,json.length-1)+"]";
								}
								
								Ext.Ajax.request({
                                    url: '/alarm/alarmResource/exportSelectExcel',
                                    method: 'post',
                                    params: {
                                       condition:json
                                    },
                                  success : function(form, action) {
								
									location.href = "/alarm/alarmResource/getexportExcel";
									},
									failure : function(form, action) {
									return;
									}
                                });					
									
								}
								});
								
							}
                        },
                        ]

                    }
                }]
            });
            return mainMenu;

        },
        onQuery: function() {

            var alarmGrid = this.lookupReference('alarmGrid');
            var view = this.getView();			
            var form = this.lookupReference('alarmTypeForm');
            alarmGrid.getStore().proxy.url = '/alarm/alarmResource/getalarmType';
            alarmGrid.getStore().proxy.extraParams = form.getForm().getValues();
            alarmGrid.getStore().reload();

        },

        onRefresh: function() {
            this.lookupReference('alarmGrid').getStore().reload();
        },

        onItemRightClick: function(view, record, item, index, e) {
            e.preventDefault();
            e.stopEvent();
            var mainMenu = this.getmainMenu(record, view);          
            mainMenu.showAt(e.getXY());

        },
        isShow: function(obj, ischecked) {
            if (ischecked) {
				this.getView().down('fieldset').setVisible(true);
            } else {
               this.getView().down('fieldset').setVisible(false);
            }
        },

        onReset: function() {
            this.getView().down('fieldset').down('form').getForm().reset();
        },

    },

    items: [
	{
         title:_('Alarm Type Management'),
         xtype: 'panel',
         iconCls: 'x-fa fa-circle-o',
         titleAlign:'left',
		  // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
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
            },
			{ 
				xtype:'BookMarkButton',       		   //必配
				iconCls:'x-fa fa-bookmark-o', 
				containerType: 'alarmTypeView',        //必配，配置模块主页面的xtype
				formReference: 'alarmTypeForm',       //必配，配置查询条件form的reference
				module:'alarmTypeView',         	   //必配，配置自己模块的名字，名字会被记录到数据库，根据模块名字来查询书签
				defaultName:_('AlarmType--Query')    			 	   //必配，配置自己模块书签名字的默认前缀
			},
			{
                    text: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onRefresh'
              }
            
            ]
        }],
    },
	{
		xtype: 'fieldset',
		title: _('Query Condition'),
		hidden:'true',
        defaults: {
            labelWidth: 90,
            anchor: '100%',
        },
		items:[
		{
        xtype: 'form',
        reference: 'alarmTypeForm',
        bodyStyle: {
				background: '#f6f6f6'
		},
        layout: {
            type: 'table',
            columns: 4
        },
		
		fieldDefaults : {
        labelWidth : 90,
        labelAlign : "right",
		margin: '0 0 15 0',
 
		},
        items: [{
			
            xtype: 'textfield',
            fieldLabel: 'ID',
			
            name: 'ID'
        },
        {
            xtype: 'textfield',
            fieldLabel: _('Alarm Name'),
			
            name: 'alarmName'
        },
        {
            xtype: 'combobox',
            fieldLabel: _('Alarm Level'),
            name: 'alarmLevel',
			
            hiddenName: 'alarmLevel',
            value:'',
            //  store:levelStore,
            bind: {
                store: '{levellist_remote}',
            },
            displayField: "text",
            valueField: 'value',
			editable : false

        },
        {
            xtype: 'combobox',
            fieldLabel: _('EventType'),
            name: 'eventType',
            hiddenName: 'eventType',
            value:'',
            bind: {
                store: '{eventType_list_remote}',
            },
            displayField: "text",
            valueField: 'value',
			editable : false

        },
        {
            xtype: 'combobox',
            fieldLabel: _('Alarm Category'),
            name: 'alarmCategory',
            hiddenName: 'alarmCategory',
            value:'',
            bind: {
                store: '{alarmCategory_list_remote}',
            },
            displayField: "text",
            valueField: 'value',
			editable : false

        },
        {
            xtype: 'combobox',
            fieldLabel: _('Service Affection'),
            name: 'isAfectService',
            hiddenName: 'isAfectService',
			forceSelection : true,
            bind: {
                store: '{afectService_list_remote}',
            },
			value:'',
            displayField: "text",
            valueField: 'value',
			editable : false

        },
        {
            xtype: 'textfield',
            fieldLabel: _('Fault Description'),
            name: 'errorDesc'
        },
        {
            xtype: 'textfield',
            fieldLabel: _('Solution'),
            name: 'howToDesc',
			flex:1
        }],
		 buttons: 
		 
		 [{
			text: _('Reset'),
            iconCls:'x-fa fa-undo',
            handler: 'onReset'
		},
		{
            text: _('Search'),
            iconCls: 'x-fa fa-search',
            handler: 'onQuery'
         }
		]
    }
		
		]
		
		
	},

    {
        xtype: 'PagedGrid',
        reference: 'alarmGrid',
        bind: {
            store: '{userlist_remote}',
        },
		selType: 'checkboxmodel',
		//selModel: {
		//selection: "rowmodel",
		//mode: "SINGLE"
		//},
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
            text:  _('Alarm Name'),
            dataIndex: 'alarmName',
			width:200
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
        {
            text: _('Solution'),
            dataIndex: 'howToDesc',
			flex:2
           
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
        },

       

        listeners: {
            // itemdblclick: 'onItemDoubleClick',
            itemcontextmenu: 'onItemRightClick'
        }
    }]

});