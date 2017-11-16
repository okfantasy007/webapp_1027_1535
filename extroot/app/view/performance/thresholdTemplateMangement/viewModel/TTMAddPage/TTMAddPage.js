Ext.define('Admin.view.performance.thresholdTemplateMangement.viewModel.TTMAddPage.TTMAddPage', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TTMAddPage',
    stores: {

        //主页初始化加载数据
        templateInit: {
            autoLoad: true,

            // 每页显示记录数
            pageSize: 10000,

            model: 'Admin.view.performance.thresholdTemplateMangement.model.TTMAddPage.TTMAddPage',


        },
        thresholdSymbol: {
            autoLoad: true,

            // 每页显示记录数
            groupField: 'metricGroupName',

            proxy: {
                type: 'ajax',
                url: '/pmManagement/api/pmmng/metricTmpl/queryThresholdMetricInfo',
                reader: {
                    type: 'json',
                    rootProperty: 'result'
                }
            }

        },

        allTemplate: {
            autoLoad: true,

            // 每页显示记录数
            pageSize: 5000,
            proxy: {
                type: 'ajax',
                url: '/pmManagement/api/pmmng/metricTmpl/queryMetricTmpl',
                reader: {
                    type: 'json',
                    rootProperty: 'rows'
                }
            }

        },
    }
});