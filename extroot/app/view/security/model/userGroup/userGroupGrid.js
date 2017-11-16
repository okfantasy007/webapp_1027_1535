Ext.define('Admin.view.security.model.userGroup.userGroupGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/security_group/load',
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});