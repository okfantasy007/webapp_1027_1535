Ext.define('Admin.view.configcenter.store.date', {
    extend: 'Ext.data.Store',
    alias: 'store.date',
    fields: ['id', 'name'],
    autoLoad: true,
    baseParams: {
        "id": "0"
    },
    proxy: {
        type: 'ajax',
        // extraParams:{
        //    id:m.getValue() 
        // },
        url: '/configcenter/dataBackupStrategy/date',
        reader: {
            type: 'json',
            rootProperty: 'data',
            //: 'totalCount'
            totalProperty: 'totalCount'

        },
    }
});
