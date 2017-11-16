Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSynDevicePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'AlarmSynDevicePanel',
    requires: 'Admin.view.alarms.AlarmSynMgt.AlarmSynDeviceSelection',
    syn_task_id: '',
    areaTable: '',
    create_user: '',
    isEdit: false,
    task_id: '',
    dirty:false,
    controller:{
    	selectDevice:function(){
            var controller = this;
            var deviceTree = controller.lookupReference('deviceTree');
            var deviceTreeStore = deviceTree.getStore();   
            if(deviceTreeStore.getData().items[0]&&deviceTreeStore.getData().items[0].get('symbol_id')=='-1'){
                this.onBeforeitemexpand(deviceTreeStore.getData().items[0],'showPopWindow');
            }else{
                this.showPopWindow();
            }
        },
        showPopWindow: function(){
            var controller = this;
            var deviceTree = this.lookupReference('deviceTree');
            var deviceTreeStore = deviceTree.getStore();
            var AlarmSynDeviceSelection = Ext.create('Admin.view.alarms.AlarmSynMgt.AlarmSynDeviceSelection');
            var treeAfterSelect = AlarmSynDeviceSelection.lookup('treeAfterSelect');
            var treeForSelect = AlarmSynDeviceSelection.lookup('treeForSelect');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            var stid = this.getView().syn_task_id;
            var table = this.getView().areaTable;
            if(this.getView().isEdit){
                // treeAfterSelect.setStore(deviceTreeStore);
                controller.copyStore(deviceTreeStore,afterSelectStore);
                AlarmSynDeviceSelection.action = 'edit';
                AlarmSynDeviceSelection.syn_task_id = stid;
                AlarmSynDeviceSelection.areaTable = table;
                if(APP.user=='administrator'||APP.user==this.getView().create_user){
                    AlarmSynDeviceSelection.isOtherUser = false;
                    forSelectStore.reload();
                }else{
                    AlarmSynDeviceSelection.isOtherUser = true;//lefttree is bounded
                    forSelectStore.setProxy({
                        type: 'ajax',
                        url: '/alarm_node/alarm_sync_topo_tree/tree?symbol_id=0',
                        actionMethods : {  
                            create : 'POST',
                            read   : 'POST',
                            update : 'POST',
                            destroy: 'POST'   
                            },  
                        extraParams:{'syn_task_id':stid, 'areaTable': table, 'isOtherUser':true },
                        reader: {
                            type: 'json'
                        }
                    });
                    forSelectStore.reload();
                }
            }else{
                AlarmSynDeviceSelection.isOtherUser = false;
                AlarmSynDeviceSelection.action = 'add';
                AlarmSynDeviceSelection.syn_task_id = '';
                AlarmSynDeviceSelection.areaTable = '';
                forSelectStore.reload();
            }
    
            if(deviceTreeStore.getData().items.length>0){
                controller.copyStore(deviceTreeStore,afterSelectStore);
                // treeAfterSelect.setStore(deviceTreeStore);
            }

            var popWindow = Ext.create("Ext.window.Window", {
                title: '选择管理域',
                closable: true,
                autowidth: true,
                autoheight: true,
                border: false,
                layout: 'fit',
                items: AlarmSynDeviceSelection,
                closeAction: 'hide',
                width: 800,
                height: 600,
                maximizable: true,
                minimizable: true,
                modal: true,
                buttons: [{
                    xtype: "button",
                    text: "确定",
                    handler: function() {
                        controller.copyStore(afterSelectStore,deviceTreeStore);
                        if(AlarmSynDeviceSelection.dirty){
                            controller.getView().dirty = true;
                        }
                        popWindow.close();
                    }
                },{
                    xtype: "button",
                    text: "取消",
                    handler: function() {
                        popWindow.close();
                    }
                }]
            });
            popWindow.show();
        },
        copyStore: function(firStore,secStore){
            secStore.getRoot().removeAll();
            secStore.remove(secStore.getData().items);
            var topoRoot = firStore.getData().items[0]
            var rootNode = secStore.getRoot();
            this.copyNode(topoRoot,rootNode);
        },
        cloneNode: function(node,nodeClone){
            for(var i in node.childNodes){
                var childNode = node.childNodes[i];
                var childClone = childNode.clone();
                nodeClone.appendChild(childClone);
                if(!childNode.isLeaf()){
                    this.cloneNode(childNode,childClone);
                }
            }
        },
        copyNode: function(selection,rootNode){
            var node = selection.clone();
            for(var i in selection.childNodes){
                var childNode = selection.childNodes[i];
                if(!childNode.isLeaf()){
                    this.copyNode(childNode,node);
                }else{
                    node.appendChild(childNode.clone());
                }
            }
            rootNode.appendChild(node);
        },
        deleteDevice: function(){
            this.getView().dirty = true;
            var deviceTree = this.lookupReference('deviceTree');
            var selections = deviceTree.getSelection();
            var treeStore = deviceTree.getStore();
            // treeStore.remove(selections);
            //检查每个非leaf节点是否有子节点，没有的话要删除
            for(var i in selections){
                if(selections[i].parentNode){
                    selections[i].parentNode.data = Ext.apply(selections[i].parentNode.getData(), { category: 2 });
                }
            	selections[i].remove();
             }
            var data = treeStore.getData().items;
            for(var i in data){
            	if(data[i].get('res_type_name')=='TOPO_SUBNET'){
            		if(!data[i].hasChildNodes()){
                        data[i].remove();
            		}
            	}
            }
        },
        onSelectionchange: function(me, selected, eOpts ){
            console.log("**************AlarmSynDevicePanel:onSelectionchange**************");
            var deleteDeviceBt = this.lookupReference('deleteDeviceBt');
            if(selected.length>0){
                deleteDeviceBt.setDisabled(false);
            }else{
                deleteDeviceBt.setDisabled(true);
            }
        },
        onBeforeitemexpand: function(node,event){
            console.log("**************AlarmSynDevicePanel:onBeforeitemexpand**************");
            var stid = this.getView().syn_task_id;
            var table = this.getView().areaTable;
            var creator = this.getView().create_user;
            var controller = this;
            if(stid=='1'&&node.get('symbol_id')=='-1'&&this.getView().isEdit){
                node.remove();    
                var deviceTree = this.lookupReference('deviceTree');
                var deviceTreeStore = deviceTree.getStore();
                deviceTreeStore.setProxy({
                    type: 'ajax',
                    url: '/topo/topo_tree/tree',
                    extraParams: {symbol_id: 0},
                    reader: {
                        type: 'json'
                    }
                });
                deviceTreeStore.load({
                    callback: function(records, operation, success) {
                        if(records.length>0&&records[0].get('symbol_id')==0){
                            records[0].set('text',_('设备'));
                        }
                    }
                });
            }else if(node.get('symbol_id')=='-1'&&this.getView().isEdit){
                node.remove();    
                if(stid==null||stid==''){
                    return;
                }
                if(table==null||table==''){
                    return;
                }
                var deviceTree = this.lookupReference('deviceTree');
                var deviceTreeStore = deviceTree.getStore();
                deviceTreeStore.setProxy({
                    type: 'ajax',
                    // url: '/alarm_node/alarm_sync_topo_tree/tree?symbol_id=0',
                    url: '/alarm_node/alarm_sync_topo_tree/all_area_tree',
                    actionMethods : {
                        create : 'POST',
                        read   : 'POST',
                        update : 'POST',
                        destroy: 'POST'
                        },
                    extraParams:{'syn_task_id':stid, 'areaTable': table, 'create_user': creator},
                    reader: {
                        type: 'json'
                    }
                });
                deviceTreeStore.load({
                    callback: function(records, operation, success) {
                        if(records.length>0&&records[0].get('symbol_id')==0){
                            records[0].set('text',_('设备'));
                        }
                        if(event=='showPopWindow'){
                            controller.showPopWindow();
                        }
                    }
                });
            }else if(this.getView().isEdit){
                var childcount=node.childNodes.length;
                if(node.childNodes[0].get('symbol_id')!='loading'){
                    return;
                }else{
                    for(var i=0;i<childcount;i++){
                        node.childNodes[0].remove();
                    }
                }
                Ext.Ajax.request({
                    url: '/alarm_node/alarm_sync_topo_tree/tree?symbol_id=' + node.get('symbol_id'),
                    method: 'post',
                    params:{'syn_task_id':stid, 'areaTable': table},
                    success: function(response){
                        var r=Ext.decode(response.responseText).children;
                        for(var i=0;i<r.length;i++){
                            node.appendChild(r[i]);
                            if(!node.lastChild.isLeaf()){
                                if(!node.lastChild.get('category')){
                                    node.lastChild.data = Ext.apply(node.lastChild.getData(), { category: 1 });
                                }
                            }
                        }
                        if(!node.lastChild.isLeaf()){
                            node.lastChild.triggerUIUpdate();
                        }
                    }
                });
            }else{
                var symbolId=node.data.symbol_id; 
                if(symbolId!=0&&!isNaN(symbolId)){
                    var childcount=node.childNodes.length;
                    if(node.childNodes[0]){
                        if(!(node.childNodes[0].get('symbol_id')=='loading')){
                            return;
                        }else{
                            for(var i=0;i<childcount;i++){
                                node.childNodes[0].remove();
                            }
                        }
                    }else{
                        return;
                    }
                    // if(!(node.childNodes[0].get('symbol_id')=='loading')){
                    //     return;
                    // }else{
                    //     for(var i=0;i<childcount;i++){
                    //         node.childNodes[0].remove();
                    //     }
                    // }
                    Ext.Ajax.request({
                        url: '/topo/topo_tree/tree?symbol_id=' + symbolId,
                        success: function(response){
                            var r=Ext.decode(response.responseText).children;
                            for(var i=0;i<r.length;i++){
                                node.appendChild(r[i]);
                                if(!node.lastChild.isLeaf()){
                                    node.lastChild.data = Ext.apply(node.lastChild.getData(), { category: 1 });
                                }
                            }
                            if(!node.lastChild.isLeaf()){
                                node.lastChild.triggerUIUpdate();
                            }
                        }
                    });
                }
            }
        },
        getChildSymbolID: function(rootNode,controller){
            var selected = '';
            rootNode.eachChild(function(child){
                selected = selected.concat(child.get('symbol_id'),',');
                if(!child.isLeaf()){
                    selected = selected.concat(controller.getChildSymbolID(child,controller));
                }
            });
            return selected;
        },
        getAllSymbolID: function(){
            var deviceTree = this.lookupReference('deviceTree');
            var treeStore = deviceTree.getStore();
            var rootNode = treeStore.getData().items[0];
            var symbolID;
            if(rootNode){
                symbolID = this.getChildSymbolID(rootNode,this);
            }
            else{
                Ext.Msg.alert(_('请选择要同步的网元'));
            }
            return symbolID;
        },
        getChildInfo: function(rootNode,controller,map){
            rootNode.eachChild(function(child){
                var maptemp = new Ext.util.HashMap();
                maptemp.add('res_id',child.get('res_id'));
                maptemp.add('res_type_name',child.get('res_type_name'));
                if(!child.isLeaf()){
                    if(!child.get('category')){
                        maptemp.add('category','1');
                    }else{
                        maptemp.add('category',child.get('category'));
                    }
                }else{
                    maptemp.add('category',child.get('category'));
                }
                map.add(child.get('symbol_id'), maptemp.map);
                if(!child.isLeaf()){
                    controller.getChildInfo(child,controller,map);
                }
            });
        },
        //symbol_id就是MAP的KEY
        getAllInfo: function(){
            var deviceTree = this.lookupReference('deviceTree');
            var treeStore = deviceTree.getStore();
            var rootNode = treeStore.getData().items[0];
            var map = new Ext.util.HashMap();
            if(rootNode){
                var info = this.getChildInfo(rootNode,this,map);
                var maptemp = new Ext.util.HashMap();
                maptemp.add('res_id',rootNode.get('res_id'));
                maptemp.add('res_type_name',rootNode.get('res_type_name'));
                if(rootNode.get('category')){
                    maptemp.add('category',rootNode.get('category'));
                }else{
                    maptemp.add('category','2');
                }
                map.add('0', maptemp.map);
            }else{
                Ext.Msg.alert(_('请选择要同步的网元'));
            }
            map.removeAtKey('loading');
            return map.map;
        },
        hasEdited: function(){
            return this.getView().dirty;
        },
        initEdit: function(task_id, creator, table){
            if(task_id==null||task_id==''){
                return;
            }
            if(table==null||table==''){
                return;
            }
            this.getView().syn_task_id = (task_id+'').trim();
            this.getView().areaTable = table.trim();
            this.getView().create_user = creator.trim();
            this.getView().isEdit = true;
            this.getView().dirty = false;
            var store = Ext.create('Ext.data.TreeStore', {
                    root: {
                        expanded: true,
                        children: [
                            { text: _('设备'), leaf: false, iconCls: "resource_newtopo_image_16x16_root_1", symbol_id: '-1' },
                        ]
                    },
                    sorters:'symbol_id'
                });
            var treepanel = this.getView().down('treepanel');
            if(task_id==1){
                this.lookupReference('toolbar').setDisabled(true);
            }else{
                this.lookupReference('toolbar').setDisabled(false);
            }
            this.getView().task_id = task_id;
            treepanel.setStore(store);
        },
        initAdd: function(){
            this.getView().syn_task_id = '';
            this.getView().areaTable = '';
            this.getView().isEdit = false;
            this.lookupReference('toolbar').setDisabled(false);
            var store = Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true
                }
            });
            var treepanel = this.getView().down('treepanel');
            treepanel.setStore(store);
        }
    },
    items:[{
        reference: 'deviceTree',
        xtype: 'treepanel',
        rootVisible: false,
        store:{
            data: {
                text: 'Ext JS',
                expanded: true
            }
        },
        viewConfig: {markDirty: false},
        listeners: {
            selectionchange:'onSelectionchange',
            beforeitemexpand: 'onBeforeitemexpand'
        }
    }],
    dockedItems: [{
        xtype: 'toolbar',
        reference: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        defaults: {
            minWidth: 80,
            margin: 3
        },
        items: [
        { 	xtype: 'component', flex: 1 },
        { 	xtype: 'button', text: _('Select'), iconCls: 'x-fa fa-save', handler: 'selectDevice' },
        { 	xtype: 'button', reference: 'deleteDeviceBt', disabled: true, text: _('Delete'), iconCls: 'x-fa fa-close', handler: 'deleteDevice'  }
        ]
    }]
});