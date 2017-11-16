Ext.define('Admin.view.performance.historyTask.model.thresholdTemplateModel', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/thresholdTmpl/queryThresholdTmpl',
        reader: {
            type: 'json',
            rootProperty: 'rows',
        }
    }
});