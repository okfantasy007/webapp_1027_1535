Ext.define('Admin.view.security.viewModel.controlList.controlListGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.controlListGrid',
    stores: {
        controlListStore: {
            model: 'Admin.view.security.model.controlList.controlListGrid',
            autoLoad: true
        }
    }
});