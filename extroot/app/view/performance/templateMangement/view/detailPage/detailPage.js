Ext.define('Admin.view.performance.templateMangement.view.detailPage.detailPage', {
    extend: 'Admin.view.base.CardForm',
    requires: [
        'Admin.view.performance.templateMangement.viewModel.detailPage.detailPage',
        'Admin.view.performance.templateMangement.model.detailPage.detailPage',
        'Admin.view.performance.templateMangement.controller.detailPage.detailPage'
    ],
    xtype: 'detailPage',
    viewModel: 'detailPage',
    itemId: 'detailPage',
    controller: 'detailPage',

    // 指定布局
    layout: 'card',

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    title: _('templateDetailsQuery'),
    fieldDefaults: {
        labelWidth: 140
    },
    items: [{
        xtype: 'fieldset',
        items: [{
                xtype: 'form',
                title: _('Basic information'),
                itemId: 'editPageGrid',
                layout: 'column',
                defaultType: 'textfield',
                items: [{
                        xtype: 'displayfield',
                        fieldLabel: _('Template name'),
                        margin: 2,
                        columnWidth: 0.44,
                        readOnly: true,
                        name: 'metricTmplName'
                    },
                    {
                        xtype: 'displayfield',
                        fieldLabel: _('System defaults'),
                        margin: 2,
                        columnWidth: 0.44,
                        readOnly: true,
                        name: 'isDefault',
                        renderer: function (val) {
                            if (val == 1) return _('yes');
                            else return _('no')
                        }
                    },
                    {
                        xtype: 'displayfield',
                        columnWidth: 0.44,
                        margin: 2,
                        readOnly: true,
                        fieldLabel: _('tmplDesc'),
                        name: 'tmplDesc'
                    }
                ]

            },

            //指标组的树的布局
            {
                xtype: 'container',
                layout: 'border',
                itemId: 'PMTTsymbol',
                height: 400,
                items: [{
                    //东边树的定义
                    xtype: 'userRightTree',
                    itemId: 'PMTTreeright',
                    title: _('Selected Metric'),
                    reference: 'PMTTreeright',
                    region: 'center',


                }]
            },
        ]
    }],

    buttons: [

        {
            text: _('Close'),
            iconCls: 'x-fa fa-close',
            handler: 'onCancel',
        },
    ]


});