Ext.define('Admin.view.main.RightContainer', {
    extend: 'Ext.Container',
    xtype: 'rightContainer',

    flex: 1,
    margin: 12,
    reference: 'mainCardPanel',
    layout: {
        type: 'card',
        anchor: '100%'
    }
})