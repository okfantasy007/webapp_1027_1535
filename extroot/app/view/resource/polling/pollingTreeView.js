/*
Ext.define('Admin.view.resource.polling.pollingTreeView', {
    extend: 'Ext.tree.Panel',
    xtype:'pollingTreeView',

    controller: {
        onExpandAll: function() {
            this.getView().expandAll();
        },
        onCollapseAll: function() {
            this.getView().collapseAll();
        },
        onNodeSelect:function(self, records, eOpts){

            if(records.length>0){
                if(records[0].data.id == 'root'){
                    this.getView().expandAll();
                }else{
                    var tree = this.getView();
                    var grid = tree.up().down('PagedGrid');
                    var store = grid.getStore();
                    store.proxy.extraParams = {time: records[0].data.time};
                    store.reload();
                }
            }    
            
        },
        onRender:function(){
          var record = this.getView().getStore().getNodeById('2');
          this.getView().getSelectionModel().select(record);
        }
    },

    rootVisible: true,

    store : {
        root: {
            text:'轮询配制',
            expanded:true,
            children:[
            {
                id:'1',
                time:'60',
                text:'60秒',
                leaf:true,
            },
            {
                id:'2',
                time:'300',
                text:'5分钟',
                leaf:true,

            },
            {
                id:'3',
                time :'900',
                text:'15分钟',
                leaf:true,

            },
            {
                id:'4',
                time :'1800',
                text:'30分钟',
                leaf:true,

            },
            {
                id:'5',
                time :'3600',
                text:'60分钟',
                leaf:true,

            },
            {
                id:'6',
                time :'0',
                text:'不轮询',
                leaf:true,

            }]

        },

    },

    listeners:{
        selectionchange : 'onNodeSelect',
        afterrender:'onRender',
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [
        {
            text: _('Full Expand'),
            iconCls:'x-fa fa-expand',
            handler: 'onExpandAll'
        },
        {
            text: _('Collapse All'),
            iconCls:'x-fa fa-compress',
            handler: 'onCollapseAll',
        },           ]
    }],
});
*/