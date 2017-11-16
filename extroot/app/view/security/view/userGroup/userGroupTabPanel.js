Ext.define('Admin.view.security.view.userGroup.userGroupTabPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Admin.view.security.view.userGroup.userGroupTab',
        'Admin.view.security.controller.userGroup.userGroupTabPanel'
    ],
    controller: 'userGroupTabPanel',
    xtype: 'userGroupTabPanel',
    itemId: 'security_group_form',
    layout: 'fit',
    header: {
        border: false
    },
    items: [
        { xtype: 'userGroupTab' }
    ]
});