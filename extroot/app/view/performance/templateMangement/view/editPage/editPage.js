Ext.define('Admin.view.performance.templateMangement.view.editPage.editPage', {
    extend: 'Admin.view.base.CardForm',
    requires: [
        'Admin.view.performance.templateMangement.viewModel.editPage.editPage',
        'Admin.view.performance.templateMangement.model.editPage.editPage',
        'Admin.view.performance.templateMangement.controller.editPage.editPage',
    ],
    xtype: 'editPage',
    viewModel: 'editPage',
    itemId: 'editPage',
    controller: 'editPage',

    // 指定布局
    layout: 'card',

    // 指定panel边缘的阴影效果
    cls: 'shadow',


    fieldDefaults: {
        labelWidth: 140
    },
    items: [{
        xtype: 'fieldset',
        itemId: 'editPageItems',
        title: _('Modify Metric Template'),
        items: [{
                xtype: 'form',
                title: _('Basic information'),
                itemId: 'editPageGrid',
                layout: 'column',
                defaultType: 'textfield',
                items: [{
                        fieldLabel: _('Template name'),
                        margin: 2,
                        columnWidth: 0.34,
                        name: 'metricTmplName'
                    },
                    {
                        margin: 2,
                        columnWidth: 0.34,
                        name: 'tmplId',
                        hidden: true
                    },
                    {
                        xtype: 'displayfield',
                        fieldLabel: _('System defaults'),
                        margin: 2,
                        columnWidth: 0.34,
                        readOnly: true,
                        name: 'isDefault',
                        renderer: function (val) {
                            if (val == 1) return _('yes');
                            else return _('no')
                        }
                    },
                    {
                        margin: 2,
                        columnWidth: 0.68,
                        fieldLabel: _('tmplDesc'),
                        name: 'tmplDesc'
                    }
                ]

            },

            //指标组的树的布局
            {
                xtype: 'container',
                layout: 'column',
                itemId: 'PMTTsymbol',
                height: 400,
                items: [{
                        //查询
                        xtype: 'panel',
                        margin: 2,
                        columnWidth: 0.44,
                        buttonAlign: 'center',
                        height: 430,
                        items: [{
                            xtype: 'userPMLeftTree',
                            itemId: 'PMTTreeLeft',
                            reference: 'leftTree',
                            height: 430,
                            title: _('Metric Group'),
                        }]
                    },
                    {
                        //操作中心
                        xtype: 'panel',
                        title: _('Operation'),
                        margin: 2,
                        height: 430,
                        columnWidth: 0.12,
                        buttonAlign: 'center',
                        items: [{
                            //纵坐标为距父容器上边缘10像素的位置 	
                            margin: '132 25 0 25',
                            xtype: 'button',
                            text: _('>>>>>'),
                            height: 30,
                            width: 100,
                            //iconCls : 'x-fa arrow-right',
                            handler: 'AddTreeNode',
                        }, {
                            //纵坐标为距父容器上边缘10像素的位置
                            margin: '100 0 132 25',
                            xtype: 'button',
                            text: _('<<<<<'),
                            height: 30,
                            width: 100,
                            //iconCls : 'x-fa arrow-left',
                            handler: 'deleteTreeNode',
                        }]
                    },
                    {
                        //东边树的定义
                        xtype: 'userRightTree',
                        itemId: 'PMTTreeright',
                        margin: 2,
                        height: 430,
                        columnWidth: 0.44,
                        title: _('Selected Metric'),

                    }
                ]
            },
        ]
    }],

    buttons: [{
            text: _('Cancel'),
            iconCls: 'x-fa fa-close',
            handler: 'onCancel',
        },
        {
            text: _('Save'),
            iconCls: 'x-fa fa-save',
            handler: 'onSubmit',
        }
    ],
    listeners: {
        beforeshow: 'beforeshow',

    }

});