Ext.define('Admin.view.security.model.userGroup.userGroupMemberGrid', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/security_group/getuesrs?sec_usergroup_type=1',
        reader: {
            type: 'json',
            rootProperty: 'root'
        }
    }
});