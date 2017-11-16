Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSynMgtTree', {
    extend: 'Ext.panel.Panel',
    xtype: 'AlarmSynMgtTree',
    requires:['Admin.view.alarms.AlarmSynMgt.AlarmSynTaskGroup'],
    // layout: 'fit',
    // style: 'background-color: #fff;',
    // width: 250,
    // height: 900,
    controller: {
        onItemClick:  function( me, record, item, index, e, eOpts ) {
            var text = record.get('text');
            var nodeNum = record.get('nodeNum');
            var tree = this.getView();
            var container = tree.up().down('AlarmSyncContainer');
            var fieldset = container.up('fieldset');
            fieldset.setTitle('操作');
            if(nodeNum==1){//text=='同步任务'
                container.setActiveItem(1);
                var syncTaskGrid = container.down('AlarmSyncTaskGrid');
                var taskGrid = syncTaskGrid.lookup('taskGrid');
                var gridStroe = taskGrid.getStore();
                // var data = [];
                // record.eachChild(function(childNode){
                //     data = data.concat(childNode.getData().children);
                // });
                // gridStroe.setData(data);
                gridStroe.proxy.extraParams = {'syn_task_group_id' : 0}; 
                gridStroe.reload();
            }else if(nodeNum==2){//text=='告警同步状态监控'
                container.setActiveItem(3);
            }else if(nodeNum==3){//text=='告警同步全局设置'
                fieldset.setTitle('告警同步全局设置');
                container.setActiveItem(4);
            }else if(record.get('depth')==3){
                var groupID = record.get('syn_task_group_id');
                container.setActiveItem(1);
                var syncTaskGrid = container.down('AlarmSyncTaskGrid');
                var taskGrid = syncTaskGrid.lookup('taskGrid');
                var gridStroe = taskGrid.getStore();
                // gridStroe.setData(record.getData().children);
                gridStroe.proxy.extraParams = {'syn_task_group_id' : groupID}; 
                gridStroe.reload();
            }else if(record.get('depth')==4){
                var taskForm = this.getView().up().down('AlarmSynTaskForm');
                taskForm.action = 'edit';
                taskForm.oldTaskName = record.get('task_name');
                var form = taskForm.lookupReference('baseForm');
                form.getForm().reset();
                var form2 = form.getForm();
                form2.setValues(record.getData());
                var taskInfoItem = taskForm.lookupReference('taskInfoItem');
                var instantStart = taskForm.lookupReference('instantStart');
                instantStart.setHidden(true);
                taskInfoItem.setHidden(false);
                var alarmSynDevicePanel = taskForm.lookupReference('AlarmSynDevicePanel');
                alarmSynDevicePanel.getController().initEdit(record.get('syn_task_id'),record.get('create_user'),'alarm_syn_task_area');
                this.getView().up().down('AlarmSyncContainer').setActiveItem(2);
            }
        },
        onLoad:  function( me, records, successful, operation, eOpts ) {
            if(successful){
                var tree = this.getView();
                var container = tree.up().down('AlarmSyncContainer');
                var AlarmSyncTaskList = container.down('AlarmSyncTaskList');
                var record = records[0];
                var array = new Array();
                record.eachChild (function(node){
                    if(node.get('nodeNum')>0){
                        array.push(node);
                    }
                });
                var listStore = AlarmSyncTaskList.getStore();
                listStore.setData(array);
            }
            
        },
        onExpandAllClick: function () {
            this.lookupReference('treepanel').expandAll();
        },
        onCollapseAllClick: function () {
            this.lookupReference('treepanel').collapseAll();
        },
        onRefresh: function() {        
            var listStore = this.lookupReference('treepanel').getStore();
            listStore.reload();
        }
    }, 
    

    // iconCls: 'x-fa fa-gears',
    // layout: 'border',
    title: '告警同步管理',

    viewModel: {
        stores: {
            navItems: {
                type: 'tree',
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: 'alarm/AlarmSynMgt/getSynMgtTree',
                    reader: {
                        type: 'json',
                    }
                },
                listeners: {
                    load: 'onLoad'
                }
            }
        }
    },

    items: [
    {
        reference: 'treelistContainer',
        // layout: {
        //     type: 'vbox',
        //     align: 'stretch'
        // },
        border: false,
        scrollable: 'y',
        tbar: {
                reference: 'tbarForTreelist',
                items:[
                
                {
                    text: _('Refresh'),
                    handler: 'onRefresh'
                },{
                    text: '+',
                    handler: 'onExpandAllClick'
                },{
                    text: '-',
                    handler: 'onCollapseAllClick'
                }
            ]
        },
        items: [{
            xtype: 'treepanel',
            // height: 600,
            useArrows: true,
            rootVisible: false,
            reference: 'treepanel',
            bind: '{navItems}',
            listeners: {
                itemclick: 'onItemClick',
            }
        }]
    }
    ]
});
