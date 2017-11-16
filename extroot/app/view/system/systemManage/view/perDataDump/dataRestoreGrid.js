Ext.define('Admin.view.system.systemManage.view.perDataDump.dataRestoreGrid', {
    extend: 'Ext.container.Container',
    xtype: 'dataRestoreGrid',
    requires: [
        'Admin.view.system.systemManage.model.perDataDump.dataRestoreGrid',
        'Admin.view.system.systemManage.viewModel.perDataDump.dataRestoreGrid',
        'Admin.view.system.systemManage.controller.perDataDump.dataRestoreGrid'
    ],
    controller: 'dataRestoreGrid',
    viewModel: 'dataRestoreGrid', 
    layout: 'fit',
    items: [
             {
                xtype: 'grid',
                itemId: 'dataRestoreGrid',
                reference: 'symbolInfo',
                height:640,
                bind: {
			        store: '{dataRestoreListStore}'
			    },
                columns: [
                	{ 
                		text:_('serialNumber'),
                	    xtype:'rownumberer',
                	    width: 100, 
                	    sortable: false, 
                	    align: 'center' 
                	},
				    { 
                		text: _('filename'),
                		dataIndex : 'fileName',
                		sortable: true,
                		width: 310,  
                		layout: 'hbox',
                		filter: { }, 
                		sorter: { 
                			sorterFn: 'nameSorter'
                		}, 
                		editor: { 
                			xtype: 'textfield', 
                		},
                        items: { 
                        	xtype: 'textfield', 
                        	reference: 'nameFilterField', 
                        	emptyText: _('Please enter keywords for fuzzy query'), 
                        	flex : 1, 
                        	margin: 2, 
                        	enableKeyEvents: true,
                            listeners: 
                            { 
                            	keyup: 'onNameFilterKeyup', 

                            }
                        }   
                    },
				    {
				    	text: _('The date of Dump'),
				    	dataIndex: 'dumpDate',
				    	width: 300
				    },
				    {
				    	text: _('Acquisition date'),
				    	dataIndex: 'collectDate',
				    	width: 300
				    },
				    { 
				    	text: _('File Size(KB)'),
				    	dataIndex: 'fileSize',
				    	width: 300
				    },
                ],
                dockedItems: [
	                {
	                    xtype: 'toolbar',
	                    dock: 'top',
	                    items: [
	                    	'->',
	                        {
                                text: _('Refresh'),
                                tooltip: _('Refresh'),
                                iconCls:'process_refresh',
                                handler: 'onRefresh'
                            }   
	                    ]
	                }
             ]         
          }
       ]
});