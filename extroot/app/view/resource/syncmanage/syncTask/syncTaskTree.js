Ext.define('Admin.view.resource.syncmanage.syncTask.syncTaskTree', {
    extend: 'Ext.container.Container',
    xtype:'syncTaskTree',
    id:'ressyncTaskTree',
    layout: 'fit',
    cls: 'shadow',
   
    controller: {
        onRefresh: function() {
            var tt = this.lookupReference('taskTree');
            tt.getStore().reload();
            tt.selectPath('/root');
        },

        onExpandAll: function() {
            this.lookupReference('taskTree').expandAll();
        },

        onCollapseAll: function() {
            this.lookupReference('taskTree').collapseAll();
        },

        onSyncTaskSelectionChange: function( self, records, eOpts ) {
            if(records.length != 1) { return; }
            if(records[0].data.id=='root'||records[0].data.parentId=='root'){
                if(records[0].data.id=='root'){
                    this.lookupReference('editButton').setDisabled(true);
                    this.lookupReference('deleteButton').setDisabled(true);
                }else{
                    this.lookupReference('editButton').setDisabled(false);
                    this.lookupReference('deleteButton').setDisabled(false);
                }
                
                this.getView().up().getComponent('cardSide').setActiveItem('ressyncTaskGrid');
                var store = this.getView().up().down('syncTaskGrid').down('PagedGrid').getStore();
                store.proxy.extraParams = {group_id:records[0].data.id};
                store.reload();
            } else {
                this.lookupReference('editButton').setDisabled(true);
                this.lookupReference('deleteButton').setDisabled(true);

                console.log('records[0]', records[0]);

                var taskForm = this.getView().up().down('baseTask');
                taskForm.lookupReference('baseForm').getForm().reset();

               	taskForm.lookupReference('baseForm').getForm().loadRecord(records[0]);

                var thePI = records[0].data.TASK_PERIOD_INFO;
                if(thePI == null) { thePI = '';}
                var days = thePI.split(",").map(function(oneDay) {
                    return parseInt(oneDay);
                });
                taskForm.lookupReference('res_sync_execute_time_by_week').setValue(days);
                taskForm.lookupReference('isResSyncManagePersist').setValue(records[0].data.IS_CONTINUAL_SYN==1);

                taskForm.lookupReference('AlarmSynDevicePanel').getController().initEdit(records[0].data.SYN_TASK_ID,
                    records[0].data.CREATE_USER, 'res_syn_task_area');

                this.getView().up().getComponent('cardSide').setActiveItem('ressyncTaskForm');
        	}
    	},

        onAdd:function(){
            Ext.create('Admin.view.resource.syncmanage.syncTask.taskGroup',{}).show();
        },

        onDelete: function() {
            var records = this.lookupReference('taskTree').getSelectionModel().getSelection();
            controller = this;
            Ext.MessageBox.confirm(_('Confirmation'), 
                _('Confirm to delete ') + '<br />' + records[0].get('text') + '<br />',
                function(btn) {
                    if (btn=='yes') {
                        
                        Ext.create('Ext.form.Panel', {
                            items: [ 
                                {xtype: 'hidden', name: 'id', value: records[0].get('id')},
                                {xtype: 'hidden', name: 'name', value:  records[0].get('text')}
                            ]
                        }).getForm().submit({
                            url: '/resource/syn_group_task/task_group/delete',
                            waitTitle : _('Please wait...'), 
                            waitMsg : _('Please wait...'), 
                            success: function(form, action) {
                                controller.onRefresh();
                                Ext.getCmp('ressyncTaskForm').lookupReference('SYN_TASK_GROUP_ID').getStore().reload();
                                Ext.Msg.alert(_('Success'), action.result.msg);
                            },
                            failure: function(form, action) {
                                Ext.Msg.alert(_('Failed'), action.result.msg);
                            }
                        }); 
                    } 
                }
            );
        },

        onEdit: function(){
            var records = this.lookupReference('taskTree').getSelectionModel().getSelection();
            var tgWindow =Ext.create('Admin.view.resource.syncmanage.syncTask.taskGroup',{});
            var giw = tgWindow.down('form').down('fieldset');
            giw.getComponent('group_name').setValue(records[0].data.text);
            giw.getComponent('remark').setValue(records[0].data.qtip);
            giw.getComponent('group_id').setValue(records[0].data.id);
            tgWindow.show();
        }
    },

    items: [
    {
       
        xtype: 'treepanel',
        reference: 'taskTree',
        rootVisible: true,
        store : {
            fields: [{
                name: 'text'
            }],
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/resource/syn_group_task/task_tree',
                reader: {
                    type: 'json',
                }
            },
            root: {
                text: _('Synchro Task'),
                expand: true
            }
        },

        tbar:[
            
            {
                tooltip: _('Add'),
                iconCls:'x-fa fa-plus',
                handler:'onAdd',
            },
            {
                tooltip: _('Edit'),
                iconCls: 'x-fa fa-edit',
                reference: 'editButton',
                bind: {
                    disabled: '{!taskTree.selection}'
                },
                handler: 'onEdit',
            },
            {
                tooltip: _('Delete'),
                reference: 'deleteButton',
                itemId: 'topo_node_delete',
                iconCls: 'x-fa fa-trash',
                handler: 'onDelete',
                bind: {
                    disabled: '{!taskTree.selection}'
                },
            },
            '->',
            {
                tooltip: _('Full Expand'),
                iconCls:'x-fa fa-expand',
                handler: 'onExpandAll'
            },
            {
                tooltip: _('Collapse All'),
                iconCls:'x-fa fa-compress',
                handler: 'onCollapseAll'
            },
            
            {
                tooltip: _('Refresh'),
                iconCls:'x-fa fa-refresh',
                handler: 'onRefresh'
            }
        ],
        listeners: {
	      selectionchange:'onSyncTaskSelectionChange'
	    }

    }]

});