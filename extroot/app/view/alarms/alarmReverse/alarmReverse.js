Ext.define('Admin.view.alarms.alarmReverse.alarmReverse', {
    extend: 'Ext.container.Container',
    xtype: 'alarmReverse',
    layout: 'fit',

    items: [
        {
            xtype: 'tabpanel',
            items: [
            {
                title: _('Return Configuration'),
                xtype: 'AlarmReSet'
            }, 
            {
                title: _('Return Pattern'),
                xtype: 'AlarmRePattern'
            }
            ]            
        }
    ]
});
