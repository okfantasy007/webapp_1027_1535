/***
*当前告警的pagingtoolbar
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmcurrent.currentAlarmTreeToolBar', {
    extend: 'Ext.toolbar.Paging',
    xtype: 'currentAlarmTreeToolBar',
    displayInfo : true,
    displayMsg : _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}', // start, end (calculated according to store config), total (returned from server)
    emptyMsg : _('Empty'),
    initComponent:function(){
        this.callParent();
        this.alarm_page_isqurey=0;
        this.alarm_page_start = 0;
        this.alarm_page_limit = 15;
    },
    store:{},
    /*getPageData: function(){
         var store = this.store,
            totalCount = store.getTotalCount(),//!!!!!!!!!!!!!!!!!!这里!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            pageCount = Math.ceil(totalCount / store.pageSize),
            toRecord = Math.min(store.currentPage * store.pageSize, totalCount);
            var data = store.data;
            if(data.length==1){
                var dataItems = store.data.items[0];
                count = dataItems.get('totalCount');
                if(count!=null && count!=""){
                    totalCount = count;
                }
            }
       
        return {
            total : totalCount,
            currentPage : store.currentPage,
            pageCount: Ext.Number.isFinite(pageCount) ? pageCount : 1,
            fromRecord: ((store.currentPage - 1) * store.pageSize) + 1,
            toRecord: toRecord || totalCount
        };
    },*/
    // controller: {

    // 	onPagingChange: function(me, pagedata, ops) { 
    //         /* var store = this.store,
    //         totalCount = store.getTotalCount(),
    //         dataItems = store.data.items[0],
    //         //if(dataItems!=null){
    //          totalCount = dataItems.totalCount;
    //         //}
    //         toRecord = Math.min(store.currentPage * store.pageSize, totalCount),
    //         fromRecord= ((store.currentPage - 1) * store.pageSize) + 1;

    //         me.alarm_page_limit = pagedata.toRecord - pagedata.fromRecord + 1;
    //         me.alarm_page_start = pagedata.fromRecord - 1;
    //         if(currenTreepanel!=null){
    //             var alarmGroupMonitorView = currenTreepanel.up('alarmGroupMonitorView');
    //             if(alarmGroupMonitorView!=null){
    //                 currenTreepanel.getStore().proxy.url='alarmcheck/Monitor/getAlarmByRule?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start;
    //             }else{
    //                 currenTreepanel.getStore().proxy.url='alarmcheck/currentAlarm/getMainAlarmByParam?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start; 
    //             }
    //             currenTreepanel.getStore().reload();
    //         }*/
    //             if(me.alarm_page_isqurey==1){
    //                 me.moveFirst();
    //                 me.alarm_page_isqurey=0;
    //             }else{
    //                 if(pagedata.toRecord==0){
    //                     var combobox =  me.down('combobox');
    //                     me.alarm_page_limit = combobox.value;
    //                 }else{
    //                     me.alarm_page_limit = pagedata.toRecord - pagedata.fromRecord + 1;
    //                 }
    //                 if(pagedata.fromRecord==0){
    //                     me.alarm_page_start=0;
    //                 }else{
    //                     me.alarm_page_start = pagedata.fromRecord - 1;
    //                 }
    //                 var currenTreepanel = me.up("currentAlarmTreeView");
    //                 if(currenTreepanel!=null){
    //                     var alarmGroupMonitorView = currenTreepanel.up('alarmGroupMonitorView');
    //                     if(alarmGroupMonitorView!=null){
    //                         currenTreepanel.getStore().proxy.url='alarmcheck/Monitor/getAlarmByRule?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start;
    //                     }else{
    //                         currenTreepanel.getStore().proxy.url='alarmcheck/currentAlarm/getMainAlarmByParam?limit=' + me.alarm_page_limit + '&start=' + me.alarm_page_start; 
    //                     }
    //                     currenTreepanel.getStore().reload();
    //                 }
    //             }
    //     }
    // },
    /*listeners : {
        change : 'onPagingChange'
    },*/
    items : ['-', {
        xtype : 'combobox',
        padding : '0 0 0 5',
        displayField : 'val',
        valueField : 'val',
        multiSelect : false,
        editable : false,
        labelWidth : 65,
        store : {//Ext.create('Ext.data.Store', 
            fields : [{ name : 'val', type : 'int'}],
            data : [{val: 15},
                {val: 30},
                {val: 60},
                {val: 100},
                {val: 200},
                {val: 500},
                {val: 1000},
                {val: 2000}]
        },
        value : 15,
        listeners : {
            change : function(me, newValue, oldValue, ops) {
                var treetoolbar = this.up("currentAlarmTreeToolBar");
                var paging_store = treetoolbar.store;
                Ext.apply(paging_store, {
                    pageSize : newValue
                });
                /*var treeview = treetoolbar.up('currentAlarmTreeView');
                var treeviewStore = treeview.store;
                Ext.apply(treeviewStore, {
                    pageSize : newValue
                });*/

                treetoolbar.moveFirst();
            }
        },
        fieldLabel : _('Page Size')
    }]
 });