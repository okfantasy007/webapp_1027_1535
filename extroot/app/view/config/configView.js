Ext.define('Admin.view.config.configView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'configView',

    requires: [
        'Admin.view.config.layout.demoView',
        'Admin.view.config.sdn.eline.elineView',
        'Admin.view.config.sdn.eline.elineViewModel',
        'Admin.view.config.sdn.eline.elineViewController',

        //'Admin.view.config.sdn.TermForm',
        'Admin.view.config.sdn.dhcpServerView',
        //'Admin.view.config.sdn.pm.taskPmView',
        'Admin.view.config.sdn.pm.pmView',
        'Admin.view.config.sdn.pm.pmLineChart',
        'Admin.view.config.sdn.pm.pmTest',

        'Admin.view.config.sdn.y1564.y1564View',
        'Admin.view.config.sdn.y1564.y1564ViewModel',
        'Admin.view.config.sdn.y1564.y1564ViewController',

        'Admin.view.config.sdn.topo.elineTopoView',
        'Admin.view.config.sdn.topo.elineTopoModel',
        'Admin.view.config.sdn.topo.elineTopoController'
    ],

    controller: 'configView',
    viewModel: 'configView',

    items: [{
        xtype: 'leftMenutree',
        menuUrl: '/menu/config'
    }, {
        xtype: 'rightContainer'
    }]
});