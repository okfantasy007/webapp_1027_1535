
Ext.define('Admin.view.security.view.user.userTab', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Admin.view.security.view.user.userGeneric',
        'Admin.view.security.view.user.userInfo',
        'Admin.view.security.view.user.userOfGroup',
        'Admin.view.security.view.user.userControlList',
        'Admin.view.security.controller.user.userTab',
        "Admin.view.security.view.user.userMgDomain",
        "Admin.view.security.view.user.userOpAuthority",
        'Admin.view.security.viewModel.user.userOfGroupGrid',
        'Admin.view.security.model.user.userOfGroupGrid',
        'Admin.view.security.view.user.userOfGroupGrid',
        'Admin.view.security.controller.user.userOfGroup'
    ],
    controller: 'userTab',
    xtype: 'userTab',
    deferredRender: false,//很重要的属性死也要记住
    itemId: 'security_user_form_table',
    border: false,
    sec_user_id: -1,
    name: "",
    tabBar: {
        // plain: true,
        layout: {
            pack: 'left'
        }
    },
    user_type: '',
    edit: false,
    items: [{
        xtype: 'userGeneric',
        // iconCls: 'x-fa fa-gears'
    }, {
        xtype: 'userInfo',
        // iconCls: 'x-fa fa-info',
    }, {
        xtype: 'userOfGroup',
        // iconCls: 'x-fa fa-users'
    }, {
        xtype: 'userMgDomain',
        // iconCls: 'x-fa fa-sitemap'
    }, {
        xtype: 'userOpAuthority',
        // iconCls: 'x-fa fa-adjust'
    }, {
        xtype: 'userControlList',
        // iconCls: 'x-fa fa-list-alt'
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userTabToolbar',
        defaults: {
            minWidth: 80,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Cancel'), iconCls: 'x-fa fa-close', handler: 'onCancel' },
            { xtype: 'button', text: _('Save'), iconCls: 'x-fa fa-save', handler: 'onOk' }
        ]
    }]
});