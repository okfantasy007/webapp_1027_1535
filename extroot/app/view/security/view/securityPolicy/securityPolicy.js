Ext.define('Admin.view.security.view.securityPolicy.securityPolicy', {
    extend: 'Ext.tab.Panel',
    xtype: 'securityPolicy',
    // title: _('Set up security policies'),
    // iconCls: 'x-fa fa-shield',
    // frame: true,
    tabBar: {
        //plain: true,
        layout: {
            pack: 'left'
        },
        items: [{
            xtype: 'component', flex: 1
        }, {
            xtype: "tool",
            type: 'refresh',
            tooltip: _('Refresh'),
            handler: 'onRefresh',
            margin: "5 5 0 0"
        }]
    },

    items: [{
        xtype: 'panel',
        // iconCls: 'x-fa fa-key',
        title: _('Set the password policy'),
        layout: 'fit',
        width: 520,
        height: 475,
        bodyPadding: 3,
        items: [{
            xtype: 'form',
            itemId: 'pwdForm',
            layout: 'anchor',
            // frame: true,
            bodyPadding: 10,
            defaultType: 'textfield',
            scrollable: "y",//自动滚动条
            fieldDefaults: {
                labelAlign: 'right',
                labelWidth: 260,
                msgTarget: 'side',
                labelPad: 20
            },
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'numberfield',
                name: 'user_pwd_minilength',
                itemId: 'user_pwd_minilength',
                fieldLabel: _('Normal user password minimum length value'),
                maxValue: 16,
                minValue: 6,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 6 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'admin_pwd_minilength',
                itemId: 'admin_pwd_minilength',
                fieldLabel: _('Super user password length value'),
                maxValue: 16,
                minValue: 6,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 6 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_maxlength',
                itemId: 'pwd_maxlength',
                fieldLabel: _('Password length maximum'),
                maxValue: 16,
                minValue: 6,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 6 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_short_save_days',
                itemId: 'pwd_short_save_days',
                fieldLabel: _('The minimum number of days to keep the password'),
                maxValue: 999,
                minValue: 0,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 0 and 999") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_letter_minimum_num',
                itemId: 'pwd_letter_minimum_num',
                fieldLabel: _('The minimum number of letters in the password'),
                maxValue: 16,
                minValue: 0,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 0 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_uppercase_minimum_num',
                itemId: 'pwd_uppercase_minimum_num',
                fieldLabel: _('The minimum number of uppercase letters in the password'),
                maxValue: 16,
                minValue: 0,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 0 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_lowercase_minimum_num',
                itemId: 'pwd_lowercase_minimum_num',
                fieldLabel: _('The minimum number of lowercase letters in the password'),
                maxValue: 16,
                minValue: 0,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 0 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_number_minimum_num',
                itemId: 'pwd_number_minimum_num',
                fieldLabel: _('The minimum number of digits in the password'),
                maxValue: 16,
                minValue: 0,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 0 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_special_char_minimum_num',
                itemId: 'pwd_special_char_minimum_num',
                fieldLabel: _('The minimum number of special characters in the password'),
                maxValue: 16,
                minValue: 0,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 0 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'combo',
                name: 'max_name_pwd_same_num',
                itemId: 'max_name_pwd_same_num',
                fieldLabel: _('The maximum number of consecutive characters allowed for the user name and password is the same'),
                allowBlank: false,
                editable: false,
                displayField: 'name',
                valueField: 'val',
                queryModel: 'local',
                store: {
                    xtype: 'store',
                    fields: ['name', 'val'],
                    data: [
                        { name: _('No request'), val: 0 },
                        { name: _('Can not contain full username'), val: 1 },
                        { name: _('Can not contain the number of consecutive characters in the user name'), val: 2 }
                    ]
                },
                listeners: {
                    change: 'maxNamePwdSameNum'
                }
            }, {
                xtype: 'numberfield',
                name: 'no_name_char_num',
                itemId: 'no_name_char_num',
                fieldLabel: _('You can not include the number of consecutive characters in the user name'),
                maxValue: 16,
                minValue: 1,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 1 and 16") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false,
                hidden: true
            },
            // {
            //     xtype: 'checkboxfield',
            //     name: 'pwd_no_workbook',
            //     itemId: 'pwd_no_workbook',
            //     fieldLabel: _('The password can not contain the vocabulary in the full password dictionary'),
            //     uncheckedValue: 0,
            //     inputValue: 1
            // },
            {
                xtype: 'checkboxfield',
                name: 'pwd_no_name_reverse',
                itemId: 'pwd_no_name_reverse',
                fieldLabel: _('The password can not be the reverse order of the user name'),
                uncheckedValue: 0,
                inputValue: 1
            }, {
                xtype: 'checkboxfield',
                name: 'pwd_no_four_series',
                itemId: 'pwd_no_four_series',
                fieldLabel: _('There can be no 4 or more consecutive characters in the password'),
                uncheckedValue: 0,
                inputValue: 1
            }, {
                xtype: 'checkboxfield',
                name: 'pwd_no_increase_degressive',
                itemId: 'pwd_no_increase_degressive',
                fieldLabel: _('The password can not be an incremental descending sequence of numbers or letters'),
                uncheckedValue: 0,
                inputValue: 1
            }, {
                xtype: 'checkboxfield',
                name: 'new_old_pwd_diffethree_time',
                itemId: 'new_old_pwd_diffethree_time',
                fieldLabel: _('The new password can not be the same as the old password that was last set three times'),
                uncheckedValue: 0,
                inputValue: 1
            }],
            buttons: [{
                text: _('Reset'),
                iconCls: 'x-fa fa-rotate-left',
                handler: 'onPwdReset'
            }, {
                text: _('Save'),
                iconCls: 'x-fa fa-save',
                handler: 'onSave'
            }]
        }]
    }, {
        xtype: 'panel',
        title: _('Set up account policy'),
        // iconCls: 'x-fa fa-user',
        layout: 'fit',
        width: 520,
        height: 475,
        bodyPadding: 3,
        items: [{
            xtype: 'form',
            itemId: 'accForm',
            layout: 'anchor',
            // frame: true,
            bodyPadding: 10,
            defaultType: 'textfield',
            // autoScroll: true,//自动滚动条
            fieldDefaults: {
                labelAlign: 'right',
                labelWidth: 260,
                msgTarget: 'side',
                labelPad: 20
            },
            defaults: {
                anchor: '100%'
            },
            items: [{
                xtype: 'numberfield',
                name: 'name_minilength',
                itemId: 'name_minilength',
                fieldLabel: _('The minimum length of the user name'),
                maxValue: 32,
                minValue: 1,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 1 and 32") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'checkboxfield',
                name: 'forever_lock',
                itemId: 'forever_lock',
                fieldLabel: _('Permanent lock'),
                uncheckedValue: 0,
                inputValue: 1,
                listeners: {
                    change: 'foreverLock'
                }
            }, {
                xtype: 'numberfield',
                name: 'auto_unlock_time',
                itemId: 'auto_unlock_time',
                fieldLabel: _('Auto unlock time (minutes)'),
                maxValue: 1440,
                minValue: 1,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 1 and 1440") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'error_pwd_num_lock',
                itemId: 'error_pwd_num_lock',
                fieldLabel: _('The user enters the wrong password several times after the automatic lock'),
                maxValue: 99,
                minValue: 1,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 1 and 99") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'numberfield',
                name: 'pwd_expire_clew_days',
                itemId: 'pwd_expire_clew_days',
                fieldLabel: _('Password expiration warning days'),
                maxValue: 30,
                minValue: 1,
                htmlActiveErrorsTpl: [
                    '<ul class="{listCls}">',
                    '<li>' + _("Please enter an integer between 1 and 30") + '</li>',
                    '</ul>'
                ],
                allowDecimals: false,//小数点
                allowNegative: false,//负数
                allowBlank: false
            }, {
                xtype: 'checkboxfield',
                name: 'admin_no_lock',
                itemId: 'admin_no_lock',
                fieldLabel: _('Super users are never locked'),
                uncheckedValue: 0,
                inputValue: 1
            }],
            buttons: [{
                text: _('Reset'),
                iconCls: 'x-fa fa-rotate-left',
                handler: 'onAccReset'
            }, {
                text: _('Save'),
                iconCls: 'x-fa fa-save',
                handler: 'onSave'
            }]
        }]
    }]
});