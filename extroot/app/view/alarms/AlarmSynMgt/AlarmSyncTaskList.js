Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSyncTaskList', {
    extend: 'Ext.grid.Panel',
    xtype: 'AlarmSyncTaskList',
    store: {},
    title: '<br />',
    columns: [
        { xtype: 'rownumberer', width: 50, align: 'center'}, 
        { text: '节点名称',  dataIndex: 'text', flex: 1 }
    ],
    // width: 500,
    // height: 900,
    
    cls: 'shadow',
    listeners: {
        itemdblclick: {
            fn: function  ( me, record, item, index, e, eOpts ) {
                var AlarmSyncMgtMainView = me.up('AlarmSyncMgtMainView');
                var AlarmSynMgtTree = AlarmSyncMgtMainView.down('AlarmSynMgtTree');
                AlarmSynMgtTree.getController().onItemClick(me, record);
            }
        }
    }
});