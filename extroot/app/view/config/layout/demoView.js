Ext.define('Admin.view.config.layout.demoView', {
    extend: 'Ext.container.Container',
    xtype: 'layoutdemoview',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
    ],

    layout: 'responsivecolumn',
    
   defaults: {
        xtype: 'panel',
        // flex: 1,
        height: 150,
        width: 300,

        layout: 'fit',
        html: 'ssss',

        bodyPadding: 10,
        style: {
            'margin-bottom': '20px'
        },

        // responsiveCls: 'big-50 small-100'
        // defaults: {
        //     anchor: '100%'
        // }
    },

    items: [
        {
            // 60% width when viewport is big enough,
            // 100% when viewport is small
            title: 'audio demo',
            userCls: 'big-60 small-100 shadow',
            // xtype: 'audio',
            // url: 'audio/Kalimba.mp3'            
            // html: '<video controls autoplay name="media"> <source src="audio/Kalimba.mp3" type="audio/mpeg"></video>'
        },
        {
            title: 'a1',
            userCls: 'big-20 small-50 shadow'
        },
        {
            title: 'a1',
            userCls: 'big-20 small-50 shadow'
        },
        {
            title: 'a1',
            userCls: 'big-20 small-50 shadow'
        },
        // {
        //     userCls: 'big-20 small-50'
        // },
        // {
        //     cls: 'weather-panel shadow',
        //     userCls: 'big-40 small-100'
        // },
        // {
        //     userCls: 'big-60 small-100'
        // },
        // {
        //     userCls: 'big-40 small-100'
        // }
    ]
});
