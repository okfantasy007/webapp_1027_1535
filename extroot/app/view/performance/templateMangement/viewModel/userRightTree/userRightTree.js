Ext.define('Admin.view.performance.templateMangement.viewModel.userRightTree.userRightTree', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userRightTree',

    stores: {
        userRightTreeStore: {
            root: {
                text: _('Selected Metric'),
                "checked": false,
                expanded: true,
            },
            filterer: 'bottomup',
            type: 'tree',
            model: 'Admin.view.performance.templateMangement.model.userRightTree.userRightTree',
        }
    }
});