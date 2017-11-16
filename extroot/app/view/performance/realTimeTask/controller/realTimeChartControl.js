Ext.define('Admin.view.performance.realTimeTask.controller.realTimeChartControl', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.realTimeChartControl',
    onCancel: function () {
        var card = this.getView().up();
        var controller = this;
        if (controller.timeChartTask1 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask1);
        };
        if (controller.timeChartTask2 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask2);
        };
        if (controller.timeChartTask3 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask3);
        };
        if (controller.timeChartTask4 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask4);
        };
        if (controller.timeChartTask5 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask5);
        };
        if (controller.timeChartTask6 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask6);
        };
        if (controller.timeChartTask7 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask7);
        };
        if (controller.timeChartTask8 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask8);
        };
        if (controller.timeChartTask9 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask9);
        };
        if (controller.timeChartTask10 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTask10);
        };

        if (controller.timeChartTaskGrid1 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid1);
        };
        if (controller.timeChartTaskGrid2 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid2);
        };
        if (controller.timeChartTaskGrid3 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid3);
        };
        if (controller.timeChartTaskGrid4 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid4);
        };
        if (controller.timeChartTaskGrid5 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid5);
        };
        if (controller.timeChartTaskGrid6 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid6);
        };
        if (controller.timeChartTaskGrid7 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid7);
        }; if (controller.timeChartTaskGrid8 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid8);
        };
        if (controller.timeChartTaskGrid9 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid9);
        };
        if (controller.timeChartTaskGrid10 != undefined) {
            Ext.TaskManager.stop(controller.timeChartTaskGrid10);
        };
        console.info(card);
        //  view = card.down('realDisplay');
        card.setActiveItem(0);
    },
    //动态设置每行显示多少个chart
    onColumns: function () {
        var comboValue = this.getView().down('#selectColumns').getValue();
        var card = this.getView().up();
        var chartPanel = card.down('#realTimeChartView');
        chartPanel.setConfig({
            layout: {
                type: 'table',
                columns: comboValue,
            }
        })
    },
    //动态设置表格Columns属性
    setGridFields: function (grid) {
        //表格列text取资源名称
        var texts = this.resourceNames();
        var texts1 = texts[0];
        var texts2 = texts[1];
        var texts3 = texts[2];
        var texts4 = texts[3];
        var texts5 = texts[4];
        /* //表格index取store_key,即资源id,映射对应
         indexs=this.setYfields();
         indexs1=indexs[0];
         indexs2=indexs[1];
         indexs3=indexs[2];
         indexs4=indexs[3];
         indexs5=indexs[4];*/
        var columns = grid.getColumns();
        columns[0].setText("time");
        columns[0].dataIndex = "time";
        columns[1].setText(texts1);
        // columns[1].dataIndex=indexs1;
        columns[2].setText(texts2);
        // columns[2].dataIndex=indexs2;
        columns[3].setText(texts3);
        //columns[3].dataIndex=indexs3;
        columns[4].setText(texts4);
        // columns[4].dataIndex=indexs4;
        columns[5].setText(texts5);
        // columns[5].dataIndex=indexs5;
    },
    setMajorTick: function (chart) {
        var intervalTime = this.onCollect();
        axes = chart.getAxes();
        var step = axes[1].getSegmenter().getStep();
        step.step = intervalTime / 1000 * 50 / 18;
        axes[1].getSegmenter().setStep(step)
    },
    beforeshow: function () {
        controller = this;
        var card = this.getView().up();
        var chart1 = card.down('#realChart1');
        var chart2 = card.down('#realChart2');
        var chart3 = card.down('#realChart3');
        var chart4 = card.down('#realChart4');
        var chart5 = card.down('#realChart5');
        var chart6 = card.down('#realChart6');
        var chart7 = card.down('#realChart7');
        var chart8 = card.down('#realChart8');
        var chart9 = card.down('#realChart9');
        var chart10 = card.down('#realChart10');

        var grid1 = card.down('#displayGrid1');
        var grid2 = card.down('#displayGrid2');
        var grid3 = card.down('#displayGrid3');
        var grid4 = card.down('#displayGrid4');
        var grid5 = card.down('#displayGrid5');
        var grid6 = card.down('#displayGrid6');
        var grid7 = card.down('#displayGrid7');
        var grid8 = card.down('#displayGrid8');
        var grid9 = card.down('#displayGrid9');
        var grid10 = card.down('#displayGrid10');
        if (chart1.getTitle() != null) {
            //  this.setGridFields(grid1); 
            this.onTimeChartRendered1();
            this.onTimeChartRenderedGrid1();
        };
        if (chart2.getTitle() != null) {
            // this.setGridFields(grid2); 
            this.onTimeChartRendered2();
            this.onTimeChartRenderedGrid2();
        };
        if (chart3.getTitle() != null) {
            this.onTimeChartRendered3();
            this.onTimeChartRenderedGrid3();
        };
        if (chart4.getTitle() != null) {
            this.onTimeChartRendered4();
            this.onTimeChartRenderedGrid4();
        };
        if (chart5.getTitle() != null) {
            this.onTimeChartRendered5();
            this.onTimeChartRenderedGrid5();
        };
        if (chart6.getTitle() != null) {
            this.onTimeChartRendered6();
            this.onTimeChartRenderedGrid6();
        };
        if (chart7.getTitle() != null) {
            this.onTimeChartRendered7();
            this.onTimeChartRenderedGrid7();
        };
        if (chart8.getTitle() != null) {
            this.onTimeChartRendered8();
            this.onTimeChartRenderedGrid8();
        };
        if (chart9.getTitle() != null) {
            this.onTimeChartRendered9();
            this.onTimeChartRenderedGrid9();
        };
        if (chart10.getTitle() != null) {
            this.onTimeChartRendered10();
            this.onTimeChartRenderedGrid10();
        };
    },
    //将long类型转换为日期格式显示
    timeType: function (time) {
        var datetimeType = "";
        var date = new Date();
        date.setTime(time);
        datetimeType += date.getFullYear();   //年  
        datetimeType += "-" + this.getMonth(date); //月   
        datetimeType += "-" + this.getDay(date);   //日  
        datetimeType += " " + this.getHours(date);   //时  
        datetimeType += ":" + this.getMinutes(date);      //分
        datetimeType += ":" + this.getSeconds(date);      //分
        return datetimeType;
    },
    //返回月份
    getMonth: function (date) {
        var month = "";
        month = date.getMonth() + 1; //getMonth()得到的月份是0-11  
        if (month < 10) {
            month = "0" + month;
        }
        return month;
    },
    //返回01-30的日期  
    getDay: function (date) {
        var day = "";
        day = date.getDate();
        if (day < 10) {
            day = "0" + day;
        }
        return day;
    },
    //返回小时
    getHours: function (date) {
        var hours = "";
        hours = date.getHours();
        if (hours < 10) {
            hours = "0" + hours;
        }
        return hours;
    },
    //返回分
    getMinutes: function (date) {
        var minute = "";
        minute = date.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }
        return minute;
    },
    //返回秒
    getSeconds: function (date) {
        var second = "";
        second = date.getSeconds();
        if (second < 10) {
            second = "0" + second;
        }
        return second;
    },

    onCollect: function () {
        //获取实时任务表
        var card = this.getView().up();
        var realTimeTaskGrid = card.down('#realTimeTaskGrid');
        //获取采集周期task
        var record = realTimeTaskGrid.getSelectionModel().getSelection()[0];
        //获取采集周期equip
        var realTaskForm = card.down('#realTask');
        //var collectPeriod=card.down('#collectPeriod');

        if (record == undefined) {
            //  collect =collectPeriod.getValue()*1000;
            var collect = realTaskForm.getForm().getValues().collectPeriod * 1000;
            console.info(collect);
            return collect;
        } else {
            collect = record.get('collectPeriod') * 1000;
            console.info(collect);
            return collect;
        };

    },
    onEndTime: function () {
        //获取实时任务表
        var card = this.getView().up();
        var realTimeTaskGrid = card.down('#realTimeTaskGrid');
        //获取采集周期task
        var record = realTimeTaskGrid.getSelectionModel().getSelection()[0];
        //获取采集周期equip
        var realEndTime = card.down('#realEndTime');
        var endTime = 0;
        if (record == undefined) {
            endTime = realEndTime.getValue();
            return endTime;
        } else {
            endTime = record.get('endTime');
            return endTime;
        }
    },
    onStop: function () {
        //获取实时任务表
        var controller = this;
        var card = this.getView().up();
        var grid = card.down('#realTimeTaskGrid');
        var id = this.taskId();
        var taskId = [id];
        var params = {
            taskStatus: 4,
            taskId: taskId,
            taskType: 1
        };
        Ext.Ajax.request({
            url: '/pmManagement/api/pmmng/pmTask/updateStatus',
            method: 'POST',
            jsonData: JSON.stringify(params),
            success: function () {
                Ext.Msg.alert('提示', '操作成功'),
                    grid.getStore().reload();
                if (controller.timeChartTask1 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask1);
                };
                if (controller.timeChartTask2 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask2);
                };
                if (controller.timeChartTask3 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask3);
                };
                if (controller.timeChartTask4 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask4);
                };
                if (controller.timeChartTask5 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask5);
                };
                if (controller.timeChartTask6 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask6);
                };
                if (controller.timeChartTask7 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask7);
                };
                if (controller.timeChartTask8 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask8);
                };
                if (controller.timeChartTask9 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask9);
                };
                if (controller.timeChartTask10 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTask10);
                };

                if (controller.timeChartTaskGrid1 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid1);
                };
                if (controller.timeChartTaskGrid2 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid2);
                };
                if (controller.timeChartTaskGrid3 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid3);
                };
                if (controller.timeChartTaskGrid4 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid4);
                };
                if (controller.timeChartTaskGrid5 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid5);
                };
                if (controller.timeChartTaskGrid6 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid6);
                };
                if (controller.timeChartTaskGrid7 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid7);
                }; if (controller.timeChartTaskGrid8 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid8);
                };
                if (controller.timeChartTaskGrid9 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid9);
                };
                if (controller.timeChartTaskGrid10 != undefined) {
                    Ext.TaskManager.stop(controller.timeChartTaskGrid10);
                };
            },
            failure: function (form, action) {
                Ext.Msg.alert('停止失败')
            }
        });

    },
    resourceNames: function () {
        var resourceForm = this.getView().up().down('#resourceForm')
        var resource = resourceForm.getForm().getValues();
        var names = resource.resourceNames;
        var resourceNames = names.split(',');
        return resourceNames;
    },
    resourceIds: function () {
        var resourceForm = this.getView().up().down('#resourceForm')
        var resource = resourceForm.getForm().getValues();
        var ids = resource.resourceIds;
        var resourceIds = ids.split(',');
        return resourceIds;
    },
    metricIds: function () {
        var resourceForm = this.getView().up().down('#resourceForm')
        var resource = resourceForm.getForm().getValues();
        var ids = resource.metricIds;
        var metricIds = ids.split(',');
        return metricIds;
    },
    taskId: function () {
        var resourceForm = this.getView().up().down('#resourceForm');
        var resource = resourceForm.getForm().getValues();
        var taskId = resource.taskId;
        return taskId;
    },
    ontimeChartTask: function (timeChartTask) {
    	  var controller = this;
        if (controller.timeChartTask!=undefined) {
            Ext.TaskManager.stop(controller.timeChartTask);
        }
    },
    //chart1
    onTimeChartRendered1: function () {
        var card = this.getView().up();
        var chart = card.down('#realChart1');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData1();
        this.timeChartTask1 = Ext.TaskManager.start({
            run: this.addNewTimeData1,
            interval: intervalTime,
            scope: this
        });
        
    },

    //获取实时折线图数据
    addNewTimeData1: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart1'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差5秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[0];
        var taskId = this.taskId();
        //var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId}
        var params = {
            "resourceId": ["/ne=8/cpu=0", "/ne=8/cpu=1", "/ne=8/cpu=2"],
            "taskId": 110,
            "metricId": 1080901
        };
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    var c1_1 = JSON.parse(response.responseText).data[0].y1;
                    var c1_2 = JSON.parse(response.responseText).data[0].y2;
                    var c1_3 = JSON.parse(response.responseText).data[0].y3;
                    var c1_4 = JSON.parse(response.responseText).data[0].y4;
                    var c1_5 = JSON.parse(response.responseText).data[0].y5;
                    var unit = JSON.parse(response.responseText).data[0].unit;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask1);
                    }
                },
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                //数据添加
                store.add({
                    time: time,
                    y1: c1_1,
                    y2: c1_2,
                    y3: c1_3,
                    y4: c1_4,
                    y5: c1_5,
                });
            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5,
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask1);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid1: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        var grid = card.down('#displayGrid1');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid1();
        this.timeChartTaskGrid1 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid1,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid1: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid1'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[0];
        var taskId = this.taskId();
        // var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId}
        var params = {
            "resourceId": ["/ne=8/cpu=0", "/ne=8/cpu=1", "/ne=8/cpu=2"],
            "taskId": 110,
            "metricId": 1080901
        };
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            console.info(new Date());
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c1_1 = JSON.parse(response.responseText).data[0].y1;
                    c1_2 = JSON.parse(response.responseText).data[0].y2;
                    c1_3 = JSON.parse(response.responseText).data[0].y3;
                    c1_4 = JSON.parse(response.responseText).data[0].y4;
                    c1_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid1);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c1_1,
                    y2: c1_2,
                    y3: c1_3,
                    y4: c1_4,
                    y5: c1_5
                });
            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid1);
        }
    },

    //chart2
    onTimeChartRendered2: function () {
        var card = this.getView().up();
        var chart = card.down('#realChart2');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData2();
        this.timeChartTask2 = Ext.TaskManager.start({
            run: this.addNewTimeData2,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData2: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart2'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差5秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[1];
        var taskId = this.taskId();
        // var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId}
        var params = {
            "resourceId": ["/ne=8/cpu=0", "/ne=8/cpu=1", "/ne=8/cpu=2"],
            "taskId": 110,
            "metricId": 10809021
        }
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c2_1 = JSON.parse(response.responseText).data[0].y1;
                    c2_2 = JSON.parse(response.responseText).data[0].y2;
                    c2_3 = JSON.parse(response.responseText).data[0].y3;
                    c2_4 = JSON.parse(response.responseText).data[0].y4;
                    c2_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask2);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c2_1,
                    y2: c2_2,
                    y3: c2_3,
                    y4: c2_4,
                    y5: c2_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask2);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid2: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid2');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid2();
        this.timeChartTaskGrid2 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid2,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid2: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid2'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[1];
        var taskId = this.taskId();
        // var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId}
        var params = {
            "resourceId": ["/ne=8/cpu=0", "/ne=8/cpu=1", "/ne=8/cpu=2"],
            "taskId": 110,
            "metricId": 10809021
        };
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c2_1 = JSON.parse(response.responseText).data[0].y1;
                    c2_2 = JSON.parse(response.responseText).data[0].y2;
                    c2_3 = JSON.parse(response.responseText).data[0].y3;
                    c2_4 = JSON.parse(response.responseText).data[0].y4;
                    c2_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid2);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c2_1,
                    y2: c2_2,
                    y3: c2_3,
                    y4: c2_4,
                    y5: c2_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid2);
        }
    },
    //chart3
    onTimeChartRendered3: function () {
        var card = this.getView().up();
        chart = card.down('#realChart3');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData3();
        this.timeChartTask3 = Ext.TaskManager.start({
            run: this.addNewTimeData3,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData3: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart3'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差5秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[2];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId}
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c3_1 = JSON.parse(response.responseText).data[0].y1;
                    c3_2 = JSON.parse(response.responseText).data[0].y2;
                    c3_3 = JSON.parse(response.responseText).data[0].y3;
                    c3_4 = JSON.parse(response.responseText).data[0].y4;
                    c3_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask3);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c3_1,
                    y2: c3_2,
                    y3: c3_3,
                    y4: c3_4,
                    y5: c3_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask3);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid3: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid3');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid3();
        this.timeChartTaskGrid3 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid3,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid3: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid3'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[2];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId}
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c3_1 = JSON.parse(response.responseText).data[0].y1;
                    c3_2 = JSON.parse(response.responseText).data[0].y2;
                    c3_3 = JSON.parse(response.responseText).data[0].y3;
                    c3_4 = JSON.parse(response.responseText).data[0].y4;
                    c3_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid3);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c3_1,
                    y2: c3_2,
                    y3: c3_3,
                    y4: c3_4,
                    y5: c3_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid3);
        }
    },
    //chart4
    onTimeChartRendered4: function () {
        var card = this.getView().up();
        chart = card.down('#realChart4');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData4();
        this.timeChartTask4 = Ext.TaskManager.start({
            run: this.addNewTimeData4,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData4: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart4'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差5秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[3];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c4_1 = JSON.parse(response.responseText).data[0].y1;
                    c4_2 = JSON.parse(response.responseText).data[0].y2;
                    c4_3 = JSON.parse(response.responseText).data[0].y3;
                    c4_4 = JSON.parse(response.responseText).data[0].y4;
                    c4_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask4);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c4_1,
                    y2: c4_2,
                    y3: c4_3,
                    y4: c4_4,
                    y5: c4_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);
                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask4);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid4: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid4');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid4();
        this.timeChartTaskGrid4 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid4,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid4: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid4'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[3];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c4_1 = JSON.parse(response.responseText).data[0].y1;
                    c4_2 = JSON.parse(response.responseText).data[0].y2;
                    c4_3 = JSON.parse(response.responseText).data[0].y3;
                    c4_4 = JSON.parse(response.responseText).data[0].y4;
                    c4_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid4);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c4_1,
                    y2: c4_2,
                    y3: c4_3,
                    y4: c4_4,
                    y5: c4_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid4);
        }
    },
    //chart5
    onTimeChartRendered5: function () {
        var card = this.getView().up();
        chart = card.down('#realChart5');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData5();
        this.timeChartTask5 = Ext.TaskManager.start({
            run: this.addNewTimeData5,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData5: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart5'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差5秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[4];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c5_1 = JSON.parse(response.responseText).data[0].y1;
                    c5_2 = JSON.parse(response.responseText).data[0].y2;
                    c5_3 = JSON.parse(response.responseText).data[0].y3;
                    c5_4 = JSON.parse(response.responseText).data[0].y4;
                    c5_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask5);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c5_1,
                    y2: c5_2,
                    y3: c5_3,
                    y4: c5_4,
                    y5: c5_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask5);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid5: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid5');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid5();
        this.timeChartTaskGrid5 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid5,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid5: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid5'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[4];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c5_1 = JSON.parse(response.responseText).data[0].y1;
                    c5_2 = JSON.parse(response.responseText).data[0].y2;
                    c5_3 = JSON.parse(response.responseText).data[0].y3;
                    c5_4 = JSON.parse(response.responseText).data[0].y4;
                    c5_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid5);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c5_1,
                    y2: c5_2,
                    y3: c5_3,
                    y4: c5_4,
                    y5: c5_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid5);
        }
    },
    //chart6
    onTimeChartRendered6: function () {
        var card = this.getView().up();
        chart = card.down('#realChart6');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData6();
        this.timeChartTask6 = Ext.TaskManager.start({
            run: this.addNewTimeData6,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData6: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart6'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[5];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c6_1 = JSON.parse(response.responseText).data[0].y1;
                    c6_2 = JSON.parse(response.responseText).data[0].y2;
                    c6_3 = JSON.parse(response.responseText).data[0].y3;
                    c6_4 = JSON.parse(response.responseText).data[0].y4;
                    c6_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask6);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c6_1,
                    y2: c6_2,
                    y3: c6_3,
                    y4: c6_4,
                    y5: c6_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask6);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid6: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid6');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid6();
        this.timeChartTaskGrid6 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid6,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid6: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid6'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[5];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c6_1 = JSON.parse(response.responseText).data[0].y1;
                    c6_2 = JSON.parse(response.responseText).data[0].y2;
                    c6_3 = JSON.parse(response.responseText).data[0].y3;
                    c6_4 = JSON.parse(response.responseText).data[0].y4;
                    c6_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid6);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c6_1,
                    y2: c6_2,
                    y3: c6_3,
                    y4: c6_4,
                    y5: c6_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid6);
        }
    },
    //chart7
    onTimeChartRendered7: function () {
        var card = this.getView().up();
        chart = card.down('#realChart7');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData7();
        this.timeChartTask7 = Ext.TaskManager.start({
            run: this.addNewTimeData7,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData7: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart7'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[6];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c7_1 = JSON.parse(response.responseText).data[0].y1;
                    c7_2 = JSON.parse(response.responseText).data[0].y2;
                    c7_3 = JSON.parse(response.responseText).data[0].y3;
                    c7_4 = JSON.parse(response.responseText).data[0].y4;
                    c7_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask7);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c7_1,
                    y2: c7_2,
                    y3: c7_3,
                    y4: c7_4,
                    y5: c7_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask7);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid7: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid7');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid7();
        this.timeChartTaskGrid7 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid7,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid7: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid7'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[6];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c7_1 = JSON.parse(response.responseText).data[0].y1;
                    c7_2 = JSON.parse(response.responseText).data[0].y2;
                    c7_3 = JSON.parse(response.responseText).data[0].y3;
                    c7_4 = JSON.parse(response.responseText).data[0].y4;
                    c7_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid7);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c7_1,
                    y2: c7_2,
                    y3: c7_3,
                    y4: c7_4,
                    y5: c7_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid7);
        }
    },
    //chart8
    onTimeChartRendered8: function () {
        var card = this.getView().up();
        chart = card.down('#realChart8');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData8();
        this.timeChartTask8 = Ext.TaskManager.start({
            run: this.addNewTimeData8,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData8: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart8'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[7];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c8_1 = JSON.parse(response.responseText).data[0].y1;
                    c8_2 = JSON.parse(response.responseText).data[0].y2;
                    c8_3 = JSON.parse(response.responseText).data[0].y3;
                    c8_4 = JSON.parse(response.responseText).data[0].y4;
                    c8_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask8);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c8_1,
                    y2: c8_2,
                    y3: c8_3,
                    y4: c8_4,
                    y5: c8_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask8);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid8: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid8');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid8();
        this.timeChartTaskGrid8 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid8,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid8: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid8'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[7];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c8_1 = JSON.parse(response.responseText).data[0].y1;
                    c8_2 = JSON.parse(response.responseText).data[0].y2;
                    c8_3 = JSON.parse(response.responseText).data[0].y3;
                    c8_4 = JSON.parse(response.responseText).data[0].y4;
                    c8_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid8);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c8_1,
                    y2: c8_2,
                    y3: c8_3,
                    y4: c8_4,
                    y5: c8_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid8);
        }
    },
    //chart9
    onTimeChartRendered9: function () {
        var card = this.getView().up();
        chart = card.down('#realChart9');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData9();
        this.timeChartTask9 = Ext.TaskManager.start({
            run: this.addNewTimeData9,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData9: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart9'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[8];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c9_1 = JSON.parse(response.responseText).data[0].y1;
                    c9_2 = JSON.parse(response.responseText).data[0].y2;
                    c9_3 = JSON.parse(response.responseText).data[0].y3;
                    c9_4 = JSON.parse(response.responseText).data[0].y4;
                    c9_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask9);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c9_1,
                    y2: c9_2,
                    y3: c9_3,
                    y4: c9_4,
                    y5: c9_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask9);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid9: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid9');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid9();
        this.timeChartTaskGrid9 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid9,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid9: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid9'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[8];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c9_1 = JSON.parse(response.responseText).data[0].y1;
                    c9_2 = JSON.parse(response.responseText).data[0].y2;
                    c9_3 = JSON.parse(response.responseText).data[0].y3;
                    c9_4 = JSON.parse(response.responseText).data[0].y4;
                    c9_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid9);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c9_1,
                    y2: c9_2,
                    y3: c9_3,
                    y4: c9_4,
                    y5: c9_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid9);
        }
    },
    //chart10
    onTimeChartRendered10: function () {
        var card = this.getView().up();
        chart = card.down('#realChart10');
        var intervalTime = this.onCollect();
        chart.getStore().removeAll();
        this.addNewTimeData10();
        this.timeChartTask10 = Ext.TaskManager.start({
            run: this.addNewTimeData10,
            interval: intervalTime,
            scope: this
        });
    },
    //获取实时折线图数据
    addNewTimeData10: function () {
        var intervalTime = this.onCollect();
        var me = this,
            chart = me.getView().up().down('#realChart10'),
            store = chart.getStore(),
            count = store.getCount(),
            xAxis = chart.getAxes()[1],
            visibleRange = intervalTime * 50,//页面50个点，，
            second = intervalTime,//每个点之间相差秒
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[9];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c10_1 = JSON.parse(response.responseText).data[0].y1;
                    c10_2 = JSON.parse(response.responseText).data[0].y2;
                    c10_3 = JSON.parse(response.responseText).data[0].y3;
                    c10_4 = JSON.parse(response.responseText).data[0].y4;
                    c10_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTask10);
                    }
                }
            });
            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time') + second;
                if (time - me.startTime > visibleRange) {
                    me.startTime = time - visibleRange;
                    xAxis.setMinimum(this.startTime);
                    xAxis.setMaximum(time);
                }
                //动态设置chart单位
                axes = chart.getAxes();
                var title = axes[0].getTitle();
                title.text = unit;
                axes[0].setTitle(title);
                store.add({
                    time: time,
                    y1: c10_1,
                    y2: c10_2,
                    y3: c10_3,
                    y4: c10_4,
                    y5: c10_5
                });

            } else {
                chart.animationSuspended = true;
                me.startTime = Math.floor(Ext.Date.now() / second) * second;
                xAxis.setMinimum(me.startTime);
                xAxis.setMaximum(me.startTime + visibleRange);

                store.add({
                    time: this.startTime,
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
                chart.animationSuspended = false;
            };
        } else {
        	this.ontimeChartTask(timeChartTask10);
            var grid = me.getView().up().down('#realTimeTaskGrid');
            var id = this.taskId();
            var taskId = [id];
            var params = {
                taskStatus: 4,
                taskId: taskId,
                taskType: 1
            };
            Ext.Ajax.request({
                url: '/pmManagement/api/pmmng/pmTask/updateStatus',
                method: 'POST',
                jsonData: JSON.stringify(params),
                success: function () {
                    Ext.Msg.alert('提示', '操作成功'),
                        grid.getStore().reload();
                }
            })
        }
    },
    //折叠表格实时曲线图定时获取数据
    onTimeChartRenderedGrid10: function () {
        var intervalTime = this.onCollect();
        var card = this.getView().up();
        grid = card.down('#displayGrid10');
        grid.getStore().removeAll();
        this.addNewTimeDataGrid10();
        this.timeChartTaskGrid10 = Ext.TaskManager.start({
            run: this.addNewTimeDataGrid10,
            interval: intervalTime,
            scope: this
        });
    },

    //可折叠表格获取实时数据
    addNewTimeDataGrid10: function () {
        var intervalTime = this.onCollect();
        var me = this,
            grid = me.getView().up().down('#displayGrid10'),
            store = grid.getStore(),
            count = store.getCount(),
            second = intervalTime,
            time, lastRecord;
        var resourceIds = this.resourceIds();
        var metricId = this.metricIds()[0];
        var taskId = this.taskId();
        var params={resourceIds:resourceIds,metricId:metricId,taskId:taskId};
        var end = new Date(this.onEndTime());
        var longEnd = end.getTime();
        var now = new Date();
        var longNow = now.getTime();
        if (longNow < longEnd||this.onEndTime()==''||this.onEndTime()==null) {
            Ext.Ajax.request({
                url: "/pmManagement/api/pmmng/realTask/findRealData",//参数：指标id+任务id+资源id数组
                method: "POST",
                jsonData: JSON.stringify(params),
                success: function (response, action) {
                    c10_1 = JSON.parse(response.responseText).data[0].y1;
                    c10_2 = JSON.parse(response.responseText).data[0].y2;
                    c10_3 = JSON.parse(response.responseText).data[0].y3;
                    c10_4 = JSON.parse(response.responseText).data[0].y4;
                    c10_5 = JSON.parse(response.responseText).data[0].y5;
                    var statusFlag = JSON.parse(response.responseText).data[0].statusFlag;
                    if (statusFlag == true) {
                    	this.ontimeChartTask(timeChartTaskGrid10);
                    }
                }
            });

            if (count > 0) {
                lastRecord = store.getAt(count - 1);
                time = lastRecord.get('time');
                //获取time为String类型，转换为标准日期格式
                var timeLong = new Date(time);
                //日期格式转换为long类型
                timeLong = timeLong.getTime();
                store.add({
                    //将long类型的增加后，转换成标准日期格式
                    time: this.timeType(timeLong + second),
                    y1: c10_1,
                    y2: c10_2,
                    y3: c10_3,
                    y4: c10_4,
                    y5: c10_5
                });

            } else {
                store.add({
                    time: this.timeType(this.startTime),
                    y1: y1,
                    y2: y2,
                    y3: y3,
                    y4: y4,
                    y5: y5
                });
            };
        } else {
        	this.ontimeChartTask(timeChartTaskGrid10);
        }
    },
});
var y1 = 0; var y2 = 0; var y3 = 0; var y4 = 0; var y5 = 0; var unit = '%';
var c1_1 = 0; var c1_2 = 0; var c1_3 = 0; var c1_4 = 0; var c1_5 = 0;
var c2_1 = 0; var c2_2 = 0; var c2_3 = 0; var c2_4 = 0; var c2_5 = 0;
var c3_1 = 0; var c3_2 = 0; var c3_3 = 0; var c3_4 = 0; var c3_5 = 0;
var c4_1 = 0; var c4_2 = 0; var c4_3 = 0; var c4_4 = 0; var c4_5 = 0;
var c5_1 = 0; var c5_2 = 0; var c5_3 = 0; var c5_4 = 0; var c5_5 = 0;
var c6_1 = 0; var c6_2 = 0; var c6_3 = 0; var c6_4 = 0; var c6_5 = 0;
var c7_1 = 0; var c7_2 = 0; var c7_3 = 0; var c7_4 = 0; var c7_5 = 0;
var c8_1 = 0; var c8_2 = 0; var c8_3 = 0; var c8_4 = 0; var c8_5 = 0;
var c9_1 = 0; var c9_2 = 0; var c9_3 = 0; var c9_4 = 0; var c9_5 = 0;
var c10_1 = 0; var c10_2 = 0; var c10_3 = 0; var c10_4 = 0; var c10_5 = 0;
var timeChartTask1;var timeChartTask2;var timeChartTask3;var timeChartTask4;var timeChartTask5;
var timeChartTask6;var timeChartTask7;var timeChartTask8;var timeChartTask9;var timeChartTask10;
var timeChartTaskGrid1;var timeChartTaskGrid2;var timeChartTaskGrid3;var timeChartTaskGrid4;var timeChartTaskGrid5;
var timeChartTaskGrid6;var timeChartTaskGrid7;var timeChartTaskGrid8;var timeChartTaskGrid9;var timeChartTaskGrid10;

