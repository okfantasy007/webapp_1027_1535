Ext.define('Admin.view.main.RightContainerTitled', {
    extend: 'Ext.Container',
    xtype: 'rightContainerTitled',

    requires: [
        'Admin.view.main.titleContainer'
    ],

    flex: 1,
    items: [
        {
            xtype: 'titleContainer',
        },
        {
            xtype: 'rightContainer'
        }
    ]
})