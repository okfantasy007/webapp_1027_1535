Ext.define('Admin.view.main.Header', {
    extend: 'Admin.view.base.ContainerMqtt',
    xtype: 'mainHeader',
    requires: 'Admin.view.main.mainAlarmContainer',
    layout: {
        type: 'hbox',
        align: 'middle'
    },
    cls: 'shadow',
    //mqtt 配置
    mqttws_broker: APP.mqtt_websocket_host,
    mqttws_broker_port: APP.mqtt_websocket_port,
    mqttws_client_title: 'mainheader',

    mqttws_subscribe: {
        //接收实时告警
        'alarm_message': function (me, message) {
            console.log(message);
            var node = JSON.parse(message);
            var model = me.lookupViewModel();
            //告警声音提示
            /* var alarm_sound = model.get('alarm_sound');
             var level = node.iLevel;
             if (alarm_sound && node.iStatus == 2) {//声音按钮打开，且是新产生告警
                 var toolbar = me.down('toolbar');
                 var playButton = toolbar.down('button').nextSibling().nextSibling().nextSibling();
                 if (level != "" && level != null) {
                     playButton.setHtml('<audio autoplay name="media" src="audio/Level' + level + '.MP3"></audio>');
                 }
             }*/

            //判断拓扑中实时告警界面是否开启，如果开启，将新告警存入存入缓存
            var viewport = me.ownerCt;
            var topoalarm = viewport.down('realTimeAlarmView');
            if (topoalarm != null) {
                var alarmtree = topoalarm.getActiveTab();
                //var alarmtree = topoalarm.down('currentAlarmTreeView');
                var tabIndex = alarmtree.tabIndex;
                var bufferSize = alarmtree.bufferSize;
                if (tabIndex == 0 && node.alarm_event_type != 3) {
                    if (alarmtree.buffer.length < bufferSize) {
                        alarmtree.buffer.push(node);
                    } else {
                        alarmtree.buffer.remmove(alarmtree.buffer[0]);
                        alarmtree.buffer.push(node);
                    }

                } else if (tabIndex == 1 && node.alarm_event_type == 3) {
                    if (alarmtree.buffer.length < bufferSize) {
                        alarmtree.buffer.push(node);
                    } else {
                        alarmtree.buffer.remmove(alarmtree.buffer[0]);
                        alarmtree.buffer.push(node);
                    }

                }
                //topoalarm.down('currentAlarmTreeView').down('currentAlarmTreeView');
            }
            //判断分组监控中实时告警界面是否开启，如果开启，将新告警存入存入缓存
            var monitorRealTimeAlarm = viewport.down('alarmGroupMonitorView');
            if (monitorRealTimeAlarm != null) {
                var ruleList = monitorRealTimeAlarm.down('treepanel');
                var selecteditem = ruleList.getSelection();
                if (selecteditem != null && selecteditem.length > 0) {
                    var rule_id = selecteditem[0].get("am_rule_id");
                    if (rule_id == 2) {
                        var alarmTree = monitorRealTimeAlarm.down('currentAlarmTreeView');
                        if (alarmTree != null) {
                            var buffersize = alarmTree.bufferSize;
                            if (alarmTree.buffer.length < buffersize) {
                                alarmTree.buffer.push(node);
                            } else {
                                alarmTree.buffer.remmove(alarmTree.buffer[0]);
                                alarmTree.buffer.push(node);
                            }
                        }
                    }
                }

            }
            //得到告警统计数
            var alarm_last_update_time = model.get('alarm_last_update_time');
            var nowDate = new Date();
            if ((nowDate.getTime() - alarm_last_update_time) > 200) {
                model.set('alarm_last_update_time', nowDate.getTime());
                viewport.lookupController().getAlarmCounter();
            }
            me.task.delay(1500);
        },

        'alarm_count': function (me, message) {
            var counter = JSON.parse(message);
            var model = me.lookupViewModel();
            //统计告警个数
            model.set('alarm_lv1_count', counter.alarm_lv1);
            model.set('alarm_lv2_count', counter.alarm_lv2);
            model.set('alarm_lv3_count', counter.alarm_lv3);
            model.set('alarm_lv4_count', counter.alarm_lv4);
            model.set('alarm_lv5_count', counter.alarm_lv5);
        },

        'system-update': function (me, message) {
            console.log(message);
            var obj = JSON.parse(message);
            console.log('system-update', obj);
        },

        'performance-update': function (me, message) {
            console.log(message);
            var obj = JSON.parse(message);
            console.log('performance-update', obj);
        },

        'user_kickoff': function (me, message) {
            var msg = JSON.parse(message);
            var log_parm = msg.log_parm;
            var controller = me.lookupController();
            var message = msg.message;
            if (log_parm != '') {
                var parm = log_parm.split(',');
                for (var i in parm) {
                    if (APP.sessionID == parm[i].split("*")[0]) {
                        var parm_log = parm[i];
                        controller.pushAlarmMsg(
                            _(message),
                            "danger",
                            60
                        );
                        (function () {
                            var s = 60;
                            Ext.TaskManager.start({
                                run: function () {
                                    if (s < 0) {
                                        window.location.href = 'logout' + "?log_parm=" + parm_log;
                                        return false;
                                    }
                                    s--;
                                },
                                interval: 1000
                            });
                        })();
                        break;
                    }
                }
            }
        },
        //当session失效时，客户端共同请求服务端检测自己session是否存在,当session失效时跳转到登录页面
        'session_valid': function (me, message) {
            console.log('MQTT session_valid', message);
            Ext.Ajax.request({
                url: "/session_valid",
                success: function (response, opts) {
                    var obj = Ext.decode(response.responseText);
                    if (!obj.session_valid) {
                        window.location.href = 'logout' + '?log_type=' + 4;
                        // alert("MQTT session_valid", response.responseText);
                    }
                }
            });
        }

    },
    initComponent: function () {
        this.connect();
        this.callParent();
        //倒计时：
        var me = this;
        this.task = new Ext.util.DelayedTask(function () {
            console.info('start get alarm count.....');
            var viewport = me.ownerCt;
            viewport.lookupController().getAlarmCounter();
        });
    },
    items: [
        {
            xtype: 'container',
            reference: 'mainHeaderLogo',
            // style: 'background:#FFA500',
            cls: 'logo-toolbar',
            height: APP.headerHeight,
            hidden: false,
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: {
                xtype: 'label',
                html: "<img src='/images/banner_logo_white_24.png' height='24'> " + APP.app_name,
                padding: '0 0 0 15',
                width: APP.leftMenuWidth,
            }
        },

        {
            xtype: 'container',
            reference: 'mainHeaderLogoMicro',
            // style: 'background:#FFA500',
            cls: 'logo-toolbar',
            height: APP.headerHeight,
            hidden: true,
            layout: {
                type: 'center',
                // align: 'middle'
            },
            items: {
                xtype: 'label',
                html: "<img src='/images/r_logo_white_24.png' height='24'>",
                padding: '0 0 0 8',
                width: 44,
            }
        },

        {
            flex: 1,
            xtype: 'toolbar',
            style: 'background:#3c8dbc',
            // cls: 'blue-toolbar',
            reference: 'mainHeaderToolbar',
            border: false,
            height: APP.headerHeight,
            // defaults: {
            //     scale: 'medium',
            //     ui: 'toolbar-button'
            // },
            items: [

                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'toolbar-button',
                    iconCls: 'x-fa fa-navicon',
                    handler: 'onToggleNavigationSize',
                    tooltip: _('Toggle Menu Size')
                },

                {
                    xtype: 'segmentedbutton',
                    margin: '0 0 0 8',
                    reference: 'mainHeaderTopMenu',
                    defaults: {
                        scale: 'medium',
                        ui: 'toolbar-white-blue',
                        iconAlign: 'top',
                        // iconAlign: 'left',
                        hrefTarget: "_self"
                    },
                },

                '->',

                {
                    xtype: 'button',
                    ui: 'alarm-sound',
                    reference: 'alarmsoundbtn',
                    tooltip: _('禁止告警音效'),
                    iconCls: 'x-fa fa-volume-up',
                    html: '',
                    bind: {
                        iconCls: '{alarm_icon}',
                        tooltip: '{alarm_tooltip}'
                    },
                    handler: 'onClickAlarmSoundBtn'
                },

                {
                    xtype: 'button',
                    ui: 'alarm-counter',
                    style: 'background:#d9534f',
                    bind: {
                        text: '{alarm_lv1_count}',
                        tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{alarm_lv1_count}', 1),
                        hidden: '{alarm_lv1_count==0}'
                    },
                    hrefTarget: "_self",
                    href: "#alarms/current/lv1"
                },
                {
                    xtype: 'button',
                    ui: 'alarm-counter',
                    style: 'background:#ff851b',
                    bind: {
                        text: '{alarm_lv2_count}',
                        tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{alarm_lv2_count}', 2),
                        hidden: '{alarm_lv2_count==0}'
                    },
                    hrefTarget: "_self",
                    href: "#alarms/current/lv2"
                },
                {
                    xtype: 'button',
                    ui: 'alarm-counter',
                    style: 'background:#f0ad4e',
                    bind: {
                        text: '{alarm_lv3_count}',
                        tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{alarm_lv3_count}', 3),
                        hidden: '{alarm_lv3_count==0}'
                    },
                    hrefTarget: "_self",
                    href: "#alarms/current/lv3"
                },
                {
                    xtype: 'button',
                    ui: 'alarm-counter',
                    style: 'background:#31b0d5',     // 浅蓝
                    // style: 'background:#337ab7',  // 深蓝
                    bind: {
                        text: '{alarm_lv4_count}',
                        tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{alarm_lv4_count}', 4),
                        hidden: '{alarm_lv4_count==0}'
                    },
                    hrefTarget: "_self",
                    href: "#alarms/current/lv4"
                },

                {
                    xtype: 'button',
                    ui: 'alarm-counter',
                    style: 'background:#999',    // 灰色
                    // style: 'background:#5cb85c',    // 绿色
                    bind: {
                        text: '{alarm_lv5_count}',
                        tooltip: '当前有' + '{alarm_lv5_count}' + '个5级告警',
                        tooltip: Ext.String.format(_('There are currently {0} level {1} alarms'), '{alarm_lv5_count}', 5),
                        hidden: '{alarm_lv5_count==0}'
                    },
                    hrefTarget: "_self",
                    href: "#alarms/current/lv5"
                },
                {
                    xtype: 'button',
                    ui: 'alarm-counter-total',
                    bind: {
                        text: '{alarm_total_count}',
                        tooltip: _('Current total number of alarms') + ': {alarm_total_count}',
                        hidden: '{alarm_total_count==0}'
                    },
                    hrefTarget: "_self",
                    href: "#alarms/current/all",
                    margin: '0 20 0 0'
                },

                {
                    // xtype: 'splitbutton',
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'toolbar-button',
                    tooltip: _('Options'),
                    iconCls: 'x-fa fa-wrench',
                    // iconCls: 'pictos pictos-settings2',
                    menu: [
                        {
                            text: _('Language'),
                            iconCls: APP.lang == 'zh_CN' ? 'language_zh_cn' : 'language_en_uk',
                            menu: [
                                {
                                    text: _('Chinese') + (APP.lang == 'zh_CN' ? ' [√]' : ''),
                                    iconCls: 'language_zh_cn',
                                    handler: function () {
                                        Public.switch_language("zh_CN");
                                    }
                                },
                                {
                                    text: _('English') + (APP.lang == 'en_US' ? ' [√]' : ''),
                                    iconCls: 'language_en_uk',
                                    handler: function () {
                                        Public.switch_language("en_US");
                                    }
                                }
                            ]
                        },
                        {
                            iconCls: 'x-fa fa-clone',
                            text: _('Theme'),
                            menu: [
                                {
                                    text: _('Classic'),
                                    iconCls: APP.theme == 'classic' ? 'x-fa  fa-check-square-o' : 'x-fa fa-square-o',
                                    handler: function () {
                                        Public.switch_ext_theme('classic');
                                    }
                                },
                                {
                                    text: _('Gray'),
                                    iconCls: APP.theme == 'gray' ? 'x-fa  fa-check-square-o' : 'x-fa fa-square-o',
                                    handler: function () {
                                        Public.switch_ext_theme('gray');
                                    }
                                },
                                {
                                    text: _('Flat'),
                                    iconCls: APP.theme == 'triton' ? 'x-fa  fa-check-square-o' : 'x-fa fa-square-o',
                                    handler: function () {
                                        Public.switch_ext_theme('triton');
                                    }
                                }
                            ]
                        }
                    ]
                },

                {
                    // xtype: 'splitbutton',
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'toolbar-button',
                    iconCls: 'x-fa fa-user',
                    text: APP.user,
                    margin: '0 10 0 10',
                    menu: [
                        {
                            iconCls: 'icon-exit',
                            text: _('Exit Current User'),
                            handler: function () {
                                window.location.href = 'logout' + '?log_type=' + 1;
                            }
                        },
                        {
                            iconCls: 'icon-monitor-password',
                            text: _('Lock Screen'),
                            handler: 'onLockScreen'
                        },
                        {
                            iconCls: 'icon-key',//用户修改密码
                            text: _("Reset Password"),
                            handler: 'onResetPassword'
                        }
                    ]
                }

            ]
        }

    ]

});
