Ext.define('Admin.view.resource.discovery.filter.deviceFilterFormView', {
	extend: 'Admin.view.base.CardForm',
	xtype: 'deviceFilterFormView',

	controller: {
        onActive: function() {
            console.log('deviceFilterFormView onActive');
            this.getView().down('treepanel').store.reload();
        },

        onCancel: function() {
            this.getView().up().setActiveItem(0);
        },

        onSubmit: function() {
            var tree = this.getView().down('treepanel');

            var toSave = [];
            Ext.Array.each(tree.getChecked(), function(rec){
                if(rec.get('leaf')){
                	var recSave = {};
                    recSave.netype_id = rec.get('netype_id');
					recSave.softWareVersion = rec.get('softWareVersion');
                	recSave.hardWareVersion = rec.get('hardWareVersion');
                	recSave.hardWarePrefix = rec.get('hardWarePrefix');
                    recSave.netype_name = rec.get('text');
                	toSave.push(recSave);
                }
            });

            if(toSave.length == 0) {
                Ext.Msg.alert(_('Tip'), _('filter rule not selected'));
                return;
            }

            var filterView = this.getView().up();

            console.log(Ext.JSON.encode(toSave));

            Ext.create('Ext.form.Panel', {
                items: [ 
                    {xtype: 'hidden', name: 'records', value: Ext.JSON.encode(toSave) }
                ]
            }).getForm().submit({
                url: '/resource/filter/addFilterRule',
                // waitTitle : 'wait...', 
                // waitMsg : 'adding rule ...',  
                success: function(form, action) {
                    filterView.down('filterConditionGridView').store.reload();
                    filterView.setActiveItem(0);
                    Ext.Msg.alert(_('Success'), action.result.msg);
                },
                failure: function(form, action) {
                    Ext.Msg.alert(_('Failed'), action.result.msg);
                }
            });
        },

        beforeEdit: function(editor, context, eOpts) {
        	if(!context.record.get('leaf'))
        		return false;
        }
    },
    
	items: [
	{
        xtype: 'treepanel', 
        rootVisible: false,
        checkPropagation: 'both',
        rowLines: true,
        // height: 800,

        store: {
            autoLoad: true,
            fields: ['text', 'softWareVersion', 'hardWareVersion', 'hardWarePrefix'],
            proxy:{
                type: 'ajax',
                url: '/resource/filter/getDeviceType',
                reader: {
                    type: 'json',
                    rootProperty: 'children'
                }
            }
        },
        folderSort: true,
        sorters: [
        {
            property: 'text',
            direction: 'ASC'
        }],
        columns: [
        {
        	xtype: 'treecolumn',
        	text: _('Device Type'),
        	dataIndex: 'text',
        	flex: 2,
        	sortable: true
        },
        {
        	text: _("Software Version"),
        	dataIndex: 'softWareVersion',
        	flex: 1,
        	editor: 'textfield'
        },
        {
        	text: _('Hardware Version'),
        	dataIndex: 'hardWareVersion',
        	flex: 1,
        	editor: 'textfield'
        },
        {
        	text: _('Hardware Prefix'),
        	dataIndex: 'hardWarePrefix',
        	flex: 1,
        	editor: 'textfield'
        }],

        plugins: {
        	ptype: 'cellediting',
        	clicksToEdit: 1,
        	listeners: {
        		beforeedit: 'beforeEdit'
        	}
        },

        tbar: [
            {
                text: _('Cancel'),
                iconCls:'x-fa fa-close',
                handler: 'onCancel'
            },
            {
                text: _('Save'),
                iconCls:'x-fa fa-save',
                handler: 'onSubmit'
            }
        ]
    }],

    listeners: {
        activate: 'onActive'
    }
});