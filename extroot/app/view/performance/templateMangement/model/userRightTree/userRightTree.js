Ext.define('Admin.view.performance.templateMangement.model.userRightTree.userRightTree', {
    extend: 'Ext.data.Model',
    fields: [],

    proxy: {
        type: 'ajax',
        url: 'pmManagement/api/pmmng/metricTmpl/querySelectedMetricTree',
        reader: {
            type: 'json',
            rootProperty: 'children',
        }
    },
});