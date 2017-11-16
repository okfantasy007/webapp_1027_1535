Ext.define('Admin.view.configcenter.store.backupNeType', {
    extend: 'Ext.data.Store',
    alias: 'store.backupNeType',
    fields: [
        { name: 'netypeid' }, { name: 'netypename' }],
    proxy: {
        type: 'ajax',
        autoLoad: true,
        url: '/confcenter/configcenter/res/neType/backup/list',
        reader: {
            type: 'json',
            rootProperty: 'neTypes',
        },
    }
});	