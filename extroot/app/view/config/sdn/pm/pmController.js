Ext.define('Admin.view.config.sdn.pm.pmController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.pmCtl',
    /* requires: [
        'Admin.view.config.sdn.pm.cf1564View',
        'Admin.view.config.sdn.pm.pm1564View'
    ],*/

    //是否添加过采集任务
    task_da:[],
     
    //选中的行
    gridSelectItem:null,

    //业务开关是否打开
    taskSwitch:false,

    //pwList
    pwList:[],

    //阈值基线
    elineRange:[],

    //阈值备份
    elineRangeBackup:[],

    elineId:"",

    //获取阈值配置界面
    openRangeSetPanel:function (data) {

        var form = Ext.create('Ext.form.Panel', {
            itemId: 'pmForm_1',
            frame: true,
            bodyPadding: '40px 0 0',
            defaultType: 'textfield',
            fieldDefaults: {
                labelAlign: 'right',
                labelStyle: 'padding-right:5px;',
                msgTarget: 'side',
                padding:5
            },
            items: [
                {
                    xtype: "container",
                    layout : {
                        type : 'vbox',
                        align : 'middle',
                        pack : 'center'
                    },

                    items: [
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3">'+_('Availability(%)')+'</span>',
                                },
                                {
                                    xtype: 'numberfield',
                                    width:270,
                                    allowDecimals:false ,
                                    minValue: 1,
                                    maxValue: 99,
                                    allowBlank: false,
                                    fieldLabel: _('Upper threshold'),
                                    name: 'usability-up',
                                },
                                {
                                    xtype: 'numberfield',
                                    width:270,
                                    allowDecimals:false ,
                                    minValue: 1,
                                    maxValue: 99,
                                    allowBlank: false,
                                    fieldLabel: _('Recover upper threshold'),
                                    name: 'usability-up-recover'
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3">'+_('Time Delay(ns)')+'</span>',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    regex:/^-?\d+$/,
                                    regexText: _('Please enter an integer'),
                                    allowBlank: false,
                                    fieldLabel: _('Upper threshold'),
                                    name: 'time-delay-high',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    regex:/^-?\d+$/,
                                    regexText: _('Please enter an integer'),
                                    allowBlank: false,
                                    fieldLabel: _('Recover upper threshold'),
                                    name: 'time-delay-high-recover'
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3">'+_('Jitter(ms)')+' </span>',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    regex:/^-?\d+$/,
                                    regexText: _('Please enter an integer'),
                                    allowBlank: false,
                                    fieldLabel: _('Upper threshold'),
                                    name: 'shake-high',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    regex:/^-?\d+$/,
                                    regexText: _('Please enter an integer'),
                                    allowBlank: false,
                                    fieldLabel: _('Recover upper threshold'),
                                    name: 'shake-high-recover'
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3">'+_('LossRate(%)')+'</span>',
                                },
                                {
                                    xtype: 'numberfield',
                                    width:270,
                                    allowBlank: false,
                                    allowDecimals: true,
                                    decimalPrecision: 5,
                                    regex:/^[-]?\d*\.?\d{0,5}$/,
                                    regexText: _('Enter a decimal number that requires five decimal places'),
                                    fieldLabel: _('Lower threshold'),
                                    name: 'package-loss-rate'
                                },
                                {
                                    xtype: 'numberfield',
                                    width:270,
                                    allowBlank: false,
                                    allowDecimals: true,
                                    decimalPrecision: 5,
                                    regex:/^[-]?\d*\.?\d{0,5}$/,
                                    regexText: _('Enter a decimal number that requires five decimal places'),
                                    fieldLabel: _('Recover lower threshold'),
                                    name: 'package-loss-rate-recover',
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3">'+_('Bandwidth (kbps)')+'</span>',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    regex:/^-?\d+$/,
                                    regexText: _('Please enter an integer'),
                                    allowBlank: false,
                                    fieldLabel: _('Lower threshold'),
                                    name: 'bandwidth-low',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    regex:/^-?\d+$/,
                                    regexText: _('Please enter an integer'),
                                    allowBlank: false,
                                    fieldLabel: _('Recover lower threshold'),
                                    name: 'bandwidth-low-recover'
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3">'+_('Bandwidth rate(%)')+'</span>',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    minValue: 1,
                                    maxValue: 99,
                                    allowBlank: false,
                                    fieldLabel: _('Upper threshold'),
                                    name: 'bandwidth-rate-up',
                                },
                                {
                                    xtype: 'numberfield',
                                    allowDecimals:false ,
                                    width:270,
                                    minValue: 1,
                                    maxValue: 99,
                                    allowBlank: false,
                                    fieldLabel: _('Recover upper threshold'),
                                    name: 'bandwidth-rate-up-recover'
                                }
                            ]
                        }
                    ]
                },
            ],
            buttons: [
                {
                    text: _('Cancle'),
                    iconCls: 'x-fa fa-remove',
                    handler: function() {this.up('window').close();}
                },
                {
                    text: _('Submit'),
                    iconCls: 'x-fa fa-save',
                    handler: function() {
                        var win = this.up('window');
                        var form = this.up('form').getForm();

                        if (!form.isValid()) {
                            Ext.MessageBox.alert(_('Tips'), _('Incorrect input parameter'));
                            return;
                        }

                        var formValues = form.getValues();
                        var input={
                            "usability":{
                                "usability-threshold-up":formValues["usability-up"],
                                "usability-threshold-up-recover":formValues["usability-up-recover"]
                            },
                            "time-delay":{
                                "time-delay-threshold-high":formValues["time-delay-high"],
                                "time-delay-threshold-high-recover":formValues["time-delay-high-recover"]
                            },
                            "shake":{
                                "shake-threshold-high":formValues["shake-high"],
                                "shake-threshold-high-recover":formValues["shake-high-recover"]
                            },
                            "package-loss-rate":{
                                "package-loss-rate-threshold-high":formValues["package-loss-rate"],
                                "package-loss-rate-threshold-high-recover":formValues["package-loss-rate-recover"]
                            },
                            "bandwidth":{
                                "bandwidth-threshold-low":formValues["bandwidth-low"],
                                "bandwidth-threshold-low-recover":formValues["bandwidth-low-recover"]
                            },
                            "bandwidth-rate":{
                                "bandwidth-rate-threshold-up":formValues["bandwidth-rate-up"],
                                "bandwidth-rate-threshold-up-recover":formValues["bandwidth-rate-up-recover"]
                            },
                        };

                        Ext.create('Ext.form.Panel', {
                            items: [
                                // {xtype: 'hidden', name: 'nes', value: nes}
                            ]
                        }).getForm().submit({
                            url: '/config/sdn/pmService/set-eline-threshold',
                            params: input,
                            jsonSubmit:true,
                            success: function(form, action) {
                                win.close();
                                Ext.MessageBox.alert(_('Tips'),_('Success'));
                            },
                            failure: function(form, action) {
                                Ext.MessageBox.alert(_('Tips'),_('Failed'));
                            }
                        });
                    }
                }
            ]
        });

        if(data)
            form.getForm().setValues(data);

        var win = Ext.widget('window', {
            title: _('Threshold configuration'),
            iconCls: 'x-fa fa-cog',
            border: false,
            layout: 'fit',
            width: 720,
            height: 450,
            resizable: true,
            modal: true,
            items: form
        });
        win.show();
    },

    //跟据网元Id获取网元名称
    getNodeUserLabelById: function(nodeId) {
        var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
        var label = "";
        if (sdn_node_id_list.indexOf(nodeId) !== -1) { //sdn设备
            label = SdnSvc.getNodeUserLabelById(nodeId, 'sdn');
        } else { //外部节点 传统设备
            label = SdnSvc.getNodeUserLabelById(nodeId, 'ext');
        }
        return label;
    },

    //跟据网元id获取端口
    getPortUserLabel:function(nodeId, ltpId) {
        var sdn_node_id_list = SdnSvc.getSdnNodeIdList();
        var label = "";
        if (sdn_node_id_list.indexOf(nodeId) !== -1) { //sdn设备
            label = SdnSvc.getPortUserLabelById(nodeId, ltpId, 'sdn');
        } else { //外部节点 传统设备
            label = SdnSvc.getPortUserLabelById(nodeId, ltpId, 'ext');
        }
        return label;
    },

    //获取业务状态
    getElineStatus:function(){
        var me=this;
        Ext.Ajax.request({
            url:'/config/sdn/pmService/elines-status',
            success:function(response, opts){
                var obj = Ext.decode(response.responseText);
                if (obj.data == "enable") {
                    me.taskSwitch = true;
                    Ext.get("pm-checkbox-11-2").dom.checked=true;
                } else if (obj.data == "close") {
                    me.taskSwitch = false;
                    Ext.get("pm-checkbox-11-2").dom.checked=false;
                }
            },
            failure:function(response, opts){

            }
        });
    },

    //设置ElineStatus状态
    setElineStatus:function(input){
        var me = this;
        Ext.Ajax.request({
            url:'/config/sdn/pmService/set-elines-status',
            method : 'post',
            params : {"business-statistics-switch": input},
            success:function(response, opts){
                if(me.gridSelectItem){
                    me.updateDockedItems(me.gridSelectItem);
                }
                console.log(_('Success'));
            },
            failure:function(response, opts){
                Ext.MessageBox.alert(_('Tip'),_('Failed'));
            }
        });
    },

    //获取查询条件
    getCondition:function(){
        var me = this;
        var panel=me.lookupReference("pmChartDockedItems");
        var kpiValue=panel.down("#pmKpiSelect").value;
        var startTime=panel.down("#pmStartTime").rawValue;
        var endTime=panel.down("#pmEndTime").rawValue;
        return {
            kpi:kpiValue,
            sTime:startTime,
            eTime:endTime
        }
    },

    //获取图表的查询数据
    getPwList:function(elineId){
        var me = this;
        Ext.Ajax.request({
            url:'/config/sdn/pmService/eline/'+elineId,
            async:false,
            success:function(response,opts){
                var obj=Ext.decode(response.responseText);
                me.pwList=obj.data;
            },
            failure:function(response,opts){
                me.pwList=[];
            }
        });
    },

    //获取阈值基线
    getElineThreshold:function(condition){
        var result =[];
        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-eline-threshold',
            method : 'post',
            jsonData : condition,
            async:false,
            success:function(response, opts){
                var obj = Ext.decode(response.responseText);
                if(obj.data && obj.data.length >0 ){
                    result= JSON.parse(obj.data);
                    result= result.output;
                }
                var str=' {"output": {"usability": {"usability-threshold-up": 80,"usability-threshold-up-recover": 70},"bandwidth-rate": {"bandwidth-rate-threshold-up-recover": 70,"bandwidth-rate-threshold-up": 80},"time-delay": {"time-delay-threshold-high": 80000,"time-delay-threshold-high-recover": 60000},"bandwidth": {"bandwidth-threshold-low-recover": 15000,"bandwidth-threshold-low": 10000},"shake": {"shake-threshold-high": 40000,"shake-threshold-high-recover": 30000},"package-loss-rate": {"package-loss-rate-threshold-high": 0.00025,"package-loss-rate-threshold-high-recover": 0.0001}}}'
                result= JSON.parse(str).output;
            },
            failure:function(response, opts){
                console.log("执行 get-eline-threshold 失败")
            }
        });
        return result;
    },

    //获取指定的Eline数据
    getSpecialElineData:function(condition){
        var datas=[];
        var result=[];
        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-pm-special-business-data',
            method : 'post',
            jsonData : condition,
            async:false,
            success:function(response, opts){
                var obj = Ext.decode(response.responseText);
                if(!(obj.data && obj.data.length >0))
                    result= [];
                else
                    result= JSON.parse(obj.data);

                var str='{"output":{"pm-special-business-data":[{"shake":2000,"ne-id":"openflow:50","bandwidth-usage":0,"availability":0,"packet-loss-rate":0.000015,"packet-loss-rate-z":0.000020,"delay-time":20000,"availability-z":0,"des-ne-id":"openflow:51","bandwidth":505055,"bandwidth-usage-z":0,"collect-time":"2017-08-19 17:20:00.0","bandwidth-z":30000,"bussness-id":"100"},{"shake":0,"ne-id":"openflow:4044627091849216","bandwidth-usage":0,"availability":0,"packet-loss-rate":0,"packet-loss-rate-z":0,"delay-time":0,"availability-z":0,"des-ne-id":"openflow:22","bandwidth":505055,"bandwidth-usage-z":0,"collect-time":"2017-08-19 17:20:00.0","bandwidth-z":0,"bussness-id":"100"}]}}';
                result= JSON.parse(str).output["pm-special-business-data"];

            },
            failure:function(response, opts){
                console.log("执行 get-pm-special-business-data 失败")
            }
        });

        var len =result.length, time = "",
            data1 = [], data2 = [], data3 = [], data4 = [], data5 = [],
            data6 = [], data7 = [], data8 = [], data9 = [], data10 = [];
        for (var i = 0; i < len; i++) {
            time = result[i]["collect-time"];
            data1.push({"label":time,"value":result[i]["packet-loss-rate"]});
            data2.push({"label":time,"value":result[i]["packet-loss-rate-z"]});
            data3.push({"label":time,"value":result[i]["shake"]});
            data4.push({"label":time,"value":result[i]["delay-time"]});
            data5.push({"label":time,"value":result[i]["bandwidth"]});
            data6.push({"label":time,"value":result[i]["bandwidth-z"]});
            data7.push({"label":time,"value":result[i]["bandwidth-usage"]});
            data8.push({"label":time,"value":result[i]["bandwidth-usage-z"]});
            data9.push({"label":time,"value":result[i]["availability"]});
            data10.push({"label":time,"value":result[i]["availability-z"]});
        }
        var sortFun= function(a,b){return a["value"] - b["value"]};
        data1.sort(sortFun);
        data2.sort(sortFun);
        data3.sort(sortFun);
        data4.sort(sortFun);
        data5.sort(sortFun);
        data6.sort(sortFun);
        data7.sort(sortFun);
        data8.sort(sortFun);
        data9.sort(sortFun);
        data10.sort(sortFun);
        if(data1.length==0)
            data1=[{"label":"","value":0}];
        if(data2.length==0)
            data2=[{"label":"","value":0}];
        if(data3.length==0)
            data3=[{"label":"","value":0}];
        if(data4.length==0)
            data4=[{"label":"","value":0}];
        if(data5.length==0)
            data5=[{"label":"","value":0}];
        if(data6.length==0)
            data6=[{"label":"","value":0}];
        if(data7.length==0)
            data7=[{"label":"","value":0}];
        if(data8.length==0)
            data8=[{"label":"","value":0}];
        if(data9.length==0)
            data9=[{"label":"","value":0}];
        if(data10.length==0)
            data10=[{"label":"","value":0}];
        datas = [data1,data2,data3,data4,data5,data6,data7,data8,data9,data10];
        return datas;
    },

    //整理生成的基线数据
    getBaseLineData:function(output){

        if(output.length==0)
            return [];
        var upText=_('Upper Threshold'),//阈值上限
            downText=_('Lower Threshold');//阈值下限

        var baseLineData=[];

        var threshold1 = {};
        threshold1.recover = output['package-loss-rate']['package-loss-rate-threshold-high-recover'];
        threshold1.up = output['package-loss-rate']['package-loss-rate-threshold-high'];
        threshold1.text=upText;
        baseLineData.push(threshold1);

        var threshold2 = {};
        threshold2.recover = output['package-loss-rate']['package-loss-rate-threshold-high-recover'];
        threshold2.up = output['package-loss-rate']['package-loss-rate-threshold-high'];
        threshold2.text=upText;
        baseLineData.push(threshold2);

        var threshold3 = {};
        threshold3.up = output.shake['shake-threshold-high'];
        threshold3.recover = output.shake['shake-threshold-high-recover'];
        threshold3.text=upText;
        baseLineData.push(threshold3);

        var threshold4 = {};
        threshold4.up = output['time-delay']['time-delay-threshold-high'];
        threshold4.recover = output['time-delay']['time-delay-threshold-high-recover'];
        threshold4.text=upText;
        baseLineData.push(threshold4);

        var threshold5 = {};
        threshold5.down = output.bandwidth['bandwidth-threshold-low'];
        threshold5.recover = output.bandwidth['bandwidth-threshold-low-recover'];
        threshold5.text=downText;
        baseLineData.push(threshold5);

        var threshold6 = {};
        threshold6.down = output.bandwidth['bandwidth-threshold-low'];
        threshold6.recover = output.bandwidth['bandwidth-threshold-low-recover'];
        threshold6.text=downText;
        baseLineData.push(threshold6);

        var threshold7 = {};
        threshold7.up = output['bandwidth-rate']['bandwidth-rate-threshold-up'];
        threshold7.recover = output['bandwidth-rate']['bandwidth-rate-threshold-up-recover'];
        threshold7.text=upText;
        baseLineData.push(threshold7);

        var threshold8 = {};
        threshold8.up = output['bandwidth-rate']['bandwidth-rate-threshold-up'];
        threshold8.recover = output['bandwidth-rate']['bandwidth-rate-threshold-up-recover'];
        threshold8.text=upText;
        baseLineData.push(threshold8);

        var threshold9 = {};
        threshold9.up = output.usability['usability-threshold-up'];
        threshold9.recover = output.usability['usability-threshold-up-recover'];
        threshold9.text=upText;
        baseLineData.push(threshold9);

        var threshold10 = {};
        threshold10.up = output.usability['usability-threshold-up'];
        threshold10.recover = output.usability['usability-threshold-up-recover'];
        threshold10.text=upText;
        baseLineData.push(threshold10);

        return baseLineData;
    },

    //获取指定指标的值
    getChartThreshold:function(baseThis,chartIndex,title){
        var base = baseThis;
        switch(chartIndex){
            case 1:
            case 2: /*丢包率*/
                base.getChartThresholdByAjax(base,"PackageLossRatethreshold", "package-loss-rate","get-package-loss-rate-business-threshold",title,base.showSpecialThreshold);
                break;
            case 3:/*抖动*/
                base.getChartThresholdByAjax(base,"Shakethreshold", "shake","get-shake-business-threshold",title,base.showSpecialThreshold);
                break;
            case 4: /*延时*/
                base.getChartThresholdByAjax(base,"TimeDelaythreshold", "time-delay","get-time-delay-business-threshold",title,base.showSpecialThreshold);
                break;
            case 5:
            case 6: /*带宽*/
                base.getChartThresholdByAjax(base,"Bandwidththreshold", "bandwidth","get-bandwidth-business-threshold",title,base.showSpecialThreshold);
                break;
            case 7:
            case 8:/*带宽利用率*/
                base.getChartThresholdByAjax(base,"BandwidthRatethreshold", "bandwidth-rate","get-bandwidth-rate-business-threshold",title,base.showSpecialThreshold);
                break;
            case 9:
            case 10: /*带宽*/
                base.getChartThresholdByAjax(base,"Availabilitythreshold", "usability","get-usability-business-threshold",title,base.showSpecialThreshold);
                break;
            default:break;
        }
    },

    //通过Ajax获取数据
    getChartThresholdByAjax:function(base,sModalId,sType,serviceName,title,callback){
        var input={
            input: {
            'eline-id': base.elineId,
            'extension-id': "0"
            },
            service:serviceName,
        }

        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-special-business-threshold',
            method : 'post',
            jsonData : input,
            success:function(response, opts){
                console.log(sModalId+"设置成功");
                var obj = Ext.decode(response.responseText);
                if(obj.data && obj.data.length >0 ){
                  var result= JSON.parse(obj.data);
                  callback(sModalId,sType,title,obj.data)
                }
                else {
                    Ext.MessageBox.alert(_('Tip'), _('Returned data is incorrect'));
                }
            },
            failure:function(response, opts){
                Ext.MessageBox.alert(_('Tip'), _('Fail to set the metric'));
            }
        });
        //var str='{"output":{"usability":{"usability-threshold-up":20,"usability-threshold-up-recover":60},"bandwidth-rate":{"bandwidth-rate-threshold-up-recover":70,"bandwidth-rate-threshold-up":80},"time-delay":{"time-delay-threshold-high":50,"time-delay-threshold-high-recover":45},"bandwidth":{"bandwidth-threshold-low-recover":15000,"bandwidth-threshold-low":10000},"shake":{"shake-threshold-high":40000,"shake-threshold-high-recover":30000},"package-loss-rate":{"package-loss-rate-threshold-high":0.00025,"package-loss-rate-threshold-high-recover":0.0001}}}';
        //callback(base,sModalId,sType,title,JSON.parse(str));
    },

    //显示性能指标配置界面
    showSpecialThreshold:function(base,sModalId,sType,title,data){
        var upTitle = _('Upper Threshold'),//"阈值上限",
            recoverTitle=_('Recover Upper Threshold'),//"恢复阈值上限",
            regx=/^(99|[1-9]\\d|\\d)$/,
            valueUp=0,valueRecover=0,
            xtype='numberfield'
        var output=data.output;

        switch(sModalId){
            case "PackageLossRatethreshold":
                regx=/^[-]?\d*\.?\d{0,5}$/;
                valueRecover = output['package-loss-rate']['package-loss-rate-threshold-high-recover'];
                valueUp= output['package-loss-rate']['package-loss-rate-threshold-high'];
                xtype='textfield'
                break;
            case "Shakethreshold":
                regx=/^-?\d+$/;
                valueUp = output.shake['shake-threshold-high'];
                valueRecover = output.shake['shake-threshold-high-recover'];
                break;
            case "TimeDelaythreshold":
                regx=/^-?\d+$/;
                valueUp = output['time-delay']['time-delay-threshold-high'];
                valueRecover = output['time-delay']['time-delay-threshold-high-recover'];
                break;
            case "Bandwidththreshold":
                regx=/^-?\d+$/;
                upTitle = _('Lower Threshold');//"阈值下限";
                recoverTitle=_('Recover Lower Threshold');//"恢复阈值下限";
                valueUp = output.bandwidth['bandwidth-threshold-low'];
                valueRecover = output.bandwidth['bandwidth-threshold-low-recover'];
                break;
            case "BandwidthRatethreshold":
                regx=/^(99|[1-9]\d|\d)$/;
                valueUp = output['bandwidth-rate']['bandwidth-rate-threshold-up'];
                valueRecover = output['bandwidth-rate']['bandwidth-rate-threshold-up-recover'];
                break;
            case "Availabilitythreshold":
                regx=/^(99|[1-9]\d|\d)$/;
                valueUp = output.usability['usability-threshold-up'];
                valueRecover = output.usability['usability-threshold-up-recover'];
                break;
        }

        var formData={ "valueUp":valueUp,"valueRecover":valueRecover};

        var form = Ext.create('Ext.form.Panel', {
            frame: true,
            bodyPadding: '20px 0 0',
            defaultType: 'textfield',
            fieldDefaults: {
                labelAlign: 'right',
                labelStyle: 'padding-right:5px;',
                msgTarget: 'side',
                padding:5
            },
            items: [
                {
                    xtype: "container",
                    layout : {
                        type : 'vbox',
                        align : 'middle',
                        pack : 'center'
                    },

                    items: [
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3"> '+title+' </span>',
                                },
                                {
                                    xtype: xtype,
                                    width:270,
                                    regex:regx,
                                    regexText: _('Please enter the correct data type'),
                                    allowBlank: false,
                                    fieldLabel: upTitle,
                                    name: 'valueUp',
                                }
                            ]
                        },
                        {
                            xtype: "container",
                            layout: "hbox",
                            items:[
                                {
                                    xtype: 'label',
                                    width:120,
                                    html: '<span style="font-weight: 700;line-height: 3"></span>',
                                },
                                {
                                    xtype: xtype,
                                    width:270,
                                    regex:regx,
                                    regexText: _('Please enter the correct data type'),
                                    allowBlank: false,
                                    fieldLabel: recoverTitle,
                                    name: 'valueRecover'
                                }
                            ]

                        }
                    ]
                },
            ],
            buttons: [
                {
                    text: _('Cancle'),
                    iconCls: 'x-fa fa-remove',
                    handler: function() {this.up('window').close();}
                },
                {
                    text: _('Submit'),
                    iconCls: 'x-fa fa-save',
                    handler: function() {
                        var win = this.up('window');
                        var form = this.up('form').getForm();

                        if (!form.isValid()) {
                            Ext.MessageBox.alert(_('Tip'), _('Incorrect input parameter'));
                            return;
                        }

                        var formValues = form.getValues();
                        var obj={},serviceName="";
                        switch(sModalId){
                            case "PackageLossRatethreshold":
                                obj= {
                                    'package-loss-rate-threshold-high-recover':formValues["valueRecover"],
                                    'package-loss-rate-threshold-high':formValues["valueUp"],
                                };
                                serviceName ='update-package-loss-rate-business-threshold';
                                break;
                            case "Shakethreshold":
                                obj= {
                                    'shake-threshold-high':formValues["valueUp"],
                                    'shake-threshold-high-recover':formValues["valueRecover"],
                                };
                                serviceName ='update-shake-business-threshold';
                                break;
                            case "TimeDelaythreshold":
                                obj= {
                                    'time-delay-threshold-high':formValues["valueUp"],
                                    'time-delay-threshold-high-recover':formValues["valueRecover"],
                                }
                                break;
                            case "Bandwidththreshold":
                                obj= {
                                    'bandwidth-threshold-low':formValues["valueUp"],
                                    'bandwidth-threshold-low-recover':formValues["valueRecover"],
                                };
                                serviceName ='update-bandwidth-business-threshold';
                                break;
                            case "BandwidthRatethreshold":
                                obj= {
                                    'bandwidth-rate-threshold-up':formValues["valueUp"],
                                    'bandwidth-rate-threshold-up-recover':formValues["valueRecover"],
                                };
                                serviceName ='update-bandwidth-rate-business-threshold';
                                break;
                            case "Availabilitythreshold":
                                obj= {
                                    'usability-threshold-up':formValues["valueUp"],
                                    'usability-threshold-up-recover':formValues["valueRecover"],
                                };
                                serviceName ='update-usability-business-threshold';
                                break;
                        }

                        base.elineRange[sType]=obj;

                        var params = {
                            'eline-id':base.elineId,
                            'extension-id': "0"
                        }
                        Ext.apply(params,obj);

                        var input={
                            input: params,
                            service:serviceName
                        }

                        //更新阈值
                        Ext.Ajax.request({
                            url:'/config/sdn/pmService/update-special-business-threshold',
                            method : 'post',
                            jsonData : input,
                            success:function(response, opts){
                                win.close();
                                base.onChartSearch(base);
                            },
                            failure:function(response, opts){
                                Ext.MessageBox.alert(_('Tip'), _('Failed'));
                                //console.log("更新指标阈值失败！")
                            }
                        });
                    }
                }
            ]
        });

        form.getForm().setValues(formData);

        var win = Ext.widget('window', {
            title: _('Threshold Configuration'),
            iconCls: 'x-fa fa-cog',
            border: false,
            layout: 'fit',
            width: 540,
            height: 200,
            resizable: true,
            modal: true,
            items: form
        });
        win.show();

    },
     
    //更新工具栏按钮的可用性
    updateDockedItems:function(selections){
        var me = this;

        var dockedItems = me.lookupReference('pmDockedItems');
        if(!dockedItems)
            return;

        var elineId=selections[0].get('eline-id'),
            cir = selections[0].get('cir'),
            eir = selections[0].get('eir');

        if(me.task_da.indexOf(elineId) >-1 && me.taskSwitch){
            dockedItems.down("#pmLineChart").setDisabled(false);
            if(cir && eir)
                dockedItems.down("#cfBarChart1564").setDisabled(false);
            dockedItems.down("#pmBarChart1564").setDisabled(false);
        }
        else{
            dockedItems.down("#pmLineChart").setDisabled(true);
            dockedItems.down("#cfBarChart1564").setDisabled(true);
            dockedItems.down("#pmBarChart1564").setDisabled(true);
        }

    },

    //界面渲染完成事件
    onAfterRender:function(){
        var me = this;
        me.task_da=[];
        me.getElineStatus();

        var store=Ext.data.StoreManager.lookup('pm_task_store');
        Ext.Ajax.request({
            url: '/config/sdn/pmService/elines',
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(!(obj.data) || obj.data.length==0){
                    return;
                }

                var result = JSON.parse(obj.data);
                    aElineData = [],len=0;

                result = result.service.eline;
                if(!result)
                    return;
                len = result.length;

                for (var i = 0; i < len; i++) {
                    var oElineData = {
                        'eline-id': result[i].id,
                        'user-label': result[i]['user-label'],
                        'name': result[i]['name']
                    };
                    if ("qos" in result[i].pw[0]) {
                        oElineData['cir'] = result[i].pw[0]['qos']['qos-a2z-cir'];
                        oElineData['eir'] = result[i].pw[0]['qos']['qos-a2z-pir'] - result[i].pw[0]['qos']['qos-a2z-cir'];
                    }
                    var aXc = result[i].pw[0].route[0].xc;
                    var aXcLength = aXc.length;

                    if (aXcLength >= 2) {
                        oElineData['source-ne-id'] = me.getNodeUserLabelById(aXc[0]['ne-id']);
                        oElineData['source-port'] = me.getPortUserLabel(aXc[0]['ne-id'], aXc[0]['ingress-ltp-id']);
                        oElineData['destination-ne-id'] = me.getNodeUserLabelById(aXc[aXcLength - 1]['ne-id']);
                        oElineData['destination-port'] = me.getPortUserLabel(aXc[aXcLength - 1]['ne-id'], aXc[aXcLength - 1]['egress-ltp-id']);
                    } else if (aXcLength === 1) {
                        oElineData['source-ne-id'] = me.getNodeUserLabelById(aXc[0]['ne-id']);
                        oElineData['source-port'] = me.getPortUserLabel(aXc[0]['ne-id'], aXc[0]['ingress-ltp-id']);
                    }

                    aElineData.push(oElineData);
                }

                /*for(i=0;i<20;i++){
                    var oElineData = {
                        'eline-id': aElineData[0].id+i,
                        'user-label': aElineData[0]['user-label']+i,
                        'name': aElineData[0]['name']+i
                    };
                    oElineData['source-ne-id'] = aElineData[0]["source-ne-id"]+i;
                    oElineData['source-port'] = aElineData[0]['source-port']+i;
                    oElineData['destination-ne-id'] = aElineData[0]['destination-ne-id']+i;
                    oElineData['destination-port']=aElineData[0]['destination-port']+i;
                    aElineData.push(oElineData);
                }*/

                store.removeAll();
                store.loadData(aElineData);
            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },

    //业务开关设置
    onSwitchRender:function(){
        var me=this;
        Ext.get("pm-checkbox-11-2").on('click',function(event,eOpts){
            var input="close";
            if(eOpts && eOpts.checked==true){
                input="enable";
            }
            me.taskSwitch = input=="enable" ? true : false;
            me.setElineStatus(input);
        });
    },

    //业务过滤
    onFilterTextChange:function(event,eOpts){
        var store=Ext.data.StoreManager.lookup('pm_task_store');
        store.clearFilter();

        if(eOpts !=""){
            store.filterBy(function(record){
                return record.get('name').indexOf(eOpts) >-1
            });
        }
    },

    //阈值设置
    onRangeSetting:function () {
        var me=this;
        Ext.Ajax.request({
            url: '/config/sdn/pmService/eline-threshold',
            success:function (response, opts) {
                var obj = Ext.decode(response.responseText);
                var threshold = obj.data;
                var data = {};
                if (!(threshold && threshold.length && threshold.length == 0)) {
                    me.openRangeSetPanel(data);
                    return;
                }
                threshold = JSON.parse(threshold).output;
                data= {
                    'usability-up': threshold.usability['usability-threshold-up'],
                    'usability-up-recover': threshold.usability['usability-threshold-up-recover'],
                    'time-delay-high': threshold['time-delay']['time-delay-threshold-high-recover'],
                    'time-delay-high-recover': threshold['time-delay']['time-delay-threshold-high-recover'],
                    'shake-high': threshold.shake['shake-threshold-high'],
                    'shake-high-recover': threshold.shake['shake-threshold-high-recover'],
                    'package-loss-rate': threshold['package-loss-rate']['package-loss-rate-threshold-high'],
                    'package-loss-rate-recover': threshold['package-loss-rate']['package-loss-rate-threshold-high-recover'],
                    'bandwidth-low': threshold.bandwidth['bandwidth-threshold-low'],
                    'bandwidth-low-recover': threshold.bandwidth['bandwidth-threshold-low-recover'],
                    'bandwidth-rate-up': threshold['bandwidth-rate']['bandwidth-rate-threshold-up'],
                    'bandwidth-rate-up-recover': threshold['bandwidth-rate']['bandwidth-rate-threshold-up-recover'],
                };

                me.openRangeSetPanel(data);
            },
            failure:function (response, opts) {

            }
        });
    },

    //任务列表选择事件
    onSelectionChange:function(sm, selections){
        var me = this;

        me.gridSelectItem = selections;
        me.updateDockedItems(me.gridSelectItem);
    },

    //添加数据采集
    onAddDA:function(){
        var me = this;

        var grid = me.lookupReference('taskPmGrid'),
            rec = grid.getSelectionModel().getSelection()[0];

        var elineId = rec.get('eline-id');
        var input={
            "business-id": elineId,
            "collect-intervals": "5",
            "collect-metric": ["bandwidth"]
        }
        Ext.Ajax.request({
            url:'/config/sdn/pmService/add-pm-task',
            method : 'post',
            jsonData : input,
            success:function(response, opts){
                console.log("添加采集任务成功");
                me.task_da.push(elineId);
                me.updateDockedItems(me.gridSelectItem);
                //Ext.MessageBox.alert("提示", "添加采集任务成功!");
            },
            failure:function(response, opts){
                Ext.MessageBox.alert(_('Tip'), _('Fail to add the collection task'));
            }
        });
    },

    //返回主界面
    goBack:function(){
        this.getView().setActiveItem(0);
    },

    //导出excel
    onExportExcel:function(elineId){
        var me = this;

        if(me.elineId =="")
            return;

        var input={},
            condition = me.getCondition();

        if(condition.kpi != 'all'){
            input={
                "input": {
                    "business-id": me.elineId, 
                    "start-time": condition.sTime, 
                    "end-time": condition.eTime, 
                    "query-type": condition.kpi 
                },
                type:1
            }
        }
        else{
             input={
                "input": {
                    "business-id": me.elineId, 
                    "start-time": condition.sTime, 
                    "end-time": condition.eTime
                },
                type:2
            }
        }

        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-pm-excel',
            method : 'post',
            jsonData : input,
            success:function(response, opts){
                console.log("export excel success!");
                var obj = Ext.decode(response.responseText),
                    filePath = obj.data;
                if(filePath){
                    var lastIndex = filePath.lastIndexOf("/"),
                        host = window.location.hostname,
                        ftpUrl = host + filePath.substring(lastIndex);
                    window.location = "ftp://" + ftpUrl; 
                }
            },
            failure:function(response, opts){
                console.log("export pdf failure !");
            }
        });
    },

    //Y1564配置导出Excel
    onExportExcel1564:function(){

    },

    //Y1564性能导出Excel
    onExportExcelPm1564:function(){
        
    },
    //导出pdf
    onExportPdf:function(){
        var me = this;

        if(me.elineId =="")
            return;

        var input,
            condition = me.getCondition();

        if(condition.kpi != 'all') {
             input = { 
                "business-id": me.elineId, 
                "start-time": condition.sTime, 
                "end-time": condition.eTime, 
                "query-type": condition.kpi };

        }
        if(!input)
            return;
        
        Ext.Ajax.request({
            url:'/config/sdn/pmService/get-pm-pdf',
            method : 'post',
            jsonData : input,
            success:function(response, opts){
                console.log("export excel success!");
                var obj = Ext.decode(response.responseText),
                    filePath = obj.data;
                if(filePath){
                    var lastIndex = filePath.lastIndexOf("/"),
                        host = window.location.hostname,
                        ftpUrl = host + filePath.substring(lastIndex);
                    window.location = "ftp://" + ftpUrl; 
                }
            },
            failure:function(response, opts){
                console.log("export excel failure!");
            }
        });
    },

    //Y1564配置导出PDF
    onExportPdf1564:function(){

    },

    //Y1564性能导出PDF
    onExportPdfPm1564:function(){

    },

    //显示图表
    showLineChart:function(){
        var me=this;
        var panel=this.lookupReference("pmChartPanel");
            grid = this.lookupReference('taskPmGrid'),
            rec = grid.getSelectionModel().getSelection()[0];

        me.elineId = rec.get('eline-id');
        //me.elineId='3153fd88-9206-40be-9506-40f99e92041d';

        panel.setTitle("业务性能图表"+" - " +rec.get('name'));

        this.getView().setActiveItem(1);
        this.onChartSearch();
    },

    //性能图表界面的查询事件
    onChartSearch:function(base){
        var me = this;
        if(base && base.elineId)
            me = base;
        var condition =me.getCondition();
        if(!condition.sTime || !condition.eTime) {
            Ext.MessageBox.alert(_('Tip'),_('The query time cannot be empty'));
            return;
        }
        if(condition.sTime>condition.eTime){
            Ext.MessageBox.alert(_('Tip'),_('The start time must not be greater than the end time'));
            return;
        }
        //getPwList(condition);
        me.elineRangeBackup=me.elineRange=me.getElineThreshold({
            'eline-id': me.elineId,
            'extension-id': "0"
        });
        var baseLineData = me.getBaseLineData(me.elineRange);
        var chartData = me.getSpecialElineData({
            "business-id": me.elineId,
            "start-time": condition.sTime,
            "end-time": condition.eTime
        });

        var panel = this.lookupReference('pmChartPanel');

        //给图表重新加载Store
        for(var i=0;i<10;i++){
            var chart=panel.down("[reference='pm_chart_"+(i+1)+"']");
            if(!chart)
                continue;

            chart.chartIndex=i+1;
            chart.baseThis = me;
            chart.callback=me.getChartThreshold;

            var xAxis = chart.getAxes()[0],
                limits = xAxis.getLimits(),
                len = chartData[i].length;

            if(baseLineData.length >0) {

                var maxOrMinValue = (baseLineData[i].up) ? baseLineData[i].up : baseLineData[i].down;
                var maxNum = (maxOrMinValue > chartData[i][len - 1].value) ? maxOrMinValue : chartData[i][len - 1].value;

                if (baseLineData[i].up) {
                    if (i == 6 || i == 7 || i == 8 || i == 9)
                        xAxis.setMaximum(100);
                    else
                        xAxis.setMaximum(maxNum * 1.2);
                }
                else {
                    xAxis.setMaximum(maxNum * 1.2);
                }

                limits[0].value = maxOrMinValue;
                limits[0].line.title.text = baseLineData[i].text + "：" + maxOrMinValue;
            }
            else{

                if(chartData[i][len - 1].value==0)
                    xAxis.setMaximum(1);
                else
                    xAxis.setMaximum(chartData[i][len - 1].value);

                limits[0].value = 0;
                limits[0].line.title.text = "";
            }

            var store = chart.getStore();
            store.removeAll();
            store.loadData(chartData[i]);
        }
    },

    //Y1564 配置图表--显示
    showBarChart1564:function(){
        var me=this;

        var panel=this.lookupReference("cfChartPanel1564"),
            grid = this.lookupReference('taskPmGrid'),
            rec = grid.getSelectionModel().getSelection()[0];

        var cir = rec.get('cir'), //100000
            eir = rec.get('eir'); //100000;

        if(!(cir && eir)){
            Ext.MessageBox.alert(_('Tip'),"CIR or Eir is empty, so the chart cannot be displayed");
            return;
        }

        me.elineId = rec.get('eline-id');
        panel.setTitle(_('Y1564 Config Chart')+" - " +rec.get('name'));

        var cfView = panel.down('#cf1564View1');
        /*if(cfView){
            panel.remove(cfView);
        }
        cfView = Ext.create('Admin.view.config.sdn.pm.cf1564View',{
            itemId:'cf156View1',
            cfViewId:'cf1564View1',
        });
        panel.add(cfView);*/

        if(cfView)
            cfView.getCf1564Chart(me.elineId,parseInt(cir),parseInt(eir));
        me.getView().setActiveItem(2);

        //设置定时器,等于6布时,销毁定时器
        var task = Ext.TaskManager.start({
            run: function(){
                var step=cfView.getCf1564Chart(me.elineId,parseInt(cir),parseInt(eir));
                if(step==6)
                    Ext.TaskManager.destroy(task);
            },
            interval: 5000
        });
    },

    //Y1564 性能图表--显示
    showPmBarChart1564:function(){
        var me=this;

        var panel=this.lookupReference("pmChartPanel1564");
            grid = this.lookupReference('taskPmGrid'),
            rec = grid.getSelectionModel().getSelection()[0];

        me.elineId = rec.get('eline-id');

        panel.setTitle(_('Y1564 Performance Chart')+" - " +rec.get('name'));

        me.onChartSearch1564();
        me.getView().setActiveItem(3);
    },

    //Y1564 性能图表--查询事件
    onChartSearch1564:function(){
        var me = this;

        var dockedItemPanel=me.lookupReference("pmDockedItems1564"),
            startTime=dockedItemPanel.down("#pmStartTime1564").rawValue,
            endTime=dockedItemPanel.down("#pmEndTime1564").rawValue;

         if (!startTime || !endTime || startTime === null || endTime === null) {
            Ext.MessageBox.alert(_('Tip'),_('The query time cannot be empty'));
            return;
        } else if (new Date(endTime).getTime() < new Date(startTime).getTime()) {
            Ext.MessageBox.alert(_('Tip'),_('The start time must not be greater than the end time'));
            return;
        }

        var panel=this.lookupReference("pmChartPanel1564"),
            pmView = panel.down('#pm1564View1');

        /*if(pmView){
            panel.remove(pmView);
        }
        pmView = Ext.create('Admin.view.config.sdn.pm.pm1564View',{
            itemId:'pm1564View1',
            cfViewId:'pm1564View1',
        });*/
        //panel.add(pmView);

        if(pmView)
            pmView.getPm1564Chart(me.elineId,startTime,endTime);
    }
});