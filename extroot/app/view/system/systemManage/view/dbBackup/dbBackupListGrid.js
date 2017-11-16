Ext.define('Admin.view.system.systemManage.view.dbBackup.dbBackupListGrid', {
    extend: 'Ext.container.Container',
    xtype: 'dbBackupListGrid',
    requires: [
        'Admin.view.system.systemManage.model.dbBackup.dbBackupListGrid',
        'Admin.view.system.systemManage.viewModel.dbBackup.dbBackupListGrid',
        'Admin.view.system.systemManage.controller.dbBackup.dbBackupListGrid'
    ],
    controller: 'dbBackupListGrid',
    viewModel: 'dbBackupListGrid', 
    layout: 'fit',
    height:650,
    items: [
             {
                xtype: 'grid',
                itemId: 'dbBackupListGrid',
                height:500,
                bind: {
			        store: '{dbBackupListStore}'
			    },
			    selModel: {
			        selType: 'rowmodel',
			        listeners: {
			            selectionchange: 'onSelectRowChange'
			        }
			    },
                columns: [
				    { 
				    	text: _('Data file name'),
				    	dataIndex: 'name',
				    	width: 490
				    },
				    {
				    	text: _('Data file size'),
				    	dataIndex: 'size',
				    	width: 310
				    },
				    {
				    	text: _('File creation date'),
				    	dataIndex: 'date',
				    	width: 490
				    }
                ],
                dockedItems: [
	                {
	                    xtype: 'toolbar',
	                    dock: 'top',
	                    items: [
	                    	'->',
	                    	 {
	                            text:  _('Backup'),
	                            iconCls:'backup_backup',
	                            itemId: 'backup',
	                            tooltip: _('Backup'),
	                            handler: 'onBackup'
	                        },
	                        {
	                            text:  _('Restore'),
	                            iconCls:'backup_restore',
	                            itemId: 'restore',
	                            disabled: true,
	                            tooltip: _('Restore'),
	                            handler: 'onRestore'
	                        },
	                        {
	                            text:  _('Download'),
	                            iconCls:'backup_download',
	                            itemId: 'download',
	                            disabled: true,
	                            tooltip: _('Download'),
	                            handler: 'onDownload'
	                        },
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
          }
       ]
});