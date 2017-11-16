Ext.define('widget.table2View', {
    extend: 'Ext.tab.Panel',
    
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
});
