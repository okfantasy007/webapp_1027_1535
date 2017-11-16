Ext.define('Admin.view.performance.thresholdTemplateMangement.model.TTMAddPage.thresholdSymbolModel', {
    extend: 'Ext.data.Model',
    fields: ['name', 'cuisine'],

    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/metricTmpl/queryMetricTmpl',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});