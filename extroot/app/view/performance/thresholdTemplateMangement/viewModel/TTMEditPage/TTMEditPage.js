Ext.define('Admin.view.performance.thresholdTemplateMangement.viewModel.TTMEditPage.TTMEditPage', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TTMEditPage',
    stores: {

        //主页初始化加载数据
        thresholdSymbol: {
            autoLoad: true,

            // 每页显示记录数
            groupField: 'metricGroupName',
            //fields: ['metricGroupName','metricName','highThreshold','lowThreshold','deadZone'],
            proxy: {
                type: 'ajax',
                url: '/pmManagement/api/pmmng/metricTmpl/queryThresholdMetricInfo',
                reader: {
                    type: 'json',
                    rootProperty: 'result'
                }
            }

        },
        thresholdDefineStore: {
            autoLoad: true,

            // 每页显示记录数
            proxy: {
                type: 'ajax',
                url: '/pmManagement/api/pmmng/thresholdTmpl/queryThresholdDefine',
                reader: {
                    type: 'json',
                    rootProperty: 'rows'
                }
            }

        },
        allTemplate: {
            autoLoad: true,

            // 每页显示记录数
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