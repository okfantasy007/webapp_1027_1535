Ext.define('Admin.view.resource.syncmanage.syncTask.taskGroup', {
    extend: 'Ext.window.Window',
    modal:true,
    title: _('Task Group'),
    height: 300,
    width: 400,
    id:'ressyncTaskGroupWin',
    layout: 'fit',
    cls: 'shadow',

    controller: {   
        onReset: function() {
            this.getView().down('form').reset();
        },

        onCancel: function() {
            this.getView().close();
        },

        onSubmit: function() {
            controller = this;
            form = this.getView().down('form');

            if (form.getForm().isValid()) {
                form.getForm().submit({
                    url: '/resource/syn_group_task/task_group/post',
                    waitTitle : _('Please wait...'), 
                    waitMsg : _('Please wait...'),  
                    success: function(form, action) {
                        var segs = action.result.msg.split(',');
                        console.log('segs', segs);

                        var tt = Ext.getCmp('ressyncTaskTree').lookupReference('taskTree');
                        tt.getStore().reload();
                        
                        // if(segs.length == 2) {
                        //     tt.selectPath('/root/' + segs[1]);
                        // } else {
                        //     tt.selectPath('/root/' + form.down('fieldset').getComponent('group_id').getValue());
                        // }

                        Ext.getCmp('ressyncTaskForm').lookupReference('SYN_TASK_GROUP_ID').getStore().reload();                   
                        controller.getView().close();

                        // Ext.Msg.alert(_('Success'), action.result.msg);
                        Ext.Msg.alert(_('Success'), segs[0]);
                    },
                    failure: function(form, action) {
                        Ext.Msg.alert(_('Failed'), action.result.msg);
                    }
                });                
            }
            else {
                Ext.Msg.alert(_('input error'), _('Please Check The Input Content'));
            }
        },
    },
    items:[
        {
            xtype: 'form',
            bodyPadding: 10,
           
            items: [
            {
                xtype: 'fieldset',
                title:_('Group information'),
                margin: 10,
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%'
                },

                items: [
                {
                    itemId:'group_id',
                    name: 'group_id',
                    hidden:true
                },
                {
                    fieldLabel:_('Group Name'),
                    emptyText: _('Group Name'),
                    allowBlank: false,
                    itemId:'group_name',
                    name: 'group_name'
                }, 
                {
                    fieldLabel: _('Remark'),
                    emptyText: _('Remark'),
                    itemId:'remark',
                    name: 'remark'
                },
                {
                    xtype:'hidden',
                    name:'task_type',
                    value:1
                }
                ]
            }],

            buttons: [
            {
                text: _('Reset'),
                iconCls:'x-fa fa-undo',
                handler: 'onReset'
            },
            {
                text: _('Cancel'),
                iconCls:'x-fa fa-close',
                handler: 'onCancel'
            },
            {
                text: _('Save'),
                iconCls:'x-fa fa-save',
                handler: 'onSubmit'
            }]
        },
        
    ],
    
});