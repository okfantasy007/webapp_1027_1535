/***
*历史告警模块的pagingtoolbar
* @author ldy 2017/8/10
* 
*/
Ext.define('Admin.view.alarms.alarmhistory.alarmTreePagingToolBar', {
    extend: 'Ext.toolbar.Paging',
    xtype: 'alarmTreePagingToolBar',
    displayInfo : true,
    displayMsg : _('Items') + ' {0}-{1}, ' + _('Total Count:') + '{2}', // start, end (calculated according to store config), total (returned from server)
    emptyMsg : _('Empty'),
    initComponent:function(){
        this.callParent();
        this.alarm_page_isqurey=0;
        this.alarm_page_start = 0;
        this.alarm_page_limit = 15;
        this.pagedata = new Object();
    },
    store:{},
    items : ['-', {
            xtype : 'combobox',
            padding : '0 0 0 5',
            displayField : 'val',
            valueField : 'val',
            multiSelect : false,
            editable : false,
            labelWidth : 65,
            store : {//Ext.create('Ext.data.Store', {
                fields : [{name : 'val',type : 'int'}],
                data : [{val: 15},
                        {val: 30},
                        {val: 60},
                        {val: 100},
                        {val: 200},
                        {val: 500},
                        {val: 1000},
                        {val: 2000}]
            },//),
            value : 15,
            listeners : {
                change : function(me, newValue, oldValue, ops) {
                    var pagingbar = this.up('alarmTreePagingToolBar');
                    var paging_store = pagingbar.store;
                    Ext.apply(paging_store, {
                        pageSize : newValue
                    });
                    pagingbar.moveFirst();
                }
            },
            fieldLabel : _('Page Size')
    }]
 });