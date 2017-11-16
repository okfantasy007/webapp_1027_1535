Ext.define("Admin.view.security.view.user.userMgDomainForm", {
    extend: "Ext.form.Panel",
    requires: [
        "Admin.view.security.controller.user.userMgDomainForm"
    ],
    controller: "userMgDomainForm",
    xtype: "userMgDomainForm",
    frame: true,
    margin: -2,
    bodyPadding: 10,
    layout: 'hbox',
    defaults: {
        height: "100%"
    },
    oldSymbolId: 0,
    arr: [],
    items: [{
        xtype: "panel",
        flex: 1,
        scrollable: true,
        //layout: "fit",//此处不能用fit因为使用它后不会产生横向滚动条
        style: {
            'border': '2px solid #f5f5f5'
        },
        items: [{
            xtype: "treepanel",
            checkPropagation: "down",
            itemId: "noselectTree",
            margin: "-1 0 0 0 ",
            rootVisible: false,
            useArrows: true,
            animate: true,
            bufferedRenderer: false,
            store: {
                autoLoad: false,
                proxy: {
                    type: "ajax",
                    url: "/security/security_group/tree",
                    reader: {
                        type: "json",
                        rootProperty: "children"
                    }
                },
                sorters: [{
                    property: 'text',
                    direction: 'ASC'
                }]
            },
            listeners: {
                beforeitemexpand: "onBeforeItemExpand1",
                rowdblclick: "click"
            },
        }],
        dockedItems: [{
            xtype: "toolbar",
            height: 40,
            items: [{
                xtype: "label",
                text: _("Pending device and object set"),
                margin: '0 0 0 5'
            }, {
                xtype: "textfield",
                itemId: "selectfield",
                flex: 1,
                margin: "2 2 2 2",
            }, {
                tooltip: _("Inquire"),
                iconCls: "x-fa fa-search",
                handler: 'onCheck'
            }]
        }]
    }, {
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
                handler: "onCheckedNodesClick1"
            }, {
                text: "<",
                itemId: "deselect",
                handler: "onCheckedNodesClick2"
            }]
        }]
    }, {
        xtype: "panel",
        flex: 1,
        //layout: 'fit',//此处不能用fit因为使用它后不会产生横向滚动条
        scrollable: true,
        style: {
            'border': '2px solid #f5f5f5'
        },
        items: [{
            xtype: "treepanel",
            checkPropagation: "down",
            itemId: "selectTree",
            margin: "-1 0 0 0 ",
            rootVisible: false,
            useArrows: true,
            animate: true,
            bufferedRenderer: false,
            multiSelect: true,
            containerScroll: true,
            store: {
                autoLoad: false,
                proxy: {
                    type: "ajax",
                    url: "/security/security_group/tree",
                    reader: {
                        type: "json",
                        rootProperty: "children",
                        successProperty: "success"
                    }
                },
                sorters: [{
                    property: 'text',
                    direction: 'ASC'
                }]
            },
            listeners: {
                beforeitemexpand: "onBeforeItemExpand2"
            }
        }],
        dockedItems: [{
            xtype: "toolbar",
            height: 40,
            items: [{
                xtype: "label",
                text: _("Selected device and object set"),
                margin: '0 0 0 5'
            }]
        }]
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
