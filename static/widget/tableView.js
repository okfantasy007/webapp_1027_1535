Ext.define('widget.tableView', {
    extend: 'Ext.container.Container',
    
    layout: 'fit',

    items: [
        {
            xtype: 'tabpanel',
            title: 'Hello tab panel',
            items: [
                {
                    xtype: 'panel',
                    title: 'tab1',
                    html: 'tab1'
                },
                {
                    xtype: 'panel',
                    title: 'tab2',
                    html: 'tab2'
                },
                {
                    xtype: 'panel',
                    title: 'tab3',
                    html: 'tab3'
                }
            ]
        }
    ]
});
