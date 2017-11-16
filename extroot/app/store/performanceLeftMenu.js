Ext.define('Admin.store.performanceLeftMenu', {
    extend: 'Admin.store.baseMenuStore',
    storeId: 'performanceLeftMenu',

    root: {
        expanded: true,
        children: [
		 {
                text: _('Historical performance tasks'),
                iconCls:'x-fa fa-history',
                expanded: true,
                fun_id:'0501',
                hidden:SEC.hidden('0501'),
                selectable: false,
                children: [
                    {
                        text: _('historyTaskMang'),
                        routeId: 'performanceMainView',
                        iconCls: 'x-fa fa-tasks',
                        hidden:SEC.hidden('performanceMainView'),
                        viewType: 'performanceMainView',
                        fun_id:'performanceMainView',
                        leaf: true
                    },
                    {
                        text: _('historyDisplay'),
                        iconCls:'pictos pictos-chart2',
                        routeId: 'historyDisplayView',
                        viewType: 'historyDisplayView',
                        hidden:SEC.hidden('historyDisplayView'),
                        fun_id:'historyDisplayView',                                     
                        leaf: true
                    },                 
                ]
            },
			{
                text: _('realTimeTasks'),
                iconCls:'icon-spinner-five fa-spin',
                expanded: true,
                fun_id:'0502',
                hidden:SEC.hidden('0502'),
                selectable: false,
                children: [
                    {
                        text: _('realTimeDisplay'),
                        iconCls: 'x-fa fa-line-chart',
                        routeId: 'realTimeMainView',
                        hidden:SEC.hidden('realTimeMainView'),
                        viewType: 'realTimeMainView',
                        fun_id:'realTimeMainView',                                       
                        leaf: true
                    },                 
                ]
            },
			{
                text:_('performanceReport'),
                iconCls: 'x-fa fa-arrow-circle-down',
                routeId: 'reportww', // routeId defaults to viewType
                viewType: 'reportMainView',
                hidden:SEC.hidden('reportMainView'),
                fun_id:'reportMainView',
               // image: 'perf1.png',
                leaf: true
            },   
             {
                text: _('Template Management'),
                iconCls: 'icon-puzzle_miss',
                expanded: true,
                fun_id:'0504',
                hidden:SEC.hidden('0504'),
                selectable: false,
                children: [
                    {
                        text: _('metricTmplMang'),
                        iconCls: 'x-fa fa-puzzle-piece',
                        viewType: 'PTMMainView',
                        fun_id:'PTMMainView',
                        hidden:SEC.hidden('PTMMainView'),
                        //image: 'perf2.png',
                        routeId: 'PTMMainView',
                        leaf: true
                    },
                    {
                        text: _('tcaTmplMang'),
                        iconCls: 'x-fa fa-puzzle-piece',
                        fun_id:'TTMMainView',
                        viewType: 'TTMMainView',
                        hidden:SEC.hidden('TTMMainView'),
                        //image: 'perf3.png',
                        routeId: 'TTMMainView',
                        leaf: true
                    }
                   
                ]
            },
            {
                text: _('estimateServer'),
                iconCls: 'x-fa fa-line-chart',
                expanded: true,
                fun_id:'0505',  
                hidden:SEC.hidden('0505'),
                selectable: false,
                children: [
                    {
                        text: _('basicInfoServer'),
                        iconCls: 'x-fa fa-user',
                        viewType: 'basicInfo',
                        hidden:SEC.hidden('basicInfo'),
                        fun_id:'basicInfo',
                       // image: 'perf2.png',
                        routeId: 'basicInfo',
                        leaf: true
                    },
                    {
                        text: _('collectAssessment'),
                        iconCls: 'x-fa fa-download',
                        viewType: 'estimateMainView',
                        hidden:SEC.hidden('estimateMainView'),
                        fun_id:'estimateMainView',
                        routeId: 'estimate',
                        leaf: true
                    }
                   
                ]
            },    
            
        ]
    }

});
