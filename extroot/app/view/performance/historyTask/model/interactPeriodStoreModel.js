Ext.define('Admin.view.performance.historyTask.model.interactPeriodStoreModel', {
    extend: 'Ext.data.Model',
    //采集周期
    fields: [
        'abbr',
        'name'
    ],
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/pmTask/findInteractPeriod',
        reader: {
            type: 'json',
            //rootProperty: 'rows',
        },
    }
})