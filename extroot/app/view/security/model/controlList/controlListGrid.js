Ext.define('Admin.view.security.model.controlList.controlListGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/security_control/load',
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});