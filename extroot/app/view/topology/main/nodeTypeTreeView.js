Ext.define('Admin.view.topology.main.nodeTypeTreeView', {
    extend: 'Ext.tree.Panel',
    xtype: 'nodeTypeTreeView',

	containerScroll : true,
	rootVisible : false,
    store: {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            // url: '/topo/node_type_tree/symbol',
            url: '/topo/topo_nodeorlink_info/node_type_tree/subnet',
            // url: '/topo/node_type_tree/link',
            reader: {
                type: 'json',
                rootProperty: 'children'
            }
        }
    },

	dockedItems : [{
		xtype : 'toolbar',
		items : [{
			itemId : 'expandAll',
			// text : _('Full Expand'),
			tooltip : _('Full Expand'),
			handler : function() {
				this.up('treepanel').expandAll();
			},
			iconCls : 'toggle_plus',
			disabled : false
		}, {
			itemId : 'closeAll',
			// text : _('Collapse All'),
			tooltip : _('Collapse All'),
			handler : function() {
				this.up('treepanel').collapseAll();
			},
			iconCls : 'toggle_minus',
			disabled : false
		}
        ]
	}]

});
