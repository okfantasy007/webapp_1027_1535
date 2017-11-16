Ext.define('Admin.view.security.viewModel.userGroup.userGroupMemberGrid', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.userGroupMemberGrid',
    stores: {
        autoLoad: true,
        userGridStore: {
            model: 'Admin.view.security.model.userGroup.userGroupMemberGrid'
        }
    }
});