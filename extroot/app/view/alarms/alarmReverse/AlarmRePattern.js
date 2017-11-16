Ext.define('Admin.view.alarms.alarmReverse.AlarmRePattern', {
    extend: 'Ext.grid.Panel',
    extend: 'Ext.container.Container',
    xtype: 'AlarmRePattern',

    requires: [
        'Ext.selection.CellModel',
        'Ext.grid.plugin.CellEditing',
        'Admin.view.topology.main.subnetTreeView'
    ],

    // 指定panel边缘的阴影效果
    cls: 'shadow',
    viewModel: {
        stores: {
            // 远程store
            userlist_remote: {
                autoLoad: true,
                // 每页显示记录数
                pageSize: 15,
                proxy: {
                    type: 'ajax',
                    url: '/alarm/AlarmReverse/getReverseNe',
					          extraParams: {condition: '15'},
					          actionMethods : {  
					              create : 'POST',
					              read   : 'POST',
					              update : 'POST',
					              destroy: 'POST' // Store设置请求的方法，与Ajax请求有区别  
					          },  
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'resultSize'
                    }
                }

            },
            neSupportRevStore:{
                fields : ['value', 'text'],
                data : [['1', _('Support')],
                    ['0', _('No Support')]]
            },
            neOnLineStore:{
                fields : ['value', 'text'],
                data : [['1', _('Online')],
                    ['0', _('Offline')]]
            },
            revPatStore:{
                fields : ['value', 'text'],
                data : [['1', _('None Return')],
                    ['2', _('Manual Return')],
                    ['3', _('Auto Return')]]
            }
        }
    },

    controller: {  
        onQuery: function(){
			    var alarmGrid = this.lookupReference('neRevPatGrid');	
			    var	form =this.lookupReference('neQueryForm');
                alarmGrid.getStore().proxy.url='alarm/AlarmReverse/queryReverseNe';
                alarmGrid.getStore().proxy.extraParams = form.getForm().getValues();
			    alarmGrid.getStore().reload();  	
        },

        isShow:function(obj,ischecked){
             if(ischecked){
               this.lookupReference('neQueryForm').setVisible(true); 
                 }else{
               this.lookupReference('neQueryForm').setVisible(false);
                }
        },

        onRowcontextmenu: function( me, record, item, index, e, eOpts ) {
            var controller = this;
            var neRevPatGrid = this.lookupReference('neRevPatGrid');
            var selections = neRevPatGrid.getSelection();
            e.preventDefault();  
            e.stopEvent();
            
            if (index < 0) {
                return;
            }

            var menu = new Ext.menu.Menu();
            menu.add({
                text: _("Return Pattern"),
                itemId: 'rePatternItem',
                disabled: true,
                menu: {
                        items: [{
                            name: 'exportAll',
                            text: _("None Return"),
                            handler: function(){
                                controller.setComboValue(selections,'1');
                            }
                        },
                        {
                            name: 'exportCurrent',
                            text: _("Manual Return"),
                            handler: function(){
                                controller.setComboValue(selections,'2');
                            }
                        },
                        {
                            name: 'exportSelect',
                            text: _("Auto Return"),
                            handler: function(){
                                controller.setComboValue(selections,'3');
                            }
                        },
                        ]

                    }
            }, 
            {
                text: _("Original Set"),
                handler: function(){
                    controller.onRefresh();
                }
            });
            for(var i in selections){
                if(selections[i].getData().is_support_reverse==1&&selections[i].getData().resourceState==1){
                    menu.getComponent('rePatternItem').setDisabled(false);
                }
            }
            menu.showAt(e.getPoint());
        },

        setComboValue: function(selections,value) {
            for(var i in selections){
                if(selections[i].getData().is_support_reverse==1){
                    selections[i].set('reverse_pattern',value);
                }
            }
        },

        onApply: function() {
            var grid = this.lookupReference('neRevPatGrid');
            var gridStore = grid.getStore();
            var modifiedRecords = gridStore.getModifiedRecords();
            var obj = new Object();
            var arrayIRCNETNODEID = new Array();
            var arrayREVERSE_PATTERN = new Array();
            for(var i in modifiedRecords){
                arrayIRCNETNODEID.push(modifiedRecords[i].getData().neid);
                arrayREVERSE_PATTERN.push(modifiedRecords[i].getData().reverse_pattern);
            }
            obj = Ext.apply(obj, {'neid': arrayIRCNETNODEID}, {'reverse_pattern': arrayREVERSE_PATTERN});
            grid.getStore().proxy.url='alarm/AlarmReverse/setRevPattern';
            grid.getStore().proxy.extraParams = obj;
            grid.getStore().reload(); 
        },

        onReset: function() {
            this.lookupReference('neQueryForm').getForm().reset();
        },
        
        resourceTree: function() {
            var resourceTreeWin = this.createTreeWin();
            resourceTreeWin.show();
        },
        createTreeWin: function() {
            var resourceTree = this.showResourceTree();
            var subnetname = this.lookupReference('subnetname');
            var subnetSYMBOL_ID = this.lookupReference('subnetSYMBOL_ID');
            var resourceTreeWin = Ext.create("Ext.window.Window", {
                scrollable: true,
                title: _('NE Name'),
                closable: true,
                autowidth: true,
                autoheight: true,
                border: false,
                layout: 'auto',
                bodyStyle: "padding:20px;",
                items: resourceTree,
                closeAction: 'hide',
                width: 330,
                height: 450,
                maximizable: true,
                minimizable: true,
                buttons: [{
                    xtype: "button",
                    text: _('Confirm'),
                    handler: function() {
                        // var treewindow = this.up('window');
                        var treepanel = resourceTree.down('treepanel');
                        var selData = treepanel.getSelection()[0];
                        if(selData!=null){
                            subnetname.setValue(selData.get('text'));
                            subnetSYMBOL_ID.setValue(selData.get('symbol_id'));
                        }                        
                        resourceTreeWin.close();
                    }
                },
                {
                    xtype: "button",
                    text: _('Cancle'),
                    handler: function() {                        
                        resourceTreeWin.close();
                    }
                }]
            });

            return resourceTreeWin;
        },

        showResourceTree: function() {
            var subnetTree = Ext.create('Admin.view.topology.main.subnetTreeView');
            var treepanel = subnetTree.down('treepanel');
            treepanel.un({
                selectionchange: 'onSubnetTreeSelectionChange'
            });
            var dockedItems = treepanel.getDockedItems();
            var toolbar = treepanel.getDockedItems('toolbar[dock="top"]');
            treepanel.removeDocked(toolbar[0]);
            var searchToolbar = this.getSearchToolbar(treepanel);
            treepanel.addDocked(this.getTopToolbar(searchToolbar,treepanel));
            treepanel.addDocked(searchToolbar);
            return subnetTree;
        },

        getTopToolbar: function(searchToolbar,treepanel) {
            mainController = this;
            toolbar = new Ext.toolbar.Toolbar({
                renderTo: document.body,
                controller: {
                    onTopoToggleSearchToolbar: function() {
                        searchToolbar.setHidden(!searchToolbar.hidden);
                    },
                    onTopoTreeRefresh: function() {
                        treepanel.store.reload();
                    },
                },
                items: [
                {
                    tooltip:_('Fast Search'),
                    iconCls:'x-fa fa-binoculars',
                    handler : 'onTopoToggleSearchToolbar',
                },
                // {
                //     tooltip: _('Full Expand'),
                //     // iconCls:'toggle_plus',
                //     iconCls:'x-fa fa-expand',
                //     handler: 'onTopoTreeExpandAll'
                // },
                // {
                //     tooltip: _('Collapse All'),
                //     // iconCls:'toggle_minus',
                //     iconCls:'x-fa fa-compress',
                //     handler: 'onTopoTreeCollapseAll'
                // },
                '->',
                {
                    tooltip: _('Refresh'),
                    iconCls:'x-fa fa-refresh',
                    handler: 'onTopoTreeRefresh'
                }]
            });
            return toolbar;
        },

        getSearchToolbar: function(treepanel) {
            toolbar = new Ext.toolbar.Toolbar({
                hidden: true,
                controller: {
                    onTopoTreeStartSearch: function() {
                    var dev_tree = treepanel;
                    console.log(dev_tree);
                    var rootnodes = dev_tree.getRootNode(); // 获取主节点

                    var name = dev_tree.down('#func_ids').value;
                    if (name.replace(/\s/ig, '') == '') {
                        return;
                    }
                    var nodes = this.searchNodes(dev_tree, rootnodes.childNodes, name);
                    if (rootnodes.get('text').indexOf(name) > -1) {
                        nodes.push(rootnodes);
                    }
                    var id = 0;
                    if (dev_tree.getSelection().length > 0) {
                        id = dev_tree.getSelection()[0].data['symbol_id'];
                    }
                     var exist = false;
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i].get('symbol_id') == id) {
                            exist = true;
                            break;
                        }
                    }
                    if (!exist) {
                        id = 0;
                    }
                    if (nodes.length==0) {
                        Ext.MessageBox.alert(_('Tips'), _('No matching results, please modify the search condition and search again!'));
                    return;
                    } else {
                        var indexNode = null;
                        if (id == 0) {
                        indexNode = nodes[0];
                    } else {
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].get('symbol_id') == id) {
                                if (i + 1 < nodes.length) {
                                    indexNode = nodes[i + 1];
                                    break;
                            } else {
                                Ext.MessageBox.alert(_('Tips'), _('Search is finished!'));
                                indexNode = rootnodes;
                            }
                        } 
                    }
                }
                dev_tree.getSelectionModel().select(indexNode);
                if (!indexNode.data.root) {
                    dev_tree.expandNode(indexNode.parentNode);
                }
            }

            },
        searchNodes: function(tree, node, name) {
            var nodes=[];
            for (var i = 0; i < node.length; i++) { // 从节点中取出子节点依次遍历
                if (node[i].get('text').indexOf(name) > -1) {
                    nodes.push(node[i]);
                }
                var rootnode = node[i].childNodes;
                if (rootnode.length > 0) { // 判断子节点下是否存在子节点
                    nodes = nodes.concat( this.searchNodes(tree, rootnode, name) ); // 如果存在子节点则递归
                }
            }
            return nodes;
        }
                },
                items: [
                {
                    itemId: 'func_ids',
                    xtype: 'textfield',
                    name: 'func_ids',
                    flex: 1
                },
                {
                    tooltip:_('Start Searching'),
                    // iconCls:'topo_search_button',
                    iconCls: 'x-fa fa-binoculars',
                    handler: 'onTopoTreeStartSearch',
                }]
            });
            return toolbar;
        },
        onRefresh: function() {
                var alarmGrid = this.lookupReference('neRevPatGrid');   
                alarmGrid.getStore().reload();  
        }
    },

    items: [
	    { 
        title:_('Query Return Pattern'),
        xtype: 'form',
        reference: 'neQueryForm',
        region:'north',
        iconCls: 'x-fa fa-circle-o',
        //border : false,
        autoWidth : true,
        //autoHeight : true,
        height : 180,
        frame : false,
        autoScroll : true,
        bodyPadding : 20,
        layout:{type:'table',columns:4},

        //visible:false,
        labelAlign : 'right',
        defaultType : 'textfield',
        fieldDefaults : {
            width : 250,
            labelWidth : 90,
            labelAlign : "right",
            margin : 5,
        },
        items : [{          
                            xtype : 'textfield',
                            fieldLabel : _('Ne Name'),
                            name : 'n.userlabel'
                        },{          
                            xtype : 'textfield',
                            fieldLabel : _('IP Address'),
                            name : 'n.ipaddress'
                        },{          
                            xtype : 'textfield',
                            fieldLabel : _('Device Type'),
                            name : 't.userlabel'
                        },{
                            xtype : "combo",
                            fieldLabel :_('Software Support Return'),
                            name : 'n.is_support_reverse',
                            bind: {
                                store: '{neSupportRevStore}'
                            },
                            displayField : 'text',
                            valueField : 'value',
                            value : '',
                            //mode : 'local',
                            width : 300,
                            //margin : '5 50 5 5',
                            labelWidth : 140,
                            editable : false
                        },{
                            xtype : "combo",
                            fieldLabel :_('Return Pattern'),
                            name : 'n.reverse_pattern',
                            bind: {
                                store: '{revPatStore}'
                            },
                            displayField : 'text',
                            valueField : 'value',
                            value : '',
                            //mode : 'local',
                            editable : false
                        },{
                            xtype : "combo",
                            fieldLabel :_('Online Status'),
                            name : 'n.resourceState',
                            bind: {
                                store: '{neOnLineStore}'
                            },
                            displayField : 'text',
                            valueField : 'value',
                            value : '',
                            //mode : 'local',
                            editable : false
                        },{
                            xtype : 'container',
                            layout : 'column',
                            width : 250,
                            items : [{
                                        xtype : 'textfield',
                                        fieldLabel :_('Subnet'),
                                        reference: 'subnetname',
                                        columnWidth : .92,
                                        editable : false,
                                        name : 'showingTextfield',
                                        emptyText: _('Network Topology')
                                    },{
                                        xtype : 'textfield',
                                        hidden: true,
                                        reference: 'subnetSYMBOL_ID',
                                        columnWidth : .0,
                                        editable : false,
                                        name : 'tsy.map_hierarchy'
                                    },{
                                        xtype: 'button',
                                        // tooltip : '资源树',
                                        columnWidth : .08,
                                        //style :'margin-top:2px;',
                                        iconCls:'search_reset_bnt',
                                        margin : '5 0 5 0',
                                        handler: 'resourceTree'
                                    }]
                        }]
        
    },
	{
        // title: '网元反转模式',
        header: false,
        xtype: 'PagedGrid',
        multiSelect: true,
        iconCls: 'x-fa fa-circle-o',
        reference: 'neRevPatGrid',
        autoScroll : true,
        // 绑定到viewModel的属性
        bind: {
            store: '{userlist_remote}'
        },
        // selModel: {
        // type: 'cellmodel',
        // selType: 'checkboxmodel'
        // },
        // plugins: {
        // ptype: 'cellediting',
        // clicksToEdit: 1
        // },
        // grid显示字段
        columns: [
                {   xtype: 'rownumberer', width: 60, sortable: true, align: 'center' },
                {
                    text : _('Ne Name'),
                    dataIndex : 'userlabel_n',
                    width : 140,
                    align: 'center',
                    menuDisabled : false
                },{
                    text : _('IP Address'),
                    dataIndex : 'ipaddress',
                    width : 140,
                    align: 'center',
                    menuDisabled : true
                },{
                    text : _('Device Type'),
                    dataIndex : 'userlabel_t',
                    width : 140,
                    align: 'center',
                    menuDisabled : true
                },{
                    xtype: 'widgetcolumn',
                    text : _('Return Pattern'),
                    dataIndex : 'reverse_pattern',
                    width : 140,
                    align: 'center',
                    menuDisabled : true,
                    widget: {
                        xtype: 'combo',
                        bind: {
                                store: '{revPatStore}',
                                disabled: '{record.is_support_reverse==0||record.resourceState==0}'
                            },
                        displayField : 'text',
                        valueField : 'value'
                    }
                },{
                    text : _('Online Status'),
                    dataIndex : 'resourceState',
                    width : 140,
                    align: 'center',
                    menuDisabled : true,
                    renderer: function getRevPatName(v,m,r){

                        if (v == 1) {
                            m.tdCls = 'alarm_bk_4';
                            return  _('Online');
                        }
                        if (v == 0) {
                            m.tdCls = 'alarm_bk_5';
                            return  _('Offline');
                        }
                        return v;
                    }
                },{
                    text : _('Software Support Return'),
                    dataIndex : 'is_support_reverse',
                    width : 200,
                    align: 'center',
                    menuDisabled : true,
                    renderer: function getRevPatName(v,m,r){

                        if (v == 1) {
                            //m.tdCls = 'alarm_bk_'+ '4';
                            return  _('Support');
                        }
                        if (v == 0) {
                            m.tdCls = 'alarm_bk_1';
                            return  _('No Support');
                        }
                        return v;
                    },
                    flex:1
                }
                ],
        // 分页工具条位置
        //pagingbarDock: 'bottom',
        pagingbarDock: 'top',
        // 默认每页记录数
        pagingbarDefaultValue: 15,
        // 分页策略
        pagingbarConfig: {
            fields: [{name: 'val', type: 'int'}],
            data: [
                {val: 15},
                {val: 30},
                {val: 60},
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
                    xtype:'checkbox',
                    boxLabel:_('Show Query'),  
                    tooltip:_('Show Query'), 
                    checked: true,                      
                    handler:'isShow'
                },{
                    text: _('Query'),
                    iconCls:'x-fa fa-search',
                    handler: 'onQuery',
                    style: {
                        backgroundColor: '#CCFFFF'
                    }
                },{
                    text: _('Reset'),
                    iconCls:'x-fa fa-edit',
                    handler: 'onReset',
                    style: {
                        backgroundColor: '#CCFFFF'
                    }      
                },'|',
                '->',{  
                    text: _('Synchronization'),
                    iconCls:'x-fa fa-exchange',
                    //handler: 'onQuery'
                },{
                    text: _('Apply'),
                    iconCls:'x-fa fa-wrench',
                    handler: 'onApply'
                },{
                    text: _('Default Set'),
                    iconCls:'x-fa fa-eraser',
                    handler: 'onRefresh'
                }
            ]
        }],

        listeners:{
            rowcontextmenu: 'onRowcontextmenu'
        }

    }
]

});



    
    
    
     
    
    
     
