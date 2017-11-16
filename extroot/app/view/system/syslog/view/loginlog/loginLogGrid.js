Ext.define('Admin.view.system.syslog.view.loginlog.loginLogGrid', {
    extend: 'Ext.container.Container',
    xtype: 'LoginLogView',
    requires: [
        'Admin.view.system.syslog.model.loginlog.loginLogGrid',
        'Admin.view.system.syslog.viewModel.loginlog.loginLogGrid',
        // 'Ext.ux.DateTimeField',
        'Admin.view.system.syslog.controller.loginlog.loginLogGrid'
    ],
    controller: 'loginLogGrid',
    viewModel: 'loginLogGrid',  
    layout: 'card',
	// 指定panel边缘的阴影效果
    cls: 'shadow',
	
	items:[
		{
			title:_('logs_search_panel'),
            xtype: 'grid',
            itemId: 'loginLogGrid',
            reference: 'loginLogGrid',
            // height: 500,
            bind: {
                store: '{safeLogGridStore}'
            },
            columns: [
                {
                    text: _('logs_account'),
                    dataIndex: 'account',
                    hideable: false,
                    width: 120
                },
                {
                    text: _('logs_level'),
                    dataIndex: 'level',
                    hideable: false,
                    width: 80,
                    renderer:  function(value){
                        if(value == 0 ){
                            return _('log_level_notify');
                        }
                        else if(value == 1){
                            return _('log_level_alarm');
                        }
                    }
                },
                {
                    text: _('logs_operateTerminal'),
                    dataIndex: 'operateTerminal',
                    hideable: false,
                    width: 180
                },
                {
                    text: _('logs_loginTime'),
                    dataIndex: 'operateTime',
                    hideable: false,
                    width: 180,
                    renderer: function(value) {
                        if (value == null || value == 0) {
                            return ''
                        } else {
                            //将时间戳转换成Ext显示的日期格式
                            return Ext.util.Format.date(new Date(parseInt(value)),
                                'Y-m-d H:i:s')
                        }
                    }
                },
                {
                    text: _('logs_logoutTime'),
                    dataIndex: 'logoutTime',
                    hideable: false,
                    width: 180,
                    renderer: function(value) {
                        if (value == null || value == 0) {
                            return ''
                        } else {
                            //将时间戳转换成Ext显示的日期格式
                            return Ext.util.Format.date(new Date(parseInt(value)),
                                'Y-m-d H:i:s')
                        }
                    }
                },
                {
                    text: _('logs_remainTime'),
                    dataIndex: 'remainTime',
                    hideable: false,
                    width: 180,
                    renderer: function(second_time) {
                        if (second_time == null || second_time == 0) {
                            return ''
                            var time = parseInt(second_time) + _('logs_sec');
                        } else {
                            if( parseInt(second_time )> 60){

                                var second = parseInt(second_time) % 60;
                                var min = parseInt(second_time / 60);
                                time = min + _('logs_min') + second + _('logs_sec');

                                if( min > 60 ){
                                    min = parseInt(second_time / 60) % 60;
                                    var hour = parseInt( parseInt(second_time / 60) /60 );
                                    time = hour + _('logs_hour')  + min + _('logs_min')  + second + _('logs_sec');

                                    if( hour > 24 ){
                                        hour = parseInt( parseInt(second_time / 60) /60 ) % 24;
                                        var day = parseInt( parseInt( parseInt(second_time / 60) /60 ) / 24 );
                                        time = day + _('logs_day')  + hour + _('logs_hour') + min + _('logs_min') + second + _('logs_sec');
                                    }
                                }
                            }
                            else if ( parseInt(second_time ) > 0 && parseInt(second_time ) < 60 ){
                                time = second_time + _('logs_sec');
                            }
                            return time;
                        }
                    }
                },
                {
                    text: _('logs_result'),
                    dataIndex: 'result',
                    hideable: false,
                    width: 80,
                    renderer:  function(value){
                        if(value == 0 ){
                            return _('logs_result_success');
                        }
                        else {
                            return _('logs_result_failed');
                        }
                    }
                },
                {
                    text: _('logs_operateContent'),
                    dataIndex: 'operateContent',
                    hideable: false,
                    width: 300,
                    renderer: function fGridTooltips(value, metaData, record, rowIdx, colIdx, store)
                    {
                        //==>用tooltip浮窗,显示编码后单元格内的值
                        metaData.tdAttr = 'data-qtip="' + Ext.String.htmlEncode(value) + '"';
                        return value;
                    }
                }

            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    border: true,
                    items: [
                        {
                            text: _('Refresh'),
                            iconCls: 'property_refresh_menu',
                            handler: 'onQueryCondition',
                            align:'right',
                            margin: '0 5 0 5'
                        },
                        {
                            text: _('Export'),
                            // xtype: 'splitbutton',
                            align:'right',
                            margin: '0 5 0 5',
                            iconCls:'x-fa fa-download',
                            menu:[
                                {
                                    text:_('Export All'),
                                    iconCls: 'property_export_excel_menu',
                                    handler:'onExportCsvFile'
                                },{
                                    text:_('Export By'),
                                    iconCls: 'property_export_excel_menu',
                                    handler:'onExportCsvFileBy'
                                }
                            ]
                        },
                        '->',
                        {
                            xtype: 'checkbox',
                            margin: '0 5 0 5',
                            boxLabel: _('Display Query Condition'),
                            tooltip: _('Display Query Condition'),
                            checked: false,
                            handler: 'isShow'
                        }
                    ]
                },

                {
                    // title: _('Query Condition'),
                    xtype: 'form',
                    itemId: 'serchForm',
                    reference: 'serchForm',
                    visible: false,
                    hidden: true,
                    border: true,
                    autoScroll : true,
                    layout:'vbox',
                    // margin: '0 0 0 0',
                    defaults: {
                        labelWidth: 90,
                        anchor: '100%'
                    },
                    fieldDefaults : {
                        labelAlign : 'right'
                    },
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            defaultType: 'textfield',
                            margin: '6 6 6 0',
                            items: [
                                {
                                    xtype: 'textfield',
                                    fieldLabel:_('logs_account'),
                                    name:'account'
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel:_('logs_operateTerminal'),
                                    name:'terminal'
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel:_('logs_operateContent'),
                                    name:'content'
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            defaultType: 'textfield',
                            margin: '0 0 6 0',
                            items: [
                                {
                                    xtype: 'combo',
                                    fieldLabel:_('logs_level'),
                                    name:'level',
                                    allowBlank: false,
                                    displayField: 'name',
                                    valueField: 'abbr',
                                    queryModel: 'local',
                                    //emptyText : _('logs_pls_check'),
                                    editable : false,
                                    value: 'all',
                                    store: {
                                        xtype: 'store',
                                        fields: ['name', 'abbr'],
                                        data: [
                                            {name:_("logs_all"), abbr: 'all' },
                                            {name:_("log_level_notify"), abbr: 0 },
                                            {name:_("log_level_alarm"), abbr: 1 }
                                        ]
                                    }
                                },
                                {
                                    xtype: 'combo',
                                    fieldLabel:_('logs_result'),
                                    name:'result',
                                    allowBlank: false,
                                    editable : false,
                                    displayField: 'name',
                                    valueField: 'abbr',
                                    queryModel: 'local',
                                    //emptyText :  _('logs_pls_check'),
                                    value:'all',
                                    store: {
                                        xtype: 'store',
                                        fields: ['name', 'abbr'],
                                        data: [
                                            {name:_("logs_all"), abbr: 'all' },
                                            {name:_("logs_result_success"), abbr: 0 },
                                            {name:_("logs_result_failed"), abbr: 1 }
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            // defaultType: 'textfield',
                            margin: '0 0 5 0',
                            items: [
                                {
                                    xtype: 'datefield',
                                    fieldLabel:_('logs_loginTime_from'),
                                    //width: 280,
                                    name: 'loginStartTime',
                                    format: 'Y-m-d H:i:s'
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel:_('logs_loginTime_to'),
                                    //width: 280,
                                    name: 'loginEndTime',
                                    format: 'Y-m-d H:i:s'
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel:_('logs_logoutTime_from'),
                                    //width: 280,
                                    name: 'logoutStartTime',
                                    format: 'Y-m-d H:i:s'
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel:_('logs_logoutTime_to'),
                                    //width: 280,
                                    name: 'logoutEndTime',
                                    format: 'Y-m-d H:i:s'
                                },
                                {
                                    xtype: 'button',
                                    text: _('Reset'),//'重置查询',
                                    iconCls: 'x-fa fa-undo',
                                    margin: '0 0 0 70',
                                    handler:'onResetSerchForm'
                                },
                                {
                                    xtype: 'button',
                                    text: _('Query'),
                                    iconCls: 'x-fa fa-search',
                                    margin: '0 0 0 10',
                                    handler: 'onQueryCondition'
                                }
                            ]
                        }
                    ]
                },
                //分页
                {
                    xtype: 'pagingtoolbar',
                    dock: 'top',
                    border: true,
                    itemId: 'pagingtoolbar',
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
                                data: Ext.create('syslogConfig').defaultConfig.pageData
                            }),
                            value: Ext.create('syslogConfig').defaultConfig.logPageSize,
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

