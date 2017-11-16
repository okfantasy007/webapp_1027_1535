Ext.define('Admin.view.system.syslog.view.devoperatelog.devOpLogGrid', {
    extend: 'Ext.container.Container',
    xtype: 'DevOpLogView',
    requires: [
        'Admin.view.system.syslog.model.devoperatelog.devOpLogGrid',
        'Admin.view.system.syslog.viewModel.devoperatelog.devOpLogGrid',
        // 'Ext.ux.DateTimeField',
        'Admin.view.system.syslog.controller.devoperatelog.devOpLogGrid'
    ],
    controller: 'devOpLogGrid',
    viewModel: 'devOpLogGrid',  
    layout: 'card',
    autoScroll : true,
    bodyStyle: 'overflow:auto',
    border: true,
	// 指定panel边缘的阴影效果
    // cls: 'shadow',
	
	items:[
		{
            title: _('logs_search_panel'),
            xtype: 'grid',
            itemId: 'devOpLogGrid',
            reference: 'devOpLogGrid',
            // height: 500,
            bind: {
                store: '{safeLogGridStore}'
            },
            columns: [
                {
                    text: _('logs_operateTerminal'),
                    dataIndex: 'host',
                    hideable: false,
                    width: 180
                },
                {
                    text: _('logs_level'),
                    dataIndex: 'level',
                    hideable: false,
                    width: 160,
                    renderer:  function(value){
                        return _('syslog_level'+value);
                    }
                },
                {
                    text: _('logs_operateTime'),
                    dataIndex: 'operateDateTime',
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
                    //renderer: Ext.util.Format.dateRenderer('Y-m-d H:i:s'')

                },
                {
                    text: _('logs_operateContent'),
                    dataIndex: 'operateContent',
                    hideable: false,
                    width: 600,
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
                                    fieldLabel:_('logs_operateTerminal'),
                                    name:'host'
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel:_('logs_operateContent'),
                                    name:'content'
                                },
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
                                            {name:_("syslog_level0"), abbr: 0 },
                                            {name:_("syslog_level1"), abbr: 1 },
                                            {name:_("syslog_level2"), abbr: 2 },
                                            {name:_("syslog_level3"), abbr: 3 },
                                            {name:_("syslog_level4"), abbr: 4 },
                                            {name:_("syslog_level5"), abbr: 5 },
                                            {name:_("syslog_level6"), abbr: 6 },
                                            {name:_("syslog_level7"), abbr: 7 }
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            // defaultType: 'textfield',
                            margin: '0 0 6 0',
                            items: [
                                {
                                    xtype: 'datefield',
                                    fieldLabel:_('logs_operateTime_from'),
                                    //width: 280,
                                    name: 'operateStartTime',
                                    format: 'Y-m-d H:i:s'
                                },
                                {
                                    xtype: 'datefield',
                                    fieldLabel:_('logs_operateTime_to'),
                                    //width: 280,
                                    name: 'operateEndTime',
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
                        }/*,
                        '-',
                        {
                            xtype: 'checkbox',
                            boxLabel: _('Display Query Condition'),
                            tooltip: _('Display Query Condition'),
                            checked: false,
                            handler: 'isShow'
                        }*/
                    ]
                }
            ]
		}
	]
});


