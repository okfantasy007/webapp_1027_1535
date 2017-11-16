Ext.define('Admin.view.security.model.user.managementDomain', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/test/managementDomain',
        extraParams: {
            sec_usergroup_id: ''
        },
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});