Ext.define('Admin.view.performance.thresholdTemplateMangement.TTMMainView', {
    extend: 'Ext.container.Container',
    xtype: 'TTMMainView',

    requires: [
        'Admin.view.performance.thresholdTemplateMangement.TTMMainPage',
        'Admin.view.performance.thresholdTemplateMangement.view.TTMAddPage.TTMAddPage',
        'Admin.view.performance.thresholdTemplateMangement.view.TTMEditPage.TTMEditPage',
        'Admin.view.performance.thresholdTemplateMangement.view.TTMDetailPage.TTMDetailPage',

    ],

    // 指定布局
    layout: 'card',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    items: [{
            xtype: 'container',
            layout: 'border',
            height: 400,
            items: [{
                xtype: 'TTMMainPage',
                region: 'center',
                title: _('Threshold Template Management'),
                iconCls: 'x-fa fa-circle-o',
            }]
        },

        {
            xtype: 'TTMAddPage',
        },
        {
            xtype: 'TTMEditPage',
        },
        {
            xtype: 'TTMDetailPage',
        },



    ]

});