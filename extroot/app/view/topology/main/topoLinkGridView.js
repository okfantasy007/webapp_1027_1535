Ext.define('Admin.view.topology.main.topoLinkGridView', {
    extend: 'Ext.container.Container',

    requires: [
        'Admin.view.base.PagedGrid'
    ],
    xtype: 'topoLinkGridView',
    // 指定布局
    layout: 'card',
    // 指定panel边缘的阴影效果
    cls: 'shadow',

    viewModel: {
        stores: {
            // 远程store
            link_grid_store: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 50,
                proxy: {
                    type: 'ajax',
                    url: '/topo/topo_link/link_info',
                    extraParams: {
                        param: ''
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty : 'total'
                    }
                }
            }
        }
    },

    controller: {
        onRefresh: function() {
            this.lookupReference('linkGrid').getStore().reload();
        },
        onChange: function(newValue, oldValue, eOpts) {
            var grid = this.lookupReference('linkGrid');
            grid.store.proxy.extraParams = {param: newValue.value};
            grid.store.reload();
        },
        onSelectionChange:function(me, selected, eOpts){
            var selectedLenght = selected.length;
            var selectExportBtn = this.lookupReference('selectExportBtn');
            if(selectedLenght>0){
                selectExportBtn.setDisabled(false);
            }else{
                selectExportBtn.setDisabled(true);
            }
        },
        //导出功能Add by:luoli
        onExportAll:function(){
            var grid = this.lookupReference('linkGrid');
            location.href ="/topo/topo_link/link_info/exportAll/datacsv?"+Ext.Object.toQueryString(grid.store.proxy.extraParams);
        },
        onExportCurrentPage:function(){
            var grid = this.lookupReference('linkGrid');
            var currentPage=grid.store.currentPage;
            var pageSize=grid.store.pageSize;
            var start=(currentPage-1)*pageSize;
            var params=grid.store.proxy.extraParams;
            params.start2=start;
            params.limit2=pageSize;
            location.href ="/topo/topo_link/link_info/exportCurrentPage/datacsv?"+Ext.Object.toQueryString(params);
        },
        onExportSelected:function(){
             var grid = this.lookupReference('linkGrid');
             var records = grid.getSelectionModel().getSelection(),
             ids = [];
            for (var i in records) {
                ids.push(records[i].data.link_symbol_id);
            }
             var send_info = new Object();
             send_info.ids=ids;
            location.href = "/topo/topo_link/link_info/exportSelected/datacsv?" + Ext.Object.toQueryString(send_info);
        }
    },

    items: [
    {
        xtype: 'PagedGrid',
        reference: 'linkGrid',
        columnLines : true,
		rowLines : true,
		flex : 1,
		layout : 'fit',
        autoScroll: true,
		border : false,
        // 绑定到viewModel的属性
        bind: {
            store: '{link_grid_store}',
        },

        selType: 'checkboxmodel',

        // grid显示字段
        columns: [
            // { xtype: 'rownumberer', width: 80, sortable: false, align: 'center' }, 
            { text: _('Link Symbol ID'),  dataIndex: 'link_symbol_id', width: 100, menuDisabled : true },
            { text: _('A Node'),  dataIndex: 'anode_name', width: 180, menuDisabled : true },
            { text: _('Z Node'),  dataIndex: 'znode_name', width: 180, menuDisabled : true },
            { text: _('Link Name'),  dataIndex: 'link_name1', width: 150, menuDisabled : true },
            { text: _('Remark'),  dataIndex: 'remark', width: 150, menuDisabled : true },
            { text: _('Link Direction'),  dataIndex: 'direction', width: 100, menuDisabled : true,
                renderer: function (v,m,r){
                    if (v == 1) {
                        return _('Unidirection');
                    }
                    if (v == 2) {
                        return  _('Bidirection');
                    }
                    
                    return v;
                } 
            },
            { text: _('Link Type'),  dataIndex: 'topo_type_name', flex: 1, menuDisabled : true }
            
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
                {val: 500},
                {val: 1000},
                {val: 2000},
            ]
        },
        // 自定义工具条
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {
                    text: _('Export'),
                    iconCls:'x-fa fa-download',
                    menu:[{
                        text:_('Export All'),
                        iconCls: 'property_export_excel_menu',
                        handler:'onExportAll'
                    },{
                        text:_('current page'),
                        iconCls: 'property_export_excel_menu',
                        handler:'onExportCurrentPage'
                    },{
                        text:_('selected'),
                        reference: 'selectExportBtn',
                        iconCls: 'property_export_excel_menu',
                        handler:'onExportSelected',
                        disabled: true
                    }]
                },
                '->',
                {
                    itemId: 'func_ids',
                    xtype: 'textfield',
                    padding : '0 5 0 0',
                    name: 'func_ids',
                    width: 200,
                    emptyText: _('Fuzzy Search'),
                    listeners: {
                        change: 'onChange'
                    }
                },
                '-',
                {
                    text: _('Refresh'),
                    handler: 'onRefresh'
                }
            ]
        }],
        listeners: {
            selectionchange:'onSelectionChange',
        }
    }]
});

