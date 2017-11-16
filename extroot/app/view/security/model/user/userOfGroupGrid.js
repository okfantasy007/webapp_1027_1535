Ext.define('Admin.view.security.model.user.userOfGroupGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/usergroup/load',
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});