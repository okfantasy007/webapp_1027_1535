Ext.define('Admin.view.security.viewModel.userLeftTree.userLeftTree', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.secUserLeftTree',
    stores: {
        userLeftTreeStore: {
            type: 'tree',
            model: 'Admin.view.security.model.userLeftTree.userLeftTree',
            //autoLoad: true
        }
    }
});