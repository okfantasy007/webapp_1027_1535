Ext.define('Admin.view.system.systemView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'systemView',

    requires: [
        'Admin.view.system.users.UsersView',
        'Admin.view.system.options.uiConfigView',
        'Admin.view.system.options.uiConfigViewModel',
        'Admin.view.system.options.uiConfigViewController',
        'Admin.view.system.systemManage.view.process.processListGrid',
        'Admin.view.system.systemManage.view.server.serverListGrid',
        'Admin.view.system.syslog.syslogConfig',
        'Admin.view.system.syslog.view.safelog.safeLogGrid',
        'Admin.view.system.syslog.view.systemoperatelog.sysOpLogGrid',
        'Admin.view.system.syslog.view.devoperatelog.devOpLogGrid',
        'Admin.view.system.syslog.view.loginlog.loginLogGrid',
        'Admin.view.system.syslog.view.runlog.runLogGrid',
        'Admin.view.system.systemManage.view.server.monitorTaskListGrid',
        'Admin.view.system.systemManage.view.server.thresholdForm',
        'Admin.view.system.systemManage.view.dbBackup.databaseBackupTab',
        'Admin.view.system.systemManage.view.syslogBackup.sysLogBackupTab',
        'Admin.view.system.systemManage.view.licenseForm.licenseForm',
        'Admin.view.system.systemManage.view.perDataDump.perDataDumpTab',
        //--------------------------------------security---------------------------------------
        'Admin.view.security.view.userLeftTree.userLeftTree',
        'Admin.view.security.view.controlList.controlListGrid',
        'Admin.view.security.view.securityPolicy.securityPolicyForm'
    ],

    controller: 'systemView',
    viewModel: 'systemView',

    items: [{
        xtype: 'leftMenutree',
        menuUrl: 'menu/system'
    },
    {
        xtype: 'rightContainer'
    }]
});
