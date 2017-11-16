Ext.define('Ext.chart.theme.Custom', {
    extend: 'Ext.chart.theme.Base',
    singleton: true,
    alias: 'chart.theme.custom',
    config: {
        colors: ['green','red','yellow','red','yellow','red']
    }
});

Ext.define('Admin.view.config.sdn.pm.cf_barchart_store', {
    alias: 'store.cf_barchart_store',
    extend: 'Ext.data.Store',
    autoLoad: true, 
    fields: ['name', 'data1', 'data2', 'data3', 'data4','data5','data6'],
    data: [
        { name: _('Step 1'), data1: 0, data2: 0, data3: 0, data4:0,data5:0,data6:0 },
       /* { name: '第二步', data1: 0, data2: 0, data3: 0, data4:0,data5:0,data6:0 },
        { name: '第三步', data1: 0, data2: 0, data3: 0, data4:0,data5:0,data6:0 },
        { name: '第四步', data1: 0, data2: 0, data3: 0, data4:0,data5:0,data6:0 },
        { name: '第五步', data1: 0, data2: 0, data3: 0, data4:0,data5:0,data6:0 },
        { name: '第六步', data1: 0, data2: 0, data3: 0, data4:0,data5:0,data6:0 }*/
    ],
});

Ext.define('Admin.view.config.sdn.pm.cfBandBarChart', {
    extend: 'Ext.container.Container',
    xtype: 'cfBandBarChart',
    requires: [
        'Admin.view.config.sdn.pm.cf_barchart_store'
    ],
    controller: {

        onBarTipRender: function (tooltip, record, item) {
            var fieldIndex = Ext.Array.indexOf(item.series.getYField(), item.field),
                browser = item.series.getTitle()[fieldIndex];

            var realBand = record.get("data1") + record.get("data3")+record.get("data5");

            tooltip.setHtml(record.get('name')  + '</br>' +
                _('Real bandwidth')+': ' + realBand);
        },

        onAxisLabelRender: function (axis, label, layoutContext) {

            return Ext.util.Format.number(label, '0,000')+" ";
        }
    },

    newBarChart: function () {
        return {
            xtype: 'cartesian',
            theme: 'custom',
            reference: this.chartItemId,

            width: '95%',
            height: this.chartHeight,
            store: {
                type: 'cf_barchart_store',
            },
            legend: {
                xtype: 'legend',
                docked: 'top',
                tpl: [
                    '<tpl>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div class="" style="border:1px solid red;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:red;opacity:.7"></div><div style="float:left;padding:3px 5px">'+_('Lost bandwidth')+'</div>',
                    '</div>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div class="" style="border:1px solid yellow;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:yellow;opacity:.7"></div><div style="float:left;padding:3px 5px">'+_('Extra bandwidth')+'</div>',
                    '</div>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div class="" style="border:1px solid green;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:green;opacity:.7"></div><div style="float:left;padding:3px 5px">'+_('Guaranteed bandwidth')+'</div>',
                    '</div>',
                    '</tpl>'
                ],
                //itemSelector: '.myLegendItem'
            },
            axes: [
                {
                    type: 'numeric',
                    position: 'left',
                    fields: ['data1', 'data2', 'data3', 'data4','data5','data6'],
                    minimum: 0,
                    maximum:100,
                    adjustByMajorUnit: true,
                    limits: [{
                        value:100000,
                        line: {
                            strokeStyle: '#000000',
                            lineWidth: 1,
                            lineDash: [6, 3],
                            title: {
                                text: "CIR",
                                fontWeight: 'bold',
                                fillStyle: 'black',
                                fontSize: 12
                            }
                        }
                    },
                    {
                        value:200000,
                        line: {
                            strokeStyle: '#000000',
                            lineWidth: 1,
                            lineDash: [6, 3],
                            title: {
                                text: "CIR+EIR",
                                fontWeight: 'bold',
                                fillStyle: 'black',
                                fontSize: 12,
                            }
                        }
                    },
                     {
                        value:225000,
                        line: {
                            strokeStyle: '#000000',
                            lineWidth: 1,
                            lineDash: [6, 3],
                            title: {
                                text: "CIR+125%EIR",
                                fontWeight: 'bold',
                                fillStyle: 'black',
                                fontSize: 12,
                            }
                        }
                    }],
                    renderer: 'onAxisLabelRender'
                },
                {
                    type: 'category',
                    position: 'bottom',
                    grid: true,
                    fields: ['name'],
                }],
            series: [
                {
                    type: 'bar',
                    title: [ _('Guaranteed bandwidth'), _('Lost bandwidth'),_('Extra bandwidth'),_('Lost bandwidth'),_('Extra bandwidth'),_('Lost bandwidth')],
                    xField: 'name',
                    yField: [ 'data1', 'data2', 'data3','data4','data5','data6'],
                    stacked: true,
                    style: {
                        minBarWidth:100
                    },
                    highlightCfg: {
                        saturationFactor: 1.5
                    },
                    tooltip: {
                        trackMouse: true,
                        renderer: 'onBarTipRender'
                    },
                    //此渲染器的存在能够使每条柱子的颜色，与上方声明的颜色数组相同
                    /*renderer: function(sprite, storeItem, barAttr, i, store) {
                         var colors = ['#888888','#FF00FF','#00FFFF'];
                         barAttr.fill = colors[i % 3];
                         return barAttr;
                    }*/
                }
            ],
            /* listeners: {
                renderer : 'onAfterRender'
            },*/
            tbar: [
                {
                    xtype: 'panel',
                    html:'<div style="font-weight: 700">&nbsp;&nbsp;'+this.chartTitle+'</div>',
                }]
        }
    },

    initComponent: function () {
        this.items=this.newBarChart();
        this.callParent();
    }
});