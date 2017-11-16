Ext.define('Admin.view.alarms.AlarmSynMgt.AlarmSynDeviceSelection', {
    extend: 'Ext.container.Container',
    xtype: 'AlarmSynDeviceSelection',
    selectedIcon: 'alarmSyn_select_icon',
    frame: true,
    syn_task_id: '',
    areaTable: '',
    margin: -2,
    bodyPadding: 10,
    layout: 'hbox',
    isOtherUser: false,
    action:'add',
    defaults: {
        height: '100%'
    },
    dirty:false,
    loaded: false,
    controller: {
        onSelect: function(){
            this.getView().dirty = true;
            var controller = this;
            var treeForSelect = this.lookupReference('treeForSelect');
            var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            var selections = treeForSelect.getSelection();
            var rootN = afterSelectStore.getRoot();
            var rootNode;
            if(selections.length>0){
                if(afterSelectStore.getData().items.length==0){
                    rootNode = forSelectStore.getData().items[0].clone();
                    rootN.appendChild(rootNode);
                }else{
                    rootNode = afterSelectStore.getData().items[0];
                }
            }
            for(var i in selections){
                var selected = this.getAllSymbolID(rootNode,controller);
                var selection = selections[i];
                if(selection.get('symbol_id')==0){
                    controller.onSelectAll();
                    break;
                }
                if(selection.get('iconCls')!=this.getView().selectedIcon&&selection.get('tree_parent_id')==0){
                    if(selection.get('res_type_name')=='NE'){
                        rootNode.appendChild(selection.clone());
                        selection.set('iconCls',this.getView().selectedIcon);
                    }else if(selection.get('res_type_name')=='TOPO_SUBNET'){
                        selection.data = Ext.apply(selection.getData(), { category: 1 });
                        this.copyNode(selection,rootNode);
                    }
                }
                if(selection.get('iconCls')!=this.getView().selectedIcon&&selection.get('tree_parent_id')!=0){
                    var selectionClone = selection.clone();
                    var parentClone = this.findParent(selection,selected,selectionClone);
                    if(selected.indexOf(','+parentClone.get('symbol_id')+',')==-1){
                        selectionClone.parentNode.data = Ext.apply(selectionClone.parentNode.getData(), { category: 2 });
                        rootNode.appendChild(parentClone);
                    }else{
                        var parent = afterSelectStore.getNodeById(parentClone.get('symbol_id'));
                        var dirparent = afterSelectStore.getNodeById(selectionClone.parentNode.get('symbol_id'));
                        if(dirparent.get('category')!=1){
                            dirparent.data = Ext.apply(dirparent.getData(), { category: 2 });
                            dirparent.appendChild(selectionClone);
                            dirparent.sort();
                        }
                    }
                    if(!selection.isLeaf()){
                        selection.data = Ext.apply(selection.getData(), { category: 1 });
                        var parent = selectionClone.parentNode;
                        var iconCls = selectionClone.get('iconCls');
                        selectionClone.remove();
                        this.copyNode(selection,parent);
                        parent.lastChild.set('iconCls',iconCls);
                        parent.sort();
                    }
                }
                if(selected.indexOf(','+selection.get('symbol_id')+',')>=0&&!selection.isLeaf()&&selection.get('symbol_id')!=0){
                    var selectionClone = afterSelectStore.getNodeById(selection.get('symbol_id'));
                    if(selectionClone.get('category')!='1'){
                        selectionClone.data = Ext.apply(selectionClone.getData(), { category: 1 });
                        this.onRightTreeBeforeItemExpand(selectionClone,'reload');
                        this.changeIcon(selection,controller);
                    }
                }
            }
            rootNode.triggerUIUpdate();
            rootNode.sort();
            var deselect_allBt = this.lookupReference('deselect_all');
            deselect_allBt.setDisabled(false);
        },
        findParent: function(node,selected,nodeClone){
            var controller = this;
            node.set('iconCls',this.getView().selectedIcon);
            var parentNode = node.parentNode;
            var parentClone = parentNode.clone();
            parentClone.appendChild(nodeClone);
            if(selected.indexOf(','+parentNode.get('symbol_id')+',')==-1){
                if(parentNode.get('tree_parent_id')==0){
                    parentNode.set('iconCls',controller.getView().selectedIcon);
                    return parentClone;
                }else{
                    return this.findParent(parentNode,selected,parentClone);
                }
            }else{
                return parentClone;
            }
        },
        getAllSymbolID: function(rootNode,controller){
            var selected = ',';
            rootNode.eachChild(function(child){
                if(!child.isLeaf()){
                    selected = selected.concat(child.get('symbol_id'));
                    selected = selected.concat(controller.getAllSymbolID(child,controller));
                }else{
                    selected = selected.concat(child.get('symbol_id'),',');
                }
            });
            return selected;
        },
        copyNode: function(selection,rootNode){
            var node = selection.clone();
            for(var i in selection.childNodes){
                var childNode = selection.childNodes[i];
                if(!childNode.isLeaf()){
                    node.data = Ext.apply(node.getData(), { category: 1 });
                    this.copyNode(childNode,node);
                }else{
                    node.appendChild(childNode.clone());
                }
                childNode.set('iconCls',this.getView().selectedIcon);
            }
            rootNode.appendChild(node);
            selection.set('iconCls',this.getView().selectedIcon);
        },
        onBeforeItemExpand:function(node,optd){ 
            // if(this.getView().action=='edit'){
            //     this.addChildforEdit(node);
            // }else if(this.getView().action=='add'){
                this.syncAddChild(node);
            // }
            
        },

        addChild: function(node,rootNode,controller,iconCls){
            var symbolId=node.data.symbol_id; 
            if(symbolId!=0&&!isNaN(symbolId)){
                var childcount=node.childNodes.length;
                if(childcount>0){
                    if(node.childNodes[0].get('symbol_id')!='loading'&&(!rootNode)){
                        return;
                    }else{
                        for(var i=0;i<childcount;i++){
                            node.childNodes[0].remove();
                        }
                    }
                }

                Ext.Ajax.request({
                    url: '/topo/topo_tree/tree?symbol_id=' + symbolId,
                    success: function(response){
                        var r=Ext.decode(response.responseText).children;
                        var childNode = node.clone();
                        if(iconCls){
                            childNode.set('iconCls',iconCls);
                        }
                        for(var i=0;i<r.length;i++){
                            node.appendChild(r[i]);
                            if(rootNode){
                                if(node.lastChild.isLeaf()){
                                    childNode.appendChild(Ext.clone(r[i]));
                                }else{
                                    controller.addChild(node.lastChild,childNode,controller,node.lastChild.get('iconCls'));
                                }
                                node.set('iconCls','alarmSyn_select_icon');
                                node.lastChild.set('iconCls','alarmSyn_select_icon');
                            }else{
                                if(!node.lastChild.isLeaf()){
                                    controller.addChild(node.lastChild,false,controller,false);
                                }
                            }
                        }
                        if(rootNode){
                            rootNode.appendChild(childNode);
                            rootNode.triggerUIUpdate();
                            rootNode.sort();
                        }
                    }
                });
            }
        },

        selectTreeNode: function(symbolid) {
            var treeForSelect = this.lookupReference('treeForSelect');
            var record = treeForSelect.getStore().getNodeById(symbolid);
            if(record!=null){
                var path=record.getPath();
                treeForSelect.selectPath(path);
            }
        },

        onDeSelect: function(){
            this.getView().dirty = true;
            var controller = this;
            var treeForSelect = this.lookupReference('treeForSelect');
            var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            var selections = treeAfterSelect.getSelection();
            while(selections.length > 0){
                var selection = selections[0];
                if(!selection.isLeaf()){
                    var symbolids = this.getAllSymbolID(selection,controller);
                    var leftNode = forSelectStore.getNodeById(selection.get('symbol_id'));
                    if(leftNode){
                        if(leftNode.childNodes[0].get('symbol_id')!='loading'){
                            this.loadRawNode(leftNode);
                        }
                    }
                    selections = selections.filter(element => symbolids.indexOf(','+element.get('symbol_id')+',')==-1);
                }
                this.checkParentNode(selection);
                var symbolid = selection.get('symbol_id');
                var iconCls = selection.get('iconCls');
                if(forSelectStore.getNodeById(symbolid)){
                    forSelectStore.getNodeById(symbolid).set('iconCls',iconCls);
                }
                selections = selections.filter(element => element.get('symbol_id')!=symbolid);
                selection.parentNode.data = Ext.apply(selection.parentNode.getData(), { category: 2 });
                selection.remove();
            }
            if(afterSelectStore.getData().items.length<=1){
                var deselect_allBt = this.lookupReference('deselect_all');
                deselect_allBt.setDisabled(true);
            }
        },
        checkParentNode:function(selection){
            var treeForSelect = this.lookupReference('treeForSelect');
            // var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var forSelectStore = treeForSelect.getStore();
            var childcount = selection.parentNode.childNodes.length;
                if(childcount==1){//如果没有子节点，父节点会被删除
                    var iconCls = selection.parentNode.get('iconCls');
                    var parentid = selection.parentNode.get('symbol_id');
                    if(forSelectStore.getNodeById(parentid)){
                        forSelectStore.getNodeById(parentid).set('iconCls',iconCls);
                    }
                    if(selection.get('symbol_id')!=0){
                        this.checkParentNode(selection.parentNode);
                    }else{
                        return;
                    }
                    if(selection.parentNode.parentNode){
                        selection.parentNode.parentNode.data = Ext.apply(selection.parentNode.parentNode.getData(), { category: 2 });
                    }
                    selection.parentNode.remove();
                }
        },
        loadRawNode: function(node){
            if(!node.isLeaf()){
                if(node.childNodes[0].get('symbol_id')!='loading'){
                    for(var i in node.childNodes){
                        var child = node.childNodes[i];
                        if(!child.isLeaf()){
                            this.loadRawNode(child);
                        }
                    }
                    this.palneNodeReload(node);
                }
            }
        },
        onSelectAll: function(){
            this.getView().dirty = true;
            var controller = this;
            var treeForSelect = this.lookupReference('treeForSelect');
            var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            afterSelectStore.setProxy({
                type: 'ajax',
                url: '/topo/topo_tree/tree',
                extraParams: {symbol_id: 0},
                reader: {
                    type: 'json'
                }
                
            });
            afterSelectStore.load({
                callback: function(records, operation, success) {
                    if(records.length>0){
                        records[0].set('text','设备');
                        var node = forSelectStore.getData().items[0];
                        controller.changeIcon(node,controller);
                    }
                    records[0].data = Ext.apply(records[0].getData(), { category: 1 });
                    for(var i in records[0].childNodes){
                        var record = records[0].childNodes[i];
                        if(!record.isLeaf()){
                            record.data = Ext.apply(record.getData(), { category: 1 });
                        }
                    }
                }
            });
        },
        changeIcon: function(node,controller){
            node.eachChild(function(child){
                child.set('iconCls',controller.getView().selectedIcon);
                if(!child.isLeaf()){
                    controller.changeIcon(child,controller);
                }
            });
        },
        loadAllChild: function(rootNode){
            var controller = this;
            rootNode.eachChild(child=>{
                if(!child.isLeaf()){
                    controller.addChild(child,false,controller,false);
                }
            });
        },
        onDeSelectAll: function(){
            this.getView().dirty = true;
            var controller = this;
            var treeForSelect = this.lookupReference('treeForSelect');
            var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var forSelectStore = treeForSelect.getStore();
            var afterSelectStore = treeAfterSelect.getStore();
            afterSelectStore.getRoot().removeAll();
            afterSelectStore.remove(afterSelectStore.getData().items);
            forSelectStore.reload();
            var deselect_allBt = this.lookupReference('deselect_all');
            deselect_allBt.setDisabled(true);
        },
        addChildforEdit: function(node){
            var controller = this;
            var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var afterSelectStore = treeAfterSelect.getStore();
            var rootNode = afterSelectStore.getData().items[0];
            var treeForSelect = this.lookupReference('treeForSelect');
            var forSelectStore = treeForSelect.getStore();
            var hasNode = afterSelectStore.getNodeById(node.get('symbol_id'));
            var stid = this.getView().syn_task_id;
            var table = this.getView().areaTable;
            if(hasNode){
                var childcount=hasNode.childNodes.length;
                if(hasNode.childNodes[0].get('symbol_id')!='loading'){
                    controller.syncAddChild(node);
                    return;
                }else{
                    node.childNodes[0].remove();
                    for(var i=0;i<childcount;i++){
                        hasNode.childNodes[0].remove();
                    }
                }
                Ext.Ajax.request({
                    url: '/alarm_node/alarm_sync_topo_tree/tree?symbol_id=' + hasNode.get('symbol_id'),
                    method: 'post',
                    params:{'syn_task_id':stid, 'areaTable': table},
                    success: function(response){
                        var r=Ext.decode(response.responseText).children;
                        for(var i=0;i<r.length;i++){
                            hasNode.appendChild(r[i]);
                            if(!hasNode.lastChild.isLeaf()){
                                if(!hasNode.lastChild.get('category')){
                                    hasNode.lastChild.data = Ext.apply(hasNode.lastChild.getData(), { category: 1 });
                                }
                            }
                        }
                        if(!hasNode.lastChild.isLeaf()){
                            hasNode.lastChild.triggerUIUpdate();
                        }
                        controller.syncAddChild(node,'reload');
                    }
                });
            }else{
                controller.syncAddChild(node);
            }
        },
        syncAddChild: function(node,reload){//forAdd
            var controller = this;
            var treeAfterSelect = this.lookupReference('treeAfterSelect');
            var afterSelectStore = treeAfterSelect.getStore();
            var rootNode = afterSelectStore.getData().items[0];
            var treeForSelect = this.lookupReference('treeForSelect');
            var forSelectStore = treeForSelect.getStore();
            var hasNode = afterSelectStore.getNodeById(node.get('symbol_id'));
            var symbolId=node.data.symbol_id; 
            if(symbolId!=0&&!isNaN(symbolId)){
                var childcount=node.childNodes.length;
                if(!(reload=='reload'||node.childNodes[0].get('symbol_id')=='loading')){
                    return;
                }else{
                    for(var i=0;i<childcount;i++){
                        node.childNodes[0].remove();
                    }
                }
                var myurl,mymethod;
                if(this.getView().isOtherUser==true){
                    myurl = '/alarm_node/alarm_sync_topo_tree/tree?symbol_id=' + symbolId;
                    mymethod = 'post';
                }else{
                    myurl = '/topo/topo_tree/tree?symbol_id=' + symbolId;
                    mymethod = 'get';
                }
                Ext.Ajax.request({
                    url: myurl,
                    method: mymethod,
                    params:{'syn_task_id':controller.getView().syn_task_id, 'areaTable': controller.getView().areaTable},
                    success: function(response){
                        var r=Ext.decode(response.responseText).children;
                        if(rootNode){
                            var category = false;
                            var nodeArea;
                            if(hasNode){
                                category = hasNode.get('category');
                                nodeArea = hasNode;
                            }else{
                                var parent = controller.hasParent(node,afterSelectStore);
                                if(parent){
                                    category = parent.get('category');
                                    nodeArea = parent;
                                }
                            }
                            if(category){
                                if(category==1){//子网全集
                                    for(var i=0;i<r.length;i++){
                                        node.appendChild(r[i]);
                                        node.lastChild.set('iconCls',controller.getView().selectedIcon);
                                    }
                                }else if(category==2){//非子网全集
                                    for(var i=0;i<r.length;i++){
                                        node.appendChild(r[i]);
                                    }
                                    var selected = controller.getAllSymbolID(nodeArea,controller);
                                    var idArray =  selected.split(',');
                                    for(var i in idArray){
                                        var id = idArray[i];
                                        if(id==''){
                                            continue;
                                        }
                                        var getnode = forSelectStore.getNodeById(id);
                                        if(getnode){
                                            getnode.set('iconCls',controller.getView().selectedIcon);
                                        }
                                    }
                                }
                            }else{
                                for(var i=0;i<r.length;i++){
                                    node.appendChild(r[i]);
                                }
                            }
                        }else{
                            for(var i=0;i<r.length;i++){
                                node.appendChild(r[i]);
                            }
                        }
                        if(!node.lastChild.isLeaf()){
                            node.lastChild.triggerUIUpdate();
                        }
                    }
                });
            }
        },
        hasParent: function(node,store){
            if(node.parentNode.get('symbol_id')==0){
                return false;
            }else{
                var parent = store.getNodeById(node.parentNode.get('symbol_id'));
                if(parent){
                    return parent;
                }else{
                    return this.hasParent(node.parentNode,store);
                }
            }
        },
        onRightTreeBeforeItemExpand: function(node,reload){
            console.log("**************AlarmSynDeviceSelection:onRightTreeBeforeItemExpand**************");
            if(this.getView().action=='add'){
                var symbolId=node.data.symbol_id; 
                if(symbolId!=0&&!isNaN(symbolId)){
                    var childcount=node.childNodes.length;
                    if(node.childNodes[0]){
                        if(!(node.childNodes[0].get('symbol_id')=='loading'||reload=='reload')){
                            return;
                        }else{
                            for(var i=0;i<childcount;i++){
                                node.childNodes[0].remove();
                            }
                        }
                    }else{
                        return;
                    }
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
            }else if(this.getView().action=='edit'){
                var stid = this.getView().syn_task_id;
                var table = this.getView().areaTable;
                // var controller = this;
                if(node.get('symbol_id')=='-1'){
                    node.remove();    
                    if(stid==null||stid==''){
                        return;
                    }
                    if(table==null||table==''){
                        return;
                    }
                    var treeAfterSelect = this.lookupReference('treeAfterSelect');
                    var afterSelectStore = treeAfterSelect.getStore();
                    afterSelectStore.setProxy({
                        type: 'ajax',
                        url: '/alarm_node/alarm_sync_topo_tree/tree?symbol_id=0',
                        actionMethods : {  
                            create : 'POST',
                            read   : 'POST',
                            update : 'POST',
                            destroy: 'POST'   
                            },  
                        extraParams:{'syn_task_id':stid, 'areaTable': table},
                        reader: {
                            type: 'json'
                        }
                    });
                    afterSelectStore.load({
                        callback: function(records, operation, success) {
                            if(records.length>0&&records[0].get('symbol_id')==0){
                                records[0].set('text','设备');
                            }
                        }
                    });
                }else{
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
                }
            }
            
        },
        palneNodeReload: function(node){
            var symbolId=node.data.symbol_id; 
            if(symbolId!=0&&!isNaN(symbolId)){
                var childcount=node.childNodes.length;
                for(var i=0;i<childcount;i++){
                    node.childNodes[0].remove();
                }
                Ext.Ajax.request({
                    url: '/topo/topo_tree/tree?symbol_id=' + symbolId,
                    success: function(response){
                        var r=Ext.decode(response.responseText).children;
                        for(var i=0;i<r.length;i++){
                            node.appendChild(r[i]);
                        }
                        if(!node.lastChild.isLeaf()){
                            node.lastChild.triggerUIUpdate();
                        }
                    }
                });
            }
        },
        onSelectionchangef: function(me, selected, eOpts ){
            var selectBt = this.lookupReference('select');
            if(selected.length > 0){
                selectBt.setDisabled(false);
            }else{
                selectBt.setDisabled(true);
            }
        },
        onSelectionchangea: function(me, selected, eOpts ){
            console.log("**************AlarmSynDeviceSelection:onSelectionchangea**************");
            var deselect = this.lookupReference('deselect');
            if(selected.length > 0){
                deselect.setDisabled(false);
            }else{
                deselect.setDisabled(true);
            }
        }
    },
    items: [ 
    {
        flex: 1,
        xtype: 'panel',
        scrollable: true,
        layout: 'fit',
        items: [{
            xtype: 'treepanel',
            reference: 'treeForSelect',
            border: false,
            style: {
                'border': '2px solid #f5f5f5'
            },
            cls: 'shadow',
            multiSelect: true,
            rootVisible: false,
            lines: true,
            scrollable: true,
            viewConfig: {markDirty: false},
            store: {
                fields : [{
                    name : 'text',
                    type : 'string'
                }],
                autoLoad: false,
                onStoreLoad: function(me, records, successful, operation, eOpts){
                    records[0].set('text','设备');
                    me.loadData(records);
                    me.add(records[0].childNodes);
                    var treepanel = me.ownerTree;
                    var AlarmSynDeviceSelection = treepanel.up('AlarmSynDeviceSelection');
                    var controller = AlarmSynDeviceSelection.getController();
                    var treeAfterSelect = controller.lookupReference('treeAfterSelect');
                    var afterSelectStore = treeAfterSelect.getStore();
                    var rootNode = afterSelectStore.getData().items[0];
                    var selected;
                    if(rootNode){
                        selected = controller.getAllSymbolID(rootNode,controller);
                        var idArray =  selected.split(',');
                        for(var i in idArray){
                            var id = idArray[i];
                            if(id==''){
                                continue;
                            }
                            var node = me.getNodeById(id)
                            if(node){
                                node.set('iconCls',controller.getView().selectedIcon);
                            }
                        }
                    }

                },
                proxy: {
                    type: 'ajax',
                    url: '/topo/topo_tree/tree',
                    extraParams: {symbol_id: 0},
                    reader: {
                        type: 'json'
                    }
                },
                listeners: {
                    load: 'onStoreLoad'
                }
            },
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    xtype: 'label',
                    text: '待选成员',
                    margin: '0 0 0 8'
                }, '->', {
                    itemId: 'closeAll',
                    tooltip: _('Collapse All'),
                    handler: function () {
                        this.up('treepanel').collapseAll();
                    },
                    iconCls: 'x-fa fa-compress',
                    disabled: false
                }]
            }],
            listeners: {
                beforeitemexpand: 'onBeforeItemExpand',
                selectionchange:'onSelectionchangef'
            }
        }]
    },
    {
        xtype: 'fieldcontainer',
        // flex: 1,
        layout: 'center',
        width: 60,
        items: [{
            xtype: 'fieldcontainer',
            layout: 'vbox',
            defaultType: 'button',
            defaults: {
                width: 40,
                margin: 4
            },
            items: [
            {
                text: '>',
                reference: 'select',
                handler: 'onSelect',
                disabled: 'true'
            }, {
                text: '>>',
                reference: 'select_all',
                handler: 'onSelectAll'
            }, {
                text: '<',
                reference: 'deselect',
                handler: 'onDeSelect',
                disabled: 'true'
            }, {
                text: '<<',
                reference: 'deselect_all',
                handler: 'onDeSelectAll',
                disabled: 'true'
            }]
        }]
    },
    {
        flex: 1,
        xtype: 'panel',
        scrollable: true,
        layout: 'fit',
        items: [{
            xtype: 'treepanel',
            reference: 'treeAfterSelect',
            border: false,
            style: {
                'border': '2px solid #f5f5f5'
            },
            cls: 'shadow',
            multiSelect: true,
            rootVisible: false,
            lines: true,
            scrollable: true,
            viewConfig: {markDirty: false},
            store: {
                sorters:'symbol_id',
                fields : [{
                    name : 'text',
                    type : 'string'
                }],
                data: {
                text: 'Ext JS',
                expanded: true
                },
                onStoreLoad: function(me, records, successful, operation, eOpts){
                    if(records.length>0){
                        records[0].set('text','设备');
                    }
                },
                listeners: {
                    load: 'onStoreLoad'
                }
            },
            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    xtype: 'label',
                    text: '已选成员',
                    margin: '0 0 0 8'
                }, '->',{
                    itemId: 'closeAll',
                    tooltip: _('Collapse All'),
                    handler: function () {
                        this.up('treepanel').collapseAll();
                    },
                    iconCls: 'x-fa fa-compress',
                    disabled: false
                }]
            }],
            listeners: {
                selectionchange:'onSelectionchangea',
                beforeitemexpand:'onRightTreeBeforeItemExpand'
            }
        }]
    }
    ],
});