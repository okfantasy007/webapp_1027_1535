Ext.define("Admin.view.security.view.userGroup.userGroupTab", {
    extend: "Ext.tab.Panel",
    requires: [
        "Admin.view.security.view.userGroup.userGroupGeneric",
        "Admin.view.security.view.userGroup.userGroupMember",
        "Admin.view.security.view.userGroup.userGroupMgDomain",
        "Admin.view.security.view.userGroup.userGroupOpAuthority",
        "Admin.view.security.controller.userGroup.userGroupTab"
    ],
    controller: "userGroupTab",
    xtype: "userGroupTab",
    itemId: "security_group_form_table",
    deferredRender: false, //很重要的属性死也要记住
    border: false,
    sec_usergroup_id: -1,
    name: "",
    tabBar: {
        //plain: true,
        layout: {
            pack: 'left'
        }
    },
    items: [{
        xtype: "userGroupGeneric",
        // iconCls: 'x-fa fa-gears'
    }, {
        xtype: "userGroupMember",
        // iconCls: 'x-fa fa-user',
    }, {
        xtype: "userGroupMgDomain",
        // iconCls: 'x-fa fa-sitemap'
    }, {
        xtype: "userGroupOpAuthority",
        // iconCls: 'x-fa fa-adjust'
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userGroupTabToolbar',
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
