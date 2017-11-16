Ext.define('Admin.view.system.systemManage.model.perDataDump.dataRestoreGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmdata/storage/management/listfiles',
        reader: {
            type: 'json',
            rootProperty: 'data',
        }
    }
});