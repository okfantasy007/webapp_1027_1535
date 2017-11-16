Ext.define('Admin.view.config.sdn.pm.pmLineChart', {
    extend: 'Ext.container.Container',
    xtype: 'pmLineChart',
    requires: [
        'Ext.chart.interactions.CrossZoom'
    ],

    viewModel: {
        stores: {
            pm_chart_store: {
                fields: ['label', 'value'],
                data: [
                    {label: '', value: 0},
                ],
            }
        }
    },

    controller: {
        onAxisLabelRender: function (axis, label, layoutContext) {
            // Custom renderer overrides the native axis label renderer.
            // Since we don't want to do anything fancy with the value
            // ourselves except appending a '%' sign, but at the same time
            // don't want to loose the formatting done by the native renderer,
            // we let the native renderer process the value first.
            var maximum=axis.getMaximum(0),
                limits = axis.getLimits();
            if(!maximum)
                return layoutContext.renderer(label);

            if(maximum==100)
                return layoutContext.renderer(label) + ' ';
            else {
                var value = new Number(layoutContext.renderer(label));
                if(value >1000){
                    return Ext.util.Format.number(value, '0,000')+" ";
                }
                else if(maximum >0 && maximum<1){
                    if(label==0){
                        return value;
                    }
                    else {
                        var limit = limits[0].value,
                            len=(limit+'').split(".")[1].length;
                        return value.toFixed(len) +" ";
                    }
                }
                else
                    return value;
            }
        },

        onSeriesTooltipRender: function (tooltip, record, item) {
            tooltip.setHtml(record.get('label') + ': ' + record.get('value') + '%');
        },

        onItemHighlight: function (chart, newHighlightItem, oldHighlightItem) {
            this.setSeriesLineWidth(newHighlightItem, 4);
            this.setSeriesLineWidth(oldHighlightItem, 2);
        },

        setSeriesLineWidth: function (item, lineWidth) {
            if (item) {
                item.series.setStyle({
                    lineWidth: lineWidth
                });
            }
        },

        //返回缩放级别
        onUndoZoom:function (a,b,c) {
            var chartId=this.view.chartItemId;
            if(!chartId)
                return;

            var chart = this.getView().down("[reference='"+chartId+"']"),
                interaction = chart && Ext.ComponentQuery.query('interaction', chart)[0],
                undoButton = interaction && interaction.getUndoButton(),
                handler = undoButton && undoButton.handler;
            if (handler) {
                handler();
            }
        },

        //保存为图片
        onSaveImage:function(){
            if (Ext.isIE8) {
                Ext.Msg.alert(_('Tip'),_('The browser does not support it. Please use IE 8 or later.'));
                return;
            }

            var chartId=this.view.chartItemId;
            if(!chartId)
                return;
            var downLoadName=this.view.chartTitle ? this.view.chartTitle.replace('（%）',"") :"业务性能图表";

            var chart = this.getView().down("[reference='"+chartId+"']");
            chart.download({
                filename: 'Raisecom Performance Chart_' +Math.ceil(Math.random()*1000).toString()
            });
        },

        //阈值设置
        onRangeSetting:function(){
            var chartId=this.view.chartItemId,
                title=this.view.chartTitle;

            if(!chartId)
                return;

            var chart = this.getView().down("[reference='"+chartId+"']"),
                chartIndex=chart.chartIndex,
                baseThis = chart.baseThis;
            chart.callback(baseThis,chartIndex,title);
        }

        /*onPreview: function () {
            if (Ext.isIE8) {
                Ext.Msg.alert('Unsupported Operation', 'This operation requires a newer version of Internet Explorer.');
                return;
            }
            var chart = this.lookup('chart');
            chart.preview();
        }*/
    },

    newLineChart: function () {
        return  {
            xtype: 'cartesian',
            reference: this.chartItemId,
            width: '95%',
            height: this.chartHeight,
            insetPadding: '40 10 0 10',
            interactions: {
                type: 'crosszoom',
                zoomOnPanGesture: false
            },
            bind:{
                store: '{pm_chart_store}'
            },
            sprites: [{
                type: 'text',
                text: this.chartTitle,
                fontSize: 14,
                width: 100,
                x: 10, // the sprite x position
                y: 20  // the sprite y position
            }],
            axes: [{
                type: 'numeric',
                position: 'left',
                grid: true,
                majorTickSteps: 10,
                minimum: 0,
                limits: [{
                    value:10,
                    line: {
                        strokeStyle: 'red',
                        lineWidth: 1,
                        lineDash: [3,3],
                        title: {
                            text: this.limitValue,
                            fontWeight: 'bold',
                            fillStyle: '#494949',
                            fontSize: 14
                        }
                    }
                }],
                renderer: 'onAxisLabelRender'
            }, {
                type: 'category',
                position: 'bottom',
                grid: true,
                /*label: {
                    rotate: {
                        degrees: -45
                    }
                }*/
            }],
            series: [{
                type: 'line',
                xField: 'label',
                yField: 'value',
                style: {
                    lineWidth: 2
                },
                marker: {
                    radius: 4,
                    lineWidth: 2
                },
                label: {
                    field: 'value',
                    display: 'over'
                },
                highlight: {
                    fillStyle: '#000',
                    radius: 5,
                    lineWidth: 2,
                    strokeStyle: '#fff'
                },
                tooltip: {
                    trackMouse: true,
                    showDelay: 0,
                    dismissDelay: 0,
                    hideDelay: 0,
                    renderer: 'onSeriesTooltipRender'
                }
            }],
            listeners: {
                itemhighlight: 'onItemHighlight'
            },
            tbar: [
               /*{
                    itemId:'chartTitleBar',
                    xtype: 'panel',
                    html:'<span style="font-weight: 700">&nbsp;&nbsp;'+this.chartTitle+'</span>',
                },*/
                '->',
                {
                    iconCls: 'x-fa fa-undo',
                    tooltip: _('Return to the previous zoom'),
                    handler:'onUndoZoom'
                },
                {
                    iconCls: 'x-fa fa-save',
                    tooltip: _('Save as picture'),
                    handler:'onSaveImage'
                },
                {
                    iconCls: 'x-fa fa-gear',
                    tooltip: _('Threshold configuration'),
                    handler:'onRangeSetting'
                },
                {
                    xtype: 'panel',
                    html:''
                }]
        }
    },

    initComponent: function () {
        this.items=this.newLineChart();
        this.callParent();
    }
});