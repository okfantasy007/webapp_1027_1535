Ext.define('Admin.store.configLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'configLeftMenu',

    root: {
        expanded: true,
        children: [
            {
                text: _('Service Management'),
                iconCls: 'icon-gear-with-dollar-sign-inside',
                expanded: true,
                selectable: false,
                children: [
                    {
                        text: _('L2VPN Service'),
                        iconCls: 'icon-connection_person',
                        expanded: true,
                        selectable: false,
                        children: [
                            {
                                text: _('E-Line'),
                                iconCls: 'x-fa fa-circle-o',
                                viewType: 'elineView',
                                routeId: 'home',
                                leaf: true
                            },
                            {
                                text: _('Y.1564'),
                                iconCls: 'x-fa fa-circle-o',
                                viewType: 'y1564View',
                                routeId: 'sdny1564',
                                leaf: true
                            },
                            // {
                            //     text: _('TERM VIEW'),
                            //     iconCls: 'x-fa fa-circle-o',
                            //     viewType: 'TermForm',
                            //     routeId: 'termForm',
                            //     leaf: true
                            // },
                            {
                                text: _('DHCP SERVER'),
                                iconCls: 'x-fa fa-circle-o',
                                viewType: 'dhcpServerView',
                                routeId: 'dhcpServer',
                                leaf: true
                            },
                            /* {
                                text: _('性能'),
                                iconCls: 'x-fa fa-circle-o',
                                viewType: 'taskPmView',
                                routeId: 'pm',
                                leaf: true
                            },*/
                            {
                                text: _('Performance Statistics'),
                                iconCls: 'x-fa fa-circle-o',
                                viewType: 'pmView',
                                routeId: 'pm-view',
                                leaf: true
                            },
                            /*{
                                text: _('业务性能统计2'),
                                iconCls: 'x-fa fa-circle-o',
                                viewType: 'pmTest',
                                routeId: 'pmTest',
                                leaf: true
                            }*/
                        ]
                    },
                    // {
                    //     text: _('MPLS VPN业务'),
                    //     iconCls: 'x-fa fa-circle-o',
                    //     viewType: 'pageblank',
                    //     routeId: 'mpls',
                    //     leaf: true
                    // }
                ]
            },
            // {
            //     text: _('配置选项'),
            //     iconCls: 'x-fa fa-gear',
            //     routeId: 'cfgoption', // routeId defaults to viewType
            //     viewType: 'PrototypeView',
            //     image: 'config1.png',
            //     leaf: true
            // },        
            // {
            //     text: _('网元管理'),
            //     iconCls: 'x-fa fa-server',
            //     expanded: false,
            //     selectable: false,
            //     children: [
            //         {
            //             text: _('分组设备'),
            //             iconCls: 'x-fa fa-circle-o',
            //             viewType: 'pageblank',
            //             routeId: 'transport',
            //             leaf: true
            //         },
            //         {
            //             text: _('数通设备'),
            //             iconCls: 'x-fa fa-circle-o',
            //             viewType: 'pageblank',
            //             routeId: 'ip',
            //             leaf: true
            //         }
            //     ]
            // }
        ]
    }

});
