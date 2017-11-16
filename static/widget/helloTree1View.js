Ext.define('widget.helloTree1View', {
    extend: 'Ext.container.Container',
    
    // 指定布局
    layout: 'fit',

    // 指定panel边缘的阴影效果
    cls: 'shadow',

    controller: {
        onRefresh: function() {
            this.lookupReference('demoTree').getStore().reload();
        },
        onExpandAll: function() {
            this.lookupReference('demoTree').expandAll();
        },
        onCollapseAll: function() {
            this.lookupReference('demoTree').collapseAll();
        },
    },

    items: [
    {
        title: '读取远程store的tree',
        xtype: 'treepanel',
        reference: 'demoTree',
        rootVisible: false,

        store : {
            fields: [{
                name: 'text'
            }],
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: '/resource/tree',
                // url: '/nnm/json/get_topo_device_tree',
                reader: {
                    type: 'json'
                }
            }
        },

        tbar: [
            {
                text: _('Full Expand'),
                handler: 'onExpandAll'
            },
            {
                text: _('Collapse All'),
                handler: 'onCollapseAll'
            },
            '->',
            {
                text: _('Refresh'),
                handler: 'onRefresh'
            }
        ]

    }]
});
