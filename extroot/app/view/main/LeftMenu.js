
Ext.define('Admin.view.main.LeftMenu', {
    extend: 'Ext.list.Tree',
    xtype: 'leftMenutree',

    requires : [
        // 修复treelist已知bug
        'Admin.view.main.treelistFixed'
    ],

    width: APP.leftMenuWidth,
    style: 'overflow-y:auto',
    cls: 'shadow',
    ui: 'adminlte',

    reference: 'navigationTreeList',
    itemId: 'navigationTreeList',

    expanderFirst: false,
    expanderOnly: false,
    listeners: {
        selectionchange: 'onMenuSelectionChange',
    },
})