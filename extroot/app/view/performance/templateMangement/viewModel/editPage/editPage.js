Ext.define('Admin.view.performance.templateMangement.viewModel.editPage.editPage', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.editPage',
    stores: {
        userLeftTreeStore: {

            filterer: 'bottomup',
            type: 'tree',
            model: 'Admin.view.performance.templateMangement.model.editPage.editPage',
        }
    }
});