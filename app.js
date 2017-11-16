// APP requirement packages
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var proxy = require('express-http-proxy');
var mysql = require('mysql');
var mysql_promise = require('promise-mysql');
var redis = require('redis');
var mqtt = require('mqtt');
var log4js = require('log4js');

// ----------------- project modules -------------------

var polling = require('./modules/polling');
var alarmMonitoring = require('./modules/alarmMonitoring');
var hostMaintain = require('./modules/host');
var resSyncD = require('./modules/ressync');
var alarmSync = require('./modules/alarmSync');


// express instance
var app = express();

// --------------- assign middle ware ------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

// --------------------- view engine setup -----------------------
app.set('view engine', 'ejs');
// 关闭ejs模板调试信息
app.set("view options",{            
    "debug":false  
});  

// --------------------- express logger setup -----------------------
// app.use(logger('dev'));
log4js.configure(require('./config/logger'));
// app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
// app.use(log4js.connectLogger(log4js.getLogger("access"), { level: 'auto' }));


// ========================= APP global  ==============================
global.T = require('i18n');
global.sprintf = require("sprintf-js").sprintf;
global.figlet = require('figlet').textSync;
global.log = log4js.getLogger('console');
// global.log = log4js.getLogger('messages');
global.APP = {};
//zqq
// APP.securityManagerCenter={};
// Loading config file & init Application golbal vars
APP.config = require('config');


// =================== database connection pool =======================

APP.dbpool = mysql.createPool({
    host: APP.config.db.host,
    port: APP.config.db.port,
    user: APP.config.db.user,
    password: APP.config.db.password,
    database: APP.config.db.database,
    // 允许执行多条sql语句
    multipleStatements: true 
});


APP.dbpool_promise = mysql_promise.createPool({
    host: APP.config.db.host,
    port: APP.config.db.port,
    user: APP.config.db.user,    password: APP.config.db.password,
    database: APP.config.db.database,
    // connectionLimit: 10,
    multipleStatements: true 
});

// =================== redis & mqtt connection =======================

APP.redis_client = redis.createClient({
    host: APP.config.redis.host,
    port: parseInt(APP.config.redis.port)
});


APP.mqtt_client = mqtt.connect(
    sprintf("mqtt://%s", APP.config.mq.mqtt_host),
    {username: APP.config.mq.mqtt_user, password: APP.config.mq.mqtt_pwd}
);
/*APP.mqtt_client.subscribe("alarm_message"); 
APP.mqtt_client.on('message', function (topic, message) {
  // message is Buffer
    console.log("333333333333333333");
    console.log(message.toString());
    APP.mqtt_client.end();
});*/
APP.sdn_rest = {
    host: APP.config.sdn_rest.host,
    port: APP.config.sdn_rest.port
};

// =================== i18n =======================

// i18n config
T.configure({
    locales: ['en_US', 'zh_CN'],
    defaultLocale: APP.config.app.lang,
    directory: __dirname + '/locales'
});
T.setLocale(APP.config.app.lang);
// 在路由模块中安装 i18n 中间件
app.use(T.init);

// ================= 包含系统所有的错误代码 ==================
global.ERR = require('./config/errors');
// console.log( ERR(10001) );


// ===================== app.locals init =====================

app.locals.version = '0.1.0';
app.locals.app_name = APP.config.app.app_name;
app.locals.lang = APP.config.app.lang;
app.locals.theme = APP.config.app.theme;
app.locals.area = APP.config.app.area;
// app.locals.area = 'ui';
app.locals.debug = APP.config.app.debug;
app.locals.login_timeout = APP.config.app.login_timeout;
app.locals.mqtt_websocket_host = APP.config.mq.mqtt_host;
app.locals.mqtt_websocket_port = APP.config.mq.mqtt_websocket_port;
app.locals.mqtt_websocket_user = APP.config.mq.mqtt_user;
app.locals.mqtt_websocket_pwd = APP.config.mq.mqtt_pwd;
app.locals.amqp_host = APP.config.mq.amqp_host;
app.locals.amqp_port = APP.config.mq.amqp_port;
// app.locals.user = 'guest';
app.locals.enable_https = APP.config.app.enable_https;
app.locals.enable_mapapi = APP.config.app.enable_mapapi;
app.locals.terminal_websocket_host=APP.config.terminal_websocket_server.host;
app.locals.terminal_websocket_port=APP.config.terminal_websocket_server.port;
// app.locals.security_user_info=APP.securityManagerCenter;

// --------------- login process part ------------------

// 用户登录检查
function restrict(req, res, next) {
    if (req.session.screen_locked) {
        req.session.destroy(function(){
             res.redirect('/login#');
        });
    } else if (!req.session.user) {
        req.session.error = 'Access denied!';
        res.redirect('/login#');
    } else {
        next();
    }
}

function restrictRoute(req, res, next) {
    if (!req.session.user) {
        // console.log('*********',req.ip.split(':').reverse()[0]);
        // console.log('*********',req.originalUrl);
        // req.session.error = 'Access denied!';
        var msg = JSON.stringify({
            serve_host: req.headers.host,
            server_pid: process.pid,
            client_ip: req.ip,
            client_method: req.method,
            client_url: req.url,
            id:9
        },null,2)
        APP.mqtt_client.publish('session_valid', msg);
       
    } else {
       
        next();
    }
}

APP.sessionStore = new RedisStore({
    host: APP.config.redis.host,
    port: APP.config.redis.port,
    // db: 0,
});
// APP.sessionStore = new session.MemoryStore();

app.use(session({
    resave: true, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret',
    rolling: true,
    store: APP.sessionStore,
    cookie: {
         maxAge: 1000 * APP.config.app.login_timeout
        // maxAge: 1000 * 60 *2
    }
}));


// Session-persisted message middleware
app.use(function(req, res, next) {
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});


// ========================== render 模板及静态文件目录==============================

// 静态目录缓存参数
var maxAge = {maxAge:1000 * APP.config.app.static_cache_maxage};
app.use(express.static(path.join(__dirname, 'static'),maxAge));
switch (APP.config.app.build_mode) {
    case 'development':
        // 开发模式代码位置
        app.locals.ui_template = 'development';
        app.set('views',            path.join(__dirname, 'extroot'));
        app.use('/', express.static(path.join(__dirname, 'extroot'),maxAge));
        break;
    case 'production':
        // 生产环境代码位置
        app.locals.ui_template = 'production';
        app.set('views',            path.join(__dirname, 'extroot/build/production/Admin'));
        app.use('/', express.static(path.join(__dirname, 'extroot/build/production/Admin'),maxAge));
        break;
    case 'testing':
        // build后测试环境代码位置
        app.locals.ui_template = 'production';
        app.set('views',            path.join(__dirname, 'extroot/build/testing/Admin'));
        app.use('/', express.static(path.join(__dirname, 'extroot/build/testing/Admin'),maxAge));
}

// render页面url
var ui_render = require('./routes/framework/ui_render');
app.use('/login',   ui_render);
app.use('/ui',      restrict,ui_render);


// 多语言处理
function i18n(req, res, next) {
    req.setLocale(req.app.locals.lang);
    next();
}

// ========================== web & rest route =========================

// ---------------------- 框架部分 -------------------------
app.use('/login',               require('./routes/framework/login'));
app.use('/logout',              require('./routes/framework/logout'));
app.use('/lang',                require('./routes/framework/lang'));
app.use('/menu',                restrictRoute,i18n, require('./routes/framework/menu'));

app.use('/theme',               restrict,require('./routes/framework/theme'));
app.use('/uuid',                restrict,require('./routes/framework/uuid'));
app.use('/widgets',             restrict,require('./routes/framework/widgets'));
app.use('/kickoffuser',         require('./routes/framework/kickoffuser'));
// app.use('/initSecurityBuffer',           require('./routes/framework/'));
// ---------------------- no auth -------------------------
// app.use('/',                    require('./routes/index'));

// ---------------------- 各子系统入口路由 -------------------------
app.use('/topo',                restrictRoute,i18n, require('./routes/topology/web'));
app.use('/rest/topo',           require('./routes/topology/rest'));
app.use('/resource',            restrictRoute,require('./routes/resource/web'));
app.use('/rest/resource',       require('./routes/resource/rest'));
app.use('/system',              restrictRoute,require('./routes/system/web'));
app.use('/rest/system',         require('./routes/system/rest'));
app.use('/alarm_node',          restrictRoute,require('./routes/alarm/web'));
app.use('/rest/alarm_node',     require('./routes/alarm/rest'));
app.use('/configcenter',        restrictRoute,require('./routes/configcenter/web'));
app.use('/rest/configcenter',   require('./routes/configcenter/rest'));
app.use('/inventory',           restrictRoute,require('./routes/inventory/web'));
app.use('/rest/inventory',      require('./routes/inventory/rest'));
app.use('/oss',                 restrictRoute,require('./routes/oss/web'));
app.use('/rest/oss',            require('./routes/oss/rest'));
app.use('/performance',         restrictRoute,require('./routes/performance/web'));
app.use('/rest/performance',    require('./routes/performance/rest'));
app.use('/security',            restrictRoute,require('./routes/security/web'));
app.use('/rest/security',       require('./routes/security/rest'));
app.use('/report',              require('./routes/report/report'));
app.use('/login_verify',        require('./routes/security/login/nmsLogin'));
app.use('/reset_pwd',           require('./routes/security/login/resetPwd'));
app.use('/session_valid',       require('./routes/security/login/sessionValid'));
app.use('/init_user_buffer',    require('./routes/security/login/initSecurityBuffer'));

//--------------------------sdn业务路由-------------------------------------
app.use('/config',require('./routes/config/rest'));
app.use('/config/sdn/eline',require('./routes/config/sdn/eline'));
app.use('/config/sdn/resource',require('./routes/config/sdn/resource'));
app.use('/config/sdn/y1564',require('./routes/config/sdn/y1564'));
app.use('/config/sdn/dhcpServer',require('./routes/config/sdn/dhcpServer'));
app.use('/config/sdn/pmService',require('./routes/config/sdn/performanceService'));

// ---------------------- demo part -------------------------
app.use('/rest/users',          require('./routes/rest_users'));
app.use('/users',               restrictRoute,require('./routes/users'));
app.use('/demo',                restrictRoute,require('./routes/demo'));
app.use('/rest/redis/users',    require('./routes/demo_rest_redis'));

// ---------------------- auth need -------------------------
app.use('/syslog',              restrictRoute,require('./routes/syslog'));
app.use('/dashboard',           restrictRoute,require('./routes/dashboard'));


// ---------------------- http proxy  -------------------------
// proxy转发过程中加入用户名到http头
var proxyOpts =  {
    proxyReqOptDecorator: function(proxyReqOpts, req) {
        console.log("sessionID:",req.sessionID);
        proxyReqOpts.headers['user'] = req.session.user ? req.session.user : '';
        proxyReqOpts.headers['sid'] = req.sessionID;
        proxyReqOpts.headers['ip_address'] = req.session.ip_address;     
        return proxyReqOpts;
    }
};
// proxy转发过程中加入用户名到http头
//并且将parseBody设置为false
var confProxyOpts =  {
    parseReqBody: false,
    proxyReqOptDecorator: function(proxyReqOpts, req) {
        console.log("sessionID:",req.sessionID);
        proxyReqOpts.headers['user'] = req.session.user ? req.session.user : '';
        proxyReqOpts.headers['sid'] = req.sessionID;

        return proxyReqOpts;
    }
};
// 初始化在defalut.json中配置的proxy路径
var use_proxy = function(items, opts) {
    for (var k in items) {
        log.debug('use proxy:', k, ' --> ',items[k]);
        app.use(k, proxy(items[k], opts));
    }
};
use_proxy(APP.config.proxy.internal, proxyOpts);
use_proxy(APP.config.proxy.south, proxyOpts);
use_proxy(APP.config.proxy.north, proxyOpts);
use_proxy(APP.config.proxy.internal_upload,confProxyOpts);


app.use('/alarm/counter', function(req, res) {
    console.log('headers:',req.headers);
    res.json(200, {
        success: true,
        data: {
            // alarm_sound: false,
            alarm_lv1_count: 1,
            alarm_lv2_count: 23,
            alarm_lv3_count: 456,
            alarm_lv4_count: 7890,
            alarm_lv5_count: 19999,
        }
    });  
});


//-------------------templateTestRoute---------------------
app.use('/mysqlSearch', require('./routes/templateTest/MysqlDataOperation'));
app.use('/edit', require('./routes/templateTest/mysqEditInfo'));
app.use('/delete', require('./routes/templateTest/mysqDeleteInfo'));
app.use('/query', require('./routes/templateTest/MysqlQueryByID'));
app.use('/add', require('./routes/templateTest/mysqlAddInfo'));
app.use('/myTree', require('./routes/templateTest/myTree'));


// ------------- catch 404 and forward to error handler ------------
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    log.warn("originalUrl:", req.originalUrl);
    log.error(err);

    res.json(err.status || 500, {
        success: false, 
        error: err.message 
    });  
});

// i18n examples
// T.setLocale('zh_CN');
// console.log( T.getLocale() );
// console.log(  T.__('Hello') );
// T.setLocale('en_US');
// console.log( T.getLocale() );
// console.log(  T.__('Hello') );

// 日志examples
log.setLevel('TRACE');
log.trace('Entering cheese testing');
log.debug('Got cheese.');
log.info('Cheese is Gouda.');
log.warn('Cheese is quite smelly.');
log.error('Cheese is too ripe!');
log.fatal('Cheese was breeding ground for listeria.');

log.debug( APP.config );

if (APP.config.app.polling) {
    polling.init();
}
alarmMonitoring.init();
hostMaintain.maintainHost();
resSyncD.init();
alarmSync.init();

console.log('pid:---->',process.pid);

console.log('\n\n\n');
console.log(figlet(' MSP ',{font: 'Big Money-sw'}));
console.log(figlet('Web server up!'));

module.exports = app;