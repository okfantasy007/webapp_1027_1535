Ext.define('Ext.chart.theme.CustomGroup', {
    extend: 'Ext.chart.theme.Base',
    singleton: true,
    alias: 'chart.theme.customGroup',
    config: {
        colors: ['#8470ff', '#36648b', '#79cdcd']
    }
});

Ext.define('Admin.view.config.sdn.pm.cf_barGroup_store', {
    alias: 'store.cf_barGroup_store',
    extend: 'Ext.data.Store',

    autoLoad: true, 
    fields: ['name', 'data1', 'data2', 'data3'],
    data: [
        { name: _('Step 1'), data1: 0, data2: 0, data3: 0 }
    ],
});


Ext.define('Admin.view.config.sdn.pm.cfBarGroupChart', {
    extend: 'Ext.container.Container',
    xtype: 'cfBarGroupChart',
    requires: [
        'Admin.view.config.sdn.pm.cf_barGroup_store'
    ],

    controller: {

        onBarTipRender: function (tooltip, record, item) {
            var fieldIndex = Ext.Array.indexOf(item.series.getYField(), item.field),
                browser = item.series.getTitle();

            tooltip.setHtml(record.get('name')  + '</br>' +
                '<div style="margin:0 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#8470ff;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+browser[0] +'：'+record.get('data1')+'</span></div>'+
                '</div>' +
                '<div style="margin:0 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#36648b;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+browser[1] +'：'+record.get('data2')+'</span></div>'+
                '</div>'+
                '<div style="margin:0 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#79cdcd;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+browser[2] +'：'+record.get('data3')+'</span></div>'+
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
            theme: 'customGroup',
            reference: this.chartItemId,

            width: '95%',
            height: this.chartHeight,

            store: {
                type: 'cf_barGroup_store',
            },
            legend: {
                xtype: 'legend',
                docked: 'top',
                tpl: [
                    '<tpl>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div class="" style="border:1px solid #79cdcd;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:#79cdcd;opacity:.7"></div><div style="float:left;padding:3px 5px">'+this.chartLegend2+'</div>',
                    '</div>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div class="" style="border:1px solid #36648b;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:#36648b;opacity:.7"></div><div style="float:left;padding:3px 5px">'+this.chartLegend1+'</div>',
                    '</div>',
                    '<div class="myLegendItem" style="float:right;margin:0;padding:5px;cursor:pointer;">',
                    '<div class="" style="border:1px solid #8470ff;border-radius:3px;float:left;margin:2px;width:40px;height: 18px; background:#8470ff;opacity:.7"></div><div style="float:left;padding:3px 5px">'+this.chartLegend0+'</div>',
                    '</div>',
                    '</tpl>'
                ],
                //itemSelector: '.myLegendItem'
            },
            axes: [
                {
                    type: 'numeric',
                    position: 'left',
                    fields: ['data1','data2','data3'],
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
                    title: [ this.chartLegend0, this.chartLegend1,this.chartLegend2],
                    xField: 'name',
                    yField: [ 'data1', 'data2', 'data3'],
                    stacked: false,
                    highlightCfg: {
                        saturationFactor: 1.5
                    },
                    style: {
                        inGroupGapWidth: 0
                    },
                    tooltip: {
                        trackMouse: true,
                        renderer: 'onBarTipRender'
                    },
                }
            ],
            tbar: [
                {
                    xtype: 'panel',
                    reference:this.chartTtileId,
                    width:180,
                    html:'<div style="width:120px;font-weight: 700">&nbsp;&nbsp;'+this.chartTitle+'</div>',
                }]
        }
    },

    initComponent: function () {
        this.items=this.newBarChart();
        this.callParent();
    }
});