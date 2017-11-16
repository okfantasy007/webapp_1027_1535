Ext.define('Admin.view.performance.realTimeTask.model.protocolTypeModel', {
    extend: 'Ext.data.Model',
    //采集周期
    fields: [
        'abbr',
        'name'
    ],
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/pmTask/findProtocolType',
        reader: {
            type: 'json',
            //rootProperty: 'rows',
        },
    }
})