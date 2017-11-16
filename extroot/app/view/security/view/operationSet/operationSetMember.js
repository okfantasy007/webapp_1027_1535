Ext.define('Admin.view.security.view.operationSet.operationSetMember', {
    extend: 'Ext.form.Panel',
    requires: 'Admin.view.security.controller.operationSet.operationSetMember',
    controller: 'operationSetMember',
    xtype: 'operationSetMember',
    itemId: 'operset_select_funcs',
    title: _('member'),
    frame: true,
    margin: -2,
    bodyPadding: 10,
    layout: 'hbox',
    operset_type: 1,
    ids_selected: [],
    ids_noselected: [],
    ids_set_add: new Set(),
    ids_set_del: new Set(),
    arr: [],
    is_complete: 0,
    sec_operator_set_id: 0,
    defaults: {
        height: '100%'
    },
    items: [{
        xtype: 'panel',
        flex: 1,
        scrollable: true,
        style: {
            'border': '2px solid #f5f5f5'
        },
        items: [{
            xtype: 'treepanel',
            itemId: 'noselect_tree',
            border: false,
            margin: "-1 0 0 0 ",
            // frame: true,
            rootVisible: false,
            useArrows: true,
            animate: true,
            bufferedRenderer: false,
            store: {
                autoLoad: false,
                proxy: {
                    type: 'ajax',
                    url: '/security/security_operset/load_operset',
                    reader: {
                        type: 'json',
                        rootProperty: 'children'
                    }
                }
            }
        }],
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                xtype: 'label',
                text: _('Candidate members'),
                margin: '0 0 0 8'
            }, '->', {
                itemId: 'expandAll',
                tooltip: _('Full Expand'),
                handler: function () {
                    this.up('panel').down('treepanel').expandAll();
                },
                iconCls: 'x-fa fa-expand',
                disabled: false
            }, {
                itemId: 'closeAll',
                tooltip: _('Collapse All'),
                handler: function () {
                    this.up('panel').down('treepanel').collapseAll();
                },
                iconCls: 'x-fa fa-compress',
                disabled: false
            }, '-', {
                tooltip: _('Refresh'),
                iconCls: 'x-fa fa-refresh',
                handler: function () {
                    this.up('panel').down('treepanel').store.reload();
                }
            }]
        }]
    }, {
        xtype: 'fieldcontainer',
        layout: 'center',
        width: 60,
        items: [{
            xtype: 'fieldcontainer',
            layout: 'vbox',
            defaultType: 'button',
            defaults: {
                width: 40,
                margin: 4
            },
            items: [{
                text: '>',
                itemId: 'select',
                handler: 'onSelect'
            }, {
                text: '>>',
                itemId: 'select_all',
                handler: 'onSelectAll'
            }, {
                text: '<',
                itemId: 'deselect',
                handler: 'onDeSelect'
            }, {
                text: '<<',
                itemId: 'deselect_all',
                handler: 'onDeSelectAll'
            }]
        }]
    }, {
        xtype: 'panel',
        flex: 1,
        scrollable: true,
        style: {
            'border': '2px solid #f5f5f5'
        },
        items: [{
            xtype: 'treepanel',
            itemId: 'select_tree',
            margin: "-1 0 0 0 ",//样式：上部存在黑条
            border: false,
            // frame: true,
            rootVisible: false,
            useArrows: true,
            animate: true,
            bufferedRenderer: false,
            store: {
                autoLoad: false,
                proxy: {
                    type: 'ajax',
                    url: '/security/security_operset/load_operset',
                    reader: {
                        type: 'json',
                        rootProperty: 'children'
                    }
                }
            }
        }],
        dockedItems: [{
            xtype: 'toolbar',
            items: [{
                xtype: 'label',
                text: _('Selected members'),
                margin: '0 0 0 8'
            }, '->', {
                itemId: 'expandAll',
                tooltip: _('Full Expand'),
                handler: function () {
                    this.up('panel').down('treepanel').expandAll();
                },
                iconCls: 'x-fa fa-expand',
                disabled: false
            }, {
                itemId: 'closeAll',
                tooltip: _('Collapse All'),
                handler: function () {
                    this.up('panel').down('treepanel').collapseAll();
                },
                iconCls: 'x-fa fa-compress',
                disabled: false
            }, '-', {
                tooltip: _('Refresh'),
                iconCls: 'x-fa fa-refresh',
                handler: function () {
                    this.up('panel').down('treepanel').store.reload();
                }
            }]
        }]
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'operationSetMemberToolbar',
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