Ext.define('Admin.view.authentication.LockScreen', {
    extend: 'Admin.view.authentication.LockingWindow',
    xtype: 'lockscreen',

    requires: [
        'Admin.view.authentication.Dialog',
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.layout.container.HBox',
        'Ext.layout.container.VBox'
    ],

    title: _('屏幕已锁定'),

    defaultFocus : 'authdialog',  // Focus the Auth Form to force field focus as well

    items: [
        {
            xtype: 'authdialog',
            reference: 'authDialog',
            defaultButton : 'loginButton',
            autoComplete: false,
            width: 455,
            cls: 'auth-dialog-login',
            defaultFocus : 'textfield[inputType=password]',
            layout: {
                type  : 'vbox',
                align : 'stretch'
            },

            items: [
                {
                    xtype: 'container',
                    cls: 'auth-profile-wrap',
                    height : 120,
                    layout: {
                        type: 'hbox',
                        align: 'center'
                    },
                    items: [
                        {
                            xtype: 'image',
                            height: 80,
                            margin: 20,
                            width: 80,
                            alt: 'lockscreen-image',
                            cls: 'lockscreen-profile-img auth-profile-img',
                            src: 'images/go_locker128.png'
                        },
                        {
                            xtype: 'box',
                            html:   '<div class=\'user-name-text\'> ' 
                                    + _('User')
                                    + ' </div><div class=\'user-post-text\'> '
                                    + APP.user
                                    + ' </div>'
                        }
                    ]
                },

                {
                    xtype: 'container',
                    padding: '0 20',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },

                    defaults: {
                        margin: '10 0'
                    },

                    items: [
                        {
                            xtype: 'hidden',
                            name: 'user',
                            value: APP.user
                        },
                        {
                            xtype: 'textfield',
                            name: 'password',
                            labelAlign: 'top',
                            cls: 'lock-screen-password-textbox',
                            labelSeparator: '',
                            fieldLabel: _('请输入密码解锁!'),
                            emptyText: 'Password',
                            inputType: 'password',
                            allowBlank: false,
                            triggers:  APP.theme=='triton' ?  {glyphed:{cls: 'trigger-glyph-noop password-trigger'}} : {}
                            // triggers: {
                            //     glyphed: {
                            //         cls: 'trigger-glyph-noop password-trigger'
                            //     }
                            // }
                        },
                        {
                            xtype: 'button',
                            reference: 'loginButton',
                            scale: 'large',
                            ui: 'soft-blue',
                            iconAlign: 'right',
                            iconCls: 'x-fa fa-angle-right',
                            text: _('Unlock'),
                            formBind: true,
                            listeners: {
                                click: 'onUnlockButton'
                            }
                        },
                        {
                            xtype: 'component',
                            html: '<div style="text-align:right">' +
                                '<a href="#logout" target="_self" class="link-forgot-password">'+
                                _('使用其它用户登录')
                                +'</a></div>'
                        }
                    ]
                }
            ]
        }
    ]
});
