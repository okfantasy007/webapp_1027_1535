Ext.define('Admin.view.topology.main.deviceGridView', {
    extend: 'Ext.container.Container',

    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'deviceGridView',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',

    viewModel: {
        stores: {
            // 远程store
            device_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 50,
                proxy: {
                    type: 'ajax',
                    url: '/topo/device_view/get_node_info',
                    extraParams: {
                        parent_symbol_id: '0'
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty : 'total'
                    },
                }
            }
        }
    },

    controller: {
        onRefresh: function() {
            this.lookupReference('deviceGrid').getStore().reload();
        },
        onItemContextMenu: function( self, record, item, index, e, eOpts ) {
            e.preventDefault();  
            e.stopEvent();
            
            if (index < 0) {
                return;
            }

            var menu = new Ext.menu.Menu();
            menu.add({
                text: _("Add"),
                handler: function(){
                }
            }, 
            {
                text: _("edit-modify"),
                handler: function(){
                }
            },
            {
                text: _("Delete"),
                handler: function(){
                }
            });
        
            menu.showAt(e.getPoint());
        }
    },
    
    items: [
    {
        xtype: 'PagedGrid',
        reference: 'deviceGrid',
        columnLines : true,
		rowLines : true,
		flex : 1,
		layout : 'fit',
		border : false,
        // 绑定到viewModel的属性
        bind: {
            store: '{device_grid_store}',
        },

        selType: 'checkboxmodel',

        // grid显示字段
        columns: [
            // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
            { text: _('Symbol ID'),  dataIndex: 'symbol_id', width: 100, menuDisabled : true },
            { text: _('Node Name'),  dataIndex: 'symbol_name1', width: 200, menuDisabled : true },
            { text: _('Remark'),  dataIndex: 'remark', width: 150, menuDisabled : true },
            { text: _('Net Name'),  dataIndex: 'subnet_name', width: 150, menuDisabled : true },
            { text: _('Topo Type'),  dataIndex: 'topo_type_name', flex: 1, menuDisabled : true }
            
        ],

        // 分页工具条位置
        // pagingbarDock: 'bottom',
        pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 50,
        // 分页策略
        pagingbarConfig: {
            fields: [{name: 'val', type: 'int'}],
            data: [
                {val: 25},
                {val: 50},
                {val: 100},
                {val: 200},
                {val: 500}
            ]
        },
        listeners: {
            // itemcontextmenu: 'onItemContextMenu'
        },
        // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                '->',
                {
                    text: _('Refresh'),
                    handler: 'onRefresh'
                }
            ]
        }]
    }]
});

