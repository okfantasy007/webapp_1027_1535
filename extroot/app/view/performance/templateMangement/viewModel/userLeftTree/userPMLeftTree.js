Ext.define('Admin.view.performance.templateMangement.viewModel.userLeftTree.userPMLeftTree', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userPMLeftTree',
    stores: {
        userLeftTreeStore: {
            root: {
                text: _('Metric Group'),
                "checked": false,
                iconCls: 'x-fa fa-stack-1x',
                expanded: true,
            },
            filterer: 'bottomup',
            type: 'tree',
            model: 'Admin.view.performance.templateMangement.model.userLeftTree.userPMLeftTree',
        }
    }
});