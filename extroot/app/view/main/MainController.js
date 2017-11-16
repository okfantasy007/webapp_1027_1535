Ext.define('Admin.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onRouteUnmatched'
            }
        }
    },

    routes: {
        ':v1': 'onRouteChange',
        ':v1/:v2': 'onRouteChange',
        ':v1/:v2/:v3': 'onRouteChange',
        ':v1/:v2/:v3/:v4': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5/:v6': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5/:v6/:v7': 'onRouteChange',
        ':v1/:v2/:v3/:v4/:v5/:v6/:v7/:v8': 'onRouteChange'
    },

    lastView: null,
    loaded: false,
    popWin: null,

    onRouteChange: function (v1, v2, v3, v4, v5, v6, v7, v8) {//top
        var model = this.getViewModel();
        if (model.get('route_lv1_last') == v1) {
            // 1级路由未改变
            return;
        } else {
            model.set('route_lv1_last', v1);
            model.set('route_lv2_last', '');
        }

        var pathname = window.location.pathname;
        console.log("#####TOP##### ", pathname, v1, v2);

        if (pathname == '/ui' && v1 == 'logout') {
            window.location.href = '/logout';
            return;
        }
        if (pathname != '/login' && APP.user == '') {
            window.location.href = '/login#';
            return;
        }
        if (!this.loaded) {
            return;
        }

        var active = this.getReferences().mainCardPanel.getLayout().getActiveItem();
        if (!(active && active.routeId == v1)) {
            console.log("#####TOP2##### ", v1, v2);
            this.setCurrentView(v1);

            var mainCardPanel = this.getReferences().mainCardPanel;
            mainCardPanel.remove(active, true);
        }
    },

    onRouteUnmatched: function () {
        console.log("##### onRouteUnmatched ##### ");
        // this.setCurrentView( this.getView().default_routeId );
    },

    onMainViewRender: function () {
        console.log("##### TOP onMainViewRender ##### ");
        var ctrl = this;

        ctrl.getAlarmCounter();

        Ext.Ajax.request({
            url: '/menu/header',
            success: function (response, opts) {
                var topmenu = Ext.decode(response.responseText);
                // console.dir(obj);
                var mainHeaderTopMenu = ctrl.getReferences().mainHeaderTopMenu;
                mainHeaderTopMenu.add(topmenu);
                ctrl.loaded = true;

                if (!window.location.hash) {
                    var firstmenu = mainHeaderTopMenu.child('component[hidden!=true]');
                    // console.log('firstmenu', firstmenu);
                    var href = firstmenu.href.split('#')[1];
                    console.log("TOP redirect to firstmenu: ", href);
                    ctrl.redirectTo(href);
                } else {
                    var routeId = window.location.hash.split(/[#\/]/)[1];
                    console.log('TOP reload page to:', routeId);
                    ctrl.setCurrentView(routeId);
                }

            },
            failure: function (response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },

    setCurrentView: function (hashTag) {
        console.log('TOP setCurrentView');
        hashTag = (hashTag || '').toLowerCase();

        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            lastView = me.lastView,
            existingItem = mainCard.child('component[routeId=' + hashTag + ']'),
            topMenu = refs.mainHeaderTopMenu,
            menuItem = topMenu.child('component[href=#' + hashTag + ']'),
            view = menuItem.viewType,
            newView;

        menuItem.setPressed(true);

        // Kill any previously routed window
        if (lastView && lastView.isWindow) {
            // console.log("Top destroy view");
            lastView.destroy();
        }

        lastView = mainLayout.getActiveItem();

        if (!existingItem) {
            console.log("#TOP create view:", view);
            newView = Ext.create({
                xtype: view,
                routeId: hashTag,  // for existingItem search later
                hideMode: 'offsets'
            });
        }

        if (!newView || !newView.isWindow) {
            // !newView means we have an existing view, but if the newView isWindow
            // we don't add it to the card layout.
            if (existingItem) {
                // We don't have a newView, so activate the existing view.
                console.log("#TOP activate view:", view);
                if (existingItem !== lastView) {
                    mainLayout.setActiveItem(existingItem);
                }
                newView = existingItem;
            }
            else {
                // newView is set (did not exist already), so add it and make it the
                // activeItem.
                Ext.suspendLayouts();
                mainLayout.setActiveItem(mainCard.add(newView));
                Ext.resumeLayouts(true);
            }
        }

        if (newView.isFocusable(true)) {
            newView.focus();
        }

        me.lastView = newView;

        me.leftmenuResize();

    },

    onToggleNavigationSize: function () {
        // console.log('onToggleNavigationSize');
        var me = this,
            view = me.getView(),
            refs = me.getReferences(),
            mainHeaderLogo = refs.mainHeaderLogo,
            mainHeaderLogoMicro = refs.mainHeaderLogoMicro,
            mainHeaderToolbar = refs.mainHeaderToolbar,
            mainHeaderTopMenu = refs.mainHeaderTopMenu,
            menus = mainHeaderTopMenu.items.items,
            collapsing = mainHeaderLogo.isHidden(),
            iconAlign = collapsing ? 'top' : 'left',
            headerHeight = collapsing ? APP.headerHeight : 48;

        mainHeaderLogo.setHidden(!collapsing);
        mainHeaderLogoMicro.setHidden(collapsing);

        mainHeaderLogo.setHeight(headerHeight);
        mainHeaderLogoMicro.setHeight(headerHeight);
        mainHeaderToolbar.setHeight(headerHeight);

        for (var i in menus) {
            menus[i].setConfig({
                iconAlign: iconAlign
            })
        }

        me.leftmenuResize();
    },

    leftmenuResize: function () {
        var me = this,
            view = me.getView(),
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,

            collapsing = refs.mainHeaderLogo.isHidden(),
            mainLayout = mainCard.getLayout(),
            activeView = mainLayout.getActiveItem(),
            navigationList = activeView.down('leftMenutree'),
            new_width = collapsing ? 44 : APP.leftMenuWidth;

        navigationList.setMicro(collapsing)
        navigationList.setWidth(new_width);
        mainCard.updateLayout({ isRoot: true });
    },

    onClickAlarmSoundBtn: function (btn, e, eOpts) {
        var model = this.getViewModel();

        model.set('alarm_sound', !model.get('alarm_sound'));

        var msg = model.get('alarm_sound') ? _('Enable alarm sound') : _('Disable alarm sound');
        Ext.toast(msg);

        // model.set('alarm_lv1_count', parseInt(Math.random()*100));
        // model.set('alarm_lv2_count', parseInt(Math.random()*100));
        // model.set('alarm_lv3_count', parseInt(Math.random()*100));
        // model.set('alarm_lv4_count', parseInt(Math.random()*100));
        // model.set('alarm_lv5_count', parseInt(Math.random()*100));

        // colors:  {
        //     'primary':  '#337ab7',
        //     'success':  '#5cb85c',
        //     'info':     '#5bc0de',
        //     'warning':  '#f0ad4e',
        //     'danger':   '#d9534f',
        // },
        // var colornames = Object.keys(Public.colors);
        // var color = Object.keys(Public.colors)[ parseInt(Math.random() * colornames.length) ];

        // this.pushAlarmMsg( 
        //     // colornames.join('</br>'),
        //     colornames.join(','),           // 显示内容
        //     color,                          // 颜色
        //     20                              // 窗口关闭延时 0为不延时关闭
        // )
    },

    pushAlarmMsg: function (msg, level, delay) {
        var view = this.getReferences().mainPopAlarmPanel;
        // 信息，级别，停留时间 0=不自动关闭
        view.add(
            {
                xtype: 'mainAlarmContainer',
                msg: msg,
                level: level,
                closeDelay: delay
            }
        )
    },

    getAlarmCounter: function () {
        var model = this.getViewModel();
        Ext.Ajax.request({
            // url: 'alarm/counter',
            url: 'alarm/Monitor/getAmiLevelCount',
            success: function (response, opts) {
                console.log('getAlarmCounter-->success');
                try {
                    var obj = Ext.decode(response.responseText);
                    if (obj.success) {
                        model.set('alarm_lv1_count', obj.data.alarm_lv1_count);
                        model.set('alarm_lv2_count', obj.data.alarm_lv2_count);
                        model.set('alarm_lv3_count', obj.data.alarm_lv3_count);
                        model.set('alarm_lv4_count', obj.data.alarm_lv4_count);
                        model.set('alarm_lv5_count', obj.data.alarm_lv5_count);
                    } else {
                        model.set('alarm_lv1_count', 0);
                        model.set('alarm_lv2_count', 0);
                        model.set('alarm_lv3_count', 0);
                        model.set('alarm_lv4_count', 0);
                        model.set('alarm_lv5_count', 0);
                    }
                } catch (err) {
                    console.log('getAlarmCounter', err);
                }
            },
            failure: function () {
                model.set('alarm_lv1_count', 0);
                model.set('alarm_lv2_count', 0);
                model.set('alarm_lv3_count', 0);
                model.set('alarm_lv4_count', 0);
                model.set('alarm_lv5_count', 0);
            }
        });
    },

    onLockScreen: function () {
        console.log('onLockScreen');
        Ext.Ajax.request({
            url: 'login/lockscreen',
            method: 'POST',
            success: function (response, opts) {
                // var obj = Ext.decode(response.responseText);
                // console.log('login/response response',obj);
            }
        });
        Ext.create({
            xtype: 'lockscreen',
            hideMode: 'offsets'
        });
    },

    onResetPassword: function () {
        var win = new Ext.window.Window({
            title: _('Reset Password'),
            iconCls: "",
            modal: true,
            width: "33%",
            minWidth: 200,
            height: "42%",
            minHeight: 250,
            monitorResize: true,
            layout: "fit",
            items: [{
                xtype: "form",
                layout: "anchor",
                defaultType: "textfield",
                defaults: {
                    anchor: "100%",
                    margin: "6 12 0 12"
                },
                items: [{
                    name: 'oldPassword',
                    itemId: 'oldPassword',
                    fieldLabel: _('Enter the old password'),
                    inputType: "password",
                    maxLength: 16,
                    allowBlank: false,
                    margin: "15 12 0 12"
                }, {
                    name: 'newPassword',
                    itemId: 'newPassword',
                    inputType: 'password',
                    fieldLabel: _('Enter a new password'),
                    maxLength: 16,
                    allowBlank: false
                }, {
                    name: 'confirmPassword',
                    itemId: 'confirmPassword',
                    inputType: 'password',
                    fieldLabel: _('confirm password'),
                    maxLength: 16,
                    allowBlank: false
                }],
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    itemId: 'userTabToolbar',
                    defaults: {
                        minWidth: 60,
                        margin: 3
                    },
                    items: [
                        {
                            xtype: 'component',
                            flex: 1
                        },
                        {
                            xtype: 'button',
                            text: _('Cancel'),
                            iconCls: 'x-fa fa-close',
                            handler: function () {
                                this.up('window').close();
                            }
                        },
                        {
                            xtype: 'button',
                            text: _('Save'),
                            iconCls: 'x-fa fa-save',
                            handler: function () {
                                var window = this.up('window');
                                this.up('form').getForm().submit({
                                    url: '/security/modify_password',
                                    method: 'POST',
                                    params: {
                                        userName: APP.user
                                    },
                                    success: function (form, action) {
                                        Ext.MessageBox.alert(_('Notice'), _(action.result.msg), function () {
                                            window.close();
                                        });
                                    },
                                    failure: function (response, opts) {
                                        Ext.MessageBox.alert(_('Notice'), _(action.result.msg));
                                    }
                                });
                            }
                        }
                    ]
                }]
            }]
        });
        win.show();
    }

});
