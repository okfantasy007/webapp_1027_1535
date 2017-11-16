Ext.define('Admin.view.alarms.alarmStatistics.historyAlarmStatisticsGridView', {
    extend: 'Ext.container.Container',
    xtype: 'historyAlarmStatisticsGridView',


    requires: ['Admin.view.base.PagedGrid'],
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    cls: 'shadow',



     viewModel: {
        stores: {
            statistics_remote: {
              autoLoad: true,
              // 每页显示记录数
               pageSize: 15,
				        proxy: {
				            type: 'ajax',
				            url: '/alarm/alarmReport/getHistory',
				            actionMethods : {  
				                read   : 'GET'
				            },
				            reader: {
				               type: 'json',
				               rootProperty: 'data'
				            },
				        }
           }
        }
    },
    
    controller: {

        onExportAll:function(){
        	
        	   var alarmStatisticsGrid = this.lookupReference('alarm_statistics_grid');
        	   var columns = alarmStatisticsGrid.getColumns();
             var fields = new Array();
             var dataIndex = new Array();
             Ext.Array.each(columns,function(item,index,columns){
                fields.push(item.text);
                dataIndex.push(item.dataIndex);                               
             });
        	  location.href = "/alarm/alarmReport/exportHistory?fields="+Ext.JSON.encode(fields)+"&dataIndex="+Ext.JSON.encode(dataIndex);
        },
        
        onExportCurrentPage:function(){
             var alarmStatisticsGrid = this.lookupReference('alarm_statistics_grid');
        	   var columns = alarmStatisticsGrid.getColumns();
             var fields = new Array();
             var dataIndex = new Array();
             Ext.Array.each(columns,function(item,index,columns){
                fields.push(item.text);
                dataIndex.push(item.dataIndex);                               
             });
             var store = alarmStatisticsGrid.getStore();
             var fieldsStr = Ext.JSON.encode(fields);
             var dataIndexStr = Ext.JSON.encode(dataIndex);
             location.href = "/alarm/alarmReport/exportHistory?currentPage="+store.currentPage+"&pageSize="+store.pageSize+"&fields="+fieldsStr+"&dataIndex="+dataIndexStr;
        },

        onRefresh: function() {
            this.getView().getStore().reload();
        }


    },

    

    // grid显示字段
    
    items: [{
              title: '',
              xtype: 'PagedGrid',
              reference: 'alarm_statistics_grid',
              columns: [ 
									        { 
									        	  text: _('Ne Name'),  
									        	  dataIndex: 'ne', 
									        	  width: 300 
									        },
									        { 
									        	  text: _('Critical'), 
									        	  dataIndex: 'critical', 
									        	  width: 100 
									        },
									        { 
									        	  text: _('Alert Alarm'), 
									        	  dataIndex: 'alert', 
									        	  width: 100 
									        },
									        { 
									        	  text: _('Warning Alarm'), 
									        	  dataIndex: 'warning', 
									        	  width: 100 
									        },
									        {  
									        	  text: _('Notify Alarm'), 
									        	  dataIndex: 'notify', 
									        	  width: 100
									        },
									        {  
									        	  text: _('Unknown Alarm'), 
									        	  dataIndex: 'unknown', 
									        	  width: 100
									        },
									        {  
									        	  text: _('Alarm Total'), 
									        	  dataIndex: 'alarm_total', 
									        	  width: 100
									        },
              ],

					    // 分页工具条位置
					    // pagingbarDock: 'bottom',
					    pagingbarDock: 'top',
					    // 默认每页记录数
					    pagingbarDefaultValue: 15,
					    // 分页策略
					    pagingbarConfig: {
					        fields: [{name: 'val', type: 'int'}],
					        data: [
					            {val: 15},
					            {val: 30},
					            {val: 60},
					            {val: 100},
					            {val: 200},
					        ]
					    },

					    // 自定义工具条
					    dockedItems: [{
					        xtype: 'toolbar',
					        dock: 'top',
					        items: [
					            {
					                text: _('Refresh'),
					                iconCls:'x-fa fa-refresh',
					                handler: 'onRefresh'
					            },
					            {
					            	  text: _('Export'),
					                xtype: 'splitbutton',
					                iconCls:'x-fa fa-download',
					                menu:[
					                   {
					                     text:_('All'),
					                     handler:'onExportAll'
					                   },{
					                     text:_('current page'),
					                     handler:'onExportCurrentPage'
					                   }]
					            }
					          ]
					     }],
					     
					     // 绑定到viewModel的属性
				        bind: {
				            store: '{statistics_remote}'
				        }
           
    }],
   
});
