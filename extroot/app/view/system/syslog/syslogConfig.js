Ext.define('Admin.view.system.syslog.syslogConfig', {
    alias:'syslogConfig' ,
    config:{
        logPageSize: 15,
        pageData: [
            {val: 15},
            {val: 30},
            {val: 60},
            {val: 100},
            {val: 200},
            {val: 500},
            {val: 1000},
            {val: 2000}
        ]
    }
});