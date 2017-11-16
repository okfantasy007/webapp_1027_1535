Ext.define('Admin.view.security.view.user.userTabPanel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Admin.view.security.view.user.userTab',
        'Admin.view.security.controller.user.userTabPanel'
    ],
    controller: 'userTabPanel',
    xtype: 'userTabPanel',
    itemId: 'security_user_form',
    layout: 'fit',
    header: {
        border: false
    },
    items: [{
        xtype: 'userTab',
        listeners: {
            render: 'onRender'
        }
    }]
});