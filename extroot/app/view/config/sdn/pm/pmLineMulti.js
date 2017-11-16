
Ext.define('Admin.view.config.sdn.pm.pm_chartMulti_store', {
    alias: 'store.pm_chartMulti_store',
    extend: 'Ext.data.Store',

    autoLoad: true, 
    fields: ['date', 'data1','data2','data3'],
    data: [ { date: '', data1: 0, data2: 0, data3: 0 }],
});

Ext.define('Admin.view.config.sdn.pm.pmLineMulti', {
    extend: 'Ext.container.Container',
    xtype: 'pmLineMulti',
    requires: [
        'Ext.chart.interactions.CrossZoom',
        'Ext.chart.interactions.ItemHighlight',
        'Admin.view.config.sdn.pm.pm_chartMulti_store'
    ],
    controller: {
        onAxisLabelRender: function (axis, label, layoutContext) {
            if(label<1){
                 return Ext.util.Format.number(label, '0.00');
            }
            return Ext.util.Format.number(label, '0,000');
        },

        onSeriesTooltipRender: function (tooltip, record, item) {
            
            var title0=this.view.chartLegend0,
                title1=this.view.chartLegend1,
                title2=this.view.chartLegend2;
            if(!(title0 && title1 && title2)){
                return;
            }

            tooltip.setHtml(record.get('date')  + '</br>' +
                '<div style="margin:6px 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#C23531;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+title0 +'：'+record.get('data1')+'</span></div>'+
                '</div>' +
                '<div style="margin:3px 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#2F4554;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+title1 +'：'+record.get('data2')+'</span></div>'+
                '</div>'+
                '<div style="margin:3px 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#68A3AB;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+title2 +'：'+record.get('data3')+'</span></div>'+
                '</div>'
                );
        }
    },

    newMultiChart: function () {
         return {
            xtype: 'cartesian',
            reference: this.chartItemId,

            width: '95%',
            height: this.chartHeight,

            /*interactions: [
                'panzoom',
                'itemhighlight'
            ],*/

            store: {
                type: 'pm_chartMulti_store'
            },
            legend: {
                xtype: 'legend',
                docked: 'top',
                tpl: [
                    '<tpl>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div style="float:left;width:21px;position:relative;top:11px"><div style="position:absolute;left:6px; top:'+this.chartLegendTop+'px;display:inline-block;width:10px;height:10px;background-color:#fff;border:1px solid #68A3AB;border-radius:6px;-webkit-border-radius: 6px;-moz-border-radius: 6px;"></div><div style="width:100%;height:1px;margin:0px auto;padding:0px;background-color:#68A3AB;overflow:hidden;"></div></div><div style="float:left;padding:3px 5px">'+this.chartLegend2+'</div>',
                    '</div>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div style="float:left;width:22px;position:relative;top:11px"><div style="position:absolute;left:6px; top:'+this.chartLegendTop+'px;display:inline-block;width:10px;height:10px;background-color:#fff;border:1px solid #2F4554;border-radius:6px;-webkit-border-radius: 6px;-moz-border-radius: 6px;"></div><div style="width:100%;height:1px;margin:0px auto;padding:0px;background-color:#2F4554;overflow:hidden;"></div></div><div style="float:left;padding:3px 5px">'+this.chartLegend1+'</div>',
                    '</div>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div style="float:left;width:22px;position:relative;top:11px"><div style="position:absolute;left:6px; top:'+this.chartLegendTop+'px;display:inline-block;width:10px;height:10px;background-color:#fff;border:1px solid #C23531;border-radius:6px;-webkit-border-radius: 6px;-moz-border-radius: 6px;"></div><div style="width:100%;height:1px;margin:0px auto;padding:0px;background-color:#C23531;overflow:hidden;"></div></div><div style="float:left;padding:3px 5px">'+this.chartLegend0+'</div>',
                    '</div>',
                    '</tpl>'
                ],
                //itemSelector: '.myLegendItem'
            },
            axes: [{
                type: 'numeric',
                position: 'left',
                grid: true,
                fields: ['data1','data2','data3'],
                minimum: 0,
                renderer: 'onAxisLabelRender'
            }, {
                type: 'category',
                position: 'bottom',
                grid: true,
                visibleRange: [0, 1],
            }],
            series: [{
                type: 'line',
                title:[this.chartLegend0],
                xField: 'date',
                yField: 'data1',
                style: {
                    lineWidth: 2,
                    stroke: '#C23531'
                },
                marker: {
                    radius: 4,
                    lineWidth: 2,
                    fill:'#fff'
                },
                highlight: {
                    fillStyle: '#000',
                    strokeStyle: '#fff',
                    scaling: 2
                },
                tooltip: {
                    trackMouse: true,
                    showDelay: 0,
                    dismissDelay: 0,
                    hideDelay: 0,
                    renderer: 'onSeriesTooltipRender'
                }
            },
            {
                type: 'line',
                title:[this.chartLegend1],
                xField: 'date',
                yField: 'data2',
                style: {
                    lineWidth: 2,
                    stroke: '#2F4554'
                },
                marker: {
                    radius: 4,
                    lineWidth: 2,
                    fill:'#fff'
                },
                highlight: {
                    fillStyle: '#000',
                    strokeStyle: '#fff',
                    scaling: 2
                },
                tooltip: {
                    trackMouse: true,
                    showDelay: 0,
                    dismissDelay: 0,
                    hideDelay: 0,
                    renderer: 'onSeriesTooltipRender'
                }
            },
            {
                type: 'line',
                title:[this.chartLegend2],
                xField: 'date',
                yField: 'data3',
                style: {
                    lineWidth: 2,
                    stroke: '#68A3AB'
                },
                marker: {
                    radius: 4,
                    lineWidth: 2,
                    fill:'#fff'
                },
                highlight: {
                    fillStyle: '#000',
                    strokeStyle: '#fff',
                    scaling: 2
                },
                tooltip: {
                    trackMouse: true,
                    showDelay: 0,
                    dismissDelay: 0,
                    hideDelay: 0,
                    renderer: 'onSeriesTooltipRender'
                }
            }],
            tbar: [
                {
                    xtype: 'panel',
                    html:'<span style="font-weight: 700">&nbsp;&nbsp;'+this.chartTitle+'</span>',
                }
            ]
         };
    },

    initComponent: function () {
        this.items=this.newMultiChart();
        this.callParent();
    }
});