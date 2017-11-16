Ext.define('Admin.view.performance.templateMangement.PTMMainView', {
    extend: 'Ext.container.Container',
    xtype: 'PTMMainView',

    requires: [
        'Admin.view.performance.templateMangement.PMTMainPage',
        'Admin.view.performance.templateMangement.PMTAddPage',
        'Admin.view.performance.templateMangement.view.userLeftTree.userPMLeftTree',
        'Admin.view.performance.templateMangement.view.userRightTree.userRightTree',
        'Admin.view.performance.templateMangement.view.editPage.editPage',
        'Admin.view.performance.templateMangement.view.detailPage.detailPage',
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
                xtype: 'PMTMainPage',
                region: 'center',
                title: _('Performance Metric Template Management'),
                iconCls: 'x-fa fa-circle-o',
            }]
        },

        {
            xtype: 'PMTAddPage',
        },
        {
            xtype: 'userPMLeftTree',
        },
        {
            xtype: 'userRightTree',
        },
        {
            xtype: 'editPage',
        },
        {
            xtype: 'detailPage',
        },


    ]

});