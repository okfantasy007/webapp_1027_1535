Ext.define('Admin.view.performance.templateMangement.view.userRightTree.userRightTree', {
    extend: 'Ext.tree.Panel',
    requires: [
        'Admin.view.performance.templateMangement.viewModel.userRightTree.userRightTree',
        'Admin.view.performance.templateMangement.model.userRightTree.userRightTree',
        'Admin.view.performance.templateMangement.controller.userRightTree.userRightTree'
    ],
    xtype: 'userRightTree',
    viewModel: 'userRightTree',
    itemId: 'treepanel',
    reference: 'treepanel',
    controller: 'userRightTree',
    rootVisible: true,
    useArrows: true,
    checkPropagation: 'both',
    expandedAll: true,
    bind: {
        store: '{userRightTreeStore}'
    },
    listeners: {
        load: 'onLoad',

    },


});