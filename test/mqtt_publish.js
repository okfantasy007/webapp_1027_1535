var mqtt = require("mqtt");

global.APP = {};

APP.mqtt_client = mqtt.connect(
    "mqtt://172.16.75.98"
);

var msg = {
    "alarm_lv1_count": parseInt(Math.random()*100),
    "alarm_lv2_count": parseInt(Math.random()*100),
    "alarm_lv3_count": parseInt(Math.random()*100),
    "alarm_lv4_count": parseInt(Math.random()*100),
    "alarm_lv5_count": parseInt(Math.random()*100),
};

var payload = JSON.stringify(msg,null,2);
console.log(payload);

APP.mqtt_client.publish('alarm-counter-update', payload);
APP.mqtt_client.publish('system-update', payload);
APP.mqtt_client.publish('performance-update', payload);

console.log("finish");
// process.exit();