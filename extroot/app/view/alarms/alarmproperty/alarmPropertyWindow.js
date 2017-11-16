/***
*告警属性对话框
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmproperty.alarmPropertyWindow', {
    extend: 'Ext.window.Window',//'Ext.container.Container',
    xtype: 'alarmPropertyWindow',
    requires: [
        'Admin.view.alarms.alarmproperty.alarmPropertyView'
    ],
    initComponent:function(){
        this.callParent();
        this.nextAlarm = new Object();
        this.previousAlarm = new Object();
        this.nowAlarm = new Object();
        this.subNeID = 0;
        this.tablename = 'rcalarmlog';
        this.arrayRecords = new Array();
    },
    controller: {
        //从当前panel中store中得到上下行
        loadCurrentData:function(record,records){
            var me = this.getView();
            var previousLine = this.lookupReference("previousLine");
            var nextLine = this.lookupReference("nextLine");
            if(record!=null && record!=""){
                var rowRecord = record.data;
                me.arrayRecords = records;
                if(records.length==1){
                    nextLine.setDisabled(true);
                    previousLine.setDisabled(true); 
                    me.nextAlarm = null;
                    me.previousAlarm=null;
                }else if(records.length>1){
                    Ext.Array.forEach(records,function(str,index,array){
                        if(str==record){
                            if(index==0){
                                nextLine.setDisabled(false);
                                previousLine.setDisabled(true); 
                                me.nextAlarm = records[index+1];
                                me.previousAlarm=null;
                            }else if(index==records.length-1){
                                nextLine.setDisabled(true);
                                previousLine.setDisabled(false);
                                me.nextAlarm = null;
                                me.previousAlarm=records[index-1];
                            }else{
                                nextLine.setDisabled(false);
                                previousLine.setDisabled(false);
                                me.nextAlarm = records[index+1];
                                me.previousAlarm=records[index-1];
                            }
                        }
                    });
                }
                var alarmPropertyView = this.lookupReference('alarmPropertyView');
                alarmPropertyView.lookupController().loadProperty(rowRecord);    
            }
        },
        //通过后台查询得到上下行，暂时不用----
    	loadData:function(rowRecord,subNeID,tableName){
            var me = this.getView();
            if(rowRecord!=null && rowRecord!=""){
                me.nowAlarm = rowRecord;
                if(subNeID==''){
                   subNeID=0;
                }
                if(tableName==''){
                   tableName = 'rcalarmlog';
                }
                me.subNeID = subNeID;
                me.tablename = tableName;
                var previousLine = this.lookupReference("previousLine");
                var nextLine = this.lookupReference("nextLine");
                var relationfilag = rowRecord.relation_flag;
                var alarmid = rowRecord.iRCAlarmLogID;
                //判断是否有上下行
                Ext.Ajax.request({
                    method:'post',
                    url:'alarm/currentAlarm/getPreviousNext',
                    params:{
                        relationflag:relationfilag,
                        rcalarmlogid:alarmid,
                        subneid:subNeID,
                        tablename:tableName
                    },
                    success:function(response){
                        var r = Ext.decode(response.responseText);
                        if (r.success) {
                            var dataLength = r.data.length;
                            if(dataLength==2){
                                if(r.data[0].iRCAlarmLogID>r.data[1].iRCAlarmLogID){
                                    me.nextAlarm = r.data[0];
                                    me.previousAlarm = r.data[1];
                                }else{
                                    me.nextAlarm = r.data[1];
                                    me.previousAlarm = r.data[0];
                                }
                                nextLine.setDisabled(false);
                                previousLine.setDisabled(false);
                            }else if(dataLength==1){
                                if(r.data[0].iRCAlarmLogID>=rowRecord.iRCAlarmLogID){
                                    nextLine.setDisabled(false);
                                    previousLine.setDisabled(true);
                                    me.nextAlarm = r.data[0];
                                    me.previousAlarm=null;
                                }else{
                                    nextLine.setDisabled(true);
                                    previousLine.setDisabled(false);
                                    me.nextAlarm = null;
                                    me.previousAlarm=r.data[0];
                                }
                            }else{
                                nextLine.setDisabled(true);
                                previousLine.setDisabled(true);
                            }
                        }else{
                            nextLine.setDisabled(true);
                            previousLine.setDisabled(true);
                        }
                    },
                    failure: function(response) {
                        Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
                    }
                });
                var alarmPropertyView = this.lookupReference('alarmPropertyView');//alarmPropertyw.down('alarmPropertyView');
                alarmPropertyView.lookupController().loadProperty(rowRecord);
            }
    	},
        onClose:function(){
            this.getView().close();
        },
        onNextLine:function(){
            var me =this.getView(); 
            this.loadCurrentData(me.nextAlarm,me.arrayRecords);
            //this.loadData(me.nextAlarm,me.subNeID,me.tablename);
        },
        onPreviousLine:function(){
            var me =this.getView(); 
            this.loadCurrentData(me.previousAlarm,me.arrayRecords);
            //this.loadData(me.previousAlarm,me.subNeID,me.tablename);
        }
    },
    title: _('Properties'),
    closable: true,
    width: 400,
    height: 550,
    border: false,
    resizable:false, // 是否可以调整窗口大小，默认TRUE。
    modal:true, // 模式窗口，弹出窗口后屏蔽掉其他组建
    //constrain:true, // 防止窗口超出浏览器窗口,保证不会越过浏览器边界
    //layout:"border",// 布局
    items: [{
        xtype:'alarmPropertyView',
        reference:'alarmPropertyView'
    }],
    buttons: ['->',{
        text   : _('previous'),
        disabled:false,
        reference:'previousLine',
        handler: 'onPreviousLine'
    }, {
        text   : _('next'),
        reference:'nextLine',
        disabled:false,
        handler: 'onNextLine'
    }, {
        text   : _('Close'),
        handler: 'onClose'
    }]
});