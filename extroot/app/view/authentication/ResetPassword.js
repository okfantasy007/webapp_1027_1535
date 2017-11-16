Ext.define('Admin.view.authentication.ResetPassword', {
    extend: 'Admin.view.authentication.LockingWindow',
    xtype: 'ResetPassword',

    requires: [
        'Admin.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button'
    ],

    title: _('修改密码'),
    defaultFocus: 'authdialog', // Focus the Auth Form to force field focus as well

    items: [
        {//用户下次登录修改密码页面
            xtype: 'authdialog',
            reference: 'authDialog',
            itemId: "resetPwd",
            defaultButton: 'loginButton',
            autoComplete: false,
            width: 455,
            cls: 'auth-dialog-login',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            items: [
                {
                    xtype: 'container',
                    cls: 'auth-profile-wrap',
                    height: 50,
                    layout: {
                        type: 'hbox',
                        align: 'center'
                    },
                    items: [
                        {
                            xtype: 'image',
                            height: 30,
                            margin: 10,
                            width: 30,
                            alt: 'lockscreen-image',
                            cls: 'lockscreen-profile-img auth-profile-img',
                            src: 'images/go_locker128.png'
                        },
                        {
                            xtype: 'box',
                            html: '<span class=\'user-name-text\'> '
                            + _('修改密码')
                            + ' </span>'
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
                        margin: '5 0'
                    },

                    items: [
                        {
                            xtype: 'hidden',
                            name: 'sec_user_id',
                            itemId: "userId",
                            value: -1
                        },
                        {
                            xtype: 'textfield',
                            name: 'oldPassword',
                            labelAlign: 'top',
                            cls: 'lock-screen-password-textbox',
                            labelSeparator: '',
                            fieldLabel: _('旧密码'),
                            emptyText: 'Password',
                            inputType: 'password',
                            allowBlank: false,
                            triggers: APP.theme == 'triton' ? { glyphed: { cls: 'trigger-glyph-noop password-trigger' } } : {}
                        },
                        {
                            xtype: 'textfield',
                            name: 'password',
                            labelAlign: 'top',
                            cls: 'lock-screen-password-textbox',
                            labelSeparator: '',
                            fieldLabel: _('新密码'),
                            emptyText: 'Password',
                            inputType: 'password',
                            allowBlank: false,
                            triggers: APP.theme == 'triton' ? { glyphed: { cls: 'trigger-glyph-noop password-trigger' } } : {}
                        },
                        {
                            xtype: "textfield",
                            name: "password_again",
                            labelAlign: "top",
                            cls: 'lock-screen-password-textbox',
                            labelSeparator: '',
                            fieldLabel: _("确认密码"),
                            emptyText: 'ConfirmPassword',
                            inputType: 'password',
                            allowBlank: false,
                            triggers: APP.theme == 'triton' ? { glyphed: { cls: 'trigger-glyph-noop password-trigger' } } : {}
                        },
                        {
                            xtype: 'button',
                            reference: 'loginButton',
                            scale: 'large',
                            ui: 'soft-blue',
                            iconAlign: 'right',
                            iconCls: 'x-fa fa-angle-right',
                            text: _('确认修改'),
                            formBind: true,
                            listeners: {
                                click: 'onResetPasswordButton'
                            }
                        },
                        {
                            xtype: 'component',
                            html: '<div style="text-align:right">' +
                            '<a href="javascript:location.reload();" class="link-forgot-password">' +
                            _('使用其它用户登录')
                            + '</a></div>'
                        }
                    ]
                }
            ]
        }
    ],

    initComponent: function () {
        this.addCls('user-login-register-container');
        this.callParent(arguments);
    }
});
