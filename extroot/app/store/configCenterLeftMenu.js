Ext.define('Admin.store.configCenterLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'configCenterLeftMenu',

    requires: [
        'Admin.view.configcenter.view.equipmentUpdate.file.equipmentUpdateFile',
        'Admin.view.configcenter.view.equipmentUpdate.mession.equipmentUpdateMession',
        'Admin.view.configcenter.view.dataBackup.strategy.backupStrategy',
        'Admin.view.configcenter.view.dataBackup.mession.backupMession',
        'Admin.view.configcenter.view.dataBackup.file.backupFile',
        'Admin.view.configcenter.view.log.log',
        'Admin.view.configcenter.view.log.backupLog',
    ],

    root: {
        expanded: true,
        children: [

            // {
            //     text: _('配置选项'),
            //     iconCls: 'x-fa fa-gear',
            //     hidden: true,
            //     routeId: 'home', // routeId defaults to viewType
            //     viewType: 'PrototypeView',
            //     image: 'config1.png',
            //     leaf: true
            // },
            {
                text: _('设备升级'),
                routeId: 'equipmentUpdate',
                iconCls: 'x-fa fa-download',
                expanded: true,
                fun_id:'0801',
                selectable: false,
                children: [
                    {
                        leaf: true,
                        text: '升级文件管理',
                        iconCls: 'x-fa fa-files-o',
                        viewType: 'equipmentUpdateFile',
                        fun_id:'equipmentUpdateFile',
                        routeId: 'upgrade_file',
                    },
                    {
                        leaf: true,
                        text: '升级任务管理',
                        iconCls: 'x-fa fa-tasks',
                        viewType: 'equipmentUpdateMession',
                        fun_id:'equipmentUpdateMession',
                        routeId: 'home',
                    }

                ]
            },
            {
                text: _('数据备份'),
                routeId: 'dataBackup',
                iconCls: 'icon-backup',
                expanded: true,
                fun_id:'0802',
                selectable: false,
                children: [
                    {
                        text: _('备份策略管理'),
                        iconCls: 'x-fa fa-tags',
                        viewType: 'backupStrategy',
                        fun_id:'backupStrategy',
                        routeId: 'backup_strategy',
                        leaf: true
                    }, {
                        text: _('备份任务管理'),
                        iconCls: 'x-fa fa-tasks',
                        viewType: 'backupMession',
                        fun_id:'backupMession',
                        routeId: 'backup_mission',
                        leaf: true
                    }, {

                        text: _('备份文件管理'),
                        iconCls: 'x-fa fa-files-o',
                        viewType: 'backupFile',
                        fun_id:'backupFile',
                        routeId: 'backup_file',
                        leaf: true
                    }
                ]
            },
            {
                text: _('日志管理'),
                routeId: 'LogManage',
                iconCls: 'icon-log-file-format',
                expanded: true,
                fun_id:'0803',
                selectable: false,
                routeId: 'mpls22',
                children: [
                    {
                        text: _('升级日志'),
                        iconCls: 'x-fa fa-download',
                        viewType: 'upgradeLog',
                        fun_id:'upgradeLog',
                        routeId: 'upgrsde_log',
                        leaf: true
                    },
                    {
                        text: _('备份日志'),
                        iconCls: 'icon-backup',
                        viewType: 'backupLog',
                        fun_id:'backupLog',
                        routeId: 'backup_log',
                        leaf: true
                    }
                ]
            }
        ]
    }


});
