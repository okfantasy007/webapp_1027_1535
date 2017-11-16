Ext.define('Admin.view.system.systemManage.view.process.queryServerList', {
    extend: 'Ext.container.Container',
    xtype: 'queryServerList',  
    requires: [
    	'Admin.view.system.systemManage.model.server.serverListGrid',
        'Admin.view.system.systemManage.viewModel.server.serverListGrid',
        'Admin.view.system.systemManage.controller.process.installProcessForm'
    ],
    controller: 'installProcessForm',
    viewModel: 'serverListGrid',  
    margin: 10,
    items: [
        {
            title: _('Hosts List'),
            xtype: 'grid',
            height:690,
            itemId: 'queryServerList',
            bind: {
		        store: '{serverListStore}'
		    },
		    selModel: {
		        selType: 'rowmodel',
		        listeners: {
		            selectionchange: 'onSelectServerChange'
		        }
		    },
            columns: [
			     { 
			    	text: _('Host Name'),
			    	dataIndex: 'host_name',
			    	width: 200
			     }, 
		         {
			    	text: _('IP Adress'),
			    	dataIndex: 'ip',
			    	width: 190
			     },
			     { 
			    	text: _('Host CPU'),
			    	dataIndex: 'cpu',
			    	width: 180
			     },
			     {
			    	text: _('Host Memory'),
			    	dataIndex: 'mem',
			    	width: 180,
			    	renderer: function getOS(v,m,r){//根据store返回值自定义列显示数据
			    		return r.get('total') + " " + r.get('unit');
			    	}
			     },
			     {
			    	text: _('Host Disk'),
			    	dataIndex: 'disk',
			    	width: 180
			     },
		         {
			    	text: _('Login User'),
			    	dataIndex: 'login_user',
			    	width: 180
			     },
			     {
			    	text: _('Login Password'),
			    	dataIndex: 'password',
			    	width: 180
			     },

            ],
          dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                    	{
                            text:  _('Ok'),
                            itemId: 'submit',
                            handler: 'onSubmitServer',
                            disabled: true
                        },
                        {
                            text: _('Cancel'),
                            handler: 'onCancelServer'
                        },  
                       
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
        }]
});
