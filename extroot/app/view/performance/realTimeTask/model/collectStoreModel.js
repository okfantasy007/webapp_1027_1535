Ext.define('Admin.view.performance.realTimeTask.model.collectStoreModel', {
    extend: 'Ext.data.Model',
    fields: [
        'abbr',
        'name'
    ],
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/pmTask/findCollectPeriod',
        reader: {
            type: 'json',
            //rootProperty: 'rows',
        },
    }
})