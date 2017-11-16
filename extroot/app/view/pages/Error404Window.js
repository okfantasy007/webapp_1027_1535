Ext.define('Admin.view.pages.Error404Window', {
    extend: 'Ext.container.Container',
    xtype: 'page404',

    requires: [
        'Ext.container.Container'
    ],

    anchor : '100% -1',

    layout:{
        type:'vbox',
        pack:'center',
        align:'center'
    },

    items: [
        {
            xtype: 'box',
            cls: 'blank-page-container',
            html: '<div class=\'fa-outer-class\'><span class=\'x-fa fa-clock-o\'></span></div><h1>404!</h1><span class=\'blank-page-text\'>Stay tuned for updates</span>'
        }
    ]
});

