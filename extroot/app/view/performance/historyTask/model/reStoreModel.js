Ext.define('Admin.view.performance.historyTask.model.reStoreModel', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/pmManagement/api/pmmng/pmTaskDetai/findResource',
        reader: {
            type: 'json',
            rootProperty: 'rows',// ���ڵ�
            totalProperty: 'total'
        },
    }
});