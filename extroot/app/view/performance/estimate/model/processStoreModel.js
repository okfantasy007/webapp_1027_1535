Ext.define('Admin.view.performance.estimate.model.processStoreModel', {
    extend: 'Ext.data.Model',
    //采集周期
    fields: [
        'text',
        'value'
    ],
    proxy: {
        type: 'ajax',
        url: '/pmCollect/api/estimate/queryServer',
        reader: {
            type: 'json',
            //rootProperty: 'rows',
        },
    }
})