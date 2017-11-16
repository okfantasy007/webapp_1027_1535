Ext.define('Admin.view.security.model.userLeftTree.userLeftTree', {
    extend: 'Ext.data.Model',
    proxy: {
        type: 'ajax',
        url: '/security/init_split_tree',
        //url:'/security/test/tree',
        reader: {
            type: 'json',
            rootProperty: 'children',
        }
    }
});