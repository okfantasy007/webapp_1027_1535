Ext.define('Admin.view.system.systemManage.view.server.monitorTaskListGrid', {
    extend: 'Ext.container.Container',
    xtype: 'monitorTaskListGrid',
    requires: [
        'Admin.view.system.systemManage.model.server.monitorTaskListGrid',
        'Admin.view.system.systemManage.viewModel.server.monitorTaskListGrid',
        'Admin.view.system.systemManage.controller.server.monitorTaskListGrid',
        'Admin.view.system.systemManage.view.server.addMonitorTaskForm',
        'Admin.view.system.systemManage.view.server.editMonitorTaskForm'
    ],
    controller: 'monitorTaskListGrid', 
    viewModel: 'monitorTaskListGrid',  
    itemId: 'monitorTaskListGrid',
    layout: 'card',
    height:400,
    items: [
             {
                title: _('Monitoring Task Management'),
                xtype: 'grid',
                itemId: 'monitorTaskGrid',
                bind: {
			        store: '{monitorTaskListtStore}'
			    },
			    selModel: {
			        selType: 'checkboxmodel',
			        //mode : "SINGLE",
			        //allowDeselect: true,
			        listeners: {
			            selectionchange: 'onSelectChange'
			        }
			    },
                columns: [
				    { 
				    	text: _('collectPeriod'),
				    	dataIndex: 'task_interval',
				    	width: 450,
				    	renderer: function(value){
				    		return value + _('logs_sec');
						}
				    },
				    {
				    	text: _('The retention time'),
				    	dataIndex: 'task_retain',
				    	width: 430,
				    	renderer: function(value){
				    		return value + _('logs_day');
						}
				    },
				    { 
		                text: _('taskStatus'),
		                dataIndex: 'task_status', 
		                width: 420,
		                renderer:  function(value){
							if(value == 0 ){
								return _('Status Normal');
							}
							else if(value == 1){
								return _('suspend');
							}
						}
		            }
                ],
                dockedItems: [
	                {
	                    xtype: 'toolbar',
	                    dock: 'top',
	                    items: [
	                    	 /*{
                                 text: _('Add'),
                                 tooltip: _('Add'),
                                 iconCls: 'add',
                                 itemId: 'add',
                                 hidden:SEC.hidden('0301020201'),
                                 handler: 'onAdd'
                             },*/
                             {
                                 text: _('Modify'),
                                 tooltip: _('Modify'),
                                 iconCls: 'edit_task',
                                 itemId: 'edit',
                                 disabled: true,
                                 hidden:SEC.hidden('0301020201'),
                                 handler: 'onEdit'
                             },
                            /* {
                                 text: _('Delete'),
                                 itemId: 'remove',
                                 tooltip: _('Delete'),
                                 iconCls: 'remove',
                                 disabled: true,
                                 hidden:SEC.hidden('0301020203'),
                                 handler: 'onRemove'
                             },*/
                             {
                                 text: _('Revertive'),
                                 tooltip: _('Revertive'),
                                 itemId: 'regain',
                                 iconCls: 'process_start',
                                 hidden:SEC.hidden('0301020202'),
                                 handler: 'onRegain',
                                 disabled: true
                             },
                             {
                                 text: _('suspend'),
                                 tooltip: _('suspend'),
                                 iconCls: 'process_stop',
                                 disabled: true,
                                 itemId: 'stop',
                                 hidden:SEC.hidden('0301020203'),
                                 handler: 'onStop'
                             },
	                        '->',
	                         {
                                text: _('Refresh'),
                                tooltip: _('Refresh'),
                                iconCls:'process_refresh',
                                handler: 'onRefresh'
                             }   
	                    ]
	                },
                    //分页
                    {
                        xtype: 'pagingtoolbar',
                        dock: 'bottom',
                        inputItemWidth: 80,
                        displayInfo: true,
                        displayMsg : _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}',
                        emptyMsg: _("Empty"),
                        items: [
                            '-',
                            {
                                fieldLabel: _('Page Size'),
                                xtype: 'combobox',
                                width: 170,
                                padding: '0 0 0 5',
                                displayField: 'val',
                                valueField: 'val',
                                multiSelect: false,
                                editable: false,
                                labelWidth: 60,
                                store: Ext.create('Ext.data.Store', {
                                    fields: [{name: 'val', type: 'int'}],
                                    data: [
                                        {val: 10},
                                        {val: 20},
                                        {val: 50},
                                        {val: 200},
                                        {val: 500},
                                        {val: 1000},
                                    ]
                                }),
                                value: 10,
                                listeners: {
                                    change: function(me, newValue, oldValue, ops) {
                                        var grid = this.up('grid');
                                        Ext.apply(grid.store, {pageSize: newValue});
                                        this.up('pagingtoolbar').moveFirst();
                                    }
                                }
                            }
                        ]
                    }
              ]         
          },
          {
        	 xtype: 'addMonitorTaskForm'
          },
          {
         	 xtype: 'editMonitorTaskForm'
           }
       ]
});


