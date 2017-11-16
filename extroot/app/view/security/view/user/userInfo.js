Ext.define('Admin.view.security.view.user.userInfo', {
    extend: 'Ext.form.Panel',
    requires: 'Admin.view.security.controller.user.userInfo',
    controller: 'userInfo',
    xtype: 'userInfo',
    layout: 'anchor',
    title: _('details'),
    itemId: 'user_form_detail',
    frame: true,
    margin: -2,
    autoScroll: true,
    defaultType: 'textfield',
    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 100,
        msgTarget: 'side'
    },
    defaults: {
        anchor: '100%',
        margin: '6 12 0 12'
    },
    items: [{
        xtype: 'hidden',
        name: 'sec_user_id',
        value: -1
    }, {
        xtype: 'textfield',
        name: 'dept',
        itemId: 'dept',
        maxLength: 32,
        margin: '20 12 0 12',
        fieldLabel: _('department'),
    }, {
        xtype: 'textfield',
        name: 'tel',
        itemId: 'tel',
        fieldLabel: _('phone'),
        maxLength: 16
    }, {
        xtype: 'textfield',
        name: 'fax',
        itemId: 'fax',
        fieldLabel: _('fax'),
        maxLength: 16
    }, {
        xtype: 'textfield',
        name: 'e_mail',
        itemId: 'e_mail',
        vtype: 'email',
        fieldLabel: 'EMail'
    }, {
        xtype: 'textfield',
        name: 'mailcode',
        itemId: 'mailcode',
        fieldLabel: _('Zip code'),
        maxLength: 20
    }, {
        xtype: 'textfield',
        name: 'address',
        itemId: 'address',
        fieldLabel: _('address')
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'userInfoToolbar',
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