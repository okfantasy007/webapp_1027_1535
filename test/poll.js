var cjson = require('cjson');
var mysql = require('mysql');
var redis = require("redis");
var mqtt = require("mqtt");
var log4js = require('log4js');
log4js.configure(require('./config/logger'));

global.sprintf = require("sprintf-js").sprintf;
global.log = log4js.getLogger('console');

var polling = require('./modules/polling');

global.APP = {};

// 读取配置文件config/default.json
// APP.config = require('config');

// 直接load json文件，可包含注释
APP.config = cjson.load('./config/default.json');

APP.redis_client = redis.createClient({
    host: APP.config.redis.host,
    port: parseInt(APP.config.redis.port)
});

APP.mqtt_client = mqtt.connect(
    sprintf("mqtt://%s", APP.config.mq.mqtt_host)
);

APP.dbpool = mysql.createPool({
    host: '172.16.75.98',
    port: 3306,
    user: 'root',
    password: 'asd`12',
    database: 'app',
    multipleStatements: true 
});

// polling.oneSecond( function() {
// 	console.log("--");
// });

polling.create(APP.dbpool, APP.config.mq.amqp_host, APP.config.mq.amqp_port)
// polling.start();

setTimeout(function () {
    console.log(Date.now() + 'timeout test!\r\n');
    // polling.sync();
	// polling.status();
	// polling.stop();
}, 10000);

console.log("finish");