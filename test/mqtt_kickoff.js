var mqtt = require("mqtt");

global.APP = {};

APP.mqtt_client = mqtt.connect(
    "mqtt://172.16.75.98"
);

var msg = JSON.stringify({
    server_pid: process.pid,
},null,2)
console.log('**** restrictRoute ****',msg);
APP.mqtt_client.publish('session_valid', msg);

console.log("finish");
// process.exit();