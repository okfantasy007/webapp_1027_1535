Ext.define('Admin.view.alarms.alarmServerConfig.alarmServerConfigGridView', {
	
	  xtype: 'alarmServerConfigGridView',
    extend: 'Ext.container.Container',
     requires: [
              'Admin.view.base.PagedGrid',
              'Admin.view.alarms.alarmServerConfig.alarmServerConfigForm'   
    ],
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    
    r_mqtt : Ext.create('Admin.view.base.ContainerMqtt'),
    
    running : false,
    
    viewModel: {
        stores: {
            // 远程store
            serverlist_remote: {
                autoLoad: true,
                pageSize: 15,
                // remoteSort: true,
                // buffered: false,
                // sorters: [{
                //     property: 'TIMESTAMP(date)',
                //     direction: 'DESC'
                // }],
                proxy: {
                    type: 'ajax',
                    url: '/alarm/alarm/serverConfig/getServerStatus',
                    actionMethods : {  
                        read   : 'GET'
                    },
                    reader: {
                        type: 'json',
                        //rootProperty: 'data',
                    },
                    // simpleSortMode: true
                }
            }
        }
    },
    
    


    controller: {
    	
        onRefresh: function() {
                       //var a = Ext.MessageBox.wait('正在启动...', '服务启动');   
            Ext.Ajax.request({
                url : '/alarm/alarm/serverConfig/getServerStatus',
                method : 'get',
                success : function(response) {
                    var r = Ext.decode(response.responseText)
                    
                }
            });
        },
        
        onItemRightClick: function(view, record, item, index, e) {
            e.preventDefault();
            e.stopEvent();
            var mainMenu = this.getmainMenu(record, view);
            //console.log('hh', view);
            mainMenu.showAt(e.getXY());
        },
        
        initMqtt : function(me){
              var contro = me.controller;
              me.r_mqtt.mqttws_subscribe = {'server_config':function(mq,message){
              var node = eval ("(" + message + ")");  
              var store = contro.lookupReference('alarm_server_grid').getStore();
              store.setData(node);

           }};
           me.r_mqtt.connect();
		      
        },
        
                
        getmainMenu: function(rowRecord, grid) {
        	      var controller = this;
        	      var isRunningtest = rowRecord.get('isRunning');
        	      var name = rowRecord.get('name');   
        	      var port = rowRecord.get('port');  	     
        	      
        	      var running = false;
        	      if(isRunningtest == "true"){
        	         running = true;
        	      }     	 
        	      var mainMenu = Ext.create('Ext.menu.Menu', {
                reference: "serverConfigMenu",
                items: [

					                {
					                    name: 'edit',
					                    iconCls:'property_edit_menu',
					                    handler: function() {
					                    },
					                    text: _('edit'),
					                    bind: {
                                 hidden: running
                              },
                              handler: function() {
                              	  controller.onEdit(rowRecord);
					                    }
					                },
					                {
					                    name: 'property',
										          iconCls:'button_save',
										          text: _('property'),
					                    handler: function() {
					                    	    controller.showProperty(rowRecord);
					                    }
					                },
					                {
					                    name: 'start',
										          iconCls:'process_start',
										          text: _('start'),
										          bind: {
                                 hidden: running
                              }, 
					                    handler: function() {
					                    	controller.startServer(name,port);
					                    }
					                },
					                {
					                    name: 'stop',
										          iconCls:'process_stop',
										          text: _('stop'),
					                    handler:function() {
					                    	 controller.stopServer(name);
					                    },
					                    bind: {
                                 hidden: !running
                              } 
					                }
					             ]
            });
            return mainMenu;
        },
         startServer: function(serverName,portstr) {
            //mask = new Ext.LoadMask(Ext.getBody(), {msg:"正在启动...",align:'center'});
            //myMask.show();
            //var a = Ext.MessageBox.wait('正在启动...', '服务启动');   
            Ext.Ajax.request({
                url : '/alarm/alarm/serverConfig/serverStartAndStop',
                params : {
                    server_name : serverName,
                    operation : 'start',
                    port : portstr
                },
                method : 'post',
                success : function(response) {
                    var r = Ext.decode(response.responseText)
                    if (r.success) {
                       Ext.Msg.alert("服务启动命令发送成功");
                    }else{
                        Ext.MessageBox.alert('Message', _('Operation Failure!'));
                    }
                }
            });
            //mask.show();
        },
        
       stopServer: function(serverName) {
            //mask = new Ext.LoadMask(Ext.getBody(), {msg:"正在停止...",align:'center'});

            //var a = Ext.MessageBox.wait('正在启动...', '服务启动');   
            Ext.Ajax.request({
                url : '/alarm/alarm/serverConfig/serverStartAndStop',
                params : {
                    server_name : serverName,
                    operation : 'stop'
                },
                method : 'POST',
                success : function(response) {
                    var r = Ext.decode(response.responseText);
                    if (r.success) {
                        Ext.Msg.alert("服务停止命令发送成功");
                    }else{
                        Ext.MessageBox.alert('Message', _('Operation Failure!'));
                    }
                }
            });
            
           //mask.show();
            
        },
        
      onEdit: function (record){
      	 var controller = this;
         //var popItem =  Ext.create('Admin.view.alarms.alarmServerConfig.alarmServerConfigForm');
         var popItem =  controller.createPopForm('editForm',record);
         
         popItem.getForm().loadRecord(record);
         var popWindow = controller.createPopWindow(popItem,'editForm');
         popWindow.show();
      },
      
      
      showProperty: function(record){
         var controller = this;
         //var popItem =  Ext.create('Admin.view.alarms.alarmServerConfig.alarmServerConfigForm');
         var popItem =  controller.createPopForm('propertyForm',record);
         popItem.getForm().loadRecord(record);
         var popWindow = controller.createPopWindow(popItem,'propertyForm');
         popWindow.show();
      },
      
     createPopWindow: function(popItem,itemName) {
     	      var titleName;
     	      if(itemName == 'propertyForm'){
     	          titleName = '属性';
     	      }else if(itemName=='editForm'){
     	         titleName = '编辑';
     	      }
     	      var controller = this;
     	
            var popWindow = Ext.create("Ext.window.Window", {   
                title: titleName,
                closable: true,
                autowidth: true,
                autoheight: true,
                border: false,
                layout: 'auto',
                bodyStyle: "padding:20px;",
                items: popItem,
                closeAction: 'hide',
                width: 600,
                height: 400,
                maximizable: true,
                collapsible: true,
                buttons: [
                {
                    xtype: "button",
                    text: "确定",
                    handler: function() {
                        if(itemName=='propertyForm'){
                            popWindow.close();
                        }else if(itemName=='editForm'){

                        	   if(popItem.getForm().isValid()){
                        	   	
                        	   	   if(!popItem.getForm().isDirty()){
                        	   	   	   Ext.Msg.alert(_('With Errors'), '服务配置未做修改！');
                        	   	   	   return;
                        	       }
                        	   	
                        	   	
                        	       Ext.MessageBox.confirm(_('Confirmation'), '确定修改服务配置？',
		                                 function(btn) {
		                                     if (btn=='yes') {
		                                           popItem.getForm().submit({
											                            url: '/alarm/alarm/serverConfig/updateServerConfig',
											                            waitTitle : _('Please wait...'), 
											                            waitMsg : _('Please wait...'), 
											                            success: function(form, action) {
											                                if (action.result.with_err) {
											                                    Ext.Msg.alert(_('With Errors'), action.result.msg);
											                                } else {
											                                    Ext.Msg.alert(_('Success'), action.result.msg);
											                                    controller.onRefresh();
											                                }									                                
											                            },
											                            failure: function(form, action) {
											                                Ext.Msg.alert(_('Tips'), action.result.msg);
											                            }
											                        }); // form
		                                   } // if 
		                                }
                                );
                        	   }else{
                        	         Ext.Msg.alert(_('With Errors'), '输入格式有误！');
                        	   }

                        }  
                    }
                },
                {
                    xtype: "button",
                    text: "取消",
                    handler: function() {
                        popWindow.close();
                    }
                }]
            });
            
            return popWindow;
     },
     
     createPopForm :  function(itemName,record){
            
            var port = record.get('port'); 
            var portFieldType;
            
            if(itemName=='editForm' && port !=''){
     	         portFieldType = 'textfield';
     	      }else{
     	         portFieldType = 'displayfield';
     	      }

            var popForm = Ext.create("Admin.view.alarms.alarmServerConfig.alarmServerConfigForm", {
                    xtype: 'alarmServerConfigForm',
                    extend: 'Admin.view.base.CardForm',
                    trackResetOnLoad : true,
				            margin: 10,
				            items: [
				            {
								        xtype: 'fieldset',
								        title: '',
								        margin: 10,
								        defaultType: 'textfield',
								        defaults: {
								            anchor: '100%'
								        },
				
				                items: [
									        {
									            xtype: 'hidden',
									            name: 'name'
									        },
									        {
									        	  xtype: 'displayfield',
									            fieldLabel: '服务名称',
									            name: 'server_name'
									        },
									        {
									            xtype: 'displayfield',
									            fieldLabel: '服务类型',
									            name: 'server_type'
									        },
								          {
								          	  xtype: portFieldType,
								              fieldLabel: '端口',
								              allowBlank: false,
								              regex : /^(\d+,)*\d+$/,
								              regexText : '请输入有效的格式,如162或162,161',
								              name: 'port'
								           }
				
				              ]
				          }]
            });
            
            return popForm;
       
     }
     
     
      
      
    },

    items: [{
        title: '告警接收服务管理',
        xtype: 'PagedGrid',
        reference: 'alarm_server_grid',
		store:Ext.create('Ext.data.Store', {
                        fields: [{
                            name: 'server_name',
                            type: 'string'
                        },
                        {
                            name: 'server_type',
                            type: 'string'
                        },
                        {
                            name: 'port',
                            type: 'string'
                        },
                        {
                            name: 'name',
                            type: 'string'
                        }
						],
                        data: []
                    }),

        // 绑定到viewModel的属性
       // bind: {
       //     store: '{serverlist_remote}'
       // },

        // grid显示字段
        columns: [
            {
              text : 'name',
              dataIndex : 'name',
              width : 100,
              menuDisabled : true,
              hidden: true
            },
            
           {
              text : '服务名称',
              dataIndex : 'server_name',
              width : 300,
              menuDisabled : true,
            },
            {
              text : '服务类型',
              dataIndex : 'server_type',
              width : 200,
              menuDisabled : true,
            },
            {
              text : '运行状态',
              width : 100,
              menuDisabled : true,
              dataIndex : 'isRunning',
              renderer : function(value,metaData) {
              	    if (value == 'true') {
              	    	   metaData.style = 'color:#5cb85c;';
                         return '启动'; 
              	    }else{
              	         metaData.style = 'color:#d9534f;';
                         return '停止';
              	    }
              },
            },
            {
              text : 'port',
              dataIndex : 'port',
              width : 100,
              menuDisabled : true,
              hidden: true
            }
        ],

        dockedItems: [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    '->',
                    {
                        text: _('Refresh'),
                        handler: 'onRefresh'
                    }
                ]
            }

        ],//dockedItems 
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
            itemcontextmenu: 'onItemRightClick'
        } 
    }],

     listeners: {
            render: function(me, layout, eOpts) {
                 if(!me.running){
                 	   me.controller.initMqtt(me);
                 	   me.running = true;
                 	   me.controller.onRefresh();
                 }
            }
     }
    
});
