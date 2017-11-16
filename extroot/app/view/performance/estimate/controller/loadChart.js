Ext.define('Admin.view.performance.estimate.controller.loadChart', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.loadChart',
    export: function () {
        var chart = this.getView().up().down('#serverChart');
        var title = chart.getTitle();
        Ext.MessageBox.confirm(_('Confirm Download'), _('Would you like to download the chart as an image'), function (choice) {
            if (choice == 'yes') {
                chart.download({
                    url: '/pmManagement/api/export/image',
                    format: "jpeg",
                    filename: encodeURI(title),
                });
            }
        });
    },
    onAxisLabelRender: function (axis, label, layoutContext) {
        // return layoutContext.renderer(label);
        return label.toFixed(label < 10 ? 1 : 0);
    },
    onSeriesTooltipRender: function (tooltip, record, item) {
        var title = item.series.getTitle();
        tooltip.setHtml(title + ' on ' + record.get('startTime') + ': ' +
            record.get(item.series.getYField()) + ' s');
    },

    onColumnRender: function (v) {
        return v + ' s';
    },

    onToggleMarkers: function () {
        var chart = this.lookupReference('chart'),
            seriesList = chart.getSeries(),
            ln = seriesList.length,
            i = 0,
            series;

        for (; i < ln; i++) {
            series = seriesList[i];
            series.setShowMarkers(!series.getShowMarkers());
        }

        chart.redraw();
    },

});