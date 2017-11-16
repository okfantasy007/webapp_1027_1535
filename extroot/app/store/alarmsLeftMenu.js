Ext.define('Admin.store.alarmsLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'alarmsLeftMenu',

    root: {
        expanded: true,
        children: [
            {
                text: _('Alarm Group Monitor'),
                iconCls: 'x-fa fa-dedent',
                routeId: 'home', // routeId defaults to viewType
                viewType: 'alarmMonitorMainPanel',//'realTimeAlarmView',//
                fun_id:'alarmMonitorMainPanel',
                image: 'alarm1.png',
                leaf: true
            },        
            {
                text: _('Current Alarm Query'),
                iconCls: 'x-fa fa-bell',
                routeId: 'current', // routeId defaults to viewType
                viewType: 'currentAlarmView',
                fun_id:'currentAlarmView',
                image: 'alarm2.png',
                leaf: true
            },
            {
                text: _('History Alarm Management'),
                iconCls: 'x-fa fa-history',
                routeId: 'history', // routeId defaults to viewType
                viewType: 'historyAlarmView',
                fun_id:'historyAlarmView',
                image: 'alarm3.png',
                leaf: true
            },        
            {
                text: _('Alarm Type Management'),
                iconCls: 'x-fa fa-align-left',
                routeId: 'types', // routeId defaults to viewType
                viewType: 'alarmTypeView',
                fun_id:'alarmTypeView',
                image: 'alarm4.png',
                leaf: true
            },
            {
                text: _('Alarm Notify Management'),
                iconCls: 'x-fa fa-paper-plane',
                routeId: 'notify', // routeId defaults to viewType
                viewType: 'alarmNotifyMainView',
                fun_id:'alarmNotifyMainView',
                image: 'alarm5.png',
                leaf: true
            },        
            {
                text: _('Alarm Filter Policy'),
                iconCls: 'x-fa fa-filter',
                routeId: 'polices', // routeId defaults to viewType
                viewType: 'alarmFilterMainView',
                fun_id:'alarmFilterMainView',
                image: 'alarm6.png',
                leaf: true
            },
            {
                text: _('Troubleshooting'),
                iconCls: 'x-fa fa-file-text-o',
                routeId: 'exp', // routeId defaults to viewType
                viewType: 'AlarmReparExp',
                fun_id:'AlarmReparExp',
                image: 'alarm7.png',
                leaf: true
            },        
            {
                text: _('Sync Full Network Alarm'),
                iconCls: 'x-fa fa-retweet',
                routeId: 'syncall', // routeId defaults to viewType
                viewType: 'PrototypeView',
                fun_id:'PrototypeView',
                image: 'alarm8.png',
                leaf: true
            },
            {
                text: _('Alarm Reverse'),
                iconCls: 'x-fa fa-repeat',
                routeId: 'revert', // routeId defaults to viewType
                viewType: 'alarmReverse',
                fun_id:'alarmReverse',
                image: 'alarm9.png',
                leaf: true
            },        
            {
                text: _('Alarm Sync Management'),
                iconCls: 'x-fa fa-refresh',
                // routeId: 'sync', // routeId defaults to viewType
                // viewType: 'AlarmSyncMgtMainView',
                image: 'alarm10.png',
                expanded: false,
                selectable: false, 
                    children: [
                        {
                            text: _('Alarm Synchronization Task'),
                            iconCls: 'x-fa fa-clock-o',
                            routeId: 'sync-task', 
                            viewType: 'AlarmSyncTaskMainView',
                            leaf: true
                        },
                        {
                            text: _('Synchronization Status'),
                            iconCls: 'x-fa fa-binoculars',
                            routeId: 'sync-status', 
                            viewType: 'AlarmSyncStatus',
                            leaf: true
                        },
                        {
                            text: _('Synchronization Global Config'),
                            iconCls: 'x-fa fa-edit',
                            routeId: 'sync-config', 
                            viewType: 'AlarmSyncGlobalSet',
                            leaf: true
                        }
                    ]
            },
            {
                text: _('Alarm Trap Service Management'),
                iconCls: 'x-fa fa-gear',
                routeId: 'serverconfig', // routeId defaults to viewType
                viewType: 'alarmServerConfigGridView',
                fun_id:'alarmServerConfigGridView',
                image: 'alarm12.png',
                leaf: true
            }         
        ]
    }

});
