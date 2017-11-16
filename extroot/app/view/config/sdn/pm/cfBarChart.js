Ext.define('Admin.view.config.sdn.pm.cf_barChart_store', {
    alias: 'store.cf_barChart_store',
    extend: 'Ext.data.Store',
    autoLoad: true, 
    fields: ['name', 'data1'],
    data: [
        { name: _('First Step'), data1: 0 }
    ],
});

Ext.define('Admin.view.config.sdn.pm.cfBarChart', {
    extend: 'Ext.container.Container',
    xtype: 'cfBarChart',
    requires: [
        'Admin.view.config.sdn.pm.cf_barChart_store'
    ],
    controller: {

        onBarTipRender: function (tooltip, record, item) {
            var fieldIndex = Ext.Array.indexOf(item.series.getYField(), item.field),
                browser = item.series.getTitle();

            tooltip.setHtml(record.get('name')  + '</br>' +
                '<div style="margin:0 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#8470ff;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+browser[0] +'：'+record.get('data1')+'</span></div>'+
                '</div>'
                );
        },

        onAxisLabelRender: function (axis, label, layoutContext) {
            return Ext.util.Format.number(label, '0,000')+" ";
        }
    },

    newBarChart: function () {
        return {
            xtype: 'cartesian',
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
                    '<div class="" style="border:1px solid #2EC7C9;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:#2EC7C9;opacity:.7"></div><div style="float:left;padding:3px 5px">'+this.chartLegend+'</div>',
                    '</tpl>'
                ],
                //itemSelector: '.myLegendItem'
            },
            axes: [
                {
                    type: 'numeric',
                    position: 'left',
                    fields: ['data1'],
                    minimum: 0,
                    maximum:100,
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
                    title: [ this.chartLegend],
                    xField: 'name',
                    yField: [ 'data1'],
                    stacked: false,
                    highlightCfg: {
                        saturationFactor: 1.5
                    },
                    tooltip: {
                        trackMouse: true,
                        renderer: 'onBarTipRender'
                    },

                    //此渲染器的存在能够使每条柱子的颜色，与上方声明的颜色数组相同
                    renderer: function(sprite, storeItem, barAttr, i, store) {
                        barAttr.fill ="#2EC7C9";
                        return barAttr;
                    }
                }
            ],
            tbar: [
                {
                    xtype: 'panel',
                    html:'<span style="font-weight: 700">&nbsp;&nbsp;'+this.chartTitle+'</span>',
                }]
        }
    },

    initComponent: function () {
        this.items=this.newBarChart();
        this.callParent();
    }
});