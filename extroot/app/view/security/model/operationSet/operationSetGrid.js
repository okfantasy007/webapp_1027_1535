Ext.define('Admin.view.security.model.operationSet.operationSetGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/security_operset/load',
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});