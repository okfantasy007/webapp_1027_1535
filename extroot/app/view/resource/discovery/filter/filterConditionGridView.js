Ext.define('Admin.view.resource.discovery.filter.filterConditionGridView', {
	extend: 'Ext.grid.Panel',
	xtype: 'filterConditionGridView',
	reference: 'deviceDiscoveryFilterConditionGridView',

	viewModel: {
		stores: {
			filterConditionStore: {
				autoLoad: true,
				
				fields: [
				{name: 'ruleid', mapping: 'FILTER_ID'},
				{name: 'deviceType', mapping: 'NETYPE_NAME'}, 
				{name: 'softWareVersion', mapping: 'SW_VERSION'}, 
				{name: 'hardWareVersion', mapping: 'HW_VERSION'}, 
				{name: 'hardWarePrefix', mapping: 'HW_PREFIX'}
				],
				
				proxy: {
					type: 'ajax',
					url: '/resource/filter/getAllRules',
					reader: {
						type: 'json',
						rootProperty: 'data'
					}
				}
			}
		}
	},

	controller: {
		onActive: function() {
			var filterRG = this.getView().down('toolbar').getComponent('radiogroup1');
			Ext.Ajax.request({
			    url: '/resource/filter/getFilterType',
			    success: function(response, opts) {
			        var obj = Ext.decode(response.responseText);
			        filterRG.setValue({filterType: obj.property_value});
			    },
			    failure: function(response, opts) {
			    	console.log('get resouce filter type failed');
			    }
			});
		},
		onAdd: function(me, e, eOpts) {
			var container = this.getView().up();
			var form = container.down('deviceFilterFormView');
			form.down('treepanel').store.removeAll();
			container.setActiveItem(form);
		},
		onDelete: function() {
			var grid = this.getView();
			var selected = grid.getSelection();

			var ids = [], names = [];
			for(var i=0; i<selected.length; i++) {
				ids.push(selected[i].get('ruleid'));
				names.push(selected[i].get('deviceType'));
			}

			Ext.create('Ext.form.Panel', {
				items: [
					{xtype: 'hidden', name: 'rule_ids', value: ids.join(',')},
					{xtype: 'hidden', name: 'rule_names', value: names.join(',')}
				]
			}).getForm().submit({
				url: '/resource/filter/deleteFilterRule',
				// waitTitle: 'wait...',
				// waitMsg: 'deleting rule...',
				success: function(form, action) {
					grid.store.reload();
					Ext.Msg.alert(_('Success'), action.result.msg);
				},
				failure: function(form, action) {
					Ext.Msg.alert(_('Failed'), action.result.msg);
				}
			}) ;
		},
		onFilterTypeChange: function(me, newValue, oldValue, eOpts) {

			if(oldValue.filterType) {
				console.log('state change');

				Ext.create('Ext.form.Panel', {
					items: [
						{xtype: 'hidden', name: 'filterType', value: newValue.filterType}
					]
				}).getForm().submit({
					url: '/resource/filter/modifyFilterType',
					// waitTitle: 'wait...',
					// waitMsg: 'modifying filter type',
					success: function(form, action) {
						;
					},
					failure: function(form, action) {
						Ext.Msg.alert(_('Failed'), action.result.msg);
					}
				});
				
				
			} else {
				console.log('initial state');
			}

		}
	},

	bind: {
   		store: '{filterConditionStore}'
   	},
  	
	selType: 'checkboxmodel',
	columns: [
	{
        text: _('Device Type'),
        flex: 2,
        dataIndex: 'deviceType'
    }, 
    {
        text: _("Software Version"),
        flex: 1,
        dataIndex: 'softWareVersion'
    }, 
    {
        text: _('Hardware Version'),
        flex: 1,
        dataIndex: 'hardWareVersion'
    }, 
    {
    	text: _('Hardware Prefix'),
    	flex: 1,
    	dataIndex: 'hardWarePrefix'
    }],

	dockedItems: [
	{
		xtype: 'toolbar',
		dock: 'top',
		items: [
		{
			text: _('Add'),
			iconCls:'x-fa fa-plus',
			hidden: SEC.hidden('01030301'),
			handler: 'onAdd'
		}, 
		{
			text: _('Delete'),
			iconCls:'x-fa fa-trash',
            handler: 'onDelete',
            hidden: SEC.hidden('01030302'),
            bind: {
                disabled: '{!deviceDiscoveryFilterConditionGridView.selection}'
            }
		},
		'->',
		{
			xtype: 'radiogroup',
			itemId: 'radiogroup1',
    		name: 'filterType',
    		labelAlign: 'right',
    		hidden: SEC.hidden('01030303'),
    		// labelWidth: 80,
			// labelPad: 2,
			width: 250,

    		fieldLabel: _('filter_policy'),
    		items: [
    		{
    			boxLabel: _('filter_discard'), 
    			inputValue: 'discard'
    		},
    		{
    			boxLabel: _('filter_keep'), 
    			inputValue: 'keep'
    		}],
    		listeners: {
    			change: 'onFilterTypeChange'
    		}
		}]
	}],
    	
    listeners: {
    	activate: 'onActive'
    }
});