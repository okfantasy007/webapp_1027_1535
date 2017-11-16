Ext.define('Admin.view.config.sdn.pm.pm_chartSingle_store', {
    alias: 'store.pm_chartSingle_store',
    extend: 'Ext.data.Store',

    autoLoad: true, 
    fields: ['date', 'data1'],
    data: [{ date: '', data1: 0}],
});

Ext.define('Admin.view.config.sdn.pm.pmLineSingle', {
    extend: 'Ext.container.Container',
    xtype: 'pmLineSingle',
    requires: [
        'Ext.chart.interactions.CrossZoom',
        'Ext.draw.modifier.Highlight',
        'Ext.chart.interactions.ItemHighlight',
        'Admin.view.config.sdn.pm.pm_chartSingle_store'

    ],
    controller: {
        onAxisLabelRender: function (axis, label, layoutContext) {
            var isPercent = this.view.chartTitle.indexOf('%') >-1 ? true:false;
            if((label+"").indexOf('.')>-1){
                return Ext.util.Format.number(label, '.00')+"";
            }
            else
            {
                if(isPercent)
                    return Ext.util.Format.number(label, '0,000')+"%";
                else{
                    return (label >1000) ? Ext.util.Format.number(label, '0,000') : Ext.util.Format.number(label) +"   " ;
                }
            }
        },

        onSeriesTooltipRender: function (tooltip, record, item) {
           var  data = record.get('data1'),
                browser = item.series.getTitle();

            tooltip.setHtml(record.get('date')  + '</br>' +
                '<div style="margin:0 3px 3px 0">'+
                '<div style="display:inline-block;width:10px;height:10px;background-color:#C23531;border-radius:5px;-webkit-border-radius: 5px;-moz-border-radius: 5px;"></div>'+
                '<div style="display:inline-block; margin:0 0 0 8px;"><span>'+browser[0] +'：'+record.get('data1')+'</span></div>'+
                '</div>'
                );
        }
    },

    newSingleChart: function () {
         return {
            xtype: 'cartesian',
            reference: this.chartItemId,

            width: '95%',
            height: this.chartHeight,

            interactions: [
            'panzoom',
            'itemhighlight'
            ],
            store: {
                type: 'pm_chartSingle_store',
            },
            innerPadding: {
                left: 40,
                right: 40
            },
            axes: [{
                type: 'numeric',
                position: 'left',
                grid: true,
                minimum: 0,
                //style: {strokeStyle: 'red'},
                renderer: 'onAxisLabelRender'
            }, {
                type: 'category',
                position: 'bottom',
                grid: true,
                visibleRange: [0, 1],
            }],
            series: [{
                type: 'line',
                title:[this.chartLegend],
                xField: 'date',
                yField: 'data1',
                style: {
                    lineWidth: 2,
                    stroke: '#C23531'
                },
                marker: {
                    radius: 4,
                    lineWidth: 2,
                    fillStyle:'#fff'
                },
                label: {
                    field: 'data1',
                    display: 'over'
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
                    reference:this.chartTtileId,
                    width:180,
                    html:'<div style="width:120px;font-weight: 700">&nbsp;&nbsp;'+this.chartTitle+'</div>',
                },
                /* '->',
                {
                    iconCls: 'x-fa fa-refresh',
                    tooltip: '回到初始状态',
                    handler:'onRefresh'
                },*/
            ]
         };
    },

    initComponent: function () {
        this.items=this.newSingleChart();
        this.callParent();
    }

});