Ext.define('Admin.view.security.view.user.userGeneric', {
    extend: 'Ext.form.Panel',
    requires: [
        'Admin.view.security.controller.user.userGeneric'
    ],
    controller: 'userGeneric',
    xtype: 'userGeneric',
    itemId: 'user_form_generic',
    layout: 'anchor',
    title: _('conventional'),
    margin: -2,
    frame: true,
    autoScroll: true,
    defaultType: 'textfield',
    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 160,
        msgTarget: 'side'
    },
    defaults: {
        anchor: '100%',
        margin: '6 12 0 12'
    },
    items: [{
        xtype: 'hidden',
        name: 'sec_user_id',
        value: -1,
        listeners: {
            change: 'onChange'
        }
    }, {
        xtype: 'textfield',
        name: 'user_name',
        itemId: 'user_name',
        fieldLabel: _('user name'),
        margin: '20 12 0 12',
        maxLength: 32,
        allowBlank: false
    }, {
        xtype: 'textfield',
        name: 'full_name',
        itemId: 'full_name',
        fieldLabel: _('Full name of user'),
        maxLength: 100
    }, {
        xtype: 'combo',
        name: 'user_type',
        itemId: 'user_type',
        fieldLabel: _('Types of'),
        displayField: 'type',
        valueField: 'id',
        editable: false,
        store: {
            fields: [
                { name: 'type', type: 'string' },
                { name: 'id', type: 'int' }
            ],
            proxy: {
                type: 'ajax',
                url: '/security/add_user/user_type',
                reader: 'json'
            },
            autoLoad: true
        },
        allowBlank: false
    }, {
        xtype: 'textfield',
        name: 'user_desc',
        itemId: 'user_desc',
        fieldLabel: _('Description'),
        maxLength: 200
    }, {
        xtype: 'textfield',
        name: 'user_password',
        itemId: 'user_password',
        inputType: 'password',
        fieldLabel: _('Password'),
        maxLength: 16,
        hidden: false,
        disabled: false,
        allowBlank: false
    }, {
        xtype: 'textfield',
        name: 'password_again',
        itemId: 'password_again',
        inputType: 'password',
        fieldLabel: _('Confirm Password'),
        maxLength: 16,
        hidden: false,
        disabled: false,
        allowBlank: false
    }, {
        xtype: 'checkboxfield',
        name: 'change_password_next_login',
        itemId: 'change_password_next_login',
        boxLabel: _('The user must change the password the next time I log in'),
        hideEmptyLabel: false,
        listeners: {
            change: 'onLoginPwdChange'
        },
        inputValue: 1
    }, {
        xtype: 'textfield',
        name: 'change_password_next_login',
        itemId: 'change_password_next_login_copy',
        value: 0,
        hidden: true
    }, {
        xtype: 'checkboxfield',
        name: 'cannot_change_password',
        itemId: 'cannot_change_password',
        boxLabel: _('The user can not change the password'),
        hideEmptyLabel: false,
        listeners: {
            change: 'onNoChangePwd'
        },
        inputValue: 1
    }, {
        xtype: 'textfield',
        name: 'cannot_change_password',
        itemId: 'cannot_change_password_copy',
        value: 0,
        hidden: true
    }, {
        xtype: 'checkboxfield',
        name: 'closed_temporarily',
        itemId: 'closed_temporarily',
        boxLabel: _('Account suspended'),
        hideEmptyLabel: false,
        uncheckedValue: 0,
        inputValue: 1
    }, {
        xtype: 'fieldcontainer',
        layout: 'hbox',
        items: [{
            xtype: 'numberfield',
            name: 'password_valid_days',
            itemId: 'password_valid_days',
            fieldLabel: _('The maximum number of days the password remains'),
            labelWidth: 162,
            flex: 1,
            maxValue: 180,
            minValue:1,
            value: 0,
            disabled: true,
            allowBlank: false
        }, {
            xtype: 'checkboxfield',
            name: 'password_valid_days_nolimit',
            itemId: 'password_valid_days_nolimit',
            boxLabel: _('not limited'),
            uncheckedValue: 0,
            inputValue: 1,
            checked: true,
            width: 112,
            margin: '0 10 0 15',
            listeners: {
                change: 'onPwdChange'
            }
        }]
    }, {
        xtype: 'fieldset',
        title: _('advanced'),
        margin: 10,
        checkboxToggle: true,//多选框容器
        collapsed: true, //默认折叠起来
        defaultType: 'checkboxfield',
        layout: 'anchor',
        defaults: {
            anchor: '100%',
        },
        items: [{
            xtype: 'fieldcontainer',
            layout: 'hbox',
            hideEmptyLabel: true,
            items: [{
                xtype: 'numberfield',
                name: 'max_online_num',
                itemId: 'max_online_num',
                fieldLabel: _('Maximum number of online'),
                labelWidth: 150,
                maxValue: 255,
                minValue: 1,
                flex: 1,
                value: 0,
                disabled: true,
                allowBlank: false
            }, {
                xtype: 'checkboxfield',
                name: 'max_online_num_nolimit',
                itemId: 'max_online_num_nolimit',
                boxLabel: _('not limited'),
                uncheckedValue: 0,
                inputValue: 1,
                checked: true,
                width: 100,
                margin: '0 10 0 15',
                listeners: {
                    change: 'onOnlineChange'
                }
            }]
        },
        // {
        //     xtype: 'fieldcontainer',
        //     layout: 'hbox',
        //     hideEmptyLabel: true,
        //     items: [{
        //         xtype: 'numberfield',
        //         name: 'auto_exit_wait_time',
        //         itemId: 'auto_exit_wait_time',
        //         fieldLabel: _('Automatic exit waiting time (minutes)'),
        //         labelWidth: 150,
        //         flex: 1,
        //         value: 0,
        //         disabled: true,
        //         allowBlank: false
        //     },
        //     {
        //         xtype: 'checkboxfield',
        //         name: 'auto_exit_wait_time_nolimit',
        //         itemId: 'auto_exit_wait_time_nolimit',
        //         boxLabel: _('Disable automatic exit'),
        //         uncheckedValue: 0,
        //         inputValue: 1,
        //         checked: true,
        //         width: 100,
        //         margin: '0 10 0 15',
        //         listeners: {
        //             change: 'onExitChange'
        //         }
        //     }]
        // },
        {
            xtype: 'checkboxfield',
            boxLabel: _('Start time limit'),
            name: 'time_period_flag',
            itemId: 'time_period_flag',
            uncheckedValue: 0,
            inputValue: 1,
            hideEmptyLabel: true,
            listeners: {
                change: 'onPeriodChange'
            }
        }, {
            xtype: 'fieldcontainer',
            name: 'time_period_falg_fields',
            itemId: 'time_period_falg_fields',
            hidden: true,
            disabled: true,
            layout: 'anchor',
            hideEmptyLabel: true,
            defaults: {
                anchor: '100%',
                hideEmptyLabel: true
            },
            items: [{
                xtype: 'fieldcontainer',
                layout: {
                    type: 'hbox',
                    anchor: "100%"
                },
                items: [{
                    xtype: 'datefield',
                    name: 'begin_date',
                    itemId: 'begin_date',
                    labelWidth: 150,
                    flex: 1,
                    format: 'Y-m-d',
                    fieldLabel: _('start date'),
                    editable: false,
                    allowBlank: false
                }, {
                    xtype: 'datefield',
                    name: 'end_date',
                    itemId: 'end_date',
                    labelWidth: 150,
                    flex: 1,
                    format: 'Y-m-d',
                    fieldLabel: _('End date'),
                    editable: false,
                    allowBlank: false
                }]
            }, {
                xtype: 'fieldcontainer',
                layout: {
                    type: 'hbox',
                    anchor: "100%"
                },
                items: [{
                    xtype: 'timefield',
                    name: 'begin_time_per_day',
                    itemId: 'begin_time_per_day',
                    labelWidth: 150,
                    flex: 1,
                    fieldLabel: _('Daily start time'),
                    editable: false,
                    format: 'H:i:s',
                    allowBlank: false
                }, {
                    xtype: 'timefield',
                    name: 'end_time_per_day',
                    itemId: 'end_time_per_day',
                    labelWidth: 150,
                    flex: 1,
                    fieldLabel: _('Daily end time'),
                    editable: false,
                    format: 'H:i:s',
                    allowBlank: false
                }]
            }, {
                xtype: 'fieldcontainer',
                defaultType: 'checkboxfield',
                layout: 'hbox',
                margin: 15,
                defaults: {
                    hideEmptyLabel: true
                },
                items: [{
                    name: 'monday',
                    itemId: 'monday',
                    boxLabel: _('Monday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }, {
                    name: 'tuesday',
                    itemId: 'tuesday',
                    boxLabel: _('Tuesday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }, {
                    name: 'wednesday',
                    itemId: 'wednesday',
                    boxLabel: _('Wednesday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }, {
                    name: 'thursday',
                    itemId: 'thursday',
                    boxLabel: _('Thursday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }, {
                    name: 'friday',
                    itemId: 'friday',
                    boxLabel: _('Friday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }, {
                    name: 'saturday',
                    itemId: 'saturday',
                    boxLabel: _('Saturday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }, {
                    name: 'sunday',
                    itemId: 'sunday',
                    boxLabel: _('Sunday'),
                    checked: true,
                    flex: 1,
                    uncheckedValue: 0,
                    inputValue: 1
                }]
            }]
        }]
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userGenericToolbar',
        hidden: true,
        defaults: {
            minWidth: 60,
            margin: 3
        },
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Apply'), iconCls: 'x-fa fa-save', handler: 'onApply' }
        ]
    }]
});