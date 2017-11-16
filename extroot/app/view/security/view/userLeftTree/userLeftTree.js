Ext.define('Admin.view.security.view.userLeftTree.userLeftTree', {
    extend: 'Ext.container.Container',
    requires: [
        'Admin.view.security.view.user.userGrid',
        'Admin.view.security.view.user.userTabPanel',
        'Admin.view.security.view.userGroup.userGroupGrid',
        'Admin.view.security.view.onlineUser.onlineUserGrid',
        'Admin.view.security.view.userGroup.userGroupTabPanel',
        'Admin.view.security.viewModel.userLeftTree.userLeftTree',
        'Admin.view.security.model.userLeftTree.userLeftTree',
        'Admin.view.security.controller.userLeftTree.userLeftTree',
        'Admin.view.security.view.operationSet.operationSetGrid',
        'Admin.view.security.view.operationSet.operationSetTabPanel'
    ],
    viewModel: 'secUserLeftTree',
    controller: 'secUserLeftTree',
    xtype: 'secUserLeftTree',
    layout: 'border',
    border: false,
    cls: 'shadow',
    height: 0,
    items: [{
        xtype: 'panel',
        region: 'west',
        cls: 'shadow',
        border: false,
        width: 230,
        split: true,
        scrollable: true,
        title: _('Menu'),
        iconCls: 'x-fa fa-home',
        tools: [{
            type: 'refresh',
            tooltip: _('Refresh'),
            handler: 'onRefresh'
        }],
        items: [{
            xtype: 'treepanel',
            margin: "-2 0 0 0 ",
            rootVisible: false,
            useArrows: true,
            animate: true,
            bufferedRenderer: false,
            bind: {
                store: '{userLeftTreeStore}'
            },
            listeners: {
                load: 'onLoad',
                selectionchange: 'onSelectChange',
                itemcontextmenu: 'onContextMenu',
                resize: 'onSplitResize',
            }
        }]
    }, {
        xtype: 'panel',
        itemId: 'centerPanel',
        region: 'center',
        layout: 'card',
        cls: 'shadow',
        border: false,
        items: [{
            xtype: 'userGrid'
        }, {
            xtype: 'userTabPanel'
        }, {
            xtype: 'userGroupGrid'
        }, {
            xtype: 'userGroupTabPanel',
        }, {
            xtype: 'onlineUserGrid'
        }, {
            xtype: 'operationSetGrid'
        }, {
            xtype: 'operationSetTabPanel'
        }]
    }]

});