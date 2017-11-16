Ext.define("Admin.view.security.view.user.userOpAuthority", {
    extend: "Ext.panel.Panel",
    requires: "Admin.view.security.controller.user.userOpAuthority",
    controller: "userOpAuthority",
    xtype: "userOpAuthority",
    itemId: "user_form_operset",
    title: _("Operation authority"),
    border: false,
    bodyPadding: 10,
    layout: "hbox",
    frame: true,
    margin: -2,
    defaults: {
        height: "100%"
    },
    operset_ids: [],
    addIds: new Set(),
    delIds: new Set(),
    items: [{
        xtype: 'panel',
        flex: 1,
        scrollable: true,
        style: {
            'border': '2px solid #f5f5f5'
        },
        items: [{
            xtype: "treepanel",
            itemId: "resource_tree",
            margin: "-1 0 0 0 ",//tree 和dockedItems存在一个灰色的条
            rootVisible: false,
            useArrows: true,
            animate: true,
            bufferedRenderer: false,
            listeners: {
                selectionchange: "onResourceSelectChange",
                beforeitemexpand: "onBeforeItemExpand"
            },
            store: {
                autoLoad:true,
                proxy: {
                    type: "ajax",
                    url: "/security/security_group/getFunAccess?symbol_id=0",
                    reader: {
                        type: "json",
                        rootProperty: 'children'
                    }
                }
            }
        }],
        dockedItems: [{
            xtype: "toolbar",
            height: 30,
            items: [{
                xtype: "label",
                text: _("Authorized object"),
                margin: "0 0 0 8"
            }]
        }]
    },{
        xtype: "fieldcontainer",
            layout: "center",
            width: 60,
            items: [{
                xtype: "fieldcontainer",
                layout: "vbox",
                defaultType: "button",
                defaults: {
                    width: 40,
                    margin: 4
                },
                items: [{
                    text: ">",
                    itemId: "select",
                    disabled: true,
                    handler: "onSelect"
                }, {
                    text: "<",
                    itemId: "deselect",
                    disabled: true,
                    handler: "onDeSelect"
                }]
            }]
    },{
        xtype: 'panel',
        flex: 1,
        scrollable: true,
        style: {
            'border': '2px solid #f5f5f5'
        },
        items:[{
            xtype: "treepanel",
                itemId: "operset_tree",
                margin: "-1 0 0 0 ",
                rootVisible: false,
                useArrows: true,
                animate: true,
                bufferedRenderer: false,
                listeners: {
                    selectionchange: "onOpersetSelectChange"
                },
                store: {
                    autoLoad:true,
                    proxy: {
                        type: "ajax",
                        url: "/security/security_group/getOperatorSet",
                        extraParams: {
                            type: -9999,
                            use_token: 1
                        },
                        reader: {
                            type: "json",
                            rootProperty: 'children'
                        }
                    }
                }
        }],
        dockedItems: [{
            xtype: "toolbar",
            height: 30,
            items: [{
                xtype: "label",
                text: _("Optional set of operations"),
                margin: "0 0 0 8"
            }]
        }]
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userOpAuthorityToolBar',
        hidden: true,
        defaults: {
            minWidth: 60,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Apply'), iconCls: 'x-fa fa-save', handler: 'onApply' }
        ]
    }]
});
