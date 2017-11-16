Ext.define('Admin.view.system.systemManage.view.server.serverDetailGrid', {
	extend: 'Ext.container.Container',
    xtype: 'serverDetailGrid',
    requires: [
        'Admin.view.system.systemManage.controller.server.serverDetailGrid'
    ],
    controller: 'serverDetailGrid',
    itemId: 'serverDetailGrid',
    layout: 'anchor',
    height:710,
    viewModel: {
    	stores: {   
             serverHistoryStore:{
	             autoLoad: true,
	             pageSize: 10,
	             proxy: {
	                 type: 'ajax',
	                 url: '/sysmanage/sysmng/monitor/history', 
	                 reader: {
	                     type: 'json',
	                     rootProperty: 'counter',
	                     totalProperty: 'total_count'
	                 }
	             }
             }
    	}
    },  
    items: [
    	{
            xtype: 'container',
            bodyPadding: 10,
            layout: 'hbox',
            autoScroll : true,
            items: [
            	{
                    xtype: 'panel',
                    flex: 1
                },
                {
                    xtype: 'cartesian',
                    reference: 'time-chart',
                    itemId: 'time-chart',
                    insetPadding: '40 40 20 20',
                    height: 350,
                    width:1300,
                    store: Ext.create('Ext.data.JsonStore', {
                        fields: ['yValue', 'cpu', 'mem','disk']
                    }),
                    legend: {
                    	position: 'bottom'
                    	/*type: 'sprite',
                        docked: 'right'*/
                    },
                    sprites: [{
                        type: 'text',
                        text:  _('Real-time monitoring of server performance'),
                        itemId:'chartName',
                        fontSize: 22,
                        width: 100,
                        height: 30,
                        x: 40, 
                        y: 20  
                    }],
                    axes: [{
                        type: 'numeric',
                        minimum: 0,
                        maximum: 100,
                        grid: true,
                        position: 'left',
                        title:  _('Accounted for(%)'),
                    },
                    {
                        type: 'time',
                        dateFormat: 'G:i:s',
                        segmenter: {
                            type: 'time',
                            step: {
                                unit: Ext.Date.SECOND,
                                step: 1
                            }
                        },
                        label: {
                            fontSize: 10
                        },
                        grid: true,
                        position: 'bottom',
                        title:  _('Time'),
                        fields: ['xValue'],
                        majorTickSteps: 50
                    }],
                    series: [{
                        type: 'line',
                        title:  _('Host CPU'),
                        style: {
                        	lineWidth: 2,
                            miterLimit: 0
                        },
                        tooltip: {
                            trackMouse: true,
                            renderer: 'onSeriesTooltipRender'
                        },
                        xField: 'xValue',
                        yField: 'cpu',
                        marker: {
                            type: 'square',
                            fx: {
                                duration: 200,
                                easing: 'backOut'
                            }
                        }
                    }, {
                        type: 'line',
                        title:  _('Host Memory'),
                        style: {
                        	lineWidth: 2,
                            miterLimit: 0
                        },
                        tooltip: {
                            trackMouse: true,
                            renderer: 'onSeriesTooltipRender'
                        },
                        xField: 'xValue',
                        yField: 'mem',
                        marker: {
                            type: 'cross',
                            fx: {
                                duration: 200,
                                easing: 'backOut'
                            }
                        }
                    },
                    {
                        type: 'line',
                        title: _('Host Disk'),
                        style: {
                        	lineWidth: 2,
                            miterLimit: 0
                        },
                        tooltip: {
                            trackMouse: true,
                            renderer: 'onSeriesTooltipRender'
                        },
                        xField: 'xValue',
                        yField: 'disk',
                        marker: {
                            type: 'triangle',
                            fx: {
                                duration: 200,
                                easing: 'backOut'
                            }
                        }
                    }],
                    tbar: [
                        '->',
                        {
                            text:  _('Back'),
                            width:100,
                            iconCls:'server_return',
                            handler: 'onReturn'
                        },
                    ],
                },
                {
                    xtype: 'panel',
                    flex: 1
                }
            ],
    	},
		{ 
			 xtyp: 'panel',
			 autoScroll : true,
			 layout : {
				 type: 'vbox',
				 align:'stretch',
			 	 pack :'start'
			 },			 
			 items: [		 
				{
				   xtype: 'form',
				   title:_('Server performance history query'),
				   itemId:'serchForm',
				   height: 115,
				   //frame : true,
				   margin:8,
				   bodyPadding: 5,
				   border:false,
				   collapsible: true,
				   collapseMode: "header",
				   collapsed: true,
				   titleAlign: 'left',
				   titleCollapse: true,
				   frame: true,
				   fieldDefaults: {
				   labelAlign: 'right'
				   },
				   items: [		
						{
							xtype: 'container',
							layout: 'hbox',
							margin: '0 0 5 0',
							items: [
								{
									xtype: 'datetimefield',
									fieldLabel:_('The starting time'),
									name: 'operateStartTime',
									itemId:'operateStartTime'
								},
								{
									xtype: 'datetimefield',
									fieldLabel:_('The deadline time'),
									name: 'operateEndTime',
									itemId:'operateEndTime'
								},
								{
		                    	    xtype: 'textfield',
		                    	    itemId: 'TagIp',
		                    		name: "ip",
		                    		hidden:true,
		                    	},
							]
						}	
					],
					buttons: [
						{
							text: _('Reset'),
							iconCls: 'x-fa fa-undo',
							handler:'onSerchReset'
						},
						{
							text: _('Query'),
							iconCls: 'x-fa fa-search',
							handler: 'onSerch'
						} 
					]
				},
				{
	                xtype: 'grid',
	                itemId: 'serverHistoryGrid',
	                columnLines: true,
	                titleAlign: 'right',
	                height:246,
	                //selType: 'checkboxmodel',
	                bind: {
                        store: '{serverHistoryStore}'
                    },
	                columns: [
	                	{
	                        text: _('Last Polling Time'),
	                        dataIndex: 'time',
	                        flex: 1
	                    },{
	                        text: _('Host CPU Accounted'),
	                        dataIndex: 'cpu_load',
	                        flex: 1
	                    },
	                    {
	                        text: _('Host Memory Accounted'),
	                        dataIndex: 'mem_load',
	                        flex: 1
	                    },{
	                        text: _('Host Disk Accounted'),
	                        dataIndex: 'disk_load',
	                        flex: 1
	                    }
	                ],
	                dockedItems: [
	                    {
	                        xtype: 'pagingtoolbar',
	                        itemId: 'pagingtoolbar',
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
	            }
			]
		}
    ],
    listeners: {
    	activate: 'onActivate',
		deactivate: 'onDeactivate'
	} 
});
