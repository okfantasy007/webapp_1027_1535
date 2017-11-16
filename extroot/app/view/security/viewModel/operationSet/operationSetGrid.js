Ext.define('Admin.view.security.viewModel.operationSet.operationSetGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.operationSetGrid',
    stores: {
        operationSetGridStore: {
            model: 'Admin.view.security.model.operationSet.operationSetGrid',
            autoLoad: true
        }
    }
});