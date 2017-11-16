var sprintf = require('sprintf-js').sprintf;

var utilcomm = require('../../routes/resource/util');

function init() {
  APP.mqtt_client.subscribe('alarm_message');
  APP.mqtt_client.on('message', function (topic, message) { 
      if(topic != 'alarm_message') { return; }

      let msg = JSON.parse(message);
      log.trace('alarmMonitoring received an alarm_message, alarm_type_id', msg.alarm_type_id);

      let isOfflineAlarm = (msg.alarm_type_id == '1');
      if(isOfflineAlarm) { return; }

      let neid = msg.iRCNetNodeID;
      let sql = sprintf("update res_ne set resourcestate = 1 where neid = %s and resourcestate != 1", neid);
      utilcomm.promiseSimpleQuery(sql)
      .then(function(rows) {
        if(rows.changedRows > 0) {
          log.debug('alarmMonitoring, update res online status to 1 neid=', neid);
          var msg = {
            operation: 'online_status_change',
            source: 'alarmMonitor',
            type: 'ne',
            datas: [neid]
          };
          // log.debug('broadcast resource msg: ', JSON.stringify(msg));
          APP.mqtt_client.publish('resource', JSON.stringify(msg));

          let sql = sprintf("update topo_symbol set status_is_ping_ok = 1 where ne_id=%d and status_is_ping_ok != 1", neid);
          return utilcomm.promiseSimpleQuery(sql);
        }
      })
      .then(function(rows) {
        if(!rows) { return; }
        if(rows.changedRows > 0) {
          log.debug('alarmMonitoring, update topo online status to 1 neid=', neid);
          var msg = {
            operation: 'online_status_change',
            source: 'alarmMonitor',
            type: 'node',
            datas: [{neid: neid}]
          };
          // log.debug('broadcast topo msg: ', JSON.stringify(msg,null,2));
          APP.mqtt_client.publish('topo', JSON.stringify(msg));
        }
      })
      .catch(function(err) {
        log.error('alarmMonitoring update res_ne resourcestate error', err);
      });
  });
}

exports.init = init;