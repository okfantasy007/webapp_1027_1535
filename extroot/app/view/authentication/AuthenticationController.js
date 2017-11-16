Ext.define('Admin.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',

    onLoginButton: function () {
        var form = this.getView();
        if (form.isValid()) {
            form.submit({
                url: 'login',
                submitEmptyText: false,
                waitTitle: _('Please wait...'),
                waitMsg: _('Being logged in...'),
                success: function (form, action) {
                    Ext.getBody().mask();
                        if(action.result.errno==40017) {
                            Ext.Msg.alert(_("Notice"),_(action.result.msg),function(){
                                window.location = action.result.url;
                            });
                        } else {
                            window.location = action.result.url;
                        }   
                },
                failure: function (form, action) {
                    var result = action.result.msg,
                        errno = action.result.errno;
                    Ext.toast(_(result), _('Notice'), 't', 'x-fa x-fa fa-exclamation-circle');
                    if (errno == 40004) {
                        var id = id = action.result.id;
                        var window = new Admin.view.authentication.ResetPassword();
                        var userId = window.down("#userId");
                        userId.setValue(id);
                    }

                }
            });
        }
    },

    //TODO: implement central sina weibo OATH handling here
    onSinaWeiboLogin: function () {

        Ext.create('Ext.form.Panel', {
            items: [
                { xtype: 'hidden', name: 'user', value: 'sinauser' },
                { xtype: 'hidden', name: 'password', value: 'sinapass' }
            ]
        }).getForm().submit({
            url: 'login',
            waitTitle: _('Please wait...'),
            waitMsg: _('Being logged in...'),
            success: function (form, action) {
                Ext.getBody().mask();
                window.location = action.result.url;
            },
            failure: function (form, action) {
                Ext.Msg.alert(_('Login Failed'), action.result.msg);
            }
        }); // form

    },

    onUnlockButton: function () {
        var win = this.getView().up();
        var form = this.getView();
        if (form.isValid()) {
            form.submit({
                url: 'login/unlockscreen',
                submitEmptyText: false,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (form, action) {
                    // console.log(action.result);
                    win.close();
                    win.destroy();
                    Public.page_touch();
                    APP.lockscreen = null;
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('unlock failed'), _(action.result.msg));
                }
            });
        }
    },

    onNewAccount: function () {
        this.redirectTo('register', true);
    },

    onSignupClick: function () {
        this.redirectTo('dashboard', true);
    },

    onResetClick: function () {
        this.redirectTo('dashboard', true);
    },

    onResetPasswordButton: function () {

        var form = this.getView();
        var window = form.up("window");
        if (form.isValid()) {
            form.submit({
                url: '/reset_pwd',
                submitEmptyText: false,
                waitTitle: _('Please wait...'),
                waitMsg: _('Please wait...'),
                success: function (form, action) {
                    Ext.toast(_(action.result.msg), _('Notice'), 't', 'x-fa fa-exclamation-circle');
                    window.close();
                },
                failure: function (form, action) {
                    Ext.Msg.alert(_('Login Failed'), _(action.result.msg));
                }
            });
        }
    }
});