Ext.define('Admin.view.main.Main', {
    extend: 'Ext.container.Viewport',

    controller: 'main',
    viewModel: 'main',

    requires: [
        'Admin.view.main.Header',
        'Admin.view.main.MainController',
        'Admin.view.main.MainModel',
        'Admin.view.main.mainAlarmContainer',
    ],

    listeners: {
        render: 'onMainViewRender'
    },

    layout: 'border',
    items: [
        {
            xtype: 'mainHeader',
            region: 'north',
            reference: 'mainHeader',
        },

        {
            xtype: 'container',
            region: 'center',
            layout: 'border',
            items:[
            {
                xtype: 'container',
                region: 'north',
                scrollable: true,
                reference: 'mainPopAlarmPanel',
                maxHeight: 314,
            },

            {
                xtype: 'container',
                region: 'center',
                layout: 'border',
                items: [
                    // 顶部阴影特效
                    {
                        region: 'north',
                        xtype: 'container',
                        cls: 'shadow',
                        height: 2,
                        margin: '-2 0 0 0',
                    },
                    // 左侧阴影特效
                    {
                        region: 'west',
                        xtype: 'container',
                        cls: 'shadow',
                        width: 2,
                        margin: '0 0 0 -2',
                    },
                    {
                        xtype: 'container',
                        region: 'center',
                        scrollable: 'y',
                        reference: 'mainCardPanel',
                        layout: {
                            type: 'card',
                            anchor: '100%'
                        }
                    }
                ]
            },

            // {
            //     xtype: 'container',
            //     region: 'center',
            //     reference: 'mainCardPanel',
            //     layout: {
            //         type: 'card',
            //         anchor: '100%'
            //     }
            // }

            ]
        }
    ]
});
