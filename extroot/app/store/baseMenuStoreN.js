Ext.define('Admin.store.baseMenuStoreN', {
    extend: 'Ext.data.TreeStore',
    storeId: 'baseMenuStore',

    fields: [{
        name: 'text'
    }],
    
    filters: null,
});