Ext.define('Admin.view.test.widgetView', {
    extend: 'Admin.view.main.MainContainerWrap',
    xtype: 'widgetView',
    
    controller: 'widgetView',

    // items: [
    // {
    //     xtype: 'treepanel',
    //     width: APP.leftMenuWidth,
    //     cls: 'shadow',
    //     rootVisible: false,
    //     reference: 'navigationTreeList',
    //     itemId: 'navigationTreeList',
    //     margin: '-1 0 0 0',
    //     store: {
    //         fields: [{
    //             name: 'text'
    //         }],
    //         autoLoad: true,
    //         proxy: {
    //             type: 'ajax',
    //             url: '/widgets',
    //             reader: {
    //                 type: 'json'
    //             }
    //         }
    //     },
    //     listeners: {
    //         selectionchange: 'onTreePanelSelectionChange'
    //     }        
    // },
    // {
    //     xtype: 'rightContainer',
    // }]    

    items: [{
        xtype: 'leftMenutree',
        menuUrl: '/widgets'
    },
    {
        xtype: 'rightContainer'
    }]
});
