Ext.define("Admin.view.security.view.user.userMgDomain", {
    extend: "Ext.panel.Panel",
    requires: [
        "Admin.view.security.view.user.userMgDomainWindow",
        "Admin.view.security.controller.user.userMgDomain"
    ],
    controller: "userMgDomain",
    xtype: "userMgDomain",
    itemId: "user_form_resource",
    title: _("Management domain"),
    border: false,
    // layout: "fit",
    scrollable: true,
    edit: false,
    subnetSet: new Set(),
    subnetDevSet: new Set(),
    symbolSet: new Set(),
    delSubnetSet: new Set(),
    delSymbolSet: new Set(),
    sec_usergroup_id: -1,
    items: [{
        xtype: "treepanel",
        itemId: "selectedTree",
        rootVisible: false,
        useArrows: true,
        animate: true,
        bufferedRenderer: false,
        margin: "-1 0 0 0 ",
        selectedIds: [],
        store: {
            proxy: {
                type: "ajax",
                url: "/security/security_group/tree?flag=1"
            },
            reader: {
                type: "json"
            }
        },
        listeners: {
            beforeitemexpand: "onBeforeItemExpand"
        }
    }],
    dockedItems: [{
        xtype: "toolbar",
        items: [{
            itemId: "editButton",
            text: _("Edit"),
            tooltip: _("Edit"),
            iconCls: "x-fa fa-edit",
            handler: "onEdit"
        }]
    }]
});
