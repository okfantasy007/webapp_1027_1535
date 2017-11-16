/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Admin.Application', {
    extend: 'Ext.app.Application',

    name: 'Admin',

    requires: [

        'Ext.app.*',
        'Ext.state.CookieProvider',
        'Ext.window.MessageBox',
        'Ext.window.Toast',
        'Ext.tip.QuickTipManager',
        'Ext.chart.*',
        'Ext.toolbar.*',

        'Ext.Base',
        'Ext.Component',
        'Ext.container.Container',
        'Ext.panel.Panel',
        'Ext.tab.Panel',
        'Ext.ux.layout.ResponsiveColumn',
        'Ext.form.Label',
        // 'Ext.ux.desktop.Module',

        // base
        'Admin.view.base.DateTimeField.field.DateTime',
        'Admin.view.base.SysClockField.field.DateTime',
        'Admin.view.base.ContainerMqtt',

        // public
        'Admin.view.main.LeftMenu',
        'Admin.view.main.RightContainer',
        'Admin.view.main.RightContainerBorder',
        'Admin.view.main.RightContainerTitled',
        'Admin.view.base.PrototypeView',

        // for test
        'Admin.view.pages.Error404Window',
        'Admin.view.pages.BlankPage',
        'Admin.view.pages.FormView',

        // for test view
        'Admin.view.test.widgetView',
        'Admin.view.test.widgetViewController',

        // sub system
        'Admin.view.system.systemView',
        'Admin.view.system.systemController',
        'Admin.view.system.systemModel',

        'Admin.view.dashboard.dashboardView',
        'Admin.view.dashboard.dashboardController',
        'Admin.view.dashboard.dashboardModel',

        'Admin.view.inventory.inventoryView',
        'Admin.view.inventory.inventoryController',
        'Admin.view.inventory.inventoryModel',

        'Admin.view.config.configView',
        'Admin.view.config.configController',
        'Admin.view.config.configModel',

        'Admin.view.reports.reportsView',
        'Admin.view.reports.reportsController',
        'Admin.view.reports.reportsModel',

        'Admin.view.alarms.alarmsView',
        'Admin.view.alarms.alarmsController',
        'Admin.view.alarms.alarmsModel',

        'Admin.view.performance.performanceView',
        'Admin.view.performance.performanceController',
        'Admin.view.performance.performanceModel',

        'Admin.view.configcenter.configCenterView',
        'Admin.view.configcenter.configCenterController',
        'Admin.view.configcenter.configCenterModel',

        'Admin.view.topology.topologyView',
        'Admin.view.topology.topologyController',
        'Admin.view.topology.topologyModel',

        'Admin.view.authentication.Login',
        'Admin.view.authentication.ResetPassword',
        'Admin.view.authentication.Downline',
        'Admin.view.authentication.LockScreen',
        'Admin.view.authentication.AuthenticationModel',
        'Admin.view.authentication.AuthenticationController',

    ],

    launch: function () {
        // TODO - Launch the application

        Ext.getBody().on({
            click: function (e, t, eOpts) {
                // console.log('click page_touch()');
                Public.page_touch();
            },
            keypress: function (e, t, eOpts) {
                // console.log('keypress page_touch()');
                Public.page_touch();
            }
        });

        APP.lockscreen = null;
        // timer
        var task = Ext.TaskManager.start({
            interval: 1000, // 1 second
            run: function () {
                if (APP.user == '' || APP.lockscreen) {
                    // 未登录或已经锁屏
                    return;
                }
                var escape_time = Public.get_escape_time();
                // console.log('escape_time:', escape_time);
                if (escape_time > APP.login_timeout) {

                    // 跳转到登录页面
                    // window.location.href = "/logout";

                    // 启动锁屏
                    APP.lockscreen = Ext.create({
                        xtype: 'lockscreen',
                        hideMode: 'offsets'
                    });
                }
            }
        });


        // custom Vtype for vtype:'IPAddress'
        Ext.apply(Ext.form.field.VTypes, {
            IPAddress: function (v) {
                var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
                //return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
            },
            IPAddressText: 'Invalid IP Address',
            IPAddressMask: /[\d\.]/i
        });

        Ext.apply(Ext.form.field.VTypes, {
            ipSubnet: function (v) {
                var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                ary = v.split("/");
                switch (ary.length) {
                    case 1:
                        if (ary[0].match(exp))
                            return true;
                        else
                            return false;
                        break;
                    case 2:
                        if (ary[0].match(exp) && ary[1].match(exp))
                            return true;
                        else
                            return false;
                        break;
                    default:
                        return false
                }
            },
            ipSubnetText: 'Invalid IP Address or Subnet',
            ipSubnetMask: /[\d\.\/]/i
        });

        // custom Vtype for vtype:'hostname'
        Ext.apply(Ext.form.field.VTypes, {
            hostname: function (v) {
                return /^[\w]+([\.][\w]+){0,64}$/.test(v);
            },
            hostnameText: 'Invalid host name',
            hostnameMask: /[\w\.]/i
        });

        Ext.apply(Ext.form.field.VTypes, {
            FilenName: function (v) {
                return /^[\w]+([\.][\w]+){0,64}$/.test(v);
            },
            FilenNameText: 'Invalid file name',
            FilenNameMask: /[\w\.]/i
        });

        // custom Vtype for vtype:'NameCn' 中文名称
        Ext.apply(Ext.form.field.VTypes, {
            NameCn: function (v) {
                var exp = /^([\u4e00-\u9fa5]|[\w])+$/;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
            },
            NameCnText: _('You may only use letters, numbers, underscore and Chinese charactes'),
            NameCnMask: /[\u4e00-\u9fa5\w]/i
        });

        // custome Vtype for vtype: 'snmp engine id'
        Ext.apply(Ext.form.field.VTypes, {
            EngineID: function (v) {
                var exp = /^([0-9|a-f][0-9|a-f]){5,32}$/i;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
            },
            EngineIDText: 'Invalid Engine ID',
            EngineIDMask: /[\w]/i
        });

        // 团体名验证: len:1-32
        Ext.apply(Ext.form.field.VTypes, {
            CommunityName: function (v) {
                var exp = /^.{1,32}$/;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
            },
            CommunityNameText: 'Invalid Community name',
            CommunityNameMask: /./i
        });

        // MAC验证
        Ext.apply(Ext.form.field.VTypes, {
            MacAddress: function (v) {
                //var exp=/^([a-fA-F0-9]){12}|[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}$/;
                var exp = /^([a-fA-F0-9]){12}|[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}-[a-f0-o]{2}|[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}:[a-f0-o]{2}$/;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
            },
            MacAddressText: 'Invalid MAC address',
            MacAddressMask: /[a-f0-9-:]/i
        });

        // 数字验证
        Ext.apply(Ext.form.field.VTypes, {
            PureNumber: function (v) {
                var exp = /^\d*$/;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
            },
            PureNumberText: 'Invalid numbers',
            PureNumberMask: /\d/i
        });

        // WPA pre share key
        Ext.apply(Ext.form.field.VTypes, {
            WpaPreShareKey: function (v) {
                var exp = /^[\x21-\x7f]{8,64}$/;
                if (v.match(exp) == null) {
                    return false;
                } else {
                    return true;
                }
            },
            WpaPreShareKeyText: 'Invalid Key (8~64 ascii characters)',
            WpaPreShareKeyMask: /[\x21-\x7f]/i
        });

        // // custom Vtype for vtype:'IPAddress'
        // Ext.define('Override.form.field.VTypes', {
        //     override: 'Ext.form.field.VTypes',

        //     IPAddress:  function(value) {
        //         return this.IPAddressRe.test(value);
        //     },
        //     IPAddressRe: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
        //     IPAddressText: 'Must be a numeric IP address',
        //     IPAddressMask: /[\d\.]/i
        // });

        // // custom Vtype for vtype:'time'
        // Ext.define('Override.form.field.VTypes', {
        //     override: 'Ext.form.field.VTypes',

        //     // vtype validation function
        //     time: function(value) {
        //         return this.timeRe.test(value);
        //     },
        //     // RegExp for the value to be tested against within the validation function
        //     timeRe: /^([1-9]|1[0-9]):([0-5][0-9])(\s[a|p]m)$/i,
        //     // vtype Text property: The error text to display when the validation function returns false
        //     timeText: 'Not a valid time.  Must be in the format "12:34 PM".',
        //     // vtype Mask property: The keystroke filter mask
        //     timeMask: /[\d\s:amp]/i
        // });
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});