Ext.define('Admin.view.performance.templateMangement.model.userLeftTree.userPMLeftTree', {
    extend: 'Ext.data.Model',
    fields: [],

    proxy: {
        type: 'ajax',
        url: 'pmManagement/api/pmmng/metricTmpl/queryMetricTree',
        reader: {
            type: 'json',
            rootProperty: 'children',
        }
    }
});