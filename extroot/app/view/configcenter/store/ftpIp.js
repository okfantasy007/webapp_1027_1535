Ext.define('Admin.view.configcenter.store.ftpIp', {
    extend: 'Ext.data.Store',
    alias: 'store.ftpIp',
    proxy: {
        type: 'ajax',
        // extraParams:{
        //    id:m.getValue() 
        // },

        autoLoad: true,
        url: '/confcenter/configcenter/res/fileServer/ipList',
        reader: {
            type: 'json',
            rootProperty: 'ipObjList',
        },
    }

});