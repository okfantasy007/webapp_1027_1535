var isValid ;
Ext.define('Admin.view.resource.syncmanage.stateMonitorView',{
	extend:'Ext.container.Container',

	xtype: 'stateMonitorView',
	requires: [
        'Admin.view.base.PagedGrid',
        'Admin.view.base.CardForm',
    ],

    layout: 'card',
	cls: 'shadow',
	bodyPadding: 10,

	viewModel: {
        stores: {
         	sync_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/resource/sync_state/',
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                       	totalProperty : 'total'
                    },
                }
            },

         
        }
    },

    controller: {
    	onRender: function( me , eOpts ) {
    		var form = this.lookupReference('stateForm');
            form.setVisible(false);
        },
    	onActive: function() {
            var grid = this.lookupReference('stateGrid'),
                view = this.getView(); 
        },
        onSearch: function() {
            var form = this.lookupReference('stateForm');
            if(isValid){
            	isValid=false;
            }else{
            	isValid=true;
            }
            
            form.setVisible(isValid);
        },
        onRefresh: function() {
            this.getView().lookupReference('stateGrid').getStore().reload();
        },
	    
	   
    },

    items:[
    {
    	xtype: 'panel',
    	title: _('Synchro Status monitor'),
        iconCls: 'x-fa fa-circle-o',
       
        reference: 'stateFormGrid',
        layout : {
            type : 'vbox',
            align : 'stretch',
            anchor: '100%',
            pack : 'start'
        },
        items: [
        {
        	 
	    	xtype: 'form',
	    	padding: 5,
	        reference: 'stateForm',
	     	//border:true,
            visible:false,
            fieldDefaults: {
            	labelWidth: 100,
                labelAlign: "left",
            },
	        items: [
	        {    
	        	xtype:'container',
	        	padding: '6 10 0 10',
	        	layout: 'hbox',

	            items: [
	            {
	            	xtype: 'container',
	            	layout: 'vbox',
	            	items:[
	            	{
	            	    xtype: 'textfield',
	            	    fieldLabel: _('Userlabel'),
			            flex : 1,
			            name : 'hostname',
			        },

			        {
                        xtype: 'combobox',
                        fieldLabel: _('Syn Status'),
                        name: 'last_sync_status',
                        store: Ext.create('Ext.data.Store', {
                            fields: [
                                {name: 'level', type: 'int'},
                                {name: 'value', type: 'string'}
                            ],
                            data: [
                                
                                {"level": 1, "value": _('never')},
                                {"level": 2, "value": _('working')},
                                {"level": 3, "value": _('completed')},
                                {"level": 4, "value": _('failed')},
                                {"level": 5, "value": _('diffing')},
                            ]
                        }),
                        allowBlank: true,// 不允许为空
                        //typeAhead: true,
                        forceSelection: true,//设置必须从下拉框中选择一个值
                        valueField: 'level',
                        displayField: 'value',
                        //emptyText: 'Select a state...',
                        queryMode: 'local'
                    },
		            
		    		],
		        },
		        {
		        	xtype: 'container',
	            	layout: 'vbox',
	            	padding: '0 10 0 10',
	            	items:[
		            {
				        xtype: 'fieldcontainer',
				        fieldLabel: _('Begin And End Time'),
				        combineErrors: true,
				        msgTarget : 'side',
				        layout: 'hbox',
				        defaults: {
				            flex: 1,
				            hideLabel: true
				        },
				        items: [{
				            xtype: 'datefield',
				            name: 'startDate',
				            format:'Y-m-d',
				            fieldLabel: 'Start',
				            margin: '0 5 0 0',
				            
				        }, {
				            xtype  : 'datefield',
				            format:'Y-m-d',
				            name  : 'endDate',
				            margin: '0 5 0 0',
				            fieldLabel: 'End',
				            
		        		}]
		    		},		    		
		    		{
                        xtype: 'combobox',
                        fieldLabel: _('Consistency'),
                        name: 'last_res_sync_consistency',
                        store: {
                            fields: [
                                {name: 'level', type: 'int'},
                                {name: 'value', type: 'string'}
                            ],
                            data: [
                                {"level": 0, "value": _('false')},
                                {"level": 1, "value": _('true')}
                            ]
                        },
                        allowBlank: true,// 不允许为空
                        //typeAhead: true,
                        forceSelection: true,//设置必须从下拉框中选择一个值
                        valueField: 'level',
                        displayField: 'value',
                        //emptyText: 'Select a state...',
                        queryMode: 'local'
                    },
		    		],
	            },
	            {
	            	xtype: 'container',
	            	layout: 'vbox',
	            	items:[
	            	{
		    			xtype:'container',
		    			layout:'hbox',
		            	items: [
				        {
				         	xtype: 'button',
				         	buttonAlign :'right',
				            text: _('Reset'),
				            iconCls:'search_reset_bnt',
				            //margin: 5,
				            handler: function () {
                                this.up("form").getForm().reset();
                                var paging = this.up("stateMonitorView").down("PagedGrid").down('pagingtoolbar');
                                paging.moveFirst();
                                var store = this.up("stateMonitorView").down("PagedGrid").getStore();
                                store.proxy.url = "/resource/sync_state/"
                                store.proxy.extraParams = {};
                                store.reload();
                            }
				           
				        },
				      
				        {

				            xtype: 'button',
				          //  buttonAlign :'right',
                            iconCls:'search_with_condition',
                            text: _('Search'),
                            margin: '0 0 0 10',				                                     
                            handler: function () {
                                var values = this.up("form").getForm().getValues();
                                console.info("ne_search_values:", values);
                                var paging = this.up("stateMonitorView").down("PagedGrid").down('pagingtoolbar');
                                paging.moveFirst();
                                var store = this.up("stateMonitorView").down("PagedGrid").getStore();
                                store.proxy.url = "/resource/sync_state/"
                                store.proxy.extraParams = values;
                                store.reload();
                            }
                        
				        }]
		            },

	            	]
	            }	            
	            ]
	        }],

	        
    
        },
        {
        	xtype: 'PagedGrid',
            reference: 'stateGrid',
            //cls: 'shadow',
            //border: true,
            columnLines : true,
            rowLines : true,
            bind: {
            	store: '{sync_remote}',
	        },
	        columns: [
	            // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
	            { text: _('Device ID'),  dataIndex: 'neid', width: 100 },
	            { text: _('Userlabel'), dataIndex: 'userlabel', width: 150 },
	            { text: _('Syn Status'), dataIndex: 'last_sync_status', width: 100,
	            	menuDisabled: true,
                    renderer: function getColor(v, m, r) {
                        if (r.get('last_sync_status') == 1) {
                            return _("never");
                        }
                        else if (r.get('last_sync_status') == 2) {
                            return _("working");
                        }
                        else if (r.get('last_sync_status') == 3) {
                            return _("completed");
                        }
                        else if (r.get('last_sync_status') == 4) {
                            return _("failed");
                        }
                        else if (r.get('last_sync_status') == 5) {
                            return _("diffing");
                        }
                        
                    }
	             },
	            { text:_('Consistency'), dataIndex: 'last_res_sync_consistency', width: 100, 
	            	menuDisabled: true,
                            renderer: function getColor(v, m, r) {
                                if (r.get('last_res_sync_consistency') == 0) {
                                    return _("--");
                                }
                                else if (r.get('last_res_sync_consistency') == 1) {
                                    return _("Yes");
                                }
                                
                            }
	        	},
	            { text: _('Begin Time'), dataIndex: 'last_res_sync_begin_time', width: 150 ,
	       				 renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s')},
	            { text: _('End Time'), dataIndex: 'last_res_sync_end_time', width: 150 ,
	        				renderer:Ext.util.Format.dateRenderer('Y-m-d H:i:s')},
	           
	            { text: _('Remark'), dataIndex: 'last_res_sync_remark', flex: 1 }
	        ],
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
	            ]
	        },
	        
        },
        ],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            //border:true,
            items: [
                {
                    text: _('Search'),
                    iconCls: 'property_search_menu',
                    hidden: SEC.hidden('01040201'),
                    handler: 'onSearch'
                },
                '->',
                {
                    text: _('Refresh'),
                    iconCls: 'property_refresh_menu',
                    handler: 'onRefresh'
                }
            ]
	    }
	    ],
        listeners: {
        	render: 'onRender',
            itemdblclick: 'onItemDoubleClick',
            activate: 'onActive',
        }
        
    }, 
    ]

});