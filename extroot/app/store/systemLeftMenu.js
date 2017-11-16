Ext.define('Admin.store.systemLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'systemLeftMenu',

    root: {
        expanded: true,
        children: [
            {
                text: _('系统管理'),
                iconCls: 'x-fa fa-gear',
                expanded: true,
                fun_id:'0301',
                hidden:SEC.hidden('0301'),
                selectable: false,     
                children: [
                    {
                        text: _('Processes'),
                        routeId: 'processView',
                        iconCls: 'x-fa fa-tasks',
                        viewType: 'processView',
                        fun_id:'processView',
                        hidden:SEC.hidden('processView'),
                        leaf: true
                    },
                    {
                        text: _('服务器管理'),
                        iconCls: 'icon-server_tower',
                        expanded: false,
                        fun_id:'030102',
                        hidden:SEC.hidden('030102'),
                        selectable: false,
                        children: [
                            {
                                text: _('服务器管理'),
                                iconCls: 'x-fa fa-server',
                                routeId: 'serverView',
                                viewType: 'serverView',
                                fun_id:'serverView',
                                hidden:SEC.hidden('serverView'),
                                leaf: true
                            },
                            {
                                text: '监控任务管理',
                                routeId: 'monitorTaskView',
                                iconCls: 'x-fa fa-tasks',
                                viewType: 'monitorTaskListGrid',
                                fun_id:'monitorTaskListGrid',
                                hidden:SEC.hidden('monitorTaskListGrid'),
                                leaf: true
                            },
                            {
                                text: '阈值管理',
                                iconCls: 'x-fa fa-sliders',
                                routeId: 'thresholdView',
                                viewType: 'thresholdForm',
                                fun_id:'thresholdForm',
                                hidden:SEC.hidden('thresholdForm'),
                                leaf: true
                            }
                        ]
                    },
                    // {
                    //     text: _('参数配置'),
                    //     iconCls: 'x-fa fa-tasks',
                    //     routeId: 'process_test1',
                    //     viewType: 'PrototypeView',
                    //     image: 'process.png',
                    //     leaf: true
                    // },
                    {
                        text: _('系统备份'),
                        iconCls: 'icon-backup',
                        expanded: false,
                        fun_id:'030103',
                        hidden:SEC.hidden('030103'),
                        selectable: false,
                        children: [
                            {
                                text: _('数据库备份'),
                                iconCls: 'x-fa fa-database',
                                routeId: 'databaseBackupView',
                                viewType: 'databaseBackupTab',
                                fun_id:'databaseBackupTab',
                                hidden:SEC.hidden('databaseBackupTab'),
                                leaf: true
                            },
                            {
                                text: _('日志备份'),
                                iconCls: 'icon-log-file-format',
                                routeId: 'syslogBackupView',
                                viewType: 'sysLogBackupTab',
                                fun_id:'sysLogBackupTab',
                                hidden:SEC.hidden('sysLogBackupTab'),
                                leaf: true
                            }
                        ]
                    },
                    {
                        text: _('数据转储'),
                        iconCls: 'x-fa fa-database',
                        expanded: false,
                        fun_id:'030104',
                        hidden:SEC.hidden('030104'),
                        selectable: false,
                        children: [
                            {
                                text: _('性能数据转储'),
                                iconCls: 'x-fa fa-database',
                                routeId: 'performanceDataDumpView',
                                viewType: 'perDataDumpTab',
                                fun_id:'perDataDumpTab',
                                hidden:SEC.hidden('perDataDumpTab'),
                                leaf: true
                            }
                        ]
                    },
                    /*{
                        text: _('License管理'),
                        iconCls: 'icon-medal',
                        routeId: 'licenseView',
                        viewType: 'licenseForm',
                        fun_id:'licenseForm',
                        hidden:SEC.hidden('licenseForm'),
                        leaf: true
                    },*/
                ]
            },
            {
                text: _('日志管理'),
                iconCls: 'icon-log-file-format',
                expanded: true,
                defaultValide:true,
                selectable: false,
                children: [
                    {
                        text: _('登录日志'),
                        iconCls: 'x-fa fa-user',
                        viewType: 'LoginLogView',
                        //image: 'userlog.png',
                        routeId: 'loginlog',
                        defaultValide:true,
                        leaf: true
                    },
                    {
                        text: _('安全日志'),
                        iconCls: 'icon-shield',
                        viewType: 'SafeLogView',
                        //image: 'userlog.png',
                        routeId: 'safelog',
                        defaultValide:true,
                        leaf: true
                    },
                    {
                        text: _('操作日志'),
                        iconCls: 'x-fa fa-gear',
                        viewType: 'SysOpLogView',
                        //image: 'userlog.png',
                        routeId: 'systemOpLog',
                        defaultValide:true,
                        leaf: true
                    },
                    {
                        text: _('设备syslog日志'),
                        iconCls: 'x-fa fa-server',
                        viewType: 'DevOpLogView',
                        //image: 'log1.png',
                        routeId: 'devicelog',
                        defaultValide:true,
                        leaf: true
                    },
                    {
                        text: _('运行日志'),
                        iconCls: 'x-fa fa-clock-o',
                        viewType: 'RunLogView',
                        // image: 'userlog.png',
                        routeId: 'runLog',
                        defaultValide:true,
                        leaf: true
                    }
                ]
            },
            {
                text: _('Security'),
                iconCls: 'icon-shield',
                expanded: true,
                selectable: false,
                children: [
                    {
                        text: _('网管用户管理'),
                        iconCls: 'x-fa fa-user',
                        viewType: 'secUserLeftTree',
                        // image: 'usermgr.png',
                        // user_auth: SEC.disable('sec_oper'),
                        routeId: 'usermgr',
                        leaf: true
                    },
                    // {
                    //     text: _('监视用户操作'),
                    //     iconCls: 'x-fa fa-camera',
                    //     viewType: 'monitorUserActions',
                    //     //image: 'security2.png',
                    //     // user_auth: SEC.disable('sec_oper'),
                    //     routeId: 'userwatch',
                    //     leaf: true
                    // },
                    {
                        text: _('访问控制列表'),
                        iconCls: 'x-fa fa-filter',
                        viewType: 'controlListGrid',
                        //image: 'security3.png',
                        routeId: 'acl',
                        leaf: true
                    },
                    {
                        text: _('设置安全策略'),
                        iconCls: 'icon-security-on',
                        viewType: 'securityPolicyForm',
                        //image: 'security4.png',
                        routeId: 'policies',
                        leaf: true
                    },
                ]
            },
            // {
            //     text: _('Options'),
            //     // iconCls: 'x-fa fa-check-square',
            //     iconCls: 'x-fa fa-wrench',
            //     expanded: true,
            //     selectable: false,

            //     children: [
            //         {
            //             text: 'Blank Page',
            //             iconCls: 'x-fa fa-circle-o',
            //             viewType: 'pageblank',
            //             routeId: 'pageblank',
            //             leaf: true
            //         },
            //         {
            //             text: '404 Error',
            //             iconCls: 'x-fa fa-exclamation-triangle',
            //             viewType: 'page404',
            //             routeId: 'page404',
            //             leaf: true
            //         }
            //     ]
            // }
        ]
    }

});
