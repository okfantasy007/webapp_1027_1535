var schedule = require("node-schedule");　
var mqtt = require("mqtt");

global.APP = {};
APP.mqtt_client = mqtt.connect(
    "mqtt://172.16.75.98"
);

var rule = new schedule.RecurrenceRule();
var times = [];

for (var i = 1; i < 60; i++) {
    times.push(i);
}　　
rule.second = times;　　
var c = 1;　　
var j = schedule.scheduleJob(rule, function() {　　
    console.log(c);

    var msgold = {
        "alarm_lv1_count": parseInt(Math.random() * 100),
        "alarm_lv2_count": parseInt(Math.random() * 100),
        "alarm_lv3_count": parseInt(Math.random() * 100),
        "alarm_lv4_count": parseInt(Math.random() * 100),
        "alarm_lv5_count": parseInt(Math.random() * 100),
    };

    var msg = {
        "node": {
            "text": "178",
            "iRCAlarmLogID": 178,
            "iRCNetNodeID": 11,
            "iRCAlarmID": 0,
            "iRCNETypeID": "",
            "iLevel": 1,
            "iObject": 1,
            "iStatus": 1,
            "strName": "光口接收Link Down",
            "strMsg": "2017-06-02 17:12:39",
            "strUptime": "2017-06-02 17:12:41",
            "strLastTime": "2017-06-02 17:12:41",
            "strDeviceName": "[RCTF-006257]",
            "strLocation": "",
            "strIPAddress": "172.16.75.28",
            "strAckHost": "",
            "strAckLog": "",
            "strAckTime": "",
            "strClearLog": "",
            "strClearTime": "",
            "strDesc": "",
            "strUserName": "",
            "strNETimestamp": "0",
            "strRecoveryTime": "",
            "ADMIN_STATUS": 0,
            "ALARM_SOURCE_TYPE": 1,
            "ALARM_CATEGORY": 1,
            "ALARM_EVENT_TYPE": 2,
            "ALARM_TYPE_ID": 1,
            "CUS_NAME": "",
            "CLEAR_USER": "",
            "URL": "/ne=3",
            "LASTING_TIME": 0,
            "IS_LOCAL": 1,
            "IS_AFFECT_SERVICE": 0,
            "RS_CIRCUITID": "",
            "RESPONDING_TIME": 0,
            "PROCESSING_TIME": 0,
            "NETYPE_DISPLAY_NAME": "NMS",
            "GATEWAY_ID": 0,
            "GATEWAY_NAME": "",
            "FAULT_REASON_ID": 0,
            "relation_flag": 0,
            "iconCls": "alarm_main_icon",
            "leaf": false,
            "checked": false,
            "children": [{
                "text": "179",
                "iRCAlarmLogID": 179,
                "iRCNetNodeID": 11,
                "iRCAlarmID": 0,
                "iRCNETypeID": "",
                "iLevel": 1,
                "iObject": 1,
                "iStatus": 1,
                "strName": "光口接收Link Down",
                "strMsg": "2017-06-02 17:12:39",
                "strUptime": "2017-06-02 17:12:41",
                "strLastTime": "2017-06-02 17:12:41",
                "strDeviceName": "[RCTF-006257]",
                "strLocation": "",
                "strIPAddress": "172.16.75.28",
                "strAckHost": "",
                "strAckLog": "",
                "strAckTime": "",
                "strClearLog": "",
                "strClearTime": "",
                "strDesc": "",
                "strUserName": "",
                "strNETimestamp": "0",
                "strRecoveryTime": "",
                "ADMIN_STATUS": 0,
                "ALARM_SOURCE_TYPE": 1,
                "ALARM_CATEGORY": 1,
                "ALARM_EVENT_TYPE": 2,
                "ALARM_TYPE_ID": 1,
                "CUS_NAME": "",
                "CLEAR_USER": "",
                "URL": "/ne=3",
                "LASTING_TIME": 0,
                "IS_LOCAL": 1,
                "IS_AFFECT_SERVICE": 0,
                "RS_CIRCUITID": "",
                "RESPONDING_TIME": 0,
                "PROCESSING_TIME": 0,
                "NETYPE_DISPLAY_NAME": "NMS",
                "GATEWAY_ID": 0,
                "GATEWAY_NAME": "",
                "FAULT_REASON_ID": 0,
                "relation_flag": 0,
                "iconCls": "alarm_relation_icon",
                "leaf": true,
                "checked": false,
                "children": []
            }]
        },
        "alarmcount": {
	        "alarm_lv1_count": parseInt(Math.random() * 100),
	        "alarm_lv2_count": parseInt(Math.random() * 100),
	        "alarm_lv3_count": parseInt(Math.random() * 100),
	        "alarm_lv4_count": parseInt(Math.random() * 100),
	        "alarm_lv5_count": parseInt(Math.random() * 100),        	
        }
    };

    msg.node.iRCAlarmLogID = c++;
    msg.node.children[0].iRCAlarmLogID = c++;

    var payload = JSON.stringify(msg, null, 2);
    console.log(payload);
    console.log(msg.node.iRCAlarmLogID, msg.node.children[0].iRCAlarmLogID);

    APP.mqtt_client.publish('alarm_message', payload);
    // APP.mqtt_client.publish('system-update', payload);
    // APP.mqtt_client.publish('performance-update', payload);

    console.log("finish");

})