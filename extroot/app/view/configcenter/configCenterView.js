Ext.define('Admin.view.configcenter.configCenterView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'configCenterView',

    requires: [
        'Admin.view.configcenter.view.equipmentUpdate.file.equipmentUpdateFile',
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipmentUpdateMession',
        'Admin.view.configcenter.view.dataBackup.strategy.backupStrategy',
        'Admin.view.configcenter.view.dataBackup.mession.backupMession',
        'Admin.view.configcenter.view.dataBackup.file.backupFile',
        'Admin.view.configcenter.view.log.log',
        'Admin.view.configcenter.view.log.backupLog',
    ],

    controller: 'configCenterView',
    viewModel: 'configCenterView',

    items: [{
        xtype: 'leftMenutree',
        menuUrl: '/menu/configcenter'
    },
    {
        xtype: 'rightContainer'
    }]
});
