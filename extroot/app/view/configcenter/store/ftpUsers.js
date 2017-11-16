Ext.define('Admin.view.configcenter.store.ftpUsers', {
    extend: 'Ext.data.Store',
    alias: 'store.ftpUsers',
    proxy: {
        type: 'ajax',
        // extraParams:{
        //    id:m.getValue() 
        // },

        autoLoad: true,
        url: '/confcenter/configcenter/res/fileServer/ftpUsers',
        reader: {
            type: 'json',
            rootProperty: 'usernameObjs',
        },
    }

});