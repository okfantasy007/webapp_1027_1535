Ext.define('Admin.view.performance.historyTask.model.collectPeriodStoreModel', {
    extend: 'Ext.data.Model',
    fields: [
        'abbr',
        'name'
    ],
    proxy: {
        type: 'ajax',
        url: '/pmManagement//api/pmmng/pmTask/findHisCollectPeriod',
        reader: {
            type: 'json',
            //rootProperty: 'rows',
        },
    }
})