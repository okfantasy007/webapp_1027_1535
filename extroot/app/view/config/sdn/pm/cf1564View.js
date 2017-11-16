Ext.define('Admin.view.config.sdn.pm.cf1564View', {
    extend: 'Ext.container.Container',
    xtype: 'cf1564View',
    requires: [
        'Admin.view.config.sdn.pm.cfBandBarChart',
        'Admin.view.config.sdn.pm.cfBarGroupChart',
        'Admin.view.config.sdn.pm.cfBarChart'
    ],

    newCf1564View: function () {
        return  {
            xtype: 'panel',
            items: [
                {
                    xtype: 'cfBandBarChart',
                    chartItemId: 'cf_chart_1',
                    chartTitle:_('Bandwidth (kbps)'),
                    chartHeight:400,
                },
                {
                    xtype: "panel",
                    defaults:{
                        frame:true
                    },
                    bodyPadding : '20 3 5 3',
                    layout:{
                        type:'hbox',
                        pack:'center',
                        align:'stretch'

                    },
                    items:[
                        {
                            flex:1,
                            xtype: 'cfBarGroupChart',
                            chartItemId: 'cf_chart_2',
                            chartTitle:_('LossRate(%)'),
                            chartTtileId:'cf1564_chart_2',
                            chartLegend0:_('MinLossRate'),
                            chartLegend1:_('LossRate'),
                            chartLegend2:_('MaxLossRate'),
                            chartHeight:400,
                        },
                        {
                            flex:1,
                            xtype: 'cfBarGroupChart',
                            chartItemId: 'cf_chart_3',
                            chartTitle:_('Delay(us)'),
                            chartTtileId:'cf1564_chart_3',
                            chartLegend0:_('MinDelay'),
                            chartLegend1:_('AverageDelay'),
                            chartLegend2:_('MaxDelay'),
                            chartHeight:400,
                        },
                    ]
                },
                {
                    xtype: "panel",
                    defaults:{
                        frame:true
                    },
                    bodyPadding : '20 3 5 3',
                    layout:{
                        type:'hbox',
                        pack:'center',
                        align:'stretch'

                    },
                    items:[
                        {
                            flex:1,
                            xtype: 'cfBarGroupChart',
                            chartItemId: 'cf_chart_4',
                            chartTitle:_('Jitter(us)'),
                            chartTtileId:'cf1564_chart_4',
                            chartLegend0:_('MinJitter'),
                            chartLegend1:_('AverageJitter'),
                            chartLegend2:_('MaxJitter'),
                            chartHeight:400,
                        },
                        {
                            flex:1,
                            xtype: 'cfBarGroupChart',
                            chartItemId: 'cf_chart_5',
                            chartTitle:_('InformationRate(kbps)'),
                            chartTtileId:'cf1564_chart_5',
                            chartLegend0:_('MinInformationRate'),
                            chartLegend1:_('InformationRate'),
                            chartLegend2:_('MaxInformationRate'),
                            chartHeight:400,
                        },
                    ]
                },
                 {
                    xtype: "panel",
                    defaults:{
                        frame:true
                    },
                    bodyPadding : '20 3 5 3',
                    layout:{
                        type:'hbox',
                        pack:'center',
                        align:'stretch'

                    },
                    items:[
                        {
                            flex:1,
                            xtype: 'cfBarChart',
                            chartItemId: 'cf_chart_6',
                            chartTitle:_('DelayRange(us)'),
                            chartLegend:_('DelayRange'),
                            chartHeight:400,
                        },
                        {
                            flex:1,
                            xtype: 'cfBarChart',
                            chartItemId: 'cf_chart_7',
                            chartTitle:_('Availability(%)'),
                            chartLegend:_('Availability'),
                            chartHeight:400,
                        },
                    ]
                },
                {
                   xtype: 'cfBarChart',
                   chartItemId: 'cf_chart_8',
                   chartTitle:_('BitErrorRate(%)'),
                   chartLegend:_('BitErrorRate'),
                   chartHeight:400,

                },
            ],
            /*dockedItems:[
                {
                    xtype: 'toolbar',
                    bodyStyle:"top:2px",
                    reference: 'pmChartDockedItems',
                    items: [
                        '-',
                        {
                            iconCls: 'x-fa fa-angle-double-left',
                            tooltip: '返回',
                            focusCls:'null',
                            handler:'goBack'
                        },
                        '-',
                        {
                            iconCls: 'x-fa fa-file-excel-o',
                            tooltip: '导出Excel',
                            text : '导出Excel',
                            handler:'onExportExcel1564'
                        },
                        {
                            iconCls: 'x-fa fa-file-pdf-o',
                            tooltip: '导出PDF',
                            text : '导出PDF',
                            handler:'onExportPdf1564'
                        }
                    ]
                }
            ]*/
        };
    },

    initComponent: function () {
        this.items=this.newCf1564View();
        this.callParent();
    },

        //生成Y1564配置图表
    getCf1564Chart:function(elineId,cir,eir) {
        var me = this;

        var cfgReslut = me.getY1564CfgResult({'service-id': elineId});

        /* cfgReslut = [{
            "mode": "overload",
            "step": 1,
            "minInformationRate": 0,
            "maxLossRate": 100000,
            "informationRate": 0,
            "maxInformationRate": 0,
            "bitErrorRate": 0,
            "maxJitter": 0,
            "averageDelay": 4294967,
            "delayRange": 0,
            "minDelay": 0,
            "result": "fail",
            "minLossRate": 100000,
            "minJitter": 0,
            "lossRate": 10000,
            "averageJitter": 4294967,
            "status": "finish",
            "availability": 0,
            "maxDelay": 0
        },
            {
                "mode": "cir",
                "step": 3,
                "minInformationRate": 0,
                "maxLossRate": 100000,
                "informationRate": 0,
                "maxInformationRate": 0,
                "bitErrorRate": 0,
                "maxJitter": 0,
                "averageDelay": 4294967,
                "delayRange": 0,
                "minDelay": 0,
                "result": "fail",
                "minLossRate": 100000,
                "minJitter": 0,
                "lossRate": 0,
                "averageJitter": 4294967,
                "status": "finish",
                "availability": 0,
                "maxDelay": 0
            },
            {
                "mode": "eir",
                "step": 1,
                "minInformationRate": 0,
                "maxLossRate": 100000,
                "informationRate": 0,
                "maxInformationRate": 0,
                "bitErrorRate": 0,
                "maxJitter": 0,
                "averageDelay": 4294967,
                "delayRange": 0,
                "minDelay": 0,
                "result": "fail",
                "minLossRate": 100000,
                "minJitter": 0,
                "lossRate": 10000,
                "averageJitter": 4294967,
                "status": "finish",
                "availability": 0,
                "maxDelay": 0
            },
            {
                "mode": "cir",
                "step": 4,
                "minInformationRate": 0,
                "maxLossRate": 0,
                "informationRate": 0,
                "maxInformationRate": 0,
                "bitErrorRate": 0,
                "maxJitter": 0,
                "averageDelay": 4294967,
                "delayRange": 0,
                "minDelay": 0,
                "result": "fail",
                "minLossRate": 0,
                "minJitter": 0,
                "lossRate": 0,
                "averageJitter": 4294967,
                "status": "finish",
                "availability": 0,
                "maxDelay": 0
            },
            {
                "mode": "cir",
                "step": 1,
                "minInformationRate": 0,
                "maxLossRate": 0,
                "informationRate": 0,
                "maxInformationRate": 0,
                "bitErrorRate": 0,
                "maxJitter": 0,
                "averageDelay": 4294967,
                "delayRange": 0,
                "minDelay": 0,
                "result": "fail",
                "minLossRate": 0,
                "minJitter": 0,
                "lossRate": 0,
                "averageJitter": 4294967,
                "status": "finish",
                "availability": 0,
                "maxDelay": 0
            },
            {
                "mode": "cir",
                "step": 2,
                "minInformationRate": 0,
                "maxLossRate": 0,
                "informationRate": 0,
                "maxInformationRate": 0,
                "bitErrorRate": 0,
                "maxJitter": 0,
                "averageDelay": 4294967,
                "delayRange": 0,
                "minDelay": 0,
                "result": "fail",
                "minLossRate": 0,
                "minJitter": 0,
                "lossRate": 10000,
                "averageJitter": 4294967,
                "status": "finish",
                "availability": 0,
                "maxDelay": 0
            }];*/

        if (!cfgReslut || cfgReslut.length == 0)
            return 0;

        var eirExist = false,
            overloadExist = false;

        for (var m1 = 0; m1 < cfgReslut.length; m1++) {
            if (cfgReslut[m1]['mode'] === 'eir') {
                eirExist = true;
                break;
            }
        }

        for (var m2 = 0; m2 < cfgReslut.length; m2++) {
            if (cfgReslut[m2]['mode'] === 'overload') {
                overloadExist = true;
                break;
            }
        }

        var stepResponse = me.getY1564CfgStepInfo(elineId),
            cirStepCount, stepCount, mode;

        if (stepResponse) {
            cirStepCount = stepResponse['step'];
            stepCount = stepResponse['step'];
            mode = stepResponse['mode'];
            if (stepResponse['mode'] === 'eir') {
                stepCount = stepResponse['step'] + 1;
            } else if (stepResponse['mode'] === 'overload') {
                stepCount = stepResponse['step'] + 2;
            }
        }

        if (cirStepCount === undefined) {
            cirStepCount = 4;
            stepCount = 6;
        }

        var yData = {'0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': []},
            xData = [],
            xDataTtile={
                '1':_('Step 1'),
                '2':_('Step 2'),
                '3':_('Step 3'),
                '4':_('Step 4'),
                '5':_('Step 5'),
                '6':_('Step 6')
            };

        for (var n = 0; n < stepCount; n++) {
            xData[n] = xDataTtile[String(n+1)];
        }

        var lossRateArr = [],
            maxLossRateArr = [],
            minLossRateArr = [],
            averageDelayArr = [],
            maxDelayArr = [],
            minDelayArr = [],
            delayRangeArr = [],
            averageJitterArr = [],
            maxJitterArr = [],
            minJitterArr = [],
            informationRateArr = [],
            maxInformationRateArr = [],
            minInformationRateArr = [],
            availabilityArr = [],
            bitErrorRateArr = [];

        var step, stepBandWidth = [], ifrOver = false;

        for (var i = 0; i < cfgReslut.length; i++) {
            if (cfgReslut[i]['mode'] === "cir") {
                xData.push(cfgReslut[i]['step']);
                step = cfgReslut[i]['step'];
                stepBandWidth[step - 1] = cir * (1 - cfgReslut[i]['lossRate'] / 100000) * step / cirStepCount;

            } else if (cfgReslut[i]['mode'] === "eir") {
                if ((mode === 'overload' && cfgReslut.length < stepCount) || mode === 'eir') {
                    xData.push(cfgReslut.length);
                    step = cfgReslut.length;
                } else {
                    xData.push(cfgReslut.length - 1);
                    step = cfgReslut.length - 1;
                }
                stepBandWidth[step - 1] = (cir + eir) * (1 - cfgReslut[i]['lossRate'] / 100000);

            } else if ((cfgReslut[i]['mode'] === "overload")) {
                xData.push(cfgReslut.length);
                step = cfgReslut.length;
                stepBandWidth[step - 1] = (cir + 1.25 * eir) * (1 - cfgReslut[i]['lossRate'] / 100000);

            }

            lossRateArr[step - 1] = cfgReslut[i]['lossRate'] / 100000 * 100;
            maxLossRateArr[step - 1] = cfgReslut[i]['maxLossRate'] / 100000 * 100;
            minLossRateArr[step - 1] = cfgReslut[i]['minLossRate'] / 100000 * 100;
            averageDelayArr[step - 1] = cfgReslut[i]['averageDelay'];
            maxDelayArr[step - 1] = cfgReslut[i]['maxDelay'];
            minDelayArr[step - 1] = cfgReslut[i]['minDelay'];
            averageJitterArr[step - 1] = cfgReslut[i]['averageJitter'];
            maxJitterArr[step - 1] = cfgReslut[i]['maxJitter'];
            minJitterArr[step - 1] = cfgReslut[i]['minJitter'];

            informationRateArr[step - 1] = cfgReslut[i]['informationRate'];
            maxInformationRateArr[step - 1] = cfgReslut[i]['maxInformationRate'];
            minInformationRateArr[step - 1] = cfgReslut[i]['minInformationRate'];
            delayRangeArr[step - 1] = cfgReslut[i]['delayRange'];
            availabilityArr[step - 1] = cfgReslut[i]['availability'];
            bitErrorRateArr[step - 1] = cfgReslut[i]['bitErrorRate'] / 100000 * 100;

            if (cfgReslut[i]['informationRate'] > 1000) {
                ifrOver = true;
            }

        }

        yData['0'].push(minLossRateArr);
        yData['0'].push(lossRateArr);
        yData['0'].push(maxLossRateArr);

        yData['1'].push(minDelayArr);
        yData['1'].push(averageDelayArr);
        yData['1'].push(maxDelayArr);

        yData['2'].push(minJitterArr);
        yData['2'].push(averageJitterArr);
        yData['2'].push(maxJitterArr);

        if (ifrOver === true) {
            yData['3'].push(dataOverProcess(minInformationRateArr));
            yData['3'].push(dataOverProcess(informationRateArr));
            yData['3'].push(dataOverProcess(maxInformationRateArr));
        } else {
            yData['3'].push(minInformationRateArr);
            yData['3'].push(informationRateArr);
            yData['3'].push(maxInformationRateArr);
        }

        yData['4'].push(delayRangeArr);
        yData['5'].push(availabilityArr);
        yData['6'].push(bitErrorRateArr);


        var greenArr = [], redArr = [], yellowArr = [], blueArr = [], blackArr = [], grayArr = [];


        if (eirExist === false && overloadExist === false) {
            //only cir
            for (var s = 1; s < cfgReslut.length + 1; s++) {
                greenArr[s - 1] = 1 / cirStepCount * s * cir * (1 - lossRateArr[s - 1] / 100);
                redArr[s - 1] = 1 / cirStepCount * s * cir * lossRateArr[s - 1] / 100;
                yellowArr[s - 1] = 0;
                blueArr[s - 1] = 0;
                blackArr[s - 1] = 0;
                grayArr[s - 1] = 0;
            }

        } else if (eirExist === true && overloadExist === false) {

            for (var s = 1; s < cirStepCount + 1; s++) {
                greenArr[s - 1] = 1 / cirStepCount * s * cir * (1 - lossRateArr[s - 1] / 100);
                redArr[s - 1] = 1 / cirStepCount * s * cir * lossRateArr[s - 1] / 100;
                yellowArr[s - 1] = 0;
                blueArr[s - 1] = 0;
                blackArr[s - 1] = 0;
                grayArr[s - 1] = 0;
            }

            yellowArr[cirStepCount] = eir - ((cir + eir) * lossRateArr[cirStepCount] / 100);
            blueArr[cirStepCount] = (cir + eir) * lossRateArr[cirStepCount] / 100;

            if (blueArr[cirStepCount] > eir || blueArr[cirStepCount] === eir) {
                greenArr[cirStepCount] = cir + yellowArr[cirStepCount];
                yellowArr[cirStepCount] = 0;
                redArr[cirStepCount] = 0;
            } else if (blueArr[cirStepCount] < eir) {
                greenArr[cirStepCount] = cir;
                redArr[cirStepCount] = 0;
            }

            blackArr[cirStepCount] = 0;
            grayArr[cirStepCount] = 0;

        } else if (eirExist === true && overloadExist === true) {
            //only cir
            for (var s = 1; s < cfgReslut.length - 1; s++) {
                greenArr[s - 1] = 1 / cirStepCount * s * cir * (1 - lossRateArr[s - 1] / 100);
                redArr[s - 1] = 1 / cirStepCount * s * cir * lossRateArr[s - 1] / 100;
                yellowArr[s - 1] = 0;
                blueArr[s - 1] = 0;
                blackArr[s - 1] = 0;
                grayArr[s - 1] = 0;
            }

            yellowArr[cfgReslut.length - 2] = eir - ((cir + eir) * lossRateArr[cfgReslut.length - 2] / 100);
            blueArr[cfgReslut.length - 2] = (cir + eir) * lossRateArr[cfgReslut.length - 2] / 100;

            if (blueArr[cfgReslut.length - 2] > eir || blueArr[cfgReslut.length - 2] === eir) {
                greenArr[cfgReslut.length - 2] = cir + yellowArr[cfgReslut.length - 2];
                yellowArr[cfgReslut.length - 2] = 0;
                redArr[cfgReslut.length - 2] = 0;
            } else if (blueArr[cfgReslut.length - 2] < eir) {
                greenArr[cfgReslut.length - 2] = cir;
                redArr[cfgReslut.length - 2] = 0;
            }

            blackArr[cfgReslut.length - 2] = 0;
            grayArr[cfgReslut.length - 2] = 0;


            grayArr[cfgReslut.length - 1] = (cir + 1.25 * eir) * lossRateArr[cfgReslut.length - 1] / 100;

            if (grayArr[cfgReslut.length - 1] < 0.25 * eir) {

                greenArr[cfgReslut.length - 1] = cir;
                redArr[cfgReslut.length - 1] = 0;
                yellowArr[cfgReslut.length - 1] = eir;
                blueArr[cfgReslut.length - 1] = 0;
                blackArr[cfgReslut.length - 1] = 0.25 * eir - grayArr[cfgReslut.length - 1];
            } else if ((grayArr[cfgReslut.length - 1] > 0.25 * eir || grayArr[cfgReslut.length - 1] === 0.25 * eir) && grayArr[cfgReslut.length - 1] < 1.25 * eir) {

                greenArr[cfgReslut.length - 1] = cir;
                redArr[cfgReslut.length - 1] = 0;
                yellowArr[cfgReslut.length - 1] = 1.25 * eir - grayArr[cfgReslut.length - 1];
                blueArr[cfgReslut.length - 1] = 0;
                blackArr[cfgReslut.length - 1] = 0;
            } else if (grayArr[cfgReslut.length - 1] > 1.25 * eir || grayArr[cfgReslut.length - 1] === 1.25 * eir) {

                greenArr[cfgReslut.length - 1] = cir - (grayArr[cfgReslut.length - 1] - 1.25 * eir);
                redArr[cfgReslut.length - 1] = 0;
                yellowArr[cfgReslut.length - 1] = 0;
                blueArr[cfgReslut.length - 1] = 0;
                blackArr[cfgReslut.length - 1] = 0;
            }

        }

        for (var ss = cfgReslut.length + 1; ss < stepCount + 1; ss++) {
            greenArr[ss - 1] = 0;
            redArr[ss - 1] = 0;
            yellowArr[ss - 1] = 0;
            blueArr[ss - 1] = 0;
            blackArr[ss - 1] = 0;
            grayArr[ss - 1] = 0;

            lossRateArr[ss - 1] = undefined;
            maxLossRateArr[ss - 1] = undefined;
            minLossRateArr[ss - 1] = undefined;
            averageDelayArr[ss - 1] = undefined;
            maxDelayArr[ss - 1] = undefined;
            minDelayArr[ss - 1] = undefined;
            averageJitterArr[ss - 1] = undefined;
            maxJitterArr[ss - 1] = undefined;
            minJitterArr[ss - 1] = undefined;
            informationRateArr[ss - 1] = undefined;
            maxInformationRateArr[ss - 1] = undefined;
            minInformationRateArr[ss - 1] = undefined;
            delayRangeArr[ss - 1] = undefined;
            availabilityArr[ss - 1] = undefined;
            bitErrorRateArr[ss - 1] = undefined;
        }

        //带宽图表整理成ExtChart数据格式

        var bandData = [];
        for (var i in xData) {
            if(isNaN(xData[i])){
                bandData.push({
                    name: xData[i],
                    data1: greenArr[i],
                    data2: redArr[i],
                    data3: yellowArr[i],
                    data4: blueArr[i],
                    data5: blackArr[i],
                    data6: grayArr[i]
                })
            }
        }

        //生成 0:"带宽(kbps)"
        //var chart = this.down("#cf_chart_1");
        var chart=this.down("[reference='cf_chart_1']");
        if (chart){

            var xAxis = chart.getAxes()[0],
                limits = xAxis.getLimits();

            limits[0].value = cir;
            limits[0].line.title.text = "CIR："+cir;
            limits[1].value = cir + eir;
            limits[1].line.title.text = "CIR+EIR："+(cir + eir);
            limits[2].value = cir + 1.25 * eir;
            limits[2].line.title.text = "CIR+125%EIR："+(cir + 1.25 * eir);

            xAxis.setMaximum((cir + 1.4 * eir));
            var store = chart.getStore();
            store.removeAll();
            store.loadData(bandData);
        }

        //生成 1:丢包率(%) 2:时延(us) 3:抖动(us) 4:信息率(kbps)/信息率(mbps)

        var legList = [
            ["最小丢包率","丢包率","最大丢包率"],
            ["最小时延","平均时延","最大时延"],
            ["最小抖动","平均抖动","最大抖动"],
            ["最小信息率","信息率","最大信息率"],
            ["时延范围"],
            ["可用性"],
            ["误码率"],
        ];

        for (var i = 0; i < 4; i++) {
            var bindData=[],
                maxNum=0;
            for(var j=0;j<xData.length;j++){
                 if(isNaN(xData[j])){
                    bindData.push({
                        name: xData[j],
                        data1: yData[i][0][j],
                        data2: yData[i][1][j],
                        data3: yData[i][2][j]
                    });
                    var tempMax= Math.max(yData[i][0][j],yData[i][1][j],yData[i][2][j]);
                    if(maxNum<tempMax)
                        maxNum = tempMax;
                } 
            } 
            var chartId= i+2,//cf_chart_1 被带宽占用
                chart=this.down("[reference='cf_chart_"+chartId+"']");

            if(!chart)  
               continue;

           if(chartId==5){
                var chartTtitle=Ext.ComponentQuery.query("[reference='cf1564_chart_5']")[0];
                if(chartTtitle){
                     if(ifrOver === true)
                        chartTtitle.setHtml('<div style="font-weight: 700">&nbsp;&nbsp;'+_('InformationRate(mbps)')+'</div>');
                     else
                        chartTtitle.setHtml('<div style="font-weight: 700">&nbsp;&nbsp;'+_('InformationRate(kbps)')+'</div>');
                }   
            } 

            var xAxis = chart.getAxes()[0];
            if(chartId==2){
                xAxis.setMaximum(100);
            } else{
                if(maxNum==0){
                    xAxis.setMaximum(100);
                }
                else
                    xAxis.setMaximum(maxNum*1.1);
            }

            var store = chart.getStore();
            store.removeAll();
            store.loadData(bindData);
        }

         //生成 5:时延范围(us) 6:可用性(%) 7:误码率(%)

        for (var i = 4; i < 7; i++) {
            var bindData=[],
                maxNum=0;
            for(var j=0;j<xData.length;j++){
                 if(isNaN(xData[j])){
                    bindData.push({
                        name: xData[j],
                        data1: yData[i][0][j]
                    });
                    if(maxNum <yData[i][0][j])
                        maxNum = yData[i][0][j];
                } 
            } 
            var chartId= i+2,//cf_chart_1 被带宽占用
                chart=this.down("[reference='cf_chart_"+chartId+"']");
            if(!chart)  
               continue;

            var xAxis = chart.getAxes()[0];
            if(chartId==7 || chartId==8){
                xAxis.setMaximum(100);
            }
            else{
                if(maxNum==0)
                    xAxis.setMaximum(100);
                 else
                    xAxis.setMaximum(maxNum*1.1);
            }
            var store = chart.getStore();
            store.removeAll();
            store.loadData(bindData);
        }
        return cfgReslut.length;
    },

    //跟据业务ID获取Y1564配置结果
    getY1564CfgResult:function(input){
        var result = [];
        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-cf-result',
            method : 'post',
            async:false,
            params : input,
            success:function(response, opts){
                var obj = Ext.decode(response.responseText);
                //result = JSON.parse(obj.data);
                result = obj.data;
            },
            failure:function(response, opts){
                console.log(response.responseText);
            }
        });
        return result;
    },

    //跟据业务ID获取Y1564配置StepInfo
    getY1564CfgStepInfo:function(elineId){
        var result;
        Ext.Ajax.request({
            url:"/config/sdn/pmService/get-cf-result-step/"+elineId,
            async:false,
            success:function(response, opts){
                var obj = Ext.decode(response.responseText);
                result = obj.data;
            },
            failure:function(response, opts){
                console.log('跟据业务ID获取Y1564配置StepInfo');
                console.log(response.responseText);
            }
        });
        return result;
    },

})