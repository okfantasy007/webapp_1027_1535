/*Ext.apply(Ext.form.field.VTypes, {
    numeric: function (val, field) {
        return /^\d+(\.\d{1,2})?$/.test(val);
    },
    numericText:_('You can only enter numbers!')
});*/
Ext.define('Admin.view.config.sdn.pm.pmView', {
    extend: 'Ext.Panel',
    xtype: 'pmView',
    requires: [
        'Admin.view.config.sdn.pm.pmController',
        'Admin.view.config.sdn.pm.pmLineChart',
        'Admin.view.config.sdn.pm.cf1564View',
        'Admin.view.config.sdn.pm.pm1564View'
    ],

    layout: 'card',
    cls: 'shadow',//指定panel边缘的阴影效果

    listeners: {
        //activate: 'onActive',
        afterRender:'onAfterRender',
        //activate:'onActiveItemchange'
    },

    viewModel: {
        stores:{
            pm_task_store:{
                storeId:'pm_task_store',
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json'
                    }
                },
                data: [],
                fields:[
                    {name: 'eline-id', type: 'string'},
                    {name: 'user-label', type: 'string'},
                    {name: 'name', type: 'string'},
                    {name: 'cir', type: 'string'},
                    {name: 'eir', type: 'string'},
                    {name: 'source-ne-id', type: 'string'},
                    {name: 'source-port', type: 'string'},
                    {name: 'destination-ne-id', type: 'string'},
                    {name: 'destination-port', type: 'string'},
                    {name: 'isDA', type: 'boolean', defaultValue: false}
                ],
                autoLoad: true
            },
            kpi_store: {
                autoLoad: true,
                fields : ['value', 'text'],
                data : [
                    //['0', '>=']
                    ["all",_('All')],
                    ["shake",_('Jitter')],
                    ["delay",_('Delay')],
                    ["packet_loss_rate",_('Packet loss rate A-Z')],
                    ["packet_loss_rate_z",_('Packet loss rate Z-A')],
                    ["bandwidth",_('Bandwidth A-Z')],
                    ["bandwidth_z",_('Bandwidth Z-A')],
                    ["bandwidth_usage",_('Bandwidth utilization rate A-Z')],
                    ["bandwidth_usage_z",_('Bandwidth utilization rate Z-A')],
                    ["availability",_('Availability A-Z')],
                    ["availability_z",_('Availability Z-A')]
                ]
            },

        }
    },

    controller: 'pmCtl',

    items: [
        {
            xtype: 'panel',
            title: _('E-Line list'),
            iconCls: 'x-fa fa-tasks',
            reference: 'firstPanel',
            layout:'fit',
            items: [
                {
                    xtype: 'grid',
                    reference: 'taskPmGrid',
                    style: 'border-top: 1px solid #d0d0d0;border-bottom: 1px solid #d0d0d0;',
                    height:450,
                    columnLines: true,
                    bind: {
                        store: '{pm_task_store}',
                    },
                    selModel: {
                        selection: "rowmodel",
                        mode: "SINGLE",
                        listeners: {
                            selectionchange: "onSelectionChange"
                        }
                    },
                    selType: "checkboxmodel",
                    emptyText: _('No data to display'),
                    columns: [
                        { text: _('E-Line name'), dataIndex: 'name', flex:1, menuDisabled: true},
                        { text: _('E-Line type'), dataIndex: 'type', width:90, menuDisabled: true },
                        { text: _('Customer'), dataIndex: 'user-label', flex:1, menuDisabled: true },
                        { text: _('SLA status'), dataIndex: 'user-label', width:90, menuDisabled: true   },
                        { text: _('Src NE'), dataIndex: 'source-ne-id', flex:1, menuDisabled: true},
                        { text: _('Src port'), dataIndex: 'source-port', flex:1, menuDisabled: true},
                        { text: _('Dest NE'), dataIndex: 'destination-ne-id', flex:1, menuDisabled: true},
                        { text: _('Dest port'), dataIndex: 'destination-port', flex:1, menuDisabled: true}
                    ],
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    bodyStyle:"top:2px",
                    reference: 'pmDockedItems',
                    items: [
                        {
                            xtype: 'panel',
                            width:70,
                            bodyStyle:'margin:3px 0 0 0',
                            html:'<input type="checkbox" id="pm-checkbox-11-2" checked /><label for="pm-checkbox-11-2" title="业务统计开关"></label>',
                            listeners: {
                                render: 'onSwitchRender'
                            }
                        },
                        {
                            iconCls: 'x-fa fa-plus',
                            tooltip: _('Add performance task'),
                            text :_('Collect'),
                            bind: {
                                disabled: '{!taskPmGrid.selection}'
                            },
                            handler:'onAddDA'
                        },
                        {
                            itemId: 'pmLineChart',
                            iconCls: 'x-fa fa-line-chart',
                            text : _('Chart'),
                            disabled:true,
                            handler:'showLineChart'
                        },
                        {
                            itemId: 'cfBarChart1564',
                            iconCls: 'x-fa fa-bar-chart-o',
                            text : _('Y.1564 throughput chart'),
                            disabled:true,
                            handler:'showBarChart1564'
                        },
                        {
                            itemId: 'pmBarChart1564',
                            iconCls: 'x-fa fa-line-chart',
                            text : _('Y.1564 performance chart'),
                            disabled:true,
                            handler:'showPmBarChart1564'
                        },
                        {
                            itemId : 'SetPmBtn',
                            text :_('Config'),
                            iconCls: 'x-fa fa-cog',
                            handler : "onRangeSetting"
                        },
                        '->',
                        {
                            xtype: 'textfield',
                            fieldLabel: _('Filter'),
                            name: 'searchText',
                            labelStyle:'padding-left: 8px;width: 40px;',
                            labelWidth: 40,
                            listeners: {
                                change: 'onFilterTextChange'
                            }
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'panel',
            title: _('E-Line Performance Chart'),
            iconCls: 'x-fa fa-line-chart',
            reference: 'pmChartPanel',
            items:[
                {
                    xtype: 'panel',
                    header: false,
                    bodyPadding : '5 3 5 3',
                    items:[
                        {
                            xtype: "panel",
                            defaults:{
                                frame:true
                            },
                            bodyPadding : '20 3 5 3',
                            layout:{
                                type:'hbox',
                                pack:'center',
                                align:'stretch'

                            },
                            items:[
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_1',
                                    chartTitle:_('Packet loss rate A-Z(%)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400,
                                },
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_2',
                                    chartTitle:_('Packet loss rate Z-A(%)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400,
                                },
                            ]
                        },
                        {
                            xtype: "panel",
                            defaults:{
                                frame:true
                            },
                            bodyPadding : '20 3 5 3',
                            layout:{
                                type:'hbox',
                                pack:'center',
                                align:'stretch'

                            },
                            items:[
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_3',
                                    chartTitle:_('Jitter(ns)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400,
                                },
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_4',
                                    chartTitle:_('Time Delay(ns)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400
                                },
                            ]
                        },
                        {
                            xtype: "panel",
                            defaults:{
                                frame:true
                            },
                            bodyPadding : '20 3 5 3',
                            layout:{
                                type:'hbox',
                                pack:'center',
                                align:'stretch'

                            },
                            items:[
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_5',
                                    chartTitle:_('Bandwidth A-Z(kbps)'),
                                    limitValue:_('Lower threshold'),
                                    chartHeight:400
                                },
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_6',
                                    chartTitle:_('Bandwidth Z-A(kbps)'),
                                    limitValue:_('Lower threshold'),
                                    chartHeight:400
                                }
                            ]
                        },
                        {
                            xtype: "panel",
                            defaults:{
                                frame:true
                            },
                            bodyPadding : '20 3 5 3',
                            layout:{
                                type:'hbox',
                                pack:'center',
                                align:'stretch'

                            },
                            items:[
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_7',
                                    chartTitle:_('Bandwidth utilization rate A-Z(%)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400
                                },
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_8',
                                    chartTitle:_('Bandwidth utilization rate Z-A(%)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400
                                }
                            ]
                        },
                        {
                            xtype: "panel",
                            defaults:{
                                frame:true
                            },
                            bodyPadding : '20 3 5 3',
                            layout:{
                                type:'hbox',
                                pack:'center',
                                align:'stretch'

                            },
                            items:[
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_9',
                                    chartTitle:_('Availability A-Z(%)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400
                                },
                                {
                                    flex:1,
                                    xtype: 'pmLineChart',
                                    chartItemId: 'pm_chart_10',
                                    chartTitle:_('Availability Z-A(%)'),
                                    limitValue:_('Upper threshold'),
                                    chartHeight:400
                                }
                            ]
                        }

                    ]
                }
            ],
            dockedItems:[
                {
                    xtype: 'toolbar',
                    bodyStyle:"top:2px",
                    reference: 'pmChartDockedItems',
                    items: [
                        '-',
                        {
                            iconCls: 'x-fa fa-angle-double-left',
                            tooltip: _('Back'),
                            focusCls:'null',
                            handler:'goBack'
                        },
                        '-',
                        {
                            xtype: "combo",
                            itemId:"pmKpiSelect",
                            reference:'pmKpiSelect',
                            fieldLabel: _('Metric type'),
                            labelWidth:100,
                            labelAlign : 'right',
                            name: 'chartKpi',
                            bind: {
                                store: '{kpi_store}'
                            },
                            displayField: 'text',
                            valueField: 'value',
                            value: 'all',
                            mode: 'local',
                        },
                        {
                            xtype: 'datetimefield',
                            itemId:"pmStartTime",
                            labelWidth:85,
                            labelAlign : 'right',
                            fieldStyle:"padding:5px 5px 4px",
                            fieldLabel:_('Start Time'),
                            name: 'startTime',
                            value:Ext.util.Format.date(Ext.Date.add(Ext.Date.add(new Date(),Ext.Date.MONTH,-1),Ext.Date.HOUR,-1),"Y-m-d H:i:s")
                        },
                        {
                            xtype: 'datetimefield',
                            itemId:"pmEndTime",
                            labelWidth:85,
                            labelAlign : 'right',
                            fieldStyle:"padding:5px 5px 4px",
                            fieldLabel:_('End Time'),
                            name: 'endTime',
                            value:Ext.util.Format.date(Ext.Date.add(new Date(),Ext.Date.MONTH,-1),"Y-m-d H:i:s")
                        },
                        {
                            xtype: 'button',
                            text: _('Search'),
                            style: 'margin:0 0 0 6px;',
                            iconCls: 'search_reset_bnt',
                            handler: "onChartSearch"
                        },
                        '->',
                        {
                            iconCls: 'x-fa fa-file-excel-o',
                            text : _('Export as Excel'),
                            handler:'onExportExcel'
                        },
                        {
                            iconCls: 'x-fa fa-file-pdf-o',
                            text : _('Export as PDF'),
                            bind:{
                                disabled:'{pmKpiSelect.selection.value =="all"}'
                            },
                            handler:'onExportPdf'
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'panel',
            title: _('Y.1564 throughput chart'),
            iconCls: 'x-fa fa-bar-chart-o',
            reference: 'cfChartPanel1564',
            layout:'fit',
            items: [
                {
                    xtype:'cf1564View',
                    itemId:'cf1564View1',
                    cfViewId:'cf1564View1',
                }
            ],
            dockedItems:[
                {
                    xtype: 'toolbar',
                    bodyStyle:"top:2px",
                    reference: 'cfChartDockedItems',
                    items: [
                        '-',
                        {
                            iconCls: 'x-fa fa-angle-double-left',
                            tooltip: _('Back'),
                            focusCls:'null',
                            handler:'goBack'
                        },
                        '-',
                        {
                            iconCls: 'x-fa fa-file-excel-o',
                            text : _('Export as Excel'),
                            handler:'onExportExcel1564'
                        },
                        {
                            iconCls: 'x-fa fa-file-pdf-o',
                            text : _('Export as PDF'),
                            handler:'onExportPdf1564'
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'panel',
            title: _('Y.1564 performance chart'),
            iconCls: 'x-fa fa-line-chart',
            reference: 'pmChartPanel1564',
            layout:'fit',
            items: [
                {
                    xtype:'pm1564View',
                    itemId:'pm1564View1',
                    cfViewId:'pm1564View1',
                }
            ],
            dockedItems:[
                {
                    xtype: 'toolbar',
                    bodyStyle:"top:2px",
                    reference: 'pmDockedItems1564',
                    items: [
                        '-',
                        {
                            iconCls: 'x-fa fa-angle-double-left',
                            tooltip: _('Back'),
                            focusCls:'null',
                            handler:'goBack'
                        },
                        '-',
                        {
                            xtype: 'datetimefield',
                            itemId:"pmStartTime1564",
                            labelWidth:100,
                            labelAlign : 'right',
                            fieldStyle:"padding:5px 5px 4px",
                            fieldLabel:_('Start Time'),
                            name: 'startTime',
                            value:Ext.util.Format.date(Ext.Date.add(Ext.Date.add(new Date(),Ext.Date.MONTH,-1),Ext.Date.HOUR,-1),"Y-m-d H:i:s")
                        },
                        {
                            xtype: 'datetimefield',
                            itemId:"pmEndTime1564",
                            labelWidth:100,
                            labelAlign : 'right',
                            fieldStyle:"padding:5px 5px 4px",
                            fieldLabel:_('End Time'),
                            name: 'endTime',
                            value:Ext.util.Format.date(Ext.Date.add(new Date(),Ext.Date.MONTH,-1),"Y-m-d H:i:s")
                        },
                        {
                            xtype: 'button',
                            text: _('Search'),
                            style: 'margin:0 0 0 6px;',
                            iconCls: 'search_reset_bnt',
                            handler: "onChartSearch1564"
                        },
                        '->',
                        {
                            iconCls: 'x-fa fa-file-excel-o',
                            text : _('Export as Excel'),
                            handler:'onExportExcelPm1564'
                        },
                        {
                            iconCls: 'x-fa fa-file-pdf-o',
                            text : _('Export as PDF'),
                            handler:'onExportPdfPm1564'
                        }
                    ]
                }
            ],
        }
    ]
});