Ext.define('Admin.view.performance.thresholdTemplateMangement.model.TTMAddPage.TTMTemplateSymbol', {
    extend: 'Ext.data.Model',
    fields: [],

    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/metricTmpl/queryMetricTmpl',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});