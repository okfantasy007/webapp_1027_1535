Ext.define('Admin.view.performance.thresholdTemplateMangement.view.TTMDetailPage.TTMDetailPage', {
    extend: 'Admin.view.base.CardForm',
    requires: [
        'Ext.grid.filters.Filters',
        'Admin.view.performance.thresholdTemplateMangement.controller.TTMDetailPage.TTMDetailPage',
        'Admin.view.performance.thresholdTemplateMangement.model.TTMDetailPage.TTMDetailPage',
        'Admin.view.performance.thresholdTemplateMangement.viewModel.TTMDetailPage.TTMDetailPage',
    ],
    xtype: 'TTMDetailPage',
    viewModel: 'TTMDetailPage',
    itemId: 'TTMDetailPage',
    controller: 'TTMDetailPage',

    // 指定布局
    layout: 'card',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    // margin: 10,
    fieldDefaults: {
        labelWidth: 140
    },
    items: [{
        xtype: 'form',
        itemId: 'detailPageGrid',
        title: _('templateDetailsQuery'),
        margin: 10,
        items: [{
                xtype: 'form',
                itemId: 'basicInfoGrid',
                layout: 'column',
                margin: 1,
                title: _('Basic information'),
                defaultType: 'textfield',
                items: [{
                        name: 'tcaTmplId',
                        hidden: true,
                    },
                    {
                        name: 'metricTmplId',
                        hidden: true,
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: _('Template name'),
                        margin: 10,
                        columnWidth: 0.35,
                        name: 'tcaTmplName'
                    },
                    {
                        xtype: 'textfield',
                        margin: 10,
                        columnWidth: 0.65,
                        fieldLabel: _('tmplDesc'),
                        name: 'tmplDesc'
                    },
                    {
                        xtype: 'textfield',
                        margin: 10,
                        columnWidth: 0.35,
                        fieldLabel: _('Affiliated Group'),
                        readOnly: true,
                        name: 'templateGroupName'
                    },
                    {
                        xtype: 'displayfield',
                        margin: 10,
                        columnWidth: 0.15,
                        fieldLabel: _('System defaults'),
                        value: _('no'),
                        readOnly: true,
                        name: 'templateGroupName'
                    },

                ]

            },

            //所属指标组的信息
            {
                xtype: 'panel',
                layout: 'border',
                itemId: 'templateInfo',
                margin: 1,
                height: 480,
                items: [

                    {
                        xtype: 'grid',
                        region: 'center',
                        margin: 0,
                        width: 600,
                        itemId: 'thresholdSymbol',
                        title: _('Metric threshold information'),
                        requires: ['Ext.grid.feature.Grouping'],
                        features: [{
                            ftype: 'grouping',
                            groupHeaderTpl: '{[values.children[0].data["metricGroupName"]]}',
                            collapsible: true,
                            expandTip: '',
                            collapseTip: ''
                        }],
                        columns: [{
                                text: _('Metric group name'),
                                dataIndex: 'metricGroupName',
                                hidden: true,
                                headerCheckbox: true,
                                width: 180
                            },
                            {
                                text: _('Template name'),
                                dataIndex: 'metricName',
                                headerCheckbox: false,
                                width: 180
                            },
                            {
                                dataIndex: 'metricId',
                                hidden: true,
                            },
                            {
                                text: _('H_urgent'),
                                dataIndex: 'high1Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('H_severe'),
                                dataIndex: 'high2Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('H_general'),
                                dataIndex: 'high3Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('H_prompt'),
                                dataIndex: 'high4Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('L_prompt'),
                                dataIndex: 'low4Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('L_general'),
                                dataIndex: 'low3Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('L_severe'),
                                dataIndex: 'low2Threshold',
                                width: 180,
                                flex: 1
                            },
                            {
                                text: _('L_urgent'),
                                dataIndex: 'low1Threshold',
                                width: 180,
                                flex: 1
                            },

                        ],
                        bind: {
                            store: '{thresholdSymbol}',
                        },
                    },


                ]
            },
        ]
    }],

    buttons: [{
        text: _('Cancel'),
        iconCls: 'x-fa fa-close',
        handler: 'onCancel',
    }, ],

    listeners: {
        beforeshow: 'beforeshow',

    }

});