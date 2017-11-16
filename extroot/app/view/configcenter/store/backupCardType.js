Ext.define('Admin.view.configcenter.store.backupCardType', {
    extend: 'Ext.data.Store',
    alias: 'store.backupCardType',
    fields: [
        { name: 'cardTypeId' }, { name: 'cardTypeName' }],
    proxy: {
        type: 'ajax',
        autoLoad: true,
        url: '/confcenter/configcenter/res/cardType/backup/list',
        reader: {
            type: 'json',
            rootProperty: 'cardTypes',
        },
    }
});	