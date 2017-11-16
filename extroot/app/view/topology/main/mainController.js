Ext.define('Admin.view.topology.main.mainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.topoMainView',
    requires: [
        'Ext.ux.colorpick.Selector',
        'Admin.view.topology.main.topoSearchPopWin',
        'Admin.view.base.TermPanel'
    ],

    routes: {
        'topology/home/:v3': 'onTopoRouterChange',
    },

    onTopoRouterChange:function(v3){
        // console.log("L3 topo onTopoRouterChange:", v3);
        var symbolid = v3;
        var topoTree = this.lookupReference('topoTree');
        var record = topoTree.getStore().getNodeById(symbolid);
        if (record) {
        	topoTree.selectPath(record.getPath());
        }else{
        	Ext.Ajax.request({
				async: false, 
	    		url: '/topo/topo_tree/getMap_hierarchyBySymbol_id?symbol_id=' + symbolid,
				success: function(response){
					var map_hierarchy=Ext.decode(response.responseText).map_hierarchy.split(',');
					var index=map_hierarchy.length-3;
					for(var i=1;i<=index;i++){
						var parent_id=map_hierarchy[i];
		    			var parent_node = topoTree.getStore().getNodeById( parent_id );
		    			if(parent_node!=null){
		    				topoTree.expandNode(parent_node);
		    			}else{
		    				var id= map_hierarchy[i-1];
		    				var node=topoTree.getStore().getNodeById( id );
		    				Ext.Ajax.request({
		    					async: false, 
				        		url: '/topo/topo_tree/tree?symbol_id=' + id,
								success: function(response){
									var r=Ext.decode(response.responseText).children;
									for(var i=0;i<r.length;i++){
										node.appendChild(r[i]);
									}
									if(!node.lastChild.isLeaf()){
				                        node.lastChild.triggerUIUpdate();
				                    }
				                    parent_node =topoTree.getStore().getNodeById( parent_id );
					    			if(parent_node!=null){
					    				topoTree.expandNode(parent_node);
					    			}
								}
				        	});
		    			}
		    		}
				}
	    	});
        }
    },

    onMainViewRender:function() {
        // console.log("L3 topo onMainViewRender:", window.location.hash);
        var lvs = window.location.hash.split('/');
        if (lvs.length<3) {
            this.redirectTo(lvs[0] +'/'+ lvs[1] + '/0');
        }
    },

	//                  _             _ _              __                      
	//   ___ ___  _ __ | |_ _ __ ___ | | | ___ _ __   / _|_   _ _ __   ___ ___ 
	//  / __/ _ \| '_ \| __| '__/ _ \| | |/ _ \ '__| | |_| | | | '_ \ / __/ __|
	// | (_| (_) | | | | |_| | | (_) | | |  __/ |    |  _| |_| | | | | (__\__ \
	//  \___\___/|_| |_|\__|_|  \___/|_|_|\___|_|    |_|  \__,_|_| |_|\___|___/
	                                                                        

    // ===================================== Topo Tree ==========================================

    onTopoToggleSearchToolbar: function() {
        var tbar = this.lookupReference('topoSearchToolbar');
        tbar.setHidden( !tbar.hidden );
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
	},

    onTopoTreeStartSearch: function() {
    	var dev_tree = this.lookupReference('topoTree');
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
        if (nodes.length == 0) {
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
                            indexNode = rootnodes.childNodes[0];
                        }
                    } 
                }
            }
            //dev_tree.getSelectionModel().select(indexNode);
            var path=indexNode.getPath();
            dev_tree.selectPath(path);
            if (!indexNode.data.root) {
            	dev_tree.expandNode(indexNode.parentNode);
            }
        }
    },

    onTopoTreeRefresh: function() {
    	var topotree = this.lookupReference('topoTree');
    	topotree.store.proxy.extraParams = {symbol_id: 0};
    	topotree.store.reload();

    	var node = topotree.store.getNodeById(0);
    	if (node) {
    		topotree.getSelectionModel().select( node );
    	}
    },
    
    onTopoTreeSelectionChange: function( self, records, eOpts ) {
    	var me = this;
        var panel =  me.lookupReference('topoBorder');

    	if (records.length == 0) {
    		panel.down('#topo_node_moveto').setDisabled(true);
        	panel.down('#topo_node_delete').setDisabled(true);
        	panel.down('#topo_node_edit_properties').setDisabled(true);
            return;
        }
       
        var isRootNode = false;
        var ary = [];
        for (var i in records){
            ary.push(records[i].get('symbol_id'));
            
            if (records[i].get('map_parent_id') == -1 && records[i].get('tree_parent_id') == -1) {
                isRootNode = true;
            }
        }
        
        panel.down('#topo_view_top').setDisabled(isRootNode);
        panel.down('#topo_view_up').setDisabled(isRootNode);
        panel.down('#topo_node_moveto').setDisabled(isRootNode);
        panel.down('#topo_node_delete').setDisabled(isRootNode);
        panel.down('#topo_node_edit_properties').setDisabled(records.length != 1);

        var treep = me.lookupReference('topoProperties');
        treep.store.proxy.extraParams = {symbol_id: ary[0]};
        treep.store.reload();
        
        me.displayTopo(ary);
        
        //告警联动
        var topoAlarm = this.lookupReference('topoAlarm').getActiveTab();
        var topoAlarmDockedItem = topoAlarm.down('realTimeAlarmDockedItem');
        var checkLinkageBtn = topoAlarmDockedItem.lookupReference('CheckLinkage');
        if(checkLinkageBtn.checked){
        	//topoAlarm.LinkageSymbol = ary;
        	var aryjoin = ary.join(',');
            topoAlarmDockedItem.lookupController().onCeckLinkage(aryjoin);
        }
    },

    onBeforeItemExpand:function(node,optd){ 
    	// console.log('nodeExpand', node);
    	var me = this;
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
					me.selectTreeNode(r[0].symbol_id);
				}
        	});
    	}
    },

    onBeforeItemCollapse:function(node,optd){  
    	// console.log('nodeCollapse', node);
    	var symbolId=node.data.symbol_id; 
    	if(symbolId!=0&&!isNaN(symbolId)){
	    	var childcount=node.childNodes.length;
	        for(var i=0;i<childcount-1;i++){
	        	node.removeChild(node.childNodes[i]);
	        }
    	}
    },

    onTopoTreeSortAsc: function() {
        var topotree = this.lookupReference('topoTree');
        topotree.store.sort('text', 'ASC');
    },

    onTopoTreeSortDesc: function() {
        var topotree = this.lookupReference('topoTree');
        topotree.store.sort('text', 'DESC');
    },

    onTopoTreeItemContextMenu: function(self, record, item, index, e, eOpts ) {
    	// console.log('########## onTopoTreeItemContextMenu ########', record);
    	e.preventDefault();  
        e.stopEvent();

    	var me = this;
		var topotree = this.lookupReference('topoTree');
		var topopanel = this.lookupReference('topoPanel');
		var selectSize = topotree.getSelectionModel().getSelection().length;

		var isNotSubnet = !(record.data.res_type_name=='TOPO_SUBNET');
		var isRootNode = record.data.map_parent_id == -1 && record.data.tree_parent_id == -1;
        var isNotMoveTo = record.data.res_type_name == '7_Spliter';
        
        Ext.Ajax.request({
			url: 'rest/security/securityManagerCenter/getResAuthorizeOpertion',
			method: 'POST',
			params : {
				jsonObject: {res_type: record.data.res_type_name, res_id: record.data.res_id, map_hierarchy: record.data.map_hierarchy, create_user: record.data.create_user},
				funids: ['040120', '040107', '040121', '040108', '040109', '040123', '040122', '040124', '040125', '040127','040106'],
				user: APP.user
			},
			success: function(response){
				var r = Ext.decode(response.responseText);
				var result = r.result;
				if (r.error) {
					Ext.MessageBox.alert('Message', r.msg);
				}
				if (r.success) {
					var rightMenu=new Ext.menu.Menu({  
						items:[  
							{
								text: _('Enter'),
								funcid: '040120',
								disabled: !result['040120'] && isNotSubnet,
								iconCls: 'x-fa fa-sign-in',
								handler: function (){
									var currnode = topotree.store.getNodeById(record.data.symbol_id); //查找父节点
									me.enterintoSubnet(topopanel, currnode);
								}
							},
							"-",
							{
								text: _('Edit Properties'),
								funcid: '040107',
								disabled: !result['040107'],
								iconCls: 'x-fa fa-edit',
								handler: 'editNodeProperties'
							},
							{
								text: _('Edit NE IP'),
								funcid: '040121',
								disabled: !result['040121'],
								iconCls: 'x-fa fa-edit',
								handler: 'editNeIp'
							},
							{
								text: _('Move'),
								funcid: '040108',
								disabled: !result['040108'],
								iconCls: 'x-fa fa-arrows',
								handler: 'topoNodeMoveto'
							},
							{
								text: _('Delete'),
								funcid: '040109',
								disabled: !result['040109'],
								iconCls: 'x-fa fa-trash',
								// disabled: false,
								handler: 'deleteSelectedTopoObject'
							},
							{
								text: _('View Properties'),
								funcid: '040123',
								disabled: !result['040123'],
								iconCls: 'x-fa fa-file-text-o',
								// disabled: true,
								handler: 'lookupProperties'
							},
							"-",
							{
								text: _('NE synchronization'),
								funcid: '040122',
								disabled: !result['040122'],
								iconCls: 'x-fa fa-exchange',
								handler: 'onNeSynchronization'
							},
							"-",
			                {
			                    text: _('SSH'),
			                    funcid: '040124',
			                    disabled: !result['040124'],
			                    iconCls: ' icon-uniF5C3',
			                    handler: 'openSSH'
			                },
			                {
			                    text: _('Telnet'),
			                    funcid: '040125',
			                    disabled: !result['040125'],
			                    iconCls: ' icon-uniF5C3',
			                    handler: 'openTelnet'
			                },
			                "-",
			                {
				                text:_('Performance Management'),
				                funcid: '040127',
				                disabled: !result['040127'],
				                iconCls:'pictos pictos-chart2',
								menu: [
									{
										text: _('Single Configuration'),
										iconCls: 'pictos pictos-chart2',
										handler: 'onSingleConfiguration'
									}
								]
			                },
			                {
								text: _('Add Link'),
								funcid: '040106',
								disabled: !result['040106'],
								iconCls: 'x-fa fa-chain',
								handler: 'onTopoAddLink'
							}
			            ]  
			        });

					rightMenu.items.getAt(14).setVisible(false);
					if(record.data.real_res_type_name !='NE') {
						rightMenu.items.getAt(3).setVisible(false);
						rightMenu.items.getAt(7).setVisible(false);
						rightMenu.items.getAt(8).setVisible(false);
						rightMenu.items.getAt(9).setVisible(false);
			            rightMenu.items.getAt(10).setVisible(false);
			            rightMenu.items.getAt(11).setVisible(false);
			            rightMenu.items.getAt(12).setVisible(false);
			            rightMenu.items.getAt(13).setVisible(false);
			        }

			        if(record.data.res_type_name !='TOPO_SUBNET') {
						rightMenu.items.getAt(0).setVisible(false);
						rightMenu.items.getAt(1).setVisible(false);
			        }

			        if (isRootNode) {
			        	rightMenu.items.getAt(4).setVisible(false);
						rightMenu.items.getAt(5).setVisible(false);
			        }
			        if(selectSize >= 2){
			        	rightMenu.items.getAt(0).setVisible(false);
			        	rightMenu.items.getAt(1).setVisible(false);
			        	rightMenu.items.getAt(2).setVisible(false);
			        	rightMenu.items.getAt(3).setVisible(false);
						rightMenu.items.getAt(6).setVisible(false);
						rightMenu.items.getAt(7).setVisible(false);
						rightMenu.items.getAt(8).setVisible(false);
						rightMenu.items.getAt(9).setVisible(false);
			            rightMenu.items.getAt(10).setVisible(false);
			            rightMenu.items.getAt(11).setVisible(false);
			            rightMenu.items.getAt(12).setVisible(false);
			            rightMenu.items.getAt(13).setVisible(false);
			        }
			        if(selectSize == 2){
			        	rightMenu.items.getAt(14).setVisible(true);
			        }

					rightMenu.showAt(e.getXY());
					topotree.add(rightMenu);							
				}
			}
		});
    },
    // ===================================== Topo Panel ==========================================
    refreshTopoMap: function(symbolid_ary) {
    	var topopanel = this.lookupReference('topoPanel');
		topopanel.selectedNodes = symbolid_ary;
		this.redirectTo('#topology/home/' + symbolid_ary[0]);
    	topopanel.loadJson('/topo/topo_map/map?symbol_id=' + symbolid_ary[0] + '&tm=' + new Date().getTime() );
    },

    selectTreeNode: function(symbolid) {
    	var topoTree = this.lookupReference('topoTree');
        var record = topoTree.getStore().getNodeById(symbolid);
        if(record!=null){
        	var path=record.getPath();
        	topoTree.selectPath(path);
        }
    },

    lookupProperties: function() {
    	this.lookupReference('properties_checkbox').setValue(true);
    },

	onTopoTreeLoaded: function(tree, records, successful, operation, node, eOpts) {
    	var topoTree = this.lookupReference('topoTree');
		var treeStore = topoTree.getStore();

        var v = window.location.hash.split('/');
		var record = treeStore.getNodeById(v[2]);
		if (!record) {
			record = topoTree.getRootNode().firstChild;
		}
		if (record) {
			topoTree.getSelectionModel().select( [record] );
		}
	},

    onLoadcompleted: function(s) {
    	var topopanel = this.lookupReference('topoPanel');
    	/*//布局设置初始化
    	var changeLayout = this.lookupReference(Ext.util.Cookies.get("changeLayout"));
    	if(Ext.util.Cookies.get("changeLayout") != undefined && Ext.util.Cookies.get("ForceDirectedLayout") == 'false'){
    		this.onTopoNewLayout(changeLayout);
    	}
    	//选项设置初始化
    	//力向导布局
    	var forceCheckbox = this.lookupReference('enable_force_layout_checkox');
    	var fdl = Ext.util.Cookies.get("ForceDirectedLayout");
    	forceCheckbox.setValue(fdl == undefined ? false : fdl);
		var forceLinkSlider = this.lookupReference('force_directed_link_slider');
		var forceChargeSlider = this.lookupReference('force_directed_charge_slider');
		var fdll = Ext.util.Cookies.get("ForceDirectedLinkLength");
		forceLinkSlider.setValue(fdll == undefined ? 100 : fdll);
		var fdc = Ext.util.Cookies.get("ForceDirectedCharge");
		forceChargeSlider.setValue(fdc == undefined ? 150 : fdc);*/
		//节点大小
		var nodeSize = Ext.util.Cookies.get("SelectNodeSize");		
		if(nodeSize != undefined && nodeSize != 'null'){		
			this.lookupReference('node_size_veryLarge').setValue(false);
			this.lookupReference('node_size_moreLsarge').setValue(false);
			this.lookupReference('node_size_Large').setValue(false);
			this.lookupReference('node_size_Middle').setValue(false);
			this.lookupReference('node_size_small').setValue(false);
			if(nodeSize == 56){
				this.lookupReference('node_size_veryLarge').setValue(true);
			}else if(nodeSize == 48){
				this.lookupReference('node_size_moreLsarge').setValue(true);
			}else if(nodeSize == 40){
				this.lookupReference('node_size_Large').setValue(true);
			}else if(nodeSize == 32){
				this.lookupReference('node_size_Middle').setValue(true);
			}else if(nodeSize == 24){
				this.lookupReference('node_size_small').setValue(true);
			}
			this.lookupReference('topoPanel').setNodeSize(nodeSize);
		}
		//多链路显示风格
		var parallelLinkStyle = Ext.util.Cookies.get("ParallelLinkStyle");
		if(parallelLinkStyle != undefined && parallelLinkStyle != 'null'){	
			this.lookupReference('multilink_style_Line').setValue(false);
			this.lookupReference('multilink_style_Line_closed').setValue(false);
			this.lookupReference('multilink_style_curve').setValue(false);
			if(parallelLinkStyle == 0){
				this.lookupReference('multilink_style_Line').setValue(true);
			}else if(parallelLinkStyle == 1){
				this.lookupReference('multilink_style_Line_closed').setValue(true);
			}else if(parallelLinkStyle == 2){
				this.lookupReference('multilink_style_curve').setValue(true);
			}	
			topopanel.setMultiLinkStyle(parallelLinkStyle);
		}
		//平行线间隔
		var lineSpace = this.lookupReference('line_spacing_slider');
		var pls = Ext.util.Cookies.get("ParallelLineSpace");
		if(pls != undefined && pls != 'null'){
			lineSpace.setValue(pls);
			this.onChangeParallelLineSpace(lineSpace,pls);
		}
		//标签
		var showNodeLabel = Ext.util.Cookies.get("showNodeLabel") == undefined ? true : Ext.util.Cookies.get("showNodeLabel");
		this.lookupReference('show_link').setValue(Ext.util.Cookies.get("showLinkLabel") == undefined ? false : Ext.util.Cookies.get("showLinkLabel"));
		this.lookupReference('show_node').setValue(showNodeLabel);
		//锁定和解锁
		var panel = this.lookupReference('topoBorder');
		if(Ext.util.Cookies.get("TopoLockView") == 'true'){
			topopanel.view_locked = true;
			panel.down('#UnlockView').setDisabled(false);
			panel.down('#LockView').setDisabled(true);
		}else{
			topopanel.view_locked = false;
			panel.down('#UnlockView').setDisabled(true);
			panel.down('#LockView').setDisabled(false);
		}
    	this.initBackgroundInfo();
    },

    onAddSubnet: function() {
        var win = this.lookupReference('topoAddPopWindow');
        if (!win) {
            win = Ext.create('Admin.view.topology.main.topoAddPopWindow',{
				renderTo: Ext.getBody()
            });
        }
        win.show();          
    },

	onNodemousedown: function(s, node){  		
		var topoPanel = this.lookupReference('topoPanel');
		this.selectTopoTreeNodes(topoPanel, node);
	},

	onLinkmousedown: function(s, link){
		var topoPanel = this.lookupReference('topoPanel');
		link=topoPanel.link;
		this.selectTopoTreeLinks(topoPanel, link);
	},

	onBrushselected: function(s, node, link, x, y){  
		var panel = this.lookupReference('topoPanel');
		 var topoBoderPanel =  this.lookupReference('topoBorder');

		// console.log( "brushselected");
		if(panel.add_device){
			this.add_node(panel, 'ne', _('Add Device'), x, y, 'NE', 1);
			panel.add_device = false;
			return;
		}
		if (panel.add_symbol) {
			this.add_node(panel, 'symbol', _('Add Symbol'), x, y, 'TOPO_MAINVIEW_SYMBOL', 1);
			panel.add_symbol = false;
			return;
		}
		if (panel.add_subnet) {
			this.add_node(panel, 'subnet', _('Add Subnet'), x, y, 'TOPO_SUBNET', 2);
			panel.add_subnet = false;
			return;
		}
		
		var nodeids = [];
		var existSelectLink = false;
		var existSelectNode = false;
		node.each(function(d){
			if (d.selected) {
				existSelectNode = true;
			}
			nodeids.push(d.symbol_id);
		});
		link.each(function(d){
			if (d.selected) {
				existSelectLink = true;
			}
		});
		
		var tree = this.lookupReference('topoTree');
		if (existSelectNode) {
			this.selectTopoTreeNodes(panel, node);
		} else {
			tree.getSelectionModel().deselectAll();
		}
		
		if (!existSelectNode && !existSelectLink) {
			var treep = this.lookupReference('topoProperties');
			if (nodeids.length == 0) {
				treep.store.proxy.extraParams = {symbol_id: panel.json.parentnode[0].symbol_id};
			} else {
				treep.store.proxy.extraParams = {parent_symbol_id: nodeids[0]};
			}
			treep.store.reload();
			topoBoderPanel.down('#topo_node_delete').setDisabled(true);
			topoBoderPanel.down('#topo_node_edit_properties').setDisabled(true);
		}
		this.lookupReference('topoBorder').down('#topo_node_delete').setDisabled(true);
		this.lookupReference('topoBorder').down('#topo_node_edit_properties').setDisabled(true);
  	},

	onLinknodeselected: function(anode, znode){
		var panel = this.lookupReference('topoPanel');
		// console.log( "onLinknodeselected");
    	if (panel.add_link) {
			this.add_link(panel, 'link', _('Add Link'), 'TOPO_MAINVIEW_LINK_SYMBOL', anode, znode);
			panel.add_link = false;
		}
    },

	onTopocontextmenu: function(me, x, y){
        var topopanel = this.lookupReference('topoPanel');
        var anodes = topopanel.getSelectedNodes();
        Ext.Ajax.request({
			url: 'rest/security/securityManagerCenter/getResAuthorizeOpertion',
			method: 'POST',
			params : {
				jsonObject: null,
				funids: ['040103', '040104', '040105', '040106', '040112', '040116', '040119', '040126'],
				user: APP.user
			},
			success: function(response){
				var r = Ext.decode(response.responseText);
				var result = r.result;
				if (r.error) {
					Ext.MessageBox.alert('Message', r.msg);
				}
				if (r.success) {
					var rightMenu=new Ext.menu.Menu({  
			            items:[  
			            	{
								text: _('Add Device'),
								funcid: '040103',
								disabled: !result['040103'],
								iconCls: 'icon-router',
								handler: 'addDevice'
							},
							{
								text: _('Add Symbol'),
								funcid: '040104',
								disabled: !result['040104'],
								iconCls: 'icon-factory',
								handler: 'addSymbol'
							},
							{
								text: _('Add Subnet'),
								funcid: '040105',
								disabled: !result['040105'],
								iconCls: 'icon-cloud-symbol-inside-a-circle',
								handler: 'addSubnet'
							},
							{
								text: _('Add Link'),
								funcid: '040106',
								disabled: !result['040106'],
								iconCls: 'icon-circular-double-sided-repair-tool',
								handler: 'addLink'
							},
				            "-",
							{
								text: _('Search Topology'),
								funcid: '040112',
								disabled: !result['040112'],
								iconCls: 'x-fa fa-binoculars',
								//disabled: sec_disable('search_topology'),
								handler: 'search_topo'
							},
							{
				                text:_('Change Layout'),
				                funcid: '040116',
				                disabled: !result['040116'],
				                iconCls:'x-fa fa-th',
								menu: [
									{
										text: _('Array-based Layout'),
										tooltip: _('Array-based Layout'),
										iconCls: 'x-fa fa-th',
										layout_type: 'osage',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Hierarchies Layout'),
										tooltip: _('Hierarchies Layout'),
										iconCls: 'x-fa fa-sitemap',
										layout_type: 'dot',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Circular Layout'),
										tooltip: _('Circular Layout'),
										iconCls: 'icon-circle-layout',
										layout_type: 'circo',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Radial Layout'),
										tooltip: _('Radial Layout'),
										iconCls: 'x-fa fa-bullseye',
										layout_type: 'twopi',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Force-directed Layout'),
										tooltip: _('Force-directed Layout'),
										iconCls: 'icon-scheme',
										layout_type: 'fdp',
										handler: 'onTopoNewLayout',
									},
									{
										text: _('Full linked Layout'),
										tooltip: _('Effective when every nodes have links'),
										iconCls: 'icon-connected',
										layout_type: 'neato',
										handler: 'onTopoNewLayout',
									}
								]
							},
							{
								text: _('Save Layout'),
								funcid: '040119',
								disabled: !result['040119'],
								iconCls: 'x-fa fa-save',
								handler: 'onTopoSaveLayout',
							},
							{
				                text:_('Refresh'),
				                funcid: '040126',
				                disabled: !result['040126'],
				                iconCls:'x-fa fa-refresh',
								handler: function() {
									topopanel.reloadTopo();
								}
				            }
			            ]  
			        });  

					me.add(rightMenu);
					// rightMenu.render(panel.div);
					rightMenu.showAt(x, y);								
				}
			}
		});
    },

    onNodecontextmenu: function(s, node, x, y){
		// console.info("nodecontextmenu",node);
		var me = this;
		var topotree = this.lookupReference('topoTree');
		var topopanel = this.lookupReference('topoPanel');

		var isNotSubnet = !(node.res_type_name=='TOPO_SUBNET');
		var isRootNode = node.map_parent_id == -1 && node.tree_parent_id == -1;
        var isNotMoveTo = node.res_type_name == '7_Spliter';
        var anodes = topopanel.getSelectedNodes();
        Ext.Ajax.request({
			url: 'rest/security/securityManagerCenter/getResAuthorizeOpertion',
			method: 'POST',
			params : {
				jsonObject: {res_type: node.res_type_name, res_id: node.res_id, map_hierarchy: node.map_hierarchy, create_user: node.create_user},
				funids: ['040120', '040107', '040121', '040108', '040109', '040123', '040122', '040124', '040125', '040127','040106'],
				user: APP.user
			},
			success: function(response){
				        var locked_item_visible=false;
			        	var unlock_item_visible=false;
			        	for (var i = anodes.length - 1; i >= 0; i--) {
			        		//有一个锁定则显示解锁菜单
			        		if(anodes[i].is_locked==1){
			        			console.log('lock-----',anodes[i].is_locked);
			        			unlock_item_visible=true;
			        			break;

			        		}
			        	}
			        	//有一个未锁定则显示锁定菜单
			        	for (var i = anodes.length - 1; i >= 0; i--) {
			        		if(anodes[i].is_locked==0){
			        			console.log('unlock-----',anodes[i].is_locked);
			        			lock_item_visible=true;
			        			break;

			        		}
			        	}
				var r = Ext.decode(response.responseText);
				var result = r.result;
				var is_locked;
				if (anodes[0].is_locked==1) {
					is_locked=true;
				}else{
					is_locked=false;
				}
				if (r.error) {
					Ext.MessageBox.alert('Message', r.msg);
				}
				if (r.success) {
					var lock_item_visible=false;
			        	var unlock_item_visible=false;
			        	for (var i = anodes.length - 1; i >= 0; i--) {
			        		//有一个锁定则显示解锁菜单
			        		if(anodes[i].is_locked==1){
			        			console.log('lock-----',anodes[i].is_locked);
			        			unlock_item_visible=true;
			        			break;

			        		}
			        	}
			        	//有一个未锁定则显示锁定菜单
			        	for (var i = anodes.length - 1; i >= 0; i--) {
			        		if(anodes[i].is_locked==0){
			        			console.log('unlock-----',anodes[i].is_locked);
			        			lock_item_visible=true;
			        			break;

			        		}
			        	}
					var rightMenu=new Ext.menu.Menu({  
						items:[  
							// {
							// 	text: '设置节点颜色1',
							// 	iconCls: 'x-fa fa-sign-in',
							// 	handler: function (){
							// 		topopanel.setNodeColor(node.symbol_id,'#ff0000');
							// 	}
							// },
							// {
							// 	text: '设置节点颜色2',
							// 	iconCls: 'x-fa fa-sign-in',
							// 	handler: function (){
							// 		topopanel.setNodeColor(node.symbol_id,'#00ff00');
							// 	}
							// },

							{
								text: _('Enter'),
								funcid: '040120',
								disabled: !result['040120'] && isNotSubnet,
								iconCls: 'x-fa fa-sign-in',
								handler: function (){
									var currnode = topotree.store.getNodeById(node.symbol_id); //查找父节点
									me.enterintoSubnet(topopanel, currnode);
								}
							},
							"-",
							{
								text: _('Edit Properties'),
								funcid: '040107',
								disabled: !result['040107'],
								iconCls: 'x-fa fa-edit',
								handler: 'editNodeProperties'
							},
							{
								text: _('Edit NE IP'),
								funcid: '040121',
								disabled: !result['040121'],
								iconCls: 'x-fa fa-edit',
								handler: 'editNeIp'
							},
							{
								text: _('Lock Coordinate'),
								iconCls: 'x-fa fa-lock',
								hidden: !lock_item_visible,
								handler: 'lockCoordinate'
							},{
								text: _('Unlock Coordinate'),
								iconCls: 'x-fa fa-unlock',
								hidden: !unlock_item_visible,
								handler: 'unlockCoordinate'
							},
							{
								text: _('Move'),
								funcid: '040108',
								disabled: !result['040108'],
								iconCls: 'icon-maximize',
								handler: 'topoNodeMoveto'
							},
							{
								text: _('Delete'),
								funcid: '040109',
								disabled: !result['040109'],
								iconCls: 'x-fa fa-trash',
								// disabled: false,
								handler: 'deleteSelectedTopoObject'
							},
							{
								text: _('View Properties'),
								funcid: '040123',
								disabled: !result['040123'],
								iconCls: 'x-fa fa-file-text-o',
								// disabled: true,
								handler: 'lookupProperties'
							},
							"-",
							{
								text: _('NE synchronization'),
								funcid: '040122',
								disabled: !result['040122'],
								iconCls: 'x-fa fa-exchange',
								handler: 'onNeSynchronization'
							},
							"-",
			                {
			                    text: _('SSH'),
			                    funcid: '040124',
			                    disabled: !result['040124'],
			                    iconCls: 'icon-uniF5C3',
			                    handler: 'openSSH'
			                },
			                {
			                    text: _('Telnet'),
			                    funcid: '040125',
			                    disabled: !result['040125'],
			                    iconCls: 'icon-uniF5C3',
			                    handler: 'openTelnet'
			                },
			                "-",
			                {
				                text:_('Performance Management'),
				                funcid: '040127',
				                disabled: !result['040127'],
				                iconCls:'pictos pictos-chart2',
								menu: [
									{
										text: _('Single Configuration'),
										iconCls: 'pictos pictos-chart2',
										handler: 'onSingleConfiguration'
									}
								]
			                },
			                {
								text: _('Add Link'),
								funcid: '040106',
								disabled: !result['040106'],
								iconCls: 'x-fa fa-chain',
								handler: 'onTopoAddLink'
							}
			            ]  
			        });
					rightMenu.items.getAt(16).setVisible(false);
					if(node.real_res_type_name !='NE') {
						rightMenu.items.getAt(3).setVisible(false);
						rightMenu.items.getAt(9).setVisible(false);
						rightMenu.items.getAt(10).setVisible(false);
						rightMenu.items.getAt(11).setVisible(false);
			            rightMenu.items.getAt(12).setVisible(false);
			            rightMenu.items.getAt(13).setVisible(false);
			            rightMenu.items.getAt(14).setVisible(false);
			            rightMenu.items.getAt(15).setVisible(false);
			        }

			        if(node.res_type_name !='TOPO_SUBNET') {
						rightMenu.items.getAt(0).setVisible(false);
						rightMenu.items.getAt(1).setVisible(false);
			        }

			        if(anodes.length >= 2){
			        	rightMenu.items.getAt(0).setVisible(false);
			        	rightMenu.items.getAt(1).setVisible(false);
			        	rightMenu.items.getAt(2).setVisible(false);
			        	// if (!locked_item_visible) {
			        	// 	rightMenu.items.getAt(3).setVisible(false);

			        	// }
			        	// if (!unlock_item_visible) {
			        	// 	rightMenu.items.getAt(4).setVisible(false);
			        	// }
			        	
			        	
			        	rightMenu.items.getAt(8).setVisible(false);
						rightMenu.items.getAt(9).setVisible(false);
						rightMenu.items.getAt(10).setVisible(false);
						rightMenu.items.getAt(11).setVisible(false);
			            rightMenu.items.getAt(12).setVisible(false);
			            rightMenu.items.getAt(13).setVisible(false);
			            rightMenu.items.getAt(14).setVisible(false);
			            rightMenu.items.getAt(15).setVisible(false);
			        }
						// rightMenu.items.getAt(6).setVisible(false);
						// rightMenu.items.getAt(7).setVisible(false);
						// rightMenu.items.getAt(8).setVisible(false);
						// rightMenu.items.getAt(9).setVisible(false);
			   //          rightMenu.items.getAt(10).setVisible(false);
			   //          rightMenu.items.getAt(11).setVisible(false);
			   //          rightMenu.items.getAt(12).setVisible(false);
			   //          rightMenu.items.getAt(13).setVisible(false);
			   //      }
			        if(anodes.length == 2){
			        	rightMenu.items.getAt(16).setVisible(true);
			        }

					topopanel.add(rightMenu);
					rightMenu.showAt(x, y);							
				}
			}
		});
    },

	onLinkcontextmenu: function(topopanel, link, x, y){
		// console.info("linkcontextmenu",link);
		Ext.Ajax.request({
			url: 'rest/security/securityManagerCenter/getResAuthorizeOpertion',
			method: 'POST',
			params : {
				jsonObject: null,
				funids: ['040107', '040109', '040123'],
				user: APP.user
			},
			success: function(response){
				var r = Ext.decode(response.responseText);
				var result = r.result;
				if (r.error) {
					Ext.MessageBox.alert('Message', r.msg);
				}
				if (r.success) {
					var rightMenu=new Ext.menu.Menu({  
			            items:[  
							{
								text: _('Edit Properties'),
								funcid: '040107',
								disabled: !result['040107'],
								iconCls: 'x-fa fa-edit',
								handler: 'editLinkProperties'
							},
							{
								text: _('Delete'),
								funcid: '040109',
								disabled: !result['040109'],
								iconCls: 'x-fa fa-trash',
								// disabled: sec_disable('delete_node_and_link'),
								handler: 'deleteSelectedTopoObject'
							},
							{
								text: _('View Properties'),
								funcid: '040123',
								disabled: !result['040123'],
								iconCls: 'x-fa fa-file-text-o',
								// disabled: true,
								handler: 'lookupProperties'
							}
			            ]  
			        });  

					topopanel.add(rightMenu);
					rightMenu.showAt(x, y);
				}
			}
		});
    },

	onNodedblclick: function(node){
		// console.log(node);
		var isSubnet = node.res_type_name=='TOPO_SUBNET';
		if (isSubnet) {
			var topotree = this.lookupReference('topoTree');
			var panel = this.lookupReference('topoPanel');
			var currnode = topotree.store.getNodeById(node.symbol_id); //查找父节点
			this.enterintoSubnet(panel, currnode);
		} else {
			if (node.is_locked==1) {
				node.fixed = true;

			}else{
				node.fixed = false;

			}
			
		}
	},


    onToggleProperties: function(me, newValue, oldValue, eOpts) {
		var panel = this.lookupReference('topoProperties');
		panel.setVisible(newValue);
	},
	
    onToggleAlarm: function(me, newValue, oldValue, eOpts) {
		var panel = this.lookupReference('topoAlarm');
		panel.setVisible(newValue);
	},

	// ============================== topo toolbar ===============================

	onTopoGotoTopLevel: function(me, e, eOpts){
		this.selectTreeNode(0);
	},

	onTopoGotoUpLevel: function(me, e, eOpts){
		var topopanel = this.lookupReference('topoPanel');
		var symbolId = 0;
		if (topopanel.json.nodes.length == 0) {
			symbolId = topopanel.json.parentnode[0].symbol_id;
		} else {
			symbolId = topopanel.json.nodes[0].map_parent_id;
		}

		this.selectTreeNode(symbolId);
	},

	addDevice: function(){
		var topopanel = this.lookupReference('topoPanel');
		topopanel.add_device = true;
		topopanel.add_symbol = false;
		topopanel.add_subnet = false;
		topopanel.add_link = false;
	},

	addSymbol: function(){
		var topopanel = this.lookupReference('topoPanel');
		topopanel.add_device = false;
		topopanel.add_symbol = true;
		topopanel.add_subnet = false;
		topopanel.add_link = false;
	},

	addSubnet: function(){
		var topopanel = this.lookupReference('topoPanel');
		topopanel.add_device = false;
		topopanel.add_symbol = false;
		topopanel.add_subnet = true;
		topopanel.add_link = false;
	},

	addLink: function() {
		var topopanel = this.lookupReference('topoPanel');
		topopanel.add_device = false;
		topopanel.add_symbol = false;
		topopanel.add_subnet = false;
		topopanel.add_link = true;
	},

	onTopoAddDevice: function(me, e, eOpts){
		this.addDevice();
	},

	onTopoAddSymbol: function(me, e, eOpts){
		this.addSymbol();
	},

	onTopoAddSubnet: function(me, e, eOpts){
		this.addSubnet();
	},

	onTopoAddLink: function(me, e, eOpts){
		var topopanel = this.lookupReference('topoPanel');
		if (topopanel.getSelectedNodes().length == 2) {
			var selectedCount = 0;
			var anode = topopanel.getSelectedNodes()[0];
			var znode = topopanel.getSelectedNodes()[1];
			
			this.add_link(topopanel, 'link', _('Add Link'), 'TOPO_MAINVIEW_LINK_SYMBOL', anode, znode);
			topopanel.add_link = false;
			return;
		}
		this.addLink();
	},

	onTopoEdit: function(me, e, eOpts){
		var topopanel = this.lookupReference('topoPanel');
		this.topo_edit_properties(topopanel);
	},

	onTopoDelete: function(me, e, eOpts){
		this.deleteSelectedTopoObject();
	},

	onTopoLockView: function(me, e, eOpts){
        var panel = this.lookupReference('topoBorder');
		var topopanel = this.lookupReference('topoPanel');
		topopanel.view_locked = true;
		panel.down('#UnlockView').setDisabled(false);
		panel.down('#LockView').setDisabled(true);
		Ext.util.Cookies.set('TopoLockView',true);  
	},

	onTopoUnlockView: function(me, e, eOpts){
        var panel = this.lookupReference('topoBorder');
		var topopanel = this.lookupReference('topoPanel');
		topopanel.view_locked = false;
		panel.down('#UnlockView').setDisabled(true);
		panel.down('#LockView').setDisabled(false);
		Ext.util.Cookies.set('TopoLockView',false);  
	},

	onTopoSearch: function(me, e, eOpts){
		this.search_topo();
	},

	onZoomin: function(me, e, eOpts){
		// Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
		var topopanel = this.lookupReference('topoPanel');
		topopanel.zoomIn();
	},

	onZoomout: function(me, e, eOpts){
		// Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
		var topopanel = this.lookupReference('topoPanel');
		topopanel.zoomOut();
	},
	onZoomReset: function(me, e, eOpts){
		// Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
		var topopanel = this.lookupReference('topoPanel');
		topopanel.zoomReset();
	},
	onZoomFit: function(me, e, eOpts){
		// Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
		var topopanel = this.lookupReference('topoPanel');
		topopanel.zoomFit();
	},

	onNodeMoveto: function(me, e, eOpts){
		// Ext.Msg.alert(_('Information'), _('This features not finish yet!'));
		this.topoNodeMoveto();
	},

	onTopoNewLayout: function(me, e, eOpts) {
		var topopanel = this.lookupReference('topoPanel');
		this.topo_new_layout(topopanel, me.layout_type);
	},

	onToggleForceDirectedLayout: function(me, newValue, thumb, eOpts) {
		this.lookupReference('topoPanel').fixed_all(!newValue);
		//Ext.util.Cookies.set('ForceDirectedLayout',newValue);
	},

	onChangeForceDirectedLinkLength: function(slider, newValue, thumb, eOpts) {
		this.lookupReference('topoPanel').setForcelinkDistance(newValue);
		//Ext.util.Cookies.set('ForceDirectedLinkLength',newValue);
	},

	onChangeForceDirectedCharge: function(slider, newValue, thumb, eOpts) {
		this.lookupReference('topoPanel').setForceCharge(0-newValue);
		//Ext.util.Cookies.set('ForceDirectedCharge',newValue);
	},

	onOptionMenushow: function(self, menu, eOpts) {
		var topopanel = this.lookupReference('topoPanel');
		this.lookupReference('enable_force_layout_checkox').setValue(!topopanel.is_fixed_all());
		this.lookupReference('multi_link_style_menu').setDisabled(!topopanel.exist_multi_link());
		this.lookupReference('parallel_line_space_menu').setDisabled(!topopanel.exist_multi_link());
	},

	onToggleShowNodeLabel: function(self, newValue, oldValue, eOpts) {
		this.lookupReference('topoPanel').showNodeLabel(newValue);
		Ext.util.Cookies.set('showNodeLabel',newValue); 
	},

	onToggleShowLinkLabel: function(self, newValue, oldValue, eOpts) {
		this.lookupReference('topoPanel').showLinkLabel(newValue);
		Ext.util.Cookies.set('showLinkLabel',newValue); 
	},

	onTopoSelectNodeSize: function(self, newValue, oldValue, eOpts) {
		this.lookupReference('topoPanel').setNodeSize(newValue.v);
		Ext.util.Cookies.set('SelectNodeSize',newValue.v); 
	},

	onTopoSelectParallelLinkStyle: function(self, newValue, oldValue, eOpts) {
		this.lookupReference('topoPanel').setMultiLinkStyle(newValue.v2);
		Ext.util.Cookies.set('ParallelLinkStyle',newValue.v2); 
	},

	onChangeParallelLineSpace: function(slider, newValue, thumb, eOpts) {
		this.lookupReference('topoPanel').setLinkSpace(0-newValue);
		Ext.util.Cookies.set('ParallelLineSpace',newValue); 
	},

	onTopoSaveLayout: function() {
		var topo = this.lookupReference('topoPanel');
		var ary = [];
		topo.node.each( function(d) {
			ary.push({symbol_id:d.symbol_id, x:d.x, y:d.y});
		});

		var background_params = {background_type: topo.background_type, background_opacity: topo.background_opacity};
		if (topo.background_type == 'img') {
			background_params['background_img'] = topo.background_img;
			topo.initBackgroundColorTemp();
			topo.initBackgroundMapTemp();
		} else if (topo.background_type == 'color') {
			background_params['background_color'] = topo.background_color;
			topo.initBackgroundImgTemp();
			topo.initBackgroundMapTemp();
		} else {
			var mapSetting = topo.getMapSetting();
			background_params['mapEnable'] = topo.mapEnable;
			background_params['mapCenter'] = mapSetting.mapCenter;
			background_params['mapZoom'] = mapSetting.mapZoom;
			background_params['mapType'] = mapSetting.mapType;
			topo.initBackgroundImgTemp();
			topo.initBackgroundColorTemp();
		}

		Ext.create('Ext.form.Panel', {
			items: [ 
				{xtype: 'hidden', name: 'nodes',  value: JSON.stringify(ary) },
				{xtype: 'hidden', name: 'background_params',  value: JSON.stringify(background_params)},
				{xtype: 'hidden', name: 'subnetid', value: topo.json.parentnode[0].symbol_id }
			]
		}).getForm().submit({
			url: '/topo/layout/save_layout/batch',
			waitTitle : _('Please wait...'), 
			waitMsg : _('Saving layout...'),  
			failure: function(form, action) {
				Ext.Msg.alert(_('Operation Failure'), action.result.msg);
			}
		}); 
	},

	initBackgroundInfo: function() {
    	// 拓扑图背景信息呈现
        var topo = this.lookupReference('topoPanel');

        var colortbar = this.lookupReference('topoBackgroundColorBtn');
        var imgtbar = this.lookupReference('topoBackgroundImageBtn');
        var maptbar = this.lookupReference('toggleGeographyBackgroundBtn');

        var opacityslider = this.lookupReference('topoBackgroundOpacity');
        opacityslider.setValue(topo.background_opacity * 100);
        this.getViewModel().setData({background_opacity:topo.background_opacity*100});

        if (topo.background_type == 'img') {
        	imgtbar.setPressed(true);
        } else if (topo.background_type == 'color') {
        	colortbar.setPressed(true);
        } else {
        	maptbar.setPressed(true);
        }

        var adjustcheck = this.lookupReference('adjestGeoMap');
		adjustcheck.setValue(false);
		var synccheck = this.lookupReference('syncWithGeoMap');
		synccheck.setValue(false);
    },


    onTopoToggleBackgroundToolbar: function() {
        var tbar = this.lookupReference('topoBackgroundToolbar');
        tbar.setHidden( !tbar.hidden );
    },

	onChangeBackgroundSelection: function(container, button, pressed) {
		var me = this;
		var panel = this.lookupReference('topoPanel');
       	// console.log("User toggled the '" + button.reference + "' button: " + (pressed ? 'on' : 'off'));
       	var opacity = 50;
       	switch(button.reference) {
		case 'topoBackgroundImageBtn':
			if (panel.map != null) {
				var mapSetting = panel.getMapSetting();
				panel.mapCenter_temp = mapSetting.mapCenter;
				panel.mapZoom_temp = mapSetting.mapZoom;
				panel.mapType_temp = mapSetting.mapType;
				panel.destroyGeoMap();
			}

			panel.setBackgroundImage(panel.background_img_temp);
			panel.setBackgroundColor('#F3F3F3');
			panel.background_type = 'img';
			opacity = panel.background_opacity_img * 100;
			break;
		case 'topoBackgroundColorBtn':
			if (panel.map != null) {
				var mapSetting = panel.getMapSetting();
				panel.mapCenter_temp = mapSetting.mapCenter;
				panel.mapZoom_temp = mapSetting.mapZoom;
				panel.mapType_temp = mapSetting.mapType;
				panel.destroyGeoMap();
			}

			panel.setBackgroundImage('');
			panel.setBackgroundColor(panel.background_color_temp);
			panel.background_type = 'color';
			opacity = panel.background_opacity_color * 100;
			break;
		case 'toggleGeographyBackgroundBtn':
			panel.setBackgroundImage('');
			panel.setBackgroundColor('#F3F3F3');
			panel.createGeoMap_temp();
			panel.background_type = 'map';
			opacity = panel.background_opacity_map * 100;
		}

		var opacityslider = this.lookupReference('topoBackgroundOpacity');
        opacityslider.setValue(opacity);
        this.getViewModel().setData({background_opacity:opacity});
  	},

  	onLocationSelf: function() {

		var topopanel = this.lookupReference('topoPanel');

        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                topopanel.map.panTo(r.point);
                console.log('您的位置：'+r.point.lng+','+r.point.lat);
            }
            else {
                console.log('failed'+this.getStatus());
            }        
        },{enableHighAccuracy: true})

  	},

  	// for test
  	onClickConvert: function() {

		var me = this;
		var panel = me.lookupReference('topoPanel');
		var map = panel.map;

		var b = map.getBounds();
		console.log('getBounds',b);

		var ws = b.getSouthWest();
		console.log('getSouthWest',ws);

		var ne = b.getNorthEast();
		console.log('getSouthWest',ne);

		var polyline = new BMap.Polyline([ws, ne], {strokeColor:"red", strokeWeight:2, strokeOpacity:1});  
		map.addOverlay(polyline); 

		var pws = map.pointToPixel(ws);
		console.log('pointToPixel',pws);

		var pne = map.pointToPixel(ne);
		console.log('pointToPixel',pne);

  	},

	onTopoBackgroundImage: function() {
		var topopanel = this.lookupReference('topoPanel');
		Ext.create('Admin.view.topology.main.backgroundPopWin',{
			renderTo: Ext.getBody(),
			parentsubnetid: topopanel.json.parentnode[0].symbol_id,
			topopanel: topopanel
        }).show();
	},

	onTopoBackgroundColor: function() {
		var topopanel = this.lookupReference('topoPanel');

		Ext.widget('window', {
				title: _('Background Color'),
				border: false,
				layout: 'fit',
				width: 600,
				height: 350,
				resizable: false,
				modal: true,
				items : Ext.create('Ext.ux.colorpick.Selector', {
				    value     : '#993300',  // initial selected color
				    listeners: {
				        change: function (colorselector, color) {
				        	topopanel.background_color_temp = '#' + color;
				        	
				        }
				    }
				}),
				bbar:[
	                '->',
	                {
	                    text: _('Confirm'),
	                    iconCls:'x-fa fa-times',
	                    handler: function() {
	                    	topopanel.setBackgroundColor(topopanel.background_color_temp);
				            this.up('window').close();
				        }
	                },
	                {
	                    text: _('Close'),
	                    iconCls:'x-fa fa-times',
	                    handler: function() {
				            this.up('window').close();
				        }
	                }
	            ]
			}).show();
	},

	onChangeBackgroundTransparency: function(slider, newValue, thumb, eOpts) {
		var panel = this.lookupReference('topoPanel');
		if (panel.background_type == 'color') {
			panel.background_opacity_color = newValue/100;
		} else if (panel.background_type == 'img') {
			panel.background_opacity_img = newValue/100;
		} else {
			panel.background_opacity_map = newValue/100;
		}
		
        panel.setBackgroundOpacity(newValue/100);
        this.getViewModel().setData({background_opacity:newValue});

	},

	onToggleGeographyOperation: function(me, newValue, thumb, eOpts) {
		var panel = this.lookupReference('topoPanel');
		panel.enableGeoMapOperation(newValue);
	},

	onToggleSyncWithGeoMap: function(me, newValue, thumb, eOpts) {
		var panel = this.lookupReference('topoPanel');
		panel.mapSync = newValue;
	},

	onTopoRefresh: function(me, e, eOpts){
		var topopanel = this.lookupReference('topoPanel');
		topopanel.reloadTopo();
	},



	//  _       _                        _    __                      
	// (_)_ __ | |_ ___ _ __ _ __   __ _| |  / _|_   _ _ __   ___ ___ 
	// | | '_ \| __/ _ \ '__| '_ \ / _` | | | |_| | | | '_ \ / __/ __|
	// | | | | | ||  __/ |  | | | | (_| | | |  _| |_| | | | | (__\__ \
	// |_|_| |_|\__\___|_|  |_| |_|\__,_|_| |_|  \__,_|_| |_|\___|___/

			                                                               
    displayTopo: function(ids) {
    	var topo = this.lookupReference('topoPanel');
		// 若选择同一层次的拓扑节点，则不重新绘制拓扑图
		if (ids.length == 0) {
			return;
		}
		function iscontain(ids, id){
			var len= ids.length;
			for ( var i = 0; i < len; i++) {
				if(ids[i] == id)
					return true;
			}
			return false;
		}

		var samelayer = false;
		if (topo.node != null) {
			topo.node.each( function(d) {
				if (iscontain(ids, d.symbol_id)) {
					d.selected = true;
					samelayer = true;
				} else {
					if(!topo.CtrlPress) {
						d.selected = false;
					}
				} 
			});
		}

		if (samelayer || topo.CtrlPress) {
			topo.tick();
			return;
		}
		
		// 绘制拓扑图
		this.refreshTopoMap(ids);
	},

	enterintoSubnet: function(topopanel, record) {
		var topotree = this.lookupReference('topoTree');
	    
    	if (record.data.expanded) {
    		if (record.childNodes.length > 0 && record.childNodes[0].data.hasOwnProperty('symbol_id')) {
    			this.selectTreeNode(record.childNodes[0].data.symbol_id);
    		}
    	} else {
    		if (record.data.leaf && record.data.res_type_name == 'TOPO_SUBNET') {
    			topotree.getSelectionModel().deselectAll();
    			topopanel.selectedNodes = [];
	    		topopanel.loadJson('/topo/topo_map/map?symbol_id=-1&parent_symbol_id=' + record.get('symbol_id') + '&tm=' + new Date().getTime());
    		} else {
    			topotree.expandNode(record);
    		}    		
    	}
	},

	selectTopoTreeNodes: function(topopanel, node) {
        var ary = [];
		var existintree = false;
		var treenodes = [];
		var selnode = [];

		node.each(function(d){
			if (d.selected) {
				ary.push(d.symbol_id);
				selnode.push(d);
			}
		});

		var traverseTreeNodes = function (nodes, id) {
			for (var i = 0; i < nodes.length; i++) { // 从节点中取出子节点依次遍历
				if (nodes[i].data.symbol_id == id) {
					treenodes.push(nodes[i]);
					existintree = true;
					break;
				}
				var rootnode = nodes[i].childNodes;
				if (rootnode.length > 0) { // 判断子节点下是否存在子节点
					traverseTreeNodes(rootnode, id); // 如果存在子节点则递归
				}
			}
		}
		var tree = this.lookupReference('topoTree');
		var rootnodes = tree.getRootNode().childNodes; // 获取主节点
		if (ary.length > 0) {
			for (var x in ary) {
				traverseTreeNodes(rootnodes, ary[x]); // 开始递归
				if (!existintree) {
					var treep = this.lookupReference('topoProperties');
					treep.store.proxy.extraParams = {symbol_id: ary[x]};
					treep.store.reload();
				} else {
					existintree = false;
				}
			}
		}

		if (treenodes.length == 0) {
			tree.getSelectionModel().deselectAll();
		} else {
			var path=treenodes[treenodes.length-1].getPath();
			var selected=tree.getSelectionModel().getSelection();
			for(var i=0;i<selected.length;i++){
				if(treenodes[i].id!=selected[i].id){
					path=treenodes[i].getPath();
					break;
				}
			}
			tree.selectPath(path);
			tree.getSelectionModel().select(treenodes);
		}

		var aryLink = [];
		topopanel.link.each( function(d) {
			if (d.selected) {
				aryLink.push(d.link_symbol_id);
			}
		});

		var panel = this.lookupReference("topoBorder");
		panel.down('#topo_node_moveto').setDisabled(!(ary.length > 0 || aryLink.length > 0));
	    panel.down('#topo_node_delete').setDisabled(!(ary.length > 0 || aryLink.length > 0));
		panel.down('#topo_node_edit_properties').setDisabled(!(ary.length == 1 && aryLink.length == 0));
	},

	selectTopoTreeLinks: function (topopanel, link_base) {
		var aryLink = [];

		link_base.each(function(d){
			if (d.selected) {
				aryLink.push(d.link_symbol_id);
			}
		});

		if (aryLink.length > 0) {
			for (var y in aryLink) {
				var treep = this.lookupReference('topoProperties');
				treep.store.proxy.extraParams = {link_symbol_id: aryLink[y]};
				treep.store.reload();
			}
		}

		var panel = this.lookupReference('topoBorder');
		var aryNode = [];
		topopanel.node.each( function(d) {
			if (d.selected) {
				aryNode.push(d.symbol_id);
			}
		});
		if(aryLink.length>0){
			panel.down('#topo_node_delete').setDisabled(false);
		}
		if (aryLink.length == 1 && aryNode.length == 0) {
	        panel.down('#topo_node_edit_properties').setDisabled(false);
		} else {
			panel.down('#topo_node_edit_properties').setDisabled(true);
		}
		panel.down('#topo_node_delete').setDisabled(!(aryNode.length > 0 || aryLink.length > 0));
	},

	topo_new_layout: function(topo, layout_type) {
		var nodes = [];
		var links = [];
		topo.node.each( function(d) {
			nodes.push(d.symbol_id);
		});
		topo.link.each( function(d) {
			links.push({source: d.source.symbol_id, target: d.target.symbol_id});
		});

		Ext.create('Ext.form.Panel', {
			items: [ 
				{xtype: 'hidden', name: 'nodes',  value: JSON.stringify(nodes) },
				{xtype: 'hidden', name: 'links',  value: JSON.stringify(links) },
				{xtype: 'hidden', name: 'width',  value: topo.svg_width },
				{xtype: 'hidden', name: 'height', value: topo.svg_height },
				{xtype: 'hidden', name: 'type',   value: layout_type }
			]
		}).getForm().submit({
			url: '/topo/layout/new_layout',
			waitTitle : _('Please wait...'), 
			waitMsg : _('Redo layout...'),  
			success: function(form, action) {
				var r = action.result;
				topo.node.each(function(d){
					d.fixed = 1;
					d.px = r.nodes[ d.symbol_id ].x;
					d.py = r.nodes[ d.symbol_id ].y;
					d.x = r.nodes[ d.symbol_id ].x;
					d.y = r.nodes[ d.symbol_id ].y;
				});
				topo.tick();
				//Ext.util.Cookies.set('changeLayout',layout_type); 
			},
			failure: function(form, action) {
				// Ext.Msg.alert(_('Operation Failure'), _('Operation Failure'));
				console.log('auto layout failure with ' + layout_type)
			}
		}); // form
	},

	deviceFormCheck1: function(form) {
		var flag=this.deviceFormCheck2(form);
		if (!flag) {return};
		flag =this.ipFormCheck(form);
		if (!flag) {
			return;
		}
		if (form.getForm().getValues()['ne_typename'] == '') {
			Ext.MessageBox.alert(_('Tips'),	_('The value of net type is not allowed to be empty!'));
			return;
		}
		flag = this.nameRepetitionCheckForAdd(form);
		if (!flag) {return};
		flag =this.ipRepetitionCheckForAdd(form);
		if (!flag) {return};
		return true;
	},
	ipFormCheck:function(form){
		var ip=form.getForm().getValues()['ip'];
		var nodename=form.getForm().getValues()['nodename'];
			if (ip == '') {
				Ext.MessageBox.alert(_('Tips'),	_('The value of ip is not allowed to be empty!'));
				return;
			}
			var reg=/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/; 
			if(!reg .test(ip)){
				Ext.MessageBox.alert(_('Tips'),	_('请输入正确的IP地址!'));
				return;
			}

			return true;
	},

	deviceFormCheck2: function(form) {
		if (form.getForm().getValues()['nodename'] == '') {
			Ext.MessageBox.alert(_('Tips'),	_('The value of net name is not allowed to be empty!'));
			return false;
		}
		if(form.getForm().getValues()['ssh_port'] == ''){
			Ext.MessageBox.alert(_('Tips'),	_('SSH port can not be empty!'));
			return false;
		}
		if(parseInt(form.getForm().getValues()['ssh_port'])<1){
			Ext.MessageBox.alert(_('Tips'),	_('SSH port less than the minimum 1!'));
			return false;
		}
		if(parseInt(form.getForm().getValues()['ssh_port'])>65535){
			Ext.MessageBox.alert(_('Tips'),	_('SSH port greater than maximum 65535!'));
			return false;
		}
		if(form.getForm().getValues()['telnet_port'] == ''){
			Ext.MessageBox.alert(_('Tips'),	_('Telnet port can not be empty!'));
			return false;
		}
		if(parseInt(form.getForm().getValues()['telnet_port'])<1){
			Ext.MessageBox.alert(_('Tips'),	_('Telnet port less than the minimum 1!'));
			return false;
		}
		if(parseInt(form.getForm().getValues()['telnet_port'])>65535){
			Ext.MessageBox.alert(_('Tips'),	_('Telnet port greater than maximum 65535!'));
			return false;
		}
		
		return true;
	},
	symbolFormCheck: function(form) {
		if (form.getForm().getValues()['nodename'] == '') {
			Ext.MessageBox.alert(_('Tips'),	_('The value of node name is not allowed to be empty!'));
			return false;
		}
						
		if (form.getForm().getValues()['text'] == '') {
			Ext.MessageBox.alert(_('Tips'),	_('The value of topo type is not allowed to be empty!'));
			return false;
		 }
		
		return true;
	},

	nameRepetitionCheckForAdd:function(form){
		var ip=form.getForm().getValues()['ip'];
		var nodename=form.getForm().getValues()['nodename'];
		
				var IsExist=false;
				Ext.Ajax.request({
					async:false,
					method: 'post',
					url:'/topo/topo_nodeorlink_info/check_devicename_for_add',					
					params : {
						nodename:nodename
					},
					success: function(response){
						var r=Ext.decode(response.responseText);
						if(r.IsExist){
							IsExist=true;
						}
						if(IsExist){
					        Ext.MessageBox.alert(_('Tips'),	_('网元名称已存在请重新输入!'));
					      // return;
				        }
				       // return true;
					}
				});
				return !IsExist;
				
	},
	nameRepetitionCheckForEdit:function(form){
		var ip=form.getForm().getValues()['ip'];
		var nodename=form.getForm().getValues()['nodename'];
		var neid= form.getForm().getValues()['neid'];
				var IsExist=false;
				Ext.Ajax.request({
					async:false,
					method: 'post',
					url:'/topo/topo_nodeorlink_info/check_devicename_for_edit',					
					params : {
						nodename:nodename,
						neid:neid
					},
					success: function(response){
						var r=Ext.decode(response.responseText);
						if(r.IsExist){
							IsExist=true;
						}
						if(IsExist){
					        Ext.MessageBox.alert(_('Tips'),	_('网元名称已存在请重新输入!'));
					      // return;
				        }
				       // return true;
					}
				});
				return !IsExist;
				
	},
	ipRepetitionCheckForEdit:function(form){
		var ip=form.getForm().getValues()['ip'];
		var nodename=form.getForm().getValues()['nodename'];
		var neid= form.getForm().getValues()['neid'];
				var IsExist=false;
				Ext.Ajax.request({
					async:false,
					method: 'post',
					url:'/topo/topo_nodeorlink_info/check_deviceip_for_edit',					
					params : {
						ip : ip,
						neid:neid
					},
					success: function(response){
						var r=Ext.decode(response.responseText);
						if(r.IsExist){
							IsExist=true;
						}
						if(IsExist){
					       Ext.MessageBox.alert(_('Tips'),	_('网元ip已存在请重新输入!'));
				        }
					}
				});
				return !IsExist;
				
	},
	ipRepetitionCheckForAdd:function(form){
		var ip=form.getForm().getValues()['ip'];
		var nodename=form.getForm().getValues()['nodename'];
				var IsExist=false;
				Ext.Ajax.request({
					async:false,
					method: 'post',
					url:'/topo/topo_nodeorlink_info/check_deviceip_for_add',					
					params : {
						ip : ip
					},
					success: function(response){
						var r=Ext.decode(response.responseText);
						if(r.IsExist){
							IsExist=true;
						}
						if(IsExist){
					       Ext.MessageBox.alert(_('Tips'),	_('网元ip已存在请重新输入!'));
				        }
					}
				});
				return !IsExist;
				
	},


	// 设备节点属性form
	devicenode_properties_form: function(topopanel, x, y, restypename, symbolstyle) {
		var parentid = 0;
		var hierarchy = '';
		var node = null;
		if (topopanel.json.nodes.length == 0) {
			node = topopanel.json.parentnode[0];
			parentid = node.symbol_id;
			hierarchy = node.map_hierarchy + "0,";
		} else {
			node = topopanel.json.nodes[0];
			parentid = node.map_parent_id;
			hierarchy = node.map_hierarchy;
		}
		var topotree = this.lookupReference('topoTree');
		var subnet=topotree.store.getNodeById(parentid).data.subnet;
		var form = Ext.create('Ext.form.Panel', {
		    // title: '',
		    labelWidth: 50, 
		    //frame: true,
		    border:false,
		    bodyStyle: 'padding:5px 5px 0',
		    width: 400,
		    //renderTo: Ext.getBody(),
		    layout: 'column', // arrange fieldsets side by side
		    anchor: '100%',
		    items: [{
		        xtype:'fieldset',
		        title: _('Basic Properties'),
		        collapsible: true,
		        width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            fieldLabel: '*' + _('Net Name'),
		            name: 'subnet',
		            anchor: '100%',
		            readOnly:true,
		            value: subnet
		        },{
		        	fieldLabel: '*' + _('Ne Name'),
		            name: 'nodename',
		            anchor: '100%',
		            allowBlank : false,
		            value: ''
		        },{
		        	xtype:'numberfield',
		        	maxValue:65535,
		        	minValue:1,
		            hideTrigger:true,//隐藏微调按钮  
                    allowDecimals:false,//不允许输入小数  
		        	fieldLabel: '*' + _('SSH Port'),
		            name: 'ssh_port',
		            anchor: '100%',
		            allowBlank : false,
		            value: '22'
		        },{
		        	xtype:'numberfield',
		        	maxValue:65535,
		        	minValue:1,
		            hideTrigger:true,//隐藏微调按钮  
                    allowDecimals:false,//不允许输入小数  
		        	fieldLabel: '*' + _('Telnet Port'),
		            name: 'telnet_port',
		            anchor: '100%',
		            allowBlank : false,
		            value: '23'
		        },{
		        	fieldLabel: '*' + _('IP Address'),
		            name: 'ip',
		            anchor: '100%',
		            allowBlank : false,
		            regex:/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
 					regexText: _('Invalid IP Address'),
		            value: ''
		        },{
		        	fieldLabel: '*' + _('Type'),
		        	id:'ne_type',
		            name: 'ne_typename',
		            anchor: '100%',
		            allowBlank : false,
		            readOnly:true,
		            value: '',
		            listeners: {
                        change: function ( self, newValue , oldValue , eOpts ) {
                            var form = this.up('form');  
                            if ( newValue=='ExternalNode' ){
                                form.down('#mac_address').setVisible(true);
                            } else{
                                form.down('#mac_address').setVisible(false);
                            }
                        }
                    }
		        },
		        {
		        	fieldLabel: '*' + _('Mac Address'),
		        	id:'mac_address',
		            name: 'macaddress',
		            anchor: '100%',
		            hidden:true,
		            //xtype: 'hidden',
		            //readOnly:true,
		            value: '',
		            
		        },
		        {
		        	xtype:'combo',
		        	fieldLabel: '*' + _('Local/Remote'),
		            name: 'islocal',
		            anchor: '100%',
		            store:{
					    fields: ['abbr', 'name'],
					    data : [
					        {"abbr":"1", "name": _("Local")},
					        {"abbr":"0", "name": _("Remote")},
					    ]
		            },
		            editable : false,
		            value: '1',
				    queryMode: 'local',
				    displayField: 'name',
				    valueField: 'abbr'
		        },{
                    xtype: 'numberfield',
                    hideTrigger:true,
                    fieldLabel: _('Longitude'),
                    allowDecimals: true, // 是否允许小数
                    decimalPrecision: 6, // 小数位精度
                    allowNegative: true, // 是否允许负数
                    anchor: '100%',
		            allowBlank :true,
                    maxValue: 180,
                    minValue: -180,
                    name: 'longitude'
                },
                {
                    xtype: 'numberfield',
                    hideTrigger:true,
                    fieldLabel: _('Latitude'),
                    allowDecimals: true, // 是否允许小数
                    decimalPrecision: 6, // 小数位精度
                    allowNegative: true, // 是否允许负数
                    anchor: '100%',
		            allowBlank :true,
                    maxValue: 90,
                    minValue: -90,
                    name: 'latitude'
                },{
                    xtype: 'combobox',
                    fieldLabel: _('Tenant'),
                    editable:false,
                    name: 'tenant',
                    store: {
                        fields: [
                            {name: 'sec_user_id', type: 'string'},
                            {name: 'tenant', type: 'string'}
                        ],
                        proxy: {
                            type: 'ajax',
                            url: 'inventory/res_ne/select/tenant',
                            reader: {
                                type: 'json',
                                rootProperty: 'data'
                            }
                        },
                        autoLoad: true
                    },
                    // allowBlank: true,// 不允许为空
                    // forceSelection: true,//设置必须从下拉框中选择一个值
                    valueField: 'sec_user_id',
                    displayField: 'tenant'
                },{
		        	xtype: 'hidden',
		        	name: 'topo_type_id',
		        	value: ''
		        }, {
		        	xtype: 'hidden',
		        	name: 'map_parent_id',
		        	value: parentid
		        }, {
		        	xtype: 'hidden',
		        	name: 'tree_parent_id',
		        	value: parentid
		        }, {
		        	xtype: 'hidden',
		        	name: 'map_hierarchy',
		        	value: hierarchy
		        }, {
		        	xtype: 'hidden',
		        	name: 'x',
		        	value: x
		        }, {
		        	xtype: 'hidden',
		        	name: 'y',
		        	value: y
		        }, {
		        	xtype: 'hidden',
		        	name: 'restypename',
		        	value: restypename
		        }, {
		        	xtype: 'hidden',
		        	name: 'symbol_style',
		        	value: symbolstyle
		        }]
		    }]
		});
		return form;
	},

	// 子网或者符号节点属性form
	node_properties_form: function(topopanel, x, y, restypename, symbolstyle) {
		var parentid = 0;
		var hierarchy = '';
		var node = null;
		if (topopanel.json.nodes.length == 0) {
			node = topopanel.json.parentnode[0];
			parentid = node.symbol_id;
			hierarchy = node.map_hierarchy + "0,";
		} else {
			node = topopanel.json.nodes[0];
			parentid = node.map_parent_id;
			hierarchy = node.map_hierarchy;
		}
		
		var form = Ext.create('Ext.form.Panel', {
		    // title: '',
		    labelWidth: 50, 
		   // frame: false,
		    border:false,
		    bodyStyle: 'padding:5px 5px 0',
		    width: 400,
		    layout: 'column', // arrange fieldsets side by side
		    anchor: '100%',
		    items: [{
		        xtype:'fieldset',
		        title: _('Basic Properties'),
		        collapsible: true,
		        width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            fieldLabel: '*' + _('Node Name'),
		            name: 'nodename',
		            anchor: '100%',
		            maxLength: 32,
		            allowBlank : false,
		            value: ''
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Remark'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: '*' + _('Node Type'),
		            name: 'ne_typename',
		            anchor: '100%',
		            value: '',
		            editable : false,
		            allowBlank : false
		        }, {
		        	xtype: 'hidden',
		        	name: 'topo_type_id',
		        	value: ''
		        }, {
		        	xtype: 'hidden',
		        	name: 'map_parent_id',
		        	value: parentid
		        }, {
		        	xtype: 'hidden',
		        	name: 'tree_parent_id',
		        	value: parentid
		        }, {
		        	xtype: 'hidden',
		        	name: 'map_hierarchy',
		        	value: hierarchy
		        }, {
		        	xtype: 'hidden',
		        	name: 'x',
		        	value: x
		        }, {
		        	xtype: 'hidden',
		        	name: 'y',
		        	value: y
		        }, {
		        	xtype: 'hidden',
		        	name: 'restypename',
		        	value: restypename
		        }, {
		        	xtype: 'hidden',
		        	name: 'symbol_style',
		        	value: symbolstyle
		        }]
		    }]
		});
		return form;
	},

	// 节点类型或链路类型 树
	node_type_tree: function(form, type, is_logical_link = false,phyForm) {
		var store = Ext.create('Ext.data.TreeStore', {
			fields: [
				{name: 'text', type: 'string'}
			],
			proxy: {
				type: 'ajax',
				url: '/topo/topo_nodeorlink_info/node_type_tree/' + type,
				extraParams: {is_logical_link: is_logical_link},
				reader: {
					type: 'json',
					rootProperty : 'children'
				}
			},
			autoLoad: true
		});

	    var tree = Ext.create('Ext.tree.Panel', {
	        hideHeaders: true,
			rootVisible : false,
			store : store,
			//reference:'device_tree',
			lines : true,
			columnLines : true,
			// rowLines : true,
			flex : 1,
			animate : true,// 动画效果
			containerScroll : true,
			emptyText : _('Empty'),
			columns: [
				{ xtype : 'treecolumn', dataIndex: 'text', flex : 1, width:150, menuDisabled: true, sortable: false }
			],
			dockedItems : [{
				xtype : 'toolbar',
				items : [{
					itemId : 'expandAll',
					tooltip : _('Full Expand'),
					handler : function() {
						tree.expandAll();
					},
					iconCls : 'x-fa fa-expand',
					disabled : false
				}, {
					itemId : 'closeAll',
					tooltip : _('Collapse All'),
					handler : function() {
						tree.collapseAll();
					},
					iconCls : 'x-fa fa-compress',
					disabled : false
				},
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
	                handler: function(){ 	
	                	var name = tree.down('#func_ids').value;
	                	var store = tree.getStore();
                        store.proxy.url = '/topo/topo_nodeorlink_info/node_type_tree/' + type;
                        store.proxy.extraParams = {name:name,is_logical_link: is_logical_link};
                        store.reload();
	                }
	            }
				]
			}]
		});

		tree.on("selectionchange", function( self, records, eOpts ) {
	        if (records.length == 0 || records[0].data.is_leaf == 0) {
	            return;
	        }
	        if(records[0].raw.display_name == '普通链路'){
	        	if(form != undefined && phyForm != undefined){
		        	form.hide();
		        	phyForm.show();
	        	}
			}else{
				if(form != undefined && phyForm != undefined){
					form.show();
		        	phyForm.hide();
	        	}
			}
	        form.getForm().loadRecord(records[0]);
	    });

		return tree;
	},

	add_node: function(topopanel, type, wintitle, x, y, restypename, symbolstyle) {
		var This=this;
		var form;
		var treeWidth = 200;
		var winWidth = 560;
		var HiddenCheck = true;
		if(type == 'ne'){
			treeWidth = 325;
			winWidth = 700;
			HiddenCheck=false;
			form = this.devicenode_properties_form(topopanel, x, y, restypename, symbolstyle);
		}else{
			form = this.node_properties_form(topopanel, x, y, restypename, symbolstyle);
		}
		var tree = this.node_type_tree(form, type);
		var topotree = this.lookupReference('topoTree');
	    var panel = Ext.create('Ext.panel.Panel', {
	        border : false,
	        layout : 'border',
	        items : [
	            {
	                xtype: 'panel',
	                region: 'west',
	                layout: 'fit',
	                border : false,
	                width: treeWidth, 
	                minWidth: treeWidth,               
	                split: true,
	                items: tree
	            },
	            {
	                xtype: 'panel',
	                region: 'center',
	                //layout: 'fit',
	                border : false,
	                margin: '0 0 0 2',
	                bodyPadding : '2 2 2 2',
	                bodyStyle :'overflow-x:hidden;overflow-y:auto',
	                items: form	                
	            }],
	        buttons: [
	        {	
	        	text: _('check device type'),
	        	hidden:HiddenCheck,
	        	handler: function(){
	        		if(type == 'ne'){
	        			var ip = form.getForm().getValues()['ip'];
							if(ip!=''){
								Ext.create('Ext.form.Panel', {
		                            items: [ 
		                                {xtype: 'hidden', name: 'ip', value: ip}
		                            ]
		                        }).getForm().submit({
		                            url: '/topo/topo_nodeorlink_info/device_type',
		                            waitTitle : _('Please wait...'), 
		                            waitMsg : _('Please wait...'), 
		                            success: function(form,action) {

		                            	var r = Ext.util.JSON.decode(action.response.responseText);
										
										if (r.success) {
											var netype = r.netype;
											console.log(netype);
											Ext.getCmp('ne_type').setValue(netype);
		                                }else{
		                                    Ext.Msg.alert(_('With Errors'), r.msg);

		                                }

		       
		                               
		                            },
		                            failure: function(form, action) {
		                            	Ext.getCmp('ne_type').setValue("");
		                                Ext.Msg.alert(_('Tips'), action.result.msg);
		                            }
		                        });

							}else{
								Ext.MessageBox.alert(_('Tips'),	_('The value of ip is not allowed to be empty!'));
								return;
							}
						
						
					}
	        	}

	        },
			{
				text: _('Save'),

				handler: function() {
					var win = this.up('window');
					if(type == 'ne'){
						var flag = This.deviceFormCheck1(form);
						if(!flag){
							return;
						}

					}else{
						var flag = This.symbolFormCheck(form);
						if (!flag) {
							return;
						}
					}

					if (form.getForm().isValid()) {
						var url;
						if(type == 'ne'){
							url='/topo/topo_nodeorlink_info/add_device';
						}else{
							url='/topo/topo_nodeorlink_info/add_node';
						}
						form.getForm().submit({
							url :url,
							submitEmptyText : false,
							success : function(form, action) {
								// Ext.Msg.alert(_('Tips'), _('Operation Success!'));
								Ext.MessageBox.confirm(_('Confirm'), _('Continue to add?'), 
								function(btn) {
									win.close();
									if (btn == 'yes') {
										if(type == 'ne'){
											topopanel.add_device = true;
										}else if (type == 'symbol') {
											topopanel.add_symbol = true;
										} else if (type == 'subnet') {
											topopanel.add_subnet = true;
										}
									}
								});
							 
								Ext.Ajax.request({
									url: '/topo/topo_nodeorlink_info/get_lastest_topo_node',
									success: function(response){
										var r = Ext.decode(response.responseText);
										if (r.error) {
											Ext.MessageBox.alert('Message', r.msg);
										}
										if (r.success) {
											topopanel.addNode(r.nodes[0]);

											if (r.nodes[0].topo_type_id == '7_Spliter') {
												return;
											}
											
											var pnode = topotree.store.getNodeById(r.nodes[0].tree_parent_id); //查找父节点   
											if (Ext.isEmpty(pnode)) //如果没有父节点，则pnode为根节点   
											{  
												 pnode = topotree.store.getRootNode();  
											}
											pnode.appendChild(r.nodes[0]); //添加子节点
											
											var path=pnode.lastChild.getPath();
											topotree.selectPath(path);
										}
									}
								});
							},
							failure : function(form, action) {
								Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
							}
						});
					} else {
						Ext.MessageBox.alert(_('Tips'), _('Input error, correct it and resubmit!'));
					}
				}
			}, {
				text:_('Reset'),
				handler: function() {
					form.getForm().reset();
				}
			}, {
				text:_('Cancel'),
				handler: function() {
					this.up('window').close();
				}
			}]
	    });

	    var win = Ext.widget('window', {
				title: wintitle,
				border: false,
				layout: 'fit',
				width: winWidth,
				height: 460,
				resizable: false,
				modal: true,
				items : panel
			});
		win.show();
	},

	// 添加逻辑链路
	add_link: function(topopanel, type, wintitle, restypename, anode, znode) {
		var form = this.logicallink_properties_form(anode, znode, restypename);
		var phyForm = this.physicallink_properties_form(anode, znode, restypename);
		phyForm.hide();
		var tree = this.node_type_tree(form, type, anode.res_type_name != 'NE' || znode.res_type_name != 'NE', phyForm);

	    var panel = Ext.create('Ext.panel.Panel', {
	        border : false,
	        layout : 'border',
	        items : [
	            {
	                xtype: 'panel',
	                region: 'west',
	                layout: 'fit',
	                border : false,
	                width: 180, 
	                minWidth: 180,               
	                split: true,
	                items: tree
	            },
	            {
	                xtype: 'panel',
	                region: 'center',
	                // layout: 'fit',
	                border : false,
	                margin: '0 0 0 1',
	                bodyPadding : '2 2 2 2',
	                bodyStyle :'overflow-x:hidden;overflow-y:auto',
	                items: [form,phyForm]
	            }],
	        buttons: [
			{
				text: _('Save'),
				handler: function() {
					var win = this.up('window');
					var subForm;
					var linkUrl;
					if(phyForm.hidden == false){
						subForm = phyForm;
						linkUrl = 'add_phy_link';
					}else{
						subForm = form;
						linkUrl = 'add_link';
					}
					if (subForm.getForm().isValid()) {
						subForm.getForm().submit({
							url : '/topo/topo_nodeorlink_info/'+linkUrl,
							submitEmptyText : false,
							success : function(subForm, action) {
								// Ext.Msg.alert(_('Tips'), _('Operation Success!'));
								Ext.MessageBox.confirm(_('Confirm'), _('Continue to add?'), 
								function(btn) {
									win.close();
									if (btn == 'yes') {
										topopanel.add_link = true;
									}
								});
							 
								Ext.Ajax.request({
									method: 'GET',
									url: '/topo/topo_nodeorlink_info/get_lastest_topo_link',
									params : {
										symbol_id: anode.symbol_id,
										src_symbol_id: anode.symbol_id,
										dest_symbol_id: znode.symbol_id
									},
									success: function(response){
										var r = Ext.decode(response.responseText);
										if (r.error) {
											Ext.MessageBox.alert('Message', r.msg);
										}
										if (r.success) {
											if (r.links.length > 0) {
												topopanel.addLink(r.links[0]);
											}									
										}
									}
								});
							},
							failure : function(subForm, action) {
								Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
								return;
							}
						});
					} else {
						Ext.MessageBox.alert(_('Tips'), _('Input error, correct it and resubmit!'));
					}
				}
			}, {
				text:_('Reset'),
				handler: function() {
					form.getForm().reset();
				}
			}, {
				text:_('Cancel'),
				handler: function() {
					this.up('window').close();
				}
			}]
	    });

	    var win = Ext.widget('window', {
				title: wintitle,
				border: false,
				layout: 'fit',
				width: 553,
				height: 460,
				resizable: false,
				modal: true,
				items : panel
			});
		win.show();
	},

	// 逻辑链路属性form
	logicallink_properties_form: function(anode, znode, restypename) {
		var form = Ext.create('Ext.form.Panel', {
		    labelWidth: 50, 
		    // frame: true,
		    border: false,
		    bodyStyle: 'padding:5px 5px 0',
		    width: 400,
		    renderTo: Ext.getBody(),
		    layout: 'column', // arrange fieldsets side by side
		    anchor: '100%',
		    items: [{
		        xtype:'fieldset',
		        title: _('Basic Properties'),
		        collapsible: true,
		        width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            fieldLabel: '*' + _('A Node'),
		            name: 'anode',
		            anchor: '100%',
		            allowBlank: false,
		            value: anode.name,
		            editable : false
		        }, {
		            fieldLabel: '*' + _('Z Node'),
		            name: 'znode',
		            anchor: '100%',
		            allowBlank: false,
		            value: znode.name,
		            editable : false
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Link Name'),
		            name: 'linkname',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Remark'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: '*' + _('Link Type'),
		            name: 'ne_typename',
		            anchor: '100%',
		            value: _('Logical Link'),
		            editable : false,
		            allowBlank : false
		        }, {
		        	xtype: 'hidden',
		        	name: 'src_symbol_id',
		        	value: anode.symbol_id
		        	
		        }, {
		        	xtype: 'hidden',
		        	name: 'dest_symbol_id',
		        	value: znode.symbol_id
		        	
		        }, {
		        	xtype: 'hidden',
		        	name: 'topo_type_id',
		        	value: ''
		        }, {
		        	xtype: 'hidden',
		        	name: 'restypename',
		        	value: restypename
		        }, {
		        	xtype: 'hidden',
		        	name: 'src_map_hierarchy',
		        	value: anode.map_hierarchy
		        }, {
		        	xtype: 'hidden',
		        	name: 'des_map_hierarchy',
		        	value: znode.map_hierarchy
		        }]
		    }, {
		        xtype:'fieldset',
		        title: _('Link Properties'),
		        collapsible: true,
		        width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            xtype : "combo",
					fieldLabel : '*' + _('Link Direction'),
					name : 'direction',
					store: {
						fields : ['value', 'text'],
						data : [['1', _('Unidirection')],
								['2', _('Bidirection')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '2',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('Link Width'),
					name : 'width',
					store: {
						fields : ['value', 'text'],
						data : [['1', 1],
								['2', 2],
								['3', 3],
								['4', 4],
								['5', 5]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '2',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('Link Style'),
					name : 'style',
					store: {
						fields : ['value', 'text'],
						data : [['0', _('Straight Line')],
								['1', _('Short Break Line')],
								['2', _('Chain Line')],
								['3', _('Dotted Line')],
								['4', _('Wavy Line')],
								['5', _('Long Break Line')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '0',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		        	xtype : "combo",
					fieldLabel : '*' + _('Link Shape'),
					name : 'shape',
					store: {
						fields : ['value', 'text'],
						data : [['0', _('Parallel')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '0',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }]
		    }]
		});
		return form;
	},

	// 物理链路属性form
	physicallink_properties_form: function(anode, znode, restypename) {
		var form = Ext.create('Ext.form.Panel', {
		    labelWidth: 50, 
		    // frame: true,
		    border: false,
		    bodyStyle: 'padding:5px 5px 0',
		    width: 400,
		    renderTo: Ext.getBody(),
		    layout: 'column', // arrange fieldsets side by side
		    anchor: '100%',
		    items: [{
		        xtype:'fieldset',
		        title: _('Basic Properties'),
		        collapsible: true,
		        width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            fieldLabel: '&nbsp;&nbsp;' + _('Link Name'),
		            name: 'linkname',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: '*' + _('Link Type'),
		            name: 'text',
		            anchor: '100%',
		            value: _('普通链路'),
		            editable : false,
		            allowBlank : false
		        }, {
		            fieldLabel: '*' + _('源资源类型'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: '*' + _('源资源名称'),
		            name: 'anode',
		            anchor: '100%',
		            allowBlank: false,
		            value: anode.name,
		            editable : false
		        }, {
		            fieldLabel: '*' + _('源端口名称'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('Link Style'),
					name : 'style',
					store: {
						fields : ['value', 'text'],
						data : [['0', _('Straight Line')],
								['1', _('Short Break Line')],
								['2', _('Chain Line')],
								['3', _('Dotted Line')],
								['4', _('Wavy Line')],
								['5', _('Long Break Line')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '0',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		        	xtype : "combo",
					fieldLabel : '*' + _('Link Shape'),
					name : 'shape',
					store: {
						fields : ['value', 'text'],
						data : [['0', _('Parallel')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '0',
					mode : 'local',
					editable : false,
					forceSelection : true
		        },  {
		            fieldLabel: '*' + _('宿资源类型'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: '*' + _('宿资源名称'),
		            name: 'znode',
		            anchor: '100%',
		            allowBlank: false,
		            value: znode.name,
		            editable : false
		        }, {
		            fieldLabel: '*' + _('宿端口名称'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('Link Direction'),
					name : 'direction',
					store: {
						fields : ['value', 'text'],
						data : [['1', _('Unidirection')],
								['2', _('Bidirection')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '2',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		            fieldLabel: '*' + _('衰耗') + '(dB)',
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            fieldLabel: _('长度(米)'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('是否保护'),
					name : 'direction',
					store: {
						fields : ['value', 'text'],
						data : [['1', _('否')],
								['2', _('是')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '2',
					mode : 'local',
					editable : false,
					forceSelection : true
		        },{
		            xtype : "combo",
					fieldLabel : _('激活状态'),
					name : 'direction',
					store: {
						fields : ['value', 'text'],
						data : [['1', _('不支持')],
								['2', _('已激活')],
								['3', _('未激活')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : '2',
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Remark'),
		            name: 'remark',
		            anchor: '100%',
		            value: ''
		        }, {
		        	xtype: 'hidden',
		        	name: 'src_symbol_id',
		        	value: anode.symbol_id
		        	
		        }, {
		        	xtype: 'hidden',
		        	name: 'dest_symbol_id',
		        	value: znode.symbol_id
		        	
		        }, {
		        	xtype: 'hidden',
		        	name: 'topo_type_id',
		        	value: ''
		        }, {
		        	xtype: 'hidden',
		        	name: 'restypename',
		        	value: restypename
		        }, {
		        	xtype: 'hidden',
		        	name: 'src_map_hierarchy',
		        	value: anode.map_hierarchy
		        }, {
		        	xtype: 'hidden',
		        	name: 'des_map_hierarchy',
		        	value: znode.map_hierarchy
		        }]
		    }, {
		        xtype:'fieldset',
		        title: _('维护人'),
		        collapsible: true,
		        width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            fieldLabel: '维护人',
		            name: 'guardian',
		            anchor: '100%',
		            allowBlank : true,
		            value: ''
		        },{
		        	fieldLabel: '联系电话',
		            name: 'phone',
		            anchor: '100%',
		            allowBlank : true,
		            value: ''
		        },{
		        	fieldLabel: '联系地址',
		            name: 'adress',
		            anchor: '100%',
		            allowBlank : true,
		            value: ''
		        }]
		    }]
		});
		return form;
	},

	topoNodeMoveto: function() {
		var topopanel =this.lookupReference('topoPanel');
		var topotree =this.lookupReference('topoTree');
		var selectedTreeNodes = topotree.getSelection();

		for (var index = 0; index < selectedTreeNodes.length / 2 + 1; index++) {
			for (var index1 = selectedTreeNodes.length - 1; index1 > index; index1--) {
				if(selectedTreeNodes[index].data.map_parent_id != selectedTreeNodes[index1].data.map_parent_id) {
					Ext.Msg.alert(_('Tips'), _('Please select the elements of same layer to move!'));
					return;
				}
			}
		}				

		var ids = [];
		topopanel.node.each(function(d){
			if (d.selected) {
				ids.push(d.symbol_id);
			}
		});
		
		// 移动节点
		this.moveNode(topopanel, ids);
	},

	// 拓扑子网的快速查找
	topo_fast_search: function (tree) {
		var rootnodes = tree.getRootNode().childNodes; // 获取主节点
	    var name = tree.down('#func_ids').value;
	    if (name.replace(/\s/ig, '') == '') {
	        return;
	    }
	    
	    var nodes = this.searchNodes(tree, rootnodes, name);

	    var id = 0;
	    if (tree.getSelection().length > 0) {
	        id = tree.getSelection()[0].data['symbol_id'];
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
	                        indexNode = nodes[0];
	                    }
	                } 
	            }
	        }
	        tree.selectPath(indexNode.getPath());
	        // tree.getSelectionModel().select(indexNode);
	        tree.expandNode(indexNode.parentNode);
	    }
	},

	// 拓扑节点移动 目的子网window
	moveNode: function(topopanel, ids) {
		var me = this;
	    var store = Ext.create('Ext.data.TreeStore', {
    		idProperty : 'symbol_id',
		    fields : [
			    {name : 'symbol_id',type : 'int'}, 
	            {name : 'text',type : 'string'}
            ],	        
	        proxy: {
	            type: 'ajax',
	            url: '/topo/topo_nodeorlink_info/get_topo_subnet',
	            extraParams: {ids : ids.join(',')}
	        },
	        reader : {  
	            type : 'json',  
	            rootProperty : 'children'
	        } 
	    });

	    var tree = Ext.create('Ext.tree.Panel', {
	        // multiSelect : true,
	        rootVisible: false,
	        store: store,
	        lines: true,
	        containerScroll: true,
	        emptyText: _('Empty'),
	        
	        // inline buttons
	        dockedItems : [{
	            xtype : 'toolbar',
	            items : [
	            {
	                tooltip: _('Full Expand'),
	                handler: function() {
	                    tree.expandAll();
	                },
	                iconCls:'x-fa fa-expand'
	            },
	            {
	                tooltip: _('Collapse All'),
	                handler: function() {
	                    tree.collapseAll();
	                },
	                iconCls:'x-fa fa-compress'
	            },
	            '->',
	            {
	                itemId: 'func_ids',
	                xtype: 'textfield',
	                name: 'func_ids',
	                width: 120
	            },
	            {
	                tooltip:_('Fast Search'),
	                iconCls:'x-fa fa-binoculars',
	                handler : function() {
	                	me.topo_fast_search(tree);
	                }
	            }]
	        }],
			bbar: Ext.create('Ext.toolbar.Toolbar', {
				items: [
					"->",
					{
						text:_('Save'), // '确定',
						handler: function() {
							var win = this.up('window');
							var fromNode = [];
							var toNode = [];

							topopanel.node.each(function(d){
								if (d.selected){
									fromNode.push(d.symbol_id);
								}
							});

							toNode.push(tree.getSelection()[0].data.symbol_id);

							Ext.Ajax.request({
								url: '/topo/topo_nodeorlink_info/move_node',
								params : {
									fromNode: fromNode.join(','),
									toNode: toNode.join(',')
								},
								success: function(response){
									var r = Ext.decode(response.responseText);
									if (r.error) {
										Ext.MessageBox.alert('Message', r.msg);
									}
									if (r.success) {
										me.moveNodeTopoPanelChange(topopanel);
										me.moveNodeTopoTreeChange(fromNode, toNode);
										me.onTopoTreeRefresh();
									}
									win.close();
								}
							});
						}
					},
					{
						text:_('Cancel'), // '取消',
						handler: function() {
							this.up('window').close();
						}
					}]
			})
	    });

	    var win = Ext.widget('window', {
				title: _('Select Subnet'),
				border: false,
				layout: 'fit',
				width: 280,
				height: 480,
				resizable: false,
				modal: true,
				items : tree
			});
		win.show();
	},

	moveNodeTopoPanelChange:function(topopanel){
		var selectedNodes=[];
		topopanel.node.each(function(d){
			if (d.selected) {
				selectedNodes.push(d);
			}
		});
		topopanel.deleteNode(selectedNodes);
	},

	moveNodeTopoTreeChange:function(fromNode, toNode){
		var topotree =this.lookupReference('topoTree');
		var tonode=topotree.store.getNodeById(toNode);
		
		var selnode = topotree.getSelectionModel().getSelection();      
		for (var i = 0; i < selnode.length; i++) {
			if (tonode) {
				tonode.appendChild(selnode[i]);
			} else {
				selnode[i].remove();
			}
		}
		if (tonode && tonode.lastChild) {
			var path=tonode.lastChild.getPath();
			topotree.selectPath(path);
		}
	},
	lockCoordinate:function(){
		var topoPanel =this.lookupReference('topoPanel');
		var node = topoPanel.getSelectedNodes();
		var symbolids=[];
		for (var i = node.length - 1; i >= 0; i--) {
			if (node[i].is_locked==0) {
				symbolids.push(node[i].symbol_id);
			}
		}
		Ext.Ajax.request({
			method: 'POST',
			url: '/topo/topo_nodeorlink_info/update_is_lock',
			params : {
					  symbolids:symbolids,
					  is_locked:1
					},
			success: function(response) {
				var r = Ext.decode(response.responseText);
				if (r.success) {
					for (var i in node) {
						topoPanel.lockNode(node[i].symbol_id);
					}
				}else{
					// console.log('lock node fail');
				}
			}
		});
	},

	unlockCoordinate:function(){
		var topoPanel =this.lookupReference('topoPanel');
		var node = topoPanel.getSelectedNodes();
		var symbolids=[];
		for (var i = node.length - 1; i >= 0; i--) {
			if (node[i].is_locked==1) {
				symbolids.push(node[i].symbol_id);
			}
			
		}
		Ext.Ajax.request({
			method: 'POST',
			url: '/topo/topo_nodeorlink_info/update_is_lock',
			params : {
					  symbolids:symbolids,
					  is_locked:0
					},
			success: function(response) {
				var r = Ext.decode(response.responseText);
				if (r.success) {
					for (var i in node) {
						topoPanel.unlockNode(node[i].symbol_id);
					}
				}else{
					// console.log('lock node fail');
				}
			}
		});
	},


	editNeIp: function() {
		var me = this;
		var propertytree = this.lookupReference('topoProperties');
		var topopanel =this.lookupReference('topoPanel');
		var node = topopanel.getSelectedNodes();
		
		var form = Ext.create('Ext.form.Panel', {
		    // frame: true,
			bodyPadding: 10,
			defaultType: 'textfield',
			fieldDefaults: {
				labelAlign: 'left',
				labelWidth: 80,
				labelStyle: 'padding-left:5px;',
				msgTarget: 'side'
			},
		    layout: 'anchor',
			defaults: {
				anchor: '100%',
				hideEmptyLabel: false
			},

		    items: [{
	            fieldLabel: '*' + _('IP Address'),
	            name: 'ip',
	            anchor: '100%',
	            allowBlank : false,
	            regex:/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
				regexText: _('Invalid IP Address'),
	            value: node[0].symbol_name3
	        }, {
	        	xtype: 'hidden',
	        	name: 'symbol_id',
	        	value: node[0].symbol_id
		    },{
	        	xtype: 'hidden',
	        	name: 'neid',
	        	value: node[0].ne_id
		    }]
		});
		
		var win = Ext.widget('window', {
				title: _('Edit'),
				border: false,
				width: 300,
				height: 150,
				resizable: false,
				modal: true,
				bodyStyle :'overflow-x:hidden;overflow-y:auto',
				items : form,
				buttons: [{
					text: _('Save'),
					handler: function() {
						var flag = me.ipFormCheck(form);
						if (!flag) {
							return
						}else{
							flag=me.ipRepetitionCheckForEdit(form);
							if (!flag) {return}
						}
						var win = this.up('window');
						
						if (form.getForm().isValid()) {
							form.getForm().submit({
								url : '/topo/topo_nodeorlink_info/edit_neip',
								submitEmptyText : false,
								success : function(form, action) {
									// 网元属性动态刷新
									node[0].symbol_name3 = form.getValues().ip;

									propertytree.store.proxy.extraParams = {symbol_id: form.getValues().symbol_id};
									propertytree.store.reload();

									win.close();
								},
								failure : function(form, action) {
									Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
									return;
								}
							});
						} else {
							Ext.MessageBox.alert(_('Tips'), _('Input error, correct it and resubmit!'));
						}
					}
				}, {
					text:_('Reset'),
					handler: function() {
						form.getForm().reset();
					}
				}, {
					text:_('Cancel'),
					handler: function() {
						this.up('window').close();
					}
				}]
			});
		win.show();
	},

	onNeSynchronization: function() {
		var topopanel =this.lookupReference('topoPanel');
		var node = topopanel.getSelectedNodes();
		
		Ext.Ajax.request({
			method: 'POST',
			url: '/rest/resource/ne_sync/neid/' + node[0].ne_id,
			success: function(response) {
				// var r=Ext.decode(response.responseText);
			},
			failure: function(response) {
				
			}
		});
	},

	onSingleConfiguration: function() {
		// 2017.9.5与颜凯沟通此功能，颜凯反馈：需要调用他们提供的接口，接口后续再定，需待颜凯通知

	},

	// 拓扑编辑属性
	topo_edit_properties: function(topopanel) {
		var node = topopanel.getSelectedNodes();
		var link = topopanel.getSelectedLinks();

		if (node.length == 0 && link.length == 1) {
			this.editLinkProperties();
			return;
		}

		this.editNodeProperties();
	},

	//通过shh协议打开终端
    openSSH:function(source,event){
        var _self=this;

        var topopanel = _self.lookupReference('topoPanel');
        var nodes = topopanel.getSelectedNodes();

        if (nodes.length == 0 || nodes[0].real_res_type_name !="NE") {
            return;
        }

        var data={"protocol":"ssh","ip":nodes[0].symbol_name3,"nodeId":"o"+nodes[0].name.replace(/\./g,""),"nodeLable":nodes[0].name};
        var termPanel = this.lookupReference('termPanel');
        termPanel.showTermWin(data);

	},

    //通过telnet协议打开终端
    openTelnet:function(){
        var _self=this;

        var topopanel = _self.lookupReference('topoPanel');
        var nodes = topopanel.getSelectedNodes();

        if (nodes.length == 0 || nodes[0].real_res_type_name !="NE") {
            return;
        }

        var data={"protocol":"Telnet","ip":nodes[0].symbol_name3,"nodeId":"o"+nodes[0].name.replace(/\./g,""),"nodeLable":nodes[0].name};
        var termPanel = this.lookupReference('termPanel');
        termPanel.showTermWin(data);
	},

	// 拓扑节点属性编辑window
	editNodeProperties: function() {
		var me = this;
		var topopanel = this.lookupReference('topoPanel');
		var topotree = this.lookupReference('topoTree');
		var propertytree = this.lookupReference('topoProperties');

		var node = topopanel.getSelectedNodes();
		if (node.length == 0) {
			var pnode = topotree.store.getNodeById('0');
			node.push(pnode.data);
		}

		// 拓扑节点属性form
		var winWidth = 400;
		var form;
		if(node[0].real_res_type_name=='NE'){
			form = this.edit_device_properties_form(node);
		}else{
			form = this.edit_node_properties_form(node);
		}	
		
		// window
	    var win = Ext.widget('window', {
				title: _('Edit'),
				border: false,
				// layout: 'fit',
				width: winWidth,
				height: 460,
				resizable: false,
				modal: true,
				bodyStyle :'overflow-x:hidden;overflow-y:auto',
				items : form,
				buttons: [{
					text: _('Save'),
					handler: function() {
						var win = this.up('window');
					    var flag;
						console.log("type======"+node[0].real_res_type_name)
						if(node[0].real_res_type_name=='NE'){
							flag=me.deviceFormCheck2(form);
						}else{
							flag =me.symbolFormCheck(form);
						}
						if (!flag) {
							return;

						}else{
							flag = me.nameRepetitionCheckForEdit(form);
							if (!flag) {return};
						}
                      
						if (form.getForm().isValid()) {
							var url;
							if(node[0].real_res_type_name=='NE'){
								url='/topo/topo_nodeorlink_info/edit_device';
							}else{
								url='/topo/topo_nodeorlink_info/edit_node';
							}
							form.getForm().submit({
								url :url,
								submitEmptyText : false,
								success : function(form, action) {
									// 拓扑树、拓扑图动态刷新
									var selnode = topotree.getSelectionModel().getSelection(); 
									if (selnode) { 
										//'<i class="icomoon %s topo-tree-glyph-icon" style="color:%s"></i><span class="topo-tree-text">%s</span>',
										var clsString  = '<i class="icomoon '+selnode[0].data.svg_icon+'" style="color:'+selnode[0].data.svg_icon_color+
										';vertical-align:middle;font-size:20px"></i><span class="topo-tree-text">'+form.getValues()['nodename']+'</span>';		
										
										selnode[0].set('text',clsString );
										
               						}
									
									topopanel.modifyNode(form.getValues());

									propertytree.store.proxy.extraParams = {symbol_id: form.getValues().symbol_id};
									propertytree.store.reload();

									win.close();
								},
								failure : function(form, action) {
									Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
								}
							});
						} else {
							console.log("---------->");
							Ext.MessageBox.alert(_('Tips'), _('Input error, correct it and resubmit!'));
						}
					}
				}, {
					text:_('Reset'),
					handler: function() {
						form.getForm().reset();
					}
				}, {
					text:_('Cancel'),
					handler: function() {
						this.up('window').close();
					}
				}]
			});
		win.show();
	},

	//设备节点属性
	edit_device_properties_form: function(node){
		console.log('#### edit_device_properties_form ####', node);
		var symbolid = node[0].symbol_id;
		var nodename;
		var ssh_port;
		var telnet_port;
		var islocal;
		var longitude;
		var latitude;
		var tenant;
		var neid = node[0].ne_id;
		Ext.Ajax.request({
			async:false,
			url:'/topo/topo_nodeorlink_info/device_info?symbolid=' + symbolid,
			success: function(response){
				var r = Ext.decode(response.responseText);
				console.log('### device_info ###', r.node[0]);
				if(r.success){
					nodename = r.node[0].symbol_name1;
					ssh_port = r.node[0].ssh_port;
					telnet_port = r.node[0].telnet_port;
					islocal = r.node[0].islocal;
					tenant = r.node[0].tenant;
					longitude = r.node[0].longitude;
					latitude = r.node[0].latitude;

				}
			}
		});
		var form = Ext.create('Ext.form.Panel', {
			labelWidth: 50, 
			border:false,
			bodyStyle: 'padding:5px 5px 0',
			width: 396,
			layout: 'anchor',
			items: [{
				xtype:'fieldset',
				title: _('Basic Properties'),
				collapsible: true,
				defaultType: 'textfield',
				defaults: {anchor: '100%'},
				items :[{
					fieldLabel: '*' + _('Ne Name'),
					name: 'nodename',
					anchor: '100%',
					allowBlank: false,
					value: nodename
				},{
					xtype:'numberfield',
					maxValue:65535,
					minValue:1,
		            hideTrigger:true,//隐藏微调按钮  
                    allowDecimals:false,//不允许输入小数  
                    fieldLabel: '*' + _('SSH Port'),
                    name: 'ssh_port',
                    anchor: '100%',
                    allowBlank: false,
                    value: ssh_port
                },{
                	xtype:'numberfield',
                	maxValue:65535,
                	minValue:1,
                	hideTrigger:true,
                	fieldLabel: '*' + _('Telnet Port'),
                	name: 'telnet_port',
                	anchor: '100%',
                	allowBlank: false,
                	value: telnet_port
                },{
                	xtype:'combo',
                	fieldLabel: '*' + _('Local/Remote'),
                	name: 'islocal',
                	anchor: '100%',
                	store:{
                		fields: ['abbr', 'name'],
                		data : [
                		{"abbr":"1", "name": _("Local")},
                		{"abbr":"0", "name": _("Remote")},
                		]
                	},
                	editable : false,
                	value: islocal,
                	queryMode: 'local',
                	displayField: 'name',
                	valueField: 'abbr'
                }, {
                    xtype: 'numberfield',
                    hideTrigger:true,
                    fieldLabel: _('Longitude'),
                    allowDecimals: true, // 是否允许小数
                    decimalPrecision: 6, // 小数位精度
                    allowNegative: true, // 是否允许负数
                    anchor: '100%',
		            allowBlank :true,
                    maxValue: 180,
                    minValue: -180,
                    name: 'longitude',
		        	value: longitude
                },
                {
                    xtype: 'numberfield',
                    hideTrigger:true,
                    fieldLabel: _('Latitude'),
                    allowDecimals: true, // 是否允许小数
                    decimalPrecision: 6, // 小数位精度
                    allowNegative: true, // 是否允许负数
                    anchor: '100%',
		            allowBlank :true,
                    maxValue: 90,
                    minValue: -90,
                    name: 'latitude',
                    value: latitude
                },{
                    xtype: 'combobox',
                    fieldLabel: _('Tenant'),
                    editable:false,
                    name: 'tenant',
                    anchor: '100%',
                    store: {
                        fields: [
                            {name: 'sec_user_id', type: 'string'},
                            {name: 'tenant', type: 'string'}
                        ],
                        proxy: {
                            type: 'ajax',
                            url: 'inventory/res_ne/select/tenant',
                            reader: {
                                type: 'json',
                                rootProperty: 'data'
                            }
                        },
                        autoLoad: true
                    },
                    // allowBlank: true,// 不允许为空
                    // forceSelection: true,//设置必须从下拉框中选择一个值
                    valueField: 'sec_user_id',
                    displayField: 'tenant',
                    value: tenant
                },{
		        	xtype: 'hidden',
		        	name: 'symbol_id',
		        	value: symbolid
		        },{
		        	xtype:'hidden',
		        	name:'neid',
		        	value:neid
		        }]
		    }]
		});
		
		return form;
	},

	// 拓扑节点属性form
	edit_node_properties_form: function(node) {
		var form = Ext.create('Ext.form.Panel', {
		    // title: '',
		    labelWidth: 50, 
		    // frame: true,
		    border: false,
		    bodyStyle: 'padding:5px 5px 0',
		    width: 396,
		    layout: 'anchor', // arrange fieldsets side by side
		    // anchor: '100%',
		    items: [{
		        xtype:'fieldset',
		        title: _('Basic Properties'),
		        collapsible: true,
		        // width: 330,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        // layout: 'anchor',
		        items :[{
		            fieldLabel: '*' + _('Node Name'),
		            name: 'nodename',
		            anchor: '100%',
		            allowBlank : false,
		            maxLength: 32,
		            value: node[0].symbol_name1
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Remark'),
		            name: 'remark',
		            anchor: '100%',
		            value: node[0].remark
		        }, {
		            fieldLabel: '*' + _('Node Type'),
		            name: 'text',
		            anchor: '100%',
		            value: node[0].display_name,
		            editable : false,
		            allowBlank : false
		        }, {
		        	xtype: 'hidden',
		        	name: 'symbol_id',
		        	value: node[0].symbol_id
		        }]
		    }]
		});
		return form;
	},

	// 拓扑逻辑链路属性编辑window
	editLinkProperties: function() {
		var topopanel = this.lookupReference('topoPanel');
		var propertytree = this.lookupReference('topoProperties');

		var link = topopanel.getSelectedLinks();
		// 逻辑链路属性form
		var form = this.edit_link_properties_form(link[0]);

	    var win = Ext.widget('window', {
				title: _('Edit'),
				border: false,
				// layout: 'fit',
				width: 415,
				height: 460,
				resizable: false,
				modal: true,
				bodyStyle :'overflow-x:hidden;overflow-y:auto',
				items : form,
				buttons: [
				{
					text: _('Save'),
					handler: function() {
						var win = this.up('window');

						if (form.getForm().isValid()) {
							form.getForm().submit({
								url : '/topo/topo_nodeorlink_info/edit_link',
								submitEmptyText : false,
								success : function(form, action) {
									// 动态操作拓扑图
									topopanel.modifyLink(form.getValues());

									propertytree.store.proxy.extraParams = {link_symbol_id: form.getValues().link_symbol_id};
									propertytree.store.reload();
									
									win.close();
								},
								failure : function(form, action) {
									Ext.Msg.alert(_('Tips'), _('Operation Failure!'));
								}
							});
						} else {
							Ext.MessageBox.alert(_('Tips'), _('Input error, correct it and resubmit!'));
						}
					}
				}, {
					text:_('Reset'),
					handler: function() {
						form.getForm().reset();
					}
				}, {
					text:_('Cancel'),
					handler: function() {
						this.up('window').close();
					}
				}]
			});
		win.show();
	},

	// 拓扑逻辑链路属性form
	edit_link_properties_form: function(link) {
		var form = Ext.create('Ext.form.Panel', {
		    labelWidth: 50, 
		    frame: true,
		    bodyStyle: 'padding:5px 5px 0',
		    width: 395,
		    layout: 'anchor', // arrange fieldsets side by side
		    items: [{
		        xtype:'fieldset',
		        title: _('Basic Properties'),
		        collapsible: true,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        items :[{
		            fieldLabel: '*' + _('A Node'),
		            name: 'anode',
		            anchor: '100%',
		            allowBlank: false,
		            value: link.source.symbol_name1,
		            editable : false
		        }, {
		            fieldLabel: '*' + _('Z Node'),
		            name: 'znode',
		            anchor: '100%',
		            allowBlank: false,
		            value: link.target.symbol_name1,
		            editable : false
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Link Name'),
		            name: 'linkname',
		            anchor: '100%',
		            value: link.link_name1
		        }, {
		            fieldLabel: '&nbsp;&nbsp;' + _('Remark'),
		            name: 'remark',
		            anchor: '100%',
		            value: link.remark
		        }, {
		            fieldLabel: '*' + _('Link Type'),
		            name: 'text',
		            anchor: '100%',
		            value: _('Logical Link'),
		            editable : false,
		            allowBlank : false
		        }, {
		        	xtype: 'hidden',
		        	name: 'link_symbol_id',
		        	value: link.link_symbol_id
		        }]
		    }, {
		        xtype:'fieldset',
		        title: _('Link Properties'),
		        collapsible: true,
		        defaultType: 'textfield',
		        defaults: {anchor: '100%'},
		        layout: 'anchor',
		        items :[{
		            xtype : "combo",
					fieldLabel : '*' + _('Link Direction'),
					name : 'direction',
					store: {
						fields : ['value', 'text'],
						data : [['1', _('Unidirection')],
								['2', _('Bidirection')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : link.direction,
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('Link Width'),
					name : 'width',
					store: {
						fields : ['value', 'text'],
						data : [['1', 1],
								['2', 2],
								['3', 3],
								['4', 4],
								['5', 5]]
					},
					displayField : 'text',
					valueField : 'value',
					value : link.width,
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		            xtype : "combo",
					fieldLabel : '*' + _('Link Style'),
					name : 'style',
					store: {
						fields : ['value', 'text'],
						data : [['0', _('Straight Line')],
								['1', _('Short Break Line')],
								['2', _('Chain Line')],
								['3', _('Dotted Line')],
								['4', _('Wavy Line')],
								['5', _('Long Break Line')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : link.style,
					mode : 'local',
					editable : false,
					forceSelection : true
		        }, {
		        	xtype : "combo",
					fieldLabel : '*' + _('Link Shape'),
					name : 'shape',
					store: {
						fields : ['value', 'text'],
						data : [['0', _('Parallel')]]
					},
					displayField : 'text',
					valueField : 'value',
					value : link.shape,
					mode : 'local',
					editable : false,
					forceSelection : true
		        }]
		    }]
		});
		return form;
	},

	// 删除选择的节点、链路
	deleteSelectedTopoObject: function() {
		var topopanel = this.lookupReference('topoPanel');
		var topotree = this.lookupReference('topoTree');
		var topoBorder=this.lookupReference('topoBorder')
		var deviceids=[];
		var nodeids = [];
		var linkids = [];
		var selectedNodes = [];
		var selectedLinks = [];

		topopanel.node.each(function(d){
			if (d.selected) {
				if(d.real_res_type_name =='NE'){
					deviceids.push(d.symbol_id);
				}else{
					nodeids.push(d.symbol_id);
				}
				selectedNodes.push(d);
			}
		});

		topopanel.link.each(function(d) {
			if (d.selected) {
				linkids.push(d.link_symbol_id);
				selectedLinks.push(d);
			}
		});
		if (nodeids.length == 0 && linkids.length == 0 && deviceids.length==0) {
			Ext.Msg.alert(_('Tips'), _('Please select the nodes and links to be deleted!'));
			return;
		}

		Ext.MessageBox.confirm(_('Confirm'), _('Are you sure to delete?'), // Are you sure to delete?
			function(btn) {
				if (btn == 'yes') {
					Ext.Ajax.request({
						//需要修改后台
						url: '/topo/topo_nodeorlink_info/delete_select_topoinfo',
						params : {
							deviceids:deviceids.join(','),
							nodeids: nodeids.join(','),
							linkids: linkids.join(',')
						},
						success: function(response){
							// Ext.Msg.alert(_('Tips'), _('Operation Success!'));
							var respText = Ext.util.JSON.decode(response.responseText); 
							var flag = respText.success;
							var msg = respText.msg;

                            if (flag) {
                            	var r = Ext.decode(response.responseText);
							if (selectedLinks.length > 0) {
								topopanel.deleteLink(selectedLinks);
								topoBorder.down('#topo_node_delete').setDisabled(true);
								topoBorder.down('#topo_node_edit_properties').setDisabled(true);
							}

							if (selectedNodes.length > 0) {
								if (selectedNodes[0].topo_type_id != '7_Spliter') {
									var selnode = topotree.getSelectionModel().getSelection();      
									if(selnode && selnode.length > 0) {       
										for (var i = 0; i < selnode.length; i++) {
											selnode[i].remove();
										}
									}
								}
								
								topopanel.deleteNode(selectedNodes);
							}

                            }else{
                            	Ext.Msg.alert(_('Tips'), _(msg));
                            }
							
						},
						failure: function() {
							Ext.Msg.alert(_('Tips'), _(msg));
						}
					});
				}
			}
		);
	},

	// 拓扑搜索功能
	search_topo: function() {
		var devicetree = this.lookupReference('topoTree');
		var topopanel = this.lookupReference('topoPanel');

		Ext.create('Admin.view.topology.main.topoSearchPopWin', {
			renderTo: Ext.getBody(),
			topopanel: topopanel,
			devicetree: devicetree
        }).show();
	}

	// 添加设备树快速搜索功能
});
