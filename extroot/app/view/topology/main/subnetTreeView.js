Ext.define('Admin.view.topology.main.subnetTreeView', {
    extend: 'Ext.panel.Panel',
    xtype: 'subnetTreeView',
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    // cls: 'shadow',

    controller: {
        onRefresh: function() {
            this.lookupReference('subnetTree').store.reload();
        },
        onExpandAll: function() {
            this.lookupReference('subnetTree').expandAll();
        },
        onCollapseAll: function() {
            this.lookupReference('subnetTree').collapseAll();
        },
        onSubnetTreeSelectionChange: function( self, records, eOpts ) {
	    	var grid = this.getView().up().down('deviceGridView').lookupReference('deviceGrid');
	        grid.store.proxy.extraParams = {parent_symbol_id: records[0].data.symbol_id};
	        grid.store.reload();
    	}
    },

    items: [
    {
        xtype: 'treepanel',
        reference: 'subnetTree',
        rootVisible: false,
        border: false,

        store : {
            fields: [{
                name: 'text'
            }],
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/topo/topo_nodeorlink_info/get_topo_subnet',
                extraParams: {ids : '-1'},
                reader: {
                    type: 'json'
                }
            }
        },

        tbar: [
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
            '->',
            {
                tooltip: _('Refresh'),
                iconCls:'x-fa fa-refresh',
                handler: 'onRefresh'
            }
        ],
        listeners: {
	        selectionchange: 'onSubnetTreeSelectionChange'
	    }
    }]
});