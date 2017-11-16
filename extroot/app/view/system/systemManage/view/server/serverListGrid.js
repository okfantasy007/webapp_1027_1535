Ext.define('Admin.view.system.systemManage.view.server.serverListGrid', {
    extend: 'Ext.container.Container',
    xtype: 'serverView',
    requires: [
        'Admin.view.system.systemManage.model.server.serverListGrid',
        'Admin.view.system.systemManage.viewModel.server.serverListGrid',
        'Admin.view.system.systemManage.controller.server.serverListGrid',
        'Admin.view.system.systemManage.view.server.serverDetailGrid',
        'Admin.view.system.systemManage.view.server.addServerForm'
    ],
    controller: 'serverListGrid',
    viewModel: 'serverListGrid',  
    itemId: 'serverListMainGrid',
    layout: 'card',
    height:700,
    items: [
             {
                title: _('Host Manage'),
                xtype: 'grid',
                itemId: 'serverGrid',
                bind: {
			        store: '{serverListStore}'
			    },
			    selModel: {
			        selType: 'rowmodel',
			        listeners: {
			            selectionchange: 'onSelectChange'
			        }
			    },
                columns: [
				     { 
				    	text: _('Host Name'),
				    	dataIndex: 'host_name',
				    	width: 300
				     }, 
			         {
				    	text: _('IP Adress'),
				    	dataIndex: 'ip',
				    	width: 230,
				     },
				     { 
				    	text: _('Host CPU'),
				    	dataIndex: 'cpu',
				    	width: 400
				     },
				     {
				    	text: _('The Memory Capacity'),
				    	dataIndex: 'mem',
				    	width: 200,
				    	renderer: function getOS(v,m,r){//根据store返回值自定义列显示数据
				    		return r.get('total') + " " + r.get('unit');
				    	}

				     },
				     {
				    	text: _('The Spare Disk'),
				    	width: 200,
				    	renderer: function getOS(v,m,r){//根据store返回值自定义列显示数据
				    		return r.get('disk') + " " + r.get('unit');
				    	}
				     }
               ],
               
                dockedItems: [
                    {
                        xtype: 'toolbar',
                        items: [
                            {
                                text: _('Add'),
                                tooltip: _('Add'),
                                iconCls: 'add',
                                hidden:SEC.hidden('0301020101'),
                                handler: 'onAdd'
                            },
                            /*{
                                text: _('Delete'),
                                itemId: 'remove',
                                tooltip: _('Delete'),
                                iconCls: 'remove',
                                handler: 'onRemove',
                                hidden:SEC.hidden('0301020102'),
                                disabled: true
                            },*/
                            {
                                text: _('Performance monitoring'),
                                itemId: 'monitor',
                                tooltip: _('Performance monitoring'),
                                iconCls: 'server_monitor',
                                handler: 'onMonitor',
                                hidden:SEC.hidden('0301020102'),
                                disabled: true
                            },
                            '->',
                            {
                                text: _('Refresh'),
                                tooltip: _('Refresh'),
                                iconCls: 'refresh_button',
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
              xtype: 'serverDetailGrid'
          },
          { 
              xtype: 'addServerForm'
          }
       ]
});