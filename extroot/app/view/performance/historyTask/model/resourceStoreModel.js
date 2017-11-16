Ext.define('Admin.view.performance.historyTask.model.resourceStoreModel', {
    extend: 'Ext.data.Model',
    //资源Store
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/pmTaskDetai/queryResource',
        reader: {
            type: 'json',
            rootProperty: 'rows'
        },

    }
});
