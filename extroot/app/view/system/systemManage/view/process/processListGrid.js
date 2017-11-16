Ext.define('Admin.view.system.systemManage.view.process.processListGrid', {
    extend: 'Ext.container.Container',
    xtype: 'processView',
    requires: [
        'Admin.view.system.systemManage.model.process.processListGrid',
        'Admin.view.system.systemManage.viewModel.process.processListGrid',
        'Admin.view.system.systemManage.controller.process.processListGrid',
        'Admin.view.system.systemManage.view.process.upgradeForm',
        'Admin.view.system.systemManage.view.process.installProcessForm',
        'Admin.view.system.systemManage.view.process.queryServerList'
    ],
    controller: 'processListGrid',
    viewModel: 'processListGrid', 
    itemId: 'processMainGrid',
    layout: 'card',
    items: [
             {
                title: _('Processes'),
                xtype: 'grid',
                itemId: 'processGrid',
                height:690,
                bind: {
			        store: '{processListStore}'
			    },
			    selModel: {
			        selType: 'checkboxmodel',
			        listeners: {
			            selectionchange: 'onSelectChange'
			        }
			    },
                columns: [
				    { 
				    	text: _('Process Name'),
				    	dataIndex: 'process_name',
				    	width: 300,
		            	renderer: function(value, m, r){
		                    if(value == 'sysmng' ){
		                        return  _('sysmng_sysmng');
		                    }else if(value == 'resources'){
		                        return  _('sysmng_resources');
		                    }else if(value == 'topo'){
		                        return  _('sysmng_topo');
		                    }else if(value == 'security'){
		                        return  _('sysmng_security');
		                    }else if(value == 'alarm'){
		                        return  _('sysmng_alarm');
		                    }else if(value == 'pmmng-service'){
		                        return  _('sysmng_pmmng-service');
		                    }else if(value == 'configcenter'){
		                        return  _('sysmng_configcenter');
		                    }else if(value == 'report'){
		                        return  _('sysmng_report');
		                    }else if(value == 'osscommon'){
		                        return  _('sysmng_osscommon');
		                    }else if(value == 'logs'){
		                        return  _('sysmng_logs');
		                    }else if(value == 'cli'){
		                        return  _('sysmng_cli');
		                    }else if(value == 'sb_snmp'){
		                        return  _('sysmng_sb_snmp');
		                    }else if(value == 'tr069'){
		                        return  _('sysmng_tr069');
		                    }else if(value == 'sb_openflow'){
		                        return  _('sysmng_sb_openflow');
		                    }else if(value == 'sb_netconf'){
		                        return  _('sysmng_sb_netconf');
		                    }else if(value == 'sb_ovsdb'){
		                        return  _('sysmng_sb_ovsdb');
		                    }else if(value == 'container'){
		                        return  _('sysmng_container');
		                    }else if(value == 'webapp'){
		                        return  _('sysmng_webapp');
		                    }else if(value == 'pmcollect-service'){
		                        return  _('sysmng_pmcollect-service');
		                    }else if(value == 'mysql'){
		                        return  _('sysmng_mysql');
		                    }else if(value == 'influxdb'){
		                        return  _('sysmng_influxdb');
		                    }else if(value == 'redis'){
		                        return  _('sysmng_redis');
		                    }else if(value == 'rabbitmq'){
		                        return  _('sysmng_rabbitmq');
		                    }else if(value == 'proftpd'){
		                        return  _('sysmng_proftpd');
		                    }else if(value == 'tftpd'){
		                        return  _('sysmng_tftpd');
		                    }else{
		                    	return  '--';
		                    }
		                }
				    },
				    {
				    	text: _('IP Adress'),
				    	dataIndex: 'ip',
				    	width: 260
				    },
				    {
				    	text: _('Process Port'),
				    	dataIndex: 'port',
				    	width: 260
				    },
				    { 
		                text: _('Running State'),
		                dataIndex: 'rstatus', 
		                width: 240,
		                renderer: function getRstatus(v,m,r){
		                    if(v == 0 ){
		                        return _('Status Normal');
		                    }
		                    else{
		                        return _('Status Abnormal');
		                    }
		                }
		            },
				    { 
		                text: _('Manager State'),//fghfghfgh
		                dataIndex: 'mstatus', 
		                width: 240,
		                renderer: function getMstatus(v,m,r){
		                    if(v == 0 ){
		                        return  _('Initialized');
		                    }
		                    else if(v == 1){
		                        return  _('Installed');
		                    }else if(v == 2){
		                        return  _('Unloaded');
		                    }
		                }
		            }
                ],
                dockedItems: [
	                {
	                    xtype: 'toolbar',
	                    dock: 'top',
	                    itemId: 'toolbar',
	                    items: [
	                        {
	                            text:  _('Stop Health Check'),
	                            iconCls:'process_stop_health_check',
	                            tooltip: _('Stop Health Check'),
	                            hidden:SEC.hidden('03010101'),
	                            itemId: 'stopHealthCheck',
	                            disabled: true,
	                            handler: 'stopHealthCheck'
	                        },
	                        {
	                            text:  _('Start Health Check'),
	                            iconCls:'process_start_health_check',
	                            tooltip: _('Start Health Check'),
	                            itemId: 'startHealthCheck',
	                            disabled: true,
	                            hidden:SEC.hidden('03010102'),
	                            handler: 'startHealthCheck'
	                        },
	                        {
	                            text:  _('Uninstall System'),
	                            iconCls:'process_uninstall_system',
	                            tooltip: _('Uninstall System'),
	                            hidden:SEC.hidden('03010103'),
	                            handler: 'uninstallSystem'
	                        },
	                        {
	                            text:  _('Upgrade System'),
	                            iconCls:'process_upgrade_system',
	                            tooltip: _('Upgrade System'),
	                            hidden:SEC.hidden('03010104'),
	                            handler: 'onUpgradeSystem'
	                        },
	                        /*{
	                            text:  _('Install'),
	                            iconCls:'process_install_system',
	                            itemId: 'install',
	                            tooltip: _('Install'),
	                            hidden:SEC.hidden('03010104'),
	                            handler: 'onInstallProcess'
	                        },*/
	                        /*{
	                            text:  _('Uninstall Process'),
	                            itemId: 'upgradeProcesses',
	                            tooltip: _('Uninstall Process'),
	                            hidden:SEC.hidden('03010108'),
	                            disabled: true,
	                            iconCls:'process_upgradeProcesses',
	                            handler: 'onUpgradeProcesses'
	                        },*/
	                        {
	                            text:  _('Process Start'),
	                            iconCls:'process_start',
	                            tooltip: _('Process Start'),
	                            hidden:SEC.hidden('03010105'),
	                            itemId: 'start',
	                            disabled: true,
	                            handler: 'onStartProcess'
	                        },
	                        {
	                            text:  _('Process Stop'),
	                            itemId: 'stop',
	                            tooltip: _('Process Stop'),
	                            hidden:SEC.hidden('03010106'),
	                            disabled: true,
	                            iconCls:'process_stop',
	                            handler: 'onStopProcess'
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
                                        {val: 50},
                                        {val: 200},
                                        {val: 500},
                                        {val: 1000},
                                    ]
                                }),
                                value: 50,
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
             ],
             listeners: {
              	  beforerender: 'onLoadHealthCheckButton',
             },
          },
          { 
            xtype: 'upgradeForm'
          },
          { 
              xtype: 'queryServerList'
          },
          { 
            xtype: 'installProcessForm'
          }
       ]
});


