Ext.define('Admin.view.config.sdn.pm.pm1564View', {
    extend: 'Ext.container.Container',
    xtype: 'pm1564View',
    requires: [
        'Admin.view.config.sdn.pm.pmLineSingle',
        'Admin.view.config.sdn.pm.pmLineMulti'
    ],

    newPm1564View: function (){
    	return {
    		xtype: 'panel',
    		items: [
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
                            xtype: 'pmLineMulti',
                            chartItemId: 'pm_chartY_1',
                            chartTitle:_('Delay(us)'),
                            chartLegend0:_('MinDelay'),
                            chartLegend1:_('AverageDelay'),
                            chartLegend2:_('MaxDelay'),
                            chartLegendTop:-4,
                            chartHeight:400,
                        },
                        {
                            flex:1,
                            xtype: 'pmLineMulti',
                            chartItemId: 'pm_chartY_2',
                            chartTitle:_('Jitter(us)'),
                            chartLegend0:_('MinJitter'),
                            chartLegend1:_('AverageJitter'),
                            chartLegend2:_('MaxJitter'),
                            chartLegendTop:-4,
                            chartHeight:400,
                        }
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
                            xtype: 'pmLineSingle',
                            chartItemId: 'pm_chartY_3',
                            chartTitle:_('LossRate(%)'),
                            chartTtileId:'pm1564_title_3',
                            chartLegend:_('LossRate'),
                            chartHeight:400,
                        },
                        {
                            flex:1,
                            xtype: 'pmLineSingle',
                            chartItemId: 'pm_chartY_4',
                            chartTitle:_('InformationRate(kbps)'),
                            chartTtileId:'pm1564_title_4',
                            chartLegend:_('InformationRate'),
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
                            xtype: 'pmLineSingle',
                            chartItemId: 'pm_chartY_5',
                            chartTitle:_('DelayRange(us)'),
                            chartTtileId:'pm1564_title_5',
                            chartLegend:_('DelayRange'),
                            chartHeight:400,
                        },
                        {
                            flex:1,
                            xtype: 'pmLineSingle',
                            chartItemId: 'pm_chartY_6',
                            chartTitle:_('Availability(%)'),
                            chartTtileId:'pm1564_title_6',
                            chartLegend:_('Availability'),
                            chartHeight:400,
                        },
                       
                    ]
                },
                {
                   xtype: 'pmLineSingle',
                   chartItemId: 'pm_chartY_7',
                   chartTitle:_('BitErrorRate(%)'),
                   chartTtileId:'pm1564_title_7',
                   chartLegend:_('BitErrorRate'),
                   chartHeight:400,

                }
    		]
    	}
    },

    initComponent: function () {
        this.items=this.newPm1564View();
        this.callParent();
    },

    //Y1564性能图表 查询事件
    getPm1564Chart:function(elineId,startTime,endTime){     

        var pmReslut=[],
            input = {
                    'service-id': elineId,
                    'start-time': startTime,
                    'end-time': endTime
                };
        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-pm-result',
            method : 'post',
            async:false,
            jsonData : input,
            success:function(response, opts){
                var obj = Ext.decode(response.responseText);
                if(obj.data && obj.data.length >0 ){
                  pmReslut= JSON.parse(obj.data);
                }
            },
            failure:function(response, opts){
                console.log("get Y1564 proformance error")
            }
        });

        //fake data
        pmReslut = [{
            'collect-time': '2016-06-30 00:00:00',
            'lossRate': 100,
            'maxLossRate': 600,
            'minLossRate': 100,
            'averageDelay': 100,
            'maxDelay': 600,
            'minDelay': 100,
            'averageJitter': 100,
            'maxJitter': 600,
            'minJitter': 100,
            'informationRate': 100,
            'delayRange': 100,
            'availability': 50,
            'bitErrorRate': 5000
        }, {
            'collect-time': '2016-06-30 00:05:00',
            'lossRate': 200,
            'maxLossRate': 600,
            'minLossRate': 100,
            'averageDelay': 200,
            'maxDelay': 600,
            'minDelay': 100,
            'averageJitter': 200,
            'maxJitter': 600,
            'minJitter': 100,
            'informationRate': 200,
            'delayRange': 200,
            'availability': 50,
            'bitErrorRate': 5000
        }, {
            'collect-time': '2016-06-30 00:10:00',
            'lossRate': 300,
            'maxLossRate': 600,
            'minLossRate': 100,
            'averageDelay': 300,
            'maxDelay': 600,
            'minDelay': 100,
            'averageJitter': 300,
            'maxJitter': 600,
            'minJitter': 100,
            'informationRate': 300,
            'delayRange': 300,
            'availability': 50,
            'bitErrorRate': 5000
        }, {
            'collect-time': '2016-06-30 00:15:00',
            'lossRate': 400,
            'maxLossRate': 1000,
            'minLossRate': 100,
            'averageDelay': 400,
            'maxDelay': 600,
            'minDelay': 100,
            'averageJitter': 400,
            'maxJitter': 600,
            'minJitter': 100,
            'informationRate': 400,
            'delayRange': 400,
            'availability': 50,
            'bitErrorRate': 5000
        }, {
            'collect-time': '2016-06-30 00:20:00',
            'lossRate': 500,
            'maxLossRate': 1000,
            'minLossRate': 100,
            'averageDelay': 500,
            'maxDelay': 600,
            'minDelay': 100,
            'averageJitter': 500,
            'maxJitter': 600,
            'minJitter': 100,
            'informationRate': 500,
            'delayRange': 500,
            'availability': 50,
            'bitErrorRate': 5000
        }];
        //fake data
        if((!pmReslut) || pmReslut.length==0)
            return;

        var xData = [];
        var yData = {'0':[],'1':[],'2':[],'3':[],'4':[],'5':[],'6': []};

        var lossRateArr = [];
        var maxLossRateArr = [];
        var minLossRateArr = [];
        var minLossRateArr = [];
        var averageDelayArr = [];
        var maxDelayArr = [];
        var minDelayArr = [];
        var averageJitterArr = [];
        var maxJitterArr = [];
        var minJitterArr = [];
        var informationRateArr = [];
        var delayRangeArr = [];
        var availabilityArr = [];
        var bitErrorRateArr = [];

        var ifrOver = false;
        for (var i = 0; i < pmReslut.length; i++) {
            xData.push(pmReslut[i]['collect-time']);
            lossRateArr.push(pmReslut[i]['lossRate'] / 100000 * 100);
            averageDelayArr.push(pmReslut[i]['averageDelay']);
            maxDelayArr.push(pmReslut[i]['maxDelay']);
            minDelayArr.push(pmReslut[i]['minDelay']);
            averageJitterArr.push(pmReslut[i]['averageJitter']);
            maxJitterArr.push(pmReslut[i]['maxJitter']);
            minJitterArr.push(pmReslut[i]['minJitter']);
            if (pmReslut[i]['informationRate'] > 1000) {
                ifrOver = true;
            }
            informationRateArr.push(pmReslut[i]['informationRate']);
            delayRangeArr.push(pmReslut[i]['delayRange']);
            availabilityArr.push(pmReslut[i]['availability']);
            bitErrorRateArr.push(pmReslut[i]['bitErrorRate'] / 100000 * 100);
        }

        yData['0'].push(minDelayArr);
        yData['0'].push(averageDelayArr);
        yData['0'].push(maxDelayArr);


        yData['1'].push(minJitterArr);
        yData['1'].push(averageJitterArr);
        yData['1'].push(maxJitterArr);

        yData['2'].push(lossRateArr);


        if (ifrOver === true) {
            yData['3'].push(dataOverProcess(informationRateArr));
        } else {
            yData['3'].push(informationRateArr);
        }
        yData['4'].push(delayRangeArr);
        yData['5'].push(availabilityArr);
        yData['6'].push(bitErrorRateArr);

            //Y1564配置图标Panel
        var len = xData.length;

        for(var i=0;i<7;i++){
            var bandData =[],
                maxNum=0;
            if(i===0 || i===1){ //more then one series
                for(var j=0;j<len;j++){
                    bandData.push({
                        "date":xData[j],
                        "data1":yData[String(i)][0][j],
                        "data2":yData[String(i)][1][j],
                        "data3":yData[String(i)][2][j]
                    });
                    var tempMax= Math.max(yData[i][0][j],yData[i][1][j],yData[i][2][j]);
                    if(maxNum<tempMax)
                        maxNum = tempMax;
                }
            }
            else{
                for(var j=0;j<len;j++){
                     bandData.push({
                        "date":xData[j],
                        "data1":yData[String(i)][0][j]
                    });
                }
            }

            var chart = this.down("[reference='pm_chartY_"+(i+1)+"']");
            if(!chart)
                continue;

            if(bandData.length>24){
                var axesX= chart.getAxes()[1];
                    range=Math.ceil((24/bandData.length)*100)/100;
                axesX.setVisibleRange([0,range]);
            }
            else{
                var axesX= chart.getAxes()[1];
                axesX.setVisibleRange([0,1]);
            }

            if(i===2 || i===5 || i===6){
                var yAxes=chart.getAxes()[0];
                yAxes.setMaximum(100);
            }
            else if(i===0 || i===1){
                if(maxNum==0)
                    maxNum=100;
                var yAxes=chart.getAxes()[0];
                yAxes.setMaximum(maxNum);
            }

            if(i===3){ //信息率(kbps) or 信息率(mbps)
                var chartTtitle=Ext.ComponentQuery.query("[reference='pm1564_title_4']")[0];
                if(chartTtitle){
                     if(ifrOver === true)
                        chartTtitle.setHtml('<div style="font-weight: 700">&nbsp;&nbsp;'+_('InformationRate(mbps)')+'</div>');
                    else
                        chartTtitle.setHtml('<div style="font-weight: 700">&nbsp;&nbsp;'+_('InformationRate(kbps)')+'</div>');
                }   
            }
            var store = chart.getStore();
            store.removeAll();
            store.loadData(bandData);
        }
    }
})