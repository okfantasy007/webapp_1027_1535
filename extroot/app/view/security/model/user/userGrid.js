Ext.define('Admin.view.security.model.user.userGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/sec_usergrid',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});