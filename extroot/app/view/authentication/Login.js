Ext.define('Admin.view.authentication.Login', {
    extend: 'Admin.view.authentication.LockingWindow',
    xtype: 'login',

    requires: [
        'Admin.view.authentication.Dialog',
        'Ext.container.Container',
        'Ext.form.field.Text',
        'Ext.form.field.Checkbox',
        'Ext.button.Button'
    ],

    title: _('Login'),
    defaultFocus: 'authdialog', // Focus the Auth Form to force field focus as well

    items: [
        {
            xtype: 'authdialog',
            defaultButton : 'loginButton',
            autoComplete: true,
            bodyPadding: '20 20',
            cls: 'auth-dialog-login',
            header: false,
            width: 415,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },

            defaults : {
                margin : '5 0'
            },

            items: [
                {
                    xtype: 'panel',
                    height: 62,
                    // bodyStyle:'background:#87CEEB;',
                    bodyStyle:'background:#FFA500;',
                    border: false,
                    bodyPadding:'17 0 0 18',
                    items: {
                        xtype: 'component',
                        html: "<img src='/images/banner_logo.png'>"+ " "+APP.app_name+" v" + APP.version
                    }
                },

                {
                    xtype: 'label',
                    text: _('User Name')
                },
                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    name: 'user',
                    height: 55,
                    hideLabel: true,
                    allowBlank : false,
                    emptyText: 'user id',
                    triggers:  APP.theme=='triton' ?  {glyphed:{cls: 'trigger-glyph-noop auth-email-trigger'}} : {}
                    // triggers: {
                    //     glyphed: {
                    //         cls: 'trigger-glyph-noop auth-email-trigger'
                    //     }
                    // }
                },
                {
                    xtype: 'label',
                    text: _('Password')
                },

                {
                    xtype: 'textfield',
                    cls: 'auth-textbox',
                    height: 55,
                    hideLabel: true,
                    emptyText: 'Password',
                    inputType: 'password',
                    name: 'password',
                    allowBlank : false,
                    triggers:  APP.theme=='triton' ?  {glyphed:{cls: 'trigger-glyph-noop auth-password-trigger'}} : {}
                    // triggers: {
                    //     glyphed: {
                    //         cls: 'trigger-glyph-noop auth-password-trigger'
                    //     }
                    // }
                },
                // {
                //     xtype: 'container',
                //     layout: 'hbox',
                //     items: [
                //         {
                //             xtype: 'checkboxfield',
                //             flex : 1,
                //             cls: 'form-panel-font-color rememberMeCheckbox',
                //             height: 30,
                //             bind: '{persist}',
                //             boxLabel: 'Remember me'
                //         },
                //         {
                //             xtype: 'box',
                //             html: '<a href="#passwordreset" class="link-forgot-password"> Forgot Password ?</a>'
                //         }
                //     ]
                // },
                {
                    xtype: 'box',
                    margin: '10 0'
                },                
                {
                    xtype: 'button',
                    reference: 'loginButton',
                    scale: 'large',
                    ui: 'soft-green',
                    iconAlign: 'right',
                    iconCls: 'x-fa fa-angle-right',
                    text: _('Login'),
                    formBind: true,
                    listeners: {
                        click: 'onLoginButton'
                    }
                },
                // {
                //     xtype: 'box',
                //     html: '<div class="outer-div"><div class="seperator">'+_('OR')+'</div></div>',
                //     margin: '10 0'
                // },
                // {
                //     xtype: 'button',
                //     scale: 'large',
                //     ui: 'facebook',
                //     iconAlign: 'right',
                //     iconCls: 'x-fa fa-weibo',
                //     text: '使用新浪微博账号登陆',
                //     listeners: {
                //         click: 'onSinaWeiboLogin'
                //     }
                // },
            ]
        }
    ],

    initComponent: function() {
        this.addCls('user-login-register-container');
        this.callParent(arguments);
    }
});
