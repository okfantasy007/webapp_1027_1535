Ext.define('Admin.view.security.model.user.userControlList', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/controlList/load',
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});