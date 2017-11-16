Ext.define('Admin.view.performance.templateMangement.viewModel.detailPage.detailPage', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.detailPage',
    stores: {
        userLeftTreeStore: {

            filterer: 'bottomup',
            type: 'tree',
            model: 'Admin.view.performance.templateMangement.model.detailPage.detailPage',
        }
    }
});