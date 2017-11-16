Ext.define('Admin.view.performance.historyTask.model.quotaTemplateModel', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/pmTask/findMetricTmpl',
        reader: {
            type: 'json',
            rootProperty: 'result',
        }
    }
});