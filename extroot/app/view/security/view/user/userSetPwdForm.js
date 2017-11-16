Ext.define('Admin.view.security.view.user.userSetPwdForm', {
    extend: 'Ext.form.Panel',
    requires: 'Admin.view.security.controller.user.userSetPwdForm',
    controller: 'userSetPwdForm',
    xtype: 'userSetPwdForm',
    frame: true,
    margin: -2,
    autoScroll: true,
    defaultType: 'textfield',
    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 70,
        msgTarget: 'side'
    },
    layout: 'anchor',
    defaults: {
        anchor: '100%',
        margin: '6 12 0 12'
    },
    items: [{
        xtype: 'hidden',
        name: 'sec_user_id'
    }, {
        xtype: 'textfield',
        name: 'user_name',
        itemId: 'user_name',
        fieldLabel: _('user name'),
        maxLength: 32,
        disabled: true,
        allowBlank: false
    }, {
        xtype: 'textfield',
        name: 'password',
        itemId: 'password',
        inputType: 'password',
        fieldLabel: _('password'),
        maxLength: 16,
        allowBlank: false
    }, {
        xtype: 'textfield',
        name: 'password_again',
        itemId: 'password_word',
        inputType: 'password',
        fieldLabel: _('confirm password'),
        maxLength: 16,
        allowBlank: false
    }, {
        xtype: 'checkboxfield',
        itemId: 'changPwd',
        boxLabel: _('The user must change the password the next time he or she logs in'),
        hideEmptyLabel: false,//改变布局设置false前面会有空间和上边的控件对齐
        name: 'change_password_next_login',
        inputValue: 1,
        uncheckedValue: 0
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
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: _('Cancel'), iconCls: 'x-fa fa-close', handler: 'onCancel' },
            { xtype: 'button', text: _('Save'), iconCls: 'x-fa fa-save', handler: 'onOk' }
        ]
    }]
});