Ext.define('Admin.view.performance.estimate.view.loadChart', {
    xtype: 'loadChart',
    extend: 'Ext.panel.Panel',
    requires: [
        'Admin.view.performance.estimate.controller.loadChart',
        'Admin.view.performance.estimate.model.loadChartStoreModel',
        'Admin.view.performance.estimate.viewModel.collectAssessmentViewModel',
    ],
    controller: 'loadChart',
    viewModel: 'collectAssessmentViewModel',
    itemId: 'loadChart',
    items: [
        {
            xtype: 'cartesian',
            title: _('Load diagram'),
            iconCls: 'pictos pictos-chart2',
            height: 400,
            collapsible: true,//可折叠表格
            //collapsed: true,//默认折叠状态
            width: '100%',
            reference: 'chart',
            itemId: 'serverChart',
            frame: 'true',
            //title:'标题',
            legend: {
                type: 'sprite',
                docked: 'bottom',
                width: 100,
                height: 200,
            },
            bind: {
                store: '{loadChartStore}'
            },
            /*  store:{
                  type:'basicStore'
              },*/
            insetPadding: 40,
            axes: [{
                type: 'numeric',
                fields: ['maxSpan', 'minSpan'],
                position: 'left',
                grid: true,
                title: _('Time consuming (s)'),
                label: {
                    renderer: 'onAxisLabelRender'
                }
            }, {
                type: 'numeric',
                title: _('collect time'),
                fields: ['number'],
                position: 'bottom',
                grid: true,
                label: {
                    rotate: {
                        degrees: 45
                    }
                }
            }],
            series: [{
                type: 'line',
                title: _("maxSpan"),
                xField: 'number',
                yField: 'maxSpan',
                marker: {
                    type: 'square',
                    fx: {
                        duration: 200,
                        easing: 'backOut'
                    }
                },
                highlightCfg: {
                    scaling: 2
                },
                tooltip: {
                    trackMouse: true,
                    renderer: 'onSeriesTooltipRender'
                }
            },
            {
                type: 'line',
                title: _("minSpan"),
                xField: 'number',
                yField: 'minSpan',
                marker: {
                    radius: 4,
                    lineWidth: 2
                },
                highlightCfg: {
                    scaling: 2
                },
                tooltip: {
                    trackMouse: true,
                    renderer: 'onSeriesTooltipRender'
                }
            }],
            tools: [
                {
                    //text: 'Save Chart',
                    iconCls: 'x-fa fa-download',
                    handler: 'export'
                }
            ]
        },

    ],
});