Ext.define('Admin.view.configcenter.store.neSeries', {
    extend: 'Ext.data.Store',
    alias: 'store.neSeries',

    proxy: {
        type: 'ajax',
        autoLoad: true,
        url: '/confcenter/configcenter/res/neType/upgrade/series',
        reader: {
            type: 'json',
            rootProperty: 'neSerieList'
        },
    }
});