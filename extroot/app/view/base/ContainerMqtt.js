Ext.define('Admin.view.base.ContainerMqtt', {
    extend: 'Ext.container.Container',
    xtype: 'ContainerMqtt',

    mqttws_broker: '127.0.0.1',
    mqttws_broker_port: 15675,
    mqttws_client_title: 'default',
    mqttws_qos: 1,
    mqttws_subscribe: {},
    mqttws_timeout: 5,
    ws_client: null,

    initComponent: function() {
        var me = this;
        // var task = Ext.TaskManager.start({
        //     run: function() {
        //         if (me.ws_client == null) {
        //             console.log("Reconnectting MQTT broker...", me.ws_broker, ws_broker_port);
        //             g_mqtt.connect(me.ws_broker, ws_broker_port);
        //         }
        //     },
        //     interval: 10000 // 10 second
        // });
        this.callParent();
    },

    connect : function() {
        var me = this;

        var mqttws_broker_host = me.mqttws_broker;
        if (me.mqttws_broker=='localhost' || me.mqttws_broker=='127.0.0.1') {
            // 如果是本地mqtt服务器，使用webserver的远程地址
            mqttws_broker_host = location.host.split(":")[0];
        };

        // =========== use ActiveMQ ===========
        // var client = new Paho.MQTT.Client(
        //     me.mqttws_broker,
        //     me.mqttws_broker_port,
        //     "web_clientid_" + parseInt(Math.random() * 100, 10)
        // );        

        // =========== use RabbitMQ 3.6.9 ===========
        var client = new Paho.MQTT.Client(
            mqttws_broker_host,
            me.mqttws_broker_port,
            "/ws",
            "web_clientid_" + APP.sessionID + '-' + me.mqttws_client_title
        );        

        client.onConnectionLost = function (responseObject) {
            console.log("Websocket MQTT connection lost: " + responseObject.errorMessage);
            me.ws_client = null;
        };

        client.onMessageArrived = function (message) {
            for (var topic in me.mqttws_subscribe) {
                if (message.destinationName==topic) {
                    me.mqttws_subscribe[topic]( me, message.payloadString );
                }
            }
        };

        client.connect({
            timeout: me.mqttws_timeout,
            userName: APP.mqtt_websocket_user,
            password: APP.mqtt_websocket_pwd,
            onSuccess: function () {
                console.log("Websocket MQTT connected!",client.isConnected());
                // Connection succeeded; subscribe to our topic, you can add multile lines of these
                for (var topic in me.mqttws_subscribe) {
                    client.subscribe(topic, {qos: me.mqttws_qos});
                }
                me.ws_client = client;
            },
            onFailure: function (message) {
                console.error("Websocket MQTT connection failed: " + message.errorMessage);
            }
        });
    },

    subscribe: function(topic, cb_func) {
        var me = this;
        me.mqttws_subscribe[ topic ] = cb_func;
        me.ws_client.subscribe(topic, {qos: me.mqttws_qos});
    },

    unsubscribe: function(topic) {
        var me = this;
        me.ws_client.unsubscribe(topic);
        delete me.mqttws_subscribe[ topic ];
    },

    disconnect: function() {
        var me = this;
        me.ws_client.disconnect();
    },

    publish : function(topic, payload){
        var message = new Paho.MQTT.Message(payload);
        message.destinationName = topic;
        this.ws_client.send(message);
    }

});
