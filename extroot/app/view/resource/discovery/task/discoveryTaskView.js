Ext.define('Admin.view.resource.discovery.task.discoveryTaskView', {
    extend: 'Admin.view.base.ContainerMqtt',
    xtype: 'discoveryTaskView',
    
    requires: [
        'Admin.view.resource.discovery.task.discoveryTaskForm',
        'Admin.view.resource.discovery.task.discoveryTaskGrid',
        'Admin.view.resource.discovery.task.discoveryTaskReportGrid',
    ],

    layout: 'card',
    cls: 'shadow',

    second2hhmmss: function(seconds) {
        return (new Date(seconds * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
    },

    mqttws_broker: APP.mqtt_websocket_host,
    mqttws_broker_port: APP.mqtt_websocket_port,
    mqttws_timeout: 5,
    
    mqttws_subscribe: {

        'discovery_update': function(me, message) {
            var task_store = me.down('discoveryTaskGrid').getStore(),
                report_store = me.down('discoveryTaskReportGrid').getStore(),
                update_record = JSON.parse(message); 

            console.log( message );

            if (!update_record.is_ping_ok) {
                return;
            }

            update_record.status = _(update_record.status);
            report_store.add(update_record);
            // console.log(update_record);
        }

    },

    taskStarted: function() {
        this.connect();
    },

    taskEnded: function() {
        this.disconnect();
    },

    items: [
        {
            xtype: 'container',
            height: 400,
            layout: 'border',
            items: [
                {
                    xtype: 'discoveryTaskGrid',
                    region: 'center',
                    title: _('discovery task'),
                    iconCls: 'x-fa fa-circle-o',
                    flex: 1
                },
                {
                    xtype: 'discoveryTaskReportGrid',
                    region: 'south',
                    margin: '4 0 0 0',
                    flex: 1
                }
            ]
        },

        // form高度满屏写法
        // {
        //     xtype: 'discoveryTaskForm',
        // },

        // form高度自适应写法
        {
            xtype: 'container',
            items: [
                {
                    xtype: 'discoveryTaskForm',
                    title: _('discovery task config'),
                    iconCls: 'x-fa fa-circle-o'
                }
            ]
        },
    ]
    
});
