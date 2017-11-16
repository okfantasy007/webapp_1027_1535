Ext.define('Admin.view.security.model.onlineUser.onlineUserGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/load_online_user',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});